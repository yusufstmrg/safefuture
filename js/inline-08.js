
(function(){
  function q(id){ return document.getElementById(id); }

  function getCurrentDiagnosis(){
    return window.sfLastDiagnosis || window.currentFHCResult || window.fhcResult || window.lastFHCResult || null;
  }

  function findResultContainer(){
    return q('fhcResultContainer') || q('fhcResults') || q('fhcResult') || q('fhc-results');
  }

  async function ensureAnonymousSession(){
    // Lead capture does not require an anonymous Supabase Auth user.
    return null;
  }

  function normalizeWa(v){
    let x = String(v||'').replace(/[^\d+]/g,'');
    if(x.startsWith('+62')) return x;
    if(x.startsWith('62')) return '+'+x;
    if(x.startsWith('0')) return '+62'+x.slice(1);
    return x;
  }

  function buildDiagnosisSummary(){
    const d = getCurrentDiagnosis();
    if(!d) return {};
    const pick = (o, keys) => {
      for(const k of keys){ if(o && o[k] !== undefined && o[k] !== null) return o[k]; }
      return null;
    };
    return {
      assessment: 'FHC',
      score: pick(d,['score','overallScore','fhcScore']),
      cashflow: pick(d,['cashFlowScore','cashflowScore']),
      emergency: pick(d,['emergencyScore','emergencyFundScore']),
      debt: pick(d,['debtScore']),
      protection: pick(d,['protectionScore','lifeProtectionScore']),
      criticalIllness: pick(d,['criticalIllnessScore']),
      retirement: pick(d,['retirementScore']),
      asset: pick(d,['assetScore']),
      goals: pick(d,['goalsScore','goalScore']),
      protectionGap: pick(d,['protectionGap','lifeProtectionGap']),
      criticalIllnessGap: pick(d,['criticalIllnessGap','ciGap']),
      retirementGap: pick(d,['retirementGap','retGap'])
    };
  }

  async function saveLeadToCloud(lead){
    try{
      if(typeof window.saveLead === 'function') return await window.saveLead(lead);
      return {ok:false,reason:'lead_pipeline_unavailable'};
    }catch(e){
      console.warn('FHC/lead cloud save:',e);
      return {ok:false,error:e};
    }
  }

  function saveLeadLocally(lead){
    try{
      const leads = JSON.parse(localStorage.getItem('sf_leads')||'[]');
      leads.push(lead);
      localStorage.setItem('sf_leads',JSON.stringify(leads));
    }catch(e){ console.warn(e); }
  }

  // Expose a reliable bridge for the existing FHC submission function.
  // The wrapper captures the current form/diagnosis AFTER the original
  // calculation has run, without replacing the calculation engine.
  const candidateNames = ['submitFHC','calculateFHC','finishFHC','submitFinancialHealthCheck','processFHC'];
  const original = {};
  candidateNames.forEach(name=>{
    if(typeof window[name]==='function') original[name]=window[name];
  });

  async function afterFhcCompleted(){
    try{
      const d = getCurrentDiagnosis();
      // If the original code already stored the lead in cloud, do not duplicate.
      if(!d) return;
      window.sfLastDiagnosis=d;

      // Add AI CTA if not already present.
      if(!document.getElementById('sfResultAiCta')){
        const container=findResultContainer();
        if(container){
          const box=document.createElement('div');
          box.id='sfResultAiCta';
          box.className='sf-result-ai-cta';
          box.innerHTML='<h3>Bagikan & Lanjutkan Hasil Anda</h3><p><span class="sfai-live-dot"></span><span class="sfai-ai-label">Safe Future Financial Health</span><br>Bagikan hasil secara aman ke media sosial. Postingan Anda tidak memuat data finansial sensitif.</p><div class="sf-result-ai-actions"><button class="sf-result-ai-btn" type="button" onclick="openFHCShare?.()">Bagikan Hasil ↗</button><button class="sf-result-ai-btn" type="button" onclick="openSfAiFromResult()">Tanya Safe Future AI →</button><button class="sf-result-wa-btn" type="button" onclick="openSfLeadModal()">Diskusikan via WhatsApp</button></div><div class="sf-share-handle">@safuture.id · Share your score, inspire your circle.</div>';
          container.appendChild(box);
        }
      }
    }catch(e){ console.warn('Post-FHC UX:',e); }
  }

  window.openSfAiFromResult = async function(){
    // Reuse the site's existing AI panel if available.
    const panel = q('tanyaAiPanel') || q('aiPanel') || q('tanyaAI');
    if(panel){
      panel.classList.remove('hidden');
      panel.style.display='';
      panel.scrollIntoView({behavior:'smooth',block:'center'});
    }else{
      const btn = [...document.querySelectorAll('button,a')].find(el=>/tanya ai/i.test(el.textContent||''));
      if(btn) btn.click();
    }

    // If v41 exposes a real AI handler, seed the diagnosis context.
    window.sfAiDiagnosisContext = buildDiagnosisSummary();
    window.sfAiDiagnosisContext.timestamp = new Date().toISOString();
    try{
      const raw = JSON.stringify(window.sfAiDiagnosisContext);
      window.sfAiDiagnosisPromptContext =
        'HASIL FINANCIAL HEALTH CHECK RESPONDEN (gunakan sebagai sumber utama, jangan mengarang): ' + raw;
    }catch(e){}
    try{
      if(typeof window.openTanyaAi==='function') await window.openTanyaAi();
      if(typeof window.initTanyaAi==='function') await window.initTanyaAi();
    }catch(e){ console.warn(e); }
  };

  window.openSfLeadModal = async function(){
    const modal=q('sfLeadModal');
    if(!modal) return;
    modal.style.display='flex';
    const d=buildDiagnosisSummary();
    modal.dataset.diagnosis=JSON.stringify(d);
    setTimeout(()=>q('sfLeadName')?.focus(),50);
  };

  window.closeSfLeadModal = function(){
    const m=q('sfLeadModal'); if(m) m.style.display='none';
  };

  document.addEventListener('DOMContentLoaded',function(){
    q('sfLeadForm')?.addEventListener('submit',async function(e){
      e.preventDefault();
      const name=q('sfLeadName')?.value.trim();
      const wa=normalizeWa(q('sfLeadWa')?.value);
      const email=q('sfLeadEmail')?.value.trim() || null;
      if(!name || !wa || !q('sfLeadConsent')?.checked) return;

      const diagnosis=JSON.parse(q('sfLeadModal')?.dataset.diagnosis||'{}');
      const lead={
        full_name:name,
        whatsapp:wa,
        email:email,
        source:'FHC - WhatsApp Consultation',
        assessment_type:'FHC',
        score:diagnosis.score ?? null,
        protection_gap:diagnosis.protectionGap ?? null,
        critical_illness_gap:diagnosis.criticalIllnessGap ?? null,
        retirement_gap:diagnosis.retirementGap ?? null,
        notes:'Lead captured before WhatsApp consultation',
        created_at:new Date().toISOString()
      };

      const result=await saveLeadToCloud(lead);
      if(!result.ok) saveLeadLocally(lead);

      const message=encodeURIComponent(
        'Halo Safe Future, saya sudah melakukan Financial Health Check dan ingin mendiskusikan hasil saya.\\n\\nNama: '+name+'\\nSaya ingin memahami hasil assessment dan prioritas yang sebaiknya saya lakukan.'
      );
      window.open('https://wa.me/6285887836384?text='+message,'_blank','noopener');
      closeSfLeadModal();
    });

    // Detect result rendering without disturbing the existing engine.
    const observer=new MutationObserver(function(){
      const container=findResultContainer();
      const text=(container?.innerText||'').toLowerCase();
      if(container && (text.includes('financial health') || text.includes('health score') || text.includes('hasil assessment'))){
        afterFhcCompleted();
      }
    });
    observer.observe(document.body,{subtree:true,childList:true});

    // Also expose a manual hook for the existing submit function.
    window.safeFutureAfterFhcCompleted=afterFhcCompleted;
  });

})();

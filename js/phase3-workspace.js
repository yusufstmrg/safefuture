/* Safe Future Platform — Phase 3: Persistent Personal Workspace
 * Additive only: preserves existing public content, FHC/WPR calculations, products and admin flows.
 */
(function(){
  const $ = id => document.getElementById(id);
  const client = () => window.supabaseClient;
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money = v => v == null || v === '' ? '—' : 'Rp ' + Number(v||0).toLocaleString('id-ID');
  const date = v => v ? new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}) : '—';
  const safeJson = v => { try{return JSON.parse(JSON.stringify(v||{}))}catch{return {}} };

  async function user(){ try{return (await client()?.auth.getUser())?.data?.user || null}catch{return null} }
  async function log(type,name,metadata={}){
    try{ const c=client(); if(c) await c.rpc('log_my_activity',{p_event_type:type,p_event_name:name,p_metadata:safeJson(metadata)}); }catch(e){ console.warn('Phase 3 activity log:',e); }
  }

  window.sfPhase3PersistWpr = async function(leadData){
    const u = await user();
    if(!u || !client()){
      try{ sessionStorage.setItem('sf_pending_wpr_platform',JSON.stringify(leadData)); }catch{}
      return {ok:false,pending:true};
    }
    const d = leadData || {};
    const snap = d.wprSnapshot || {};
    const calc = snap.calculations || {};
    const inputs = snap.inputs || {};
    const modules = Array.isArray(d.modules) ? d.modules : (snap.modules || []);
    const recs = Array.isArray(d.recommendations) ? d.recommendations : (snap.recommendations || []);
    const priority = modules.slice().sort((a,b)=>Number(a.score||0)-Number(b.score||0)).slice(0,3).map(x=>x.name);
    const payload = {
      nama:d.nama, wa:d.wa, wprScore:d.wprScore, wprStatus:d.wprStatus,
      netWorth:d.netWorth, liquidityScore:modules.find(x=>x.name==='Liquid Asset Position')?.score,
      protectionScore:modules.find(x=>x.name==='Life Protection')?.score,
      retirementScore:modules.find(x=>x.name==='Retirement Position')?.score,
      wealthScore:modules.find(x=>x.name==='Concentration Risk')?.score,
      protectionNeed:calc.hlvEstimate, protectionGap:Math.max(0,Number(calc.hlvEstimate||0)-Number(calc.lifeProtectionHeld||0)),
      criticalIllnessGap:Math.max(0,Number(calc.criticalIllnessNeed||0)-Number(calc.ciProtectionHeld||0)),
      retirementGap:Math.max(0,Number(calc.retNeed||0)-Number(calc.retFV||0)),
      priority1:priority[0]||null, priority2:priority[1]||null, priority3:priority[2]||null,
      observation:d.observation || snap.observation || '', modules, recommendations:recs, inputs, calculations:calc, snapshot:snap
    };
    const r = await client().rpc('submit_my_wpr',{p_payload:payload});
    if(r.error){ console.warn('Phase 3 WPR persistence:',r.error); return {ok:false,error:r.error}; }
    sessionStorage.removeItem('sf_pending_wpr_platform');
    try{ if(typeof window.sfSyncCrmAfterAuth==='function') await window.sfSyncCrmAfterAuth(); }catch(e){ console.warn('WPR CRM sync:',e); }
    await log('assessment','Wealth & Protection Review selesai',{wpr_id:r.data,score:d.wprScore});
    return {ok:true,id:r.data};
  };

  async function claimPendingWpr(){
    const raw=sessionStorage.getItem('sf_pending_wpr_platform'); if(!raw)return;
    try{ const data=JSON.parse(raw); const r=await window.sfPhase3PersistWpr(data); if(r.ok)sessionStorage.removeItem('sf_pending_wpr_platform'); }catch(e){console.warn('Phase 3 pending WPR:',e)}
  }

  function inject(){
    const root=$('sfDashContent'); if(!root || $('sfPhase3Workspace'))return;
    const el=document.createElement('div'); el.id='sfPhase3Workspace'; el.className='sf-p3-wrap';
    el.innerHTML=`
      <div class="sf-p3-head"><div><span class="sf-p3-kicker">PERSONAL WORKSPACE</span><h4>Perjalanan Finansial Anda</h4><p>Riwayat diagnosis, aktivitas, dan profil Anda tersimpan dalam satu ruang pribadi.</p></div><button class="sf-p3-btn" onclick="sfPhase3Refresh()"><i class="fas fa-rotate"></i> Refresh</button></div>
      <div class="sf-p3-tabs">
        <button class="sf-p3-tab active" data-p3="history">Riwayat Diagnosis</button>
        <button class="sf-p3-tab" data-p3="activity">Aktivitas</button>
        <button class="sf-p3-tab" data-p3="profile">Profil</button>
      </div>
      <section class="sf-p3-panel active" data-p3-panel="history"><div class="sf-p3-grid"><div class="sf-p3-card"><div class="sf-p3-card-title"><strong>Financial Health Check™</strong><span>Gratis</span></div><div id="sfP3FhcHistory" class="sf-p3-list"><div class="sf-p3-empty">Memuat…</div></div></div><div class="sf-p3-card"><div class="sf-p3-card-title"><strong>Wealth & Protection Review</strong><span>Gratis</span></div><div id="sfP3WprHistory" class="sf-p3-list"><div class="sf-p3-empty">Memuat…</div></div></div></div><div class="sf-p3-card sf-p3-services"><div class="sf-p3-card-title"><strong>Akses Safe Future</strong><span>Payment gateway belum diaktifkan</span></div><div class="sf-p3-access-row"><i class="fas fa-stethoscope"></i><div><strong>Financial Health Check™</strong><small>Gratis · diagnosis awal</small></div><b class="active">AKTIF</b></div><div class="sf-p3-access-row"><i class="fas fa-vault"></i><div><strong>Wealth & Protection Review</strong><small>Gratis · review lebih mendalam</small></div><b class="active">AKTIF</b></div><div class="sf-p3-access-row"><i class="fas fa-sparkles"></i><div><strong>Tanya AI — Safe Future</strong><small>Gratis · konsultasi informatif & edukatif</small></div><b class="active">AKTIF</b></div></div></section>
      <section class="sf-p3-panel" data-p3-panel="activity"><div class="sf-p3-card"><div class="sf-p3-card-title"><strong>Aktivitas Akun</strong><span>Terbaru</span></div><div id="sfP3Activity" class="sf-p3-list"><div class="sf-p3-empty">Memuat…</div></div></div></section>
      <section class="sf-p3-panel" data-p3-panel="profile"><div class="sf-p3-card"><div class="sf-p3-card-title"><strong>Profil Anda</strong><span>Hanya Anda yang dapat mengubahnya</span></div><form id="sfP3ProfileForm" class="sf-p3-form"><div class="sf-p3-form-grid"><label>Nama lengkap<input id="sfP3Name" type="text" autocomplete="name"></label><label>Email<input id="sfP3Email" type="email" disabled></label><label>Nomor WhatsApp<input id="sfP3Phone" type="tel" autocomplete="tel"></label><label>Kota domisili<input id="sfP3City" type="text"></label><label>Pekerjaan<input id="sfP3Occupation" type="text"></label><label>Tanggal lahir<input id="sfP3Dob" type="date"></label><label>Status pernikahan<select id="sfP3Marital"><option value="">Pilih</option><option>Belum Menikah</option><option>Menikah</option><option>Cerai</option><option>Janda/Duda</option></select></label></div><div class="sf-p3-form-actions"><span id="sfP3ProfileMsg"></span><button class="sf-p3-btn gold" type="submit">Simpan Profil</button></div></form></div></section>`;
    root.appendChild(el);
    el.querySelectorAll('.sf-p3-tab').forEach(b=>b.addEventListener('click',()=>{el.querySelectorAll('.sf-p3-tab').forEach(x=>x.classList.remove('active'));el.querySelectorAll('.sf-p3-panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');el.querySelector(`[data-p3-panel="${b.dataset.p3}"]`)?.classList.add('active');}));
    $('sfP3ProfileForm').addEventListener('submit',saveProfile);
  }

  async function load(){
    const u=await user(), c=client(); if(!u||!c)return;
    inject();
    const [summary,wpr,acts,p]=await Promise.all([
      c.rpc('get_my_dashboard_summary'),
      c.from('wpr_submissions').select('id,status,submitted_at,completed_at,created_at,wpr_results(*)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(10),
      c.from('activity_events').select('event_type,event_name,metadata,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(12),
      c.from('profiles').select('*').eq('id',u.id).maybeSingle()
    ]);
    const profile=p.data||{}; const summaryData=summary.data||{}; const fhc=summaryData.fhc_history||[];
    $('sfP3Name').value=profile.full_name||u.user_metadata?.full_name||'';
    $('sfP3Email').value=profile.email||u.email||'';
    $('sfP3Phone').value=profile.phone||''; $('sfP3City').value=profile.city||''; $('sfP3Occupation').value=profile.occupation||''; $('sfP3Dob').value=profile.date_of_birth||''; $('sfP3Marital').value=profile.marital_status||'';
    renderFhc(fhc); renderWpr(wpr.data||[]); renderActivity(acts.data||[]);
  }

  function renderFhc(rows){const el=$('sfP3FhcHistory');if(!el)return;if(!rows.length){el.innerHTML='<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>';return}el.innerHTML=rows.map((r,i)=>{const s=r.overall_score ?? r.fhc_scores?.[0]?.overall_score;return `<div class="sf-p3-history"><div><strong>FHC ${i===0?'Terbaru':'Riwayat'}</strong><small>${date(r.submitted_at||r.created_at)} · ${esc(r.status||'')}</small></div><b>${s!=null?Math.round(Number(s))+' / 100':'—'}</b></div>`}).join('')}
  function renderWpr(rows){const el=$('sfP3WprHistory');if(!el)return;if(!rows.length){el.innerHTML='<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>';return}el.innerHTML=rows.map((r,i)=>{const s=r.wpr_results?.[0]?.overall_score;return `<div class="sf-p3-history"><div><strong>WPR ${i===0?'Terbaru':'Riwayat'}</strong><small>${date(r.completed_at||r.submitted_at||r.created_at)} · ${esc(r.status||'')}</small></div><b>${s!=null?Math.round(Number(s))+' / 100':'—'}</b></div>`}).join('')}
  function renderActivity(rows){const el=$('sfP3Activity');if(!el)return;if(!rows.length){el.innerHTML='<div class="sf-p3-empty">Belum ada aktivitas tercatat.</div>';return}el.innerHTML=rows.map(r=>`<div class="sf-p3-activity"><i class="fas fa-circle-check"></i><div><strong>${esc(r.event_name)}</strong><small>${date(r.created_at)}</small></div></div>`).join('')}

  async function saveProfile(e){e.preventDefault();const u=await user(),c=client();if(!u||!c)return;const msg=$('sfP3ProfileMsg');msg.textContent='Menyimpan…';const payload={id:u.id,full_name:$('sfP3Name').value.trim(),email:$('sfP3Email').value.trim(),phone:$('sfP3Phone').value.trim()||null,city:$('sfP3City').value.trim()||null,occupation:$('sfP3Occupation').value.trim()||null,date_of_birth:$('sfP3Dob').value||null,marital_status:$('sfP3Marital').value||null,updated_at:new Date().toISOString()};const r=await c.from('profiles').upsert(payload,{onConflict:'id'});if(r.error){msg.textContent='Profil belum tersimpan: '+r.error.message;return}await log('profile','Profil diperbarui');msg.textContent='Profil tersimpan.';setTimeout(()=>msg.textContent='',2500);}

  window.sfPhase3Refresh=()=>load();
  document.addEventListener('DOMContentLoaded',()=>setTimeout(async()=>{
    try{
      const c=client(); if(!c)return;
      c.auth.onAuthStateChange(async(event,session)=>{
        if(session?.user){
          if(event==='SIGNED_IN') await log('account','Login berhasil',{provider:session.user.app_metadata?.provider||'email'});
          await claimPendingWpr();
          setTimeout(load,250);
        }
      });
      const oldOpen=window.sfOpenAccount;
      if(oldOpen && !oldOpen.__sfP3Wrapped){
        const wrapped=async function(){await oldOpen();setTimeout(load,400)};wrapped.__sfP3Wrapped=true;window.sfOpenAccount=wrapped;
      }
      // FHC claim is already performed by Phase 2; add a lightweight activity marker when the pending token disappears.
      const oldClaim=window.sfClaimPending;
      if(oldClaim && !oldClaim.__sfP3Wrapped){
        const wrapped=async function(){const before=sessionStorage.getItem('sf_pending_fhc_id');const r=await oldClaim();if(before&&!sessionStorage.getItem('sf_pending_fhc_id'))await log('assessment','Financial Health Check tersambung ke akun');return r};wrapped.__sfP3Wrapped=true;window.sfClaimPending=wrapped;
      }
      const oldAi=window.sfAiToggle;
      if(oldAi && !oldAi.__sfP3Wrapped){const wrapped=function(){const r=oldAi.apply(this,arguments);log('ai','Tanya AI dibuka');return r};wrapped.__sfP3Wrapped=true;window.sfAiToggle=wrapped;}
    }catch(e){console.warn('Phase 3 init:',e)}
  },500));
})();

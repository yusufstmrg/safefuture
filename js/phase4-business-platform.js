/* Safe Future Phase 4 — Account Workspace + Commercial Conversion Layer
 * Additive module. Payment gateway intentionally NOT activated.
 */
(function(){
  const c=()=>window.supabaseClient;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>v==null||v===''?'—':'Rp '+Number(v||0).toLocaleString('id-ID');
  const pct=v=>v==null||v===''?'—':Math.round(Number(v))+'%';
  const wa='6285887836384';

  async function user(){try{return (await c()?.auth.getUser())?.data?.user||null}catch{return null}}
  async function ensureProfile(u){
    if(!u||!c())return null;
    const meta=u.user_metadata||{};
    const payload={id:u.id,email:u.email||null,full_name:meta.full_name||meta.name||null};
    try{await c().from('profiles').upsert(payload,{onConflict:'id',ignoreDuplicates:false})}catch(e){console.warn('profile sync',e)}
    const r=await c().from('profiles').select('*').eq('id',u.id).maybeSingle();
    return r.data||payload;
  }

  function show(view){
    const dash=$('sfUserDashboard'); if(dash)dash.classList.remove('hidden');
    const content=$('sfDashContent'); if(content)content.classList.remove('hidden');
  }

  function shell(){
    const content=$('sfDashContent'); if(!content)return;
    content.innerHTML=`
      <div class="sf4-welcome">
        <div><span class="sf4-kicker">MY SAFE FUTURE · PERSONAL ADVISORY WORKSPACE</span><h4 id="sf4Name">Dashboard</h4><p id="sf4Subtitle">Bangun keputusan finansial berdasarkan data Anda, bukan asumsi.</p></div>
        <div class="sf4-profile-mini"><span id="sf4ProfileInitial">S</span><div><strong id="sf4ProfileName">Akun Safe Future</strong><small id="sf4ProfileEmail">—</small></div></div>
      </div>
      <div class="sf4-nav" role="tablist">
        <button class="active" data-sf4-tab="overview">Overview</button><button data-sf4-tab="assessments">Diagnosis</button><button data-sf4-tab="plan">Financial Plan</button><button data-sf4-tab="goals">Goals</button><button data-sf4-tab="solutions">Solutions</button><button data-sf4-tab="ai">AI Advisor</button><button data-sf4-tab="reports">Reports</button><button data-sf4-tab="profile">Profile</button>
      </div>
      <section class="sf4-panel active" data-sf4-panel="overview">
        <div class="sf4-score-row"><div class="sf4-score-main"><span>Financial Health Score</span><strong id="sf4Score">—</strong><small id="sf4ScoreNote">Lengkapi FHC untuk mendapatkan diagnosis.</small></div><div class="sf4-health-ring" id="sf4Ring">—</div></div>
        <div class="sf4-metrics"><div><span>Net Worth</span><strong id="sf4NetWorth">—</strong></div><div><span>Cash Flow</span><strong id="sf4CashFlow">—</strong></div><div><span>Protection Gap</span><strong id="sf4Protection">—</strong></div><div><span>Goals</span><strong id="sf4GoalsCount">0</strong></div></div>
        <div class="sf4-grid2"><div class="sf4-card"><div class="sf4-card-head"><h5>Next Best Actions</h5><span>Prioritas Anda</span></div><div id="sf4Actions"></div></div><div class="sf4-card"><div class="sf4-card-head"><h5>Recommended Solutions</h5><span>Berbasis diagnosis</span></div><div id="sf4SolutionsMini"></div></div></div>
        <div class="sf4-card sf4-premium-cta"><div><span class="sf4-kicker">LEVEL 3 · PRIVATE ADVISORY</span><h5>Butuh strategi yang benar-benar personal?</h5><p>Untuk kebutuhan kompleks seperti wealth, legacy, business continuity, estate, dan multi-generasi, lanjutkan ke sesi bersama Senior Advisor.</p></div><button onclick="sf4RequestAdvisory('private_advisory')">Jadwalkan Private Advisory →</button></div>
      </section>
      <section class="sf4-panel" data-sf4-panel="assessments"><div class="sf4-grid2"><div class="sf4-card"><div class="sf4-card-head"><h5>Financial Health Check™</h5><button onclick="sfDashboardAction('fhc')">Ulangi</button></div><div id="sf4FhcHistory"></div></div><div class="sf4-card"><div class="sf4-card-head"><h5>Wealth & Protection Review™</h5><button onclick="sfDashboardAction('wpr')">Buka WPR</button></div><div id="sf4WprHistory"></div></div></div></section>
      <section class="sf4-panel" data-sf4-panel="plan"><div class="sf4-card"><div class="sf4-card-head"><div><h5>Financial Plan</h5><span>Snapshot kondisi saat ini</span></div><button onclick="sf4OpenTab('profile')">Perbarui Data</button></div><div id="sf4Plan"></div></div><div class="sf4-card"><div class="sf4-card-head"><h5>Scenario Simulator</h5><span>Simulasi aritmetika, bukan proyeksi investasi</span></div><div class="sf4-sim"><input id="sf4SimIncome" type="number" placeholder="Penghasilan / bulan"><input id="sf4SimExpense" type="number" placeholder="Pengeluaran / bulan"><input id="sf4SimExtra" type="number" placeholder="Komitmen tambahan / bulan"><select id="sf4SimMonths"><option>6</option><option selected>12</option><option>24</option><option>36</option></select><button onclick="sf4Simulate()">Hitung Dampak</button></div><div id="sf4SimResult"></div></div></section>
      <section class="sf4-panel" data-sf4-panel="goals"><div class="sf4-card"><div class="sf4-card-head"><div><h5>Tujuan & Roadmap</h5><span>Ubah target menjadi rencana yang dapat dipantau</span></div><button class="gold" onclick="sf4AddGoal()">+ Tambah Tujuan</button></div><div id="sf4GoalsList"></div></div></section>
      <section class="sf4-panel" data-sf4-panel="solutions"><div class="sf4-card"><div class="sf4-card-head"><div><h5>Solutions Marketplace</h5><span>Safe Future tidak menjual produk secara membabi buta. Solusi muncul setelah diagnosis.</span></div></div><div id="sf4Solutions"></div></div><div class="sf4-card"><div class="sf4-card-head"><h5>Advisory Services</h5><span>Payment gateway belum diaktifkan</span></div><div class="sf4-services"><article><b>Private Advisory</b><span>Strategi wealth, protection, estate & legacy</span><button onclick="sf4RequestAdvisory('private_advisory')">Request</button></article><article><b>Financial Protection Blueprint</b><span>Pemetaan kebutuhan perlindungan secara menyeluruh</span><button onclick="sf4RequestAdvisory('protection_blueprint')">Request</button></article><article><b>Business & Legacy Advisory</b><span>Continuity, succession dan multi-generasi</span><button onclick="sf4RequestAdvisory('business_legacy')">Request</button></article></div></div></section>
      <section class="sf4-panel" data-sf4-panel="ai"><div class="sf4-ai-card"><div><span class="sf4-kicker">SAFE FUTURE INTELLIGENCE</span><h5>Tanya AI — Personal Financial Copilot</h5><p>Gunakan AI gratis untuk memahami hasil diagnosis, membuat skenario, dan menyiapkan pertanyaan sebelum berbicara dengan advisor.</p></div><button onclick="sfCloseAccount();setTimeout(()=>sfAiToggle(),250)">Buka Tanya AI →</button></div><div class="sf4-card"><h5>AI yang lebih relevan karena mengenal konteks Anda</h5><p class="sf4-muted">Saat Anda login dan memiliki diagnosis, Safe Future dapat menggunakan konteks yang tersimpan sesuai izin akun untuk membuat percakapan lebih relevan. AI tetap bersifat informatif dan edukatif.</p></div></section>
      <section class="sf4-panel" data-sf4-panel="reports"><div class="sf4-card"><div class="sf4-card-head"><h5>Reports & Documents</h5><span>Riwayat hasil dan laporan</span></div><div id="sf4Reports"></div></div></section>
      <section class="sf4-panel" data-sf4-panel="profile"><div class="sf4-card"><div class="sf4-card-head"><h5>Profile & Preferences</h5><span>Data Anda dapat diperbarui kapan saja</span></div><div class="sf4-profile-form"><label>Nama<input id="sf4FullName"></label><label>WhatsApp<input id="sf4Phone"></label><label>Kota<input id="sf4City"></label><label>Pekerjaan<input id="sf4Occupation"></label><label>Tanggal lahir<input id="sf4Dob" type="date"></label><label>Status pernikahan<select id="sf4Marital"><option value="">Pilih</option><option>Belum Menikah</option><option>Menikah</option><option>Cerai</option><option>Janda/Duda</option></select></label></div><button class="sf4-save" onclick="sf4SaveProfile()">Simpan Profil</button><div id="sf4ProfileMsg"></div></div></section>`;
    content.querySelectorAll('[data-sf4-tab]').forEach(b=>b.addEventListener('click',()=>sf4OpenTab(b.dataset.sf4Tab)));
  }

  window.sf4OpenTab=function(tab){
    document.querySelectorAll('[data-sf4-tab]').forEach(x=>x.classList.toggle('active',x.dataset.sf4Tab===tab));
    document.querySelectorAll('[data-sf4-panel]').forEach(x=>x.classList.toggle('active',x.dataset.sf4Panel===tab));
  };

  function buildActions(d){
    const a=[];
    if(d.score==null)a.push(['Mulai Financial Health Check','Bangun baseline kesehatan finansial Anda.','fhc']);
    else if(Number(d.score)<70)a.push(['Perkuat area finansial prioritas','Score Anda menunjukkan ada area yang masih perlu diperkuat.','fhc']);
    if(d.wpr==null)a.push(['Lakukan Wealth & Protection Review','Review lebih dalam untuk wealth, protection, retirement dan legacy.','wpr']);
    if(d.protectionGap>0)a.push(['Tutup protection gap','Evaluasi kebutuhan perlindungan sebelum mengambil komitmen baru.','solutions']);
    if(d.cashflow<0)a.push(['Stabilkan cash flow','Pengeluaran tercatat lebih tinggi dari penghasilan.','plan']);
    if(!a.length)a.push(['Jaga momentum','Diagnosis Anda sudah tersimpan. Gunakan Goals & Roadmap untuk mengubah insight menjadi tindakan.','goals']);
    return a;
  }
  function renderActions(a){$('sf4Actions').innerHTML=a.map(x=>`<button class="sf4-action" onclick="sf4OpenTab('${x[2]}')"><div><b>${esc(x[0])}</b><small>${esc(x[1])}</small></div><span>→</span></button>`).join('')}

  function renderGoals(rows){const el=$('sf4GoalsList'); if(!el)return;if(!rows.length){el.innerHTML='<div class="sf4-empty">Belum ada tujuan. Tambahkan tujuan pertama Anda.</div>';return}el.innerHTML=rows.map(g=>{const t=Number(g.target_amount||0),cur=Number(g.current_amount||0),p=t?Math.min(100,Math.round(cur/t*100)):0;return `<div class="sf4-goal"><div><b>${esc(g.goal_name)}</b><small>${money(cur)} dari ${money(t)}${g.target_date?' · '+esc(g.target_date):''}</small><div class="sf4-progress"><i style="width:${p}%"></i></div></div><strong>${p}%</strong><button title="Perbarui progres" onclick="sf4UpdateGoal('${g.id}',${cur})">Edit</button></div>`}).join('')}

  window.sf4AddGoal=async function(){const u=await user();if(!u)return;const name=prompt('Nama tujuan finansial');if(!name)return;const amount=Number(prompt('Target nominal (Rp)','0')||0);if(!Number.isFinite(amount)||amount<0)return alert('Target tidak valid.');const date=prompt('Target tanggal (YYYY-MM-DD), opsional')||null;const r=await c().from('financial_goals').insert({user_id:u.id,goal_name:name,target_amount:amount,current_amount:0,target_date:date,priority:3});if(r.error)alert('Tujuan belum tersimpan: '+r.error.message);else sf4Load();};
  window.sf4UpdateGoal=async function(id,current){const v=Number(prompt('Progress saat ini (Rp)',String(current))||current);if(!Number.isFinite(v)||v<0)return;const r=await c().from('financial_goals').update({current_amount:v}).eq('id',id).eq('user_id',(await user()).id);if(r.error)alert('Progress belum tersimpan: '+r.error.message);else sf4Load();};
  window.sf4Simulate=function(){const i=Number($('sf4SimIncome')?.value||0),e=Number($('sf4SimExpense')?.value||0),x=Number($('sf4SimExtra')?.value||0),m=Number($('sf4SimMonths')?.value||12),base=i-e,after=base-x;$('sf4SimResult').innerHTML=`<div class="sf4-sim-result"><b>${money(after)}</b><span>surplus/defisit bulanan setelah skenario</span><small>Dampak ${m} bulan: ${money(after*m)}</small></div>`;};

  async function saveRecommendation(u,code,type,priority,meta){try{const recent=await c().from('recommendation_events').select('id').eq('user_id',u.id).eq('recommendation_code',code).gte('created_at',new Date(Date.now()-7*86400000).toISOString()).limit(1);if(!recent.data?.length)await c().from('recommendation_events').insert({user_id:u.id,recommendation_type:type,recommendation_code:code,priority,metadata:meta});}catch(e){console.warn('recommendation event',e)}}
  async function renderSolutions(u,d,products){
    const candidates=[];
    if(d.protectionGap>0)candidates.push({code:'protection',title:'Financial Protection Planning',reason:'Ada protection gap pada diagnosis terakhir.',priority:1,query:'perlindungan'});
    if(d.cashflow<0)candidates.push({code:'cashflow',title:'Cash Flow Stabilization',reason:'Cash flow tercatat defisit; fokus utama adalah stabilisasi sebelum menambah komitmen.',priority:1});
    if(d.wprGap>0||d.netWorth>0)candidates.push({code:'wealth',title:'Wealth & Protection Strategy',reason:'Data wealth Anda memungkinkan review lebih mendalam mengenai alokasi aset, konsentrasi risiko dan keberlanjutan.',priority:2});
    if(!candidates.length)candidates.push({code:'blueprint',title:'Financial Protection Blueprint',reason:'Bangun roadmap perlindungan dan wealth yang terintegrasi.',priority:2});
    $('sf4Solutions').innerHTML=candidates.map(x=>`<article class="sf4-solution"><div><span class="sf4-solution-priority">PRIORITAS ${x.priority}</span><b>${esc(x.title)}</b><p>${esc(x.reason)}</p></div><button onclick="sf4RequestAdvisory('${x.code}')">Bahas Solusi →</button></article>`).join('');
    $('sf4SolutionsMini').innerHTML=candidates.slice(0,3).map(x=>`<button class="sf4-solution-mini" onclick="sf4OpenTab('solutions')"><b>${esc(x.title)}</b><span>${esc(x.reason)}</span></button>`).join('');
    for(const x of candidates)await saveRecommendation(u,x.code,'service',x.priority,{reason:x.reason});
    if(products?.length){/* product catalog is shown below only when product data is available */}
  }

  window.sf4RequestAdvisory=async function(type){
    const u=await user(); if(!u)return;
    let subject='Permintaan '+type.replaceAll('_',' ');
    try{const r=await c().rpc('create_advisory_request',{p_request_type:type,p_source:'my_safe_future',p_subject:subject,p_context:{page:'dashboard'}});if(r.error)throw r.error;}catch(e){console.warn(e)}
    const text=encodeURIComponent(`Halo Safe Future, saya ${$('sf4ProfileName')?.textContent||'pengguna Safe Future'}. Saya ingin membahas ${type.replaceAll('_',' ')} berdasarkan hasil diagnosis saya di My Safe Future.`);
    window.open('https://wa.me/'+wa+'?text='+text,'_blank');
  };

  async function sf4Load(){
    const u=await user();if(!u||!c())return;show('dashboard');try{if(typeof window.sfSyncCrmAfterAuth==='function')await window.sfSyncCrmAfterAuth()}catch(e){console.warn('CRM dashboard sync:',e)}
    const p=await ensureProfile(u);
    const [summary,wprq,reports,products]=await Promise.all([
      c().rpc('get_my_dashboard_summary'),
      c().from('wpr_submissions').select('id,status,submitted_at,completed_at,created_at,wpr_results(*)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(10),
      c().from('reports').select('report_type,status,generated_at,storage_path,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      c().from('sf_products').select('id,product_code,product_name,category,target_customer,premium_start,coverage_period,active').eq('active',true).limit(8)
    ]);
    if(summary.error){console.warn('Safe Future dashboard summary:',summary.error);}
    const sd=summary.data||{}, f=sd.financial_profile||{}, goalsCount=Number(sd.goals_count||0), fhcs=sd.fhc_history||[], wprs=wprq.data||[];
    let fs=sd.latest_fhc||{};
    if(fs?.overall_score==null){
      try{
        const sub=await c().from('fhc_submissions').select('id,status,submitted_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
        if(sub.data?.id){
          const sc=await c().from('fhc_scores').select('overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,calculated_at').eq('fhc_id',sub.data.id).order('calculated_at',{ascending:false}).limit(1).maybeSingle();
          if(sc.data) fs={...sub.data,...sc.data};
        }
      }catch(e){console.warn('Phase4 FHC fallback:',e);}
    }
    const wr=wprs[0]?.wpr_results?.[0]||{};
    const score=fs.overall_score!=null?Number(fs.overall_score):null;
    const netWorth=(f.liquid_assets!=null||f.total_debt!=null)?Number(f.liquid_assets||0)+Number(f.investment_assets||0)+Number(f.non_liquid_assets||0)-Number(f.total_debt||0):null;
    const cashflow=(f.monthly_income!=null&&f.monthly_expense!=null)?Number(f.monthly_income)-Number(f.monthly_expense):null;
    const protectionGap=wr.protection_gap!=null?Number(wr.protection_gap):(fs.protection_gap!=null?Number(fs.protection_gap):0);
    const d={score,netWorth,cashflow,protectionGap,wpr:wprs[0]||null,wprGap:Number(wr.retirement_gap||0)+Number(wr.critical_illness_gap||0),goalsCount};
    $('sf4Name').textContent='Halo, '+(p?.full_name||u.user_metadata?.full_name||u.user_metadata?.name||u.email?.split('@')[0]||'');
    $('sf4ProfileName').textContent=p?.full_name||u.user_metadata?.full_name||u.email?.split('@')[0]||'Akun Safe Future'; $('sf4ProfileEmail').textContent=u.email||'—'; $('sf4ProfileInitial').textContent=(p?.full_name||u.email||'S').trim().charAt(0).toUpperCase();
    $('sf4Score').textContent=score==null?'—':Math.round(score); $('sf4ScoreNote').textContent=score==null?'Lengkapi Financial Health Check untuk mendapatkan diagnosis.':score>=70?'Fondasi finansial relatif kuat. Fokus berikutnya adalah optimasi dan perlindungan.':score>=40?'Ada beberapa area yang perlu diperkuat. Lihat Next Best Actions Anda.':'Prioritaskan area risiko utama sebelum menambah komitmen finansial baru.';
    $('sf4Ring').textContent=score==null?'—':Math.round(score); $('sf4Ring').style.setProperty('--score',Math.max(0,Math.min(100,score)));
    $('sf4NetWorth').textContent=money(netWorth);$('sf4CashFlow').textContent=money(cashflow);$('sf4Protection').textContent=protectionGap>0?money(protectionGap):'Tidak terdeteksi';$('sf4GoalsCount').textContent=goalsCount;
    renderActions(buildActions(d)); renderGoals([]); renderSolutions(u,d,products.data||[]);
    $('sf4FhcHistory').innerHTML=fhcs.length?fhcs.map((r,i)=>`<div class="sf4-history"><div><b>FHC ${i===0?'Terbaru':'Riwayat'}</b><small>${new Date(r.created_at||r.submitted_at).toLocaleString('id-ID')}</small></div><strong>${r.overall_score!=null?Math.round(Number(r.overall_score))+' / 100':'—'}</strong></div>`).join(''):'<div class="sf4-empty">Belum ada FHC tersimpan.</div>';
    $('sf4WprHistory').innerHTML=wprs.length?wprs.map((r,i)=>`<div class="sf4-history"><div><b>WPR ${i===0?'Terbaru':'Riwayat'}</b><small>${new Date(r.completed_at||r.submitted_at||r.created_at).toLocaleString('id-ID')}</small></div><strong>${r.wpr_results?.[0]?.overall_score!=null?Math.round(r.wpr_results[0].overall_score)+' / 100':'—'}</strong></div>`).join(''):'<div class="sf4-empty">Belum ada WPR tersimpan.</div>';
    $('sf4Plan').innerHTML=[['Penghasilan / bulan',f.monthly_income],['Pengeluaran / bulan',f.monthly_expense],['Aset likuid',f.liquid_assets],['Investasi',f.investment_assets],['Aset non-likuid',f.non_liquid_assets],['Total utang',f.total_debt],['Target pensiun / bulan',f.retirement_monthly_target]].map(x=>`<div class="sf4-plan-row"><span>${x[0]}</span><b>${x[1]!=null?money(x[1]):'—'}</b></div>`).join('');
    $('sf4Reports').innerHTML=reports.data?.length?reports.data.map(r=>`<div class="sf4-history"><div><b>${esc(r.report_type||'Report')}</b><small>${new Date(r.created_at).toLocaleString('id-ID')}</small></div><strong>${esc(r.status||'pending')}</strong></div>`).join(''):'<div class="sf4-empty">Belum ada laporan tersimpan.</div>';
    $('sf4FullName').value=p?.full_name||u.user_metadata?.full_name||u.user_metadata?.name||'';$('sf4Phone').value=p?.phone||'';$('sf4City').value=p?.city||'';$('sf4Occupation').value=p?.occupation||'';$('sf4Dob').value=p?.date_of_birth||'';$('sf4Marital').value=p?.marital_status||'';
  }

  window.sf4SaveProfile=async function(){const u=await user();if(!u)return;const payload={id:u.id,full_name:$('sf4FullName').value.trim()||null,email:u.email||null,phone:$('sf4Phone').value.trim()||null,city:$('sf4City').value.trim()||null,occupation:$('sf4Occupation').value.trim()||null,date_of_birth:$('sf4Dob').value||null,marital_status:$('sf4Marital').value||null};const r=await c().from('profiles').upsert(payload,{onConflict:'id'});const m=$('sf4ProfileMsg');if(r.error){m.textContent='Profil belum tersimpan: '+r.error.message;m.className='sf4-error'}else{m.textContent='Profil berhasil diperbarui.';m.className='sf4-success';await sf4Load()}};

  const oldOpen=window.sfOpenAccount;
  window.sfOpenAccount=async function(){
    const u=await user();
    if(!u){if(oldOpen) return oldOpen();return;}
    const m=$('sfAuthModal');m?.classList.remove('hidden');m?.setAttribute('aria-hidden','false');$('sfAuthView')?.classList.add('hidden');$('sfUserDashboard')?.classList.remove('hidden');$('sfDashLoading')?.classList.add('hidden');$('sfDashContent')?.classList.remove('hidden');
    shell(); await sf4Load();
  };

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
    const client=c(); if(!client)return;
    client.auth.onAuthStateChange((_e,s)=>{if(s?.user){setTimeout(()=>{try{sessionStorage.getItem('sf_pending_wpr_platform')}catch{}},250)}});
  },500));
})();

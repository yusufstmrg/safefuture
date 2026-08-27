/* Safe Future — Enterprise CRM Intelligence v2 */
(function(){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money=v=>v==null||v===''?'—':'Rp '+Number(v||0).toLocaleString('id-ID');
  const date=v=>v?new Date(v).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
  const supa=()=>window.supabaseClient;
  const state={rows:[],dash:null,opps:[],q:'',stage:'all',segment:'all',intent:'all',sort:'score',view:'customers',selected:null};
  const stages=['New','Diagnosed','Qualified','Solution Recommended','Advisor Contacted','Consultation','Proposal','Converted','Nurture'];
  const oppStages=['Discovery','Needs Analysis','Consultation','Solution Recommended','Proposal','Negotiation','Won','Lost'];

  function getCreds(){return {username:(window.__sfAdminSession?.username)||sessionStorage.getItem('sf_admin')||'admin',passwordHash:(window.__sfAdminSession?.passwordHash)||''};}
  async function crmAuth(){const c=supa();if(!c?.auth)return{user:null,error:new Error('Supabase Auth tidak tersedia')};const {data,error}=await c.auth.getSession();return{user:data?.session?.user||null,error};}
  async function rpc(name,params){const c=supa();if(!c)return{error:new Error('Supabase tidak tersedia')};const r=await c.rpc(name,params);if(r.error)console.warn('CRM RPC',name,r.error);return r;}

  window.sf5SyncCustomer=async function(){const c=supa();if(!c?.auth)return null;try{const s=await c.auth.getSession();if(!s.data?.session?.user)return null;const r=await c.rpc('sync_authenticated_customer');if(r.error)return null;return r.data||null;}catch(e){return null;}};

  function shell(){
    const panel=document.getElementById('adminPanel');if(!panel||document.getElementById('sf5CrmPanel'))return;
    const host=document.getElementById('trafficPanel')?.parentNode||panel;
    const el=document.createElement('section');el.id='sf5CrmPanel';el.className='sf5-crm-panel';
    el.innerHTML=`
      <div class="sf5-appbar"><div><div class="sf5-brandline"><span class="sf5-mark">S</span><div><strong>CRM Intelligence</strong><small>Customer 360° · Lead Management · Advisory Operations</small></div></div></div><div class="sf5-app-actions"><span id="sf5SyncStatus" class="sf5-status">Ready</span><button id="sf5Refresh" class="sf5-btn sf5-btn-gold">↻ Refresh</button></div></div>
      <div id="sf5Kpis" class="sf5-kpis"></div>
      <div class="sf5-workspace">
        <div class="sf5-toolbar">
          <div class="sf5-search"><span>⌕</span><input id="sf5Search" placeholder="Cari nama, email, telepon, kota, pekerjaan..."></div>
          <select id="sf5Stage"><option value="all">Semua stage</option>${stages.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
          <select id="sf5Segment"><option value="all">Semua segmen</option><option>Mass Market</option><option>Emerging Affluent</option><option>Affluent</option><option>HNW</option><option>Business Owner</option><option>Executive</option><option>Family</option></select>
          <select id="sf5Intent"><option value="all">Semua intent</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
          <select id="sf5Sort"><option value="score">Score tertinggi</option><option value="newest">Terbaru aktif</option><option value="name">Nama</option></select>
        </div>
        <div class="sf5-tabs"><button data-view="customers" class="active">Customers</button><button data-view="pipeline">Pipeline & Opportunities</button><button data-view="tasks">Tasks & Follow-up</button></div>
        <div id="sf5Body"></div>
      </div>`;
    host.insertBefore(el,host.firstChild);
    ['sf5Search','sf5Stage','sf5Segment','sf5Intent','sf5Sort'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>{state.q=(document.getElementById('sf5Search').value||'').toLowerCase();state.stage=document.getElementById('sf5Stage').value;state.segment=document.getElementById('sf5Segment').value;state.intent=document.getElementById('sf5Intent').value;state.sort=document.getElementById('sf5Sort').value;render();}));
    document.getElementById('sf5Refresh')?.addEventListener('click',load);
    el.querySelectorAll('.sf5-tabs button').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;el.querySelectorAll('.sf5-tabs button').forEach(x=>x.classList.toggle('active',x===b));render();}));
  }

  function filtered(){let r=state.rows.filter(x=>{if(state.stage!=='all'&&x.stage!==state.stage)return false;if(state.segment!=='all'&&x.segment!==state.segment)return false;if(state.intent!=='all'&&x.intent!==state.intent)return false;if(state.q){const s=[x.full_name,x.email,x.phone,x.city,x.occupation,x.segment,x.stage,x.intent,x.next_action].join(' ').toLowerCase();if(!s.includes(state.q))return false;}return true;});r.sort((a,b)=>state.sort==='name'?String(a.full_name||a.email||'').localeCompare(String(b.full_name||b.email||''),'id'):state.sort==='newest'?new Date(b.last_activity_at||b.created_at)-new Date(a.last_activity_at||a.created_at):Number(b.lead_score||0)-Number(a.lead_score||0));return r;}

  function renderKpis(){
    const d=state.dash||{};const k=[['Registered Users',d.registered_users||state.rows.length,'Total terdaftar','blue'],['Diagnosed',d.diagnosed||0,'Sudah ada diagnosis','cyan'],['High Intent',d.high_intent||0,'Potensi tinggi','gold'],['Advisory Requests',d.advisory_requests||0,'Request aktif','purple'],['Converted',d.converted||0,'Menjadi klien','green'],['Pipeline Value',money(d.pipeline_value||0),'Weighted open pipeline','navy'],['Active 7 Hari',d.active_7d||0,'Aktivitas terbaru','cyan'],['Tasks Overdue',d.overdue_tasks||0,'Perlu tindakan','red']];document.getElementById('sf5Kpis').innerHTML=k.map(x=>`<div class="sf5-kpi ${x[3]}"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('');}

  function renderCustomers(){
    const rows=filtered();const summary=`<div class="sf5-section-head"><div><span class="sf5-kicker">SAFE FUTURE INTELLIGENCE</span><h3>CRM Intelligence Command Center</h3><p>Customer 360° · Diagnosis · Pipeline · Opportunities · Engagement · Next Best Action.</p></div><div class="sf5-mini-legend"><span><i class="dot high"></i>HIGH</span><span><i class="dot med"></i>MEDIUM</span><span><i class="dot low"></i>LOW</span></div><button class="sf5-btn sf5-btn-gold sf5-automation-open" type="button" onclick="sf5OpenAutomation()">⚡ Automation Center</button></div>`;
    const table=`<div class="sf5-table-wrap"><table><thead><tr><th>Customer</th><th>Segment</th><th>Score</th><th>Intent</th><th>Stage</th><th>Next Best Action</th><th>Aktivitas</th><th></th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td><div class="sf5-person"><div class="sf5-avatar">${esc((x.full_name||'U').slice(0,1).toUpperCase())}</div><div><strong>${esc(x.full_name||'Belum ada nama')}</strong><small>${esc(x.email||'')} · ${esc(x.phone||'')}</small><small>${esc(x.city||'')} · ${esc(x.occupation||'')}</small></div></div></td><td>${esc(x.segment||'—')}</td><td><span class="sf5-score-ring">${Number(x.lead_score||0)}</span></td><td><span class="sf5-intent ${String(x.intent||'LOW').toLowerCase()}">${esc(x.intent||'LOW')}</span></td><td><span class="sf5-stage-pill">${esc(x.stage||'New')}</span></td><td><div class="sf5-next-inline">${esc(x.next_action||'Review profile')}</div></td><td>${date(x.last_activity_at)}</td><td><button class="sf5-row-btn" onclick="window.__sf5AllowCustomerOpen=true;sf5Detail('${esc(x.user_id)}')">Open 360° →</button></td></tr>`).join(''):`<tr><td colspan="8" class="sf5-empty">Belum ada customer yang cocok.</td></tr>`}</tbody></table></div>`;
    document.getElementById('sf5Body').innerHTML=summary+table;
  }

  function renderPipeline(){
    const cols=oppStages.map(stage=>{const items=state.opps.filter(o=>o.stage===stage&&o.status==='open');const total=items.reduce((s,o)=>s+Number(o.amount||0),0);return `<div class="sf5-pipe-col"><div class="sf5-pipe-head"><div><strong>${esc(stage)}</strong><span>${items.length} opportunity</span></div><b>${money(total)}</b></div><div class="sf5-pipe-list">${items.length?items.map(o=>`<button class="sf5-opp-card" onclick="window.__sf5AllowCustomerOpen=true;sf5Detail('${esc(o.user_id)}')"><strong>${esc(o.customer?.full_name||'Customer')}</strong><span>${esc(o.name)}</span><small>${esc(o.solution_name||o.solution_category||'')}</small><div><em>${Number(o.probability||0)}%</em><b>${money(o.amount||0)}</b></div></button>`).join(''):`<div class="sf5-empty-card">Belum ada opportunity</div>`}</div></div>`;}).join('');
    document.getElementById('sf5Body').innerHTML=`<div class="sf5-section-head"><div><span class="sf5-kicker">PIPELINE MANAGEMENT</span><h3>Opportunity Command Center</h3><p>Kelola perjalanan dari discovery hingga converted dengan satu pipeline.</p></div><button class="sf5-btn sf5-btn-gold" onclick="sf5OpenOpportunityChooser()">＋ Tambah Opportunity</button></div><div class="sf5-pipeline">${cols}</div>`;
  }

  function renderTasks(){
    const all=[];state.rows.forEach(r=>{if(r._tasks)r._tasks.forEach(t=>all.push({...t,customer:r.full_name,user_id:r.user_id}));});
    document.getElementById('sf5Body').innerHTML=`<div class="sf5-section-head"><div><span class="sf5-kicker">EXECUTION</span><h3>Tasks & Follow-up</h3><p>Pastikan setiap lead memiliki tindakan berikutnya dan tidak ada follow-up yang terlewat.</p></div></div><div class="sf5-task-board"><div class="sf5-task-summary"><div><span>Open</span><b>${state.dash?.open_tasks||0}</b></div><div><span>Overdue</span><b>${state.dash?.overdue_tasks||0}</b></div><div><span>7-day active</span><b>${state.dash?.active_7d||0}</b></div></div><div class="sf5-empty-card">Buka Customer 360° untuk membuat task, note, touchpoint, dan opportunity langsung dari profil customer.</div></div>`;
  }

  function render(){renderKpis();if(state.view==='pipeline')renderPipeline();else if(state.view==='tasks')renderTasks();else renderCustomers();}

  function normalizedCards(fhc){if(Array.isArray(fhc.priority_cards))return fhc.priority_cards.filter(Boolean);return [fhc.priority_1_data,fhc.priority_2_data,fhc.priority_3_data].filter(Boolean);}
  function diagnosisCard(d){return `<div class="sf5-dx-card"><div class="sf5-dx-icon">${esc(d.color||'•')}</div><div><div class="sf5-dx-top"><strong>${esc(d.title||'Prioritas')}</strong><span>PRIORITAS ${esc(d.rank||'')}</span></div><p>${esc(d.strategy||'')}</p>${d.product?`<small>Solusi relevan · ${esc(d.product)}</small>`:''}</div></div>`;}

  function renderCustomerModal(payload){
    const p=payload.profile||{},fp=payload.financial_profile||{},fhc=payload.latest_fhc||{},wpr=payload.latest_wpr||{};
    const goals=payload.goals||[],advisory=payload.advisory_requests||[],activity=payload.activity||[],notes=payload.notes||[],tasks=payload.tasks||[],opps=payload.opportunities||[],touchpoints=payload.touchpoints||[],insights=payload.ai_insights||[],history=payload.stage_history||[];
    const cards=normalizedCards(fhc);
    const score=Number(fhc.overall_score??p.fhc_score??0);
    const intent=String(p.intent||'LOW');
    const nextAction=p.next_action||'Review profile and diagnosis';
    const insight=insights[0];
    const nbaTitle=insight?.title||nextAction;
    const nbaSummary=insight?.summary||(advisory.length?'Customer memiliki advisory request aktif. Follow up untuk meningkatkan peluang konsultasi.':'Mulai dari diagnosis tertinggi dan siapkan follow-up yang relevan.');
    const ring=Math.max(0,Math.min(100,score))*3.6;
    const modal=document.createElement('div');
    modal.className='sf5-modal sf5-enterprise-modal';
    modal.innerHTML=`
      <div class="sf5-enterprise-shell">
        <aside class="sf5-enterprise-sidebar">
          <div class="sf5-side-brand"><div class="sf5-side-logo">S</div><div><strong>Safe Future</strong><small>FINANCIAL PROTECTION & WEALTH ADVISORY</small></div></div>
          <div class="sf5-side-group"><span>WORKSPACE</span><button class="active" type="button"><b>▣</b> CRM Intelligence</button><button type="button" onclick="sf5CloseEnterprise()"><b>⌂</b> Dashboard</button></div>
          <div class="sf5-side-group"><span>CUSTOMERS</span><button type="button" onclick="sf5CloseEnterprise();setTimeout(()=>document.getElementById('sf5Search')?.focus(),80)"><b>◉</b> Registered Users</button><button type="button" onclick="sf5OpenModule('segments')"><b>◌</b> Segments</button><button type="button" onclick="sf5OpenModule('pipeline')"><b>◇</b> Leads Pipeline</button><button type="button" onclick="sf5OpenModule('opportunities')"><b>◈</b> Opportunities</button></div>
          <div class="sf5-side-group"><span>ENGAGEMENT</span><button type="button" onclick="sf5OpenModule('activities')"><b>↔</b> Activities</button><button type="button" onclick="sf5OpenModule('interactions')"><b>☏</b> Interactions</button><button type="button" onclick="sf5OpenModule('advisory')"><b>✦</b> Advisory Requests</button><button type="button" onclick="sf5OpenModule('tasks')"><b>✓</b> Tasks & Follow-up</button></div>
          <div class="sf5-side-group"><span>INTELLIGENCE</span><button type="button" onclick="sf5OpenModule('insights')"><b>✧</b> AI Insights</button><button type="button" onclick="sf5OpenModule('scoring')"><b>◫</b> Lead Scoring</button><button type="button" onclick="sf5OpenModule('intents')"><b>⌁</b> Intent Signals</button></div>
          <div class="sf5-side-group"><span>ANALYTICS</span><button type="button" onclick="sf5OpenModule('reports')"><b>▥</b> Reports</button><button type="button" onclick="sf5OpenModule('reports')"><b>⌁</b> Conversion Funnel</button><button type="button" onclick="sf5OpenModule('advisor_performance')"><b>↗</b> Advisor Performance</button></div>
          <div class="sf5-side-group sf5-side-bottom"><span>SETTINGS</span><button type="button" onclick="sf5OpenModule('advisors')"><b>⚙</b> Team & Advisor</button><button type="button" onclick="sf5OpenModule('products')"><b>◉</b> Products & Solutions</button><button type="button" onclick="sf5OpenModule('settings')"><b>⚙</b> CRM Settings</button><button type="button" onclick="sf5CloseEnterprise()"><b>‹‹</b> Close CRM</button></div>
        </aside>
        <main class="sf5-enterprise-main">
          <header class="sf5-enterprise-topbar"><div><div class="sf5-top-title">CRM Intelligence</div><div class="sf5-top-sub">Customer 360° · Lead Management</div></div><div class="sf5-top-actions"><div class="sf5-command-search">⌕ <input placeholder="Cari nama, email, telepon, kota, tag..." oninput="window.sf5EnterpriseSearch?.(this.value)"></div><button class="sf5-icon-btn" onclick="document.getElementById('sf5Search')?.focus()">⌕</button><button class="sf5-icon-btn" onclick="sf5OpenModule('activities')">◷</button><button class="sf5-icon-btn" onclick="sf5OpenModule('insights')">✦</button><div class="sf5-admin-user"><div class="sf5-admin-avatar">Y</div><div><strong>Yusuf Bramantika</strong><small>Administrator</small></div></div></div></header>
          <div class="sf5-enterprise-content">
            <section class="sf5-enterprise-kpis">
              ${[['Registered Users',payload?1:0,'Total terdaftar','violet'],['Diagnosed',score?1:0,'Sudah diagnosis','cyan'],['High Intent',intent==='HIGH'?1:0,'Potensi tinggi','gold'],['Advisory Requests',advisory.length,'Request aktif','purple'],['Converted',String(p.stage||'')==='Converted'?1:0,'Menjadi klien','green'],['Pipeline Value',money(opps.reduce((a,o)=>a+Number(o.amount||0),0)),'Total opportunity','blue'],['Active 7 Hari',activity.filter(a=>new Date(a.created_at)>=new Date(Date.now()-7*86400000)).length,'Aktif terbaru','cyan'],['Tasks Overdue',tasks.filter(t=>t.status==='open'&&t.due_at&&new Date(t.due_at)<new Date()).length,'Perlu tindakan','red']].map(x=>`<div class="sf5-enterprise-kpi ${x[3]}"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('')}
            </section>
            <section class="sf5-enterprise-customer-bar">
              <div class="sf5-enterprise-person"><div class="sf5-avatar-xl">${esc((p.full_name||'U').slice(0,1).toUpperCase())}</div><div><h1>${esc(p.full_name||'Customer')}</h1><p>${esc(p.email||'')} · ${esc(p.phone||'')} · ${esc(p.city||'')}</p><div class="sf5-customer-meta"><span>${esc(p.segment||'Mass Market')}</span><span>${esc(p.occupation||'')}</span><span>Customer sejak ${date(p.created_at).split(',')[0]}</span></div></div></div>
              <div class="sf5-customer-signals"><div><span>Lead Score</span><b>${Number(p.lead_score||0)}</b><i style="width:${Math.min(100,Number(p.lead_score||0))}%"></i></div><div><span>Intent</span><b class="${intent.toLowerCase()}">${esc(intent)}</b></div><div><span>Stage</span><b>${esc(p.stage||'New')}</b></div><div><span>Owner</span><b>${esc(p.assigned_to||'Unassigned')}</b></div></div>
              <div class="sf5-customer-actions"><button class="sf5-btn sf5-btn-gold" onclick="sf5CreateOpportunity('${esc(p.user_id)}')">＋ Opportunity</button><button class="sf5-btn sf5-btn-report" onclick="sf5GenerateCustomerReport('${esc(p.user_id)}')">▣ 360 Report</button><button class="sf5-btn" onclick="sf5OpenActions('${esc(p.user_id)}')">Actions ▾</button></div>
            </section>
            <nav class="sf5-enterprise-tabs"><button class="active" onclick="sf5CustomerTab('360','${esc(p.user_id)}')">Customer 360</button><button onclick="sf5CustomerTab('diagnosis','${esc(p.user_id)}')">Diagnosis</button><button onclick="sf5CustomerTab('pipeline','${esc(p.user_id)}')">Pipeline & Opportunities</button><button onclick="sf5CustomerTab('timeline','${esc(p.user_id)}')">Timeline</button><button onclick="sf5CustomerTab('tasks','${esc(p.user_id)}')">Tasks</button><button onclick="sf5CustomerTab('documents','${esc(p.user_id)}')">Documents</button><button onclick="sf5CustomerTab('notes','${esc(p.user_id)}')">Notes</button><button onclick="sf5CustomerTab('ai','${esc(p.user_id)}')">AI Insights</button></nav>
            <section class="sf5-enterprise-grid">
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Financial Health Snapshot</h3><button class="sf5-link" onclick="sf5CustomerTab('diagnosis','${esc(p.user_id)}')">View Detail →</button></div><div class="sf5-score-layout"><div class="sf5-score-gauge" style="--score:${ring}deg"><div><strong>${score||'—'}</strong><small>/100</small></div></div><div class="sf5-finance-list"><div><span>Net Worth</span><b class="negative">${wpr.net_worth!=null?money(wpr.net_worth):'—'}</b></div><div><span>Cash Flow / bulan</span><b class="positive">${fp.monthly_income!=null?money(Number(fp.monthly_income)-Number(fp.monthly_expense||0)):'—'}</b></div><div><span>Liquidity Ratio</span><b>${fp.monthly_expense?((Number(fp.liquid_assets||0)/Number(fp.monthly_expense)).toFixed(2)):'—'} <em>Rendah</em></b></div><div><span>Emergency Fund</span><b>${fp.monthly_expense?((Number(fp.liquid_assets||0)/Number(fp.monthly_expense)).toFixed(1)+' bulan'):'—'} <em>Rendah</em></b></div><div><span>Debt to Income</span><b>${fp.monthly_income?((Number(fp.total_debt||0)/Math.max(1,Number(fp.monthly_income)*12)*100).toFixed(0)+'%'):'—'} <em>Moderate</em></b></div><div><span>Protection Gap</span><b class="negative">${wpr.protection_gap!=null?money(wpr.protection_gap):'—'}</b></div><div><span>Retirement Gap</span><b class="negative">${wpr.retirement_gap!=null?money(wpr.retirement_gap):'—'}</b></div></div></div></section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Customer Information</h3><button class="sf5-link" onclick="sf5EditCustomer('${esc(p.user_id)}')">Edit</button></div><div class="sf5-info-grid"><div><span>Nama</span><b>${esc(p.full_name||'—')}</b></div><div><span>Status</span><b>${esc(fp.marital_status||p.marital_status||'—')}</b></div><div><span>Pekerjaan</span><b>${esc(p.occupation||'—')}</b></div><div><span>Lokasi</span><b>${esc(p.city||'—')}</b></div><div><span>Penghasilan / Bulan</span><b>${fp.monthly_income!=null?money(fp.monthly_income):'—'}</b></div><div><span>Tanggungan</span><b>${esc(p.dependents_count??'—')}</b></div><div><span>Source</span><b>${esc(p.source||'Website')}</b></div><div><span>Consent</span><b class="consent">${payload.consents?.length?'Disetujui':'Perlu Review'}</b></div></div></section>
              <section class="sf5-enterprise-card sf5-span-2"><div class="sf5-card-head"><h3>Diagnosis Priorities</h3><button class="sf5-link" onclick="sf5CustomerTab('diagnosis','${esc(p.user_id)}')">View Detail →</button></div><div class="sf5-enterprise-diagnosis">${cards.length?cards.slice(0,3).map((d,i)=>`<article class="sf5-enterprise-dx"><div class="sf5-dx-icon-large">${esc(d.color||'•')}</div><div><div class="sf5-enterprise-dx-title"><strong>${esc(d.title||'Prioritas')}</strong><span>PRIORITAS ${i+1}</span></div><p>${esc(d.strategy||'')}</p><small>Rekomendasi solusi · ${esc(d.product||'Review kebutuhan')}</small></div></article>`).join(''):`<div class="sf5-empty-card">Belum ada diagnosis tersimpan.</div>`}</div><button class="sf5-wide-link" onclick="sf5CustomerTab('diagnosis','${esc(p.user_id)}')">Lihat Semua Diagnosis →</button></section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Pipeline & Opportunities</h3><button class="sf5-link" onclick="sf5CustomerTab('pipeline','${esc(p.user_id)}')">Lihat Semua →</button></div><div class="sf5-opportunity-summary"><div><span>Total Opportunity</span><b>${money(opps.reduce((a,o)=>a+Number(o.amount||0),0))}</b></div><div><span>Opportunity Aktif</span><b>${opps.length}</b></div></div>${opps.length?`<div class="sf5-opp-list">${opps.slice(0,4).map(o=>`<div class="sf5-opp-row"><div><strong>${esc(o.name)}</strong><small>${esc(o.solution_name||o.solution_category||'')} · ${esc(o.stage||'Discovery')}</small></div><b>${money(o.amount||0)}</b></div>`).join('')}</div>`:`<div class="sf5-opportunity-empty"><div>◎</div><strong>Belum ada opportunity</strong><span>Buat opportunity pertama untuk customer ini</span><button class="sf5-btn sf5-btn-gold" onclick="sf5CreateOpportunity('${esc(p.user_id)}')">＋ Buat Opportunity</button></div>`}</section>
              <section class="sf5-enterprise-card sf5-card-accent"><div class="sf5-card-head"><h3>Next Best Action</h3><button class="sf5-link" onclick="sf5OpenActions('${esc(p.user_id)}')">Rule / AI-ready</button></div><div class="sf5-next-best"><strong>${esc(nbaTitle)}</strong><p>${esc(nbaSummary)}</p><div class="sf5-nba-meta"><div><span>Prioritas</span><b>${intent==='HIGH'?'Tinggi':'Normal'}</b></div><div><span>Tipe</span><b>Follow Up</b></div><div><span>Estimasi</span><b>${advisory.length?'24 jam':'3 hari'}</b></div><div><span>Confidence</span><b>${insight?.confidence?Math.round(Number(insight.confidence)*100)+'%':'Rule-based'}</b></div></div><div class="sf5-nba-actions"><button class="sf5-btn sf5-btn-gold" onclick="sf5ExecuteNextBestAction('${esc(p.user_id)}')">▶ Mulai Tindakan</button><button class="sf5-link" onclick="sf5OpenActions('${esc(p.user_id)}')">Lihat semua actions →</button></div></div></section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Activity Timeline</h3><button class="sf5-link" onclick="sf5CustomerTab('timeline','${esc(p.user_id)}')">Lihat Semua →</button></div><div class="sf5-enterprise-timeline">${activity.slice(0,8).map(a=>`<div><i></i><div><strong>${esc(a.event_name||a.event_type||'Aktivitas')}</strong><small>${date(a.created_at)}</small></div></div>`).join('')||'<div class="sf5-empty-card">Belum ada aktivitas.</div>'}</div></section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Tasks & Follow-up</h3><button class="sf5-link" onclick="sf5CustomerTab('tasks','${esc(p.user_id)}')">Lihat Semua →</button></div><div class="sf5-task-rows">${tasks.slice(0,6).map(t=>`<div class="sf5-task-row"><div><strong>${esc(t.title)}</strong><small>${esc(t.assigned_to||'Unassigned')} · ${t.due_at?date(t.due_at):'No deadline'}</small></div><button class="sf5-mini-btn" onclick="sf5CompleteTask('${esc(t.id)}')">${esc(t.status||'open')}</button></div>`).join('')||'<div class="sf5-empty-card">Tidak ada tasks. Semua tugas selesai atau belum ada tugas.</div>'}</div></section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Recent Interactions</h3><button class="sf5-link" onclick="sf5OpenModule('interactions','${esc(p.user_id)}')">Lihat Semua →</button></div>${touchpoints.length?`<div class="sf5-interaction-list">${touchpoints.slice(0,6).map(t=>`<div><span class="sf5-channel-dot">${esc((t.channel||'INT').slice(0,1).toUpperCase())}</span><div><strong>${esc(t.channel||t.event_type||'Interaction')}</strong><small>${esc(t.subject||'')} · ${date(t.occurred_at)}</small></div></div>`).join('')}</div>`:`<div class="sf5-empty-card">Belum ada interaksi tercatat.</div>`}</section>
              <section class="sf5-enterprise-card"><div class="sf5-card-head"><h3>Internal Notes</h3><button class="sf5-link" onclick="sf5AddNote('${esc(p.user_id)}')">+ Tambah</button></div>${notes.length?`<div class="sf5-enterprise-notes">${notes.slice(0,5).map(n=>`<div><strong>${esc(n.author||'Admin')}</strong><p>${esc(n.note||'')}</p><small>${date(n.created_at)}</small></div>`).join('')}</div>`:`<div class="sf5-empty-card">Belum ada catatan internal.</div>`}</section>
              <section class="sf5-enterprise-card sf5-span-2"><div class="sf5-card-head"><h3>Stage History</h3><span>${history.length} perubahan</span></div>${history.length?`<div class="sf5-stage-history">${history.slice(0,8).map(h=>`<div><span>${date(h.changed_at)}</span><strong>${esc(h.old_stage||'—')} → ${esc(h.new_stage||'—')}</strong><small>${esc(h.reason||'')}</small></div>`).join('')}</div>`:`<div class="sf5-empty-card">Belum ada riwayat perubahan.</div>`}</section>
            </section>
          </div>
        </main>
      </div>`;
    document.body.appendChild(modal);
  }

  window.sf5CloseEnterprise=function(){document.querySelector('.sf5-enterprise-modal')?.remove();};
  window.sf5EnterpriseSearch=function(v){const q=String(v||'').toLowerCase();const row=state.rows.find(x=>[x.full_name,x.email,x.phone,x.city].join(' ').toLowerCase().includes(q));if(row){window.__sf5AllowCustomerOpen=true;window.sf5Detail(row.user_id);}};

  window.sf5Detail=async function(userId){
    if(window.__sf5AllowCustomerOpen!==true){return;}
    window.__sf5AllowCustomerOpen=false;
    sessionStorage.setItem('sf5_selected_customer',String(userId));
    const cr=getCreds();const auth=await crmAuth();if(!auth.user)return;const r=await rpc('get_admin_crm_user_detail_v3',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId});if(r.error){alert('Detail user belum dapat dimuat: '+r.error.message);return;}const payload=r.data?.[0]?.payload||r.data?.payload;if(payload)renderCustomerModal(payload);};

  window.sf5SaveLead=async function(userId){const cr=getCreds();const msg=document.getElementById('sf5SaveMsg');if(msg)msg.textContent='Menyimpan…';const r=await rpc('update_admin_crm_lead',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_stage:document.getElementById('sf5StageEdit')?.value||'New',p_next_action:document.getElementById('sf5NextActionEdit')?.value||null,p_assigned_to:document.getElementById('sf5AssignedEdit')?.value||null,p_note:null});if(r.error){if(msg)msg.textContent='Gagal: '+r.error.message;return;}if(msg)msg.textContent='Tersimpan';await load();setTimeout(()=>{if(msg)msg.textContent='';},1500);};

  window.sf5CreateTask=async function(userId){const title=prompt('Judul task follow-up:');if(!title)return;const due=prompt('Deadline ISO (opsional), contoh 2026-08-20T10:00:00+07:00:')||null;const owner=prompt('Assign ke advisor (opsional):')||null;const cr=getCreds();const r=await rpc('create_admin_crm_task',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_title:title,p_due_at:due,p_assigned_to:owner});if(r.error)alert('Gagal membuat task: '+r.error.message);else {window.__sf5AllowCustomerOpen=true;await sf5Detail(userId);}};
  window.sf5CompleteTask=async function(taskId){const cr=getCreds();const r=await rpc('complete_admin_crm_task',{p_username:cr.username,p_password_hash:cr.passwordHash,p_task_id:taskId,p_status:'done'});if(r.error)alert('Gagal menyelesaikan task: '+r.error.message);else location.reload();};
  window.sf5AddNote=async function(userId){const note=prompt('Catatan internal:');if(!note)return;const cr=getCreds();const r=await rpc('create_admin_crm_note',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_note:note});if(r.error)alert('Gagal menyimpan catatan: '+r.error.message);else {window.__sf5AllowCustomerOpen=true;await sf5Detail(userId);}};
  window.sf5CreateOpportunity=async function(userId){const name=prompt('Nama opportunity:');if(!name)return;const category=prompt('Kategori solusi (Health / Life / Critical Illness / Retirement / Wealth):')||null;const solution=prompt('Nama solusi / produk (opsional):')||null;const amount=Number(prompt('Nilai opportunity (IDR):','0')||0);const probability=Number(prompt('Probability (%):','50')||0);const stage=prompt('Stage: Discovery / Needs Analysis / Consultation / Solution Recommended / Proposal / Negotiation','Discovery')||'Discovery';const close=prompt('Expected close date YYYY-MM-DD (opsional):')||null;const owner=prompt('Owner / advisor:')||null;const cr=getCreds();const r=await rpc('create_admin_crm_opportunity',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_name:name,p_solution_category:category,p_solution_name:solution,p_amount:amount,p_probability:probability,p_stage:stage,p_expected_close_date:close||null,p_owner:owner});if(r.error)alert('Gagal membuat opportunity: '+r.error.message);else await load();window.__sf5AllowCustomerOpen=true;await sf5Detail(userId);};
  window.sf5OpenOpportunityChooser=function(){const candidate=filtered()[0];if(candidate)sf5CreateOpportunity(candidate.user_id);else alert('Pilih customer terlebih dahulu dari daftar CRM.');};


  window.sf5OpenWorkspace=function(view){window.sf5CloseEnterprise?.();state.view=view;render();document.getElementById('sf5Body')?.scrollIntoView({behavior:'smooth',block:'start'});};
  function sf5EscJSON(v){return esc(JSON.stringify(v||{},null,2));}
  function sf5MountModal(m){
    if(!m) return null;
    // All child modal layers must be siblings of the Customer 360 modal,
    // never descendants of it. This prevents stacking-context bugs.
    if(m.parentElement && m.parentElement!==document.body){
      document.body.appendChild(m);
    } else if(!m.parentElement){
      document.body.appendChild(m);
    }
    return m;
  }

  async function sf5OpenModule(module,userId=null){
    const labels={
      segments:'Segment Intelligence', activities:'Activity Intelligence', interactions:'Interaction Center',
      advisory:'Advisory Requests', tasks:'Tasks & Follow-up', intents:'Intent Signals',
      advisors:'Team & Advisor', products:'Products & Solutions', scoring:'Lead Scoring',
      insights:'AI Insights', reports:'Performance & Reports', settings:'CRM Settings'
    };
    const cr=getCreds();
    const show=(title,subtitle,body,actions='')=>{
      const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';
      m.innerHTML=`<div class="sf5-module-shell sf5-enterprise-module-shell"><header><div><span class="sf5-kicker">SAFE FUTURE INTELLIGENCE</span><h2>${esc(title)}</h2><p>${esc(subtitle||'Operational workspace · production CRM data')}</p></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header><div class="sf5-module-actions">${actions}</div>${body}</div>`;
      sf5MountModal(m); return m;
    };
    const card=(label,value,meta='')=>`<article class="sf5-insight-kpi"><span>${esc(label)}</span><strong>${esc(String(value??0))}</strong><small>${esc(meta)}</small></article>`;
    const safeRows=(rows,keys)=>rows.map(row=>`<tr>${keys.map(k=>`<td>${esc(typeof row[k]==='object'?JSON.stringify(row[k]):String(row[k]??'—'))}</td>`).join('')}</tr>`).join('');

    if(module==='scoring'){
      const rows=[...state.rows].sort((a,b)=>Number(b.lead_score||0)-Number(a.lead_score||0));
      const body=`<div class="sf5-insight-kpis">${rows.slice(0,4).map(r=>card(r.full_name||r.email,r.lead_score,r.intent+' · '+r.stage)).join('')}</div>
      <div class="sf5-module-table"><table><thead><tr><th>Customer</th><th>Score</th><th>Intent</th><th>Stage</th><th>Next Action</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${esc(r.full_name||r.email)}</strong><br><small>${esc(r.email||'')}</small></td><td><b>${esc(r.lead_score||0)}</b></td><td>${esc(r.intent||'LOW')}</td><td>${esc(r.stage||'New')}</td><td>${esc(r.next_action||'Review')}</td><td><button class="sf5-btn sf5-btn-gold sf5-inline-action" onclick="this.closest('.sf5-modal').remove();window.__sf5AllowCustomerOpen=true;sf5Detail('${esc(r.user_id)}')">Customer 360</button></td></tr>`).join('')}</tbody></table></div>`;
      show('Lead Scoring','Prioritas lead berdasarkan diagnosis, intent, activity dan commercial signals.',body);
      return;
    }

    const r=await rpc('get_admin_crm_module_data',{p_username:cr.username,p_password_hash:cr.passwordHash,p_module:module,p_user_id:userId,p_limit:200});
    if(r.error){show(labels[module]||module,'Module error',`<div class="sf5-empty-card">Gagal memuat: ${esc(r.error.message)}</div>`);return;}
    const data=r.data||{}, rows=Array.isArray(data.rows)?data.rows:[];
    let title=labels[module]||module, body='', actions='';

    if(module==='reports'){
      const f=data.funnel||{}, p=data.pipeline||{}, a=data.activity||{}, t=data.tasks||{};
      body=`<div class="sf5-insight-kpis">${card('New',f.new||0,'Leads')}${card('Diagnosed',f.diagnosed||0,'FHC / WPR')}${card('Consultation',f.consultation||0,'Active stage')}${card('Proposal',f.proposal||0,'Commercial stage')}${card('Converted',f.converted||0,'Closed')}${card('Open Pipeline',money(p.open_value||0),'Weighted '+money(p.weighted_value||0))}${card('Activities 7D',a.seven_days||0,'Recent engagement')}${card('Tasks Overdue',t.overdue||0,'Needs action')}</div>
      <div class="sf5-report-visual"><h3>Conversion Funnel</h3>${Object.entries(f).map(([k,v])=>`<div class="sf5-funnel-row"><span>${esc(k)}</span><i><em style="width:${f.new?Math.max(4,Math.round(Number(v)/Number(f.new)*100)):4}%"></em></i><b>${esc(v)}</b></div>`).join('')}</div>`;
      actions=`<button class="sf5-btn sf5-btn-gold" onclick="sf5ExportCRMReport()">Export Report</button>`;
    } else if(module==='segments'){
      const counts={};state.rows.forEach(x=>counts[x.segment||'Unsegmented']=(counts[x.segment||'Unsegmented']||0)+1);
      body=`<div class="sf5-insight-kpis">${Object.entries(counts).map(([k,v])=>card(k,v,'Customers')).join('')}</div><div class="sf5-module-table"><table><thead><tr><th>Segment</th><th>Customer</th><th>High Intent</th><th>Avg Score</th></tr></thead><tbody>${Object.entries(counts).map(([seg,count])=>{const rs=state.rows.filter(x=>(x.segment||'Unsegmented')===seg);const hi=rs.filter(x=>x.intent==='HIGH').length;const avg=Math.round(rs.reduce((a,x)=>a+Number(x.lead_score||0),0)/Math.max(rs.length,1));return `<tr><td><strong>${esc(seg)}</strong></td><td>${count}</td><td>${hi}</td><td>${avg}</td></tr>`}).join('')}</tbody></table></div>`;
    } else if(module==='intents'){
      const counts={HIGH:0,MEDIUM:0,LOW:0};state.rows.forEach(x=>counts[x.intent||'LOW']++);
      body=`<div class="sf5-insight-kpis">${card('HIGH',counts.HIGH,'Priority leads')}${card('MEDIUM',counts.MEDIUM,'Nurture / consult')}${card('LOW',counts.LOW,'Education')}${card('Total',state.rows.length,'Customers')}</div><div class="sf5-module-table"><table><thead><tr><th>Customer</th><th>Intent</th><th>Score</th><th>Next Action</th></tr></thead><tbody>${state.rows.map(x=>`<tr><td>${esc(x.full_name||x.email)}</td><td><b>${esc(x.intent||'LOW')}</b></td><td>${esc(x.lead_score||0)}</td><td>${esc(x.next_action||'—')}</td></tr>`).join('')}</tbody></table></div>`;
    } else if(module==='products'){
      body=`<div class="sf5-products-grid">${rows.map(x=>`<article class="sf5-product-card"><span>${esc(x.provider||'Provider')}</span><h3>${esc(x.product_name||'Product')}</h3><strong>${esc(x.solution_category||'')}</strong><p>${esc(x.approved_summary||'')}</p><div class="sf5-product-actions">${x.product_url?`<a href="${esc(x.product_url)}" target="_blank" rel="noopener">Official page →</a>`:''}<button class="sf5-btn" onclick="sf5OpenProductDetail(${JSON.stringify(x).replace(/'/g,'&#39;')})">Detail</button></div></article>`).join('')||'<div class="sf5-empty-card">Belum ada produk aktif.</div>'}</div>`;
    } else if(module==='advisory'){
      body=`<div class="sf5-module-table"><table><thead><tr><th>Customer</th><th>Subject</th><th>Type</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${safeRows(rows,[...new Set(['full_name','subject','request_type','status','created_at','user_id'])]).replace(/<td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td>/g,(m,a,b,c,d,e,f)=>`<td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td><td>${e}</td><td><button class="sf5-btn" onclick="window.__sf5AllowCustomerOpen=true;sf5Detail('${f}')">Open</button></td>` )}</tbody></table></div>`;
    } else if(module==='tasks'){
      body=`<div class="sf5-module-table"><table><thead><tr><th>Task</th><th>Customer</th><th>Due</th><th>Status</th><th>Assigned</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td><strong>${esc(x.title||'Task')}</strong></td><td>${esc(x.full_name||x.user_id||'—')}</td><td>${esc(x.due_at?date(x.due_at):'No deadline')}</td><td>${esc(x.status||'open')}</td><td>${esc(x.assigned_to||'Unassigned')}</td><td>${x.status==='open'?`<button class="sf5-btn sf5-btn-gold" onclick="sf5CompleteTask('${esc(x.id)}')">Complete</button>`:`—`}</td></tr>`).join('')||'<tr><td colspan="6">Tidak ada task.</td></tr>'}</tbody></table></div>`;
      actions=`<button class="sf5-btn sf5-btn-gold" onclick="sf5CreateGlobalTask()">+ New Task</button>`;
    } else if(module==='activities' || module==='interactions'){
      body=`<div class="sf5-activity-list">${rows.map(x=>`<article class="sf5-activity-item"><div class="sf5-activity-dot"></div><div><strong>${esc(x.event_name||x.subject||x.event_type||'Interaction')}</strong><p>${esc(x.content||x.summary||x.channel||'')}</p><small>${esc(x.full_name||x.user_id||'')} · ${esc(x.occurred_at||x.created_at?date(x.occurred_at||x.created_at):'')}</small></div></article>`).join('')||'<div class="sf5-empty-card">Belum ada activity.</div>'}</div>`;
    } else if(module==='advisors'){
      body=`<div class="sf5-module-table"><table><thead><tr><th>Advisor</th><th>Email</th><th>Open Leads</th><th>Tasks</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.username||x.name||'Administrator')}</td><td>${esc(x.email||'—')}</td><td>${esc(x.open_leads||0)}</td><td>${esc(x.open_tasks||0)}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada advisor.</td></tr>'}</tbody></table></div>`;
      actions=`<button class="sf5-btn sf5-btn-gold" onclick="sf5InviteAdvisor()">+ Tambah Advisor</button>`;
    } else if(module==='insights'){
      body=`<div class="sf5-ai-grid">${rows.map(x=>`<article class="sf5-ai-card"><span>${esc(x.insight_type||'Insight')}</span><h3>${esc(x.title||'AI Insight')}</h3><p>${esc(x.summary||'')}</p><small>Confidence: ${x.confidence!=null?Math.round(Number(x.confidence)*100)+'%':'—'}</small>${x.user_id?`<button class="sf5-btn" onclick="window.__sf5AllowCustomerOpen=true;sf5Detail('${esc(x.user_id)}')">Open Customer</button>`:''}</article>`).join('')||'<div class="sf5-empty-card">Belum ada AI insight.</div>'}</div>`;
      actions=`<button class="sf5-btn sf5-btn-gold" onclick="sf5RunAutomation(this)">Run Intelligence</button>`;
    } else if(module==='settings'){
      const stages=Array.isArray(data.stages)?data.stages:[];
      const oppStages=Array.isArray(data.opportunity_stages)?data.opportunity_stages:[];
      const intentRules=data.intent_rules||{};
      const slaRules=data.sla_rules||{};
      const routing=data.routing_rules||data.lead_routing||{};
      const autoRules=data.automation_rules||data.automation||{};
      const pill=(value,i)=>`<span class="sf5-setting-pill ${i===0?'first':''}">${esc(String(value))}</span>`;
      const ruleRows=(obj,empty='Belum ada aturan')=>Object.entries(obj||{}).map(([k,v])=>`<div class="sf5-setting-rule"><strong>${esc(String(k))}</strong><span>${esc(typeof v==='object'?JSON.stringify(v):String(v))}</span></div>`).join('')||`<div class="sf5-empty-card">${empty}</div>`;
      body=`
        <div class="sf5-settings-intro">
          <div><span class="sf5-kicker">CRM GOVERNANCE</span><h3>Bagaimana CRM Safe Future bekerja</h3><p>Halaman ini berisi aturan operasional yang menentukan lifecycle lead, prioritas intent, SLA, routing dan automation. Anda tidak perlu membaca JSON atau kode.</p></div>
          <div class="sf5-settings-status"><b>Production</b><span>Aturan aktif pada CRM</span></div>
        </div>
        <div class="sf5-settings-grid-v2">
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">01</span><h3>Lead Lifecycle</h3><p>Tahapan perjalanan lead dari masuk sampai menjadi klien.</p></div></div><div class="sf5-setting-flow">${stages.map((x,i)=>`${pill(x,i)}${i<stages.length-1?'<i>→</i>':''}`).join('')||'—'}</div></article>
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">02</span><h3>Opportunity Lifecycle</h3><p>Tahapan peluang penjualan dari discovery sampai won/lost.</p></div></div><div class="sf5-setting-flow">${oppStages.map((x,i)=>`${pill(x,i)}${i<oppStages.length-1?'<i>→</i>':''}`).join('')||'—'}</div></article>
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">03</span><h3>Intent & Lead Scoring</h3><p>Aturan yang menentukan apakah lead perlu diprioritaskan.</p></div></div><div class="sf5-setting-rule-list">${ruleRows(intentRules)}</div></article>
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">04</span><h3>SLA & Follow-up</h3><p>Batas waktu respons berdasarkan tingkat urgensi lead.</p></div></div><div class="sf5-setting-rule-list">${ruleRows(slaRules)}</div></article>
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">05</span><h3>Lead Routing</h3><p>Aturan penugasan lead kepada advisor/team.</p></div></div><div class="sf5-setting-rule-list">${ruleRows(routing,'Routing belum dikonfigurasi.')}</div></article>
          <article class="sf5-settings-card"><div class="sf5-settings-card-head"><div><span class="sf5-settings-icon">06</span><h3>Automation Rules</h3><p>Trigger otomatis yang menggerakkan follow-up dan workflow.</p></div></div><div class="sf5-setting-rule-list">${ruleRows(autoRules,'Automation rule belum dikonfigurasi.')}</div></article>
        </div>
        <div class="sf5-settings-note"><strong>Prinsip:</strong> ubah aturan hanya jika Anda memang ingin mengubah cara CRM memprioritaskan, menugaskan atau menindaklanjuti lead. Setiap perubahan produksi sebaiknya diuji setelah disimpan.</div>`;
      actions=`<button class="sf5-btn sf5-btn-gold" onclick="sf5ShowSettingsEditor()">⚙ Edit Workflow Rules</button><button class="sf5-btn" onclick="this.closest('.sf5-modal').remove()">Tutup</button>`;
        } else if(module==='pipeline' || module==='opportunities'){
      const items=module==='opportunities'?state.opps:state.rows.map(x=>({user_id:x.user_id,customer_name:x.full_name,stage:x.stage||'New',intent:x.intent,lead_score:x.lead_score,next_action:x.next_action}));
      const grouped={}; items.forEach(x=>{const st=x.stage||'New';(grouped[st] ||= []).push(x);});
      const stages=module==='pipeline'?['New','Diagnosed','Qualified','Advisor Contacted','Consultation','Solution Recommended','Proposal','Nurture','Converted']:['Discovery','Needs Analysis','Consultation','Solution Recommended','Proposal','Application','Payment Pending','Won','Lost'];
      body=`<div class="sf5-pipeline-grid">${stages.map(st=>{const its=grouped[st]||[];return `<section class="sf5-pipeline-col"><header><div><b>${esc(st)}</b><span>${its.length} ${module==='pipeline'?'lead':'opportunity'}${its.length===1?'':'s'}</span></div></header>${its.map(x=>`<button class="sf5-pipeline-card" onclick="this.closest('.sf5-modal').remove();window.__sf5AllowCustomerOpen=true;sf5Detail('${esc(x.user_id||x.customer_id||'')}')"><strong>${esc(x.customer_name||x.customer?.full_name||x.full_name||'Customer')}</strong><span>${esc(x.name||x.solution_name||x.intent||'Review')}</span><small>${x.lead_score!=null?'Score '+esc(x.lead_score):x.amount!=null?money(x.amount):esc(x.next_action||'Next action not set')}</small></button>`).join('')||'<div class="sf5-empty-card">No records</div>'}</section>`}).join('')}</div>`;
} else {
      const keys=rows.length?Object.keys(rows[0]).filter(k=>!['metadata','payload','context','suitability_rules'].includes(k)).slice(0,8):[];
      body=`<div class="sf5-module-table"><table><thead><tr>${keys.map(k=>`<th>${esc(k.replaceAll('_',' '))}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${keys.map(k=>`<td>${esc(typeof row[k]==='object'?JSON.stringify(row[k]):String(row[k]??'—'))}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="8">Belum ada data.</td></tr>'}</tbody></table></div>`;
    }
    show(title,'Operational workspace · real production data',body,actions);
  }
  window.sf5OpenModule=sf5OpenModule;
  function showAdminResult(title,body){
    const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';
    m.innerHTML=`<div class="sf5-module-shell"><header><div><span class="sf5-kicker">SAFE FUTURE</span><h2>${esc(title)}</h2></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header><div class="sf5-success-card">${body}</div><div class="sf5-module-actions"><button class="sf5-btn sf5-btn-gold" onclick="this.closest('.sf5-modal').remove()">Selesai</button></div></div>`;
    sf5MountModal(m);
  }
window.sf5OpenProductDetail=function(product){
    const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';m.innerHTML=`<div class="sf5-module-shell"><header><div><span class="sf5-kicker">APPROVED PRODUCT</span><h2>${esc(product.product_name||'Product')}</h2><p>${esc(product.provider||'')} · ${esc(product.solution_category||'')}</p></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header><div class="sf5-product-detail"><div><span>Status</span><b>${esc(product.status||'active')}</b></div><div><span>Product Code</span><b>${esc(product.product_code||'—')}</b></div><article><h3>Approved Summary</h3><p>${esc(product.approved_summary||'—')}</p></article><article><h3>Suitability Rules</h3><pre>${esc(JSON.stringify(product.suitability_rules||{},null,2))}</pre></article></div></div>`;sf5MountModal(m);
  };
  window.sf5CreateGlobalTask=function(){
    const id=state.rows[0]?.user_id;
    if(id) sf5CreateTask(id); else alert('Belum ada customer untuk dikaitkan dengan task.');
  };
  window.sf5InviteAdvisor=async function(){
    const name=prompt('Nama advisor:'); if(!name)return;
    const email=prompt('Email advisor:'); if(!email)return;
    const role=prompt('Role (Advisor / Manager / Admin):','Advisor')||'Advisor';
    const cr=getCreds();
    const r=await rpc('create_admin_advisor_invite',{p_username:cr.username,p_password_hash:cr.passwordHash,p_name:name,p_email:email,p_role:role});
    if(r.error){alert('Gagal membuat invitation: '+r.error.message);return;}
    const d=r.data||{};
    showAdminResult('Advisor Invitation Created',`Invite untuk ${esc(name)} sudah tercatat sebagai ${esc(role)}. Status: ${esc(d.status||'pending')}.<br><small>Email delivery akan memakai provider resmi setelah channel email dikonfigurasi.</small>`);
  };
  window.sf5ExportCRMReport=function(){const rows=state.rows||[];const csv=['Name,Email,Score,Intent,Stage,Next Action',...rows.map(x=>[x.full_name,x.email,x.lead_score,x.intent,x.stage,x.next_action].map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='safe-future-crm-report.csv';a.click();URL.revokeObjectURL(a.href);};
  window.sf5ShowSettingsEditor=async function(){
    const cr=getCreds();
    const r=await rpc('get_admin_crm_settings_v1',{p_username:cr.username,p_password_hash:cr.passwordHash});
    if(r.error){alert('Gagal memuat settings: '+r.error.message);return;}
    const settings=r.data||[];
    const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';
    m.innerHTML=`<div class="sf5-module-shell"><header><div><span class="sf5-kicker">CRM GOVERNANCE</span><h2>Workflow Settings</h2><p>Aturan produksi yang memengaruhi lead routing, SLA, dan lifecycle. Setiap perubahan dicatat.</p></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header>
    <div class="sf5-settings-editor">${settings.map(x=>`<label><span>${esc((x.setting_key||'Setting').replaceAll('_',' '))}<small>Edit advanced rule configuration</small></span><textarea data-setting="${esc(x.setting_key)}">${esc(JSON.stringify(x.setting_json||{},null,2))}</textarea></label>`).join('')}</div>
    <div class="sf5-module-actions"><button class="sf5-btn sf5-btn-gold" onclick="sf5SaveSettings(this)">Simpan Perubahan</button><button class="sf5-btn" onclick="this.closest('.sf5-modal').remove()">Tutup</button></div></div>`;
    sf5MountModal(m);
  };
  window.sf5SaveSettings=async function(btn){
    const modal=btn.closest('.sf5-modal'); const cr=getCreds();
    const fields=[...modal.querySelectorAll('textarea[data-setting]')];
    for(const field of fields){
      let value; try{value=JSON.parse(field.value);}catch(e){alert('JSON tidak valid pada '+field.dataset.setting);return;}
      const r=await rpc('update_admin_crm_setting_v1',{p_username:cr.username,p_password_hash:cr.passwordHash,p_setting_key:field.dataset.setting,p_setting_json:value});
      if(r.error){alert('Gagal menyimpan '+field.dataset.setting+': '+r.error.message);return;}
    }
    btn.textContent='Tersimpan ✓'; setTimeout(()=>btn.textContent='Simpan Perubahan',1500);
  };

  window.sf5OpenModule=sf5OpenModule;
  window.sf5OpenDocuments=async function(userId){
    const payload=await sf5DetailPayload(userId);if(!payload)return;const p=payload.profile||{};const fhc=payload.latest_fhc||{};const wpr=payload.latest_wpr||{};
    const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';m.innerHTML=`<div class="sf5-module-shell"><header><div><span class="sf5-kicker">CUSTOMER DOCUMENT CENTER</span><h2>Documents</h2><p>${esc(p.full_name||'Customer')} · centralized advisory evidence and product references</p></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header><div class="sf5-doc-grid"><article><span>Financial Health Check</span><strong>${fhc.id?'Completed':'Not available'}</strong><small>${fhc.submitted_at?date(fhc.submitted_at):'—'}</small></article><article><span>Wealth & Protection Review</span><strong>${wpr.id?'Completed':'Not started'}</strong><small>${wpr.completed_at?date(wpr.completed_at):'—'}</small></article><article><span>Consent record</span><strong>${payload.consents?.length?'Available':'Review required'}</strong><small>${payload.consents?.length||0} consent records</small></article><article><span>Product references</span><strong>Approved catalog</strong><small>Official product pages and approved summaries</small></article></div><div class="sf5-doc-actions"><button class="sf5-btn sf5-btn-gold" onclick="sf5GenerateCustomerReport('${esc(p.user_id)}')">Generate Customer 360 Report</button><button class="sf5-btn" onclick="sf5OpenModule('products','${esc(p.user_id)}')">Open Approved Products</button></div><div class="sf5-disclaimer-small">Dokumen insurer, e-sign, dan application packet hanya muncul setelah official document/e-sign integration dikonfigurasi.</div></div>`;sf5MountModal(m);
  };
  window.sf5CustomerTab=function(view,userId){const root=document.querySelector('.sf5-enterprise-modal');if(!root)return;const map={diagnosis:'.sf5-enterprise-diagnosis',pipeline:'.sf5-opportunity-summary',timeline:'.sf5-enterprise-timeline',tasks:'.sf5-task-rows',notes:'.sf5-enterprise-notes',ai:'.sf5-next-best'};if(view==='documents'){sf5OpenDocuments(userId);return;}const target=root.querySelector(map[view]||'.sf5-enterprise-content');target?.scrollIntoView({behavior:'smooth',block:'start'});root.querySelectorAll('.sf5-enterprise-tabs button').forEach(b=>b.classList.toggle('active',b.textContent.trim().toLowerCase().includes(view)||view==='360'&&b.textContent.includes('Customer 360')));};
  window.sf5ExecuteNextBestAction=async function(userId){
    const row=state.rows.find(x=>x.user_id===userId)||{};
    const next=String(row.next_action||'').toLowerCase();
    if(next.includes('advisory')||next.includes('consult')){
      const cr=getCreds();
      const r=await rpc('create_admin_advisory_opportunity',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_subject:'Financial Advisory Consultation',p_request_type:'Financial Planning',p_priority:row.intent==='HIGH'?'HIGH':'MEDIUM',p_notes:'Created from Customer 360 Next Best Action'});
      if(r.error){alert(r.error.message);return;}
      alert('Advisory action dibuat dan masuk ke CRM queue.');
      window.__sf5AllowCustomerOpen=true; return sf5Detail(userId);
    }
    if(next.includes('follow')||next.includes('contact')) return sf5CreateTask(userId);
    if(next.includes('diagnos')||next.includes('review')) return sf5CustomerTab('diagnosis',userId);
    return sf5OpenActions(userId);
  };
  window.sf5OpenActions=function(userId){const m=document.createElement('div');m.className='sf5-modal sf5-action-modal';m.innerHTML=`<div class="sf5-action-shell"><div class="sf5-module-kicker">CUSTOMER ACTIONS</div><h2>Quick Actions</h2><button onclick="this.closest('.sf5-modal').remove();sf5CreateTask('${userId}')">＋ Create Task</button><button onclick="this.closest('.sf5-modal').remove();sf5AddNote('${userId}')">＋ Add Internal Note</button><button onclick="this.closest('.sf5-modal').remove();sf5CreateOpportunity('${userId}')">＋ Create Opportunity</button><button onclick="this.closest('.sf5-modal').remove();sf5AddTouchpoint('${userId}')">＋ Log Interaction</button><button onclick="this.closest('.sf5-modal').remove();sf5ChangeStage('${userId}')">⇄ Change Stage</button><button onclick="this.closest('.sf5-modal').remove();sf5GenerateFollowUp('${userId}')">✦ Draft Follow-up</button><button onclick="this.closest('.sf5-modal').remove();sf5GenerateCustomerReport('${userId}')">▣ Customer 360 Excel Report</button><button onclick="this.closest('.sf5-modal').remove()">Cancel</button></div>`;sf5MountModal(m);};
  window.sf5AddTouchpoint=async function(userId){const channel=prompt('Channel: WhatsApp / Email / Call / Meeting','WhatsApp')||'WhatsApp';const direction=prompt('Direction: inbound / outbound','outbound')||'outbound';const subject=prompt('Subject','Follow-up')||'Follow-up';const summary=prompt('Ringkasan interaksi:')||'';const cr=getCreds();const r=await rpc('add_admin_crm_touchpoint',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_channel:channel,p_direction:direction,p_subject:subject,p_summary:summary,p_occurred_at:new Date().toISOString()});if(r.error)alert(r.error.message);else sf5Detail(userId);};
  window.sf5ChangeStage=async function(userId){const stage=prompt('Stage baru: New / Diagnosed / Qualified / Solution Recommended / Advisor Contacted / Consultation / Proposal / Converted / Nurture','Advisor Contacted');if(!stage)return;const cr=getCreds();const r=await rpc('update_admin_crm_lead',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_stage:stage,p_next_action:null,p_assigned_to:null,p_note:'Stage updated from CRM quick action'});if(r.error)alert(r.error.message);else {await load();window.__sf5AllowCustomerOpen=true;sf5Detail(userId);}};
  window.sf5GenerateFollowUp=function(userId){const row=state.rows.find(x=>x.user_id===userId)||{};const text=`Halo ${row.full_name||''}, berdasarkan hasil Financial Health Check Anda, ada beberapa hal yang layak kita review bersama. Saya siap membantu menjelaskan prioritas dan langkah berikutnya tanpa kewajiban membeli produk.`;const m=document.createElement('div');m.className='sf5-modal sf5-module-modal';m.innerHTML=`<div class="sf5-module-shell"><header><div><span class="sf5-kicker">COMMUNICATION COPILOT</span><h2>Draft Follow-up</h2></div><button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button></header><textarea class="sf5-followup-text">${esc(text)}</textarea><div class="sf5-module-actions"><button class="sf5-btn sf5-btn-gold" onclick="navigator.clipboard?.writeText(this.closest('.sf5-module-shell').querySelector('textarea').value);this.textContent='Copied ✓'">Copy</button><button class="sf5-btn" onclick="this.closest('.sf5-modal').remove()">Close</button></div></div>`;sf5MountModal(m);};
  window.sf5GenerateCustomerReport=async function(userId){
    const payload=await sf5DetailPayload(userId); if(!payload)return;
    const p=payload.profile||{}, fp=payload.financial_profile||{}, fhc=payload.latest_fhc||{}, wpr=payload.latest_wpr||{};
    const goals=payload.goals||[], advisory=payload.advisory_requests||[], activity=payload.activity||[], notes=payload.notes||[], tasks=payload.tasks||[], opps=payload.opportunities||[], touchpoints=payload.touchpoints||[], insights=payload.ai_insights||[], history=payload.stage_history||[];
    const cards=normalizedCards(fhc);
    const score=Number(fhc.overall_score??p.fhc_score??0);
    const income=Number(fp.monthly_income||0), expense=Number(fp.monthly_expense||0);
    const cashflow=income-expense;
    const liquid=Number(fp.liquid_assets||0), debt=Number(fp.total_debt||0);
    const liquidity=expense?liquid/expense:null;
    const dti=income?debt/(income*12):null;
    const protection=wpr.protection_gap!=null?Number(wpr.protection_gap):Number(p.protection_gap||0);
    const retirement=wpr.retirement_gap!=null?Number(wpr.retirement_gap):Number(p.retirement_gap||0);
    const highRisk=[];
    if(cashflow<0) highRisk.push('Cash flow bulanan negatif.');
    if(liquidity!==null && liquidity<3) highRisk.push('Emergency fund/liquidity di bawah 3 bulan.');
    if(protection>0) highRisk.push('Protection gap masih terbuka.');
    if(retirement>0) highRisk.push('Retirement gap masih terbuka.');
    const priority=cards.slice(0,3).map((x,i)=>({Priority:`P${i+1}`,Diagnosis:x.title||'Prioritas',Strategy:x.strategy||'',Recommended_Solution:x.product||''}));
    const nextActions=[];
    if(advisory.length) nextActions.push(['HIGH','Follow up advisory request','Hubungi customer maksimal 24 jam dan konfirmasi kebutuhan konsultasi.']);
    if(protection>0) nextActions.push(['HIGH','Review protection gap','Bahas kebutuhan perlindungan berdasarkan gap dan affordability; jangan langsung hard-sell.']);
    if(cashflow>0) nextActions.push(['MEDIUM','Review cash-flow allocation','Tetapkan batas premi/komitmen yang sehat terhadap cash flow.']);
    if(!nextActions.length) nextActions.push(['MEDIUM','Complete customer review','Lengkapi data yang masih kosong sebelum membuat recommendation.']);
    const conclusions=[
      `Lead ${p.full_name||'Customer'} saat ini berada pada stage ${p.stage||'New'} dengan intent ${p.intent||'LOW'} dan lead score ${p.lead_score??score}.`,
      `FHC score ${score||'—'}/100 menunjukkan kondisi yang perlu ditinjau lebih lanjut sebelum keputusan solusi.`,
      protection>0?`Protection gap teridentifikasi sebesar ${money(protection)}.`:'Tidak ada protection gap yang terukur pada data saat ini.',
      retirement>0?`Retirement gap teridentifikasi sebesar ${money(retirement)}.`:'Tidak ada retirement gap yang terukur pada data saat ini.',
      `Rekomendasi utama adalah memprioritaskan ${nextActions[0][1].toLowerCase()} dan menghindari rekomendasi produk tanpa suitability review.`
    ];
    if(!window.XLSX){alert('Excel engine belum tersedia. Refresh halaman lalu coba lagi.');return;}
    const wb=XLSX.utils.book_new();
    const add=(name,rows,widths)=>{
      const ws=XLSX.utils.aoa_to_sheet(rows);
      ws['!cols']=widths.map(w=>({wch:w}));
      XLSX.utils.book_append_sheet(wb,ws,name);
      return ws;
    };
    const moneyCell=v=>v==null?'—':Number(v);
    const dash=[
      ['SAFE FUTURE — CUSTOMER 360 DECISION REPORT'],
      ['Generated',new Date().toLocaleString('id-ID')],
      [],
      ['CUSTOMER PROFILE','VALUE'],
      ['Name',p.full_name||'—'],['Email',p.email||'—'],['WhatsApp',p.phone||'—'],['Segment',p.segment||'—'],['Occupation',p.occupation||'—'],['Location',p.city||'—'],['Stage',p.stage||'—'],['Intent',p.intent||'—'],['Lead Score',Number(p.lead_score||0)],
      [],
      ['EXECUTIVE KPI','VALUE','INTERPRETATION'],
      ['FHC Score',score,'Financial Health Check score'],
      ['Monthly Income',moneyCell(income),'Income reported by customer'],
      ['Monthly Expense',moneyCell(expense),'Essential/monthly expense reported'],
      ['Monthly Cash Flow',moneyCell(cashflow),cashflow>=0?'Positive':'Negative'],
      ['Liquidity Ratio',liquidity==null?'—':liquidity.toFixed(2),liquidity!=null&&liquidity>=3?'Healthy':'Needs review'],
      ['Debt to Income',dti==null?'—':(dti*100).toFixed(0)+'%',dti!=null&&dti<=0.35?'Within reference range':'Needs review'],
      ['Protection Gap',moneyCell(protection),protection>0?'Action required':'No measured gap'],
      ['Retirement Gap',moneyCell(retirement),retirement>0?'Action required':'No measured gap'],
      [],
      ['EXECUTIVE CONCLUSION'],
      ...conclusions.map(x=>[x]),
      [],
      ['NEXT BEST ACTION','PRIORITY','RECOMMENDED ACTION'],
      ...nextActions.map(x=>[x[1],x[0],x[2]])
    ];
    add('Decision Dashboard',dash,[28,30,56]);
    add('Financial Analysis',[
      ['METRIC','VALUE','ASSESSMENT'],
      ['Monthly Income',moneyCell(income),''],['Monthly Expense',moneyCell(expense),''],['Monthly Cash Flow',moneyCell(cashflow),cashflow>=0?'Positive':'Negative'],
      ['Liquid Assets',moneyCell(liquid),''],['Emergency Fund (months)',liquidity==null?'—':liquidity.toFixed(1),liquidity!=null&&liquidity>=3?'Healthy':'Low'],
      ['Total Debt',moneyCell(debt),''],['Debt to Income',dti==null?'—':(dti*100).toFixed(0)+'%',dti!=null&&dti<=0.35?'Moderate':'High'],
      ['Protection Gap',moneyCell(protection),protection>0?'High priority':'—'],['Retirement Gap',moneyCell(retirement),retirement>0?'Review':'—']
    ],[30,24,38]);
    add('Diagnosis',[
      ['PRIORITY','DIAGNOSIS','STRATEGY','RECOMMENDED SOLUTION'],
      ...priority.map(x=>[x.Priority,x.Diagnosis,x.Strategy,x.Recommended_Solution])
    ],[12,30,70,42]);
    add('Pipeline',[
      ['OPPORTUNITY','SOLUTION','STAGE','AMOUNT','PROBABILITY','WEIGHTED VALUE'],
      ...opps.map(o=>[o.name||'—',o.solution_name||o.solution_category||'—',o.stage||'Discovery',Number(o.amount||0),Number(o.probability||0),Number(o.amount||0)*Number(o.probability||0)/100]),
      [],
      ['TOTAL','','',opps.reduce((a,o)=>a+Number(o.amount||0),0),'',opps.reduce((a,o)=>a+Number(o.amount||0)*Number(o.probability||0)/100,0)]
    ],[34,36,24,18,16,22]);
    add('Engagement & Tasks',[
      ['TYPE','TITLE / EVENT','DATE','STATUS / CHANNEL'],
      ...tasks.map(t=>['Task',t.title||'—',t.due_at?date(t.due_at):'—',t.status||'open']),
      ...touchpoints.map(t=>['Interaction',t.subject||t.event_type||'—',t.occurred_at?date(t.occurred_at):'—',t.channel||'—']),
      ...activity.map(a=>['Activity',a.event_name||a.event_type||'—',a.created_at?date(a.created_at):'—','Activity'])
    ],[18,50,28,24]);
    add('Recommendations',[
      ['PRIORITY','ACTION','WHY IT MATTERS'],
      ...nextActions.map(x=>[x[0],x[1],x[2]]),
      [],
      ['KEY RISKS','',''],
      ...highRisk.map(x=>['RISK',x,''])
    ],[16,34,80]);
    add('Profile & Goals',[
      ['FIELD','VALUE'],
      ['Name',p.full_name||'—'],['Email',p.email||'—'],['WhatsApp',p.phone||'—'],['Date of Birth',p.date_of_birth||'—'],
      ['Marital Status',p.marital_status||fp.marital_status||'—'],['Dependents',p.dependents_count??'—'],['Source',p.source||'Website'],['Consent',payload.consents?.length?'Approved':'Review'],
      [],
      ['GOAL','DETAIL'],
      ...goals.map(g=>[g.title||g.goal_name||'Goal',g.description||g.target_amount||'—'])
    ],[28,72]);
    add('Stage History',[
      ['DATE','FROM','TO','REASON'],
      ...history.map(h=>[h.changed_at?date(h.changed_at):'—',h.old_stage||'—',h.new_stage||'—',h.reason||''])
    ],[28,28,28,60]);
    // Basic number formatting for money columns.
    for(const sname of ['Decision Dashboard','Financial Analysis','Pipeline']){
      const ws=wb.Sheets[sname];
      if(!ws) continue;
      Object.keys(ws).forEach(addr=>{if(/^[A-Z]+[0-9]+$/.test(addr)&&typeof ws[addr].v==='number'&&addr!=='A1') ws[addr].z='#,##0';});
    }
    const safe=(p.full_name||'customer').toLowerCase().replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'');
    XLSX.writeFile(wb,`Safe-Future-Customer-360-${safe||'report'}.xlsx`);
  };
window.sf5EditCustomer=async function(userId){const r=await sf5DetailPayload(userId);if(!r)return;const p=r.profile||{};const full=prompt('Nama lengkap:',p.full_name||'');if(full===null)return;const phone=prompt('WhatsApp:',p.phone||'')||null;const city=prompt('Kota:',p.city||'')||null;const occupation=prompt('Pekerjaan:',p.occupation||'')||null;const marital=prompt('Status pernikahan:',p.marital_status||'')||null;const dob=prompt('Tanggal lahir YYYY-MM-DD:',p.date_of_birth||'')||null;const cr=getCreds();const x=await rpc('update_admin_profile',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId,p_full_name:full,p_phone:phone,p_city:city,p_occupation:occupation,p_marital_status:marital,p_date_of_birth:dob});if(x.error)alert(x.error.message);else {await load();window.__sf5AllowCustomerOpen=true;sf5Detail(userId);}};
  async function sf5DetailPayload(userId){const cr=getCreds();const r=await rpc('get_admin_crm_user_detail_v3',{p_username:cr.username,p_password_hash:cr.passwordHash,p_user_id:userId});if(r.error){alert(r.error.message);return null;}return r.data?.[0]?.payload||r.data?.payload||null;}
  async function load(){shell();const status=document.getElementById('sf5SyncStatus');try{const sync=await window.sf5SyncCustomer?.();if(status)status.textContent=sync?'CRM tersinkron':'CRM ready';}catch(e){}const auth=await crmAuth();if(!auth.user){state.rows=[];render();if(status)status.textContent='CRM membutuhkan admin session';return;}const cr=getCreds();const [list,dash,opps]=await Promise.all([rpc('get_admin_crm_users',{p_username:cr.username,p_password_hash:cr.passwordHash,p_limit:500}),rpc('get_admin_crm_dashboard',{p_username:cr.username,p_password_hash:cr.passwordHash}),rpc('get_admin_crm_opportunities',{p_username:cr.username,p_password_hash:cr.passwordHash,p_status:'open'})]);if(list.error){const el=document.getElementById('adminDataStatus');if(el)el.textContent='CRM belum dapat dimuat: '+list.error.message;return;}state.rows=Array.isArray(list.data)?list.data:[];state.dash=dash.error?{}:dash.data||{};state.opps=Array.isArray(opps.data)?opps.data:[];render();
    // v95: landing state is always the Command Center. Customer 360 is only
    // reached by an explicit customer-selection action.
    state.selected = null;

  }

  window.sf5RefreshCRM=load;

  async function sf5OpenAutomation(){
    const c=supa(); if(!c?.rpc)return;
    const cr=getCreds();
    const r=await c.rpc('get_admin_crm_automation_dashboard',{p_username:cr.username,p_password_hash:cr.passwordHash});
    const products=await c.rpc('get_admin_product_catalog',{p_username:cr.username,p_password_hash:cr.passwordHash});
    if(r.error){alert('Automation Center: '+r.error.message);return;}
    const d=r.data||{};
    const catalog=Array.isArray(products.data)?products.data:[];
    const m=document.createElement('div');
    m.className='sf5-modal sf5-automation-modal';
    m.innerHTML=`
      <div class="sf5-automation-shell">
        <header class="sf5-automation-header">
          <div><span class="sf5-kicker">SAFE FUTURE OPERATING SYSTEM</span><h2>Automation Center</h2><p>Lead → Diagnosis → Advisory → Opportunity → Application → Policy → Revenue → Retention</p></div>
          <button class="sf5-close-btn" onclick="this.closest('.sf5-modal').remove()">×</button>
        </header>
        <section class="sf5-auto-flow">
          <div><b>01</b><span>Acquire</span><small>Login · FHC · WPR · Referral</small></div>
          <i>→</i><div><b>02</b><span>Diagnose</span><small>Score · Gap · Intent</small></div>
          <i>→</i><div><b>03</b><span>Advise</span><small>Recommendation · Consultation</small></div>
          <i>→</i><div><b>04</b><span>Convert</span><small>Opportunity · Application</small></div>
          <i>→</i><div><b>05</b><span>Retain</span><small>Policy · Renewal · Referral</small></div>
        </section>
        <section class="sf5-auto-grid">
          <article><span>Queued Events</span><strong>${d.queued_events||0}</strong><small>Waiting for workflow engine</small></article>
          <article><span>Completed Automations</span><strong>${d.completed_events||0}</strong><small>Processed successfully</small></article>
          <article><span>Messages Queued</span><strong>${d.queued_messages||0}</strong><small>Ready for approved channel provider</small></article>
          <article><span>Open Applications</span><strong>${d.open_applications||0}</strong><small>Suitability / underwriting / payment</small></article>
          <article><span>Underwriting</span><strong>${d.underwriting||0}</strong><small>Pending provider process</small></article>
          <article><span>Payment Pending</span><strong>${d.payment_pending||0}</strong><small>Awaiting authorized payment flow</small></article>
          <article><span>Active Policies</span><strong>${d.active_policies||0}</strong><small>Policy lifecycle</small></article>
          <article><span>Expected Revenue</span><strong>${money(d.expected_revenue||0)}</strong><small>Tracked pipeline revenue</small></article>
        </section>
        <section class="sf5-auto-columns">
          <div class="sf5-auto-panel">
            <div class="sf5-auto-panel-head"><div><span class="sf5-kicker">WORKFLOW ENGINE</span><h3>Automations aktif</h3></div><button class="sf5-btn sf5-btn-gold" onclick="sf5RunAutomation(this)">Run now</button></div>
            <div class="sf5-auto-workflows">
              <div><b>FHC_COMPLETED</b><span>Generate advisor task + follow-up message</span><em>24h SLA</em></div>
              <div><b>ADVISORY_REQUESTED</b><span>Create consultation opportunity + task + acknowledgement</span><em>24h SLA</em></div>
              <div><b>OPPORTUNITY_PROGRESS</b><span>Create next closing action</span><em>24h SLA</em></div>
              <div><b>APPLICATION</b><span>Suitability → underwriting → payment → policy lifecycle</span><em>Human approval gate</em></div>
              <div><b>RENEWAL</b><span>Future policy review & retention workflow</span><em>Planned</em></div>
            </div>
          </div>
          <div class="sf5-auto-panel">
            <div class="sf5-auto-panel-head"><div><span class="sf5-kicker">APPROVED PRODUCT CATALOG</span><h3>Manulife Solutions</h3></div></div>
            <div class="sf5-auto-products">${catalog.map(p=>`<div><strong>${esc(p.product_name)}</strong><span>${esc(p.solution_category)}</span><small>${esc(p.approved_summary||'')}</small></div>`).join('')||'<div class="sf5-empty-card">Belum ada produk aktif.</div>'}</div>
          </div>
        </section>
        <footer class="sf5-auto-footer">
          <span>✓ Event-driven · Idempotent · Retry / dead-letter · Audit-ready</span>
          <span>Human approval required before binding, underwriting decision or policy issuance.</span>
        </footer>
      </div>`;
    sf5MountModal(m);
  }
  window.sf5OpenAutomation=sf5OpenAutomation;

  async function sf5RunAutomation(btn){
    const c=supa(); if(!c?.rpc)return;
    const cr=getCreds(); btn.disabled=true; btn.textContent='Processing…';
    const r=await c.rpc('process_crm_automation_admin',{p_username:cr.username,p_password_hash:cr.passwordHash,p_limit:100});
    btn.disabled=false; btn.textContent='Run now';
    if(r.error){alert('Automation error: '+r.error.message);return;}
    alert('Automation selesai. '+JSON.stringify(r.data));
    document.querySelector('.sf5-automation-modal')?.remove();
    sf5OpenAutomation();
  }
  window.sf5RunAutomation=sf5RunAutomation;

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const c=supa();if(c?.auth)c.auth.onAuthStateChange((_e,s)=>{if(s?.session?.user){window.sf5SyncCustomer?.();if(!document.getElementById('sf5CrmPanel'))shell();}});shell();if(!document.getElementById('adminPanel')?.classList.contains('hidden'))load();},800));
})();

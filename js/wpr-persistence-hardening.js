/* Safe Future — Final Assessment Persistence / History / Reports Controller
 * Production-grade client layer for authenticated assessment history and reports.
 */
(function(){
  'use strict';
  const c=()=>window.supabaseClient;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const date=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  const money=v=>v==null||v===''?'—':'Rp '+Number(v||0).toLocaleString('id-ID');
  const text=v=>{if(v==null)return '';if(typeof v==='string'){try{const j=JSON.parse(v);return j?.title||j?.label||j?.strategy||j?.text||v}catch{}return v}return v?.title||v?.label||v?.strategy||v?.text||JSON.stringify(v)};
  let state={fhc:[],wpr:[],reports:[],loaded:false,busy:false};

  async function user(){try{return(await c()?.auth?.getUser())?.data?.user||null}catch{return null}}
  function normalizeFhc(subs,scores){
    const by=new Map((scores||[]).map(x=>[String(x.fhc_id),x]));
    return (Array.isArray(subs)?subs:[]).map(s=>({...s,...(by.get(String(s.id))||{}),overall_score:s.overall_score??by.get(String(s.id))?.overall_score??null}));
  }
  function normalizeWpr(subs,results){
    const by=new Map((results||[]).map(x=>[String(x.wpr_id),x]));
    return (Array.isArray(subs)?subs:[]).map(s=>{const r=by.get(String(s.id))||s.wpr_results?.[0]||s.wpr_results||{};return {...s,...r,wpr_results:Object.keys(r||{}).length?[r]:[]}});
  }
  async function directRead(cl,u){
    const [fh,wpr,rep]=await Promise.all([
      cl.from('fhc_submissions').select('id,status,version,submitted_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      cl.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      cl.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30)
    ]);
    if(fh.error||wpr.error||rep.error) throw fh.error||wpr.error||rep.error;
    const fids=(fh.data||[]).map(x=>x.id), wids=(wpr.data||[]).map(x=>x.id);
    const [fs,ws]=await Promise.all([
      fids.length?cl.from('fhc_scores').select('fhc_id,overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at').in('fhc_id',fids):Promise.resolve({data:[],error:null}),
      wids.length?cl.from('wpr_results').select('wpr_id,id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json,created_at').in('wpr_id',wids):Promise.resolve({data:[],error:null})
    ]);
    if(fs.error||ws.error) throw fs.error||ws.error;
    return {fhc:normalizeFhc(fh.data,fs.data),wpr:normalizeWpr(wpr.data,ws.data),reports:rep.data||[]};
  }
  async function rpcRead(cl){
    const r=await cl.rpc('get_my_assessment_history');
    if(r.error) throw r.error;
    const d=r.data||{};
    return {fhc:Array.isArray(d.fhc)?d.fhc:[],wpr:Array.isArray(d.wpr)?d.wpr:[],reports:Array.isArray(d.reports)?d.reports:[]};
  }
  async function load(){
    if(state.busy)return state;
    const cl=c(),u=await user(); if(!cl||!u)return state;
    state.busy=true;
    try{
      let d={fhc:[],wpr:[],reports:[]};
      try{d=await directRead(cl,u)}catch(e){console.warn('Safe Future assessment direct read:',e)}
      try{const r=await rpcRead(cl);if(!d.fhc.length)d.fhc=r.fhc;if(!d.wpr.length)d.wpr=r.wpr;if(!d.reports.length)d.reports=r.reports}catch(e){console.warn('Safe Future assessment RPC read:',e)}
      state={...state,...d,loaded:true,lastLoadedAt:Date.now()};
      render();
    }finally{state.busy=false}
    return state;
  }
  function virtualReports(){
    const out=[...(state.reports||[])],keys=new Set(out.map(r=>String((r.report_type||'').toUpperCase())+'|'+String(r.source_id||'')));
    (state.fhc||[]).forEach(r=>{const k='FHC|'+r.id;if(!keys.has(k))out.push({id:'virtual-fhc-'+r.id,report_type:'FHC',source_id:r.id,status:'ready',generated_at:r.calculated_at||r.created_at})});
    (state.wpr||[]).forEach(r=>{const k='WPR|'+r.id;if(!keys.has(k))out.push({id:'virtual-wpr-'+r.id,report_type:'WPR',source_id:r.id,status:'ready',generated_at:r.completed_at||r.submitted_at||r.created_at})});
    return out.sort((a,b)=>new Date(b.generated_at||b.created_at||0)-new Date(a.generated_at||a.created_at||0));
  }
  function hist(type,r,i){const score=r.overall_score;const when=type==='FHC'?(r.submitted_at||r.created_at):(r.completed_at||r.submitted_at||r.created_at);return `<div class="sf-final-history-row"><div><b>${type} ${i?'Riwayat':'Terbaru'}</b><small>${date(when)} · ${esc(r.status||'completed')}</small></div><div class="sf-final-history-actions"><strong>${score==null?'—':Math.round(Number(score))+' / 100'}</strong><button type="button" data-sf-final-view="${esc(type)}" data-id="${esc(r.id)}">Lihat hasil</button></div></div>`}
  function renderHistory(){
    const f=state.fhc||[],w=state.wpr||[];
    ['sfP3FhcHistory','sf4FhcHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=f.length?f.map((r,i)=>hist('FHC',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>'});
    ['sfP3WprHistory','sf4WprHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=w.length?w.map((r,i)=>hist('WPR',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>'});
  }
  function renderReports(){
    const rows=virtualReports();
    const html=rows.length?rows.map(r=>`<div class="sf-final-report-row"><div><b>${esc(String(r.report_type||'REPORT').toUpperCase())}</b><small>${date(r.generated_at||r.created_at)} · ${r.storage_path?'File tersimpan':'Report tersedia'}</small></div><div class="sf-final-report-actions"><button type="button" data-sf-final-report-view="${esc(r.id)}">Lihat</button><button type="button" data-sf-final-report-download="${esc(r.id)}">Download PDF</button></div></div>`).join(''):'<div class="sf4-empty">Belum ada laporan atau hasil assessment tersimpan.</div>';
    ['sf4Reports','sfDashReports'].forEach(id=>{const e=$(id);if(e)e.innerHTML=html});
  }
  function vm(type,src){
    if(type==='FHC')return {title:'Financial Health Check™',score:src.overall_score,date:src.calculated_at||src.submitted_at||src.created_at,rows:[['Cash Flow',src.cashflow_score],['Debt',src.debt_score],['Emergency Fund',src.emergency_score],['Protection',src.protection_score],['Retirement',src.retirement_score],['Assets',src.asset_score],['Goals',src.goals_score]],priorities:[src.priority_1,src.priority_2,src.priority_3].filter(Boolean).map(text)};
    const r=Array.isArray(src.wpr_results)?src.wpr_results[0]:src.wpr_results||src;const a=r.analysis_json||{};return {title:'Wealth & Protection Review™',score:r.overall_score,date:src.completed_at||src.submitted_at||src.created_at,rows:[['Net Worth',money(r.net_worth)],['Protection Need',money(r.protection_need)],['Protection Gap',money(r.protection_gap)],['Critical Illness Gap',money(r.critical_illness_gap)],['Retirement Gap',money(r.retirement_gap)],['Liquidity Score',r.liquidity_score],['Protection Score',r.protection_score],['Retirement Score',r.retirement_score],['Wealth Score',r.wealth_score]],priorities:[r.priority_1,r.priority_2,r.priority_3].filter(Boolean).map(text),observation:text(a.observation||src.observation)};
  }
  function openReport(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));if(!src)return;const d=vm(type,src);
    const rows=d.rows.map(x=>`<div><span>${esc(x[0])}</span><strong>${esc(x[1]==null?'—':String(x[1]))}${typeof x[1]==='number'&&/score/i.test(x[0])?' / 100':''}</strong></div>`).join('');
    const pri=d.priorities?.length?`<section><h3>Prioritas</h3><ol>${d.priorities.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>`:'';
    const obs=d.observation?`<section><h3>Key Observation</h3><p>${esc(d.observation)}</p></section>`:'';
    const m=document.createElement('div');m.className='sf-final-modal';m.innerHTML=`<div class="sf-final-backdrop"><article><header><div><small>SAFE FUTURE · PERSONAL REPORT</small><h2>${esc(d.title)}</h2></div><button type="button" data-close>×</button></header><main><div class="sf-final-score"><span>Score</span><strong>${esc(d.score==null?'—':String(Math.round(Number(d.score))))}</strong><small>/ 100</small></div><p>${date(d.date)}</p><section><h3>Ringkasan</h3><div class="sf-final-grid">${rows}</div></section>${pri}${obs}<p class="sf-final-disclaimer">Hasil ini merupakan estimasi berdasarkan data yang Anda masukkan dan bukan nasihat keuangan personal.</p></main><footer><button type="button" data-download data-type="${type}" data-id="${esc(id)}">Download PDF</button><button type="button" data-close>Tutup</button></footer></article></div>`;
    document.body.appendChild(m);m.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>m.remove());m.querySelector('[data-download]')?.addEventListener('click',()=>downloadPdf(type,id));
  }
  function loadPdf(){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve(window.jspdf.jsPDF);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error('jsPDF unavailable'));s.onerror=()=>reject(new Error('jsPDF unavailable'));document.head.appendChild(s)})}
  async function downloadPdf(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));if(!src)return;const d=vm(type,src);
    try{const PDF=await loadPdf(),pdf=new PDF({unit:'mm',format:'a4'});pdf.setTextColor(11,27,51);pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.text('Safe Future',20,22);pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.text(d.title,20,31);pdf.setFontSize(9);pdf.text('Tanggal: '+date(d.date),20,38);pdf.setFont('helvetica','bold');pdf.setFontSize(28);pdf.text((d.score==null?'—':Math.round(Number(d.score)))+' / 100',20,53);let y=66;pdf.setFontSize(10);d.rows.forEach(([k,v])=>{if(y>270){pdf.addPage();y=22}pdf.setFont('helvetica','normal');pdf.text(String(k),20,y);pdf.setFont('helvetica','bold');pdf.text(String(v==null?'—':v)+(typeof v==='number'&&/score/i.test(k)?' / 100':''),150,y);y+=7});if(d.priorities?.length){y+=4;pdf.setFont('helvetica','bold');pdf.text('Prioritas',20,y);y+=7;pdf.setFont('helvetica','normal');d.priorities.forEach(x=>{if(y>270){pdf.addPage();y=22}pdf.text('• '+String(x).slice(0,100),22,y);y+=6})}pdf.setFontSize(7);pdf.text('Estimasi berbasis data pengguna. Bukan nasihat keuangan personal.',20,287);pdf.save('Safe-Future-'+type+'-'+new Date().toISOString().slice(0,10)+'.pdf')}catch(e){console.warn('Report PDF:',e);window.print()}}
  function injectStyles(){if($('sf-final-layer-css'))return;const s=document.createElement('style');s.id='sf-final-layer-css';s.textContent=`
    .sf-final-history-row,.sf-final-report-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #edf1f5}.sf-final-history-row small,.sf-final-report-row small{display:block;color:#94a3b8;margin-top:4px;font-size:10px}.sf-final-history-actions,.sf-final-report-actions{display:flex;align-items:center;gap:8px}.sf-final-history-actions button,.sf-final-report-actions button{border:1px solid #d7e0ea;background:#fff;color:#0b1b33;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer}.sf-final-modal{position:fixed;inset:0;z-index:100000}.sf-final-backdrop{position:absolute;inset:0;background:rgba(3,10,20,.72);display:flex;align-items:center;justify-content:center;padding:18px}.sf-final-backdrop article{width:min(760px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;color:#0b1b33;box-shadow:0 30px 90px rgba(0,0,0,.35)}.sf-final-backdrop header{display:flex;justify-content:space-between;padding:24px;border-bottom:1px solid #e7edf4}.sf-final-backdrop header small{font-size:10px;color:#9a7b10;font-weight:700;letter-spacing:.12em}.sf-final-backdrop header h2{margin:7px 0 0;font-size:22px}.sf-final-backdrop header button{border:0;background:transparent;font-size:28px;cursor:pointer}.sf-final-backdrop main{padding:24px}.sf-final-score{display:flex;align-items:baseline;gap:7px;margin-bottom:16px}.sf-final-score span{color:#64748b;font-size:12px}.sf-final-score strong{font-size:42px}.sf-final-score small{color:#64748b}.sf-final-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e7edf4;border-radius:10px;overflow:hidden}.sf-final-grid>div{display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #edf1f5}.sf-final-grid>div:nth-child(odd){border-right:1px solid #edf1f5}.sf-final-backdrop section h3{font-size:14px;margin:18px 0 8px}.sf-final-disclaimer{font-size:10px;color:#94a3b8;line-height:1.5;margin-top:18px}.sf-final-backdrop footer{display:flex;justify-content:flex-end;gap:8px;padding:16px 24px;border-top:1px solid #e7edf4}.sf-final-backdrop footer button{border:1px solid #d7e0ea;background:#0b1b33;color:#fff;border-radius:7px;padding:9px 13px;font-size:11px;font-weight:700;cursor:pointer}@media(max-width:640px){.sf-final-history-row,.sf-final-report-row{align-items:flex-start}.sf-final-history-actions,.sf-final-report-actions{flex-wrap:wrap;justify-content:flex-end}.sf-final-grid{grid-template-columns:1fr}.sf-final-grid>div:nth-child(odd){border-right:0}}
    `;document.head.appendChild(s)}
  function renderAll(){renderHistory();renderReports();document.querySelectorAll('[data-sf-final-view]').forEach(b=>b.onclick=()=>openReport(b.dataset.sfFinalView,b.dataset.id));document.querySelectorAll('[data-sf-final-report-view]').forEach(b=>{b.onclick=()=>{const r=virtualReports().find(x=>String(x.id)===String(b.dataset.sfFinalReportView));if(r)openReport(String(r.report_type).toUpperCase(),r.source_id)}});document.querySelectorAll('[data-sf-final-report-download]').forEach(b=>{b.onclick=()=>{const r=virtualReports().find(x=>String(x.id)===String(b.dataset.sfFinalReportDownload));if(r)downloadPdf(String(r.report_type).toUpperCase(),r.source_id)}})}
  window.sfRefreshAssessmentHistory=()=>load();
  window.sfGetAssessmentState=()=>({...state});
  function bind(){
    injectStyles();
    c()?.auth?.onAuthStateChange?.(()=>setTimeout(load,350));
    const obs=new MutationObserver(()=>{if($('sfP3FhcHistory')||$('sf4FhcHistory')||$('sf4Reports'))load()});obs.observe(document.body,{childList:true,subtree:true});
    [200,900,2000,5000].forEach(ms=>setTimeout(load,ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
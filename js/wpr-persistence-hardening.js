/* Safe Future — Final Assessment Persistence / History / Reports Layer
 * Production fix: FHC/WPR history must be visible after authentication and
 * Reports must be actionable even when no storage_path exists.
 */
(function(){
  'use strict';
  const client=()=>window.supabaseClient;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtDate=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  const money=v=>v==null||v===''?'—':'Rp '+Number(v||0).toLocaleString('id-ID');
  let state={fhc:[],wpr:[],reports:[]};

  async function user(){try{return(await client()?.auth?.getUser())?.data?.user||null}catch{return null}}
  const normFhc=a=>(Array.isArray(a)?a:[]).map(r=>{const s=Array.isArray(r?.fhc_scores)?(r.fhc_scores[0]||{}):(r?.fhc_scores||{});return {...r,overall_score:r?.overall_score??s.overall_score??null,cashflow_score:r?.cashflow_score??s.cashflow_score??null,debt_score:r?.debt_score??s.debt_score??null,emergency_score:r?.emergency_score??s.emergency_score??null,protection_score:r?.protection_score??s.protection_score??null,retirement_score:r?.retirement_score??s.retirement_score??null,asset_score:r?.asset_score??s.asset_score??null,goals_score:r?.goals_score??s.goals_score??null,priority_1:r?.priority_1??s.priority_1??null,priority_2:r?.priority_2??s.priority_2??null,priority_3:r?.priority_3??s.priority_3??null};}).filter(r=>r?.id);
  const normWpr=a=>(Array.isArray(a)?a:[]).map(r=>{const w=Array.isArray(r?.wpr_results)?(r.wpr_results[0]||{}):(r?.wpr_results||{});return {...r,overall_score:r?.overall_score??w.overall_score??null,wpr_results:Object.keys(w).length?[w]:[]};}).filter(r=>r?.id);

  async function load(){
    const c=client(),u=await user(); if(!c||!u)return;
    let fhc=[],wpr=[],reports=[];
    try{
      const [a,b,d]=await Promise.all([
        c.from('fhc_submissions').select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
        c.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
        c.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30)
      ]);
      fhc=normFhc(a.data);wpr=normWpr(b.data);reports=d.data||[];
    }catch(e){console.warn('Final assessment direct read',e)}

    try{
      const r=await c.rpc('get_my_assessment_history');
      if(!r.error&&r.data){if(!fhc.length)fhc=normFhc(r.data.fhc);if(!wpr.length)wpr=normWpr(r.data.wpr);if(!reports.length)reports=Array.isArray(r.data.reports)?r.data.reports:[];}
    }catch(e){console.warn('Final assessment RPC',e)}

    state={fhc,wpr,reports};
    render();
  }

  function row(type,r,i){
    const score=r.overall_score;
    const when=type==='FHC'?(r.submitted_at||r.created_at):(r.completed_at||r.submitted_at||r.created_at);
    return '<div class="sf-final-history-row"><div><b>'+type+' '+(i?'Riwayat':'Terbaru')+'</b><small>'+fmtDate(when)+' · '+esc(r.status||'completed')+'</small></div><div class="sf-final-history-actions"><strong>'+((score==null||score==='')?'—':Math.round(Number(score))+' / 100')+'</strong><button type="button" data-sf-final-view="'+type+'" data-id="'+esc(r.id)+'">Lihat hasil</button></div></div>';
  }

  function renderHistory(){
    const fhc=state.fhc,wpr=state.wpr;
    ['sfP3FhcHistory','sf4FhcHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=fhc.length?fhc.map((r,i)=>row('FHC',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>';});
    ['sfP3WprHistory','sf4WprHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=wpr.length?wpr.map((r,i)=>row('WPR',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>';});
  }

  function source(report){
    if(String(report.report_type).toUpperCase()==='FHC')return state.fhc.find(x=>String(x.id)===String(report.source_id))||state.fhc[0]||null;
    if(String(report.report_type).toUpperCase()==='WPR')return state.wpr.find(x=>String(x.id)===String(report.source_id))||state.wpr[0]||null;
    return null;
  }
  function reportRows(){
    const r=[...state.reports];
    const keys=new Set(r.map(x=>String(x.report_type).toUpperCase()+'|'+String(x.source_id)));
    state.fhc.forEach(x=>{const k='FHC|'+x.id;if(!keys.has(k))r.push({id:'virtual-fhc-'+x.id,report_type:'FHC',source_id:x.id,status:'ready',generated_at:x.created_at||x.submitted_at});});
    state.wpr.forEach(x=>{const k='WPR|'+x.id;if(!keys.has(k))r.push({id:'virtual-wpr-'+x.id,report_type:'WPR',source_id:x.id,status:'ready',generated_at:x.completed_at||x.submitted_at||x.created_at});});
    return r.sort((a,b)=>new Date(b.generated_at||b.created_at||0)-new Date(a.generated_at||a.created_at||0);
  }

  function renderReports(){
    const rows=reportRows();
    const html=rows.length?rows.map(r=>'<div class="sf-final-report-row"><div><b>'+esc(String(r.report_type||'Report').toUpperCase())+'</b><small>'+fmtDate(r.generated_at||r.created_at)+' · Tersedia</small></div><div class="sf-final-report-actions"><button type="button" data-sf-final-report-view="'+esc(r.id)+'">Lihat</button><button type="button" data-sf-final-report-download="'+esc(r.id)+'">Download PDF</button></div></div>').join(''):'<div class="sf4-empty">Belum ada laporan atau hasil assessment tersimpan.</div>';
    ['sf4Reports','sfDashReports'].forEach(id=>{const e=$(id);if(e)e.innerHTML=html;});
  }

  function summary(type,src){
    if(type==='FHC'){
      const s=src||{};
      return {title:'Financial Health Check™',score:s.overall_score,date:s.submitted_at||s.created_at,rows:[['Cash Flow',s.cashflow_score],['Debt',s.debt_score],['Emergency Fund',s.emergency_score],['Protection',s.protection_score],['Retirement',s.retirement_score],['Assets',s.asset_score],['Goals',s.goals_score]],priorities:[s.priority_1,s.priority_2,s.priority_3].filter(Boolean),observation:''};
    }
    const r=src?.wpr_results?.[0]||src||{};const a=r.analysis_json||{};
    return {title:'Wealth & Protection Review™',score:r.overall_score,date:src?.completed_at||src?.submitted_at||src?.created_at,rows:[['Net Worth',money(r.net_worth)],['Protection Need',money(r.protection_need)],['Protection Gap',money(r.protection_gap)],['Critical Illness Gap',money(r.critical_illness_gap)],['Retirement Gap',money(r.retirement_gap)],['Liquidity Score',r.liquidity_score],['Protection Score',r.protection_score],['Retirement Score',r.retirement_score],['Wealth Score',r.wealth_score]],priorities:[r.priority_1,r.priority_2,r.priority_3].filter(Boolean),observation:typeof a.observation==='string'?a.observation:''};
  }

  function open(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));if(!src)return;
    const d=summary(type,src);
    const rows=d.rows.map(x=>'<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1]==null?'—':String(x[1]))+(typeof x[1]==='number'&&/score/i.test(x[0])?' / 100':'')+'</strong></div>').join('');
    const pri=d.priorities.length?'<section><h3>Prioritas</h3><ol>'+d.priorities.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>':'';
    const obs=d.observation?'<section><h3>Key Observation</h3><p>'+esc(d.observation.replace(/<[^>]*>/g,''))+'</p></section>':'';
    const m=document.createElement('div');m.className='sf-final-modal';m.innerHTML='<div class="sf-final-backdrop"><article><header><div><small>SAFE FUTURE · PERSONAL REPORT</small><h2>'+esc(d.title)+'</h2></div><button type="button" data-close>×</button></header><main><div class="sf-final-score"><span>Score</span><strong>'+esc(d.score==null?'—':String(Math.round(Number(d.score))))+'</strong><small>/ 100</small></div><p>'+fmtDate(d.date)+'</p><section><h3>Ringkasan</h3><div class="sf-final-grid">'+rows+'</div></section>'+pri+obs+'<p class="sf-final-disclaimer">Hasil ini merupakan estimasi berbasis data yang Anda masukkan dan bukan nasihat keuangan personal.</p></main><footer><button type="button" data-download>Download PDF</button><button type="button" data-close>Tutup</button></footer></article></div>';
    document.body.appendChild(m);
    m.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>m.remove());
    m.querySelector('[data-download]').onclick=()=>download(type,id);
  }

  function loadPdf(){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve(window.jspdf.jsPDF);const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error('jsPDF unavailable'));s.onerror=()=>reject(new Error('jsPDF unavailable'));document.head.appendChild(s);});}
  async function download(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));if(!src)return;
    const d=summary(type,src);try{const JsPDF=await loadPdf(),pdf=new JsPDF({unit:'mm',format:'a4'});pdf.setTextColor(11,17,32);pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.text('Safe Future',20,22);pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.text(d.title,20,31);pdf.setFontSize(9);pdf.text('Tanggal: '+fmtDate(d.date),20,38);pdf.setFont('helvetica','bold');pdf.setFontSize(28);pdf.text((d.score==null?'—':Math.round(Number(d.score)))+' / 100',20,53);let y=66;pdf.setFontSize(10);d.rows.forEach(([k,v])=>{if(y>270){pdf.addPage();y=22;}pdf.setFont('helvetica','normal');pdf.text(String(k),20,y);pdf.setFont('helvetica','bold');pdf.text(String(v==null?'—':v)+(typeof v==='number'&&/score/i.test(k)?' / 100':''),150,y);y+=7;});if(d.priorities.length){y+=4;pdf.setFont('helvetica','bold');pdf.text('Prioritas',20,y);y+=7;pdf.setFont('helvetica','normal');d.priorities.forEach(x=>{pdf.text('• '+String(x).slice(0,95),22,y);y+=6;});}pdf.setFontSize(7);pdf.text('Estimasi berbasis data pengguna. Bukan nasihat keuangan personal.',20,287);pdf.save('Safe-Future-'+type+'-'+new Date().toISOString().slice(0,10)+'.pdf');}catch(e){console.warn('PDF',e);window.print();}}

  function injectStyles(){if($('sf-final-layer-css'))return;const s=document.createElement('style');s.id='sf-final-layer-css';s.textContent=`
    .sf-final-history-row,.sf-final-report-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #edf1f5}.sf-final-history-row:last-child,.sf-final-report-row:last-child{border-bottom:0}.sf-final-history-row small,.sf-final-report-row small{display:block;color:#94a3b8;margin-top:4px;font-size:10px}.sf-final-history-actions,.sf-final-report-actions{display:flex;align-items:center;gap:8px}.sf-final-history-actions button,.sf-final-report-actions button{border:1px solid #d7e0ea;background:#fff;color:#0b1b33;border-radius:7px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer}.sf-final-history-actions button:hover,.sf-final-report-actions button:hover{background:#f6f8fb}.sf-final-modal{position:fixed;inset:0;z-index:100000}.sf-final-backdrop{position:absolute;inset:0;background:rgba(3,10,20,.72);display:flex;align-items:center;justify-content:center;padding:18px}.sf-final-backdrop article{width:min(760px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;color:#0b1b33;box-shadow:0 30px 90px rgba(0,0,0,.35)}.sf-final-backdrop header{display:flex;justify-content:space-between;padding:24px;border-bottom:1px solid #e7edf4}.sf-final-backdrop header small{font-size:10px;color:#9a7b10;font-weight:700;letter-spacing:.12em}.sf-final-backdrop header h2{margin:7px 0 0;font-size:22px}.sf-final-backdrop header button{border:0;background:transparent;font-size:28px;cursor:pointer}.sf-final-backdrop main{padding:24px}.sf-final-score{display:flex;align-items:baseline;gap:7px;margin-bottom:16px}.sf-final-score span{color:#64748b;font-size:12px}.sf-final-score strong{font-size:42px}.sf-final-score small{color:#64748b}.sf-final-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e7edf4;border-radius:10px;overflow:hidden}.sf-final-grid>div{display:flex;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #edf1f5}.sf-final-grid>div:nth-child(odd){border-right:1px solid #edf1f5}.sf-final-backdrop section h3{font-size:14px;margin:18px 0 8px}.sf-final-disclaimer{font-size:10px;color:#94a3b8;line-height:1.5;margin-top:18px}.sf-final-backdrop footer{display:flex;justify-content:flex-end;gap:8px;padding:16px 24px;border-top:1px solid #e7edf4}.sf-final-backdrop footer button{border:1px solid #d7e0ea;background:#fff;color:#0b1b33;padding:9px 13px;border-radius:8px;font-weight:700}.sf-final-backdrop footer button:first-child{background:#0b1b33;color:#fff}@media(max-width:600px){.sf-final-history-row,.sf-final-report-row{align-items:flex-start;flex-direction:column}.sf-final-history-actions,.sf-final-report-actions{width:100%;justify-content:flex-end}.sf-final-grid{grid-template-columns:1fr}.sf-final-grid>div:nth-child(odd){border-right:0}}
  `;document.head.appendChild(s)}

  document.addEventListener('click',e=>{
    const v=e.target.closest('[data-sf-final-view]');if(v)open(v.dataset.sfFinalView,v.dataset.id);
    const rv=e.target.closest('[data-sf-final-report-view]');if(rv){const r=reportRows().find(x=>String(x.id)===String(rv.dataset.sfFinalReportView));const src=source(r);if(r&&src)open(String(r.report_type).toUpperCase(),src.id);}
    const rd=e.target.closest('[data-sf-final-report-download]');if(rd){const r=reportRows().find(x=>String(x.id)===String(rd.dataset.sfFinalReportDownload));const src=source(r);if(r&&src)download(String(r.report_type).toUpperCase(),src.id);}
  });

  function render(){injectStyles();renderHistory();renderReports()}
  window.sfFinalAssessmentRefresh=load;
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(load,700);try{client()?.auth?.onAuthStateChange((_e,s)=>{if(s?.user){setTimeout(load,300);setTimeout(load,1600)}})}catch{}});
})();
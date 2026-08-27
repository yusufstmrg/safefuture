/* Safe Future Production Hardening — v2026-08-27
 * Root-cause fixes for persistent customer history and actionable reports.
 * Uses authenticated, owner-scoped Supabase queries; no service credentials.
 */
(function(){
  'use strict';
  const c=()=>window.supabaseClient;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtDate=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  const money=v=>v==null||v===''?'—':'Rp '+Number(v).toLocaleString('id-ID');
  const user=async()=>{try{return(await c()?.auth?.getUser())?.data?.user||null}catch{return null}};

  let state={fhc:[],wpr:[],reports:[],loadedAt:null};

  async function loadOwnerData(){
    const u=await user(); if(!u||!c()) return null;
    const client=c();
    const [fhc,wpr,reports]=await Promise.all([
      client.from('fhc_submissions').select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20)
    ]);
    if(fhc.error) console.warn('Production hardening FHC history:',fhc.error);
    if(wpr.error) console.warn('Production hardening WPR history:',wpr.error);
    if(reports.error) console.warn('Production hardening reports:',reports.error);
    state={fhc:fhc.data||[],wpr:wpr.data||[],reports:reports.data||[],loadedAt:new Date()};
    return state;
  }

  function scoreOfFhc(r){return r?.fhc_scores?.[0]?.overall_score??null}
  function scoreOfWpr(r){return r?.wpr_results?.[0]?.overall_score??null}

  function historyRow(type,r,i){
    const score=type==='FHC'?scoreOfFhc(r):scoreOfWpr(r);
    const when=type==='FHC'?(r.submitted_at||r.created_at):(r.completed_at||r.submitted_at||r.created_at);
    const id=r.id;
    return '<div class="sf4-history sf-prod-history-row">'+
      '<div><b>'+type+' '+(i===0?'Terbaru':'Riwayat')+'</b><small>'+fmtDate(when)+' · '+esc(r.status||'completed')+'</small></div>'+
      '<div class="sf-prod-history-actions"><strong>'+ (score!=null?Math.round(Number(score))+' / 100':'—') +'</strong>'+
      '<button type="button" onclick="window.sfProductionViewAssessment(\''+type+'\',\''+esc(id)+'\')">Lihat hasil</button></div></div>';
  }

  function renderHistory(){
    const fhc=state.fhc,wpr=state.wpr;
    const a=document.getElementById('sf4FhcHistory'),b=document.getElementById('sf4WprHistory');
    if(a)a.innerHTML=fhc.length?fhc.map((r,i)=>historyRow('FHC',r,i)).join(''):'<div class="sf4-empty">Belum ada FHC tersimpan.</div>';
    if(b)b.innerHTML=wpr.length?wpr.map((r,i)=>historyRow('WPR',r,i)).join(''):'<div class="sf4-empty">Belum ada WPR tersimpan. Jika Anda baru menyelesaikannya, muat ulang setelah login.</div>';
    const p3a=document.getElementById('sfP3FhcHistory'),p3b=document.getElementById('sfP3WprHistory');
    if(p3a)p3a.innerHTML=fhc.length?fhc.map((r,i)=>historyRow('FHC',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>';
    if(p3b)p3b.innerHTML=wpr.length?wpr.map((r,i)=>historyRow('WPR',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>';
  }

  function reportSource(r){
    if(r.report_type==='FHC') return state.fhc.find(x=>String(x.id)===String(r.source_id))||state.fhc[0]||null;
    if(r.report_type==='WPR') return state.wpr.find(x=>String(x.id)===String(r.source_id))||state.wpr[0]||null;
    return null;
  }

  function renderReports(){
    const html=state.reports.length?state.reports.map(r=>{
      const src=reportSource(r), ready=String(r.status||'').toLowerCase()==='ready';
      const rid=esc(r.id);
      return '<div class="sf4-history sf-prod-report-row"><div><b>'+esc(r.report_type||'Report')+'</b><small>'+fmtDate(r.generated_at||r.created_at)+' · '+esc(r.status||'ready')+'</small></div>'+
        '<div class="sf-prod-report-actions">'+
        '<button type="button" onclick="window.sfProductionViewReport(\''+rid+'\')">Lihat</button>'+
        '<button type="button" '+(!src?'disabled':'')+' onclick="window.sfProductionDownloadReport(\''+rid+'\')">Download PDF</button>'+
        '</div></div>';
    }).join(''):'<div class="sf4-empty">Belum ada laporan tersimpan.</div>';
    ['sf4Reports','sfDashReports'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=html});
  }

  function modal(title,body,actions){
    document.getElementById('sf-prod-report-modal')?.remove();
    const m=document.createElement('div');m.id='sf-prod-report-modal';
    m.innerHTML='<div class="sf-prod-report-backdrop"><div class="sf-prod-report-dialog" role="dialog" aria-modal="true"><header><div><span>SAFE FUTURE · PERSONAL REPORT</span><h2>'+esc(title)+'</h2></div><button type="button" aria-label="Tutup" onclick="this.closest(\'#sf-prod-report-modal\').remove()">×</button></header><div class="sf-prod-report-body">'+body+'</div><footer>'+actions+'<button type="button" onclick="this.closest(\'#sf-prod-report-modal\').remove()">Tutup</button></footer></div></div>';
    document.body.appendChild(m);
  }

  function reportData(type,src){
    if(type==='FHC'){
      const s=src?.fhc_scores?.[0]||{};
      return {title:'Financial Health Check™',date:src?.submitted_at||src?.created_at,score:s.overall_score,rows:[
        ['Cash Flow',s.cashflow_score],['Debt',s.debt_score],['Emergency Fund',s.emergency_score],['Protection',s.protection_score],['Retirement',s.retirement_score],['Assets',s.asset_score],['Goals',s.goals_score]
      ],priorities:[s.priority_1,s.priority_2,s.priority_3].filter(Boolean)};
    }
    const r=src?.wpr_results?.[0]||{};
    const analysis=r.analysis_json||{};
    return {title:'Wealth & Protection Review™',date:src?.completed_at||src?.submitted_at||src?.created_at,score:r.overall_score,rows:[
      ['Net Worth',money(r.net_worth)],['Protection Need',money(r.protection_need)],['Protection Gap',money(r.protection_gap)],['Critical Illness Gap',money(r.critical_illness_gap)],['Retirement Gap',money(r.retirement_gap)],['Liquidity Score',r.liquidity_score],['Protection Score',r.protection_score],['Retirement Score',r.retirement_score],['Wealth Score',r.wealth_score]
    ],priorities:[r.priority_1,r.priority_2,r.priority_3].filter(Boolean),observation:analysis.observation||''};
  }

  async function showAssessment(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));
    if(!src)return;
    const d=reportData(type,src);
    const rows=d.rows.map(x=>'<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1]==null?'—':String(x[1]))+(typeof x[1]==='number'&&x[0].toLowerCase().includes('score')?' / 100':'')+'</strong></div>').join('');
    const obs=d.observation?'<section><h3>Key Observation</h3><p>'+esc(d.observation.replace(/<[^>]*>/g,''))+'</p></section>':'';
    const pri=d.priorities.length?'<section><h3>Prioritas</h3><ol>'+d.priorities.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>':'';
    const body='<div class="sf-prod-score"><span>Score</span><strong>'+esc(d.score==null?'—':String(Math.round(Number(d.score))))+'</strong><small>/ 100</small></div><section><h3>Ringkasan</h3><div class="sf-prod-report-grid">'+rows+'</div></section>'+pri+obs+'<p class="sf-prod-disclaimer">Hasil ini merupakan estimasi berbasis data yang Anda masukkan dan bukan nasihat keuangan personal, hukum, pajak, atau rekomendasi produk.</p>';
    modal(d.title,body,'<button type="button" onclick="window.sfProductionDownloadAssessment(\''+type+'\',\''+esc(id)+'\')">Download PDF</button>');
  }

  function ensureJsPdf(){
    return new Promise((resolve,reject)=>{
      if(window.jspdf?.jsPDF)return resolve(window.jspdf.jsPDF);
      const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error('PDF library unavailable'));s.onerror=()=>reject(new Error('PDF library unavailable'));document.head.appendChild(s);
    });
  }

  async function downloadAssessment(type,id){
    const src=(type==='FHC'?state.fhc:state.wpr).find(x=>String(x.id)===String(id));if(!src)return;
    const d=reportData(type,src), JsPDF=await ensureJsPdf(),pdf=new JsPDF({unit:'mm',format:'a4'});
    pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.text('Safe Future',20,22);
    pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.text(d.title,20,31);
    pdf.setFontSize(9);pdf.text('Tanggal: '+fmtDate(d.date),20,38);
    pdf.setFont('helvetica','bold');pdf.setFontSize(28);pdf.text(String(d.score==null?'—':Math.round(Number(d.score)))+' / 100',20,53);
    let y=66;pdf.setFontSize(10);
    d.rows.forEach(([k,v])=>{pdf.setFont('helvetica','normal');pdf.text(String(k),20,y);pdf.setFont('helvetica','bold');pdf.text(String(v==null?'—':v)+(typeof v==='number'&&k.toLowerCase().includes('score')?' / 100':''),150,y);y+=7;if(y>270){pdf.addPage();y=22;}});
    if(d.priorities.length){y+=4;pdf.setFont('helvetica','bold');pdf.text('Prioritas',20,y);y+=7;pdf.setFont('helvetica','normal');d.priorities.forEach(x=>{pdf.text('• '+String(x).slice(0,95),22,y);y+=6;if(y>270){pdf.addPage();y=22;}})}
    if(d.observation){y+=4;pdf.setFont('helvetica','bold');pdf.text('Key Observation',20,y);y+=7;pdf.setFont('helvetica','normal');const lines=pdf.splitTextToSize(String(d.observation.replace(/<[^>]*>/g,'')),165);pdf.text(lines,20,y);y+=lines.length*5;}
    pdf.setFontSize(7);pdf.text('Estimasi berbasis data pengguna. Bukan nasihat keuangan personal, hukum, pajak, atau rekomendasi produk.',20,287);
    pdf.save('Safe-Future-'+type+'-'+new Date().toISOString().slice(0,10)+'.pdf');
  }

  async function viewReport(id){
    const r=state.reports.find(x=>String(x.id)===String(id));if(!r)return;
    const src=reportSource(r);
    if(!src){modal(r.report_type||'Report','<p>Data sumber laporan belum tersedia. Silakan jalankan assessment kembali untuk membuat laporan baru.</p>','');return;}
    showAssessment(r.report_type,src.id);
  }

  window.sfProductionViewAssessment=showAssessment;
  window.sfProductionDownloadAssessment=downloadAssessment;
  window.sfProductionViewReport=viewReport;
  window.sfProductionDownloadReport=async id=>{const r=state.reports.find(x=>String(x.id)===String(id));if(r){const src=reportSource(r);if(src)await downloadAssessment(r.report_type,src.id);}};
  window.sfProductionRefresh=async()=>{await loadOwnerData();renderHistory();renderReports();};

  async function boot(){
    try{
      const u=await user();if(!u)return;
      await loadOwnerData();
      /* Recover legacy WPR saved in the authenticated browser, if available. */
      try{if(!state.wpr.length&&window.sfBackfillLegacyWpr){await window.sfBackfillLegacyWpr();await new Promise(r=>setTimeout(r,350));await loadOwnerData();}}catch(e){console.warn('Legacy WPR recovery:',e)}
      renderHistory();renderReports();
    }catch(e){console.warn('Safe Future production hardening:',e)}
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));
  const wait=setInterval(async()=>{if(window.supabaseClient){clearInterval(wait);await boot()}},500);
  window.addEventListener('sf:dashboard-opened',()=>boot());
  const observer=new MutationObserver(()=>{if(document.getElementById('sf4Reports')||document.getElementById('sf4FhcHistory')){renderHistory();renderReports()}});
  observer.observe(document.body,{childList:true,subtree:true});
})();

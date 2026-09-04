/* Safe Future — Production Final Hardening
 * User workspace reports + CRM Customer 360 mobile lifecycle.
 * Additive, defensive layer: does not replace core assessment/CRM engines.
 */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const c=()=>window.supabaseClient;
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]));
  const fmt=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  const money=v=>v==null||v===''?'—':'Rp '+Number(v||0).toLocaleString('id-ID');
  let reportTimer=null;
  let observer=null;
  let reportBusy=false;
  const modalSelector='.sf5-modal,.sf5-enterprise-modal';

  function reportSource(type,row,fhc,wpr){
    const t=String(type||row?.report_type||'').toUpperCase();
    if(t==='FHC') return fhc.find(x=>String(x.id)===String(row?.source_id))||fhc.find(x=>String(x.id)===String(row?.id))||fhc[0]||null;
    return wpr.find(x=>String(x.id)===String(row?.source_id))||wpr.find(x=>String(x.id)===String(row?.id))||wpr[0]||null;
  }

  function renderReportRows(host, reports, fhc, wpr){
    if(!host)return;
    if(!reports.length){
      host.innerHTML='<div class="sf-final-empty">Belum ada laporan tersimpan. Selesaikan Financial Health Check atau Wealth & Protection Review untuk membangun report Anda.</div>';
      return;
    }
    host.innerHTML=reports.map((r,i)=>{
      const type=String(r.report_type||'REPORT').toUpperCase();
      const src=reportSource(type,r,fhc,wpr);
      const score=type==='FHC' ? (src?.overall_score??src?.fhc_scores?.[0]?.overall_score) : (src?.overall_score??src?.wpr_results?.[0]?.overall_score);
      const when=r.generated_at||r.completed_at||r.submitted_at||r.created_at||src?.submitted_at||src?.created_at;
      const rid=esc(r.id||((type==='FHC'?'vf-':'vw-')+(src?.id||i)));
      const sid=esc(src?.id||'');
      const canOpen=Boolean(src?.id);
      return `<article class="sf-final-report-card">
        <div class="sf-final-report-icon">${type==='FHC'?'FHC':'WPR'}</div>
        <div class="sf-final-report-main"><strong>${type==='FHC'?'Financial Health Check™':'Wealth & Protection Review™'}</strong><small>${fmt(when)} · ${esc(r.status||'Tersedia')}</small>${score!=null?`<span>Score <b>${Math.round(Number(score))}/100</b></span>`:''}</div>
        <div class="sf-final-report-actions">${canOpen?`<button type="button" data-sf-final-view="${rid}" data-sf-final-type="${type}" data-sf-final-source="${sid}">Lihat</button><button type="button" data-sf-final-download="${rid}" data-sf-final-type="${type}" data-sf-final-source="${sid}">Download PDF</button>`:'<span class="sf-final-report-pending">Menunggu hasil</span>'}</div>
      </article>`;
    }).join('');
  }

  function buildReports(fhc,wpr,reports){
    const out=Array.isArray(reports)?reports.map(x=>({...x})):[];
    const keys=new Set(out.map(x=>String(x.report_type||'').toUpperCase()+'|'+String(x.source_id||'')));
    fhc.forEach(x=>{const k='FHC|'+x.id;if(!keys.has(k))out.push({id:'vf-'+x.id,report_type:'FHC',source_id:x.id,status:'ready',generated_at:x.submitted_at||x.created_at});});
    wpr.forEach(x=>{const k='WPR|'+x.id;if(!keys.has(k))out.push({id:'vw-'+x.id,report_type:'WPR',source_id:x.id,status:'ready',generated_at:x.completed_at||x.submitted_at||x.created_at});});
    return out.sort((a,b)=>new Date(b.generated_at||b.created_at||0)-new Date(a.generated_at||a.created_at||0));
  }

  async function loadUserReports(){
    if(reportBusy)return;
    const client=c();
    if(!client?.auth)return;
    let u=null;
    try{u=(await client.auth.getUser())?.data?.user||null;}catch{return;}
    if(!u)return;
    reportBusy=true;
    try{
      const [fhcRes,wprRes,repRes]=await Promise.all([
        client.from('fhc_submissions').select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
        client.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
        client.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30)
      ]);
      const fhc=(fhcRes.error?[]:(fhcRes.data||[]));
      const wpr=(wprRes.error?[]:(wprRes.data||[]));
      const reports=buildReports(fhc,wpr,repRes.error?[]:(repRes.data||[]));
      renderReportRows($('sfDashReports'),reports,fhc,wpr);
      renderReportRows($('sf4Reports'),reports,fhc,wpr);
      window.__sfFinalHardeningReportState={fhc,wpr,reports,userId:u.id,loadedAt:Date.now()};
    }catch(e){console.warn('Safe Future report hardening:',e);}
    finally{reportBusy=false;}
  }

  function callExisting(type,sourceId,action){
    const t=String(type||'').toUpperCase();
    if(action==='view'&&typeof window.sfProductionViewAssessment==='function')return window.sfProductionViewAssessment(t,sourceId);
    if(action==='view'&&typeof window.sfProductionViewReport==='function')return window.sfProductionViewReport(sourceId);
    if(action==='download'&&typeof window.sfProductionDownloadReport==='function')return window.sfProductionDownloadReport(sourceId);
    if(action==='download'&&typeof window.sfProductionDownloadAssessment==='function')return window.sfProductionDownloadAssessment(t,sourceId);
    return false;
  }

  function fallbackView(type,sourceId){
    const s=window.__sfFinalHardeningReportState;
    if(!s)return;
    const src=reportSource(type,{source_id:sourceId},s.fhc,s.wpr);
    if(!src)return;
    if(typeof window.sfProductionViewAssessment==='function')return window.sfProductionViewAssessment(type,src.id);
    const escv=esc;
    const isFhc=String(type).toUpperCase()==='FHC';
    const x=isFhc?(src.fhc_scores?.[0]||src):(src.wpr_results?.[0]||src);
    const rows=isFhc?[['Cash Flow',x.cashflow_score],['Debt',x.debt_score],['Emergency Fund',x.emergency_score],['Protection',x.protection_score],['Retirement',x.retirement_score],['Assets',x.asset_score],['Goals',x.goals_score]]:[['Net Worth',money(x.net_worth)],['Protection Need',money(x.protection_need)],['Protection Gap',money(x.protection_gap)],['Critical Illness Gap',money(x.critical_illness_gap)],['Retirement Gap',money(x.retirement_gap)],['Liquidity Score',x.liquidity_score],['Protection Score',x.protection_score],['Retirement Score',x.retirement_score],['Wealth Score',x.wealth_score]];
    const m=document.createElement('div');m.className='sf-final-modal';m.innerHTML=`<div class="sf-final-backdrop"><article class="sf-final-dialog"><header><div><small>SAFE FUTURE · PERSONAL REPORT</small><h2>${isFhc?'Financial Health Check™':'Wealth & Protection Review™'}</h2></div><button type="button" data-close>×</button></header><main><div class="sf-final-score"><span>Score</span><strong>${x.overall_score==null?'—':Math.round(Number(x.overall_score))}</strong><small>/ 100</small></div><p>${fmt(src.submitted_at||src.completed_at||src.created_at)}</p><h3>Ringkasan</h3><div class="sf-final-grid">${rows.map(([k,v])=>`<div><span>${escv(k)}</span><strong>${escv(v==null?'—':String(v))}</strong></div>`).join('')}</div></main><footer><button type="button" data-close>Tutup</button></footer></article></div>`;document.body.appendChild(m);m.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>m.remove()));
  }

  async function fallbackDownload(type,sourceId){
    const s=window.__sfFinalHardeningReportState;
    const src=reportSource(type,{source_id:sourceId},s?.fhc||[],s?.wpr||[]);
    if(!src)return;
    try{
      let JsPDF=window.jspdf?.jsPDF;
      if(!JsPDF){JsPDF=await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';sc.onload=()=>resolve(window.jspdf?.jsPDF);sc.onerror=reject;document.head.appendChild(sc);});}
      if(!JsPDF)throw new Error('jsPDF unavailable');
      const isFhc=String(type).toUpperCase()==='FHC';
      const x=isFhc?(src.fhc_scores?.[0]||src):(src.wpr_results?.[0]||src);
      const rows=isFhc?[['Cash Flow',x.cashflow_score],['Debt',x.debt_score],['Emergency Fund',x.emergency_score],['Protection',x.protection_score],['Retirement',x.retirement_score],['Assets',x.asset_score],['Goals',x.goals_score]]:[['Net Worth',money(x.net_worth)],['Protection Need',money(x.protection_need)],['Protection Gap',money(x.protection_gap)],['Critical Illness Gap',money(x.critical_illness_gap)],['Retirement Gap',money(x.retirement_gap)],['Liquidity Score',x.liquidity_score],['Protection Score',x.protection_score],['Retirement Score',x.retirement_score],['Wealth Score',x.wealth_score]];
      const pdf=new JsPDF({unit:'mm',format:'a4'});pdf.setFont('helvetica','bold');pdf.setFontSize(18);pdf.text('Safe Future',20,22);pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.text(isFhc?'Financial Health Check':'Wealth & Protection Review',20,31);pdf.setFontSize(9);pdf.text('Tanggal: '+fmt(src.submitted_at||src.completed_at||src.created_at),20,38);pdf.setFont('helvetica','bold');pdf.setFontSize(28);pdf.text((x.overall_score==null?'—':Math.round(Number(x.overall_score)))+' / 100',20,53);let y=66;pdf.setFontSize(10);rows.forEach(([k,v])=>{if(y>270){pdf.addPage();y=22}pdf.setFont('helvetica','normal');pdf.text(String(k),20,y);pdf.setFont('helvetica','bold');pdf.text(String(v==null?'—':v),150,y);y+=7});pdf.setFontSize(7);pdf.text('Estimasi berbasis data pengguna. Bukan nasihat keuangan personal.',20,287);pdf.save('Safe-Future-'+(isFhc?'FHC':'WPR')+'-'+new Date().toISOString().slice(0,10)+'.pdf');
    }catch(e){console.warn('Safe Future fallback PDF:',e);window.print();}
  }

  function hardenModalLifecycle(){
    if(observer)return;
    const lock=()=>{
      const active=document.querySelector(modalSelector);
      if(active){
        if(!document.body.dataset.sf5ScrollLock){document.body.dataset.sf5ScrollPrev=document.body.style.overflow||'';document.body.dataset.sf5ScrollLock='1';}
        document.body.style.overflow='hidden';
      }else if(document.body.dataset.sf5ScrollLock){
        document.body.style.overflow=document.body.dataset.sf5ScrollPrev||'';delete document.body.dataset.sf5ScrollPrev;delete document.body.dataset.sf5ScrollLock;
      }
    };
    const closeModal=el=>{const modal=el?.closest(modalSelector);if(modal){modal.remove();lock();return true;}return false;};
    observer=new MutationObserver(()=>{lock();decorateCustomerModal();});
    observer.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){const modals=[...document.querySelectorAll(modalSelector)];const top=modals[modals.length-1];if(top){top.remove();lock();}}},true);
    document.addEventListener('click',e=>{
      const backdrop=e.target.closest(modalSelector);
      if(backdrop && e.target===backdrop){backdrop.remove();lock();return;}
      const close=e.target.closest('[data-sf5-close],[data-modal-close]');
      if(close)closeModal(close);
    },true);
    lock();
  }

  function decorateCustomerModal(){
    document.querySelectorAll('.sf5-enterprise-modal').forEach(m=>{
      const shell=m.querySelector('.sf5-enterprise-shell');
      if(!shell)return;
      if(!shell.querySelector('[data-sf5-close]')){
        const btn=document.createElement('button');btn.type='button';btn.setAttribute('data-sf5-close','1');btn.className='sf5-mobile-safe-close';btn.setAttribute('aria-label','Tutup Customer 360');btn.textContent='×';shell.appendChild(btn);
      }
    });
  }

  function bindReports(){
    if(document.body.dataset.sfFinalReportEvents)return;
    document.body.dataset.sfFinalReportEvents='1';
    document.addEventListener('click',async e=>{
      const v=e.target.closest('[data-sf-final-view]');
      if(v){e.preventDefault();e.stopPropagation();const type=v.dataset.sfFinalType,source=v.dataset.sfFinalSource;const ok=callExisting(type,source,'view');if(!ok)fallbackView(type,source);return;}
      const d=e.target.closest('[data-sf-final-download]');
      if(d){e.preventDefault();e.stopPropagation();const type=d.dataset.sfFinalType,source=d.dataset.sfFinalSource;const ok=callExisting(type,d.dataset.sfFinalId||source,'download');if(!ok)await fallbackDownload(type,source);}
    },true);
  }

  function start(){
    hardenModalLifecycle();bindReports();decorateCustomerModal();
    loadUserReports();
    try{c()?.auth?.onAuthStateChange((_e,s)=>{if(s?.user){setTimeout(loadUserReports,250);setTimeout(loadUserReports,1000);} });}catch{}
    if(reportTimer)clearInterval(reportTimer);
    reportTimer=setInterval(()=>{const active=$('sfUserDashboard')&&!$('sfUserDashboard').classList.contains('hidden');if(active)loadUserReports();},5000);
  }

  window.sfFinalHardRefreshReports=loadUserReports;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,250));else setTimeout(start,250);
})();

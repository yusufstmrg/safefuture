/* Safe Future — History Authority v2
 * Final owner-scoped renderer for authenticated assessment history and reports.
 * Designed to win over earlier dashboard renderers and tolerate auth/DOM timing.
 */
(function(){
  'use strict';
  const c=()=>window.supabaseClient;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  let busy=false, scheduled=false;

  async function getUser(){try{return(await c()?.auth?.getUser())?.data?.user||null}catch{return null}}
  async function getHistory(){
    const client=c(),u=await getUser();
    if(!client||!u)return null;
    const [f,w,r]=await Promise.all([
      client.from('fhc_submissions').select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30)
    ]);
    let fhc=!f.error?(f.data||[]):[],wpr=!w.error?(w.data||[]):[],reports=!r.error?(r.data||[]):[];
    /* RPC is fallback/supplement only; never replaces a successful direct read with an empty array. */
    try{
      const x=await client.rpc('get_my_assessment_history');
      if(!x.error&&x.data){
        if(!fhc.length&&Array.isArray(x.data.fhc))fhc=x.data.fhc;
        if(!wpr.length&&Array.isArray(x.data.wpr))wpr=x.data.wpr;
        if(!reports.length&&Array.isArray(x.data.reports))reports=x.data.reports;
      }
    }catch{}
    return {fhc,wpr,reports};
  }
  function assessmentRow(type,r,i){
    const s=type==='FHC'?(r.overall_score??r.fhc_scores?.[0]?.overall_score):(r.overall_score??r.wpr_results?.[0]?.overall_score);
    const when=type==='FHC'?(r.submitted_at||r.created_at):(r.completed_at||r.submitted_at||r.created_at);
    return `<div class="sf-final-row"><div><b>${type} ${i?'Riwayat':'Terbaru'}</b><small>${fmt(when)} · ${esc(r.status||'completed')}</small></div><div class="sf-final-actions"><strong>${s==null?'—':Math.round(Number(s))+' / 100'}</strong><button type="button" data-sff-view="${type}" data-id="${esc(r.id)}">Lihat hasil</button></div></div>`;
  }
  function reportRows(h){
    const all=[...(h.reports||[])],keys=new Set(all.map(x=>String(x.report_type).toUpperCase()+'|'+String(x.source_id)));
    (h.fhc||[]).forEach(x=>{const k='FHC|'+x.id;if(!keys.has(k))all.push({id:'authority-fhc-'+x.id,report_type:'FHC',source_id:x.id,status:'ready',generated_at:x.submitted_at||x.created_at})});
    (h.wpr||[]).forEach(x=>{const k='WPR|'+x.id;if(!keys.has(k))all.push({id:'authority-wpr-'+x.id,report_type:'WPR',source_id:x.id,status:'ready',generated_at:x.completed_at||x.submitted_at||x.created_at})});
    all.sort((a,b)=>new Date(b.generated_at||b.created_at||0)-new Date(a.generated_at||a.created_at||0));
    return all;
  }
  function render(h){
    const fhc=h.fhc||[],wpr=h.wpr||[];
    ['sfP3FhcHistory','sf4FhcHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=fhc.length?fhc.map((r,i)=>assessmentRow('FHC',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>'});
    ['sfP3WprHistory','sf4WprHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=wpr.length?wpr.map((r,i)=>assessmentRow('WPR',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>'});
    const rows=reportRows(h),html=rows.length?rows.map(r=>`<div class="sf-final-row"><div><b>${esc(String(r.report_type||'REPORT').toUpperCase())}</b><small>${fmt(r.generated_at||r.created_at)} · Tersedia</small></div><div class="sf-final-actions"><button type="button" data-sff-report-view="${esc(r.id)}">Lihat</button><button type="button" data-sff-report-download="${esc(r.id)}">Download PDF</button></div></div>`).join(''):'<div class="sf4-empty">Belum ada laporan atau hasil assessment tersimpan.</div>';
    ['sf4Reports','sfDashReports'].forEach(id=>{const e=$(id);if(e)e.innerHTML=html});
  }
  async function run(){if(busy)return;busy=true;try{const h=await getHistory();if(h)render(h)}finally{busy=false}}
  function schedule(ms=180){if(scheduled)return;scheduled=true;setTimeout(async()=>{scheduled=false;await run()},ms)}
  function hookAccount(){
    const old=window.sfOpenAccount;
    if(typeof old==='function'&&!old.__sfHistoryAuthorityWrapped){
      const wrapped=async function(){const r=await old.apply(this,arguments);schedule(120);schedule(700);return r};
      wrapped.__sfHistoryAuthorityWrapped=true;window.sfOpenAccount=wrapped;
    }
  }
  function start(){
    const client=c();
    if(!client){setTimeout(start,250);return}
    try{client.auth.onAuthStateChange((_e,s)=>{if(s?.user){schedule(100);setTimeout(run,900);setTimeout(run,2500)}})}catch{}
    schedule(300);setTimeout(run,1600);setTimeout(run,4200);
    hookAccount();setInterval(hookAccount,500);
    const root=document.body;
    if(root&&window.MutationObserver){let last=0;const obs=new MutationObserver(()=>{const now=Date.now();if(now-last<500)return;last=now;if($('sfDashContent'))schedule(80)});obs.observe(root,{childList:true,subtree:true})}
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(150)});
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(start,650));
  window.sfHistoryAuthorityRefresh=run;
})();

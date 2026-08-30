/* Safe Future — History Authority
 * Single final renderer for authenticated FHC/WPR history + reports.
 * Runs after existing dashboard modules so they cannot overwrite populated state with an empty fallback.
 */
(function(){
  'use strict';
  const c=()=>window.supabaseClient;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>v?new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—';
  let busy=false;

  async function getUser(){try{return(await c()?.auth?.getUser())?.data?.user||null}catch{return null}}
  async function fetchRows(){
    const client=c(), u=await getUser(); if(!client||!u)return null;
    const [f,w,r]=await Promise.all([
      client.from('fhc_submissions').select('id,status,version,submitted_at,created_at,fhc_scores(overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,priority_1,priority_2,priority_3,calculated_at)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('wpr_submissions').select('id,fhc_id,status,version,submitted_at,completed_at,created_at,wpr_results(id,overall_score,net_worth,protection_gap,critical_illness_gap,retirement_gap,protection_need,liquidity_score,protection_score,retirement_score,wealth_score,priority_1,priority_2,priority_3,analysis_json,recommendations_json)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(20),
      client.from('reports').select('id,report_type,source_id,version,status,storage_path,generated_at,created_at').eq('user_id',u.id).order('created_at',{ascending:false}).limit(30)
    ]);
    const fhc=!f.error?(f.data||[]):[], wpr=!w.error?(w.data||[]):[], reports=!r.error?(r.data||[]):[];
    /* RPC is supplemental, never allowed to erase direct table results. */
    try{
      const x=await client.rpc('get_my_assessment_history');
      if(!x.error&&x.data){
        if(!fhc.length && Array.isArray(x.data.fhc)) fhc.push(...x.data.fhc);
        if(!wpr.length && Array.isArray(x.data.wpr)) wpr.push(...x.data.wpr);
        if(!reports.length && Array.isArray(x.data.reports)) reports.push(...x.data.reports);
      }
    }catch{}
    return {fhc,wpr,reports,user:u};
  }
  function row(type,r,i){
    const score=r.overall_score??(r.wpr_results?.[0]?.overall_score);
    const when=type==='FHC'?(r.submitted_at||r.created_at):(r.completed_at||r.submitted_at||r.created_at);
    return `<div class="sf-final-row"><div><b>${type} ${i?'Riwayat':'Terbaru'}</b><small>${fmt(when)} · ${esc(r.status||'completed')}</small></div><div class="sf-final-actions"><strong>${score==null?'—':Math.round(Number(score))+' / 100'}</strong><button type="button" data-sff-view="${type}" data-id="${esc(r.id)}">Lihat hasil</button></div></div>`;
  }
  function render(h){
    const fhc=h.fhc||[],wpr=h.wpr||[],reports=h.reports||[];
    ['sfP3FhcHistory','sf4FhcHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=fhc.length?fhc.map((r,i)=>row('FHC',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil FHC tersimpan di akun ini.</div>'});
    ['sfP3WprHistory','sf4WprHistory'].forEach(id=>{const e=$(id);if(e)e.innerHTML=wpr.length?wpr.map((r,i)=>row('WPR',r,i)).join(''):'<div class="sf-p3-empty">Belum ada hasil WPR tersimpan di akun ini.</div>'});
    const all=[...reports];
    const keys=new Set(all.map(x=>String(x.report_type).toUpperCase()+'|'+String(x.source_id)));
    fhc.forEach(x=>{const k='FHC|'+x.id;if(!keys.has(k))all.push({id:'authority-fhc-'+x.id,report_type:'FHC',source_id:x.id,status:'ready',generated_at:x.submitted_at||x.created_at})});
    wpr.forEach(x=>{const k='WPR|'+x.id;if(!keys.has(k))all.push({id:'authority-wpr-'+x.id,report_type:'WPR',source_id:x.id,status:'ready',generated_at:x.completed_at||x.submitted_at||x.created_at})});
    const rh=all.length?all.sort((a,b)=>new Date(b.generated_at||b.created_at||0)-new Date(a.generated_at||a.created_at||0)).map(r=>`<div class="sf-final-row"><div><b>${esc(String(r.report_type||'REPORT').toUpperCase())}</b><small>${fmt(r.generated_at||r.created_at)} · Tersedia</small></div><div class="sf-final-actions"><button type="button" data-sff-report-view="${esc(r.id)}">Lihat</button><button type="button" data-sff-report-download="${esc(r.id)}">Download PDF</button></div></div>`).join(''):'<div class="sf4-empty">Belum ada laporan atau hasil assessment tersimpan.</div>';
    ['sf4Reports','sfDashReports'].forEach(id=>{const e=$(id);if(e)e.innerHTML=rh});
  }
  async function run(){if(busy)return;busy=true;try{const h=await fetchRows();if(h)render(h)}finally{busy=false}}
  function start(){
    const c0=c(); if(!c0)return;
    c0.auth.onAuthStateChange((_e,s)=>{if(s?.user){setTimeout(run,150);setTimeout(run,800);setTimeout(run,2200)}});
    setTimeout(run,700);setTimeout(run,1800);setTimeout(run,4500);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(run,250)});
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(start,900));
  window.sfHistoryAuthorityRefresh=run;
})();

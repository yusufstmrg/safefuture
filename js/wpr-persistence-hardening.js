/* Safe Future — WPR persistence hardening.
 * Ensures a completed WPR result is persisted even when the primary Phase 3
 * hook races auth initialization or silently fails, while avoiding duplicates.
 */
(function(){
  const getClient=()=>window.supabaseClient;
  const fingerprint=d=>{try{return JSON.stringify({s:d?.wprScore,n:d?.nama,c:d?.calculations?.netWorth??d?.netWorth})}catch{return ''}};
  let last='';
  async function persist(){
    const c=getClient(),d=window.__wprData;
    if(!c?.auth||!d)return;
    let u=null; try{u=(await c.auth.getUser())?.data?.user||null}catch{}
    if(!u)return;
    const fp=fingerprint(d); if(!fp||fp===last)return;
    try{
      const q=await c.from('wpr_submissions').select('id,created_at,wpr_results(overall_score)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
      const existingScore=q.data?.wpr_results?.[0]?.overall_score;
      if(!q.error && existingScore!=null && d.wprScore!=null && Number(existingScore)===Number(d.wprScore)){last=fp;window.__sfLastWprPersistence={ok:true,id:q.data.id,reused:true};return;}
    }catch{}
    const s=d.calculations||{};
    const payload={
      nama:d.nama||null,wa:d.wa||null,wprScore:d.wprScore??null,wprStatus:d.wprStatus||'Completed',
      netWorth:d.netWorth??s.netWorth??null,
      liquidityScore:d.liquidityScore??d.liquidScore??d.modules?.find?.(x=>x.name==='Liquid Asset Position')?.score,
      protectionScore:d.protectionScore??d.modules?.find?.(x=>x.name==='Life Protection')?.score,
      retirementScore:d.retirementScore??d.retScore??d.modules?.find?.(x=>x.name==='Retirement Position')?.score,
      wealthScore:d.wealthScore??d.modules?.find?.(x=>x.name==='Concentration Risk')?.score,
      protectionNeed:s.hlvEstimate??null,
      protectionGap:d.protectionGap??Math.max(0,Number(s.hlvEstimate||0)-Number(s.lifeProtectionHeld||0)),
      criticalIllnessGap:d.criticalIllnessGap??Math.max(0,Number(s.criticalIllnessNeed||0)-Number(s.ciProtectionHeld||0)),
      retirementGap:d.retirementGap??Math.max(0,Number(s.retNeed||0)-Number(s.retFV||0)),
      priority1:d.priority1||d.modules?.[0]?.name||null,priority2:d.priority2||d.modules?.[1]?.name||null,priority3:d.priority3||d.modules?.[2]?.name||null,
      observation:d.observation||'',modules:Array.isArray(d.modules)?d.modules:[],recommendations:Array.isArray(d.recommendations)?d.recommendations:[],
      inputs:d.inputs||{},calculations:d.calculations||{},snapshot:d
    };
    try{const r=await c.rpc('submit_my_wpr',{p_payload:payload});if(!r.error){last=fp;window.__sfLastWprPersistence={ok:true,id:r.data,reused:false};}else console.warn('WPR persistence hardening:',r.error)}catch(e){console.warn('WPR persistence hardening exception:',e)}
  }
  function schedule(){setTimeout(persist,600);setTimeout(persist,2000);setTimeout(persist,4500)}
  document.addEventListener('DOMContentLoaded',()=>{schedule();getClient()?.auth?.onAuthStateChange((_e,s)=>{if(s?.user)schedule()})});
  window.sfForceWprPersistence=persist;
})();

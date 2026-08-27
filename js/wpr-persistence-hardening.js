/* Safe Future — WPR persistence hardening.
 * Persists completed WPR results, avoids duplicate inserts, and backfills a
 * user's legacy WPR result from the browser's sf_leads backup when the old
 * flow completed before platform persistence was available.
 */
(function(){
  const getClient=()=>window.supabaseClient;
  const fingerprint=d=>{try{return JSON.stringify({s:d?.wprScore,n:d?.nama,c:d?.calculations?.netWorth??d?.netWorth})}catch{return ''}};
  let last='';

  async function currentUser(){try{return (await getClient()?.auth?.getUser())?.data?.user||null}catch{return null}}

  async function persistData(d,u){
    const c=getClient(); if(!c?.auth||!u||!d)return;
    const fp=fingerprint(d); if(!fp)return;
    try{
      const q=await c.from('wpr_submissions').select('id,created_at,wpr_results(overall_score)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
      const existingScore=q.data?.wpr_results?.[0]?.overall_score;
      if(!q.error && existingScore!=null && d.wprScore!=null && Number(existingScore)===Number(d.wprScore)){
        last=fp; window.__sfLastWprPersistence={ok:true,id:q.data.id,reused:true}; return;
      }
    }catch{}
    const s=d.calculations||d.wprSnapshot?.calculations||{};
    const mods=Array.isArray(d.modules)?d.modules:(Array.isArray(d.wprSnapshot?.modules)?d.wprSnapshot.modules:[]);
    const recs=Array.isArray(d.recommendations)?d.recommendations:(Array.isArray(d.wprSnapshot?.recommendations)?d.wprSnapshot.recommendations:[]);
    const payload={
      nama:d.nama||null,wa:d.wa||null,wprScore:d.wprScore??d.wprSnapshot?.wprScore??null,wprStatus:d.wprStatus||d.wprSnapshot?.wprStatus||'Completed',
      netWorth:d.netWorth??s.netWorth??null,
      liquidityScore:d.liquidityScore??d.liquidScore??mods.find?.(x=>x.name==='Liquid Asset Position')?.score,
      protectionScore:d.protectionScore??mods.find?.(x=>x.name==='Life Protection')?.score,
      retirementScore:d.retirementScore??d.retScore??mods.find?.(x=>x.name==='Retirement Position')?.score,
      wealthScore:d.wealthScore??mods.find?.(x=>x.name==='Concentration Risk')?.score,
      protectionNeed:s.hlvEstimate??null,
      protectionGap:d.protectionGap??Math.max(0,Number(s.hlvEstimate||0)-Number(s.lifeProtectionHeld||0)),
      criticalIllnessGap:d.criticalIllnessGap??Math.max(0,Number(s.criticalIllnessNeed||0)-Number(s.ciProtectionHeld||0)),
      retirementGap:d.retirementGap??Math.max(0,Number(s.retNeed||0)-Number(s.retFV||0)),
      priority1:d.priority1||mods?.[0]?.name||null,priority2:d.priority2||mods?.[1]?.name||null,priority3:d.priority3||mods?.[2]?.name||null,
      observation:d.observation||d.wprSnapshot?.observation||'',modules:mods,recommendations:recs,
      inputs:d.inputs||d.wprSnapshot?.inputs||{},calculations:s,snapshot:d
    };
    try{const r=await c.rpc('submit_my_wpr',{p_payload:payload});if(!r.error){last=fp;window.__sfLastWprPersistence={ok:true,id:r.data,reused:false};}else console.warn('WPR persistence:',r.error)}catch(e){console.warn('WPR persistence exception:',e)}
  }

  async function persistCurrent(){const u=await currentUser();if(!u)return;await persistData(window.__wprData,u)}

  async function backfillLegacy(){
    const u=await currentUser(); if(!u)return;
    let leads=[]; try{leads=JSON.parse(localStorage.getItem('sf_leads')||'[]')}catch{return}
    if(!Array.isArray(leads)||!leads.length)return;
    const email=(u.email||'').toLowerCase();
    const name=(u.user_metadata?.full_name||u.user_metadata?.name||'').trim().toLowerCase();
    const candidates=leads.filter(x=>x?.segment==='WPR'||x?.wprScore!=null||x?.wpr_score!=null||x?.wprSnapshot);
    const match=candidates.reverse().find(x=>{
      const xe=(x.email||'').toLowerCase();
      const xn=(x.nama||x.name||'').trim().toLowerCase();
      return (email&&xe===email)||(name&&xn===name);
    });
    if(!match)return;
    await persistData(match,u);
  }

  function schedule(){setTimeout(persistCurrent,600);setTimeout(persistCurrent,2000);setTimeout(persistCurrent,4500);setTimeout(backfillLegacy,1200)}
  document.addEventListener('DOMContentLoaded',()=>{schedule();const c=getClient();c?.auth?.onAuthStateChange((_e,s)=>{if(s?.user){setTimeout(persistCurrent,350);setTimeout(backfillLegacy,900)}})});
  window.sfForceWprPersistence=persistCurrent;
  window.sfBackfillLegacyWpr=backfillLegacy;
})();

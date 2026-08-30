
(function(){
  const client=()=>window.supabaseClient;
  const setMsg=(m,ok=false)=>{const el=document.getElementById('sfAuthMsg');if(!el)return;el.textContent=m;el.classList.remove('hidden');el.style.background=ok?'#ecfdf3':'#fff7e6';el.style.color=ok?'#166534':'#8a5a00';};
  window.sfShowAuth=function(mode){document.getElementById('sfLoginForm').classList.toggle('hidden',mode!=='login');document.getElementById('sfSignupForm').classList.toggle('hidden',mode!=='signup');document.getElementById('sfTabLogin').classList.toggle('active',mode==='login');document.getElementById('sfTabSignup').classList.toggle('active',mode==='signup');document.getElementById('sfAuthMsg')?.classList.add('hidden');document.getElementById('sfAuthView').classList.remove('hidden');document.getElementById('sfUserDashboard').classList.add('hidden');};
  window.sfOpenAccount=async function(){const m=document.getElementById('sfAuthModal');if(!m)return;m.classList.remove('hidden');m.setAttribute('aria-hidden','false');const c=client();let u=null;try{u=(await c?.auth.getUser())?.data?.user||null}catch{} if(u){document.getElementById('sfAuthView').classList.add('hidden');document.getElementById('sfUserDashboard').classList.remove('hidden');await sfLoadDashboard(u)}else sfShowAuth('login');};
  window.sfCloseAccount=function(){const m=document.getElementById('sfAuthModal');m?.classList.add('hidden');m?.setAttribute('aria-hidden','true');};
  async function sfSyncCrmAfterAuth(){const c=client();if(!c?.auth)return null;try{const s=await c.auth.getSession();if(!s.data?.session?.user)return null;const r=await c.rpc('sync_authenticated_customer');if(r.error){console.warn('CRM auth sync:',r.error);window.__sfCrmSyncError=r.error.message||'CRM sync gagal';return null;}window.__sfCrmSyncError=null;window.__sfLastCrmSync=r.data||null;return r.data||null}catch(e){console.warn('CRM auth sync exception:',e);window.__sfCrmSyncError=e?.message||String(e);return null;}}
  window.sfSyncCrmAfterAuth=sfSyncCrmAfterAuth;
  window.sfSignup=async function(){const c=client();if(!c)return setMsg('Koneksi akun belum siap. Silakan muat ulang halaman.');const name=document.getElementById('sfSignupName').value.trim(),email=document.getElementById('sfSignupEmail').value.trim(),password=document.getElementById('sfSignupPassword').value;if(!name||!email||password.length<8)return setMsg('Lengkapi nama, email, dan password minimal 8 karakter.');setMsg('Membuat akun…',true);const r=await c.auth.signUp({email,password,options:{data:{full_name:name}}});if(r.error)return setMsg(r.error.message);if(r.data.session){setMsg('Akun berhasil dibuat. Hasil FHC Anda sedang disambungkan ke akun.',true);await sfClaimPending();await sfSyncCrmAfterAuth();setTimeout(()=>sfOpenAccount(),300)}else setMsg('Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu masuk ke Safe Future.',true);};
  window.sfLogin=async function(){const c=client();if(!c)return setMsg('Koneksi akun belum siap. Silakan muat ulang halaman.');const email=document.getElementById('sfLoginEmail').value.trim(),password=document.getElementById('sfLoginPassword').value;if(!email||!password)return setMsg('Masukkan email dan password.');setMsg('Memverifikasi akun…',true);const r=await c.auth.signInWithPassword({email,password});if(r.error)return setMsg(r.error.message);await sfClaimPending();await sfSyncCrmAfterAuth();await sfOpenAccount();};
  window.sfForgotPassword=async function(){const c=client();const email=document.getElementById('sfLoginEmail').value.trim();if(!email)return setMsg('Masukkan email Anda terlebih dahulu.');const r=await c.auth.resetPasswordForEmail(email,{redirectTo:'https://safefuture.vercel.app/'});if(r.error)return setMsg(r.error.message);setMsg('Link reset password sudah dikirim jika email tersebut terdaftar.',true);};
  window.sfLogout=async function(){try{await client()?.auth.signOut()}catch{} sfCloseAccount();sfUpdateAccountButton(null);};
  window.sfDashboardAction=function(a){sfCloseAccount();if(a==='fhc')document.getElementById('health-check')?.scrollIntoView({behavior:'smooth'});else if(a==='wpr')openWealthReview();else if(a==='ai'){sfAiToggle();}else if(a==='goals'){sfOpenAccount();}};
  window.sfUpdateAccountButton=function(user){const b=document.getElementById('sfAccountBtn'),t=b?.querySelector('span'),m=document.getElementById('sfMobileAccountText');if(t)t.textContent=user?'Akun':'Masuk';if(m)m.textContent=user?'Buka Dashboard':'Masuk / Daftar';};
  async function sfSha256(v){const bytes=new TextEncoder().encode(v);const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('');}
  async function sfClaimPending(){const c=client();if(!c)return;const id=sessionStorage.getItem('sf_pending_fhc_id'),token=sessionStorage.getItem('sf_pending_fhc_token');if(!id||!token)return;try{const r=await c.rpc('claim_fhc_response',{p_response_id:Number(id),p_claim_token:token});if(!r.error&&r.data===true){sessionStorage.removeItem('sf_pending_fhc_id');sessionStorage.removeItem('sf_pending_fhc_token');window.__sfLastLegacyCrmSync=true;}else if(r.error){console.warn('claim FHC',r.error)}}catch(e){console.warn('claim FHC',e)}}
  window.sfSyncLegacyResponseToCrm=async function(responseId,token){const c=client();if(!c||!responseId||!token)return null;try{const r=await c.rpc('claim_fhc_response',{p_response_id:Number(responseId),p_claim_token:token});if(r.error)throw r.error;window.__sfLastLegacyCrmSync=r.data===true;return r.data===true}catch(e){console.warn('legacy CRM claim/sync',e);return null}};
  async function sfLoadDashboard(user){
    const load=document.getElementById('sfDashLoading'), content=document.getElementById('sfDashContent');
    load?.classList.remove('hidden'); content?.classList.add('hidden');
    const c=client(); if(!c) return;
    const [summary,reports]=await Promise.all([
      c.rpc('get_my_dashboard_summary'),
      c.from('reports').select('report_type,status,generated_at,storage_path').eq('user_id',user.id).order('created_at',{ascending:false}).limit(10)
    ]);
    if(summary.error){console.warn('Dashboard summary RPC:',summary.error);load?.classList.add('hidden');content?.classList.remove('hidden');return;}
    const sd=summary.data||{}; const prof=sd.profile||{}; const f=sd.financial_profile||{}; const goalsCount=Number(sd.goals_count||0); let latestFhc=sd.latest_fhc||null;
    if(latestFhc?.overall_score==null){
      try{
        const sub=await c.from('fhc_submissions').select('id,status,submitted_at,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
        if(sub.data?.id){
          const sc=await c.from('fhc_scores').select('overall_score,cashflow_score,debt_score,emergency_score,protection_score,retirement_score,asset_score,goals_score,calculated_at').eq('fhc_id',sub.data.id).order('calculated_at',{ascending:false}).limit(1).maybeSingle();
          if(sc.data) latestFhc={...sub.data,...sc.data};
        }
      }catch(e){console.warn('FHC dashboard fallback:',e);}
    }
    document.getElementById('sfDashName').textContent='Halo, '+(prof.full_name||user.email?.split('@')[0]||'');
    const score=latestFhc?.overall_score;
    const fhcDetail=document.getElementById('sfDashFhcDetail');
    if(fhcDetail){
      const hist=Array.isArray(sd.fhc_history)?sd.fhc_history:[];
      fhcDetail.innerHTML=score!=null?`<div class="sf-dashboard-fhc-head"><div><span>Financial Health Score</span><strong>${score}/100</strong><small>${latestFhc?.submitted_at?new Date(latestFhc.submitted_at).toLocaleDateString('id-ID'):'Completed'}</small></div><button type="button" onclick="window.location.hash='assessment-history'">Lihat Detail & Riwayat →</button></div><div class="sf-dashboard-fhc-grid"><div><span>Cash Flow</span><b>${latestFhc.cashflow_score??'—'}/100</b></div><div><span>Debt</span><b>${latestFhc.debt_score??'—'}/100</b></div><div><span>Emergency Fund</span><b>${latestFhc.emergency_score??'—'}/100</b></div><div><span>Protection</span><b>${latestFhc.protection_score??'—'}/100</b></div><div><span>Retirement</span><b>${latestFhc.retirement_score??'—'}/100</b></div><div><span>Assets</span><b>${latestFhc.asset_score??'—'}/100</b></div><div><span>Goals</span><b>${latestFhc.goals_score??'—'}/100</b></div></div><div class="sf-dashboard-fhc-history">${hist.slice(0,5).map(h=>`<div><span>${h.submitted_at?new Date(h.submitted_at).toLocaleDateString('id-ID'):'—'}</span><strong>${h.overall_score??'—'}/100</strong><em>${h.status||'completed'}</em></div>`).join('')||'<div>Belum ada riwayat FHC lain.</div>'}</div>`:'<div class="sf-dashboard-fhc-empty">Financial Health Check belum selesai.</div>';
    }
    document.getElementById('sfDashScore').textContent=score!=null?Math.round(Number(score)):'—';
    document.getElementById('sfDashScoreNote').textContent=score!=null?'Ini adalah hasil diagnosis terakhir Anda. Buka FHC untuk melihat analisis lengkap.':'Lengkapi Financial Health Check untuk mendapatkan diagnosis.';
    document.getElementById('sfDashFinancial').innerHTML=[
      ['Penghasilan / bulan',f.monthly_income],['Pengeluaran / bulan',f.monthly_expense],['Aset likuid',f.liquid_assets],['Total utang',f.total_debt]
    ].map(([k,v])=>`<div class="sf-dash-row"><span>${k}</span><strong>${v!=null?'Rp '+Number(v).toLocaleString('id-ID'):'—'}</strong></div>`).join('');
    document.getElementById('sfDashGoals').textContent=goalsCount+' tujuan';
    document.getElementById('sfDashGoalsList').innerHTML=goalsCount?'<div class="sf-dash-row"><span>Tujuan finansial tersimpan</span><strong>'+goalsCount+'</strong></div>':'<div class="sf-dash-empty">Belum ada tujuan finansial tersimpan.</div>';
    document.getElementById('sfDashReports').innerHTML=(reports.data||[]).length?reports.data.map(x=>`<div class="sf-dash-row"><span>${x.report_type}</span><strong>${x.status}</strong></div>`).join(''):'<div class="sf-dash-empty">Laporan Anda akan muncul di sini setelah tersimpan.</div>';
    load?.classList.add('hidden'); content?.classList.remove('hidden');
  }
  async function sfInit(){const c=client();if(!c)return;try{const r=await c.auth.getUser();sfUpdateAccountButton(r.data?.user||null);if(r.data?.user&&window.sf5SyncCustomer)await window.sf5SyncCustomer();c.auth.onAuthStateChange(async(_e,s)=>{sfUpdateAccountButton(s?.user||null);if(s?.user){await sfClaimPending();if(window.sf5SyncCustomer)await window.sf5SyncCustomer()}})}catch{}}
  window.sfClaimPending=sfClaimPending;window.sfSha256=sfSha256;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(sfInit,250));
})();

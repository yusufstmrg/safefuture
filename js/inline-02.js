        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: '#0B1120',
                        'navy-light': '#16203A',
                        'navy-deep': '#05070D',
                        cream: '#FAF8F3',
                        'cream-dark': '#F3EFE6',
                        gold: '#C9A227',
                        'gold-light': '#E9C766',
                        'gold-soft': '#F5E3B3',
                        'gold-dark': '#8A6D00',
                        ink: '#1E2433',
                        'ink-soft': '#5A6272'
                    },
                    fontFamily: {
                        serif: ['"Playfair Display"', 'serif'],
                        sans: ['"Inter"', 'sans-serif'],
                    }
                }
            }
        }

/* Safe Future runtime bootstrap.
 * Mobile layout is a visual safety dependency and MUST NOT wait for Supabase.
 * Assessment/report controllers are loaded after inline-03 creates supabaseClient.
 */
(function(){
  'use strict';
  var started=false;

  function loadMobileHotfix(){
    if(document.querySelector('link[data-sf-mobile-hotfix]')) return;
    var l=document.createElement('link');
    l.rel='stylesheet';
    l.href='./css/mobile-layout-hotfix.css?v=20260830-qa5';
    l.setAttribute('data-sf-mobile-hotfix','1');
    document.head.appendChild(l);
  }

  function loadScriptOnce(flag,src){
    if(window[flag]) return;
    window[flag]=true;
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  }

  /* Critical: apply the mobile CSS immediately, independently of auth/backend. */
  loadMobileHotfix();

  function boot(){
    if(started || !window.supabaseClient)return;
    started=true;
    try{
      loadScriptOnce('__sfFinalPlatformFixRequested','./js/final-platform-fixes.js?v=20260830-qa5');
      loadScriptOnce('__sfHistoryAuthorityRequested','./js/history-authority.js?v=20260830-qa5');
      loadScriptOnce('__sfScrollGuardRequested','./js/scroll-stability-guard.js?v=20260830-qa5');
    }catch(e){console.warn('Safe Future runtime controller loader:',e)}
  }

  var tries=0;
  var timer=setInterval(function(){
    boot();
    if(started || ++tries>=80) clearInterval(timer);
  },100);
  if(document.readyState!=='loading')boot();
})();

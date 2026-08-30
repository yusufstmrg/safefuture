  
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
    
/* Load production runtime controllers only after inline-03 has initialized Supabase. */
(function(){
  var started=false;
  function boot(){
    if(started || !window.supabaseClient)return;
    started=true;
    try{
      if(!window.__sfFinalPlatformFixRequested){
        window.__sfFinalPlatformFixRequested=true;
        var s=document.createElement('script');
        s.src='./js/final-platform-fixes.js?v=20260830-qa3';
        s.async=false;
        document.head.appendChild(s);
      }
      if(!window.__sfHistoryAuthorityRequested){
        window.__sfHistoryAuthorityRequested=true;
        var h=document.createElement('script');
        h.src='./js/history-authority.js?v=20260830-qa3';
        h.async=false;
        document.head.appendChild(h);
      }
      if(!document.querySelector('link[data-sf-mobile-hotfix]')){
        var l=document.createElement('link');
        l.rel='stylesheet';
        l.href='./css/mobile-layout-hotfix.css?v=20260830-qa3';
        l.setAttribute('data-sf-mobile-hotfix','1');
        document.head.appendChild(l);
      }
      if(!window.__sfScrollGuardRequested){
        window.__sfScrollGuardRequested=true;
        var g=document.createElement('script');
        g.src='./js/scroll-stability-guard.js?v=20260830-qa3';
        g.async=false;
        document.head.appendChild(g);
      }
    }catch(e){console.warn('Safe Future runtime controller loader:',e)}
  }
  /* inline-03 runs later in the HTML and creates window.supabaseClient synchronously.
     Poll briefly because this file is intentionally loaded before inline-03. */
  var tries=0, timer=setInterval(function(){
    boot();
    if(started || ++tries>=80) clearInterval(timer);
  },100);
  if(document.readyState!=='loading')boot();
})();
/* release sync marker: 2026-08-30-qa3 */

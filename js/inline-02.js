  
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
    
/* Load the production history/report runtime fix after the base config is ready. */
(function(){
  try{
    if(!window.__sfFinalPlatformFixRequested){
      window.__sfFinalPlatformFixRequested=true;
      var s=document.createElement('script');
      s.src='./js/final-platform-fixes.js?v=20260827-2000';
      s.async=false;
      document.head.appendChild(s);
    }
  }catch(e){console.warn('Safe Future final platform fix loader:',e)}
})();
/* Load isolated mobile layout repair. */
(function(){
  try{
    if(!document.querySelector('link[data-sf-mobile-hotfix]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='./css/mobile-layout-hotfix.css?v=20260827-2235';
      l.setAttribute('data-sf-mobile-hotfix','1');
      document.head.appendChild(l);
    }
  }catch(e){console.warn('Safe Future mobile layout hotfix loader:',e)}
})();
/* Load scroll stability guard after all base configuration hooks. */
(function(){
  try{
    if(!window.__sfScrollGuardRequested){
      window.__sfScrollGuardRequested=true;
      var g=document.createElement('script');
      g.src='./js/scroll-stability-guard.js?v=20260828-0745';
      g.async=false;
      document.head.appendChild(g);
    }
  }catch(e){console.warn('Safe Future scroll stability guard loader:',e)}
})();
/* release sync marker: 2026-08-28 */

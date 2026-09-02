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
        sans: ['"Inter"', 'sans-serif']
      }
    }
  }
};

/* Critical layout guard — never depends on Supabase. */
(function(){
  'use strict';
  if(!document.getElementById('sf-critical-layout-guard')){
    var style=document.createElement('style');
    style.id='sf-critical-layout-guard';
    style.textContent='html,body{margin:0!important;padding:0!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}body{position:relative!important}body>nav,body>main,body>section,body>footer{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin-left:0!important;margin-right:0!important}#navbar,#home{width:100%!important;max-width:none!important;min-width:0!important}img,svg,video,canvas,iframe{max-width:100%}@media(max-width:767px){html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}body>nav,body>main,body>section,body>footer,#navbar,#home{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}#home{height:auto!important;min-height:0!important}#home>.container,body>section>.container,main>.container{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}}';
    (document.head||document.documentElement).appendChild(style);
  }
})();

/* Compatibility bootstrap for the legacy release gate. Visual CSS is loaded
   independently above; these controllers are only loaded once after Supabase.
   The bottom-of-document script tags remain the primary synchronous path. */
(function(){
  'use strict';
  var started=false;
  function hasScript(src){
    return Array.from(document.scripts||[]).some(function(s){return (s.src||'').indexOf(src)>=0;});
  }
  function loadScriptOnce(flag,src){
    if(window[flag] || hasScript(src)){ window[flag]=true; return; }
    window[flag]=true;
    var s=document.createElement('script');
    s.src=src+'?v=20260902-layout';
    s.async=false;
    document.head.appendChild(s);
  }
  function boot(){
    if(started || !window.supabaseClient)return;
    started=true;
    loadScriptOnce('__sfFinalPlatformFixRequested','./js/final-platform-fixes.js');
    loadScriptOnce('__sfHistoryAuthorityRequested','./js/history-authority.js');
    loadScriptOnce('__sfScrollGuardRequested','./js/scroll-stability-guard.js');
  }
  var tries=0;
  var timer=setInterval(function(){
    boot();
    if(started || ++tries>=80) clearInterval(timer);
  },100);
})();

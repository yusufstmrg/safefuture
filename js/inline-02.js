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

/* Critical layout guard. This is synchronous and independent of Supabase,
   auth, analytics, animations, or any later module. */
(function(){
  'use strict';
  if(document.getElementById('sf-critical-layout-guard')) return;
  var style=document.createElement('style');
  style.id='sf-critical-layout-guard';
  style.textContent='html,body{margin:0!important;padding:0!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}\nbody{position:relative!important}\nbody>nav,body>main,body>section,body>footer{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin-left:0!important;margin-right:0!important}\n#navbar,#home{width:100%!important;max-width:none!important;min-width:0!important}\nimg,svg,video,canvas,iframe{max-width:100%}\n@media(max-width:767px){html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}body>nav,body>main,body>section,body>footer,#navbar,#home{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}#home{height:auto!important;min-height:0!important}#home>.container,body>section>.container,main>.container{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}}';
  (document.head||document.documentElement).appendChild(style);
})();

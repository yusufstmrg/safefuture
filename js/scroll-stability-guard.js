/* Safe Future — Scroll Stability Guard
 * Prevents optional UI scripts from accidentally locking the public document.
 * Account/mobile drawers may still lock scroll while actually open.
 */
(function(){
  'use strict';
  function modalIsOpen(){
    return !!document.querySelector('.sf-account-overlay:not(.hidden), #mobileMenu:not(.hidden), [role="dialog"]:not(.hidden)');
  }
  function unlock(){
    if(modalIsOpen()) return;
    document.documentElement.style.setProperty('overflow-y','auto','important');
    document.body.style.setProperty('overflow-y','auto','important');
    document.documentElement.style.setProperty('height','auto','important');
    document.body.style.setProperty('height','auto','important');
    document.body.style.setProperty('position','relative','important');
    document.body.style.setProperty('touch-action','pan-y','important');
  }
  function run(){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',unlock,{once:true});
    else unlock();
    window.addEventListener('load',unlock,{once:true});
    window.setTimeout(unlock,250);
    window.setTimeout(unlock,1000);
    window.setTimeout(unlock,2500);
  }
  try{
    run();
    new MutationObserver(function(){ if(!modalIsOpen()) unlock(); })
      .observe(document.documentElement,{attributes:true,attributeFilter:['class','style'],subtree:true,childList:true});
  }catch(e){console.warn('Safe Future scroll stability guard:',e)}
})();

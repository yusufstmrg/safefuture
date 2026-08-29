/* Safe Future — Scroll Stability Guard v3
 * Public pages must remain scrollable. Only explicit Safe Future overlays are
 * allowed to lock document scrolling; generic dialogs are never treated as
 * open because they may be hidden via aria/state rather than .hidden.
 */
(function(){
  'use strict';
  function explicitOverlayOpen(){
    return !!document.querySelector(
      '.sf-account-overlay:not(.hidden), ' +
      '#mobileMenu:not(.hidden), ' +
      '[data-sf-overlay="open"], ' +
      '[data-sf-modal="open"]'
    );
  }
  function unlockPublicScroll(){
    if(explicitOverlayOpen()) return;
    var html=document.documentElement, body=document.body;
    html.style.setProperty('overflow','visible','important');
    html.style.setProperty('overflow-y','auto','important');
    html.style.setProperty('height','auto','important');
    html.style.setProperty('max-height','none','important');
    body.style.setProperty('overflow','visible','important');
    body.style.setProperty('overflow-y','auto','important');
    body.style.setProperty('height','auto','important');
    body.style.setProperty('max-height','none','important');
    body.style.setProperty('position','relative','important');
    body.style.setProperty('touch-action','pan-y','important');
  }
  function run(){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',unlockPublicScroll,{once:true});
    else unlockPublicScroll();
    window.addEventListener('load',unlockPublicScroll,{once:true});
    [50,250,750,1500,3000].forEach(function(ms){window.setTimeout(unlockPublicScroll,ms)});
  }
  try{
    run();
    new MutationObserver(function(){ unlockPublicScroll(); })
      .observe(document.documentElement,{attributes:true,attributeFilter:['class','style','aria-hidden','data-sf-overlay','data-sf-modal'],subtree:true,childList:true});
  }catch(e){console.warn('Safe Future scroll stability guard:',e)}
})();


(function(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectors=['#layanan .premium-card','#solutions .premium-card','#health-check .premium-card','#about .grid > div','#partnership .grid > div','#insight details','#contact .premium-card','.timeline-container > div'];
  const els=[]; selectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{if(!els.includes(el))els.push(el)}));
  els.forEach((el,i)=>{el.classList.add('sf-v55-reveal','sf-v55-lift');el.style.setProperty('--sf-delay',Math.min(i%5,4)*70+'ms');});
  if(reduce){els.forEach(el=>el.classList.add('is-visible'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(el=>io.observe(el));
  const parallax=()=>{const y=window.scrollY||0;document.querySelectorAll('.sf-v55-visual').forEach((el,i)=>{const r=el.parentElement.getBoundingClientRect();const offset=(r.top+r.height/2-window.innerHeight/2)*-.035;el.style.transform='translate3d(0,'+offset+'px,0)'});};
  let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{parallax();ticking=false});ticking=true}},{passive:true});parallax();
})();


(function(){
  // Give external links safer defaults.
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{
    const rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
    if(!rel.includes('noopener')) rel.push('noopener');
    if(!rel.includes('noreferrer')) rel.push('noreferrer');
    a.setAttribute('rel',rel.join(' '));
  });

  // Improve mobile menu accessibility.
  const btn=document.getElementById('mobileMenuBtn');
  const menu=document.getElementById('mobileMenu');
  if(btn && menu){
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',()=>{
      const open=!menu.classList.contains('hidden');
      btn.setAttribute('aria-expanded',String(open));
    });
  }

  // Prevent accidental form submission from Enter on numeric fields.
  document.querySelectorAll('input[type="number"],input[inputmode="numeric"]').forEach(el=>{
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter') e.preventDefault();
    });
  });
})();

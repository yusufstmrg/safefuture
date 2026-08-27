
(function(){
  function loadSheetJS(){
    if(window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload=function(){ resolve(window.XLSX); };
      s.onerror=function(){
        var local=document.createElement('script');
        local.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        local.onload=function(){ resolve(window.XLSX); };
        local.onerror=reject;
        document.head.appendChild(local);
      };
      document.head.appendChild(s);
    });
  }
  window.__loadSheetJS = loadSheetJS();
})();

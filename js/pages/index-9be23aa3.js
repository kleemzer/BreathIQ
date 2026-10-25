// Extrait de index.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
(function(){
  function loadBiqPro(){
    if(window.BIQ_PRO){BIQ_PRO.init();return;}
    var s=document.createElement('script');
    s.src='/pro/pathogens.js?v=20261026b';
    s.onload=function(){if(window.BIQ_PRO)BIQ_PRO.init();};
    document.head.appendChild(s);
  }
  // Observer la section pour chargement auto au scroll
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){obs.disconnect();loadBiqPro();}
    },{threshold:0.1});
    var section=document.getElementById('proPathogens');
    if(section)obs.observe(section);
  } else {
    // Fallback : chargement immédiat si pas d'IntersectionObserver
    loadBiqPro();
  }
  // Exposer pour appel depuis onglets
  window._loadBiqPro=loadBiqPro;
})();

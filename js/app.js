/* STARDOM · router */
(function(){
  const root = document.getElementById("app");
  function route(){
    const h = location.hash || "#/";
    const sess = STARDOM.store.session();
    const m = h.match(/^#\/play\/?([a-z]*)/);
    if(m){
      if(!sess){ location.hash = "#/"; return; }
      STARDOM.views.shell(root, m[1] || "dashboard", sess);
      return;
    }
    if(h==="#/" || h==="" ){
      if(sess){ location.hash = "#/play/dashboard"; return; }
      STARDOM.views.landing(root); document.title="Stardom · From nobody to idol"; return;
    }
    // in-page anchors on landing (#news, #about...) – render landing once then scroll
    if(!document.querySelector(".landing")) STARDOM.views.landing(root);
    document.getElementById(h.slice(1))?.scrollIntoView({behavior:"smooth"});
  }
  window.addEventListener("hashchange", route);
  route();
})();

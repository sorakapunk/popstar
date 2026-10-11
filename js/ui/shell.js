/* STARDOM · Logged-in shell: top bar, left navigation, right "now / next" column */
(function(){
  const { ic, esc, store } = STARDOM;

  const NAV = [
    { group:"Character", items:[
      { id:"dashboard", label:"Dashboard", icon:"home" },
      { id:"character", label:"Character", icon:"user" },
      { id:"agenda",    label:"Agenda",    icon:"cal" } ]},
    { group:"Artist career", items:[
      { id:"artist", label:"Artist",  icon:"mic" },
      { id:"media",  label:"Media",   icon:"tv" },
      { id:"charts", label:"Charts",  icon:"chart" } ]},
    { group:"World", items:[
      { id:"city", label:"City", icon:"pin" } ]},
    { group:"Community", items:[
      { id:"news",     label:"News",     icon:"news", off:true },
      { id:"messages", label:"Messages", icon:"mail", off:true } ]}
  ];

  function topbar(sess){
    const acc = sess.accountData;
    const initials = acc.name.slice(0,2).toUpperCase();
    return `
    <header class="gtop"><div class="gtb">
      <button class="menu-btn" id="menu-btn" aria-label="Open menu">${ic("menu")}</button>
      <a class="logo" href="#/play/dashboard"><span class="mk">${ic("star")}</span><span class="word">Stardom</span></a>
      <div class="status-strip">
        <span class="sp muted" title="Characters arrive in stage 2">${ic("user")}No character yet</span>
        <span class="sp muted hide-m">${ic("pin")}City <small>—</small></span>
        <span class="sp muted hide-m">${ic("spark")}XP <small>—</small></span>
        <span class="sp muted hide-m">${ic("coin")}Starcoins <small>—</small></span>
      </div>
      <div class="tools">
        <button class="tbtn" title="Agenda" data-go="agenda">${ic("cal")}</button>
        <button class="tbtn" title="Messages (coming later)">${ic("mail")}</button>
        <button class="tbtn" title="Notifications">${ic("bell")}</button>
        <div style="position:relative">
          <button class="who" id="who"><span class="av">${esc(initials)}</span><span><span class="nm">${esc(acc.name)}</span><small id="who-status">${esc(sess.status)}</small></span></button>
          <div class="dd hidden" id="dd">
            <button data-act="status">${ic("status")}<span>Switch to <b id="dd-status">${sess.status==="Normal"?"Invisible":"Normal"}</b></span></button>
            <hr>
            <button data-act="reset">${ic("trash")}Reset test data</button>
            <button data-act="logout">${ic("logout")}Log out</button>
          </div>
        </div>
      </div>
    </div></header>`;
  }

  function leftnav(active){
    return `<nav class="lnav card" id="lnav">${NAV.map(g=>`
      <div class="grp"><div class="gh">${g.group}</div>
      ${g.items.map(it=>`<a href="#/play/${it.id}" class="${it.id===active?"on":""} ${it.off?"off":""}">${ic(it.icon)}${it.label}${it.off?'<span class="soon">Later</span>':""}</a>`).join("")}
      </div>`).join("")}</nav>`;
  }

  function rightcol(){
    const box = (icon,title,text)=>`<div class="card rcard"><h3>${ic(icon)}${title}</h3><div class="rempty">${text}</div></div>`;
    return `<aside class="rcol">
      ${box("clock","Now","Nothing happening. Create a character to start.")}
      ${box("cal","Next commitments","Your agenda is empty.")}
      ${box("plane","Travel","Not traveling.")}
      ${box("disc","In progress","No compositions or recordings in progress.")}
      ${box("chart","Active release","No single released yet.")}
      ${box("bell","Alerts","No alerts.")}
    </aside>`;
  }

  function toast(text){
    const t=document.createElement("div"); t.className="toast"; t.innerHTML=ic("check")+esc(text);
    document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
  }

  function render(root, page, sess){
    const view = STARDOM.pages[page] || STARDOM.pages.dashboard;
    const active = STARDOM.pages[page] ? page : "dashboard";
    root.innerHTML = topbar(sess) + `<div class="gwrap">${leftnav(active)}<main class="main">${view(sess)}</main>${rightcol()}</div>`;
    document.title = `Stardom · ${active[0].toUpperCase()+active.slice(1)}`;
    window.scrollTo(0,0);

    // interactions
    const dd = root.querySelector("#dd");
    root.querySelector("#who").onclick = e=>{ e.stopPropagation(); dd.classList.toggle("hidden"); };
    document.onclick = ()=>dd.classList.add("hidden");
    dd.onclick = e=>{
      const b = e.target.closest("button"); if(!b) return;
      if(b.dataset.act==="logout"){ store.logout(); location.hash="#/"; }
      if(b.dataset.act==="reset"){ if(confirm("Delete this browser’s Stardom account and all test data?")){ store.resetAll(); location.hash="#/"; } }
      if(b.dataset.act==="status"){
        const next = sess.status==="Normal"?"Invisible":"Normal"; store.setStatus(next); sess.status=next;
        root.querySelector("#who-status").textContent=next; root.querySelector("#dd-status").textContent=next==="Normal"?"Invisible":"Normal";
        toast(`Status: ${next}`);
      }
    };
    root.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>location.hash="#/play/"+b.dataset.go);
    const nav = root.querySelector("#lnav");
    root.querySelector("#menu-btn").onclick = ()=>{
      nav.classList.add("open");
      const sc=document.createElement("div"); sc.className="scrim"; sc.onclick=()=>{nav.classList.remove("open");sc.remove();};
      document.body.appendChild(sc);
    };
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{ nav.classList.remove("open"); document.querySelector(".scrim")?.remove(); }));
  }

  STARDOM.views = STARDOM.views || {};
  STARDOM.views.shell = render;
  STARDOM.toast = toast;
})();

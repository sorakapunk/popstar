/* STARDOM · Logged-in shell: top bar, left navigation, right "now / next" column, test controls */
(function(){
  const { ic, esc, store } = STARDOM;
  const G=()=>STARDOM.game, W=()=>STARDOM.world, T=()=>STARDOM.time;

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
      { id:"city",   label:"City",   icon:"pin" },
      { id:"cities", label:"Cities & travel", icon:"plane" } ]},
    { group:"Community", items:[
      { id:"news",     label:"News",     icon:"news", off:true },
      { id:"messages", label:"Messages", icon:"mail", off:true } ]}
  ];

  // ---- helpers shared with pages ----
  const initials = n => n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
  function whereText(ch,t){
    const loc=G().locationAt(ch,t);
    if(loc.transit) return { transit:true, text:`In transit → ${W().city(loc.to).name}`, city:W().city(loc.to) };
    const c=W().city(loc.cityId); return { transit:false, text:c.name, city:c };
  }
  STARDOM.ui = { initials, whereText };

  function topbar(sess, snap){
    const acc=sess.accountData, { ch, t, g } = snap;
    let strip;
    if(ch){
      const w=whereText(ch,t);
      strip = `
        <span class="sp">${ic("user")}${esc(ch.name)}</span>
        <span class="sp hide-m" title="Local time">${ic(w.transit?"plane":"pin")}${esc(w.text)}${w.transit?"":` <small data-clock="${w.city.tz}">${T().fmtTime(t,w.city.tz)}</small>`}</span>
        <span class="sp hide-m">${ic("spark")}${ch.xp} <small>XP</small></span>
        <span class="sp hide-m">${ic("coin")}${ch.starcoins.toLocaleString("en-US")} <small>Starcoins</small></span>`;
    } else strip = `<a class="sp" href="#/play/new" style="color:#fff">${ic("user")}Create your character</a>`;
    const chars = g.characters.map(c=>`<button data-switch="${c.id}">${ic(c.id===g.activeId?"check":"user")}<span>${esc(c.name)}</span></button>`).join("");
    const slots=STARDOM.config.freeCharacterSlots;
    return `
    <header class="gtop"><div class="gtb">
      <button class="menu-btn" id="menu-btn" aria-label="Open menu">${ic("menu")}</button>
      <a class="logo" href="#/play/dashboard"><span class="mk">${ic("star")}</span><span class="word">Stardom</span></a>
      <div class="status-strip">${strip}</div>
      <div class="tools">
        <button class="tbtn" title="Agenda" data-go="agenda">${ic("cal")}${ch&&ch.agenda.length?`<span class="n">${ch.agenda.length}</span>`:""}</button>
        <button class="tbtn" title="Messages (coming later)">${ic("mail")}</button>
        <button class="tbtn" title="Test controls" id="tc-btn">${ic("clock")}</button>
        <div style="position:relative">
          <button class="who" id="who"><span class="av">${esc(initials(ch?ch.name:acc.name))}</span><span><span class="nm">${esc(ch?ch.name:acc.name)}</span><small id="who-status">${esc(sess.status)}</small></span></button>
          <div class="dd hidden" id="dd">
            ${chars?`<div class="ddh">Characters · ${g.characters.length}/${slots}</div>${chars}`:""}
            ${g.characters.length<slots?`<button data-act="new">${ic("user")}New character</button>`:""}
            <hr>
            <button data-act="status">${ic("status")}<span>Switch to <b>${sess.status==="Normal"?"Invisible":"Normal"}</b></span></button>
            <button data-act="reset">${ic("trash")}Reset test data</button>
            <button data-act="logout">${ic("logout")}Log out</button>
          </div>
        </div>
      </div>
    </div></header>`;
  }

  function leftnav(activeId){
    return `<nav class="lnav card" id="lnav">${NAV.map(g=>`
      <div class="grp"><div class="gh">${g.group}</div>
      ${g.items.map(it=>`<a href="#/play/${it.id}" class="${it.id===activeId?"on":""} ${it.off?"off":""}">${ic(it.icon)}${it.label}${it.off?'<span class="soon">Later</span>':""}</a>`).join("")}
      </div>`).join("")}</nav>`;
  }

  function rightcol(snap){
    const { ch, t } = snap;
    const box=(icon,title,body)=>`<div class="card rcard"><h3>${ic(icon)}${title}</h3>${body}</div>`;
    const none=txt=>`<div class="rempty">${txt}</div>`;
    if(!ch) return `<aside class="rcol">${box("clock","Now",none("Create a character to start."))}${box("bell","Alerts",none("No alerts."))}</aside>`;
    const w=whereText(ch,t), cur=G().currentActivity(ch,t), next=G().upcoming(ch,t).slice(0,3);
    const itemCity = it => W().city(it.type==="travel"?it.from:it.cityId);
    const row = it => { const c=itemCity(it); return `<li><span class="qi">${ic(it.type==="travel"?"plane":"cal")}</span><span><b>${esc(it.title)}</b><br><small>${T().fmtFull(it.start,c.tz)} · ${esc(c.name)}</small></span></li>`; };
    const nowBody = cur
      ? `<div class="nowline">${ic(cur.type==="travel"?"plane":"cal")}<div><b>${esc(cur.title)}</b><small>Ends ${T().fmtTime(cur.end,(cur.type==="travel"?W().city(cur.to):W().city(cur.cityId)).tz)} local · in ${T().fmtRel(cur.end-t)}</small></div></div>`
      : `<div class="nowline">${ic("pin")}<div><b>Free in ${esc(w.city.name)}</b><small data-clock="${w.city.tz}" data-prefix="Local time ">Local time ${T().fmtTime(t,w.city.tz)}</small></div></div>`;
    const travel = w.transit
      ? `<div class="nowline">${ic("plane")}<div><b>${esc(W().city(cur.from).name)} → ${esc(W().city(cur.to).name)}</b><small>Arrives in ${T().fmtRel(cur.end-t)}</small></div></div>`
      : none("Not traveling.");
    return `<aside class="rcol">
      ${box("clock","Now",nowBody)}
      ${box("cal","Next commitments", next.length?`<ul class="rlist">${next.map(row).join("")}</ul>`:none("Your agenda is empty."))}
      ${box("plane","Travel",travel)}
      ${box("disc","In progress",none("No compositions or recordings in progress."))}
      ${box("chart","Active release",none("No single released yet."))}
    </aside>`;
  }

  function testDrawer(snap){
    const { ch, t, g } = snap, est=STARDOM.config.serverOffsetHours;
    const wk=T().weekIndex(t), on=ch&&ch.challengeWeeks[wk], nextTick=T().weekStart(wk+1);
    return `<div class="drawer hidden" id="tc">
      <div class="dh"><div><div class="kicker">Closed test only</div><h3>Test controls</h3></div><button class="tbtn light" id="tc-x" aria-label="Close">${ic("chev")}</button></div>
      <p class="dsub">Moves this browser’s world clock forward so timed rules can be checked. Time can’t go back.</p>
      <div class="dgrid">
        <button class="btn ghost" data-adv="3600000">+1 hour</button>
        <button class="btn ghost" data-adv="86400000">+1 day</button>
        <button class="btn ghost" data-adv="604800000">+1 week</button>
      </div>
      <ul class="qlist" style="margin-top:14px">
        <li><span class="qi">${ic("clock")}</span><span>Server time (EST)</span><span class="v">${T().fmtFull(t,est)}</span></li>
        <li><span class="qi">${ic("spark")}</span><span>Next weekly XP</span><span class="v">${T().fmtFull(nextTick,est)} EST</span></li>
        <li><span class="qi">${ic("wave")}</span><span>Clock advanced</span><span class="v">${T().fmtRel(g.clockOffset||0)}</span></li>
      </ul>
      ${ch?`<label class="toggle"><input type="checkbox" id="tc-ch" ${on?"checked":""}><span><b>Weekly challenges completed</b><small>Grants +5 XP at the next weekly update. Challenges aren’t designed yet.</small></span></label>
      <button class="btn ghost block" id="tc-book" style="margin-top:12px">${ic("cal")}Add a test commitment</button>`:""}
    </div>`;
  }

  function toast(text, kind="ok"){
    document.querySelector(".toast")?.remove();
    const t=document.createElement("div"); t.className="toast "+kind; t.innerHTML=ic(kind==="err"?"alert":"check")+`<span>${esc(text)}</span>`;
    document.body.appendChild(t); setTimeout(()=>t.remove(), kind==="err"?4200:2400);
  }
  // modal
  function modal(html, onMount){
    document.querySelector(".modal-wrap")?.remove();
    const w=document.createElement("div"); w.className="modal-wrap";
    w.innerHTML=`<div class="modal card">${html}</div>`;
    w.onclick=e=>{ if(e.target===w) w.remove(); };
    document.body.appendChild(w);
    w.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>w.remove());
    onMount && onMount(w.querySelector(".modal"), ()=>w.remove());
  }
  STARDOM.toast=toast; STARDOM.modal=modal;

  let current={ root:null, page:null };
  function rerender(){ if(current.root) render(current.root, current.page, store.session()); }
  STARDOM.rerender=rerender;

  function render(root, page, sess){
    if(!sess){ location.hash="#/"; return; }
    const changed=current.page!==page; current={ root, page };
    const snap=G().snapshot(sess.account);
    const view = STARDOM.pages[page] || STARDOM.pages.dashboard;
    const activeId = STARDOM.pages[page] ? page : "dashboard";
    root.innerHTML = topbar(sess,snap) + `<div class="gwrap">${leftnav(activeId==="new"?"character":activeId)}<main class="main">${view(sess,snap)}</main>${rightcol(snap)}</div>` + testDrawer(snap);
    document.title = `Stardom · ${activeId[0].toUpperCase()+activeId.slice(1)}`;
    STARDOM.pageBind?.[activeId]?.(root, sess, snap);
    bind(root, sess, snap);
    if(changed) window.scrollTo(0,0);
  }

  function bind(root, sess, snap){
    const acc=sess.account;
    const dd=root.querySelector("#dd");
    root.querySelector("#who").onclick=e=>{ e.stopPropagation(); dd.classList.toggle("hidden"); };
    document.onclick=()=>dd.classList.add("hidden");
    dd.onclick=e=>{
      const b=e.target.closest("button"); if(!b) return;
      if(b.dataset.switch){ G().setActive(acc,b.dataset.switch); rerender(); toast("Switched character"); return; }
      const a=b.dataset.act;
      if(a==="new") location.hash="#/play/new";
      if(a==="logout"){ store.logout(); location.hash="#/"; }
      if(a==="reset"){ if(confirm("Delete this browser’s Stardom account and all test data?")){ store.resetAll(); location.hash="#/"; } }
      if(a==="status"){ const next=sess.status==="Normal"?"Invisible":"Normal"; store.setStatus(next); rerender(); toast(`Status: ${next}`); }
    };
    root.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>location.hash="#/play/"+b.dataset.go);
    // mobile menu
    const nav=root.querySelector("#lnav");
    root.querySelector("#menu-btn").onclick=()=>{ nav.classList.add("open"); const sc=document.createElement("div"); sc.className="scrim"; sc.onclick=()=>{nav.classList.remove("open");sc.remove();}; document.body.appendChild(sc); };
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{ nav.classList.remove("open"); document.querySelector(".scrim")?.remove(); }));
    // test drawer
    const tc=root.querySelector("#tc");
    root.querySelector("#tc-btn").onclick=()=>tc.classList.toggle("hidden");
    root.querySelector("#tc-x").onclick=()=>tc.classList.add("hidden");
    tc.querySelectorAll("[data-adv]").forEach(b=>b.onclick=()=>{ G().advance(acc,Number(b.dataset.adv)); rerender(); document.querySelector("#tc")?.classList.remove("hidden"); toast("World clock moved "+b.textContent); });
    const chk=tc.querySelector("#tc-ch"); if(chk) chk.onchange=()=>{ G().setChallenges(acc,chk.checked); toast(chk.checked?"Weekly challenges marked as completed":"Weekly challenges unmarked"); };
    const bk=tc.querySelector("#tc-book"); if(bk) bk.onclick=()=>{ tc.classList.add("hidden"); STARDOM.dialogs.testBooking(sess); };
  }

  // live clocks (no full re-render while the player types)
  setInterval(()=>{
    const s=store.session(); if(!s || !current.root || !location.hash.startsWith("#/play")) return;
    const typing=document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    if(!typing && !document.querySelector(".modal-wrap") && document.querySelector("#tc")?.classList.contains("hidden")) rerender();
  }, 30000);

  STARDOM.views = STARDOM.views || {};
  STARDOM.views.shell = render;
})();

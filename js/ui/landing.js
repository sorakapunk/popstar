/* STARDOM · Landing page (public) */
(function(){
  const { ic, esc, store, config } = STARDOM;
  const fmt = n => n.toLocaleString("en-US");
  const news = [
    ["Sep 2, 2026","Forum","Welcome to the Sports Forum","A new forum to organize and join sporting events in the game.","users"],
    ["Jul 3, 2026","Festival","The summer wind came blowin’ in","The Wheels of Kobe festival and an old-school quest are on the way.","star"],
    ["May 12, 2026","Event","Joburg Festival on the Horizon","This fall, all roads lead to Johannesburg — the City of Gold.","mic"]
  ];

  function loginPane(prefill="", notice=""){
    return `
    <form class="pane" id="f-login" novalidate>
      <h2>Welcome <em class="acc">back.</em></h2><p class="s">Your career is waiting.</p>
      ${notice}
      <div id="login-err"></div>
      <label class="field">${ic("user")}<input name="name" placeholder="Username" autocomplete="username" value="${esc(prefill)}" required></label>
      <label class="field">${ic("lock")}<input name="password" type="password" placeholder="Password" autocomplete="current-password" required></label>
      <label class="field">${ic("status")}<select name="status" aria-label="Status"><option>Normal</option><option>Invisible</option></select></label>
      <div class="row"><label><input type="checkbox" name="remember" checked> Keep me logged in</label><a href="#" id="forgot">Forgot?</a></div>
      <button class="btn block" type="submit">Log in ${ic("chev")}</button>
      <p class="fine">Logging in stores cookies to keep you signed in.</p>
    </form>`;
  }
  function registerPane(){
    const lock = store.hasAccount();
    return `
    <form class="pane" id="f-reg" novalidate>
      <h2>Your <em class="acc">debut</em> starts here.</h2><p class="s">Free to play · No downloads</p>
      ${lock?`<div class="msg err">${ic("info")}<span>This browser already has a Stardom account. During the closed test each browser holds one account.</span></div>`:""}
      <div id="reg-err"></div>
      <label class="field" data-f="name">${ic("user")}<input name="name" placeholder="Login name" autocomplete="username" ${lock?"disabled":""}></label>
      <label class="field" data-f="email">${ic("mail")}<input name="email" type="email" placeholder="Email" autocomplete="email" ${lock?"disabled":""}></label>
      <label class="field" data-f="email2">${ic("mail")}<input name="email2" type="email" placeholder="Repeat email" ${lock?"disabled":""}></label>
      <label class="field" data-f="password">${ic("lock")}<input name="password" type="password" placeholder="Password (closed test)" autocomplete="new-password" ${lock?"disabled":""}></label>
      <button class="btn brass block" type="submit" style="margin-top:6px" ${lock?"disabled":""}>Create account ${ic("chev")}</button>
      <p class="fine">Closed test: your account is saved only in this browser.</p>
    </form>`;
  }

  function render(root){
    const s = config.landingSample;
    root.innerHTML = `
    <div class="landing">
      <header class="top"><div class="tb">
        <a class="logo glass" href="#/">${'<span class="mk">'+ic("star")+'</span>'}<span>Stardom</span></a>
        <nav class="pubnav glass"><a href="#/" class="on">Welcome</a><a href="#about">About</a><a href="#news">Help</a><a href="#footer">Contact</a></nav>
      </div></header>

      <section class="hero"><div class="bg" role="img" aria-label="Illustrated night street in Seoul with three young idols"></div>
        <div class="hin">
          <div class="copy" id="about">
            <span class="eyebrow glass">${ic("star")}Free · Real time · In your browser</span>
            <h1><span class="l1">From nobody</span><span class="l2"><span class="to">to</span><em>idol.${ic("star","")}</em></span></h1>
            <p class="lead">Practice, perform and build your fanbase. <b>The world keeps moving — even when you’re offline.</b></p>
            <div class="chips"><span class="glass">${ic("mic")}Play gigs</span><span class="glass">${ic("heart")}Build a fanbase</span><span class="glass">${ic("globe")}Tour the world</span></div>
          </div>
          <div class="hstats" title="Sample numbers for the closed test">
            <div class="st"><b><span class="dot"></span>${fmt(s.online)}</b><small>Online now</small></div>
            <div class="st"><b>${fmt(s.players)}</b><small>Players</small></div>
            <div class="st"><b>${fmt(s.onStage24h)}</b><small>On stage · 24h</small></div>
            <div class="st"><b>${fmt(s.daysOnline)}</b><small>Days online</small></div>
          </div>
          <div class="auth">
            <div class="tabs" role="tablist"><button type="button" class="on" data-tab="login">Log in</button><button type="button" data-tab="register">Register</button></div>
            <div id="pane">${loginPane()}</div>
          </div>
        </div>
      </section>

      <section class="sec" id="news">
        <div class="sh"><div><div class="kicker">Community News</div><h2>What’s <em class="acc">happening</em></h2></div><a href="#news">All news${ic("chev")}</a></div>
        <div class="ng">${news.map(([d,c,t,x,i])=>`<article class="nw"><div class="nt">${ic(i)}</div><div><div class="meta"><span class="cat">${c}</span><time>${d}</time></div><h3>${t}</h3><p>${x}</p><a href="#news">Read more${ic("chev")}</a></div></article>`).join("")}</div>
      </section>

      <footer class="pubfoot" id="footer"><div class="fb">
        <span class="pill">${ic("globe")}<select aria-label="Language"><option>US English</option><option>Português</option><option>Español</option><option>한국어</option></select></span>
        <a href="#footer" class="pill">${ic("phone")}Go mobile</a>
        <span class="age">${ic("shield")}<b>18+</b>Mature content and complex gameplay</span>
        <p class="copyr">© Stardom · ${config.version}</p>
      </div></footer>
    </div>`;
    bind(root);
  }

  function setTab(root, tab, opts={}){
    root.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on", b.dataset.tab===tab));
    root.querySelector("#pane").innerHTML = tab==="login" ? loginPane(opts.prefill, opts.notice) : registerPane();
    bindForms(root);
  }

  function bind(root){
    root.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>setTab(root,b.dataset.tab));
    bindForms(root);
  }

  function bindForms(root){
    const fl = root.querySelector("#f-login");
    if(fl){
      fl.onsubmit = e=>{
        e.preventDefault();
        const d = Object.fromEntries(new FormData(fl));
        const r = store.login({ name:d.name, password:d.password, status:d.status, remember:!!d.remember });
        if(!r.ok){ root.querySelector("#login-err").innerHTML = `<div class="msg err">${ic("alert")}<span>${r.error}</span></div>`; return; }
        location.hash = "#/play/dashboard";
      };
      root.querySelector("#forgot").onclick = e=>{
        e.preventDefault();
        root.querySelector("#login-err").innerHTML = `<div class="msg ok">${ic("info")}<span>Closed test: passwords can’t be recovered. Use “Reset test data” inside the game, or clear this site’s data in the browser.</span></div>`;
      };
    }
    const fr = root.querySelector("#f-reg");
    if(fr){
      fr.onsubmit = e=>{
        e.preventDefault();
        fr.querySelectorAll(".field").forEach(f=>f.classList.remove("err"));
        const d = Object.fromEntries(new FormData(fr));
        const r = store.register(d);
        if(!r.ok){
          if(r.field) fr.querySelector(`[data-f="${r.field}"]`)?.classList.add("err");
          root.querySelector("#reg-err").innerHTML = `<div class="msg err">${ic("alert")}<span>${r.error}</span></div>`;
          return;
        }
        setTab(root,"login",{ prefill:d.name, notice:`<div class="msg ok">${ic("check")}<span>Account created. Log in to start your career.</span></div>` });
      };
    }
  }

  STARDOM.views = STARDOM.views || {};
  STARDOM.views.landing = render;
})();

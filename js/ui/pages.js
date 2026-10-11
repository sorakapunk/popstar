/* STARDOM · Pages (stage 2: character, time, cities, travel, agenda) */
(function(){
  const { ic, esc } = STARDOM;
  const G=()=>STARDOM.game, W=()=>STARDOM.world, T=()=>STARDOM.time, C=()=>STARDOM.config, U=()=>STARDOM.ui;
  const fmtN = n => n.toLocaleString("en-US");

  // ---------- building blocks ----------
  const head=(kicker,title,accent,text,badge)=>`
    <div class="ph"><div><div class="kicker">${kicker}</div><h1>${title} <em class="acc">${accent}</em></h1>${text?`<p>${text}</p>`:""}</div>${badge||""}</div>`;
  const empty=(icon,title,text,stage,cta)=>`
    <div class="empty"><span class="ei">${ic(icon)}</span><div><b>${title}</b><p>${text}</p>${stage?`<span class="badge">Arrives in stage ${stage}</span>`:""}${cta||""}</div></div>`;
  const section=(icon,title,body,right="",cls="")=>`
    <section class="card sect ${cls}"><div class="sect-h"><h2>${ic(icon)}${title}</h2>${right}</div>${body}</section>`;
  const ghostTable=(cols,rows=3)=>`<table class="dtable"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody>${Array.from({length:rows}).map(()=>`<tr class="ghost">${cols.map(()=>"<td>—</td>").join("")}</tr>`).join("")}</tbody></table>`;
  const STAGES=[["Foundation",1],["Character, time & cities",2],["Compose, record & release",3],["Market, TV & Hot 100",4],["Dashboard & alerts",5]];
  const stagebar=cur=>`<div class="stagebar">${STAGES.map(([n,i])=>`<span class="stg ${i<cur?"done":i===cur?"now":""}">${i<cur?ic("check"):""}${i}. ${n}</span>`).join("")}</div>`;
  const lvlName=l=>W().LEVELS[l];
  const meter=(l,color="var(--navy2)")=>`<div class="tr"><div style="width:${(l/C().maxLevel)*100}%;background:${color}"></div></div>`;
  const errBox=r=>`<div class="msg err">${ic("alert")}<span>${r.code?`<b>${r.code}</b> · `:""}${esc(r.error)}</span></div>`;
  const needChar=()=>section("user","No character",empty("user","Create your character first","Name, roleplay age and starting city.",null,`<a class="btn sm" href="#/play/new" style="margin-top:10px">${ic("user")}Create character</a>`));
  const itemCity=it=>W().city(it.type==="travel"?it.from:it.cityId);
  const cityOptions=(sel,t)=>W().CITIES.map(c=>`<option value="${c.id}" ${c.id===sel?"selected":""}>${esc(c.name)} — ${T().fmtTime(t,c.tz)} local</option>`).join("");

  const P={}, B={};

  // ================= DASHBOARD =================
  P.dashboard=(sess,{ch,t})=>{
    if(!ch) return head("Dashboard","Hello,",esc(sess.accountData.name)+".","Your career starts with a character.")
      + section("star","Build progress",stagebar(2))
      + section("user","Your first character", empty("user","No character yet",`Create a character with a name, a roleplay age between ${C().ageMin} and ${C().ageMax} and a starting city. Up to ${C().freeCharacterSlots} characters per account.`,null,`<a class="btn brass sm" href="#/play/new" style="margin-top:10px">${ic("user")}Create character</a>`));
    const w=U().whereText(ch,t), cur=G().currentActivity(ch,t), next=G().upcoming(ch,t)[0];
    const q=[
      ["user","Which character am I controlling?",esc(ch.name)],
      ["pin","Where is it, and what’s the local time?", w.transit?esc(w.text):`${esc(w.city.name)} · <span data-clock="${w.city.tz}">${T().fmtTime(t,w.city.tz)}</span>`],
      ["clock","What is it doing now?", cur?esc(cur.title):"Free"],
      ["cal","What’s the next commitment?", next?`${esc(next.title)} · ${T().fmtFull(next.start,itemCity(next).tz)}`:"Nothing booked"],
      ["alert","Is there any conflict or risk?","No conflicts"],
      ["spark","How much XP and Starcoins do I have?",`${ch.xp} XP · ${fmtN(ch.starcoins)} Starcoins`],
      ["disc","Which release am I working on?",'<span class="badge">Stage 3</span>'],
      ["chart","Where is it on the Hot 100?",'<span class="badge">Stage 4</span>'],
      ["wave","What changed since my last visit?",'<span class="badge">Stage 5</span>'],
      ["check","What decision do I need to make now?",'<span class="badge">Stage 5</span>']
    ];
    return head("Dashboard","Hello,",esc(ch.name)+".", w.transit?`On the way to ${esc(W().city(cur.to).name)}.`:`In ${esc(w.city.name)} — it’s ${T().fmtTime(t,w.city.tz)} there.`)
      + section("home","At a glance",`<ul class="qlist">${q.map(([i,a,v])=>`<li><span class="qi">${ic(i)}</span><span>${a}</span><span class="v strong">${v}</span></li>`).join("")}</ul>`)
      + `<div class="grid2">${section("plane","Quick actions",`<div class="qa"><button class="btn sm" data-dlg="travel">${ic("plane")}Travel</button><a class="btn ghost sm" href="#/play/character">${ic("spark")}Spend XP</a><a class="btn ghost sm" href="#/play/agenda">${ic("cal")}Agenda</a></div>`)}
        ${section("star","Build progress",stagebar(2))}</div>`;
  };
  B.dashboard=(root,sess)=>bindDialogs(root,sess);

  // ================= NEW CHARACTER =================
  P.new=(sess,{g,t})=>{
    const c=C(), left=c.freeCharacterSlots-g.characters.length;
    if(left<=0) return head("Character","Slots","full.","")+section("user","Limit reached",empty("info",`You have ${c.freeCharacterSlots} characters`,"That is the free limit per account."));
    const ages=Array.from({length:c.ageMax-c.ageMin+1},(_,i)=>c.ageMin+i);
    return head("New character","Your","debut.",`Every career starts with a person. ${left} of ${c.freeCharacterSlots} free slots left.`)
      + `<div class="newgrid">
        <form class="card sect" id="f-new" novalidate>
          <div class="sect-h"><h2>${ic("user")}Identity</h2></div>
          <div id="new-err"></div>
          <label class="lbl">Name</label>
          <label class="field">${ic("user")}<input name="name" maxlength="24" placeholder="e.g. Divine Maggart" autocomplete="off"></label>
          <label class="lbl">Roleplay age</label>
          <label class="field">${ic("clock")}<select name="age">${ages.map(a=>`<option ${a===19?"selected":""}>${a}</option>`).join("")}</select></label>
          <label class="lbl">Starting city</label>
          <div class="cpick">${W().CITIES.map(cy=>`<label class="copt"><input type="radio" name="cityId" value="${cy.id}" ${cy.id==="seoul"?"checked":""}><span><b>${esc(cy.name)}</b><small>${esc(cy.country)} · ${T().fmtTime(t,cy.tz)}</small></span></label>`).join("")}</div>
          <button class="btn brass block" type="submit" style="margin-top:16px">Create character ${ic("chev")}</button>
        </form>
        <aside class="card sect preview">
          <div class="pv-ava" id="pv-ava">?</div>
          <h3 id="pv-name">Your name</h3>
          <p id="pv-meta">19 years old · Seoul</p>
          <ul class="qlist">
            <li><span class="qi">${ic("spark")}</span><span>Starting XP</span><span class="v strong">${c.startXP}</span></li>
            <li><span class="qi">${ic("coin")}</span><span>Starting Starcoins</span><span class="v strong">${fmtN(c.startStarcoins)}</span></li>
            <li><span class="qi">${ic("star")}</span><span>Attributes & skills</span><span class="v strong">${lvlName(c.startAttributeLevel)}</span></li>
          </ul>
          <p class="fine" style="text-align:left">Starting values are temporary for the closed test.</p>
        </aside>
      </div>`;
  };
  B.new=(root,sess)=>{
    const f=root.querySelector("#f-new"); if(!f) return;
    const upd=()=>{ const d=Object.fromEntries(new FormData(f)); const n=(d.name||"").trim();
      root.querySelector("#pv-ava").textContent=n?U().initials(n):"?"; root.querySelector("#pv-name").textContent=n||"Your name";
      root.querySelector("#pv-meta").textContent=`${d.age} years old · ${W().city(d.cityId).name}`; };
    f.oninput=upd; f.onchange=upd;
    f.onsubmit=e=>{ e.preventDefault(); const r=G().createCharacter(sess.account,Object.fromEntries(new FormData(f)));
      if(!r.ok){ root.querySelector("#new-err").innerHTML=errBox(r); return; }
      STARDOM.toast("Character created"); location.hash="#/play/character"; };
  };

  // ================= CHARACTER =================
  P.character=(sess,{ch,t,g})=>{
    if(!ch) return head("Character","Who you","are.","")+needChar();
    const c=C(), w=U().whereText(ch,t), wk=T().weekIndex(t), next=T().weekStart(wk+1), est=c.serverOffsetHours;
    const tz=w.transit?est:w.city.tz;
    const can=l=>ch.xp>=c.xpPerLevel && l<c.maxLevel;
    const lvRow=(kind,key,l)=>`<div class="lvrow"><div class="lvn"><b>${esc(key.replace(" (genre)",""))}</b><small>${lvlName(l)} · ${l}/${c.maxLevel}</small></div>${meter(l,kind==="attr"?"var(--brass)":"var(--navy2)")}<button class="btn ghost sm lv" data-kind="${kind}" data-key="${esc(key)}" ${can(l)?"":"disabled"} title="${c.xpPerLevel} XP">${ic("spark")}+1</button></div>`;
    const last=ch.lastXpGrant;
    return head("Character","Who you","are.","Spend XP to raise attributes and skills. Each level costs "+c.xpPerLevel+" XP.")
      + `<section class="card idcard panel-brass">
          <div class="id-ava"><span>${esc(U().initials(ch.name))}</span><i class="on"></i></div>
          <div class="id-main"><div class="kicker sub">Identity</div><h2>${esc(ch.name)}</h2>
            <p>${ch.age} years old · ${w.transit?esc(w.text):`${esc(w.city.name)}, ${esc(w.city.country)} · <span data-clock="${w.city.tz}">${T().fmtTime(t,w.city.tz)}</span> local`}</p></div>
          <div class="id-stats">
            <div class="stb"><b>${ch.xp}</b><small>XP · max ${c.xpStoredMax}</small></div>
            <div class="stb"><b>${fmtN(ch.starcoins)}</b><small>Starcoins</small></div>
          </div>
        </section>`
      + section("spark","Weekly XP",`<ul class="qlist">
          <li><span class="qi">${ic("clock")}</span><span>Next weekly XP</span><span class="v strong">${T().fmtFull(next,tz)}${w.transit?" EST":" local"}</span></li>
          <li><span class="qi">${ic("check")}</span><span>Active this week</span><span class="v strong">${ch.activeWeeks[wk]?"Yes":"Not yet"}</span></li>
          <li><span class="qi">${ic("wave")}</span><span>Last weekly XP</span><span class="v strong">${last?`+${last.received}${last.received<last.amount?` (of ${last.amount}, storage full)`:""}`:"—"}</span></li>
        </ul><p class="note">${c.xpWeeklyBase} XP base + ${c.xpWeeklyChallenges} for weekly challenges + ${c.xpWeeklyActivity} for being active, up to ${c.xpWeeklyMax} per week. Each level costs ${c.xpPerLevel} XP.</p>`)
      + section("star","Attributes",`<div class="lvlist">${W().ATTRIBUTES.map(a=>lvRow("attr",a,ch.attrs[a])).join("")}</div>`)
      + W().SKILL_BLOCKS.map(b=>{
          const core=b.skills.filter(s=>!s.endsWith("(genre)")), gen=b.skills.filter(s=>s.endsWith("(genre)"));
          const list=arr=>`<div class="lvlist cols">${arr.map(s=>lvRow("skill",s,ch.skills[s])).join("")}</div>`;
          return section(b.block==="Instruments"?"mic":b.block==="Music"?"disc":"users",b.block, list(core)+(gen.length?`<div class="subh">Genre skills</div>`+list(gen):""));
        }).join("");
  };
  B.character=(root,sess)=>{
    root.querySelectorAll(".lv").forEach(b=>b.onclick=()=>{
      const r=G().levelUp(sess.account,b.dataset.kind,b.dataset.key);
      if(!r.ok) return STARDOM.toast(r.error,"err");
      const y=window.scrollY; STARDOM.rerender(); window.scrollTo(0,y);
      STARDOM.toast(`${b.dataset.key}: ${lvlName(r.level)}`);
    });
  };

  // ================= AGENDA =================
  P.agenda=(sess,{ch,t})=>{
    if(!ch) return head("Agenda","Your","schedule.","")+needChar();
    const list=G().upcoming(ch,t), cur=G().currentActivity(ch,t);
    const rows=[...(cur?[cur]:[]),...list].map(it=>{ const c=itemCity(it), started=it.start<=t;
      const where = it.type==="travel" ? `${esc(W().city(it.from).name)} → ${esc(W().city(it.to).name)}` : esc(c.name);
      return `<tr><td>${T().fmtDate(it.start,c.tz)}</td><td><b>${T().fmtTime(it.start,c.tz)}</b>–${T().fmtTime(it.end,(it.type==="travel"?W().city(it.to):c).tz)}</td><td>${where}</td>
        <td>${ic(it.type==="travel"?"plane":"cal")} ${esc(it.title)}${it.type==="test"?' <span class="badge navy">Test</span>':""}</td><td>${T().fmtDur(it.minutes)}</td>
        <td class="r">${started?'<span class="badge">Now</span>':`<button class="btn ghost sm" data-cancel="${it.id}">Cancel</button>`}</td></tr>`; }).join("");
    const past=(ch.past||[]).slice(-5).reverse();
    return head("Agenda","Your","schedule.","Every time is shown in the local time of the city where it happens.",`<div class="qa"><button class="btn sm" data-dlg="travel">${ic("plane")}Book travel</button><button class="btn ghost sm" data-dlg="test">${ic("cal")}Test commitment</button></div>`)
      + section("cal","Upcoming", rows?`<div class="tscroll"><table class="dtable"><thead><tr><th>Date</th><th>Local time</th><th>City</th><th>Activity</th><th>Duration</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
          : empty("cal","Nothing booked","Book a trip, or add a test commitment to check the agenda rules."))
      + section("info","Rules",`<ul class="qlist">
          <li><span class="qi">${ic("alert")}</span><span><b>E-AGENDA-01</b> · Two activities can’t overlap.</span><span></span></li>
          <li><span class="qi">${ic("pin")}</span><span><b>E-CIDADE-01</b> · The character must be in the activity’s city.</span><span></span></li>
          <li><span class="qi">${ic("plane")}</span><span><b>E-VIAGEM-01</b> · There must be time to travel there first.</span><span></span></li></ul>`)
      + (past.length?section("clock","Recently finished",`<table class="dtable"><tbody>${past.map(it=>{const c=itemCity(it);return `<tr><td>${T().fmtFull(it.start,c.tz)}</td><td>${esc(it.title)}</td><td>${T().fmtDur(it.minutes)}</td></tr>`;}).join("")}</tbody></table>`):"");
  };
  B.agenda=(root,sess)=>{
    bindDialogs(root,sess);
    root.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=()=>{
      const r=G().cancel(sess.account,b.dataset.cancel); if(!r.ok) return STARDOM.toast((r.code?r.code+" · ":"")+r.error,"err");
      STARDOM.rerender(); STARDOM.toast("Commitment cancelled"); });
  };

  // ================= CITY =================
  P.city=(sess,{ch,t,g})=>{
    if(!ch) return head("City","Where you","are.","")+needChar();
    const w=U().whereText(ch,t);
    if(w.transit) return head("City","In","transit.",esc(w.text))+section("plane","Travel",empty("plane","On the way",`Arriving in ${esc(w.city.name)} in ${T().fmtRel(G().currentActivity(ch,t).end-t)}.`));
    const cy=w.city, here=g.characters.filter(x=>{const l=G().locationAt(x,t);return !l.transit&&l.cityId===cy.id;});
    return head("City",esc(cy.name),"·",`${esc(cy.country)} · local time <b data-clock="${cy.tz}">${T().fmtTime(t,cy.tz)}</b> · UTC${cy.tz>=0?"+":""}${cy.tz}`,`<button class="btn sm" data-dlg="travel">${ic("plane")}Travel</button>`)
      + `<div class="grid3">
          <div class="card sect stbig"><small>Local time</small><b data-clock="${cy.tz}">${T().fmtTime(t,cy.tz)}</b><span>${T().fmtDate(t,cy.tz)}</span></div>
          <div class="card sect stbig"><small>Population density</small><b>${W().DENSITY[cy.density]}</b><div class="dots">${[1,2,3,4,5].map(i=>`<i class="${i<=cy.density?"on":""}"></i>`).join("")}</div></div>
          <div class="card sect stbig"><small>Your characters here</small><b>${here.length}</b><span>${here.map(x=>esc(x.name)).join(", ")}</span></div>
        </div>`
      + section("home","Locations",`<div class="locgrid">${W().locations(cy.id).map(l=>`<div class="loc"><span class="ei">${ic(l.icon)}</span><div><b>${esc(l.label)}</b><small>${esc(l.name)}</small></div></div>`).join("")}</div>`)
      + section("users","People here",`<p class="note" style="margin:0">Other players will appear here once the game runs on a shared server. For now you see only your own characters.</p>`);
  };
  B.city=(root,sess)=>bindDialogs(root,sess);

  // ================= CITIES & TRAVEL =================
  P.cities=(sess,{ch,t})=>{
    const w=ch?U().whereText(ch,t):null, from=w&&!w.transit?w.city.id:null;
    const rows=W().CITIES.map(cy=>{ const isHere=cy.id===from, mins=from?W().travelMinutes(from,cy.id):null;
      return `<tr class="${isHere?"here":""}"><td><b>${esc(cy.name)}</b><br><small>${esc(cy.country)}</small></td><td data-clock="${cy.tz}">${T().fmtTime(t,cy.tz)}</td><td>UTC${cy.tz>=0?"+":""}${cy.tz}</td><td>${W().DENSITY[cy.density]}</td>
        <td>${isHere?'<span class="badge">You are here</span>':mins?T().fmtDur(mins):"—"}</td><td class="r">${ch&&!isHere&&from?`<button class="btn ghost sm" data-dlg="travel" data-to="${cy.id}">${ic("plane")}Travel</button>`:""}</td></tr>`; }).join("");
    return head("World","21","cities.","Local time, density and travel time from where you are. Trips take from 30 minutes to 4 hours.")
      + (w&&w.transit?`<div class="msg ok">${ic("plane")}<span>${esc(w.text)} — you can book the next trip from the Agenda.</span></div>`:"")
      + section("globe","Cities",`<div class="tscroll"><table class="dtable"><thead><tr><th>City</th><th>Local time</th><th>Zone</th><th>Density</th><th>Travel</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`);
  };
  B.cities=(root,sess)=>bindDialogs(root,sess);

  // ================= later stages =================
  P.artist=()=>head("Artist","Your","career.","Solo artist, career cash, compositions, recordings and your catalog.",'<span class="badge navy">Stage 3</span>')
    + `<div class="grid3">${section("mic","Artist",empty("mic","Start a solo career","Artist name and main genre.",3))}${section("coin","Career cash",empty("coin","Separate from Starcoins","Deposit anytime, withdraw once every 24 hours.",3))}${section("disc","Active single",empty("disc","Nothing released","A single stays commercially active for up to 180 days.",3))}</div>`
    + section("disc","Catalog",ghostTable(["Song","Genre","Status","Quality"],3));
  P.media=()=>head("Media","On","air.","TV programs in your current city, with audience, days and local hours.",'<span class="badge navy">Stage 4</span>')
    + section("tv","TV grid",ghostTable(["Program","Audience","Days","Local time","Status"],4));
  P.charts=()=>head("Charts","Hot","100.","Position, last week, movement, peak and weeks on chart.",'<span class="badge navy">Stage 4</span>')
    + section("chart","Hot 100",ghostTable(["#","Last","Song","Artist","Peak","Weeks"],5));

  // ================= dialogs =================
  function bindDialogs(root,sess){
    root.querySelectorAll("[data-dlg]").forEach(b=>b.onclick=()=>b.dataset.dlg==="travel"?D.travel(sess,b.dataset.to):D.testBooking(sess));
  }
  const D={};
  D.travel=(sess,preset)=>{
    const {ch,t}=G().snapshot(sess.account); if(!ch) return;
    const w=U().whereText(ch,t);
    const base = w.transit ? W().city(G().currentActivity(ch,t).to) : w.city;
    const startDef=T().toInput(Math.ceil((t+3600e3)/900000)*900000, base.tz);
    STARDOM.modal(`
      <div class="mh"><div><div class="kicker">Travel</div><h3>Book a <em class="acc">trip</em></h3></div><button class="tbtn light" data-close>${ic("chev")}</button></div>
      <form id="f-tr" novalidate>
        <div id="tr-err"></div>
        <label class="lbl">Destination</label>
        <label class="field">${ic("pin")}<select name="to">${W().CITIES.filter(c=>c.id!==base.id).map(c=>`<option value="${c.id}" ${c.id===(preset||"")?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label>
        <label class="lbl">Departure</label>
        <div class="seg"><label><input type="radio" name="when" value="now" ${w.transit?"disabled":"checked"}><span>Now</span></label><label><input type="radio" name="when" value="later" ${w.transit?"checked":""}><span>Schedule</span></label></div>
        <label class="field when-later ${w.transit?"":"hidden"}">${ic("clock")}<input type="datetime-local" name="start" value="${startDef}"></label>
        <p class="note when-later ${w.transit?"":"hidden"}">Time in ${esc(base.name)} local time.</p>
        <div class="trinfo" id="tr-info"></div>
        <button class="btn block" type="submit">${ic("plane")}Confirm trip</button>
      </form>`,(m,close)=>{
        const f=m.querySelector("#f-tr");
        const upd=()=>{ const d=Object.fromEntries(new FormData(f)); f.querySelectorAll(".when-later").forEach(x=>x.classList.toggle("hidden",d.when!=="later"));
          const mins=W().travelMinutes(base.id,d.to);
          m.querySelector("#tr-info").innerHTML = mins?`${ic("plane")}<span>${esc(base.name)} → ${esc(W().city(d.to).name)} · <b>${T().fmtDur(mins)}</b>. The trip blocks your agenda.</span>`:`${ic("info")}<span>You will already be in ${esc(base.name)}.</span>`; };
        f.onchange=upd; upd();
        f.onsubmit=e=>{ e.preventDefault(); const d=Object.fromEntries(new FormData(f));
          const start = d.when==="later" ? T().fromInput(d.start,base.tz) : undefined;
          const r=G().bookTravel(sess.account,{to:d.to,start});
          if(!r.ok){ m.querySelector("#tr-err").innerHTML=errBox(r); return; }
          close(); STARDOM.rerender(); STARDOM.toast(`Trip to ${W().city(d.to).name} booked`); };
      });
  };
  D.testBooking=sess=>{
    const {ch,t}=G().snapshot(sess.account); if(!ch) return;
    const w=U().whereText(ch,t), base=w.transit?W().city(G().currentActivity(ch,t).to):w.city;
    const locOpts=id=>W().locations(id).map(l=>`<option value="${l.id}">${esc(l.label)}</option>`).join("");
    STARDOM.modal(`
      <div class="mh"><div><div class="kicker">Closed test only</div><h3>Test <em class="acc">commitment</em></h3></div><button class="tbtn light" data-close>${ic("chev")}</button></div>
      <p class="note">A placeholder in-person activity, used only to check the agenda and city rules. Real activities arrive in the next stages.</p>
      <form id="f-tb" novalidate>
        <div id="tb-err"></div>
        <label class="lbl">City</label>
        <label class="field">${ic("pin")}<select name="cityId">${W().CITIES.map(c=>`<option value="${c.id}" ${c.id===base.id?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label>
        <label class="lbl">Location</label>
        <label class="field">${ic("home")}<select name="locationId">${locOpts(base.id)}</select></label>
        <div class="two"><div><label class="lbl" id="tb-tzl">Start (${esc(base.name)} time)</label>
          <label class="field">${ic("clock")}<input type="datetime-local" name="start" value="${T().toInput(Math.ceil((t+2*3600e3)/900000)*900000,base.tz)}"></label></div>
          <div><label class="lbl">Duration</label><label class="field">${ic("wave")}<select name="minutes">${[60,120,180,240].map(m=>`<option value="${m}">${m/60} h</option>`).join("")}</select></label></div></div>
        <button class="btn block" type="submit">${ic("cal")}Add to agenda</button>
      </form>`,(m,close)=>{
        const f=m.querySelector("#f-tb"); let cur=base.id;
        f.cityId.onchange=()=>{ const ncy=W().city(f.cityId.value), old=W().city(cur);
          const ms=T().fromInput(f.start.value,old.tz); f.start.value=T().toInput(ms,ncy.tz);
          f.locationId.innerHTML=locOpts(ncy.id); m.querySelector("#tb-tzl").textContent=`Start (${ncy.name} time)`; cur=ncy.id; };
        f.onsubmit=e=>{ e.preventDefault(); const d=Object.fromEntries(new FormData(f)); const cy=W().city(d.cityId);
          const r=G().bookTest(sess.account,{cityId:d.cityId,locationId:d.locationId,start:T().fromInput(d.start,cy.tz),minutes:Number(d.minutes)});
          if(!r.ok){ m.querySelector("#tb-err").innerHTML=errBox(r); return; }
          close(); STARDOM.rerender(); STARDOM.toast("Test commitment added"); };
      });
  };

  STARDOM.pages=P; STARDOM.pageBind=B; STARDOM.dialogs=D;
})();

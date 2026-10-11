/* STARDOM · Pages (stage 1 = structure + empty states) */
(function(){
  const { ic, esc } = STARDOM;

  const head = (kicker, title, accent, text, stage) => `
    <div class="ph"><div>
      <div class="kicker">${kicker}</div>
      <h1>${title} <em class="acc">${accent}</em></h1>
      <p>${text}</p>
    </div>${stage?`<span class="badge navy">Stage ${stage}</span>`:""}</div>`;
  const empty = (icon, title, text, stage) => `
    <div class="empty"><span class="ei">${ic(icon)}</span><div><b>${title}</b><p>${text}</p>${stage?`<span class="badge">Arrives in stage ${stage}</span>`:""}</div></div>`;
  const section = (icon, title, body, right="") => `
    <section class="card sect"><div class="sect-h"><h2>${ic(icon)}${title}</h2>${right}</div>${body}</section>`;
  const ghostTable = (cols, rows=3) => `
    <table class="dtable"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join("")}</tr></thead>
    <tbody>${Array.from({length:rows}).map(()=>`<tr class="ghost">${cols.map(()=>"<td>—</td>").join("")}</tr>`).join("")}</tbody></table>`;

  const STAGES = [
    ["Foundation",1],["Character, time & cities",2],["Compose, record & release",3],["Market, TV & Hot 100",4],["Dashboard & alerts",5]
  ];
  const stagebar = () => `<div class="stagebar">${STAGES.map(([n,i])=>`<span class="stg ${i===1?"now":""}">${i===1?ic("check"):""}${i}. ${n}</span>`).join("")}</div>`;

  const P = {};

  P.dashboard = sess => {
    const q = [
      ["user","Which character am I controlling?"],["pin","Where is it, and what’s the local time?"],["clock","What is it doing now?"],
      ["cal","What’s the next commitment?"],["alert","Is there any conflict or risk?"],["spark","How much XP and Starcoins do I have?"],
      ["disc","Which release am I working on?"],["chart","Where is it on the Hot 100?"],["wave","What changed since my last visit?"],["check","What decision do I need to make now?"]
    ];
    return head("Dashboard", "Hello,", esc(sess.accountData.name)+".", "Your account is ready. The game is being built in stages — this is the foundation.", 1)
    + section("star","Build progress", stagebar())
    + `<div class="grid2">
        ${section("user","Your first character", empty("user","No character yet","Create a character with a name, a roleplay age between 16 and 25 and a starting city.",2))}
        ${section("mic","Your artist career", empty("mic","No artist yet","Start a solo career, compose, record and release your first single.",3))}
      </div>`
    + section("home","At a glance", `<ul class="qlist">${q.map(([i,t])=>`<li><span class="qi">${ic(i)}</span><span>${t}</span><span class="v">—</span></li>`).join("")}</ul>`, `<span class="badge">Stage 5</span>`);
  };

  P.character = () =>
    head("Character","Who you","are.","Identity, current city, attributes, skills, XP and personal Starcoins.",2)
    + `<div class="grid2">
        ${section("user","Identity", empty("user","Create your character","Name, roleplay age (16–25) and starting city. Up to 5 characters per account.",2))}
        ${section("spark","XP", empty("spark","Weekly XP","3 base + 5 challenges + 2 activity, up to 10 per week. Each level costs 5 XP.",2))}
      </div>`
    + section("star","Attributes", `<div class="grid2">${["Visual","Charisma","Talent","Persuasion"].map(a=>`<div class="meter"><div class="mh"><span>${a}</span><b>—</b></div><div class="tr"><div style="width:0"></div></div></div>`).join("")}</div>`)
    + section("disc","Skills", ghostTable(["Block","Skill","Level"],4));

  P.agenda = () =>
    head("Agenda","Your","schedule.","Every commitment shown in the local time of the city where it happens.",2)
    + section("cal","Upcoming", ghostTable(["Date","Local time","City","Activity","Duration"],4))
    + empty("alert","Conflict checks","A character can never be in two in-person activities or two cities at the same time.",2);

  P.artist = () =>
    head("Artist","Your","career.","Solo artist, career cash, compositions, recordings and your catalog.",3)
    + `<div class="grid3">
        ${section("mic","Artist", empty("mic","Start a solo career","Artist name and main genre.",3))}
        ${section("coin","Career cash", empty("coin","Separate from Starcoins","Deposit anytime, withdraw once every 24 hours.",3))}
        ${section("disc","Active single", empty("disc","Nothing released","A single stays commercially active for up to 180 days.",3))}
      </div>`
    + section("disc","Catalog", ghostTable(["Song","Genre","Status","Quality"],3));

  P.city = () =>
    head("City","Where you","are.","Local time, population density, locations and who is around.",2)
    + `<div class="grid2">
        ${section("pin","Current city", empty("pin","No city yet","Pick one of the 21 cities when you create your character.",2))}
        ${section("plane","Travel", empty("plane","Travel between cities","Trips take from 30 minutes to 4 hours and block your agenda.",2))}
      </div>`
    + section("home","Locations", ghostTable(["Location","Type","Open"],3));

  P.media = () =>
    head("Media","On","air.","TV programs in your current city, with audience, days and local hours.",4)
    + section("tv","TV grid", ghostTable(["Program","Audience","Days","Local time","Status"],4))
    + empty("info","Limits","One TV appearance per day per character, and each program once a week per artist.",4);

  P.charts = () =>
    head("Charts","Hot","100.","Position, last week, movement, peak and weeks on chart.",4)
    + section("chart","Hot 100", ghostTable(["#","Last","Song","Artist","Peak","Weeks"],5));

  STARDOM.pages = P;
})();

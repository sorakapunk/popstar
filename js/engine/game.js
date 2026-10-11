/* STARDOM · engine/game.js
   Game rules for stage 2: characters, XP, attributes/skills, time, travel, agenda.
   Pure logic — the UI only calls these actions. Ready to move to a server later. */
(function(){
  const C=()=>STARDOM.config, W=()=>STARDOM.world, T=()=>STARDOM.time, S=()=>STARDOM.store;
  const MIN=60000;

  const ERR = {
    "E-AGENDA-01":"The character already has an activity in this interval.",
    "E-CIDADE-01":"The character will not be in the required city at the activity time.",
    "E-VIAGEM-01":"There is not enough time to reach the destination before the commitment."
  };
  const fail=(code,extra)=>({ ok:false, code, error:(ERR[code]||code)+(extra?" "+extra:"") });
  const plain=msg=>({ ok:false, code:null, error:msg });

  // ---------- load / save / clock ----------
  function blank(){ return { clockOffset:0, lastWeek:T().weekIndex(Date.now()), characters:[], activeId:null, seq:1 }; }
  function load(acc){ return S().readGame(acc) || blank(); }
  function save(acc,g){ S().writeGame(acc,g); }
  const now = g => Date.now() + (g.clockOffset||0);
  const nid = g => "i"+(g.seq++);

  // ---------- location & agenda helpers ----------
  const sorted = list => [...list].sort((a,b)=>a.start-b.start);
  function locationAt(ch, t, agenda){
    let city=ch.cityId;
    for(const it of sorted(agenda||ch.agenda)){
      if(it.type!=="travel") continue;
      if(t>=it.end) city=it.to;
      else if(t>=it.start) return { transit:true, from:it.from, to:it.to, item:it, cityId:null };
      else break;
    }
    return { transit:false, cityId:city };
  }
  const currentActivity = (ch,t) => ch.agenda.find(it=>it.start<=t && t<it.end) || null;
  const upcoming = (ch,t) => sorted(ch.agenda).filter(it=>it.start>t);

  // ---------- processing (travel arrival, weekly XP) ----------
  function process(g){
    const t=now(g);
    for(const ch of g.characters){
      const done=[];
      for(const it of sorted(ch.agenda)){
        if(it.end<=t){ if(it.type==="travel") ch.cityId=it.to; done.push(it); }
      }
      if(done.length){
        ch.agenda=ch.agenda.filter(it=>!done.includes(it));
        ch.past=(ch.past||[]).concat(done).slice(-50);
      }
    }
    // weekly XP (EST tick)
    const cw=T().weekIndex(t), c=C();
    for(let w=g.lastWeek+1; w<=cw; w++){
      const ended=w-1, at=T().weekStart(w);
      for(const ch of g.characters){
        if(ch.createdAt>=at) continue;
        const active=!!ch.activeWeeks[ended];
        let base;
        if(active){ ch.inactiveStreak=0; base=c.xpWeeklyBase; }
        else { ch.inactiveStreak=(ch.inactiveStreak||0)+1; base = ch.inactiveStreak>=2 ? c.xpBaseAfter2InactiveWeeks : c.xpBaseAfter1InactiveWeek; }
        const total=Math.min(c.xpWeeklyMax, base + (ch.challengeWeeks[ended]?c.xpWeeklyChallenges:0) + (active?c.xpWeeklyActivity:0));
        const before=ch.xp; ch.xp=Math.min(c.xpStoredMax, ch.xp+total);
        ch.lastXpGrant={ week:ended, amount:total, received:ch.xp-before, at };
      }
    }
    g.lastWeek=Math.max(g.lastWeek,cw);
    return g;
  }
  function markActive(g,ch){ ch.activeWeeks[T().weekIndex(now(g))]=true; }

  // run an action: load → process → fn → save
  function act(acc, fn){
    const g=process(load(acc));
    const r=fn(g);
    if(r && r.ok===false) { save(acc,g); return r; }
    save(acc,g); return r||{ok:true};
  }
  const active = g => g.characters.find(c=>c.id===g.activeId) || null;

  // ---------- characters ----------
  function createCharacter(acc,{name,age,cityId}){
    return act(acc,g=>{
      const c=C(); name=(name||"").trim().replace(/\s+/g," "); age=Number(age);
      if(g.characters.length>=c.freeCharacterSlots) return plain(`This account already has ${c.freeCharacterSlots} characters, the free limit.`);
      if(!/^[\p{L}][\p{L} .'-]{1,23}$/u.test(name)) return plain("Character name must have 2–24 letters (spaces, dots, apostrophes and hyphens allowed).");
      if(g.characters.some(x=>x.name.toLowerCase()===name.toLowerCase())) return plain("You already have a character with this name.");
      if(!(age>=c.ageMin && age<=c.ageMax)) return plain(`Roleplay age must be between ${c.ageMin} and ${c.ageMax}.`);
      if(!W().city(cityId)) return plain("Choose a starting city.");
      const attrs=Object.fromEntries(W().ATTRIBUTES.map(a=>[a,c.startAttributeLevel]));
      const skills=Object.fromEntries(W().SKILL_BLOCKS.flatMap(b=>b.skills).map(s=>[s,c.startSkillLevel]));
      const ch={ id:nid(g), name, age, cityId, createdAt:now(g), xp:c.startXP, starcoins:c.startStarcoins,
        attrs, skills, agenda:[], past:[], activeWeeks:{}, challengeWeeks:{}, inactiveStreak:0, lastXpGrant:null };
      g.characters.push(ch); g.activeId=ch.id; markActive(g,ch);
      return { ok:true, id:ch.id };
    });
  }
  function setActive(acc,id){ return act(acc,g=>{ if(!g.characters.some(c=>c.id===id)) return plain("Character not found."); g.activeId=id; }); }

  function levelUp(acc,kind,key){
    return act(acc,g=>{
      const ch=active(g), c=C(); if(!ch) return plain("Create a character first.");
      const bag = kind==="attr"?ch.attrs:ch.skills;
      if(!(key in bag)) return plain("Unknown attribute or skill.");
      if(bag[key]>=c.maxLevel) return plain(`${key} is already at the maximum level.`);
      if(ch.xp<c.xpPerLevel) return plain(`${c.xpPerLevel} XP are required to raise one level.`);
      ch.xp-=c.xpPerLevel; bag[key]++; markActive(g,ch);
      return { ok:true, level:bag[key] };
    });
  }

  // ---------- agenda validation ----------
  function validateNew(g,ch,item){
    const t=now(g);
    if(item.start<t) return plain("The start time must be in the future.");
    if(ch.agenda.some(it=>item.start<it.end && item.end>it.start)) return fail("E-AGENDA-01");
    if(item.type==="test"){
      const loc=locationAt(ch,item.start);
      if(loc.cityId!==item.cityId){
        const prevEnd=Math.max(t, ...ch.agenda.filter(it=>it.end<=item.start).map(it=>it.end));
        const need=W().travelMinutes(loc.cityId,item.cityId)*MIN;
        return (item.start-prevEnd>=need) ? fail("E-CIDADE-01","Book a trip to arrive in time.") : fail("E-VIAGEM-01");
      }
    }
    if(item.type==="travel"){
      if(item.from===item.to) return plain(`The character will already be in ${W().city(item.to).name} at that time.`);
      const broken=checkChain(ch,[...ch.agenda,item]);
      if(broken) return broken;
    }
    return null;
  }
  // every later commitment/travel must still start in the right city
  function checkChain(ch,agenda){
    for(const it of sorted(agenda)){
      const loc=locationAt(ch,it.start,agenda.filter(x=>x!==it));
      if(loc.transit) return fail("E-AGENDA-01");
      if(it.type==="test" && loc.cityId!==it.cityId) return fail("E-CIDADE-01",`(${it.title} in ${W().city(it.cityId).name}.)`);
      if(it.type==="travel" && loc.cityId!==it.from) return fail("E-CIDADE-01",`(Trip from ${W().city(it.from).name}.)`);
    }
    return null;
  }

  // ---------- actions with presence ----------
  function bookTravel(acc,{to,start}){
    return act(acc,g=>{
      const ch=active(g); if(!ch) return plain("Create a character first.");
      if(!W().city(to)) return plain("Choose a destination.");
      const s=start ?? now(g);
      const loc=locationAt(ch,s);
      if(loc.transit) return fail("E-AGENDA-01");
      const mins=W().travelMinutes(loc.cityId,to);
      const item={ id:nid(g), type:"travel", from:loc.cityId, to, start:s, end:s+mins*MIN, minutes:mins, title:`Travel to ${W().city(to).name}` };
      const err=validateNew(g,ch,item); if(err) return err;
      ch.agenda.push(item); markActive(g,ch);
      return { ok:true, item };
    });
  }
  // TEST ONLY: an in-person placeholder commitment to exercise agenda/city rules
  function bookTest(acc,{cityId,locationId,start,minutes}){
    return act(acc,g=>{
      const ch=active(g); if(!ch) return plain("Create a character first.");
      const loc=W().locations(cityId).find(l=>l.id===locationId); if(!loc) return plain("Choose a location.");
      const item={ id:nid(g), type:"test", cityId, locationId, start, end:start+minutes*MIN, minutes, title:`Test booking · ${loc.label}` };
      const err=validateNew(g,ch,item); if(err) return err;
      ch.agenda.push(item); markActive(g,ch);
      return { ok:true, item };
    });
  }
  function cancel(acc,id){
    return act(acc,g=>{
      const ch=active(g); const it=ch?.agenda.find(x=>x.id===id); if(!it) return plain("Commitment not found.");
      if(it.start<=now(g)) return plain("This activity has already started and can’t be cancelled.");
      const rest=ch.agenda.filter(x=>x!==it);
      const broken=checkChain(ch,rest); if(broken) return { ...broken, error:"Cancelling this would break a later commitment. "+broken.error };
      ch.agenda=rest;
    });
  }

  // ---------- test controls ----------
  function advance(acc,ms){ return act(acc,g=>{ g.clockOffset=(g.clockOffset||0)+ms; }); }
  function setChallenges(acc,on){
    return act(acc,g=>{ const ch=active(g); if(!ch) return plain("Create a character first."); const w=T().weekIndex(now(g)); if(on) ch.challengeWeeks[w]=true; else delete ch.challengeWeeks[w]; });
  }

  // read-only snapshot for the UI (also processes pending updates)
  function snapshot(acc){ const g=process(load(acc)); save(acc,g); return { g, t:now(g), ch:active(g) }; }

  STARDOM.game = { snapshot, createCharacter, setActive, levelUp, bookTravel, bookTest, cancel, advance, setChallenges,
                   locationAt, currentActivity, upcoming, ERR };
})();

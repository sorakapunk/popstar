/* STARDOM · engine/store.js
   Persistence + fake local auth for the closed test.
   Pure logic: no DOM here. Swap this file for a real API later. */
(function(){
  const C = STARDOM.config;
  const KEY = C.storageKey;

  function load(){
    try { return JSON.parse(localStorage.getItem(KEY)) || { accounts:{} }; }
    catch(e){ return { accounts:{} }; }
  }
  function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }

  // NOT security. Only avoids storing the test password as plain text.
  function hash(s){ let h=5381; for(let i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))|0; } return "h"+(h>>>0).toString(36); }

  const ERR = {
    NAME:  "Login name must have 3–20 letters, numbers, dots or underscores.",
    EMAIL: "Enter a valid email.",
    EMAIL2:"The emails don’t match.",
    PASS:  "Password must have at least 6 characters.",
    LIMIT: "This browser already has a Stardom account. Log in with it.",
    TAKEN: "This login name is already in use.",
    LOGIN: "Wrong username or password."
  };

  function register({ name, email, email2, password }){
    name=(name||"").trim(); email=(email||"").trim().toLowerCase(); email2=(email2||"").trim().toLowerCase();
    if(!/^[A-Za-z0-9._]{3,20}$/.test(name)) return { ok:false, field:"name", error:ERR.NAME };
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok:false, field:"email", error:ERR.EMAIL };
    if(email!==email2) return { ok:false, field:"email2", error:ERR.EMAIL2 };
    if((password||"").length<6) return { ok:false, field:"password", error:ERR.PASS };
    const db=load();
    if(db.accounts[name.toLowerCase()]) return { ok:false, field:"name", error:ERR.TAKEN };
    if(Object.keys(db.accounts).length>=C.accountsPerBrowser) return { ok:false, field:null, error:ERR.LIMIT };
    db.accounts[name.toLowerCase()] = { name, email, pass:hash(password), createdAt:new Date().toISOString(), characters:[], activeCharacter:null };
    save(db);
    return { ok:true };
  }

  function login({ name, password, status, remember }){
    const db=load(); const acc=db.accounts[(name||"").trim().toLowerCase()];
    if(!acc || acc.pass!==hash(password||"")) return { ok:false, error:ERR.LOGIN };
    const session={ account:acc.name.toLowerCase(), status:status||"Normal", since:new Date().toISOString() };
    (remember?localStorage:sessionStorage).setItem(KEY+".session", JSON.stringify(session));
    return { ok:true, session };
  }

  function session(){
    const raw=localStorage.getItem(KEY+".session")||sessionStorage.getItem(KEY+".session");
    if(!raw) return null;
    const s=JSON.parse(raw); const acc=load().accounts[s.account];
    return acc ? { ...s, accountData:acc } : null;
  }
  function logout(){ localStorage.removeItem(KEY+".session"); sessionStorage.removeItem(KEY+".session"); }
  function setStatus(status){
    const store=localStorage.getItem(KEY+".session")?localStorage:sessionStorage;
    const s=JSON.parse(store.getItem(KEY+".session")||"null"); if(!s) return;
    s.status=status; store.setItem(KEY+".session", JSON.stringify(s));
  }
  function resetAll(){ localStorage.removeItem(KEY); logout(); }
  function hasAccount(){ return Object.keys(load().accounts).length>0; }

  STARDOM.store = { register, login, session, logout, setStatus, resetAll, hasAccount };
})();

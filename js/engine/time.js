/* STARDOM · engine/time.js
   All instants are stored in UTC ms. Players see the local time of the city.
   System updates are scheduled in EST (fixed UTC-5). */
(function(){
  const H=3600e3, D=24*H, W=7*D;
  const C=()=>STARDOM.config;
  const WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pad=n=>String(n).padStart(2,"0");

  // wall clock of a UTC instant at a fixed offset
  const wall=(t,tz)=>new Date(t+tz*H);
  function fmtTime(t,tz){ const d=wall(t,tz); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; }
  function fmtDate(t,tz){ const d=wall(t,tz); return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`; }
  function fmtFull(t,tz){ return `${fmtDate(t,tz)} · ${fmtTime(t,tz)}`; }
  function fmtDur(min){ const h=Math.floor(min/60), m=min%60; return h&&m?`${h} h ${m} min`:h?`${h} h`:`${m} min`; }
  function fmtRel(ms){ const m=Math.round(ms/60000); if(m<60) return `${m} min`; const h=Math.floor(m/60); if(h<48) return `${h} h ${m%60?(m%60)+" min":""}`.trim(); return `${Math.floor(h/24)} days`; }
  // "YYYY-MM-DDTHH:MM" in a city's local time  <->  UTC ms
  function toInput(t,tz){ const d=wall(t,tz); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; }
  function fromInput(str,tz){ const [a,b]=str.split("T"); const [y,mo,da]=a.split("-").map(Number); const [h,mi]=b.split(":").map(Number); return Date.UTC(y,mo-1,da,h,mi)-tz*H; }

  // Weekly index anchored on the configured EST tick (Monday 00:00 EST by default)
  function weekIndex(t){
    const {weekday,hour}=C().weeklyTick, tz=C().serverOffsetHours;
    // 1970-01-05 was a Monday
    const anchor=Date.UTC(1970,0,4+weekday,hour)-tz*H;
    return Math.floor((t-anchor)/W);
  }
  function weekStart(i){ const {weekday,hour}=C().weeklyTick, tz=C().serverOffsetHours; return Date.UTC(1970,0,4+weekday,hour)-tz*H + i*W; }

  STARDOM.time = { H, D, W, fmtTime, fmtDate, fmtFull, fmtDur, fmtRel, toInput, fromInput, weekIndex, weekStart };
})();

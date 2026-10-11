/* STARDOM · engine/config.js
   Every number that is not defined in the Design Bible lives here as a
   PLACEHOLDER (marked "PH") so it can be rebalanced later without touching logic. */
window.STARDOM = window.STARDOM || {};
STARDOM.config = {
  version: "beta-0.2 (stage 2)",
  storageKey: "stardom.v1",
  accountsPerBrowser: 1,            // closed test: one account per browser
  freeCharacterSlots: 5,            // Bible: up to 5 free characters per login
  ageMin: 16, ageMax: 25,           // Bible: roleplay age 16–25

  // XP (Bible)
  xpPerLevel: 5,
  xpWeeklyBase: 3, xpWeeklyChallenges: 5, xpWeeklyActivity: 2, xpWeeklyMax: 10,
  xpBaseAfter1InactiveWeek: 2, xpBaseAfter2InactiveWeeks: 1,
  xpStoredMax: 100,
  maxLevel: 25,

  // Starting values — PH (not defined in the Bible yet)
  startXP: 10,                      // PH
  startStarcoins: 1000,             // PH
  startAttributeLevel: 0,           // PH
  startSkillLevel: 0,               // PH

  // Time
  serverOffsetHours: -5,            // EST, fixed (Bible: no daylight saving)
  weeklyTick: { weekday: 1, hour: 0 }, // PH: Monday 00:00 EST

  // Travel (Bible: 30 min to 4 h, by distance)
  travelMinMinutes: 30, travelMaxMinutes: 240,
  travelMaxDistanceKm: 18000,       // PH: distance that maps to 4 h
  travelCost: 0,                    // PH: travel cost not defined yet

  landingSample: { online: 576, players: 10094, onStage24h: 8631, daysOnline: 8248 }
};

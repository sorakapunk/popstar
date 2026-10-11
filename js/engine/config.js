/* STARDOM · engine/config.js
   Every number that is not defined in the Design Bible lives here as a
   PLACEHOLDER so it can be rebalanced later without touching game logic. */
window.STARDOM = window.STARDOM || {};
STARDOM.config = {
  version: "beta-0.1 (stage 1)",
  storageKey: "stardom.v1",
  accountsPerBrowser: 1,          // closed test: one account per browser
  freeCharacterSlots: 5,          // Bible: up to 5 characters per login
  // Landing page sample numbers (placeholder until there is a server)
  landingSample: { online: 576, players: 10094, onStage24h: 8631, daysOnline: 8248 }
};

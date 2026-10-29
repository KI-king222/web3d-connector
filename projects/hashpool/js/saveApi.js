/* saveApi.js — HashpoolSave: getPayload / applyPayload (full game state incl. parts + playtime) */
(function () {
  function safeState() {
    try { return (typeof state !== "undefined") ? state : null; } catch (e) { return null; }
  }

  function getPayload() {
    var s = safeState();
    if (!s) return null;
    return {
      balance: s.balance,
      owned: s.owned,
      clickOwned: s.clickOwned,
      lang: s.lang,
      username: s.username || "",
      redeemed: s.redeemed || {},
      lifetime: s.lifetime || 0,
      halvings: s.halvings || 0,
      muted: !!s.muted,
      buildBought: s.buildBought || {},
      buildInstalled: s.buildInstalled || {},
      buildCablesDone: s.buildCablesDone || {},
      buildMode: s.buildMode || "quick",
      moboCased: !!s.moboCased,
      pasteQuality: s.pasteQuality,
      pasteDone: !!s.pasteDone,
      biosDone: !!s.biosDone,
      biosQuality: s.biosQuality,
      ex: s.ex,
      rigsSold: s.rigsSold || 0,
      partInv: s.partInv || {},
      buildPick: s.buildPick || {},
      tutorialDone: !!s.tutorialDone,
      totalPlayMs: (function () {
        try {
          return (Number(localStorage.getItem("hashpool-play-ms")) || 0) +
            (Date.now() - (window.__hpSessionStart || Date.now()));
        } catch (e) {
          return s.totalPlayMs || 0;
        }
      })(),
      lastSeen: Date.now()
    };
  }

  function applyPayload(saved) {
    var s = safeState();
    if (!s || !saved || typeof saved !== "object") return false;
    if (typeof saved.balance === "number") s.balance = saved.balance;
    if (saved.owned) s.owned = saved.owned;
    if (saved.clickOwned) s.clickOwned = saved.clickOwned;
    if (saved.lang) s.lang = saved.lang;
    if (typeof saved.username === "string") s.username = saved.username;
    s.redeemed = saved.redeemed || s.redeemed || {};
    if (typeof saved.lifetime === "number") s.lifetime = saved.lifetime;
    if (typeof saved.halvings === "number") s.halvings = saved.halvings;
    s.muted = !!saved.muted;
    if (saved.buildBought) s.buildBought = saved.buildBought;
    if (saved.buildInstalled) s.buildInstalled = saved.buildInstalled;
    if (saved.buildCablesDone) s.buildCablesDone = saved.buildCablesDone;
    if (saved.buildMode) s.buildMode = saved.buildMode;
    s.moboCased = !!saved.moboCased;
    if (typeof saved.pasteQuality === "number") s.pasteQuality = saved.pasteQuality;
    s.pasteDone = !!saved.pasteDone;
    s.biosDone = !!saved.biosDone;
    if (typeof saved.biosQuality === "number") s.biosQuality = saved.biosQuality;
    if (saved.ex && typeof exDefaults === "function") {
      try { s.ex = Object.assign(exDefaults(), saved.ex); } catch (e) { s.ex = saved.ex; }
    } else if (saved.ex) s.ex = saved.ex;
    if (typeof saved.rigsSold === "number") s.rigsSold = saved.rigsSold;
    s.partInv = saved.partInv || s.partInv || {};
    s.buildPick = saved.buildPick || s.buildPick || {};
    if (typeof saved.tutorialDone === "boolean") s.tutorialDone = saved.tutorialDone;
    if (typeof saved.totalPlayMs === "number") {
      s.totalPlayMs = saved.totalPlayMs;
      try {
        localStorage.setItem("hashpool-play-ms", String(saved.totalPlayMs));
        window.__hpSessionStart = Date.now();
      } catch (e) {}
    }
    return true;
  }

  var localAdapter = {
    name: "local",
    async load(key) {
      try {
        var raw = localStorage.getItem(key || "hashpool-save-v2");
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    async save(key, payload) {
      try {
        localStorage.setItem(key || "hashpool-save-v2", JSON.stringify(payload));
        return true;
      } catch (e) { return false; }
    }
  };

  window.HashpoolSave = {
    getPayload: getPayload,
    applyPayload: applyPayload,
    adapter: localAdapter
  };
})();

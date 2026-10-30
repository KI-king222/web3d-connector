/* farmRoom loader — pulls known-good farmRoom + farmFix */
(function () {
  var W = window;
  if (W.__farmRoomLoader) return; W.__farmRoomLoader = true;
  if (/[?&]nofarm(=|&|$)/.test(String(W.location && W.location.search))) return;
  function loadOne(url, label, done) {
    fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        if (!t || t.length < 50) throw new Error("empty");
        try { (0, eval)(t); } catch (e) { console.warn("[" + label + "] eval", e); }
        if (done) done();
      })
      .catch(function (e) { console.warn("[" + label + "]", e); if (done) done(); });
  }
  var roomUrls = [
    "https://cdn.jsdelivr.net/gh/KI-king222/Bitcoin-Clicker@98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js",
    "https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js"
  ];
  function loadRoom(i) {
    if (i >= roomUrls.length) { loadFix(); return; }
    fetch(roomUrls[i], { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        if (!t || t.indexOf("function hookSell") < 0) throw new Error("bad body");
        try { (0, eval)(t); } catch (e) { console.warn("[farmRoom] eval", e); }
        loadFix();
      })
      .catch(function (e) { console.warn("[farmRoom] try", i, e); loadRoom(i + 1); });
  }
  function loadFix() {
    loadOne("https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/parts3d/farmFix.js", "farmFix");
  }
  loadRoom(0);
})();

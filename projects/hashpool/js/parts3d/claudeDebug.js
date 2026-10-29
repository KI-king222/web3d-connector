/* parts3d/claudeDebug.js - Diagnose-Anzeige fuer das 3D-Rig. Nur aktiv mit ?dbg=1 an der Adresse (hashpool.pages.dev/?dbg=1). Aendert nichts am Spiel. */
(function () {
  var W = window;
  if (!/[?&]dbg(=|&|$)/.test(String(W.location && W.location.search))) return;
  var box = null, lines = [];
  function ui() {
    if (box || !document.body) return;
    box = document.createElement("pre");
    box.style.cssText = "position:fixed;left:0;right:0;bottom:0;max-height:45vh;overflow:auto;margin:0;padding:6px 8px;background:rgba(0,0,0,.86);color:#9f9;font:10px/1.25 monospace;z-index:2147483647;white-space:pre-wrap;word-break:break-all";
    box.addEventListener("click", function () { box.style.maxHeight = box.style.maxHeight === "45vh" ? "12vh" : "45vh"; });
    document.body.appendChild(box); draw();
  }
  function draw() { if (box) { box.textContent = lines.join("\n"); box.scrollTop = box.scrollHeight; } }
  function log(s) { lines.push(s); if (lines.length > 120) lines.shift(); ui(); draw(); try { console.log("[dbg]", s); } catch (e) {} }
  W.addEventListener("error", function (e) { log("FEHLER: " + e.message + " (" + String(e.filename || "").split("/").pop() + ":" + e.lineno + ")"); });
  W.addEventListener("unhandledrejection", function (e) { log("PROMISE: " + (e.reason && e.reason.message || e.reason)); });
  function f(n) { return (Math.round(n * 100) / 100).toFixed(2); }
  function wp(o) { try { var v = new THREE.Vector3(); o.updateMatrixWorld(true); o.getWorldPosition ? o.getWorldPosition(v) : v.setFromMatrixPosition(o.matrixWorld); return f(v.x) + "," + f(v.y) + "," + f(v.z); } catch (e) { return "?"; } }
  function report(tag) {
    var P = W.Parts3D || {};
    log("---- " + tag + " ----");
    log("THREE r" + (typeof THREE !== "undefined" ? THREE.REVISION : "FEHLT") + " | Parts3D.Claude " + (P.Claude ? P.Claude.version : "FEHLT") + " | rig " + (P.rig ? (P.rig.built ? "gebaut" : "nicht gebaut") + (P.rig.attached ? "+eingehaengt" : "") : "FEHLT"));
    var R = P.rig; if (!R) return;
    log("Spec: " + JSON.stringify(R.spec));
    log("Fehler im System: " + (R.sys && R.sys.report ? R.sys.report.errors.length : "?") + " | Kabel: " + (R.cab ? R.cab.items.map(function (i) { return i.key; }).join(",") : "-"));
    try { log("caseRoot parent=" + (R.caseRoot.parent ? "ja" : "NEIN") + " welt=" + wp(R.caseRoot)); } catch (e) {}
    ["mobo", "cpu", "ram", "ssd", "psu", "cooler", "gpu"].forEach(function (r) {
      var s = R.slots[r], m = (typeof partMeshes !== "undefined") ? partMeshes[r] : null;
      log(r + ": slot=" + (s && s.parent ? "an " + (s.parent === R.caseRoot ? "case" : s.parent === R.boardAlign ? "board" : s.parent.name || "rig") : "LOSE") + " welt=" + (s ? wp(s) : "-") + " sichtbar=" + (m ? m.visible : "-") + " ist-slot=" + (m === s) + " scale=" + (s ? f(s.scale.x) : "-") + " kinder=" + (s ? s.children.length : 0));
    });
    try { log("state: moboCased=" + state.moboCased + " installed=" + JSON.stringify(state.buildInstalled) + " pick=" + JSON.stringify(state.buildPick)); } catch (e) {}
  }
  W.Parts3D = W.Parts3D || {}; W.Parts3D.dbgReport = report;
  var n = 0, iv = setInterval(function () {
    n++; ui();
    if (W.Parts3D && W.Parts3D.rig && W.Parts3D.rig.attached) { clearInterval(iv); report("Rig bereit"); }
    else if (n === 40) { clearInterval(iv); report("Rig NICHT bereit nach 10 s"); }
  }, 250);
  // alle 4 s ein Kurzbericht, solange die Seite offen ist (zeigt Positionen nach jedem Bauschritt)
  var last = "";
  setInterval(function () { try { var s = JSON.stringify([state.moboCased, state.buildInstalled]); if (s !== last) { last = s; report("Zustand geaendert"); } } catch (e) {} }, 1000);
  log("claudeDebug aktiv - tippe auf die Anzeige zum Verkleinern");
})();

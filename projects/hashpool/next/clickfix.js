/* clickfix.js — NEXT: Buzzer-Tippen dreht die Kamera nicht mehr.
 * Ursache: jeder Tipp startete einen Auto-Lauf mit Abstand 0 -> die Blickrichtung wurde auf einen Zufallswinkel gedreht.
 * Jetzt: In Reichweite (< 2,6 m) loest ein Tipp auf den Buzzer (oder sein Schild) direkt den Klick aus, ohne Lauf/Drehung.
 */
(function () {
  var W = window;
  if (W.__nxClickFix) return; W.__nxClickFix = true;
  function init() {
    var S = W.Parts3D.nextWorld.S, C = W.Parts3D.clicker, st = S.stations.buzzer; if (!st) return false;
    function near() { return Math.hypot(S.px - st.tx, S.pz - st.tz) < 2.6; }
    var hb = null; S.hits.forEach(function (o) { if (o.userData && o.userData.st === "buzzer") hb = o; });
    // Tipp auf das 3D-Objekt (Capture auf der Buehne, vor dem Handler von world.js)
    var down = null;
    S.stage.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY, id: e.pointerId }; }, true);
    S.stage.addEventListener("pointerup", function (e) {
      if (!down || down.id !== e.pointerId) return; var moved = Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y); down = null;
      if (moved >= 10 || S.dlg || S.invOpen || !hb || !near()) return;
      var r = S.rd.domElement.getBoundingClientRect(); S.ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, S.cam);
      var h = S.ray.intersectObjects([hb], false); if (h && h.length) { e.stopImmediatePropagation(); e.preventDefault(); S.auto = null; C.press(); }
    }, true);
    // Schild "🔴 Buzzer": alten Handler durch neuen ersetzen
    if (st.el) {
      var n = st.el.cloneNode(true); st.el.parentNode.replaceChild(n, st.el); st.el = n;
      n.addEventListener("click", function (e) {
        e.stopPropagation(); if (S.dlg || S.invOpen) return;
        if (near()) { S.auto = null; C.press(); return; }
        var pts = [], a = S.pz > -1.3; if (a !== (st.sz > -1.3)) { pts.push(a ? [0, -0.4] : [0, -2.2]); pts.push(a ? [0, -2.2] : [0, -0.4]); } pts.push([st.sx, st.sz]); S.auto = { pts: pts, i: 0, id: "buzzer", face: [st.tx, st.tz] };
      });
    }
    // Auto-Lauf-Drehung bei Abstand 0 verhindern: Wenn Ziel erreicht ist, Blickrichtung nicht anruehren
    (function guard() {
      requestAnimationFrame(guard);
      var a = S.auto; if (a && a.pts && a.pts[a.i]) { var p = a.pts[a.i]; if (Math.hypot(p[0] - S.px, p[1] - S.pz) < 0.02) { a.i++; } }
    })();
    console.log("[HASHPOOL NEXT] clickfix aktiv");
    return true;
  }
  var n = 0, iv = setInterval(function () { n++; try { if (W.Parts3D && W.Parts3D.clicker && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && init()) clearInterval(iv); } catch (e) { console.warn("[clickfix]", e); } if (n > 400) clearInterval(iv); }, 400);
})();

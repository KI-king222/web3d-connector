/* parts3d/claudeRig.js — Werkbank-Ablauf mit den Claude-Port-Teilen (Parts3D.Claude aus claude3d.js) im HASHPOOL-Spiel.
 *
 * Ablauf im Spiel (wie beim echten PC-Bau):
 *   1. Mainboard liegt auf der antistatischen Matte (Tisch rechts)
 *   2. CPU, RAM und (M.2-)SSD kommen auf das Board - Reihenfolge frei
 *   3. Mainboard mit den Teilen wandert durch die Glasseite ins Gehaeuse (links)
 *   4. Netzteil  ->  5. CPU-Kuehler (Tower oder AIO)  ->  6. Grafikkarte  (SATA-SSD: Laufwerksschacht, ab Schritt 3)
 *   7. Kabel: 24-Pin, CPU-Strom, GPU-Strom, Luefter/Pumpe, Front-Panel, SATA - die Sockel leuchten an den ECHTEN Steckern der Teile
 *
 * Jedes Teil weiss selbst, wo es hingehoert (userData.ports / userData.plugs); hier steht keine handgeschriebene Teile-Position.
 * Diese Datei haengt sich in die Spielfunktionen ein (initCase3D, setPartVisual-Ablauf, caseTheMobo, makeCable ...) und laesst
 * Wirtschaft, Speichern und Shop unberuehrt. Fehlt claude3d.js, bleibt das alte 3D aktiv.
 */
(function () {
  var W = window;
  if (typeof THREE === "undefined" || !W.Parts3D || !W.Parts3D.Claude) { console.warn("[claudeRig] claude3d.js fehlt - altes 3D bleibt aktiv"); return; }
  var C = W.Parts3D.Claude, SC = 0.01;
  var ROLES = ["mobo", "cpu", "ram", "ssd", "psu", "cooler", "gpu"];

  /* ---------- Szenen-Layout (Spiel-Einheiten; 1 Einheit = 10 cm = 100 mm) ---------- */
  var LAY = {
    casePos: [-1.95, -1.09, 0.0],        // Gehaeuse-Mitte, Boden steht auf der Tischplatte (links)
    caseRotY: Math.PI / 2,               // Glasseite (-x im Teile-Raum) zeigt zur Kamera (+z), Front zum Tisch
    bench: [2.8, -1.07, 0.0],            // Mainboard-Mitte auf der antistatischen Matte (rechts)
    camBench: { x: 0.45, y: 0.55, z: 14.5 },
    camCase: { x: -0.35, y: 0.7, z: 12.8 },
    tilt: 0.3,                           // Rig leicht nach vorn gekippt: man sieht die Tischplatte von oben
  };

  var R = { sig: "", spec: null, sys: null, cab: null, items: {}, slots: {}, built: false, attached: false, rotors: [], camStage: "" };
  var origTable = W.Parts3D.buildTable;

  function mkSlot(role) { var g = new THREE.Group(); g.name = "slot-" + role; g.userData.role = role; return g; }
  ROLES.forEach(function (r) { R.slots[r] = mkSlot(r); });

  R.caseRoot = new THREE.Group(); R.caseRoot.name = "claudeCase";
  R.caseRoot.position.set(LAY.casePos[0], LAY.casePos[1], LAY.casePos[2]); R.caseRoot.rotation.y = LAY.caseRotY;
  R.caseMM = new THREE.Group(); R.caseMM.scale.set(SC, SC, SC); R.caseRoot.add(R.caseMM);
  R.boardAlign = new THREE.Group(); R.boardAlign.name = "boardAlign"; R.slots.mobo.add(R.boardAlign);

  /* ---------- Teile-Auswahl -> Spec ---------- */
  var DEF = { case: "case-5", mobo: "mobo-6", cpu: "cpu-8", cooler: "cooler-4", ram: "ram-6", gpu: "gpu-6", psu: "psu-6", ssd: "ssd-5" };
  var rawCache = {};
  function rawOf(id) { return rawCache[id] || (rawCache[id] = C.buildPartRaw(id)); }
  function catIds(cat) { return C.CATALOG.filter(function (e) { return e.cat === cat; }).map(function (e) { return e.id; }); }
  /** Fehlende Kategorien (z.B. Schnellstart ohne Auswahl) mit passenden Standardteilen fuellen */
  function fill(s) {
    s.case = s.case || DEF.case; s.mobo = s.mobo || DEF.mobo;
    var mb = rawOf(s.mobo), sock = C.portOf(mb, "cpu").meta.socket, ddr = mb.userData.dims.ddr;
    if (!s.cpu) s.cpu = catIds("cpu").filter(function (id) { return C.portOf(rawOf(id), "socket").meta.socket === sock; }).pop() || DEF.cpu;
    if (!s.ram) s.ram = catIds("ram").filter(function (id) { var m = rawOf(id).userData.members; return m[0].ports[0].meta.ddr === ddr && (m.length === mb.userData.dims.dimm || m.length <= 2); }).shift() || DEF.ram;
    s.cooler = s.cooler || DEF.cooler; s.gpu = s.gpu || DEF.gpu; s.psu = s.psu || DEF.psu;
    if (!s.ssd || !s.ssd.length) s.ssd = [DEF.ssd];
    return s;
  }
  /** Spielstand (state.buildPick) -> Spec. Spielregel: genau eine SSD. */
  function pickSpec() {
    var bp = (typeof state !== "undefined" && state && state.buildPick) || {}, s = {};
    ["case", "mobo", "cpu", "cooler", "ram", "gpu", "psu"].forEach(function (k) { s[k] = bp[k] || null; });
    var ss = bp.ssd ? [].concat(bp.ssd)[0] : null; s.ssd = ss ? [ss] : [];
    return fill(s);
  }

  /* ---------- Matrizen: Teile-Raum (mm, row-major 4x4) -> Slot/Wrapper ---------- */
  var tmp = new THREE.Object3D();
  function clearObj(o) { while (o.children.length) o.remove(o.children[0]); }
  function resetObj(o) { o.position.set(0, 0, 0); o.quaternion.set(0, 0, 0, 1); o.scale.set(1, 1, 1); }
  /** members: [{obj, M}] (M = Teil im Eltern-Raum, mm). Slot sitzt am ersten Teil (Skalier-Animation des Spiels wirkt um dessen Ursprung). */
  function mount(slot, parent, members) {
    clearObj(slot);
    var a = members[0].M, ax = a[3], ay = a[7], az = a[11];
    slot.position.set(ax * SC, ay * SC, az * SC); slot.quaternion.set(0, 0, 0, 1);
    members.forEach(function (m) {
      C.place(tmp, m.M);                                           // liest Drehung + Spiegelung (GPU) aus der Matrix
      var w = new THREE.Group();
      w.position.set((m.M[3] - ax) * SC, (m.M[7] - ay) * SC, (m.M[11] - az) * SC);
      w.quaternion.set(tmp.quaternion.x, tmp.quaternion.y, tmp.quaternion.z, tmp.quaternion.w);
      w.scale.set(SC, tmp.scale.y * SC, SC);
      resetObj(m.obj); w.add(m.obj); slot.add(w);
    });
    if (slot.parent !== parent) parent.add(slot);
  }

  function doMounts() { (R.mounts || []).forEach(function (m) { mount(m[0], m[1] === "board" ? R.boardAlign : R.caseRoot, m[2]); }); }

  /* ---------- Aufbau des Systems aus der Auswahl ---------- */
  function rebuild(spec) {
    ROLES.forEach(function (r) { clearObj(R.slots[r]); if (r === "mobo") R.slots.mobo.add(R.boardAlign); });
    clearObj(R.caseMM); clearObj(R.boardAlign);
    var sys = C.buildSystem(spec, { cables: false });
    var cab = C.buildCables(sys);
    R.spec = spec; R.sys = sys; R.cab = cab; R.items = {}; R.rotors = [];
    var by = {}; sys.parts.forEach(function (p) { (by[p.role] = by[p.role] || []).push(p); });
    var I = C.I4(), B = by.mobo ? by.mobo[0].obj.userData.world : I, Binv = C.inv(B);

    // Gehaeuse
    if (by.case) { sys.root.remove(by.case[0].obj); resetObj(by.case[0].obj); R.caseMM.add(by.case[0].obj); }
    // Mainboard: boardAlign dreht Teile-Raum -> Spiel-Platinenrahmen (x rechts, y oben, +z = Bestueckungsseite), Position = Einbauort im Gehaeuse
    var cy = Math.cos(LAY.caseRotY), sy = Math.sin(LAY.caseRotY);
    var Ry = [cy, 0, sy, 0, 0, 1, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1];
    if (by.mobo) {
      var Rb = C.mul(Ry, [B[0], B[1], B[2], 0, B[4], B[5], B[6], 0, B[8], B[9], B[10], 0, 0, 0, 0, 1]);
      var m4 = new THREE.Matrix4(); m4.set(Rb[0], Rb[1], Rb[2], 0, Rb[4], Rb[5], Rb[6], 0, Rb[8], Rb[9], Rb[10], 0, 0, 0, 0, 1);
      R.boardAlign.quaternion.setFromRotationMatrix(m4);
      var bw = new THREE.Group(); bw.scale.set(SC, SC, SC); sys.root.remove(by.mobo[0].obj); resetObj(by.mobo[0].obj); bw.add(by.mobo[0].obj); R.boardAlign.add(bw);
      var bp = C.point(Ry, [B[3] * SC, B[7] * SC, B[11] * SC]);
      R.boardPos = [LAY.casePos[0] + bp[0], LAY.casePos[1] + bp[1], LAY.casePos[2] + bp[2]];
      if (typeof PART3D !== "undefined") PART3D.mobo.pos = R.boardPos.slice();
      if (typeof BENCH !== "undefined") { BENCH.mobo[0] = LAY.bench[0]; BENCH.mobo[1] = LAY.bench[1]; BENCH.mobo[2] = LAY.bench[2]; }
    }
    function rel(p) { return { obj: p.obj, M: C.mul(Binv, p.obj.userData.world) }; }
    function abs(p) { return { obj: p.obj, M: p.obj.userData.world }; }
    R.mounts = [];                                                                   // [slot, Elternname, Teile] - attach() haengt sie nach dem Spiel-Init neu ein
    if (by.cpu) R.mounts.push([R.slots.cpu, "board", [rel(by.cpu[0])]]);
    if (by.ram) R.mounts.push([R.slots.ram, "board", by.ram.map(rel)]);
    R.ssdSata = false;
    if (by.ssd) {
      var s0 = by.ssd[0], isM2 = s0.obj.userData.ports[0].kind === "m2"; R.ssdSata = !isM2;
      R.mounts.push([R.slots.ssd, isM2 ? "board" : "case", [isM2 ? rel(s0) : abs(s0)]]);
    }
    if (by.psu) R.mounts.push([R.slots.psu, "case", [abs(by.psu[0])]]);
    if (by.gpu) R.mounts.push([R.slots.gpu, "case", [abs(by.gpu[0])]]);
    if (by.cooler) {
      var cm = [abs(by.cooler[0])]; if (by.radiator) cm.push(abs(by.radiator[0]));            // AIO: Block auf der CPU + Radiator am Gehaeuse
      R.mounts.push([R.slots.cooler, "case", cm]);
    }
    doMounts();
    // Kabel nach Spiel-Schluessel gruppieren
    cab.items.forEach(function (it) { (R.items[it.key] = R.items[it.key] || []).push(it.obj); });
    sys.root.remove(cab.group);
    // Luefter-Rotoren sammeln (drehen nach dem Hochfahren)
    [R.caseMM, R.boardAlign, R.slots.cooler, R.slots.gpu, R.slots.psu].forEach(function (o) { o.traverse(function (n) { if (n.userData && n.userData.spin) R.rotors.push(n); }); });
    R.built = true;
  }

  function ensure(force) {
    var spec = pickSpec(), sig = JSON.stringify(spec);
    if (!force && R.built && sig === R.sig) return R.sys;
    R.sig = sig;
    try { rebuild(spec); } catch (e) { console.error("[claudeRig] Aufbau fehlgeschlagen", e); return null; }
    if (R.attached) applyGame();
    return R.sys;
  }

  /* ---------- Spiel-Zustand: Abhaengigkeiten, Kabel, Sockel ---------- */
  function rigPt(p) {
    var x = p[0] * SC, y = p[1] * SC, z = p[2] * SC, c = Math.cos(LAY.caseRotY), s = Math.sin(LAY.caseRotY);
    return [LAY.casePos[0] + x * c + z * s, LAY.casePos[1] + y, LAY.casePos[2] - x * s + z * c];
  }
  function rigDir(d) { var c = Math.cos(LAY.caseRotY), s = Math.sin(LAY.caseRotY); return [d[0] * c + d[2] * s, d[1], -d[0] * s + d[2] * c]; }
  var META = {
    mainPower: { needs: ["psu", "moboCase"], color: 0x17181a, r: 0.032, icon: "🔌", labelKey: "cableMain" },
    cpuPower: { needs: ["psu", "cpu"], color: 0x17181a, r: 0.026, icon: "🔌", labelKey: "cableCpu" },
    gpuPower: { needs: ["psu", "gpu"], color: 0x111214, r: 0.026, icon: "🔌", labelKey: "cableGpu" },
    fanCable: { needs: ["cooler", "moboCase"], color: 0x0d0f11, r: 0.016, icon: "🧷", labelKey: "cableFan" },
    frontPanel: { needs: ["moboCase"], color: 0x0d0f11, r: 0.016, icon: "🔘", labelKey: "cableFront" },
    ssdPower: { needs: ["psu", "ssd"], color: 0x111214, r: 0.018, icon: "🔌", labelKey: "cableSsdPower" },
    ssdData: { needs: ["ssd", "moboCase"], color: 0x9b2b22, r: 0.014, icon: "🧷", labelKey: "cableSsdData" },
  };
  var ORDER = ["mainPower", "cpuPower", "gpuPower", "fanCable", "frontPanel", "ssdPower", "ssdData"];

  function applyDepends() {
    if (typeof PART_DEPENDS === "undefined") return;
    PART_DEPENDS.cpu = ["mobo"]; PART_DEPENDS.ram = ["mobo"];                     // auf dem Board: Reihenfolge frei
    PART_DEPENDS.ssd = R.ssdSata ? ["moboCase"] : ["mobo"];                         // M.2 aufs Board, 2,5"-SATA in den Schacht (erst im Gehaeuse)
    PART_DEPENDS.psu = ["moboCase"]; PART_DEPENDS.cooler = ["cpu", "psu"]; PART_DEPENDS.gpu = ["cooler"];
  }
  function applyCables() {
    if (typeof CABLES === "undefined") return;
    if (typeof removeAllCables === "function") try { removeAllCables(); } catch (e) {}
    Object.keys(CABLES).forEach(function (k) { delete CABLES[k]; });
    ORDER.forEach(function (k) {
      var it = R.cab && R.cab.items.filter(function (x) { return x.key === k; })[0]; if (!it) return;
      var m = META[k], to = rigPt(it.b.p);
      CABLES[k] = { needs: m.needs.slice(), from: rigPt(it.a.p), to: to, sag: [0, 0, 0], color: m.color, r: m.r, icon: m.icon, labelKey: m.labelKey, plugDir: rigDir(it.b.d) };
      if (typeof state !== "undefined" && state.buildCablesDone && state.buildCablesDone[k] === undefined) state.buildCablesDone[k] = false;
    });
  }
  function applySockets() {
    if (typeof rigGroup === "undefined" || !rigGroup || typeof buildSockets !== "function" || typeof socketMeshes === "undefined") return;
    Object.keys(socketMeshes).forEach(function (k) { rigGroup.remove(socketMeshes[k]); delete socketMeshes[k]; });
    buildSockets();
    Object.keys(socketMeshes).forEach(function (k) {                                // Halo am Stecker, Scheibe zeigt in Steckrichtung
      var c = CABLES[k], g = socketMeshes[k], d = c.plugDir; if (!c || !g) return;
      g.position.set(c.to[0] + d[0] * 0.04, c.to[1] + d[1] * 0.04, c.to[2] + d[2] * 0.04);
      var z = new THREE.Vector3(0, 0, 1), v = new THREE.Vector3(d[0], d[1], d[2]), ax = new THREE.Vector3().copy(z).cross(v);
      if (ax.length() > 1e-4) { ax.normalize(); g.quaternion.setFromAxisAngle ? g.quaternion.setFromAxisAngle(ax, Math.acos(Math.max(-1, Math.min(1, z.dot(v))))) : 0; }
      else if (v.z < 0) g.rotation.y = Math.PI;
    });
  }
  function applyGame() {
    applyDepends(); applyCables(); applySockets();
    if (typeof state !== "undefined" && state.moboCased && typeof partMeshes !== "undefined" && partMeshes.mobo && !(typeof moboCaseAnim !== "undefined" && moboCaseAnim)) {
      partMeshes.mobo.position.set(R.boardPos[0], R.boardPos[1], R.boardPos[2]); partMeshes.mobo.rotation.x = 0;
    }
    if (typeof recomputeCables === "function") try { recomputeCables(); } catch (e) {}
  }

  /* ---------- Bruecken ins Spiel ---------- */
  W.Parts3D.LAYOUT = { claudeRig: true };                                         // altes Fix-Layout abschalten (LayoutForce/Cable-Sync nutzen sonst feste Zahlen)
  W.Parts3D.buildTable = function () { return origTable ? origTable() : new THREE.Group(); };
  W.Parts3D.buildFrame = function () { ensure(false); return R.caseRoot; };
  [["Mobo", "mobo"], ["Cpu", "cpu"], ["Ram", "ram"], ["Ssd", "ssd"], ["Psu", "psu"], ["Cooler", "cooler"], ["Gpu", "gpu"]].forEach(function (p) {
    W.Parts3D["build" + p[0]] = function () { return R.slots[p[1]]; };
  });
  W.Parts3D.compat = function (spec) { return C.compat(spec, { maxSsd: 1 }); };
  W.Parts3D.syncGameCables = function () { try { ensure(false); } catch (e) {} return true; };
  W.Parts3D.rig = R; W.Parts3D.rigLayout = LAY;
  W.Parts3D.checkBuildPick = function () { return W.Parts3D.compat(W.Parts3D.specFromBuildPick ? W.Parts3D.specFromBuildPick() : pickSpec()); };

  /* ---------- Hilfen fuer Shop/Spiel (ersetzen assembleSync.js + claudeBridge.js) ---------- */
  W.Parts3D.specFromBuildPick = function () {
    if (typeof state === "undefined" || !state.buildPick) return {};
    var b = state.buildPick, s = {};
    ["case", "mobo", "cpu", "cooler", "ram", "gpu", "psu"].forEach(function (k) { if (b[k]) s[k] = b[k]; });
    if (b.ssd) s.ssd = [].concat(b.ssd);
    return s;
  };
  /** Geht Teil `partId` zusammen mit der aktuellen Auswahl? -> { ok, errors:[{part,msg}] } */
  W.Parts3D.canPick = function (partId) {
    var spec = W.Parts3D.specFromBuildPick(), cat = String(partId).split("-")[0];
    if (cat === "ssd") spec.ssd = [partId]; else spec[cat] = partId;                // genau eine SSD
    return W.Parts3D.compat(spec);
  };
  /** Eine bekannte gute Komplett-Liste (0 Fehler, 0 Kollisionen) */
  W.Parts3D.demoSpec = function () { return { case: "case-7", mobo: "mobo-6", cpu: "cpu-8", cooler: "cooler-6", ram: "ram-6", gpu: "gpu-7", psu: "psu-6", ssd: ["ssd-5"] }; };
  W.Parts3D.applyDemoPick = function () {
    if (typeof state === "undefined") return null;
    var d = W.Parts3D.demoSpec(); state.buildPick = state.buildPick || {}; state.partInv = state.partInv || {};
    ["case", "mobo", "cpu", "cooler", "ram", "gpu", "psu"].forEach(function (k) { state.buildPick[k] = d[k]; state.partInv[d[k]] = (state.partInv[d[k]] || 0) + 1; });
    state.buildPick.ssd = d.ssd[0]; state.partInv[d.ssd[0]] = (state.partInv[d.ssd[0]] || 0) + 1;
    try { save(); } catch (e) {}
    return d;
  };
  document.addEventListener("click", function (ev) {                                // Shop: unpassendes Teil -> Hinweis (wie bisher claudeBridge)
    var el = ev.target && ev.target.closest && ev.target.closest("[data-pick-id]"); if (!el) return;
    var r = W.Parts3D.canPick(el.getAttribute("data-pick-id"));
    if (r && r.ok === false) {
      var msg = r.errors.map(function (e) { return e.msg; }).join(" · ");
      try { if (W.PartShop && PartShop.toast) PartShop.toast(msg); else if (typeof toast === "function") toast(msg, "err"); } catch (e) {}
      el.setAttribute("title", msg);
    }
  }, true);

  function i18n() {
    if (typeof I18N === "undefined") return;
    if (I18N.en) { I18N.en.cableSsdPower = "SATA Power Cable"; I18N.en.cableSsdData = "SATA Data Cable"; }
    if (I18N.de) { I18N.de.cableSsdPower = "SATA-Stromkabel"; I18N.de.cableSsdData = "SATA-Datenkabel"; }
  }

  /* ---------- Mainboard ins Gehaeuse: Weg durch die Glasseite ---------- */
  function catmull(p, u) {
    var n = p.length - 1, f = Math.min(n - 1e-9, Math.max(0, u * n)), i = Math.floor(f), t = f - i;
    var p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n, i + 2)], o = [];
    for (var k = 0; k < 3; k++) o[k] = 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t);
    return o;
  }
  function animateBoardIn(mesh) {
    var from = [mesh.position.x, mesh.position.y, mesh.position.z], to = R.boardPos.slice();
    var zFront = LAY.casePos[2] + 2.7;                                            // vor dem Glas, ausserhalb des Gehaeuses
    var path = [from, [from[0] - 0.5, from[1] + 1.3, from[2] + 1.6], [to[0] + 0.9, to[1] + 0.1, zFront], [to[0], to[1], zFront], [to[0], to[1], to[2]]];
    var t0 = performance.now(), dur = 2000;
    (function step() {
      var u = Math.min(1, (performance.now() - t0) / dur), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, p = catmull(path, e);
      mesh.position.set(p[0], p[1], p[2]);
      mesh.rotation.x = -Math.PI / 2 * (1 - Math.min(1, e / 0.62));                // erst nach oben schwenken, dann ins Gehaeuse schieben
      if (u < 1) { requestAnimationFrame(step); return; }
      mesh.position.set(to[0], to[1], to[2]); mesh.rotation.x = 0;
      try { moboCaseAnim = null; } catch (e2) {}
      try { recomputeCables(); } catch (e3) {}
      try { render(); } catch (e4) {}
    })();
  }
  function caseIn() {
    var mesh = partMeshes.mobo; if (!mesh || state.moboCased) return;
    ensure(false);
    var dummy = new THREE.Object3D(), v = new THREE.Vector3();
    moboCaseAnim = { mesh: dummy, from: v, to: v.clone(), start: performance.now(), duration: 1e12 };   // sperrt das Standard-Setzen von Position/Drehung im Spiel
    state.moboCased = true;
    try { sfxInstall(); } catch (e) {}
    try { save(); } catch (e) {}
    try { render(); } catch (e) {}
    setCam("case", true);
    animateBoardIn(mesh);
  }

  function setCam(stage, force) {
    if (typeof camTarget === "undefined") return;
    if (!force && R.camStage === stage) return;
    R.camStage = stage; var c = stage === "case" ? LAY.camCase : LAY.camBench;
    camTarget.x = c.x; camTarget.y = c.y; camTarget.z = c.z;
  }

  /* ---------- Einhaengen in die Spielfunktionen (sobald das Spiel-Script komplett geladen ist) ---------- */
  var booted = false;
  function boot() {
    if (booted) return true;
    if (typeof initCase3D !== "function" || typeof CABLES === "undefined" || typeof state === "undefined" || typeof BUILDERS === "undefined") return false;
    booted = true;
    i18n();
    var _init = initCase3D;
    initCase3D = function () {
      try { ROLES.forEach(function (r) { BUILDERS[r] = function () { return R.slots[r]; }; }); ensure(false); } catch (e) { console.error(e); }
      var out = _init.apply(this, arguments);
      try { attach(); } catch (e) { console.error("[claudeRig] attach", e); }
      return out;
    };
    var _rb = renderBuildOverlay;
    renderBuildOverlay = function () {
      try { ensure(false); } catch (e) {}
      var out = _rb.apply(this, arguments);
      try { setCam(state.moboCased ? "case" : "bench", R.camPending); R.camPending = false; } catch (e) {}      // einmalig nach dem Spiel-Framing
      return out;
    };
    if (typeof caseTheMobo === "function") caseTheMobo = caseIn;
    if (typeof moboReadyForCase === "function") moboReadyForCase = function () { var bi = state.buildInstalled; return !!(bi.cpu && bi.ram && (R.ssdSata || bi.ssd)); };
    if (typeof spawnScrews === "function") spawnScrews = function () {};
    if (typeof makeCable === "function") {
      var _mk = makeCable;
      makeCable = function (from, to, sag, color, r) {
        var key = null; for (var k in CABLES) if (CABLES[k].from === from && CABLES[k].to === to) key = k;
        var objs = key && R.items[key];
        if (!objs || !objs.length) return _mk.apply(this, arguments);
        var h = new THREE.Group(); h.position.set(LAY.casePos[0], LAY.casePos[1], LAY.casePos[2]); h.rotation.y = LAY.caseRotY; h.scale.set(SC, SC, SC);
        objs.forEach(function (o) { h.add(o); });
        return h;
      };
    }
    (function spin() {
      requestAnimationFrame(spin);
      if (typeof bootPlayed !== "undefined" && bootPlayed) for (var i = 0; i < R.rotors.length; i++) R.rotors[i].rotation.y += (R.rotors[i].userData.spin || 6) * 0.012;
    })();
    console.log("[HASHPOOL] claudeRig bereit (Werkbank + Gehaeuse + Kabel)");
    return true;
  }
  function attach() {
    ROLES.forEach(function (r) {
      var s = R.slots[r];
      if (partMeshes[r] && partMeshes[r] !== s && partMeshes[r].parent) partMeshes[r].parent.remove(partMeshes[r]);
      partMeshes[r] = s;
    });
    ensure(false); doMounts();                                                      // Slots (vom Spiel-Init umgehaengt) wieder an die richtigen Eltern
    rigGroup.rotation.x = LAY.tilt; rigGroup.rotation.y = 0.3;
    R.attached = true; R.camPending = true; applyGame(); setCam(state.moboCased ? "case" : "bench", true);
  }
  var iv = setInterval(function () { try { if (boot()) clearInterval(iv); } catch (e) { console.error("[claudeRig] boot", e); clearInterval(iv); } }, 60);
  setTimeout(function () { clearInterval(iv); }, 20000);
})();

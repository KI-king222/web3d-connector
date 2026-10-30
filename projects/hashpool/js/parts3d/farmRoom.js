/* parts3d/farmRoom.js - A1 "Meine Farm": 3D-Raum mit einem Rack (6 Plaetze), in den gebaute Rigs als Trophaee gestellt werden.
 *  - Button "Meine Farm" neben dem Teile-Shop, Overlay mit eigener 3D-Szene (Orbit/Zoom/Pan wie im Bau-Modus)
 *  - Nach dem Verkauf eines Rigs: "In Farm stellen?" (Verkauf und Belohnung bleiben unveraendert, die Farm merkt sich nur die Teile)
 *  - Antippen eines PCs zeigt Teile + grobe Werte; leere Plaetze zeigen einen Hinweis
 *  - state.farmSlots = [{ id, name, partIds:{case,mobo,cpu,cooler,ram,gpu,psu,ssd}, placedAt, pos }]  (pos = Rack-Platz 0..5)
 *  - Speichern: localStorage "hashpool-farm-v1[:benutzername]" (bei jedem save()) + HashpoolSave.getPayload/applyPayload (farmSlots)
 * Keine Wirtschaft, kein Strom, kein Multiplayer. Abschalten: ?nofarm=1 an der Adresse. DE/EN ueber state.lang.
 */
(function () {
  var W = window;
  if (W.__farmRoom) return; W.__farmRoom = true;
  if (/[?&]nofarm(=|&|$)/.test(String(W.location && W.location.search))) return;
  if (typeof THREE === "undefined" || typeof document === "undefined") return;
  var MAX = 6, KEYB = "hashpool-farm-v1", K = 0.00105;                             // K: mm -> Meter-Szene
  var CATS = ["mobo", "cpu", "ram", "case", "cooler", "ssd", "gpu", "psu"];
  var TIERC = [0x8a8f98, 0x8a8f98, 0x6c7a89, 0x2fa7ff, 0x2fd6c4, 0x4ee06a, 0xb06cff, 0xff5fd0, 0xffb43a, 0xff6a3a];
  /* Gehaeuse (B x H x T in mm, aus den Claude-Gehaeusen): front solid|mesh|glass|glassfront, glass = Glasseite, fans = Frontluefter */
  var CASES = {
    1: { w: 175, h: 355, d: 380, col: 0x1e2024, front: "solid", glass: false, fans: 0 },
    2: { w: 210, h: 395, d: 400, col: 0x1b1c1f, front: "mesh", glass: false, fans: 1 },
    3: { w: 225, h: 464, d: 410, col: 0x1a1b1e, front: "solid", glass: true, fans: 0, acc: 0xe9ebee },
    4: { w: 230, h: 453, d: 466, col: 0x111214, front: "mesh", glass: true, fans: 2, acc: 0xe31937 },
    5: { w: 212, h: 440, d: 452, col: 0x16171a, front: "mesh", glass: true, fans: 2, acc: 0x9aa0a8 },
    6: { w: 230, h: 495, d: 478, col: 0x15161a, front: "glass", glass: true, fans: 3, acc: 0x20f0ff },
    7: { w: 245, h: 520, d: 520, col: 0x101113, front: "mesh", glass: true, fans: 3, acc: 0xe31937 },
    8: { w: 285, h: 465, d: 459, col: 0x0f1012, front: "glass", glass: true, fans: 0, acc: 0xe9ebee },
    9: { w: 242, h: 530, d: 544, col: 0x15161a, front: "mesh", glass: true, fans: 3, acc: 0x9aa0a8 },
    10: { w: 285, h: 465, d: 459, col: 0xe9ebee, front: "glass", glass: true, fans: 0, acc: 0x20f0ff }
  };
  var LEVEL_Y = [0.14, 0.86, 1.58], SLOT_X = [-0.27, 0.27];

  function de() { try { return state.lang === "de"; } catch (e) { return true; } }
  function T(d, e) { return de() ? d : e; }
  function item(id) { try { return PART_BY_ID[id] || null; } catch (e) { return null; } }
  function nm(id) { var it = item(id); return it ? (it.brand ? it.brand + " " : "") + it.model : String(id || "?"); }
  function fmt(n) { try { if (typeof fmtSats === "function") return fmtSats(n); } catch (e) {} n = Math.floor(Number(n) || 0); return n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ---------- Daten + Speichern ---------- */
  function key() { var u = ""; try { u = state.username ? ":" + String(state.username).toLowerCase() : ""; } catch (e) {} return KEYB + u; }
  function clean(a) {
    var used = {}, out = [];
    (a || []).forEach(function (r) {
      if (!r || !r.partIds || typeof r.partIds !== "object" || out.length >= MAX) return;
      var pos = (typeof r.pos === "number" && r.pos >= 0 && r.pos < MAX && !used[r.pos]) ? Math.floor(r.pos) : -1;
      if (pos >= 0) used[pos] = 1;
      out.push({ id: String(r.id || "r" + Date.now().toString(36) + out.length), name: String(r.name || ""), partIds: r.partIds, placedAt: Number(r.placedAt) || Date.now(), pos: pos });
    });
    out.forEach(function (r) { if (r.pos < 0) { for (var i = 0; i < MAX; i++) if (!used[i]) { used[i] = 1; r.pos = i; break; } } });
    return out;
  }
  var loaded = false;
  function load() {
    loaded = true; var arr = []; try { var j = JSON.parse(localStorage.getItem(key()) || "null"); if (Array.isArray(j)) arr = j; } catch (e) {}
    try { var cur = state.farmSlots; state.farmSlots = clean(cur && cur.length ? cur : arr); } catch (e) {}
  }
  function writeLocal() { if (!loaded) return; try { localStorage.setItem(key(), JSON.stringify(slotsArr())); } catch (e) {} }
  function slotsArr() { try { if (!state.farmSlots) state.farmSlots = []; return state.farmSlots; } catch (e) { return []; } }
  function persist() { try { if (typeof save === "function") save(); else writeLocal(); } catch (e) { writeLocal(); } }
  function freeSlot() { var u = {}; slotsArr().forEach(function (r) { u[r.pos] = 1; }); for (var i = 0; i < MAX; i++) if (!u[i]) return i; return -1; }
  function nextNum() { var m = 0; slotsArr().forEach(function (r) { var n = parseInt(String(r.name).replace(/\D/g, ""), 10); if (n > m) m = n; }); return m + 1; }
  function add(partIds, name) {
    var p = freeSlot(); if (p < 0) return null;
    var ids = {}; Object.keys(partIds || {}).forEach(function (k) { var v = partIds[k]; ids[k] = [].concat(v)[0]; });
    var rig = { id: "r" + Date.now().toString(36) + Math.floor(Math.random() * 1000), name: name || ("Rig #" + nextNum()), partIds: ids, placedAt: Date.now(), pos: p };
    slotsArr().push(rig); persist(); if (S.ready) buildRigs(); updateBtn(); return rig;
  }
  function removeRig(id) {
    var a = slotsArr(), i = a.findIndex ? a.findIndex(function (r) { return r.id === id; }) : -1;
    if (i < 0) for (var k = 0; k < a.length; k++) if (a[k].id === id) i = k;
    if (i < 0) return false; a.splice(i, 1); persist(); S.sel = -1; if (S.ready) buildRigs(); hideInfo(); updateBtn(); return true;
  }
  function rigAt(pos) { var a = slotsArr(); for (var i = 0; i < a.length; i++) if (a[i].pos === pos) return a[i]; return null; }
  function stats(ids) {
    var n = 0, p = 0, e = 0, v = 0, cost = 0, tier = 0;
    CATS.forEach(function (c) { var it = item(ids[c]); if (!it) return; n++; p += it.power; e += it.efficiency; v += it.value; cost += it.cost; tier += it.tier; });
    return n ? { p: p / n, e: e / n, v: v / n, cost: cost, tier: tier / n, n: n } : null;
  }

  /* ---------- 3D-Bausteine ---------- */
  var S = { ready: false, open: false, sel: -1, spin: [], hit: [], pcs: [], th: -0.55, phi: 1.28, r: 4.1, tx: 0, ty: 1.05, tz: 0.1, raf: 0, last: 0 };
  function mat(c, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, metalness: 0.35, roughness: 0.62 }, o || {})); }
  function glow(c, i) { return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i == null ? 0.9 : i, metalness: 0.1, roughness: 0.5 }); }
  function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function fanMesh(r, c, x, y, z, speed) {                                          // Achse = z, dreht sich
    var h = new THREE.Group(); h.position.set(x, y, z);
    h.add(new THREE.Mesh(new THREE.TorusGeometry(r * 0.96, r * 0.07, 6, 22), glow(c, 0.95)));
    var bm = mat(0x1b1d22, { metalness: 0.2 });
    for (var i = 0; i < 5; i++) { var pv = new THREE.Group(); pv.rotation.z = i * Math.PI * 2 / 5; pv.add(box(r * 0.8, r * 0.26, 0.004, bm, r * 0.42, 0, 0)); h.add(pv); }
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.012, 12), mat(0x0c0d10)); hub.rotation.x = Math.PI / 2; h.add(hub);
    h.userData.speed = speed || 6; S.spin.push(h); return h;
  }
  function tierOf(id, def) { var it = item(id); return TIERC[Math.max(0, Math.min(9, (it ? it.tier : def) - 1))]; }
  /** Low-Poly-PC aus den Teile-IDs (Gehaeuse-Mass/Farbe/Front/Glas aus dem Gehaeuse, Innenleben nach Teilestufe) */
  function miniPc(rig) {
    var ids = rig.partIds || {}, cn = parseInt(String(ids["case"] || "case-5").split("-")[1], 10) || 5, cs = CASES[cn] || CASES[5];
    var Wd = cs.w * K, H = cs.h * K, D = cs.d * K, t = 0.006, y0 = 0.012, acc = cs.acc || 0x78d505;
    var g = new THREE.Group(), sheet = mat(cs.col, { metalness: 0.5, roughness: 0.5 }), dark = mat(0x0b0c0e, { metalness: 0.2, roughness: 0.7 });
    g.add(box(Wd, t, D, sheet, 0, y0 + t / 2, 0)); g.add(box(Wd, t, D, sheet, 0, y0 + H - t / 2, 0));
    g.add(box(Wd, H, t, sheet, 0, y0 + H / 2, -D / 2 + t / 2)); g.add(box(t, H, D, sheet, Wd / 2 - t / 2, y0 + H / 2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { g.add(box(0.02, y0, 0.03, dark, s[0] * (Wd / 2 - 0.02), y0 / 2, s[1] * (D / 2 - 0.04))); });
    // Front
    var fz = D / 2;
    if (cs.front === "solid") { g.add(box(Wd, H, 0.012, sheet, 0, y0 + H / 2, fz - 0.006)); }
    else if (cs.front === "mesh") { g.add(box(Wd, H, 0.012, sheet, 0, y0 + H / 2, fz - 0.006)); g.add(box(Wd * 0.86, H * 0.9, 0.004, dark, 0, y0 + H / 2, fz + 0.001)); }
    else { g.add(box(Wd, H, 0.012, sheet, 0, y0 + H / 2, fz - 0.006)); g.add(box(Wd * 0.9, H * 0.94, 0.004, mat(0x8aa0b4, { transparent: true, opacity: 0.2, metalness: 0.9, roughness: 0.05, depthWrite: false }), 0, y0 + H / 2, fz + 0.002)); }
    var nf = cs.fans || 0;
    for (var i = 0; i < nf; i++) { var fr = Math.min(Wd * 0.4, H / nf * 0.4); g.add(fanMesh(fr, acc, 0, y0 + H * (i + 0.5) / nf, fz + 0.006, 5 + i)); }
    g.add(box(Wd * 0.5, 0.005, 0.005, glow(acc, 1), 0, y0 + H * 0.06, fz + 0.004));                                     // LED-Streifen
    g.add(box(0.012, 0.012, 0.006, glow(0x3cff7a, 1), Wd * 0.34, y0 + H - 0.03, fz + 0.004));                           // Power-LED
    // Glasseite (-x) bzw. Blech
    if (cs.glass) {
      g.add(box(0.003, H - 0.03, D - 0.03, mat(0x8aa0b4, { transparent: true, opacity: 0.16, metalness: 0.9, roughness: 0.05, depthWrite: false }), -Wd / 2 + 0.002, y0 + H / 2, -0.004));
      var bx = Wd / 2 - t - 0.004;                                                                                       // Innenleben an der Tray-Seite
      g.add(box(0.004, H * 0.82, D * 0.58, mat(0x0d1115, { metalness: 0.3 }), bx, y0 + H * 0.54, -D * 0.12));
      g.add(box(Wd * 0.78, H * 0.13, D * 0.36, mat(0x15161a), 0, y0 + H * 0.085, -D * 0.28));                            // Netzteil unten hinten
      var co = item(ids.cooler), aio = co && co.tier >= 7;
      if (aio) { g.add(box(Wd * 0.3, 0.012, D * 0.3, mat(0x23262c), bx - Wd * 0.18, y0 + H - 0.03, -D * 0.1)); var bl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), glow(tierOf(ids.cooler, 7), 0.8)); bl.rotation.z = Math.PI / 2; bl.position.set(bx - 0.02, y0 + H * 0.67, -D * 0.1); g.add(bl); }
      else g.add(box(Wd * 0.3, H * 0.23, D * 0.1, mat(0x7d8691, { metalness: 0.8, roughness: 0.4 }), bx - Wd * 0.15, y0 + H * 0.68, -D * 0.1));
      var rc = tierOf(ids.ram, 4);
      for (var k = 0; k < 2; k++) g.add(box(0.006, H * 0.16, D * 0.012, glow(rc, 0.9), bx - 0.004, y0 + H * 0.69, D * 0.02 + k * D * 0.03));
      var gc = tierOf(ids.gpu, 4);
      g.add(box(Wd * 0.36, H * 0.065, D * 0.56, mat(0x17181c, { metalness: 0.5 }), bx - Wd * 0.2, y0 + H * 0.4, -D * 0.02));
      g.add(box(0.004, H * 0.012, D * 0.4, glow(gc, 1), -Wd / 2 + Wd * 0.04, y0 + H * 0.4, -D * 0.02));                    // GPU-Leuchtleiste zur Glasseite
    } else {
      g.add(box(t, H, D, sheet, -Wd / 2 + t / 2, y0 + H / 2, 0));
      for (var v = 0; v < 8; v++) g.add(box(0.002, H * 0.45, 0.004, dark, -Wd / 2 - 0.001, y0 + H * 0.5, -D * 0.4 + v * 0.02));
    }
    g.userData = { W: Wd, H: H + y0, D: D };
    return g;
  }
  function slotPos(i) { return { x: SLOT_X[i % 2], y: LEVEL_Y[Math.floor(i / 2)], z: 0.02 }; }

  function signTex(text) {
    var c = document.createElement("canvas"); c.width = 512; c.height = 96; var x = c.getContext("2d");
    x.fillStyle = "#0d1217"; x.fillRect(0, 0, 512, 96); x.strokeStyle = "#78d505"; x.lineWidth = 4; x.strokeRect(4, 4, 504, 88);
    x.fillStyle = "#78d505"; x.font = "700 44px ui-monospace, Menlo, monospace"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, 256, 50);
    return new THREE.CanvasTexture(c);
  }

  function init3d(stage) {
    var sc = new THREE.Scene(); sc.background = new THREE.Color(0x0a0d11); sc.fog = new THREE.Fog(0x0a0d11, 7, 16);
    var cam = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
    var rd = new THREE.WebGLRenderer({ antialias: true }); rd.setPixelRatio(Math.min(W.devicePixelRatio || 1, 2));
    rd.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none"; stage.appendChild(rd.domElement);
    sc.add(new THREE.HemisphereLight(0x9fb4c8, 0x1a1e24, 0.75)); sc.add(new THREE.AmbientLight(0x404858, 0.5));
    var l1 = new THREE.PointLight(0xfff2dc, 1.0, 12); l1.position.set(0.6, 3.1, 2.2); sc.add(l1);
    var l2 = new THREE.PointLight(0x78d505, 0.5, 6); l2.position.set(0, 0.5, 1.4); sc.add(l2);
    var l3 = new THREE.PointLight(0x3a7bff, 0.45, 8); l3.position.set(-2.4, 1.8, 1.0); sc.add(l3);
    // Raum
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), mat(0x1c2128, { metalness: 0.2, roughness: 0.85 })); floor.rotation.x = -Math.PI / 2; sc.add(floor);
    var grid = new THREE.GridHelper(10, 20, 0x2c3542, 0x1e252d); grid.position.y = 0.002; sc.add(grid);
    var wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.2), mat(0x141a22, { metalness: 0.1, roughness: 0.9 })); wall.position.set(0, 2.1, -1.5); sc.add(wall);
    for (var i = -2; i <= 2; i++) sc.add(box(0.05, 3.6, 0.02, glow(0x1d3a52, 0.55), i * 1.6, 2.0, -1.48));              // Wand-Lichtleisten
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.28), new THREE.MeshBasicMaterial({ map: signTex("HASHPOOL FARM") })); sign.position.set(0, 2.62, -1.46); sc.add(sign);
    // Rack
    var rack = new THREE.Group(), met = mat(0x2b3038, { metalness: 0.7, roughness: 0.45 });
    [[-0.58, -0.42], [0.58, -0.42], [-0.58, 0.42], [0.58, 0.42]].forEach(function (p) { rack.add(box(0.05, 2.34, 0.05, met, p[0], 1.17, p[1])); });
    LEVEL_Y.forEach(function (y) { rack.add(box(1.18, 0.03, 0.88, met, 0, y - 0.015, 0)); });
    rack.add(box(1.18, 0.04, 0.88, met, 0, 2.32, 0)); rack.add(box(1.14, 2.2, 0.02, mat(0x0f1318, { metalness: 0.3 }), 0, 1.15, -0.43));
    [-0.58, 0.58].forEach(function (x) { rack.add(box(0.012, 2.2, 0.012, glow(0x78d505, 0.6), x * 1.0, 1.15, 0.44)); });
    sc.add(rack);
    var ring = new THREE.Group(); sc.add(ring);
    var sel = box(0.46, 0.008, 0.66, glow(0x78d505, 0.9), 0, 0, 0); sel.visible = false; sc.add(sel);
    S.scene = sc; S.cam = cam; S.rd = rd; S.pcGroup = ring; S.selMark = sel; S.stage = stage; S.ready = true;
    bindControls(rd.domElement); buildRigs();
  }

  function buildRigs() {
    var grp = S.pcGroup; while (grp.children.length) grp.remove(grp.children[0]);
    S.spin = []; S.hit = [];
    for (var i = 0; i < MAX; i++) {
      var p = slotPos(i), rig = rigAt(i), holder = new THREE.Group(); holder.position.set(p.x, p.y, p.z); grp.add(holder);
      if (rig) { try { holder.add(miniPc(rig)); } catch (e) { console.warn("[farm] PC", e); holder.add(box(0.25, 0.4, 0.4, mat(0x222831), 0, 0.2, 0)); } }
      else {                                                                                                            // freier Platz: leuchtendes Plus
        var gm = glow(0x2c4a2a, 0.7); holder.add(box(0.34, 0.004, 0.5, mat(0x161b21), 0, 0.002, 0)); holder.add(box(0.14, 0.006, 0.02, gm, 0, 0.006, 0)); holder.add(box(0.02, 0.006, 0.14, gm, 0, 0.006, 0));
      }
      var hb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.62), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(0, 0.31, 0); hb.userData.slot = i; holder.add(hb); S.hit.push(hb);
    }
    markSel();
  }
  function markSel() {
    if (!S.selMark) return;
    if (S.sel < 0) { S.selMark.visible = false; return; }
    var p = slotPos(S.sel); S.selMark.position.set(p.x, p.y + 0.004, p.z); S.selMark.visible = true;
  }

  /* ---------- Kamera + Eingabe ---------- */
  function updateCam() {
    var sp = Math.sin(S.phi), c = S.cam;
    c.position.set(S.tx + S.r * sp * Math.sin(S.th), S.ty + S.r * Math.cos(S.phi), S.tz + S.r * sp * Math.cos(S.th)); c.lookAt(new THREE.Vector3(S.tx, S.ty, S.tz));
  }
  function orbit(dx, dy) { S.th -= dx * 0.008; S.phi = Math.max(0.45, Math.min(1.55, S.phi - dy * 0.006)); }
  function pan(dx, dy) { var k = S.r * 0.0016; S.tx = Math.max(-1.6, Math.min(1.6, S.tx - dx * k * Math.cos(S.th))); S.tz = Math.max(-1, Math.min(1.6, S.tz + dx * k * Math.sin(S.th))); S.ty = Math.max(0.3, Math.min(2.2, S.ty + dy * k)); }
  function zoom(f) { S.r = Math.max(1.8, Math.min(7, S.r * f)); }
  function pick(cx, cy) {
    var el = S.rd.domElement, rc = el.getBoundingClientRect(), v = new THREE.Vector2(((cx - rc.left) / rc.width) * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1);
    var ray = new THREE.Raycaster(); ray.setFromCamera(v, S.cam);
    var hits = ray.intersectObjects(S.hit, false); if (hits.length) select(hits[0].object.userData.slot); else { S.sel = -1; markSel(); hideInfo(); }
  }
  function bindControls(el) {
    var ptr = {}, lastD = 0, lastM = null;
    function cnt() { return Object.keys(ptr).length; }
    el.addEventListener("pointerdown", function (e) { ptr[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() }; lastD = 0; lastM = null; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener("pointermove", function (e) {
      var p = ptr[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (cnt() === 1) { if (e.shiftKey || e.buttons === 2 || e.buttons === 4) pan(dx, dy); else orbit(dx, dy); }
      else if (cnt() >= 2) {
        var ks = Object.keys(ptr), a = ptr[ks[0]], b = ptr[ks[1]], d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (lastD) zoom(lastD / d); if (lastM) pan(m.x - lastM.x, m.y - lastM.y); lastD = d; lastM = m;
      }
    });
    function up(e) {
      var p = ptr[e.pointerId]; if (!p) return;
      var n = cnt(), moved = Math.hypot(p.x - p.sx, p.y - p.sy), dt = performance.now() - p.t; delete ptr[e.pointerId]; lastD = 0; lastM = null;
      if (n === 1 && moved < 8 && dt < 600 && e.type === "pointerup") pick(e.clientX, e.clientY);
    }
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", function (e) { e.preventDefault(); zoom(1 + e.deltaY * 0.0012); }, { passive: false });
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  function fit() {
    if (!S.ready || !S.stage) return; var w = S.stage.clientWidth || 360, h = S.stage.clientHeight || 480;
    S.rd.setSize(w, h, false); S.cam.aspect = w / h; S.cam.updateProjectionMatrix();
  }
  function loop(t) {
    if (!S.open) return; S.raf = requestAnimationFrame(loop);
    var dt = Math.min(0.05, (t - (S.last || t)) / 1000); S.last = t;
    for (var i = 0; i < S.spin.length; i++) S.spin[i].rotation.z -= dt * S.spin[i].userData.speed;
    updateCam(); S.rd.render(S.scene, S.cam);
  }

  /* ---------- Oberflaeche ---------- */
  function css() {
    if (document.getElementById("farm-style")) return;
    var s = document.createElement("style"); s.id = "farm-style";
    s.textContent = ".farm-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9000;background:#0b0d10;display:none;flex-direction:column;color:#e7e9ec;font-family:inherit}.farm-ov.open{display:flex}" +
      ".farm-top{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 10px;background:#12161c;border-bottom:1px solid #232b36}.farm-top h2{margin:0;font-size:16px;flex:1}.farm-count{color:#78d505;font-weight:700;font-size:13px}" +
      ".farm-x{background:#12161c;color:#e7e9ec;border:1px solid #2c3646;border-radius:10px;width:38px;height:38px;font-size:16px;cursor:pointer}" +
      ".farm-stage{position:relative;flex:1;min-height:0;overflow:hidden}.farm-hint{position:absolute;left:0;right:0;top:6px;text-align:center;font-size:11px;color:#6b7686;pointer-events:none}" +
      ".farm-info{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:rgba(18,22,28,.97);border:1px solid #2c3646;border-radius:14px;padding:12px 14px;max-height:52%;overflow:auto;transform:translateY(120%);transition:transform .22s ease;font-size:12px;line-height:1.45}.farm-info.show{transform:translateY(0)}" +
      ".farm-info h3{margin:0 0 2px;font-size:15px;color:#f7931a}.farm-sub{color:#8b95a5;font-size:11px;margin-bottom:8px}.farm-parts{display:grid;gap:3px;margin:6px 0 8px}.farm-parts div{display:flex;gap:6px}.farm-parts i{font-style:normal;width:20px}.farm-parts span{color:#8b95a5;min-width:70px}" +
      ".farm-bar{display:flex;align-items:center;gap:8px;margin:3px 0;font-size:11px;color:#8b95a5}.farm-bar span{width:96px}.farm-bar u{flex:1;height:6px;background:#1b222b;border-radius:3px;overflow:hidden;text-decoration:none;display:block}.farm-bar u b{display:block;height:100%;background:#78d505}.farm-bar em{font-style:normal;color:#e7e9ec;width:38px;text-align:right}" +
      ".farm-btns{display:flex;gap:8px;margin-top:10px}.farm-btns button,.farm-offer button{flex:1;font:700 12px inherit;padding:10px;border-radius:9px;cursor:pointer;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}.farm-btns button.pri,.farm-offer button.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}.farm-btns button.dng{border-color:#7a2b2b;color:#ff7a6b}" +
      ".farm-offer{position:fixed;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);z-index:99999;background:#12161c;border:1px solid #f7931a;border-radius:14px;padding:12px 14px;display:none;font-size:13px;box-shadow:0 8px 30px rgba(0,0,0,.6)}.farm-offer.show{display:block}.farm-offer p{margin:0 0 10px}.farm-offer div{display:flex;gap:8px}" +
      ".farm-fab{position:fixed;left:10px;bottom:10px;z-index:8000}";
    document.head.appendChild(s);
  }
  var ov = null, offer = null;
  function ensureDom() {
    if (ov) return; css();
    ov = document.createElement("div"); ov.className = "farm-ov"; ov.id = "farm-overlay";
    ov.innerHTML = '<div class="farm-top"><h2 id="farm-title"></h2><div class="farm-count" id="farm-count"></div><button type="button" class="farm-x" id="farm-close">✕</button></div><div class="farm-stage" id="farm-stage"><div class="farm-hint" id="farm-hint"></div><div class="farm-info" id="farm-info"></div></div>';
    document.body.appendChild(ov);
    ov.querySelector("#farm-close").addEventListener("click", close);
    W.addEventListener("resize", function () { if (S.open) fit(); });
  }
  function texts() {
    ov.querySelector("#farm-title").textContent = "🏭 " + T("Meine Farm", "My Farm");
    ov.querySelector("#farm-count").textContent = slotsArr().length + "/" + MAX;
    ov.querySelector("#farm-hint").textContent = T("ziehen: drehen · 2 Finger: zoomen/verschieben · PC antippen", "drag: rotate · 2 fingers: zoom/pan · tap a PC");
  }
  function hideInfo() { var i = ov && ov.querySelector("#farm-info"); if (i) i.classList.remove("show"); }
  function bar(label, v) { return '<div class="farm-bar"><span>' + label + '</span><u><b style="width:' + Math.round(v * 10) + '%"></b></u><em>' + v.toFixed(1) + "</em></div>"; }
  function select(i) {
    S.sel = i; markSel();
    var info = ov.querySelector("#farm-info"), rig = rigAt(i), h = "";
    if (!rig) {
      h = "<h3>" + T("Freier Platz", "Empty slot") + " " + (i + 1) + "</h3><div class=\"farm-sub\">" + T("Verkaufe einen gebauten Rig und stelle ihn danach hier ab.", "Sell a finished rig and place it here afterwards.") + "</div>" +
        '<div class="farm-btns"><button type="button" class="pri" id="farm-demo">' + T("Beispiel-Rig hier abstellen", "Place a sample rig here") + '</button><button type="button" id="farm-hide">' + T("Schließen", "Close") + "</button></div>";
    } else {
      var st = stats(rig.partIds), d = new Date(rig.placedAt);
      h = "<h3>" + esc(rig.name) + '</h3><div class="farm-sub">' + T("Platz ", "Slot ") + (i + 1) + " · " + T("abgestellt am ", "placed ") + d.toLocaleDateString(de() ? "de-DE" : "en-GB") + "</div><div class=\"farm-parts\">";
      CATS.forEach(function (c) {
        var it = item(rig.partIds[c]), ic = ""; try { ic = PART_CATALOG[c].icon || ""; } catch (e) {} var cn = c; try { cn = PART_CATALOG[c].name[de() ? "de" : "en"] || c; } catch (e) {}
        h += "<div><i>" + ic + "</i><span>" + esc(cn) + "</span><b>" + esc(nm(rig.partIds[c])) + "</b>" + (it ? " · T" + it.tier : "") + "</div>";
      });
      h += "</div>";
      if (st) h += bar(T("Leistung ⌀", "Performance ⌀"), st.p) + bar(T("Effizienz ⌀", "Efficiency ⌀"), st.e) + bar(T("Preis/Leistung ⌀", "Value ⌀"), st.v) + '<div class="farm-sub" style="margin-top:6px">' + T("Teilewert: ", "Parts value: ") + fmt(st.cost) + " sats · " + T("Stufe ⌀ ", "Tier ⌀ ") + st.tier.toFixed(1) + "</div>";
      h += '<div class="farm-btns"><button type="button" class="dng" id="farm-del">' + T("Aus Farm entfernen", "Remove from farm") + '</button><button type="button" id="farm-hide">' + T("Schließen", "Close") + "</button></div>";
    }
    info.innerHTML = h; info.classList.add("show");
    var hd = info.querySelector("#farm-hide"); if (hd) hd.addEventListener("click", function () { S.sel = -1; markSel(); hideInfo(); });
    var dm = info.querySelector("#farm-demo"); if (dm) dm.addEventListener("click", function () { var sp = (W.Parts3D && W.Parts3D.demoSpec) ? W.Parts3D.demoSpec() : { "case": "case-7", mobo: "mobo-6", cpu: "cpu-8", cooler: "cooler-6", ram: "ram-6", gpu: "gpu-7", psu: "psu-6", ssd: ["ssd-5"] }; var r = add(sp, T("Beispiel-Rig", "Sample rig")); texts(); if (r) select(r.pos); });
    var dl = info.querySelector("#farm-del"); if (dl) { var armed = false; dl.addEventListener("click", function () { if (!armed) { armed = true; dl.textContent = T("Wirklich entfernen?", "Really remove?"); setTimeout(function () { armed = false; if (dl.isConnected) dl.textContent = T("Aus Farm entfernen", "Remove from farm"); }, 3000); return; } removeRig(rig.id); texts(); }); }
  }
  function open() {
    ensureDom(); load();
    if (!S.ready) { try { init3d(ov.querySelector("#farm-stage")); } catch (e) { console.warn("[farm] 3D nicht moeglich", e); toastMsg(T("3D-Farm hier nicht verfügbar.", "3D farm not available here.")); return; } }
    else buildRigs();
    texts(); ov.classList.add("open"); S.open = true; S.sel = -1; markSel(); hideInfo(); fit(); fit(); S.last = 0; cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(loop);
  }
  function close() { S.open = false; cancelAnimationFrame(S.raf); if (ov) ov.classList.remove("open"); updateBtn(); }
  function toastMsg(m) { try { var el = document.getElementById("ps-toast"); if (el) { el.textContent = m; el.classList.add("show"); setTimeout(function () { el.classList.remove("show"); }, 3200); } else alert(m); } catch (e) {} }

  /* ---------- Button + Angebot nach dem Verkauf ---------- */
  var btn = null;
  function updateBtn() { if (btn) btn.textContent = "🏭 " + T("Meine Farm", "My Farm") + " (" + slotsArr().length + "/" + MAX + ")"; }
  function placeBtn() {
    if (btn) return true; css();
    var ref = document.getElementById("ps-open-btn");
    btn = document.createElement("button"); btn.type = "button"; btn.id = "farm-open-btn"; btn.className = ref ? ref.className : "ps-open-btn farm-fab";
    if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling); else if (document.body) { btn.classList.add("farm-fab"); document.body.appendChild(btn); } else { btn = null; return false; }
    btn.addEventListener("click", open); load(); updateBtn(); return true;
  }
  function offerRig(ids) {
    if (!ids || !ids["case"] || !ids.mobo || !ids.cpu) return;
    if (!offer) { css(); offer = document.createElement("div"); offer.className = "farm-offer"; document.body.appendChild(offer); }
    load();
    var full = freeSlot() < 0;
    offer.innerHTML = "<p>🏭 <b>" + T("Rig verkauft!", "Rig sold!") + "</b> " + (full ? T("Deine Farm ist voll (6/6). Entferne zuerst einen Rig.", "Your farm is full (6/6). Remove a rig first.") : T("Als Trophäe in deine Farm stellen? (Verkauf und Belohnung bleiben wie sie sind.)", "Place it in your farm as a trophy? (The sale and reward stay as they are.)")) + "</p><div>" +
      (full ? '<button type="button" class="pri" id="farm-o-open">' + T("Farm öffnen", "Open farm") + "</button>" : '<button type="button" class="pri" id="farm-o-yes">' + T("In Farm stellen", "Place in farm") + "</button>") + '<button type="button" id="farm-o-no">' + T("Nein danke", "No thanks") + "</button></div>";
    offer.classList.add("show");
    var hide = function () { offer.classList.remove("show"); };
    var y = offer.querySelector("#farm-o-yes"); if (y) y.addEventListener("click", function () { hide(); var r = add(ids); open(); if (r) select(r.pos); });
    var o = offer.querySelector("#farm-o-open"); if (o) o.addEventListener("click", function () { hide(); open(); });
    offer.querySelector("#farm-o-no").addEventListener("click", hide);
    clearTimeout(offerRig._t); offerRig._t = setTimeout(hide, 25000);
  }
  function hookSell() {
    if (typeof sellRig !== "function" || sellRig._farm) return false;
    var orig = sellRig;
    sellRig = function (reward) {
      var ids = null; try { var bp = state.buildPick || {}; ids = {}; ["case", "mobo", "cpu", "cooler", "ram", "gpu", "psu", "ssd"].forEach(function (k) { if (bp[k]) ids[k] = [].concat(bp[k])[0]; }); } catch (e) { ids = null; }
      var out = orig.apply(this, arguments);
      if (ids) setTimeout(function () { try { offerRig(ids); } catch (e) { console.warn("[farm] offer", e); } }, 500);
      return out;
    };
    sellRig._farm = true; return true;
  }
  function hookSave() {
    if (typeof save !== "function" || save._farm) return false;
    var orig = save; save = function () { var r = orig.apply(this, arguments); writeLocal(); return r; }; save._farm = true; return true;
  }
  function hookPayload() {
    var H = W.HashpoolSave; if (!H || H._farm) return !!(H && H._farm);
    var g = H.getPayload, a = H.applyPayload;
    H.getPayload = function () { var p = g.apply(this, arguments); if (p) { try { p.farmSlots = slotsArr(); } catch (e) {} } return p; };
    H.applyPayload = function (saved) { var ok = a.apply(this, arguments); try { if (saved && typeof saved === "object") { state.farmSlots = Array.isArray(saved.farmSlots) ? clean(saved.farmSlots) : []; loaded = false; load(); writeLocal(); updateBtn(); } } catch (e) {} return ok; };
    H._farm = true; return true;
  }

  /* ---------- Start ---------- */
  var n = 0, h1 = false, h2 = false, h3 = false, h4 = false;
  var iv = setInterval(function () {
    n++;
    try { if (!h1) h1 = placeBtn(); if (!h2) h2 = hookSell(); if (!h3) h3 = hookSave(); if (!h4) h4 = hookPayload(); } catch (e) { console.warn("[farm]", e); }
    if ((h1 && h2 && h3 && h4) || n > 120) clearInterval(iv);
  }, 250);
  setInterval(function () { try { updateBtn(); } catch (e) {} }, 2000);
  W.Parts3D = W.Parts3D || {};
  W.Parts3D.farm = { open: open, close: close, add: add, remove: removeRig, slots: slotsArr, select: function (i) { ensureDom(); select(i); }, load: load, _dbg: { S: S, init3d: init3d, miniPc: miniPc, buildRigs: buildRigs } };
  console.log("[HASHPOOL] farmRoom bereit");
})();

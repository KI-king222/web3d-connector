/* world.js — HASHPOOL NEXT: Shop-Simulator als Hauptscreen (nur in /next/ geladen)
 * Laden vorne (Theke, Kunden) + Hinterraum (Bestell-Computer, Regal mit deinen Teilen, Bautisch) + Farm-Tuer.
 * Spieler laeuft per Antippen (Boden oder Station). Stationen oeffnen die vorhandenen Spiel-Menues
 * (Teile-Shop, Teile-Auswahl/Zusammenbau, Farm, Auftraege). "Klassik" blendet die alte Klick-Ansicht ein.
 * Speicher: nur localStorage hashpool-next-* (nichts am Spielstand der oeffentlichen Version).
 */
(function () {
  var W = window;
  if (W.__nxWorld) return; W.__nxWorld = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function ORD() { return W.Parts3D && Parts3D.orders; }
  function SHOPDBG() { return W.Parts3D && Parts3D.shop && Parts3D.shop._dbg; }
  var PREF = "hashpool-next-world";

  function mat(c, o) { var p = { color: c, roughness: 0.8, metalness: 0.1 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function textTex(txt, w, h, bg, fg, font) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d");
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 2);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- Raeume (Draufsicht: x rechts, z zum Betrachter) ---------- */
  var DIV = -1.3;                              // Trennwand z (Tuer in der Mitte, x -0.95..0.95)
  var FRONT = { x0: -4, x1: 4 }, BACK = { x0: -4, x1: 4, z0: -6.4, z1: -1.9 };
  function inFront(z) { return z > DIV; }
  function clampPos(x, z) {
    if (z > DIV - 0.01) return [Math.max(FRONT.x0, Math.min(FRONT.x1, x)), Math.max(DIV + 0.5, Math.min(3.3, z))];
    return [Math.max(BACK.x0, Math.min(BACK.x1, x)), Math.max(BACK.z0, Math.min(BACK.z1, z))];
  }
  function route(fx, fz, tx, tz) {             // Raumwechsel immer durch die Tuer (x=0)
    var pts = [], a = inFront(fz), b = inFront(tz);
    if (a !== b) { pts.push(a ? [0, DIV + 0.9] : [0, DIV - 0.9]); pts.push(a ? [0, DIV - 0.9] : [0, DIV + 0.9]); }
    pts.push([tx, tz]); return pts;
  }

  var S = { ready: false, shown: false, hiddenByOverlay: false, t: 0, last: 0, zoom: 1, player: null, cust: null, nextCust: 4, hits: [], stations: {}, sig: "", dlg: null, pending: null, invGroup: null, raf: 0 };
  var root = null;

  function css() {
    if (document.getElementById("nx-style")) return;
    var s = document.createElement("style"); s.id = "nx-style";
    s.textContent =
      "#nx-world{position:fixed;inset:0;z-index:800;background:#0a0d14;display:none;touch-action:none}#nx-world.show{display:block}" +
      "#nx-world canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}" +
      ".nx-hud{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 26px) 10px 8px;color:#e7e9ec;font:700 13px monospace;pointer-events:none;background:linear-gradient(#0009,#0000);z-index:3}" +
      ".nx-hud b{flex:1}.nx-hud button{pointer-events:auto;font:700 12px monospace;padding:8px 10px;border-radius:9px;border:1px solid #2c3646;background:#12161ccc;color:#e7e9ec}" +
      ".nx-lbl{position:absolute;transform:translate(-50%,-100%);background:#12161ce6;color:#f7931a;border:1px solid #f7931a;border-radius:10px;padding:5px 9px;font:700 12px monospace;white-space:nowrap;cursor:pointer;z-index:2}" +
      ".nx-lbl.cust{background:#fff;color:#111;border-color:#fff;font-size:16px}" +
      ".nx-zoom{position:absolute;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);display:flex;flex-direction:column;gap:6px;z-index:3}.nx-zoom button{width:38px;height:38px;font:700 18px monospace;border-radius:10px;border:1px solid #2c3646;background:#12161ccc;color:#e7e9ec}" +
      ".nx-hint{position:absolute;left:10px;right:58px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);color:#aeb6c2;font:12px monospace;text-shadow:0 1px 3px #000;pointer-events:none}" +
      "#nx-dlg,#nx-inv{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font:13px sans-serif;display:none;z-index:5;max-height:66%;overflow:auto;box-shadow:0 8px 30px #000a}#nx-dlg.show,#nx-inv.show{display:block}" +
      "#nx-dlg h4,#nx-inv h4{margin:0 0 4px;font-size:15px}#nx-dlg h4 i{font-weight:400;color:#aeb6c2;font-size:12px}#nx-dlg p{margin:6px 0}#nx-dlg ul{margin:6px 0 6px 18px;padding:0}.nx-rw{color:#f7931a;font-weight:700}" +
      ".nx-bt{display:flex;gap:8px;margin-top:10px}.nx-bt button{flex:1;font:700 13px sans-serif;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}.nx-bt button.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}" +
      ".nx-row{display:flex;justify-content:space-between;border-bottom:1px solid #222a36;padding:5px 0}" +
      "#nx-back{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);z-index:99990;font:700 12px monospace;padding:10px 12px;border-radius:12px;border:1px solid #f7931a;background:#12161c;color:#f7931a;display:none}";
    document.head.appendChild(s);
  }

  /* ---------- Figuren ---------- */
  function makeActor(spec) {
    var D = SHOPDBG(), ch;
    if (D && D.makeChar) ch = D.makeChar(spec);
    else {                                                                 // Notfall-Figur
      var g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      body.add(cyl(0.2, 0.2, 1.2, mat(spec.shirt || 0xf7931a), 0, 0.8, 0, 10)); var head = new THREE.Group(); head.position.set(0, 1.6, 0); head.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(spec.skin || 0xe8b894))); body.add(head);
      var d = function () { return new THREE.Group(); }; ch = { g: g, body: body, legL: d(), legR: d(), armL: d(), armR: d(), head: head };
    }
    return { g: ch.g, ch: ch, path: [], pi: 0, speed: 2.2, ph: Math.random() * 6, done: null };
  }
  function stepActor(a, dt) {
    var moving = a.pi < a.path.length, ch = a.ch;
    if (moving) {
      var p = a.path[a.pi], dx = p[0] - a.g.position.x, dz = p[1] - a.g.position.z, d = Math.hypot(dx, dz), st = a.speed * dt;
      if (d <= st) { a.g.position.x = p[0]; a.g.position.z = p[1]; a.pi++; if (a.pi >= a.path.length && a.done) { var f = a.done; a.done = null; f(a); } }
      else {
        a.g.position.x += dx / d * st; a.g.position.z += dz / d * st; var tg = Math.atan2(dx, dz), df = tg - a.g.rotation.y;
        while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI; a.g.rotation.y += df * Math.min(1, dt * 10);
      }
      a.ph += dt * a.speed * 3.4; var sw = Math.sin(a.ph);
      ch.legL.rotation.x = sw * 0.6; ch.legR.rotation.x = -sw * 0.6; ch.armL.rotation.x = -sw * 0.5; ch.armR.rotation.x = sw * 0.5; ch.body.position.y = Math.abs(sw) * 0.035;
    } else {
      a.ph += dt * 2; ch.legL.rotation.x *= 0.8; ch.legR.rotation.x *= 0.8; ch.armL.rotation.x = Math.sin(a.ph) * 0.05; ch.armR.rotation.x = -Math.sin(a.ph) * 0.05; ch.body.position.y = 0; ch.head.rotation.y = Math.sin(a.ph * 0.5) * 0.3;
    }
  }
  function goTo(a, tx, tz, done) { var c = clampPos(tx, tz), pts = route(a.g.position.x, a.g.position.z, c[0], c[1]); a.path = pts; a.pi = 0; a.done = done || null; }

  /* ---------- Szene ---------- */
  function addStation(id, x, y, z, w, h, d, label, standX, standZ, action) {
    var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(x, y, z); hb.userData.st = id; S.scene.add(hb); S.hits.push(hb);
    S.stations[id] = { id: id, sx: standX, sz: standZ, action: action, lx: x, ly: y + h / 2 + 0.2, lz: z, label: label, el: null };
  }
  function build3d(stage) {
    var sc = new THREE.Scene(); sc.background = new THREE.Color(0x0b1020); sc.fog = new THREE.Fog(0x0b1020, 22, 55); S.scene = sc;
    var cam = new THREE.PerspectiveCamera(44, 1, 0.1, 120); var rd = new THREE.WebGLRenderer({ antialias: true }); rd.setPixelRatio(Math.min(W.devicePixelRatio || 1, 2)); stage.appendChild(rd.domElement);
    sc.add(new THREE.HemisphereLight(0x9fb4d8, 0x1a1a22, 0.75)); sc.add(new THREE.AmbientLight(0x4a566e, 0.5));
    var l1 = new THREE.PointLight(0xfff0d6, 1.0, 11); l1.position.set(0, 3.2, 1.2); sc.add(l1);
    var l2 = new THREE.PointLight(0xdfe9ff, 0.95, 11); l2.position.set(0, 3.2, -4.2); sc.add(l2);
    var l3 = new THREE.PointLight(0xffc977, 0.8, 9); l3.position.set(0, 3.4, 5.6); sc.add(l3);
    // Strasse
    sc.add(box(80, 0.1, 6, mat(0x23262c, { roughness: 0.95 }), 0, -0.05, 9)); for (var d = -18; d <= 18; d += 3.2) sc.add(box(1.6, 0.012, 0.14, glow(0xd8b73a), d, 0.01, 9));
    sc.add(box(80, 0.14, 2.6, mat(0x8a8d93, { roughness: 0.95 }), 0, 0.07, 4.9));
    [-6.5, 6.5].forEach(function (x) {
      sc.add(cyl(0.05, 0.07, 3.6, mat(0x1b1e24), x, 1.8, 5.8, 8));
      var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), glow(0xffd98a)); lamp.position.set(x + (x < 0 ? 0.5 : -0.5), 3.55, 5.8); sc.add(lamp);
    });
    // Boeden (ueberlappen nicht)
    sc.add(box(8.6, 0.12, 4.85, mat(0x6b5a4a, { roughness: 0.6 }), 0, 0.06, 1.125));
    sc.add(box(8.6, 0.12, 5.4, mat(0x56606e, { roughness: 0.9 }), 0, 0.06, -4.0));
    sc.add(box(2.4, 0.13, 1.2, mat(0x3b4658, { roughness: 0.95 }), 0, 0.062, 3.0));
    // Waende
    var wm = mat(0x2a3446, { roughness: 0.9 }), wl = mat(0x232c3c);
    sc.add(box(8.8, 3.6, 0.18, wm, 0, 1.8, -6.7)); sc.add(box(0.18, 3.6, 9.4, wm, -4.4, 1.8, -2.05)); sc.add(box(0.18, 3.6, 9.4, wm, 4.4, 1.8, -2.05));
    sc.add(box(3.4, 1.0, 0.16, wl, -2.65, 0.5, DIV)); sc.add(box(3.4, 1.0, 0.16, wl, 2.65, 0.5, DIV)); sc.add(box(1.9, 0.12, 0.16, wl, 0, 1.0, DIV));
    sc.add(box(8.8, 0.9, 0.3, mat(0x1b2233), 0, 3.15, 3.55));
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.7), new THREE.MeshBasicMaterial({ map: textTex("HASHPOOL PC-SHOP", 1024, 160, "#10151f", "#f7931a", "bold 96px sans-serif") })); sign.position.set(0, 3.15, 3.71); sc.add(sign);
    var glass = new THREE.MeshStandardMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.14, roughness: 0.1 });
    [-2.55, 2.55].forEach(function (px) { var gp = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), glass); gp.position.set(px, 1.4, 3.55); sc.add(gp); });
    sc.add(box(8.0, 0.01, 0.06, glow(0xf7931a), 0, 0.13, DIV + 0.3));
    // Computer (Teile bestellen)
    var wood = mat(0x4a3526, { roughness: 0.6 });
    sc.add(box(1.9, 0.08, 0.9, wood, -2.9, 0.95, -6.0)); [[-3.8, -6.35], [-2.0, -6.35], [-3.8, -5.65], [-2.0, -5.65]].forEach(function (p) { sc.add(box(0.08, 0.95, 0.08, wood, p[0], 0.47, p[1])); });
    sc.add(box(0.8, 0.5, 0.04, mat(0x15181e), -2.9, 1.3, -6.25)); sc.add(box(0.74, 0.44, 0.01, new THREE.MeshBasicMaterial({ map: textTex("TEILE BESTELLEN", 256, 150, "#0a1830", "#6aa8ff", "bold 30px sans-serif") }), -2.9, 1.3, -6.22)); sc.add(box(0.5, 0.02, 0.16, mat(0x2b2f38), -2.9, 1.0, -5.85));
    addStation("pc", -2.9, 1.2, -6.0, 1.9, 1.0, 1.0, "💻 " + T("Teile bestellen", "Order parts"), -2.9, -4.95, function () { openMenu("shop"); });
    // Regal
    sc.add(box(3.4, 2.5, 0.1, mat(0x1a202c), 1.4, 1.35, -6.55)); var sm = mat(0x2d3646, { metalness: 0.4 });
    for (var lv = 0; lv < 3; lv++) sc.add(box(3.4, 0.05, 0.6, sm, 1.4, 0.45 + lv * 0.85, -6.3));
    [-0.28, 3.08].forEach(function (x) { sc.add(box(0.06, 2.5, 0.6, sm, x, 1.3, -6.3)); });
    S.invGroup = new THREE.Group(); sc.add(S.invGroup);
    addStation("shelf", 1.4, 1.3, -6.2, 3.4, 2.5, 0.8, "📦 " + T("Regal", "Shelf"), 1.4, -5.3, function () { openShelf(); });
    // Bautisch
    sc.add(box(2.2, 0.1, 1.3, mat(0x6e5740), 3.0, 0.95, -3.6)); [[-1, -0.5], [1, -0.5], [-1, 0.5], [1, 0.5]].forEach(function (p) { sc.add(box(0.08, 0.95, 0.08, wood, 3.0 + p[0] * 0.95, 0.47, -3.6 + p[1] * 0.55)); });
    sc.add(box(1.0, 0.012, 0.7, mat(0x1f6f3f), 3.0, 1.005, -3.6)); sc.add(box(0.5, 0.45, 0.35, mat(0x202833, { metalness: 0.5 }), 3.1, 1.25, -3.6)); sc.add(box(0.015, 0.38, 0.26, glow(0x78d505), 3.34, 1.25, -3.6));
    sc.add(box(0.1, 0.03, 0.4, mat(0xc0c4cc, { metalness: 0.8 }), 2.5, 1.02, -3.3)); sc.add(box(0.08, 0.08, 0.08, mat(0xb03a2e), 2.4, 1.04, -3.8));
    addStation("bench", 3.0, 1.2, -3.6, 2.3, 1.0, 1.4, "🔧 " + T("Bautisch", "Workbench"), 1.6, -3.6, function () { openMenu("build"); });
    // Farm-Tuer
    sc.add(box(0.12, 2.3, 1.3, mat(0x14181f), -4.3, 1.15, -3.2)); sc.add(box(0.14, 0.1, 1.5, mat(0xf7931a), -4.3, 2.35, -3.2));
    var fs = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: textTex("FARM ▼", 256, 64, "#10151f", "#78d505", "bold 40px sans-serif") })); fs.rotation.y = Math.PI / 2; fs.position.set(-4.2, 2.6, -3.2); sc.add(fs);
    addStation("farm", -4.2, 1.15, -3.2, 0.6, 2.3, 1.4, "🏭 " + T("Farm", "Farm"), -3.3, -3.2, function () { openMenu("farm"); });
    // Theke + Kasse (Laden)
    sc.add(box(3.0, 1.0, 0.8, wood, 2.3, 0.62, 0.2)); sc.add(box(3.1, 0.06, 0.9, mat(0x6e5740), 2.3, 1.15, 0.2)); sc.add(box(0.5, 0.34, 0.03, mat(0x15181e), 1.6, 1.38, 0.1)); sc.add(box(0.46, 0.3, 0.01, glow(0x2a8cff), 1.6, 1.38, 0.12));
    addStation("counter", 2.3, 1.2, 0.2, 3.0, 1.2, 0.9, "🧾 " + T("Theke", "Counter"), 0.6, 0.6, function () { counterAction(); });
    // Deko Laden
    sc.add(box(1.8, 2.4, 0.4, mat(0x1a202c), -3.4, 1.3, 2.9));
    for (var l = 0; l < 3; l++) for (var n = 0; n < 3; n++) { sc.add(box(0.44, 0.5, 0.34, mat(rnd([0x202833, 0x2b2f38, 0x39414f]), { metalness: 0.5 }), -3.9 + n * 0.5, 0.55 + l * 0.7, 2.9)); sc.add(box(0.015, 0.4, 0.26, glow(rnd([0x78d505, 0xff3a6e, 0x3a8bff, 0xffb020])), -3.9 + n * 0.5 + 0.22, 0.55 + l * 0.7, 2.9)); }
    var neon = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.4), new THREE.MeshBasicMaterial({ map: textTex("OPEN", 256, 112, "#101820", "#4fe38a", "bold 72px sans-serif") })); neon.position.set(-2.4, 2.3, 3.5); sc.add(neon);
    // Nachbarn
    [[-10.5, 0x2b2530], [10.5, 0x25303a]].forEach(function (p) { var b = box(11, 5.4, 9, mat(p[1], { roughness: 0.95 }), p[0], 2.7, -1.5); sc.add(b); for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { var on = Math.random() < 0.55; sc.add(box(0.9, 0.8, 0.05, on ? glow(rnd([0xffd27a, 0xffe9b0, 0x9fd3ff])) : mat(0x161a22), p[0] - 4 + c * 2.6, 1.5 + r * 1.4, 3.05)); } });
    // Spieler
    var pl = makeActor({ fem: false, skin: 0xe8b894, hairC: 0x3a2415, hair: "short", shirt: 0xf7931a, pants: 0x23324d, scale: 1, glasses: false, beard: false, phones: false, suit: false, dress: false, hatC: 0xf7931a, eyeC: 0x2b1b10, shoe: 0x1d1d22, fat: 1 });
    pl.g.position.set(1.2, 0.12, 1.4); sc.add(pl.g); S.player = pl;
    S.grp = new THREE.Group(); sc.add(S.grp);
    S.cam = cam; S.rd = rd; S.stage = stage; S.ray = new THREE.Raycaster(); S.v = new THREE.Vector3(); S.ready = true;
    Object.keys(S.stations).forEach(function (id) {
      var st = S.stations[id], el = document.createElement("div"); el.className = "nx-lbl"; el.textContent = st.label; el.addEventListener("click", function (e) { e.stopPropagation(); useStation(id); }); stage.appendChild(el); st.el = el;
    });
    bindControls(rd.domElement);
  }

  /* ---------- Bedienung ---------- */
  function resize() {
    if (!S.ready) return; var w = S.stage.clientWidth || 360, h = S.stage.clientHeight || 600; S.rd.setSize(w, h, true); S.cam.aspect = w / h; S.cam.updateProjectionMatrix();
  }
  function bindControls(el) {
    var sx = 0, sy = 0, moved = 0, down = false;
    el.addEventListener("pointerdown", function (e) { down = true; moved = 0; sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointermove", function (e) { if (down) moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy)); });
    el.addEventListener("pointerup", function (e) { if (down && moved < 10) tap(e.clientX, e.clientY); down = false; });
    el.addEventListener("pointercancel", function () { down = false; });
  }
  function tap(cx, cy) {
    if (S.dlg || S.invOpen) return;
    var r = S.rd.domElement.getBoundingClientRect(); S.ray.setFromCamera({ x: ((cx - r.left) / r.width) * 2 - 1, y: -((cy - r.top) / r.height) * 2 + 1 }, S.cam);
    var ray = S.ray, hs = S.hits.slice(); if (S.cust && S.cust.hit) hs.push(S.cust.hit);
    var h = ray.intersectObjects(hs, false);
    if (h && h.length) { var o = h[0].object; if (o.userData.st) { useStation(o.userData.st); return; } if (S.cust && o === S.cust.hit) { useStation("counter"); return; } }
    var rd = ray.ray, t = (0.12 - rd.origin.y) / rd.direction.y; if (!(t > 0)) return;
    var x = rd.origin.x + rd.direction.x * t, z = rd.origin.z + rd.direction.z * t; S.pending = null; goTo(S.player, x, z);
  }
  function useStation(id) {
    var st = S.stations[id]; if (!st || !S.player) return; S.pending = id;
    goTo(S.player, st.sx, st.sz, function () { if (S.pending === id) { S.pending = null; try { st.action(); } catch (e) { console.warn("[nx] station", id, e); } } });
  }

  /* ---------- Aktionen: vorhandene Menues oeffnen ---------- */
  function clickId(id) { var e = document.getElementById(id); if (e) { e.click(); return true; } return false; }
  function openMenu(kind) {
    try {
      if (kind === "shop") { if (W.PartShop && PartShop.open) PartShop.open(); else clickId("ps-open-btn"); }
      else if (kind === "build") { if (W.PartShop && PartShop.openPicker) PartShop.openPicker(); else clickId("open-build-btn"); }
      else if (kind === "farm") { if (W.Parts3D && Parts3D.farm) Parts3D.farm.open(); else toast(T("Farm nicht geladen", "Farm not loaded")); }
    } catch (e) { console.warn("[nx] openMenu", kind, e); toast(T("Menü konnte nicht geöffnet werden", "Could not open menu")); }
  }
  function counterAction() {
    var c = S.cust; if (c && c.state === "wait") { talk(c); return; }
    var O = ORD(); toast(T("Gerade kein Kunde an der Theke. Aufträge:", "No customer at the counter. Orders:")); if (O) O.open();
  }
  function toast(m) {
    var d = document.createElement("div"); d.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:100002;background:#12161c;border:1px solid #f7931a;color:#e7e9ec;border-radius:12px;padding:10px 14px;font:700 13px monospace;text-align:center";
    d.textContent = m; document.body.appendChild(d); setTimeout(function () { try { d.remove(); } catch (e) {} }, 3000);
  }

  /* ---------- Regal / Inventar ---------- */
  var CATC = { cpu: 0xc7c9d1, gpu: 0x2a8f4a, ram: 0x3a8bff, ssd: 0x8e5bd9, psu: 0xf0b429, mobo: 0xb03a2e, cooler: 0x16a5b8, "case": 0x7a8394 };
  function invList() {
    var inv = (W.state && W.state.partInv) || {}, out = [];
    Object.keys(inv).forEach(function (id) { if (inv[id] > 0) out.push({ id: id, n: inv[id] }); }); return out;
  }
  function partName(id) {
    try { var c = W.PART_CATALOG; if (c) for (var k in c) for (var i = 0; i < c[k].items.length; i++) if (c[k].items[i].id === id) return (c[k].icon || "") + " " + c[k].items[i].brand + " " + c[k].items[i].model; } catch (e) {}
    return id;
  }
  function rebuildShelf() {
    var list = invList(), sig = JSON.stringify(list); if (sig === S.sig) return; S.sig = sig;
    var g = S.invGroup; while (g.children.length) g.remove(g.children[0]);
    var idx = 0; list.forEach(function (it) { var cat = String(it.id).split("-")[0], col = CATC[cat] || 0x777777, cnt = Math.min(3, it.n); for (var k = 0; k < cnt && idx < 33; k++, idx++) {
      var lv = Math.floor(idx / 11), sl = idx % 11, x = 1.4 - 1.5 + sl * 0.3, y = 0.5 + lv * 0.85 + 0.1;
      g.add(box(0.24, 0.2, 0.3, mat(0xb8905c, { roughness: 0.9 }), x, y + 0.1, -6.28)); g.add(box(0.245, 0.05, 0.31, mat(col), x, y + 0.2, -6.28)); } });
  }
  function openShelf() {
    var el = document.getElementById("nx-inv"), list = invList(), h = "<h4>📦 " + T("Dein Lager", "Your stock") + "</h4>";
    if (!list.length) h += "<p>" + T("Das Regal ist leer. Bestelle Teile am Computer.", "The shelf is empty. Order parts at the computer.") + "</p>";
    list.forEach(function (it) { h += '<div class="nx-row"><span>' + partName(it.id) + "</span><b>×" + it.n + "</b></div>"; });
    h += '<div class="nx-bt"><button class="pri" data-a="bench">🔧 ' + T("Zum Bautisch", "To workbench") + '</button><button data-a="close">' + T("Schließen", "Close") + "</button></div>";
    el.innerHTML = h; el.classList.add("show"); S.invOpen = true;
  }
  function closeInv() { var el = document.getElementById("nx-inv"); if (el) el.classList.remove("show"); S.invOpen = false; }

  /* ---------- Kunden ---------- */
  var TAG = { o1: ["Schüler", "Student"], o2: ["Student", "Student"], o3: ["Podcaster", "Podcaster"], o4: ["Rentner", "Retiree"], o5: ["Gamer", "Gamer"], o6: ["Streamerin", "Streamer"], o7: ["Krypto-Nerd", "Crypto nerd"], o8: ["Firmenchef", "CEO"] };
  var NAMES = ["Lena", "Tim", "Maya", "Jonas", "Aylin", "Ben", "Sofia", "Mehmet", "Nora", "Luca", "Emma", "Karim", "Yuki", "Olga", "Finn", "Ida", "Paul", "Zoe", "Ravi", "Greta"];
  var LOOK = { o1: { scale: 0.9, hair: "short" }, o4: { hairC: 0xe8e8ec, hair: "bald", beardP: 0.5, glasses: true }, o5: { phones: true, hair: "spiky" }, o6: { fem: true, hairC: 0xff5fa2, phones: true, hair: "long" }, o7: { hair: "beanie", glasses: true }, o8: { suit: true, glasses: true, hair: "short", scale: 1.05 } };
  var OPEN = { de: ["Hallo! Ich suche einen neuen Rechner.", "Hey, kannst du mir einen PC bauen?", "Guten Tag! Ich hätte da einen Wunsch …"], en: ["Hi! I'm looking for a new computer.", "Hey, can you build me a PC?", "Good day! I have a request …"] };
  function reqText(q) {
    switch (q.k) {
      case "cost": return q.max ? T("Teilekosten höchstens ", "Parts cost at most ") + fmt(q.max) + " sats" : T("Teile für mindestens ", "Parts worth at least ") + fmt(q.min) + " sats";
      case "load": return T("Höchstens ", "At most ") + q.max + " W";
      case "cpuT": return "CPU ≤ " + q.max + " °C"; case "gpuT": return "GPU ≤ " + q.max + " °C"; case "score": return "Score ≥ " + q.min;
      case "stable": return T("Muss stabil laufen", "Must run stable");
    } return q.k;
  }
  function specs() { try { return JSON.parse(localStorage.getItem("hashpool-next-faces") || "{}") || {}; } catch (e) { return {}; } }
  function saveSpec(id, sp, name) { try { var s = specs(); s[id] = { spec: sp, name: name }; localStorage.setItem("hashpool-next-faces", JSON.stringify(s)); } catch (e) {} }
  function spawnCustomer() {
    var O = ORD(), D = SHOPDBG(); if (!O || !D) return; var st = O.state(), kind = "browse", order = null, sp = null, name = rnd(NAMES);
    if (st.active) {
      var ao = null; O.list().forEach(function (o) { if (o.id === st.active) ao = o; }); var rigs = []; try { rigs = Parts3D.farm.slots() || []; } catch (e) {}
      if (ao && rigs.some(function (r) { try { return O.eval(ao, r.partIds).ok; } catch (e) { return false; } })) { kind = "pickup"; order = ao; var sv = specs()[ao.id]; if (sv) { sp = sv.spec; name = sv.name; } }
    }
    if (kind === "browse" && !st.active) { var fo = []; O.list().forEach(function (o) { if (!st.done[o.id]) fo.push(o); }); if (fo.length) { order = rnd(fo); kind = "order"; } }
    if (!sp) { sp = D.randomSpec(order ? LOOK[order.id] : null); if (order && kind === "order") saveSpec(order.id, sp, name); }
    var a = makeActor(sp), side = Math.random() < 0.5 ? -1 : 1; a.g.position.set(side * 9, 0.14, 4.9); a.speed = rr(1.5, 1.9);
    var hb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(0, 1.1, 0); a.g.add(hb); a.hit = hb;
    a.kind = kind; a.order = order; a.name = name; a.side = side; a.state = "in"; a.wait = 0; S.grp.add(a.g); S.cust = a;
    a.path = [[0, 4.9], [0, 3.0], [0.6, 1.9]].concat(kind === "browse" ? [[rr(-3, 3), rr(0.2, 2.6)], [rr(-3, 3), rr(0.2, 2.6)], [0, 3.0]] : []); a.pi = 0;
    a.done = function (x) { if (x.kind === "browse") leave(x); else { x.state = "wait"; x.wait = 0; } };
  }
  function leave(c) {
    if (S.dlg === c) closeDlg(); c.state = "out"; c.path = [[0, 3.0], [0, 4.9], [c.side * 9, 4.9]]; c.pi = 0;
    c.done = function (x) { try { S.grp.remove(x.g); } catch (e) {} if (S.cust === x) { S.cust = null; S.nextCust = rr(8, 16); } };
  }
  function talk(c) {
    var O = ORD(), dlg = document.getElementById("nx-dlg"); if (!O || !dlg || c.state !== "wait") return;
    var tg = (TAG[c.order && c.order.id] || ["Kunde", "Customer"])[de() ? 0 : 1], h = "<h4>" + c.name + " <i>· " + tg + "</i></h4>";
    if (c.kind === "pickup") h += "<p>" + T("Ist mein PC fertig? Ich habe gesehen, dass da was in deiner Farm steht!", "Is my PC ready? I saw something in your farm!") + '</p><div class="nx-bt"><button class="pri" data-a="deliver">' + T("Zeigen & abgeben", "Show & hand over") + '</button><button data-a="later">' + T("Später", "Later") + "</button></div>";
    else {
      var t = de() ? c.order.de : c.order.en, rw = Math.round(c.order.mult * Math.min(2, 1 + 0.25 * (O.state().cycle || 0)) * 100);
      h += "<p>" + rnd(OPEN[de() ? "de" : "en"]) + " <b>" + t[0] + ".</b> " + t[1] + "</p><ul>" + c.order.req.map(function (q) { return "<li>" + reqText(q) + "</li>"; }).join("") + "</ul>";
      h += '<div class="nx-rw">' + T("Belohnung: ", "Reward: ") + rw + "% " + T("der Teilekosten (zusätzlich zum Verkauf)", "of parts cost (on top of the sale)") + '</div><div class="nx-bt"><button class="pri" data-a="accept">' + T("Annehmen", "Accept") + '</button><button data-a="decline">' + T("Ablehnen", "Decline") + "</button></div>";
    }
    dlg.innerHTML = h; dlg.classList.add("show"); S.dlg = c;
  }
  function closeDlg() { var d = document.getElementById("nx-dlg"); if (d) d.classList.remove("show"); S.dlg = null; }
  function dlgAction(a) {
    var c = S.dlg, O = ORD(); if (!c) return;
    if (a === "accept") { O.open(); var b = document.querySelector('#ord-ov [data-accept="' + c.order.id + '"]'); if (b) b.click(); O.close(); toast(T("Auftrag angenommen: ", "Order accepted: ") + (de() ? c.order.de[0] : c.order.en[0])); leave(c); }
    else if (a === "decline" || a === "later") leave(c);
    else if (a === "deliver") { closeDlg(); O.open(); S.pendLeave = c; }
  }

  /* ---------- Schleife ---------- */
  function visible(id, cls) { var e = document.getElementById(id); if (!e) return false; if (cls) return e.classList.contains(cls); var cs = W.getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden"; }
  function overlayOpen() { return visible("ps-overlay") || visible("ps-picker") || visible("build-overlay") || visible("welcome-modal") || visible("bm-stage") || visible("farm-overlay", "open") || visible("ord-ov", "show") || visible("s3-ov", "show"); }
  function project(x, y, z) { S.v.set(x, y, z); S.v.project(S.cam); var w = S.stage.clientWidth, h = S.stage.clientHeight; return [(S.v.x * 0.5 + 0.5) * w, (-S.v.y * 0.5 + 0.5) * h, S.v.z]; }
  var cbub = null;
  function frame(ts) {
    if (!S.shown) { S.raf = 0; return; }
    S.raf = W.requestAnimationFrame(frame);
    var hide = overlayOpen(); if (hide !== S.hiddenByOverlay) { S.hiddenByOverlay = hide; root.style.visibility = hide ? "hidden" : "visible"; }
    if (hide) { S.last = ts || 0; return; }
    var dt = Math.min(0.05, ((ts || 0) - S.last) / 1000 || 0.016); S.last = ts || 0; S.t += dt;
    try {
      stepActor(S.player, dt);
      var c = S.cust;
      if (!c) { S.nextCust -= dt; if (S.nextCust <= 0) { S.nextCust = 6; spawnCustomer(); } }
      else {
        stepActor(c, dt);
        if (c.state === "wait") { c.wait += dt; c.g.rotation.y += (0.35 - c.g.rotation.y) * Math.min(1, dt * 5); if (c.wait > 90 && !S.dlg) leave(c); }
        if (S.pendLeave === c && !visible("ord-ov", "show")) { S.pendLeave = null; leave(c); }
      }
      var p = S.player.g.position, z = S.zoom, ty = p.y + 1, tx = Math.max(-3, Math.min(3, p.x)) * 0.8, k = Math.min(1, dt * 3.5);
      S.cam.position.x += (tx - S.cam.position.x) * k; S.cam.position.y += (ty + 8.2 * z - S.cam.position.y) * k; S.cam.position.z += (p.z + 9.6 * z - S.cam.position.z) * k;
      S.cam.lookAt(S.cam.position.x * 0.4 + tx * 0.6, ty, p.z - 0.6);
      S.cam.updateMatrixWorld(); Object.keys(S.stations).forEach(function (id) { var st = S.stations[id], q = project(st.lx, st.ly, st.lz); st.el.style.display = q[2] < 1 ? "block" : "none"; st.el.style.left = q[0] + "px"; st.el.style.top = q[1] + "px"; });
      if (cbub) { if (c && c.state === "wait" && !S.dlg) { var q2 = project(c.g.position.x, 2.5, c.g.position.z); cbub.style.display = "block"; cbub.style.left = q2[0] + "px"; cbub.style.top = q2[1] + "px"; cbub.textContent = c.kind === "pickup" ? "📦 ?" : "💬"; } else cbub.style.display = "none"; }
      S.invT = (S.invT || 0) + dt; if (S.invT > 1) { S.invT = 0; rebuildShelf(); updHud(); }
      S.rd.render(S.scene, S.cam);
    } catch (e) { console.warn("[nx] frame", e); }
  }
  function updHud() { var b = document.getElementById("nx-bal"); if (!b) return; var v = 0; try { v = W.state.balance || 0; } catch (e) {} b.textContent = "💰 " + (typeof W.fmtSats === "function" ? W.fmtSats(v) : fmt(v)) + " sats"; }

  /* ---------- Aufbau / Start ---------- */
  function ensureDom() {
    if (root) return; css();
    root = document.createElement("div"); root.id = "nx-world";
    root.innerHTML = '<div class="nx-hud"><b id="nx-bal">💰</b><button id="nx-ord" type="button">📋 ' + T("Aufträge", "Orders") + '</button><button id="nx-cls" type="button">🖱️ ' + T("Klassik", "Classic") + '</button></div>' +
      '<div class="nx-lbl cust" id="nx-bub" style="display:none">💬</div><div class="nx-hint">' + T("Tippe auf den Boden zum Laufen oder auf eine Station.", "Tap the floor to walk or tap a station.") + '</div>' +
      '<div class="nx-zoom"><button id="nx-zi" type="button">＋</button><button id="nx-zo" type="button">－</button></div><div id="nx-dlg"></div><div id="nx-inv"></div>';
    document.body.appendChild(root); cbub = document.getElementById("nx-bub");
    var back = document.createElement("button"); back.id = "nx-back"; back.type = "button"; back.textContent = "🏪 " + T("Zum Laden", "To shop"); document.body.appendChild(back); back.addEventListener("click", function () { show(true); });
    document.getElementById("nx-cls").addEventListener("click", function () { show(false); });
    document.getElementById("nx-ord").addEventListener("click", function () { var O = ORD(); if (O) O.open(); });
    document.getElementById("nx-zi").addEventListener("click", function () { S.zoom = Math.max(0.55, S.zoom - 0.15); });
    document.getElementById("nx-zo").addEventListener("click", function () { S.zoom = Math.min(1.8, S.zoom + 0.15); });
    cbub.addEventListener("click", function () { if (S.cust) useStation("counter"); });
    document.getElementById("nx-dlg").addEventListener("click", function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute("data-a"); if (a) dlgAction(a); });
    document.getElementById("nx-inv").addEventListener("click", function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute("data-a"); if (a === "close") closeInv(); else if (a === "bench") { closeInv(); useStation("bench"); } });
    W.addEventListener("resize", function () { if (S.shown) resize(); });
  }
  function show(on) {
    try {
      ensureDom(); try { localStorage.setItem(PREF, on ? "1" : "0"); } catch (e) {}
      var back = document.getElementById("nx-back");
      if (!on) { S.shown = false; root.classList.remove("show"); back.style.display = "block"; return; }
      back.style.display = "none"; root.classList.add("show"); S.shown = true;
      if (!S.ready) { build3d(root); S.cam.position.set(0, 9, 11); }
      resize(); setTimeout(resize, 80); S.last = 0; if (!S.raf) S.raf = W.requestAnimationFrame(frame); updHud(); rebuildShelf();
    } catch (e) { console.warn("[nx] show", e); }
  }
  W.Parts3D = W.Parts3D || {};
  W.Parts3D.nextWorld = { show: show, S: S };
  var n = 0, iv = setInterval(function () {
    n++;
    if (typeof THREE !== "undefined" && ORD() && W.state && document.body) {
      clearInterval(iv);
      var pref = null; try { pref = localStorage.getItem(PREF); } catch (e) {}
      ensureDom(); if (pref === "0") { document.getElementById("nx-back").style.display = "block"; } else show(true);
    } else if (n > 240) clearInterval(iv);
  }, 500);
  console.log("[HASHPOOL NEXT] world bereit");
})();

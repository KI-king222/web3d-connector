/* shopScene.js — 3D-Laden: Strasse, Geschaeft, Kunden die hereinkommen und PCs bestellen (nutzt Parts3D.orders)
 * Button "🏪 Laden". Jeder Kunde hat ein eigenes Aussehen (Haut, Haare, Kleidung, Gesicht, Zubehoer).
 * Annehmen = Auftrag aus orders.js wird aktiv. Wenn ein passender Rig in der Farm steht, kommt der Kunde zum Abholen.
 * Kill-Switch: ?noshop=1. Nur three.js r128 APIs.
 */
(function () {
  var W = window;
  if (W.__shop3d) return; W.__shop3d = true;
  if (/[?&]noshop(=|&|$)/.test(String(W.location && W.location.search))) return;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function ORD() { return W.Parts3D && Parts3D.orders; }

  /* ---------- kleine three-Helfer ---------- */
  function mat(c, o) { var p = { color: c, roughness: 0.8, metalness: 0.1 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function sph(r, m, x, y, z, sx, sy, sz) { var o = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m); o.position.set(x || 0, y || 0, z || 0); if (sx) o.scale.set(sx, sy || sx, sz || sx); return o; }
  function textTex(txt, w, h, bg, fg, font) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d");
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 2);
    var t = new THREE.CanvasTexture(c); return t;
  }

  /* ---------- Figuren ---------- */
  var SKINS = [0xf6d3b5, 0xe8b894, 0xd29a74, 0xb27a54, 0x8a5a3a, 0x5e3b27];
  var HAIRC = [0x16161a, 0x3a2415, 0x6b4423, 0xb5651d, 0xdcb86e, 0xb03a2e, 0x9a9aa2, 0x3f51c4, 0xff5fa2, 0x2ecc71, 0xe8e8ec];
  var SHIRT = [0xd9534f, 0x3b82f6, 0x22a06b, 0xf0b429, 0x8e5bd9, 0xe9edf2, 0x2b2f38, 0xff7a3d, 0x16a5b8, 0xc2185b];
  var PANTS = [0x23324d, 0x2b2f38, 0x4a3a2a, 0x3d4a3a, 0x5b6575, 0x1d1d22];
  var STYLES = ["short", "long", "bun", "mohawk", "curly", "spiky", "bald", "ponytail", "cap", "beanie"];
  function randomSpec(look) {
    look = look || {};
    var fem = look.fem != null ? look.fem : Math.random() < 0.5;
    var st = look.hair || rnd(STYLES);
    var s = {
      fem: fem, skin: rnd(SKINS), hairC: look.hairC != null ? look.hairC : rnd(HAIRC), hair: st, shirt: look.shirt != null ? look.shirt : rnd(SHIRT), pants: rnd(PANTS),
      scale: look.scale || rr(0.93, 1.07), glasses: look.glasses != null ? look.glasses : Math.random() < 0.25, beard: !fem && Math.random() < (look.beardP != null ? look.beardP : 0.22),
      phones: !!look.phones, suit: !!look.suit, dress: fem && Math.random() < 0.4, hatC: rnd(SHIRT), eyeC: rnd([0x2b1b10, 0x1d4a7a, 0x2f6b3a, 0x4a3320]), shoe: rnd([0x1d1d22, 0xe9edf2, 0xb03a2e, 0x3b82f6]), fat: rr(0.92, 1.12)
    };
    if (s.suit) { s.shirt = rnd([0x22262e, 0x2c3e5c, 0x3a3a40]); s.pants = s.shirt; }
    if (st === "cap" || st === "beanie") s.hairC = rnd(HAIRC.slice(0, 5));
    return s;
  }
  function makeChar(sp) {
    var g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    var skin = mat(sp.skin, { roughness: 0.7 }), shirt = mat(sp.shirt), pants = mat(sp.pants), hair = mat(sp.hairC, { roughness: 0.9 });
    var legL = new THREE.Group(), legR = new THREE.Group(), armL = new THREE.Group(), armR = new THREE.Group();
    [[legL, -0.1], [legR, 0.1]].forEach(function (p) {
      p[0].position.set(p[1], 0.8, 0); p[0].add(cyl(0.085, 0.075, 0.74, pants, 0, -0.37, 0, 10)); p[0].add(box(0.13, 0.08, 0.22, mat(sp.shoe), 0, -0.76, 0.04)); body.add(p[0]);
    });
    if (sp.dress) { body.add(cyl(0.2, 0.34, 0.5, shirt, 0, 0.72, 0, 14)); }
    var tw = (sp.fem ? 0.2 : 0.24) * sp.fat;
    body.add(cyl(tw, tw * 0.85, 0.7, shirt, 0, 1.15, 0, 14));
    if (sp.suit) { body.add(box(0.1, 0.5, 0.02, mat(0xf2f2f2), 0, 1.2, tw * 0.9)); body.add(box(0.05, 0.42, 0.025, mat(0xb03a2e), 0, 1.18, tw * 0.92)); }
    body.add(cyl(0.065, 0.07, 0.1, skin, 0, 1.54, 0, 8));
    [[armL, -1], [armR, 1]].forEach(function (p) {
      var sleeve = sp.suit || Math.random() < 0.5 ? shirt : skin;
      p[0].position.set(p[1] * (tw + 0.07), 1.43, 0); p[0].add(cyl(0.055, 0.05, 0.6, sleeve, 0, -0.3, 0, 8)); p[0].add(sph(0.06, skin, 0, -0.64, 0)); body.add(p[0]);
    });
    var head = new THREE.Group(); head.position.set(0, 1.74, 0); body.add(head);
    head.add(sph(0.2, skin, 0, 0, 0, 1, 1.08, 1));
    [-1, 1].forEach(function (s) {
      head.add(sph(0.036, glow(0xffffff), s * 0.075, 0.03, 0.175, 1, 1, 0.5)); head.add(sph(0.021, glow(sp.eyeC), s * 0.075, 0.03, 0.195, 1, 1, 0.5));
      head.add(box(0.06, 0.012, 0.01, hair, s * 0.075, 0.09, 0.19));
      head.add(sph(0.032, skin, s * 0.2, 0, 0, 0.5, 1, 1));
    });
    head.add(sph(0.026, mat(sp.skin, { roughness: 0.6 }), 0, -0.02, 0.2, 1, 1.1, 0.9));
    var sm = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 6, 12, Math.PI), glow(0x8a3b35)); sm.position.set(0, -0.045, 0.19); sm.rotation.z = Math.PI; head.add(sm);
    var st = sp.hair;
    function capHair(col, r) {
      var c = new THREE.Mesh(new THREE.SphereGeometry(r || 0.218, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.46), col || hair); c.rotation.x = -0.35; c.position.set(0, 0.02, -0.005); head.add(c); return c;
    }
    if (st === "short" || st === "long" || st === "bun" || st === "ponytail" || st === "curly") capHair();
    if (st === "long") { head.add(box(0.4, 0.5, 0.1, hair, 0, -0.1, -0.15)); head.add(box(0.05, 0.4, 0.2, hair, -0.2, -0.05, -0.04)); head.add(box(0.05, 0.4, 0.2, hair, 0.2, -0.05, -0.04)); }
    if (st === "bun") head.add(sph(0.09, hair, 0, 0.24, -0.08));
    if (st === "ponytail") { head.add(sph(0.06, hair, 0, 0.1, -0.22)); head.add(cyl(0.04, 0.02, 0.4, hair, 0, -0.1, -0.24, 8)); }
    if (st === "curly") for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; head.add(sph(0.07, hair, Math.cos(a) * 0.17, 0.12 + (i % 2) * 0.05, Math.sin(a) * 0.17 - 0.02)); }
    if (st === "mohawk") for (var j = 0; j < 6; j++) head.add(box(0.045, 0.09 + (j % 3) * 0.02, 0.07, hair, 0, 0.2, 0.14 - j * 0.055));
    if (st === "spiky") for (var k = 0; k < 8; k++) { var an = k / 8 * Math.PI * 2, c = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 6), hair); c.position.set(Math.cos(an) * 0.11, 0.21, Math.sin(an) * 0.11 - 0.02); c.rotation.z = -Math.cos(an) * 0.4; c.rotation.x = Math.sin(an) * 0.4; head.add(c); }
    if (st === "cap") { var hm = mat(sp.hatC); var cp = capHair(hm, 0.225); cp.position.y = 0.04; head.add(box(0.26, 0.015, 0.16, hm, 0, 0.07, 0.24)); }
    if (st === "beanie") { var bm = mat(sp.hatC); var bn = capHair(bm, 0.23); bn.position.y = 0.06; head.add(cyl(0.225, 0.225, 0.05, bm, 0, 0.1, 0, 16)); head.add(sph(0.04, bm, 0, 0.27, -0.02)); }
    if (sp.beard) head.add(sph(0.15, hair, 0, -0.1, 0.07, 1, 0.55, 0.9));
    if (sp.glasses) { var gm = mat(0x16161a, { metalness: 0.5 }); [-1, 1].forEach(function (s) { var t = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.007, 6, 14), gm); t.position.set(s * 0.075, 0.03, 0.2); head.add(t); }); head.add(box(0.05, 0.008, 0.008, gm, 0, 0.04, 0.205)); }
    if (sp.phones) { var pm = mat(0x24262c, { metalness: 0.4 }), tr = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 6, 20, Math.PI), pm); tr.position.set(0, 0.03, 0); head.add(tr); [-1, 1].forEach(function (s) { head.add(cyl(0.06, 0.06, 0.05, pm, s * 0.21, 0.02, 0, 12).rotateZ(Math.PI / 2)); head.add(sph(0.012, glow(0x78d505), s * 0.24, 0.02, 0)); }); }
    g.scale.setScalar(sp.scale);
    return { g: g, body: body, legL: legL, legR: legR, armL: armL, armR: armR, head: head };
  }

  /* ---------- Kundentypen (passend zu den 8 Auftraegen) ---------- */
  var NAMES = ["Lena", "Tim", "Maya", "Jonas", "Aylin", "Ben", "Sofia", "Mehmet", "Nora", "Luca", "Emma", "Karim", "Yuki", "Olga", "Finn", "Ida", "Paul", "Zoe", "Ravi", "Greta", "Noah", "Mila"];
  var KIND = {
    o1: { tag: ["Schüler", "Student"], look: { scale: 0.9, hair: "short" } },
    o2: { tag: ["Student mit knappem Budget", "Student on a budget"], look: { glasses: true } },
    o3: { tag: ["Podcaster", "Podcaster"], look: { phones: true } },
    o4: { tag: ["Rentner", "Retiree"], look: { hairC: 0xe8e8ec, hair: "bald", beardP: 0.5, glasses: true, scale: 0.97 } },
    o5: { tag: ["Gamer", "Gamer"], look: { phones: true, hair: "spiky" } },
    o6: { tag: ["Streamerin", "Streamer"], look: { fem: true, hairC: 0xff5fa2, phones: true, hair: "long" } },
    o7: { tag: ["Krypto-Nerd", "Crypto nerd"], look: { hair: "beanie", glasses: true } },
    o8: { tag: ["Firmenchef", "CEO"], look: { suit: true, glasses: true, hair: "short", scale: 1.05 } }
  };
  var OPEN = {
    de: ["Hallo! Ich suche einen neuen Rechner.", "Hey, kannst du mir einen PC bauen?", "Guten Tag! Ich hätte da einen Wunsch …", "Na, bist du der PC-Bauer hier? Ich brauche was."],
    en: ["Hi! I'm looking for a new computer.", "Hey, can you build me a PC?", "Good day! I have a request …", "So you're the PC builder? I need something."]
  };
  function reqText(q) {
    switch (q.k) {
      case "cost": return q.max ? T("Teilekosten höchstens ", "Parts cost at most ") + fmt(q.max) + " sats" : T("Teile für mindestens ", "Parts worth at least ") + fmt(q.min) + " sats";
      case "load": return T("Höchstens ", "At most ") + q.max + " W " + T("Last", "load");
      case "cpuT": return "CPU ≤ " + q.max + " °C";
      case "gpuT": return "GPU ≤ " + q.max + " °C";
      case "score": return "Score ≥ " + q.min;
      case "stable": return T("Muss stabil laufen (keine Drosselung)", "Must run stable (no throttling)");
    }
    return q.k;
  }

  /* ---------- Speicher fuer Gesichter (gleicher Kunde holt ab) ---------- */
  var SKEY = "hashpool-shop-v1";
  function loadSpecs() { try { return JSON.parse(localStorage.getItem(SKEY) || "{}") || {}; } catch (e) { return {}; } }
  function saveSpec(id, spec, name) { try { var s = loadSpecs(); s[id] = { spec: spec, name: name }; localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }

  /* ---------- Szene ---------- */
  var S = { ready: false, open: false, cust: null, pass: [], cars: [], t: 0, nextSpawn: 2.5, nextPass: 1, nextCar: 6, az: 0, el: 0.32, dist: 16, dlg: null, keeper: null, last: 0 };
  var btn = null, ov = null;
  function css() {
    if (document.getElementById("s3-style")) return;
    var s = document.createElement("style"); s.id = "s3-style";
    s.textContent =
      "#s3-ov{position:fixed;inset:0;z-index:99990;background:#0a0d11;display:none;flex-direction:column}#s3-ov.show{display:flex}" +
      ".s3-hd{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:#12161c;border-bottom:1px solid #2c3646;color:#e7e9ec;font-size:14px}.s3-hd b{flex:1}" +
      ".s3-hd button{font:700 12px inherit;padding:8px 10px;border-radius:9px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec;cursor:pointer}.s3-hd button.x{font-size:18px;padding:4px 12px}" +
      "#s3-stage{position:relative;flex:1;overflow:hidden;touch-action:none}#s3-stage canvas{display:block;width:100%;height:100%;touch-action:none}" +
      ".s3-bub{position:absolute;transform:translate(-50%,-100%);background:#fff;color:#111;border-radius:14px;padding:6px 10px;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.5);cursor:pointer;display:none;z-index:2}.s3-bub:after{content:'';position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top-color:#fff}" +
      ".s3-hint{position:absolute;left:10px;right:10px;top:8px;color:#aeb6c2;font-size:12px;text-align:center;pointer-events:none;text-shadow:0 1px 3px #000}" +
      "#s3-dlg{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font-size:13px;display:none;z-index:5;box-shadow:0 8px 30px rgba(0,0,0,.6);max-height:62%;overflow:auto}#s3-dlg.show{display:block}" +
      "#s3-dlg h4{margin:0 0 2px;font-size:15px}#s3-dlg h4 i{font-weight:400;color:#aeb6c2;font-size:12px}#s3-dlg p{margin:6px 0}#s3-dlg ul{margin:6px 0 6px 18px;padding:0}#s3-dlg .rw{color:#f7931a;font-weight:700}" +
      "#s3-dlg .bt{display:flex;gap:8px;margin-top:10px}#s3-dlg .bt button{flex:1;font:700 13px inherit;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec;cursor:pointer}#s3-dlg .bt button.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}";
    document.head.appendChild(s);
  }

  function build3d(stage) {
    var sc = new THREE.Scene(); sc.background = new THREE.Color(0x0e1424); sc.fog = new THREE.Fog(0x0e1424, 24, 60);
    var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    var rd = new THREE.WebGLRenderer({ antialias: true }); rd.setPixelRatio(Math.min(W.devicePixelRatio || 1, 2));
    stage.appendChild(rd.domElement);
    sc.add(new THREE.HemisphereLight(0x8fa6d0, 0x1a1a22, 0.7)); sc.add(new THREE.AmbientLight(0x404a60, 0.45));
    var li = new THREE.PointLight(0xfff0d6, 1.1, 9); li.position.set(0, 3.0, -0.6); sc.add(li);
    var l1 = new THREE.PointLight(0xffc977, 0.9, 9); l1.position.set(-4.2, 3.4, 3.0); sc.add(l1);
    var l2 = new THREE.PointLight(0xffc977, 0.9, 9); l2.position.set(4.2, 3.4, 3.0); sc.add(l2);
    // Sterne + Mond
    var pg = new THREE.BufferGeometry(), pa = []; for (var i = 0; i < 160; i++) pa.push(rr(-40, 40), rr(10, 30), rr(-40, -14));
    pg.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3)); sc.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18 })));
    sc.add(sph(1.3, glow(0xf2efe0), -14, 16, -30));
    // Strasse + Buergersteig
    sc.add(box(80, 0.1, 6, mat(0x23262c, { roughness: 0.95 }), 0, -0.05, 8));
    for (var d = -18; d <= 18; d += 3.2) sc.add(box(1.6, 0.012, 0.14, glow(0xd8b73a), d, 0.01, 8));
    sc.add(box(80, 0.14, 3.2, mat(0x8a8d93, { roughness: 0.95 }), 0, 0.07, 3.1));
    sc.add(box(80, 0.18, 0.18, mat(0xb4b7bd), 0, 0.09, 4.8));
    for (var tx = -18; tx <= 18; tx += 1.4) sc.add(box(0.015, 0.145, 3.2, mat(0x777a80), tx, 0.071, 3.1));
    // Boden Laden
    sc.add(box(8.4, 0.12, 4.9, mat(0x6b5a4a, { roughness: 0.6 }), 0, 0.06, -0.85));
    sc.add(box(2.6, 0.125, 1.5, mat(0x3b4658, { roughness: 0.95 }), 0, 0.062, 0.8));
    // Waende
    var wm = mat(0x2a3446, { roughness: 0.9 });
    sc.add(box(8.4, 3.6, 0.18, wm, 0, 1.8, -3.3)); sc.add(box(0.18, 3.6, 4.9, wm, -4.2, 1.8, -0.85)); sc.add(box(0.18, 3.6, 4.9, wm, 4.2, 1.8, -0.85));
    sc.add(box(8.4, 0.9, 0.3, mat(0x1b2233), 0, 3.15, 1.6));                                  // Fassaden-Balken
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.7), new THREE.MeshBasicMaterial({ map: textTex("HASHPOOL PC-SHOP", 1024, 160, "#10151f", "#f7931a", "bold 96px sans-serif") })); sign.position.set(0, 3.15, 1.76); sc.add(sign);
    var glass = new THREE.MeshStandardMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0.2 });
    [[-2.45, 3.5], [2.45, 3.5]].forEach(function (p) { var gp = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.7), glass); gp.position.set(p[0], 1.45, 1.6); sc.add(gp); });
    var fm = mat(0x1b2233, { metalness: 0.5 });
    [-4.1, -0.75, 0.75, 4.1].forEach(function (x) { sc.add(box(0.1, 2.8, 0.1, fm, x, 1.45, 1.6)); }); sc.add(box(1.6, 0.1, 0.1, fm, 0, 2.8, 1.6));
    var neon = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.4), new THREE.MeshBasicMaterial({ map: textTex("OPEN", 256, 112, "#101820", "#4fe38a", "bold 72px sans-serif") })); neon.position.set(-2.4, 2.35, 1.55); sc.add(neon);
    var neon2 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.4), new THREE.MeshBasicMaterial({ map: textTex("RGB · GPU · SSD", 320, 112, "#101820", "#6aa8ff", "bold 40px sans-serif") })); neon2.position.set(2.4, 2.35, 1.55); sc.add(neon2);
    // Nachbarhaeuser + Skyline
    [[-10.2, 0x2b2530], [10.2, 0x25303a]].forEach(function (p, idx) {
      var b = box(11, 5.6, 5.6, mat(p[1], { roughness: 0.95 }), p[0] * 1.0 + (idx ? 0.6 : -0.6), 2.8, -0.6); sc.add(b);
      for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { var on = Math.random() < 0.55; sc.add(box(1.0, 0.9, 0.05, on ? glow(rnd([0xffd27a, 0xffe9b0, 0x9fd3ff])) : mat(0x161a22), b.position.x - 4.2 + c * 2.8, 1.6 + r * 1.5, 2.22)); }
    });
    for (var sk = -8; sk <= 8; sk++) { var hh = rr(6, 16); sc.add(box(2.6, hh, 2.6, mat(0x151b2b, { roughness: 1 }), sk * 3.4, hh / 2, -16)); for (var w = 0; w < 4; w++) if (Math.random() < 0.6) sc.add(box(0.3, 0.3, 0.05, glow(0xffd27a), sk * 3.4 + rr(-1, 1), rr(1.5, hh - 1), -14.68)); }
    // Laternen
    [-6.5, 6.5, -13, 13].forEach(function (x) { sc.add(cyl(0.05, 0.07, 3.6, mat(0x1b1e24), x, 1.8, 4.5, 8)); sc.add(box(0.7, 0.05, 0.05, mat(0x1b1e24), x + (x < 0 ? 0.3 : -0.3), 3.6, 4.5)); sc.add(sph(0.12, glow(0xffd98a), x + (x < 0 ? 0.6 : -0.6), 3.55, 4.5)); });
    // Theke, Kasse, PC
    var wood = mat(0x4a3526, { roughness: 0.6 });
    sc.add(box(3.0, 1.0, 0.7, wood, 0, 0.62, -1.7)); sc.add(box(3.1, 0.06, 0.8, mat(0x6e5740), 0, 1.15, -1.7));
    sc.add(box(0.5, 0.34, 0.03, mat(0x15181e), -0.8, 1.38, -1.78)); sc.add(box(0.46, 0.3, 0.01, glow(0x2a8cff), -0.8, 1.38, -1.76)); sc.add(box(0.08, 0.2, 0.08, mat(0x15181e), -0.8, 1.26, -1.78));
    sc.add(box(0.26, 0.46, 0.4, mat(0x1d2128, { metalness: 0.6 }), 0.9, 1.4, -1.7)); sc.add(box(0.015, 0.4, 0.3, glow(0x78d505), 0.775, 1.4, -1.7));
    sc.add(box(0.3, 0.03, 0.2, mat(0xe9edf2), 0.2, 1.2, -1.55));
    // Regale mit Gehaeusen
    var sm = mat(0x2d3646, { metalness: 0.4 });
    [-2.7, 2.7].forEach(function (x) {
      sc.add(box(1.8, 2.8, 0.08, mat(0x1a202c), x, 1.5, -3.15));
      for (var lv = 0; lv < 4; lv++) {
        sc.add(box(1.8, 0.05, 0.5, sm, x, 0.35 + lv * 0.72, -2.95));
        for (var n = 0; n < 3; n++) { var cc = rnd([0x202833, 0x2b2f38, 0x39414f, 0x1d1d22]); sc.add(box(0.46, 0.55, 0.4, mat(cc, { metalness: 0.5 }), x - 0.55 + n * 0.55, 0.65 + lv * 0.72, -2.95)); sc.add(box(0.015, 0.45, 0.3, glow(rnd([0x78d505, 0xff3a6e, 0x3a8bff, 0xffb020])), x - 0.55 + n * 0.55 + 0.232, 0.65 + lv * 0.72, -2.95)); }
      }
    });
    sc.add(box(2.2, 1.7, 0.05, mat(0x10151d), 0, 2.2, -3.18)); sc.add(box(2.1, 1.6, 0.01, new THREE.MeshBasicMaterial({ map: textTex("★ PC-BAU ★", 512, 380, "#0c1018", "#78d505", "bold 70px sans-serif") }), 0, 2.2, -3.15));
    // Ladenbesitzer (der Spieler)
    var kp = makeChar({ fem: false, skin: 0xe8b894, hairC: 0x3a2415, hair: "short", shirt: 0xf7931a, pants: 0x23324d, scale: 1, glasses: false, beard: false, phones: false, suit: false, dress: false, hatC: 0xf7931a, eyeC: 0x2b1b10, shoe: 0x1d1d22, fat: 1 });
    kp.g.position.set(1.2, 0.12, -2.45); kp.g.rotation.y = -0.15; sc.add(kp.g); S.keeper = kp;
    var grp = new THREE.Group(); sc.add(grp);
    S.scene = sc; S.cam = cam; S.rd = rd; S.stage = stage; S.grp = grp; S.hit = []; S.ray = new THREE.Raycaster(); S.v = new THREE.Vector3(); S.ready = true;
    bindControls(rd.domElement);
  }

  /* ---------- Kamera / Bedienung ---------- */
  function applyCam() {
    var a = S.az, e = S.el, d = S.dist, tx = 0, ty = 1.3, tz = 1.2;
    S.cam.position.set(tx + Math.sin(a) * Math.cos(e) * d, ty + Math.sin(e) * d, tz + Math.cos(a) * Math.cos(e) * d); S.cam.lookAt(tx, ty, tz);
  }
  function resize() {
    if (!S.ready) return; var st = S.stage, w = st.clientWidth || 360, h = st.clientHeight || 600;
    S.rd.setSize(w, h); S.cam.aspect = w / h; S.cam.updateProjectionMatrix();
    var t = Math.tan(S.cam.fov * Math.PI / 360), need = 4.6 / (t * Math.min(S.cam.aspect, 1.6)); S.baseDist = Math.max(11, Math.min(26, need)); if (!S.userZoom) S.dist = S.baseDist; applyCam();
  }
  function bindControls(el) {
    var pts = {}, last = 0, moved = 0, sx = 0, sy = 0;
    el.addEventListener("pointerdown", function (e) { try { el.setPointerCapture(e.pointerId); } catch (x) {} pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = 0; sx = e.clientX; sy = e.clientY; last = 0; });
    el.addEventListener("pointermove", function (e) {
      var p = pts[e.pointerId]; if (!p) return; var ids = Object.keys(pts);
      if (ids.length >= 2) {
        var o = pts[ids[0] === String(e.pointerId) ? ids[1] : ids[0]], d0 = Math.hypot(p.x - o.x, p.y - o.y); p.x = e.clientX; p.y = e.clientY; var d1 = Math.hypot(p.x - o.x, p.y - o.y);
        if (d0 > 0) { S.dist = Math.max(6, Math.min(30, S.dist * d0 / Math.max(1, d1))); S.userZoom = true; applyCam(); } moved = 99; return;
      }
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      S.az = Math.max(-0.9, Math.min(0.9, S.az - dx * 0.005)); S.el = Math.max(0.1, Math.min(0.9, S.el + dy * 0.004)); applyCam();
    });
    function up(e) {
      var wasTap = moved < 8 && pts[e.pointerId]; delete pts[e.pointerId];
      if (wasTap && e.type === "pointerup") tap(e.clientX, e.clientY);
    }
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", function (e) { e.preventDefault(); S.dist = Math.max(6, Math.min(30, S.dist * (e.deltaY > 0 ? 1.08 : 0.92))); S.userZoom = true; applyCam(); }, { passive: false });
  }
  function tap(cx, cy) {
    if (!S.ready || !S.cust || S.cust.state !== "wait") return;
    var r = S.rd.domElement.getBoundingClientRect(), nx = ((cx - r.left) / r.width) * 2 - 1, ny = -((cy - r.top) / r.height) * 2 + 1;
    S.ray.setFromCamera({ x: nx, y: ny }, S.cam); var h = S.ray.intersectObjects([S.cust.hit], false); if (h && h.length) talk(S.cust);
  }

  /* ---------- Kunden ---------- */
  function freeOrders() {
    var O = ORD(); if (!O) return []; var st = O.state(), res = [];
    O.list().forEach(function (o) { if (!st.done[o.id] && st.active !== o.id) res.push(o); }); return res;
  }
  function newCustomer(kind, order, savedSpec, savedName) {
    var look = (order && KIND[order.id] && KIND[order.id].look) || {};
    var spec = savedSpec || randomSpec(look), ch = makeChar(spec);
    var side = Math.random() < 0.5 ? -1 : 1, c = { ch: ch, g: ch.g, spec: spec, name: savedName || rnd(NAMES), order: order || null, kind: kind, state: "in", path: [], pi: 0, speed: rr(1.5, 1.9), ph: Math.random() * 6, wait: 0, side: side };
    c.g.position.set(side * 9, 0.14, 3.1); var hb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(0, 1.1, 0); c.g.add(hb); c.hit = hb;
    S.grp.add(c.g); return c;
  }
  function walkTo(c, pts, next) { c.path = pts; c.pi = 0; c.state = next || c.state; }
  function spawnCustomer() {
    var O = ORD(); if (!O) return;
    var st = O.state(), pick = null, c;
    if (st.active) {                                                         // Abholer, wenn ein Rig fertig in der Farm steht
      var ao = null; O.list().forEach(function (o) { if (o.id === st.active) ao = o; });
      var rigs = []; try { rigs = Parts3D.farm.slots() || []; } catch (e) {}
      var ok = ao && rigs.some(function (r) { try { return O.eval(ao, r.partIds).ok; } catch (e) { return false; } });
      if (ok) { var sv = loadSpecs()[ao.id]; c = newCustomer("pickup", ao, sv && sv.spec, sv && sv.name); }
    }
    if (!c) { var fo = freeOrders(); if (fo.length && !st.active) { pick = rnd(fo); c = newCustomer("order", pick); saveSpec(pick.id, c.spec, c.name); } else c = newCustomer("browse", null); }
    var shop = c.kind === "browse" ? [[0, 0.8], [rr(-3, 3), rr(-1.8, -0.2)], [rr(-3, 3), rr(-2, -0.4)], [0, 0.8]] : [[0, 0.8], [0, -0.45]];
    walkTo(c, [[0, 3.1], [0, 0.8]].concat(c.kind === "browse" ? shop.slice(1) : [[0, -0.45]]), "in"); c.arrive = c.kind === "browse" ? "leave" : "wait";
    S.cust = c;
  }
  function leave(c, mood) {
    if (S.dlg) closeDlg(); c.state = "out"; c.mood = mood;
    walkTo(c, [[0, 0.8], [0, 3.1], [c.side * 9, 3.1]], "out"); c.arrive = "gone";
  }
  function spawnPasser() {
    var c = newCustomer("pass", null); c.speed = rr(1.0, 1.6); var dir = c.side; c.g.position.set(-dir * 9, 0.14, rr(2.2, 4.2)); S.grp.remove(c.hit);
    walkTo(c, [[dir * 9, c.g.position.z]], "pass"); c.arrive = "gone"; S.pass.push(c);
  }
  function spawnCar() {
    var dir = Math.random() < 0.5 ? 1 : -1, g = new THREE.Group(), col = rnd([0xb03a2e, 0x3b82f6, 0xe9edf2, 0x2ecc71, 0xf0b429, 0x6b4aa8]);
    g.add(box(2.2, 0.55, 1.0, mat(col, { metalness: 0.5, roughness: 0.4 }), 0, 0.5, 0)); g.add(box(1.2, 0.45, 0.9, mat(0x20262f, { metalness: 0.3 }), -0.1, 0.98, 0));
    [-0.7, 0.7].forEach(function (x) { [-0.5, 0.5].forEach(function (z) { var w = cyl(0.25, 0.25, 0.18, mat(0x111114), x, 0.25, z, 12); w.rotation.x = Math.PI / 2; g.add(w); }); });
    g.add(box(0.05, 0.14, 0.25, glow(0xfff2c0), dir * 1.1, 0.55, 0.3)); g.add(box(0.05, 0.14, 0.25, glow(0xfff2c0), dir * 1.1, 0.55, -0.3));
    g.position.set(-dir * 14, 0, dir > 0 ? 7.2 : 9.2); g.rotation.y = dir > 0 ? 0 : Math.PI; g.scale.x = 1; S.scene.add(g); S.cars.push({ g: g, dir: dir, v: rr(4, 6.5) });
  }
  function stepChar(c, dt) {
    var moving = c.path && c.pi < c.path.length, ch = c.ch;
    if (moving) {
      var p = c.path[c.pi], dx = p[0] - c.g.position.x, dz = p[1] - c.g.position.z, d = Math.hypot(dx, dz), st = c.speed * dt;
      if (d <= st) { c.g.position.x = p[0]; c.g.position.z = p[1]; c.pi++; if (c.pi >= c.path.length) onArrive(c); }
      else { c.g.position.x += dx / d * st; c.g.position.z += dz / d * st; c.g.rotation.y += (Math.atan2(dx, dz) - c.g.rotation.y + (Math.abs(Math.atan2(dx, dz) - c.g.rotation.y) > Math.PI ? (Math.atan2(dx, dz) > c.g.rotation.y ? -2 * Math.PI : 2 * Math.PI) : 0)) * Math.min(1, dt * 9); }
      c.ph += dt * c.speed * 5.2; var sw = Math.sin(c.ph);
      ch.legL.rotation.x = sw * 0.6; ch.legR.rotation.x = -sw * 0.6; ch.armL.rotation.x = -sw * 0.5; ch.armR.rotation.x = sw * 0.5; ch.body.position.y = Math.abs(sw) * 0.035;
    } else {
      c.ph += dt * 2.2; ch.legL.rotation.x *= 0.8; ch.legR.rotation.x *= 0.8; ch.armL.rotation.x = Math.sin(c.ph) * 0.05; ch.armR.rotation.x = -Math.sin(c.ph) * 0.05; ch.body.position.y = 0;
      ch.head.rotation.y = Math.sin(c.ph * 0.6) * 0.35;
    }
  }
  function onArrive(c) {
    if (c.arrive === "wait") {
      c.state = "wait"; c.wait = 0; var ty = 0.35 * (c.side || 1) * -1; c.faceTo = ty;                       // dreht sich zur Kamera
    } else if (c.arrive === "leave") { leave(c, "browse"); }
    else if (c.arrive === "gone") { removeChar(c); }
  }
  function removeChar(c) {
    try { S.grp.remove(c.g); } catch (e) {}
    if (S.cust === c) { S.cust = null; S.nextSpawn = rr(5, 9); }
    var i = S.pass.indexOf(c); if (i >= 0) S.pass.splice(i, 1);
  }

  /* ---------- Dialog ---------- */
  function talk(c) {
    var O = ORD(); if (!O || !c || c.state !== "wait") return; var dlg = document.getElementById("s3-dlg"); if (!dlg) return;
    var tag = (KIND[c.order && c.order.id] || { tag: ["Kunde", "Customer"] }).tag[de() ? 0 : 1], h = '<h4>' + c.name + ' <i>· ' + tag + "</i></h4>";
    if (c.kind === "pickup") {
      h += "<p>" + T("Ist mein PC fertig? Ich habe gesehen, dass da was in deiner Farm steht!", "Is my PC ready? I saw something in your farm!") + '</p><div class="bt"><button class="pri" data-a="deliver">' + T("Zeigen & abgeben", "Show & hand over") + '</button><button data-a="later">' + T("Später", "Later") + "</button></div>";
    } else {
      var t = de() ? c.order.de : c.order.en, rw = Math.round(c.order.mult * Math.min(2, 1 + 0.25 * (O.state().cycle || 0)) * 100);
      h += "<p>" + rnd(OPEN[de() ? "de" : "en"]) + " <b>" + t[0] + ".</b> " + t[1] + "</p><ul>" + c.order.req.map(function (q) { return "<li>" + reqText(q) + "</li>"; }).join("") + "</ul>";
      h += '<div class="rw">' + T("Belohnung: ", "Reward: ") + rw + "% " + T("der Teilekosten (zusätzlich zum Verkauf)", "of parts cost (on top of the sale)") + "</div>";
      h += '<div class="bt"><button class="pri" data-a="accept">' + T("Annehmen", "Accept") + '</button><button data-a="decline">' + T("Ablehnen", "Decline") + "</button></div>";
    }
    dlg.innerHTML = h; dlg.classList.add("show"); S.dlg = c;
  }
  function closeDlg() { var d = document.getElementById("s3-dlg"); if (d) d.classList.remove("show"); S.dlg = null; }
  function dlgAction(a) {
    var c = S.dlg, O = ORD(); if (!c) return;
    if (a === "accept") {
      O.open(); var b = document.querySelector('#ord-ov [data-accept="' + c.order.id + '"]'); if (b) b.click(); O.close();                // nutzt die vorhandene, speichernde Logik
      toast(T("Auftrag angenommen: ", "Order accepted: ") + (de() ? c.order.de[0] : c.order.en[0])); leave(c, "happy");
    } else if (a === "decline") { leave(c, "sad"); }
    else if (a === "later") { leave(c, "later"); }
    else if (a === "deliver") { closeDlg(); O.open(); S.pendingLeave = c; }
  }
  function toast(m) {
    var d = document.createElement("div"); d.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:100002;background:#12161c;border:1px solid #f7931a;color:#e7e9ec;border-radius:12px;padding:10px 14px;font-weight:700;text-align:center;font-size:13px";
    d.textContent = "🏪 " + m; document.body.appendChild(d); setTimeout(function () { try { d.remove(); } catch (e) {} }, 3200);
  }

  /* ---------- Loop ---------- */
  function frame(ts) {
    if (!S.open) { S.raf = 0; return; }
    S.raf = W.requestAnimationFrame(frame);
    var dt = Math.min(0.05, ((ts || 0) - S.last) / 1000 || 0.016); S.last = ts || 0; S.t += dt;
    try {
      var c = S.cust;
      if (!c) { S.nextSpawn -= dt; if (S.nextSpawn <= 0) { spawnCustomer(); } }
      else {
        stepChar(c, dt);
        if (c.state === "wait") {
          c.wait += dt; var tgt = c.faceTo || 0.3; c.g.rotation.y += (tgt - c.g.rotation.y) * Math.min(1, dt * 5); c.ch.armR.rotation.x = Math.sin(S.t * 4) * 0.12 - 0.15;
          if (c.wait > 75 && !S.dlg) leave(c, "bored");
        }
        if (S.pendingLeave === c) { var ovo = document.getElementById("ord-ov"); if (!ovo || !ovo.classList.contains("show")) { S.pendingLeave = null; leave(c, "happy"); } }
      }
      for (var i = S.pass.length - 1; i >= 0; i--) stepChar(S.pass[i], dt);
      S.nextPass -= dt; if (S.nextPass <= 0 && S.pass.length < 3) { spawnPasser(); S.nextPass = rr(4, 9); }
      S.nextCar -= dt; if (S.nextCar <= 0 && S.cars.length < 2) { spawnCar(); S.nextCar = rr(7, 16); }
      for (var j = S.cars.length - 1; j >= 0; j--) { var k = S.cars[j]; k.g.position.x += k.dir * k.v * dt; if (Math.abs(k.g.position.x) > 16) { S.scene.remove(k.g); S.cars.splice(j, 1); } }
      var kp = S.keeper; if (kp) { kp.armL.rotation.x = Math.sin(S.t * 1.5) * 0.06; kp.head.rotation.y = Math.sin(S.t * 0.5) * 0.25; }
      var bub = document.getElementById("s3-bub");
      if (bub) {
        if (c && c.state === "wait" && !S.dlg) { S.v.set(c.g.position.x, 2.5, c.g.position.z); S.v.project(S.cam); var w = S.stage.clientWidth, h = S.stage.clientHeight; bub.style.display = "block"; bub.style.left = ((S.v.x * 0.5 + 0.5) * w) + "px"; bub.style.top = ((-S.v.y * 0.5 + 0.5) * h) + "px"; bub.textContent = c.kind === "pickup" ? "📦 ?" : "💬"; }
        else bub.style.display = "none";
      }
      S.rd.render(S.scene, S.cam);
    } catch (e) { console.warn("[shop] frame", e); }
  }

  function ensureDom() {
    if (ov) return; css();
    ov = document.createElement("div"); ov.id = "s3-ov";
    ov.innerHTML = '<div class="s3-hd"><b>🏪 ' + T("Mein Laden", "My shop") + '</b><button id="s3-ord" type="button">📋 ' + T("Aufträge", "Orders") + '</button><button class="x" id="s3-x" type="button">✕</button></div><div id="s3-stage"><div class="s3-hint">' + T("Tippe auf den Kunden mit 💬. Ziehen = drehen, zwei Finger = zoomen.", "Tap the customer with 💬. Drag = rotate, two fingers = zoom.") + '</div><div class="s3-bub" id="s3-bub">💬</div><div id="s3-dlg"></div></div>';
    document.body.appendChild(ov);
    document.getElementById("s3-x").addEventListener("click", close);
    document.getElementById("s3-ord").addEventListener("click", function () { var O = ORD(); if (O) O.open(); });
    document.getElementById("s3-bub").addEventListener("click", function () { if (S.cust) talk(S.cust); });
    document.getElementById("s3-dlg").addEventListener("click", function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute("data-a"); if (a) dlgAction(a); });
    W.addEventListener("resize", function () { if (S.open) resize(); });
  }
  function open() {
    try {
      ensureDom(); ov.classList.add("show"); S.open = true;
      if (!S.ready) build3d(document.getElementById("s3-stage"));
      else if (S.rd.domElement.parentNode !== document.getElementById("s3-stage")) document.getElementById("s3-stage").insertBefore(S.rd.domElement, document.getElementById("s3-stage").firstChild);
      var cv = S.rd.domElement; cv.style.cssText = "display:block;width:100%;height:100%;touch-action:none;position:absolute;left:0;top:0";
      resize(); setTimeout(resize, 60); S.last = 0; if (!S.raf) S.raf = W.requestAnimationFrame(frame);
    } catch (e) { console.warn("[shop] open", e); }
  }
  function close() { S.open = false; if (ov) ov.classList.remove("show"); closeDlg(); }

  function placeBtn() {
    if (btn && btn.isConnected) return true; if (!document.body) return false; css();
    var ref = document.getElementById("ord-open-btn") || document.getElementById("farm-open-btn") || document.getElementById("ps-open-btn");
    if (!ref) return false;
    btn = document.createElement("button"); btn.type = "button"; btn.id = "shop3d-btn"; btn.className = ref.className; btn.textContent = "🏪 " + T("Laden", "Shop");
    ref.parentNode.insertBefore(btn, ref.nextSibling); btn.addEventListener("click", open); return true;
  }
  var n = 0, iv = setInterval(function () { n++; try { if (ORD() && placeBtn()) { clearInterval(iv); } } catch (e) {} if (n > 160) clearInterval(iv); }, 250);
  setInterval(function () { try { if (ORD() && (!btn || !btn.isConnected)) { btn = null; placeBtn(); } if (btn) btn.textContent = "🏪 " + T("Laden", "Shop"); } catch (e) {} }, 2500);
  W.Parts3D = W.Parts3D || {};
  W.Parts3D.shop = { open: open, close: close, _dbg: { S: S, spawn: spawnCustomer, makeChar: makeChar, randomSpec: randomSpec } };
  console.log("[HASHPOOL] shopScene bereit");
})();

/* clicker.js — HASHPOOL NEXT: Klick-Spiel IM Laden, mit den ORIGINAL-Upgrades des Spiels (1:1, nichts neu erfunden)
 * - Buzzer = #mine-btn des Spiels (echter Klick inkl. Crit, Sound, Speichern)
 * - Wand-Bildschirm zeigt Kontostand und Rate so, wie das Spiel sie anzeigt (#balance, #hashrate)
 * - Tablet am Tisch = Upgrade-Liste: 6 Miner (USB, GPU, FPGA, ASIC, Container-Farm, Solar) + 4 Klick-Upgrades
 *   (Spitzhacke, Wasserkuehlung, ASIC-Stift, Quanten-Tap). Kaufen klickt die echten Shop-Zeilen des Spiels (#shop, #shop-click).
 * - Jedes Upgrade ist im Raum sichtbar (Anzahl waechst mit den Besitz-Zahlen state.owned / state.clickOwned)
 * Passives Einkommen, Kosten, Wirkung, Speichern: alles Original-Logik des Spiels.
 */
(function () {
  var W = window;
  if (W.__nxClicker) return; W.__nxClicker = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }

  /* ---------- Original-Daten (aus js/data-1.js) ---------- */
  var UP = [
    { id: "usb", icon: "🔌", hr: 0.08, name: { en: "USB Miner", de: "USB-Miner" }, desc: { en: "A novelty stick that gets warm.", de: "Ein Spielzeug-Stick, der warm wird." } },
    { id: "gpu", icon: "🖥️", hr: 0.55, name: { en: "GPU Rig", de: "GPU-Rig" }, desc: { en: "One graphics card, six fans.", de: "Eine Grafikkarte, sechs Lüfter." } },
    { id: "fpga", icon: "🧩", hr: 3.5, name: { en: "FPGA Board", de: "FPGA-Board" }, desc: { en: "Purpose-built silicon, quiet and cold.", de: "Speziell gebauter Chip, leise und kühl." } },
    { id: "asic", icon: "📦", hr: 22, name: { en: "ASIC Unit", de: "ASIC-Einheit" }, desc: { en: "Sounds like a jet engine. Mines like one too.", de: "Klingt wie ein Düsentriebwerk. Mint auch wie eins." } },
    { id: "farm", icon: "🏭", hr: 140, name: { en: "Container Farm", de: "Container-Farm" }, desc: { en: "A shipping container full of ASICs.", de: "Ein Schiffscontainer voller ASICs." } },
    { id: "plant", icon: "☀️", hr: 900, name: { en: "Solar Mining Plant", de: "Solar-Miningpark" }, desc: { en: "Your own power grid, dedicated to hashes.", de: "Dein eigenes Stromnetz, nur für Hashes." } }
  ];
  var CL = [
    { id: "pick", icon: "⛏️", mult: 1.35, name: { en: "Sharper Pickaxe", de: "Schärfere Spitzhacke" }, desc: { en: "Cuts through hashes a bit faster.", de: "Schneidet etwas schneller durch Hashes." } },
    { id: "cool", icon: "❄️", mult: 1.5, name: { en: "Liquid Cooling", de: "Wasserkühlung" }, desc: { en: "Overclock without melting anything.", de: "Übertakten, ohne dass etwas schmilzt." } },
    { id: "asicpen", icon: "🖊️", mult: 1.75, name: { en: "ASIC Pen", de: "ASIC-Stift" }, desc: { en: "A handheld chip, just for tapping.", de: "Ein Handheld-Chip, nur zum Tippen." } },
    { id: "quantum", icon: "✨", mult: 2.1, name: { en: "Quantum Tap", de: "Quanten-Tap" }, desc: { en: "Mines a little bit of tomorrow too.", de: "Mint ein bisschen von morgen mit." } }
  ];
  var S2 = { pressT: 0, leds: [], spin: [], orb: [], sig: "", clicks: 0, mode: -1, fails: 0 };
  function st() { return W.state || {}; }
  function own(id) { try { return Number(st().owned[id]) || 0; } catch (e) { return 0; } }
  function cown(id) { try { return Number(st().clickOwned[id]) || 0; } catch (e) { return 0; } }
  function bal() { try { return Number(st().balance) || 0; } catch (e) { return 0; } }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function ownSig() { return UP.map(function (u) { return own(u.id); }).join(",") + "|" + CL.map(function (u) { return cown(u.id); }).join(","); }

  /* ---------- Klick des Spiels ---------- */
  function gameClick() {
    var el = document.getElementById("mine-btn"); if (!el) return 0;
    var b0 = bal(); el.click(); var d = bal() - b0; return d > 0 ? d : 0;
  }

  /* ---------- Szene ---------- */
  var S = null, D = null, grp = null, scrTex = null, scrCtx = null, buzMesh = null, panel = null;
  var TBL = [-3.3, -1.3, -1.0, -0.1], RACK = [-4.4, -3.7, 0.5, 2.5];
  function mat(c, o) { var p = { color: c, roughness: 0.7, metalness: 0.2 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function plate(lines, w, h, x, y, z, ry) {
    var c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * h / w); var g = c.getContext("2d");
    g.fillStyle = "#0b1018"; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = "#f7931a"; g.lineWidth = 6; g.strokeRect(3, 3, c.width - 6, c.height - 6);
    g.fillStyle = "#f7931a"; g.textAlign = "center"; g.textBaseline = "middle"; var lh = c.height / lines.length;
    lines.forEach(function (l, i) { g.font = "bold " + Math.floor(lh * 0.62) + "px sans-serif"; g.fillText(l, c.width / 2, lh * (i + 0.5)); });
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })); m.position.set(x, y, z); m.rotation.y = ry || 0; return m;
  }
  var TIERS = [{ c: 0xd32f2f, e: 0x000000, m: 0.1 }, { c: 0xff7a1a, e: 0x331100, m: 0.2 }, { c: 0xcfd8dc, e: 0x000000, m: 0.9 }, { c: 0xffc107, e: 0x553a00, m: 0.9 }, { c: 0x40e0ff, e: 0x0a6a88, m: 0.5 }];
  function scrMake() { var c = document.createElement("canvas"); c.width = 768; c.height = 432; scrCtx = c.getContext("2d"); scrTex = new THREE.CanvasTexture(c); drawScreen(); }
  function drawScreen() {
    var g = scrCtx; if (!g) return; var w = 768;
    g.fillStyle = "#07101c"; g.fillRect(0, 0, w, 432);
    g.fillStyle = "#0e2236"; g.fillRect(0, 0, w, 64); g.fillStyle = "#f7931a"; g.font = "bold 34px monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("₿ HASHPOOL", 22, 34);
    g.fillStyle = "#78d505"; g.textAlign = "right"; g.font = "bold 24px monospace"; g.fillText(txt("tick") || "● ONLINE", w - 22, 34);
    var b = txt("balance") || "0 sats", num = b.replace(/\s*sats\s*$/i, ""); g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = "bold " + (num.length > 9 ? 70 : 92) + "px monospace"; g.fillText(num, w / 2, 150);
    g.fillStyle = "#6aa8ff"; g.font = "bold 28px monospace"; g.fillText("SATS  " + txt("usd-val"), w / 2, 216);
    var hr = txt("hashrate").split("·"); g.textAlign = "left"; g.fillStyle = "#cfd8dc"; g.font = "bold 30px monospace";
    g.fillText("▸ " + (hr[0] || "").trim(), 40, 292); g.fillText("▸ " + (hr[1] || "").trim(), 40, 340); g.fillStyle = "#8a93a3"; g.font = "24px monospace"; g.fillText(T("Klicks hier: ", "Clicks here: ") + S2.clicks + "   " + txt("price"), 40, 392);
    scrTex.needsUpdate = true;
  }
  function stationAdd(id, x, y, z, w, h, d, label, sx, sz, action) {
    var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(x, y, z); hb.userData.st = id; S.scene.add(hb); S.hits.push(hb);
    var el = document.createElement("div"); el.className = "nx-lbl"; el.textContent = label; S.stage.appendChild(el);
    var s = { id: id, sx: sx, sz: sz, tx: x, tz: z, action: action, lx: x, ly: y + h / 2 + 0.15, lz: z, label: label, el: el }; S.stations[id] = s;
    el.addEventListener("click", function (e) { e.stopPropagation(); var pts = []; if ((S.pz > -1.3) !== (sz > -1.3)) { var a = S.pz > -1.3; pts.push(a ? [0, -0.4] : [0, -2.2]); pts.push(a ? [0, -2.2] : [0, -0.4]); } pts.push([sx, sz]); S.auto = { pts: pts, i: 0, id: id, face: [x, z] }; });
  }
  function tabTex() { var c = document.createElement("canvas"); c.width = 256; c.height = 160; var g = c.getContext("2d"); g.fillStyle = "#0a1830"; g.fillRect(0, 0, 256, 160); g.fillStyle = "#78d505"; g.font = "bold 32px sans-serif"; g.textAlign = "center"; g.fillText("⬆ UPGRADES", 128, 60); g.fillStyle = "#6aa8ff"; g.font = "24px sans-serif"; g.fillText("tippen", 128, 112); return new THREE.CanvasTexture(c); }

  function build() {
    if (grp) S.scene.remove(grp); grp = new THREE.Group(); S.scene.add(grp); S2.leds = []; S2.spin = []; S2.orb = [];
    var wood = mat(0x4a3526, { roughness: 0.6, metalness: 0.05 }), steel = mat(0xb0b8c4, { metalness: 0.9, roughness: 0.3 });
    var nPick = cown("pick"), nCool = cown("cool"), nPen = cown("asicpen"), nQ = cown("quantum");
    var tier = (nPick > 0) + (nCool > 0) + (nPen > 0) + (nQ > 0);
    // Tisch + Buzzer (Look waechst mit der Anzahl verschiedener Klick-Upgrades)
    grp.add(box(2.0, 0.1, 0.9, mat(0x6e5740, { metalness: 0.05 }), -2.3, 0.95, -0.55)); [[-3.25, -0.95], [-1.35, -0.95], [-3.25, -0.15], [-1.35, -0.15]].forEach(function (p) { grp.add(box(0.08, 0.95, 0.08, wood, p[0] + 0.05, 0.47, p[1] + 0.05)); });
    var t = TIERS[tier], sc = 1 + 0.07 * tier;
    grp.add(cyl(0.24 * sc, 0.26 * sc, 0.09, mat(0x1d2230, { metalness: 0.6 }), -2.3, 1.05, -0.55, 24));
    if (tier >= 2) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.235 * sc, 0.02, 8, 28), mat(t.c, { metalness: 0.95, roughness: 0.2 })); ring.rotation.x = Math.PI / 2; ring.position.set(-2.3, 1.1, -0.55); grp.add(ring); }
    buzMesh = cyl(0.18 * sc, 0.19 * sc, 0.1, mat(t.c, { metalness: t.m, roughness: 0.35, emissive: t.e, emissiveIntensity: 0.9 }), -2.3, 1.16, -0.55, 24); grp.add(buzMesh);
    // Tablet
    grp.add(box(0.5, 0.03, 0.34, mat(0x20262f, { metalness: 0.6 }), -1.55, 1.01, -0.4)); grp.add(box(0.46, 0.02, 0.3, new THREE.MeshBasicMaterial({ map: tabTex() }), -1.55, 1.035, -0.4));
    // Wand-Bildschirm
    var wz = -1.19; grp.add(box(2.5, 1.45, 0.05, mat(0x0b0f16, { metalness: 0.6 }), -2.3, 2.0, wz)); var sp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshBasicMaterial({ map: scrTex })); sp.position.set(-2.3, 2.0, wz + 0.03); grp.add(sp);
    /* ----- Klick-Upgrades ----- */
    if (nPick > 0) { var pc = nPick >= 15 ? 3 : nPick >= 5 ? 2 : 1; for (var i = 0; i < pc; i++) { var hx = -3.5 - i * 0.18, h = cyl(0.025, 0.025, 1.1, mat(0x7a5230), hx, 0.62, -0.1 + i * 0.1, 8); h.rotation.z = 0.18; grp.add(h); var hd = box(0.42, 0.06, 0.06, steel, hx + 0.1, 1.17, -0.1 + i * 0.1); hd.rotation.z = 0.18; grp.add(hd); } }
    if (nCool > 0) {
      var cc = nCool >= 15 ? 3 : nCool >= 5 ? 2 : 1, bl = mat(0x40a0ff, { emissive: 0x1060c0, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });
      grp.add(box(0.55, 0.32, 0.05, mat(0x20262f, { metalness: 0.7 }), -1.55, 1.3, -1.12)); for (var k = 0; k < 6; k++) grp.add(box(0.5, 0.012, 0.02, glow(0x40a0ff), -1.55, 1.16 + k * 0.05, -1.08));
      for (var j = 0; j < cc; j++) grp.add(cyl(0.06, 0.06, 0.26, bl, -1.2 - j * 0.16, 1.18, -0.88, 12));
      var tube = cyl(0.015, 0.015, 0.9, bl, -2.0, 1.1, -0.9, 8); tube.rotation.z = Math.PI / 2; grp.add(tube);
    }
    if (nPen > 0) { grp.add(box(0.14, 0.03, 0.14, mat(0x20262f), -3.0, 1.01, -0.35)); var pen = cyl(0.012, 0.012, 0.32, mat(0x111418, { metalness: 0.6 }), -3.0, 1.18, -0.35, 8); pen.rotation.z = 0.25; grp.add(pen); var tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), glow(0x40ff90)); tip.position.set(-2.96, 1.34, -0.35); grp.add(tip); S2.leds.push(tip); }
    if (nQ > 0) {
      var qs = 0.12 + Math.min(nQ, 10) * 0.012, orb = new THREE.Mesh(new THREE.SphereGeometry(qs, 20, 14), new THREE.MeshStandardMaterial({ color: 0xb06aff, emissive: 0x7a2bd8, emissiveIntensity: 1.2, roughness: 0.2 })); orb.position.set(-2.3, 1.85, -0.55); grp.add(orb); S2.orb.push(orb);
      [0, 1].forEach(function (r) { var rg = new THREE.Mesh(new THREE.TorusGeometry(qs * 1.9, 0.012, 8, 32), glow(r ? 0x6ad4ff : 0xff6af0)); rg.position.set(-2.3, 1.85, -0.55); rg.rotation.x = r ? 1.0 : 0.3; grp.add(rg); S2.spin.push({ m: rg, ax: r ? "z" : "y", s: r ? 1.6 : -1.1 }); });
    }
    /* ----- Miner-Racks an der linken Wand ----- */
    var frame = mat(0x151a22, { metalness: 0.5 });
    grp.add(box(0.5, 1.9, 0.95, frame, -4.1, 0.95, 1.0)); grp.add(box(0.5, 1.9, 0.9, frame, -4.1, 0.95, 2.0));
    var shelf = mat(0x2d3646, { metalness: 0.4 }); [0.05, 0.55, 1.1, 1.65].forEach(function (y) { grp.add(box(0.46, 0.04, 0.9, shelf, -3.97, y + 0.03, 1.0)); grp.add(box(0.46, 0.04, 0.86, shelf, -3.97, y + 0.03, 2.0)); });
    var nU = own("usb"), nG = own("gpu"), nF = own("fpga"), nA = own("asic"), nFarm = own("farm"), nPl = own("plant");
    for (var u = 0; u < Math.min(nU, 12); u++) { var row = Math.floor(u / 6), cz = 0.65 + (u % 6) * 0.14; grp.add(box(0.2, 0.03, 0.05, mat(0x2a2f3a), -4.0 + row * 0.2 - 0.05, 0.11, cz)); var l = box(0.03, 0.02, 0.04, glow(0x78d505), -3.9 + row * 0.2 - 0.05, 0.13, cz); grp.add(l); S2.leds.push(l); }
    for (var g = 0; g < Math.min(nG, 4); g++) { var gz = 0.68 + g * 0.2; grp.add(box(0.34, 0.4, 0.17, mat(0x23282f, { metalness: 0.5 }), -4.02, 0.78, gz)); var fan = cyl(0.07, 0.07, 0.02, mat(0x0b0d11), -3.84, 0.8, gz, 14); fan.rotation.z = Math.PI / 2; grp.add(fan); S2.spin.push({ m: fan, ax: "x", s: 9 }); var gl = box(0.01, 0.03, 0.14, glow(0x78d505), -3.84, 0.62, gz); grp.add(gl); }
    for (var f = 0; f < Math.min(nF, 6); f++) { var fz = 0.62 + f * 0.15; grp.add(box(0.2, 0.22, 0.02, mat(0x1f7a46), -4.0, 1.3, fz)); grp.add(box(0.07, 0.07, 0.03, mat(0xffc107, { metalness: 0.9 }), -4.0, 1.32, fz)); var fl = box(0.02, 0.02, 0.02, glow(0x40e0ff), -3.89, 1.4, fz); grp.add(fl); S2.leds.push(fl); }
    for (var a = 0; a < Math.min(nA, 6); a++) { var arow = Math.floor(a / 2), az = 1.7 + (a % 2) * 0.42, ay = 0.3 + arow * 0.55; grp.add(box(0.36, 0.34, 0.38, mat(0x2b3140, { metalness: 0.6 }), -4.02, ay + 0.18, az)); var af = cyl(0.12, 0.12, 0.02, mat(0x0b0d11), -3.83, ay + 0.2, az, 18); af.rotation.z = Math.PI / 2; grp.add(af); S2.spin.push({ m: af, ax: "x", s: 14 }); grp.add(box(0.01, 0.04, 0.3, glow(0xff7a1a), -3.83, ay + 0.04, az)); }
    grp.add(plate(["🔌 " + (de() ? UP[0].name.de : UP[0].name.en) + " ×" + nU, "🖥️ GPU ×" + nG + "   🧩 FPGA ×" + nF], 1.0, 0.34, -4.29, 2.15, 1.0, Math.PI / 2));
    grp.add(plate(["📦 " + (de() ? UP[3].name.de : UP[3].name.en) + " ×" + nA], 0.9, 0.24, -4.29, 2.15, 2.0, Math.PI / 2));
    /* ----- Draussen: Container-Farm + Solar-Miningpark (durch die Schaufenster sichtbar) ----- */
    if (nFarm > 0) {
      var cx = -7.6, cz2 = 3.7; grp.add(box(3.4, 1.5, 1.3, mat(0x2a6bd1, { roughness: 0.6 }), cx, 0.85, cz2));
      for (var r = 0; r < 12; r++) grp.add(box(0.05, 1.4, 1.34, mat(0x1f55ab), cx - 1.55 + r * 0.28, 0.85, cz2));
      for (var v = 0; v < Math.min(nFarm, 10); v++) { var vl = box(0.18, 0.1, 0.03, glow(0xff7a1a), cx - 1.4 + v * 0.3, 1.3, cz2 + 0.68); grp.add(vl); S2.leds.push(vl); }
      var vf = cyl(0.3, 0.3, 0.05, mat(0x0b0d11), cx + 1.72, 0.9, cz2, 18); vf.rotation.z = Math.PI / 2; grp.add(vf); S2.spin.push({ m: vf, ax: "x", s: 10 });
      grp.add(plate(["🏭 " + (de() ? UP[4].name.de : UP[4].name.en) + " ×" + nFarm], 2.0, 0.34, cx, 2.1, cz2 + 0.7, 0));
    }
    if (nPl > 0) {
      var np = Math.min(2 + nPl * 2, 9);
      for (var s = 0; s < np; s++) { var sx = 5.9 + (s % 3) * 1.15, sz = 3.7 + Math.floor(s / 3) * 0.9, pn = box(1.05, 0.04, 0.8, mat(0x123a7a, { metalness: 0.7, roughness: 0.25 }), sx, 0.9, sz); pn.rotation.x = -0.5; grp.add(pn); grp.add(box(0.06, 0.85, 0.06, mat(0x4a4f58), sx, 0.42, sz + 0.2)); for (var gl2 = 0; gl2 < 3; gl2++) { var gline = box(1.05, 0.045, 0.01, mat(0x6aa0ff), sx, 0.9, sz); gline.rotation.x = -0.5; gline.position.z += (gl2 - 1) * 0.22; gline.position.y += (gl2 - 1) * -0.11; grp.add(gline); } }
      grp.add(plate(["☀️ " + (de() ? UP[5].name.de : UP[5].name.en) + " ×" + nPl], 2.4, 0.34, 7.1, 2.0, 4.1, 0));
    }
    S2.sig = ownSig();
  }

  /* ---------- Bedienung ---------- */
  var actx = null;
  function beep(f) { try { actx = actx || new (W.AudioContext || W.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = "square"; g.gain.value = 0.03; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.05); } catch (e) {} }
  function fmtG(n) { n = Number(n) || 0; if (n < 10 && n % 1 !== 0) return (Math.round(n * 10) / 10).toFixed(1); return String(Math.floor(n)); }
  function floatText(txt2, crit) {
    if (!S || !S.cam) return; var v = new THREE.Vector3(-2.3 + (Math.random() - 0.5) * 0.4, 1.5, -0.55); v.project(S.cam); if (v.z > 1) return;
    var w = S.stage.clientWidth, h = S.stage.clientHeight, d = document.createElement("div"); d.className = "nx-float"; d.textContent = txt2; if (crit) d.style.color = "#ff6a6a"; d.style.left = ((v.x * 0.5 + 0.5) * w) + "px"; d.style.top = ((-v.y * 0.5 + 0.5) * h) + "px"; S.stage.appendChild(d);
    requestAnimationFrame(function () { d.style.transform = "translate(-50%,-90px)"; d.style.opacity = "0"; }); setTimeout(function () { try { d.remove(); } catch (e) {} }, 800);
  }
  function press() {
    var d = gameClick(), crit = false;
    if (d <= 0) { var pc = Number(st().perClick) || 1; try { W.state.balance += pc; W.state.lifetime += pc; } catch (e) {} d = pc; }
    else if (st().perClick && d > st().perClick * 2) crit = true;
    S2.clicks++; S2.pressT = 0.12; beep(crit ? 880 : 320 + (S2.clicks % 5) * 40); floatText((crit ? "CRIT! +" : "+") + fmtG(d), crit);
  }
  function rows(kind) { var host = document.getElementById(kind === "C" ? "shop-click" : "shop"); return host ? host.children : []; }
  function ensureQty() { try { if (st().buyQty !== 1) { var b = document.querySelector('.qty-btn[data-qty="1"]'); if (b) b.click(); } } catch (e) {} }
  function openUpg() {
    css(); if (!panel) {
      panel = document.createElement("div"); panel.id = "nx-upg"; S.stage.appendChild(panel);
      panel.addEventListener("click", function (e) {
        var t = e.target; if (!t || !t.getAttribute) return; var b = t.getAttribute("data-buy"), q = t.getAttribute("data-qty");
        if (q) { var qb = document.querySelector('.qty-btn[data-qty="' + q + '"]'); if (qb) qb.click(); setTimeout(renderUpg, 30); return; }
        if (b) { buy(b); return; } if (t.getAttribute("data-x")) closeUpg();
      });
    }
    renderUpg(); panel.classList.add("show"); S.invOpen = true; S.joy.x = 0; S.joy.y = 0;
  }
  function closeUpg() { if (panel) panel.classList.remove("show"); S.invOpen = false; }
  function costOf(kind, i) { var r = rows(kind)[i]; return r ? Number(r.dataset.cost) || 0 : 0; }
  function fmtCost(n) { n = Math.ceil(n); return (n < 100000 ? n.toLocaleString(de() ? "de-DE" : "en-US") : n.toLocaleString(de() ? "de-DE" : "en-US", { notation: "compact", maximumFractionDigits: 2 })) + " sats"; }
  function renderUpg() {
    var lang = de() ? "de" : "en", h = "<h4>⬆️ Upgrades</h4><p class='nx-sub'>💰 " + txt("balance") + " · " + txt("hashrate") + "</p><div class='nx-qty'>";
    var qs = document.querySelectorAll(".qty-btn"); Array.prototype.forEach.call(qs, function (b) { var q = b.getAttribute("data-qty"); h += '<button type="button" data-qty="' + q + '"' + (Number(st().buyQty) === Number(q) ? ' class="on"' : "") + ">×" + q + "</button>"; }); h += "</div>";
    function sect(title, list, kind, ownFn, spec) {
      h += "<div class='nx-sec'>" + title + "</div>";
      list.forEach(function (u, i) {
        var n = ownFn(u.id), c = costOf(kind, i), r = rows(kind)[i], can = r && !r.disabled;
        h += '<div class="nx-up"><div><b>' + u.icon + " " + u.name[lang] + "</b>" + (n > 0 ? " <span class='nx-pip'>×" + n + "</span>" : "") + "<br><small>" + u.desc[lang] + " · " + spec(u) + "</small></div>" +
          '<button type="button" data-buy="' + kind + i + '"' + (can ? "" : " disabled") + ">" + fmtCost(c) + "</button></div>";
      });
    }
    sect(T("Klick-Upgrades", "Click upgrades"), CL, "C", cown, function (u) { return "×" + u.mult + " " + T("pro Klick", "per click"); });
    sect(T("Miner (passiv)", "Miners (passive)"), UP, "P", own, function (u) { return "+" + u.hr + " H/s"; });
    h += '<div class="nx-bt"><button type="button" data-x="1">' + T("Schließen", "Close") + "</button></div>"; panel.innerHTML = h;
  }
  function buy(code) {
    var kind = code.charAt(0), i = Number(code.slice(1)), r = rows(kind)[i]; if (!r || r.disabled) return;
    r.click(); setTimeout(function () { renderUpg(); }, 40); beep(660);
  }
  function css() {
    if (document.getElementById("nx-clk-style")) return; var s = document.createElement("style"); s.id = "nx-clk-style";
    s.textContent = ".nx-float{position:absolute;transform:translate(-50%,0);color:#ffd36a;font:700 20px monospace;text-shadow:0 1px 4px #000;pointer-events:none;transition:transform .75s ease-out,opacity .75s;z-index:4}" +
      "#nx-upg{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font:13px sans-serif;display:none;z-index:6;max-height:80%;overflow:auto;box-shadow:0 8px 30px #000a}#nx-upg.show{display:block}" +
      "#nx-upg h4{margin:0 0 4px;font-size:15px}.nx-sub{margin:0 0 8px;color:#aeb6c2;font-size:12px}.nx-sec{margin:10px 0 2px;color:#f7931a;font-weight:700;font-size:12px;text-transform:uppercase}" +
      ".nx-qty{display:flex;gap:6px;margin-bottom:4px}.nx-qty button{flex:1;font:700 12px monospace;padding:7px;border-radius:8px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}.nx-qty button.on{background:#f7931a;border-color:#f7931a;color:#1a1206}" +
      ".nx-up{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #222a36;padding:8px 0}.nx-up small{color:#aeb6c2}.nx-pip{color:#f7931a;font-weight:700}" +
      ".nx-up button{font:700 12px monospace;padding:9px 10px;border-radius:9px;border:1px solid #f7931a;background:#f7931a;color:#1a1206;min-width:96px}.nx-up button[disabled]{opacity:.35;background:#161c24;color:#e7e9ec;border-color:#2c3646}" +
      "#nx-upg .nx-bt{display:flex;margin-top:10px}#nx-upg .nx-bt button{flex:1;font:700 13px sans-serif;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}";
    document.head.appendChild(s);
  }
  function pushOut(r) {
    var R = 0.3, x = S.px, z = S.pz; if (x > r[0] - R && x < r[1] + R && z > r[2] - R && z < r[3] + R) {
      var dl = x - (r[0] - R), dr = (r[1] + R) - x, dt = z - (r[2] - R), db = (r[3] + R) - z, m = Math.min(dl, dr, dt, db);
      if (m === dl) S.px = r[0] - R; else if (m === dr) S.px = r[1] + R; else if (m === dt) S.pz = r[2] - R; else S.pz = r[3] + R;
    }
  }
  var t0 = 0, acc = 0;
  function loop(ts) {
    requestAnimationFrame(loop); if (!S || !S.ready) return; var dt = Math.min(0.05, ((ts || 0) - t0) / 1000 || 0.016); t0 = ts || 0;
    pushOut(TBL); pushOut(RACK);
    if (!S.shown || S.hiddenByOverlay) return;
    if (buzMesh) { S2.pressT = Math.max(0, S2.pressT - dt); buzMesh.position.y = 1.16 - (S2.pressT > 0 ? 0.045 : 0); }
    var now = Date.now() / 1000; S2.leds.forEach(function (l, i) { l.visible = Math.sin(now * 5 + i * 1.7) > -0.3; });
    S2.spin.forEach(function (s) { s.m.rotation[s.ax] += dt * s.s; }); S2.orb.forEach(function (o) { o.position.y = 1.85 + Math.sin(now * 2) * 0.04; });
    acc += dt; if (acc > 0.3) { acc = 0; drawScreen(); if (ownSig() !== S2.sig) build(); if (panel && panel.classList.contains("show")) renderUpg(); }
  }
  function init() {
    S = W.Parts3D.nextWorld.S; D = W.Parts3D.shop && W.Parts3D.shop._dbg; css(); scrMake(); build();
    stationAdd("buzzer", -2.3, 1.15, -0.55, 0.9, 0.5, 0.9, "🔴 Buzzer", -2.3, 0.5, press);
    stationAdd("upg", -1.55, 1.1, -0.4, 0.6, 0.3, 0.45, "⬆️ Upgrades", -1.5, 0.5, function () { ensureQty(); openUpg(); });
    requestAnimationFrame(loop);
    W.Parts3D.clicker = { press: press, open: openUpg, rebuild: build };
    console.log("[HASHPOOL NEXT] clicker bereit (Original-Upgrades)");
  }
  var n = 0, iv = setInterval(function () { n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && W.state && typeof THREE !== "undefined" && document.getElementById("mine-btn")) { clearInterval(iv); init(); } } catch (e) { console.warn("[clicker]", e); } if (n > 400) clearInterval(iv); }, 500);
})();

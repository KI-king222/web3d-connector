/* clicker.js — HASHPOOL NEXT: Klick-Spiel IM Laden (Buzzer-Tisch + Wand-Bildschirm + sichtbare Upgrades)
 * - Buzzer antippen = Klick des echten Spiels (fire auf das Klick-Element des Spiels; Fallback: eigener Klick)
 * - Bildschirm an der Wand zeigt Sats, Klickwert, passiv/s
 * - Upgrade-Tablet am Tisch: aktive (Buzzer, Doppel-Buzzer) und passive (Praktikanten, Mini-Rigs) + Monitore; alles sichtbar im Raum
 * - Kosten/Wirkung skalieren mit dem gemessenen Klickwert P (Amortisation bleibt gleich, Spieloekonomie unberuehrt)
 * - Speicher: localStorage hashpool-next-upg (nur NEXT)
 */
(function () {
  var W = window;
  if (W.__nxClicker) return; W.__nxClicker = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function fmtN(n) { n = Number(n) || 0; if (n < 1) return n.toFixed(3); if (n < 10) return n.toFixed(2); return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  var KEY = "hashpool-next-upg";
  var UPG = [
    { id: "a1", max: 5, base: 300, de: ["Stärkerer Buzzer", "+25 % Klickwert pro Stufe, neuer Buzzer-Look"], en: ["Stronger buzzer", "+25% click value per level, new buzzer look"], kind: "A" },
    { id: "a2", max: 3, base: 700, de: ["Doppel-Buzzer", "+20 % Klickwert pro Stufe, zusätzliche Buzzer am Tisch"], en: ["Double buzzer", "+20% click value per level, extra buzzers on the table"], kind: "A" },
    { id: "p1", max: 5, base: 500, de: ["Praktikant", "Drückt für dich: +0,4 Klicks/s pro Stufe"], en: ["Intern", "Presses for you: +0.4 clicks/s per level"], kind: "P" },
    { id: "p2", max: 6, base: 800, de: ["Mini-Rig", "Schürft passiv: +0,25 Klicks/s pro Stufe (Rig im Regal)"], en: ["Mini rig", "Mines passively: +0.25 clicks/s per level (rig on the rack)"], kind: "P" },
    { id: "m1", max: 3, base: 1500, de: ["Monitor-Wand", "+10 % passiv pro Stufe, mehr Bildschirme"], en: ["Monitor wall", "+10% passive per level, more screens"], kind: "P" }
  ];
  var S2 = { lv: { a1: 0, a2: 0, p1: 0, p2: 0, m1: 0 }, P: 0, mode: -1, fails: 0, el: null, clicks: 0, last: Date.now(), pressT: 0, leds: [], interns: [], specs: [], sess: 0, passAcc: 0 };
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) { UPG.forEach(function (u) { S2.lv[u.id] = Math.max(0, Math.min(u.max, Number(s.lv && s.lv[u.id]) || 0)); }); S2.P = Number(s.P) || 0; S2.last = Number(s.last) || Date.now(); S2.clicks = Number(s.clicks) || 0; } } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ lv: S2.lv, P: S2.P, last: Date.now(), clicks: S2.clicks })); } catch (e) {} }
  function Pn() { return Math.max(S2.P || 1, 0.02); }
  function cost(u) { return u.base * Math.pow(1.6, S2.lv[u.id]) * Pn(); }
  function clickBonus() { return Pn() * (0.25 * S2.lv.a1 + 0.2 * S2.lv.a2); }
  function passRate() { return Pn() * (0.4 * S2.lv.p1 + 0.25 * S2.lv.p2) * (1 + 0.1 * S2.lv.m1); }
  function bal() { try { return Number(W.state.balance) || 0; } catch (e) { return 0; } }
  function addBal(x) { try { W.state.balance += x; if (typeof W.state.lifetime === "number") W.state.lifetime += x; } catch (e) {} }

  /* ---------- Klick des Spiels ausloesen ---------- */
  function visibleSize(e) { var r = e.getBoundingClientRect(); return r.width * r.height; }
  function findEl() {
    if (S2.el && S2.el.isConnected) return S2.el;
    var ids = ["mine-btn", "click-btn", "tap-btn", "mine", "click", "btn-mine", "hash-btn", "coin", "coin-btn", "main-btn", "btc", "bitcoin", "bitcoin-btn", "mine-button", "click-button", "clicker", "miner"], e = null;
    for (var i = 0; i < ids.length && !e; i++) e = document.getElementById(ids[i]);
    if (!e) {
      var best = null, bs = 0, all = document.querySelectorAll("button,[role=button],img,svg,canvas,div");
      for (var j = 0; j < all.length; j++) {
        var x = all[j]; if (x.closest("#nx-world,#hp-next-bar,#ord-ov,#farm-overlay,#s3-ov,#ps-overlay,#nx-back")) continue;
        var tag = (x.id || "") + " " + (typeof x.className === "string" ? x.className : "");
        if (!/mine|click|tap|coin|btc|hash|bitcoin/i.test(tag)) continue;
        if (/overlay|modal|shop|menu|upgrade|panel|stat|bar|toast|label/i.test(tag) && !/mine-?btn|click-?btn|tap-?btn/i.test(tag)) continue;
        var s = visibleSize(x); if (s > bs) { bs = s; best = x; }
      }
      e = best;
    }
    S2.el = e; return e;
  }
  function fire(el, mode) {
    if (mode === 0) { el.click(); return; }
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(function (t) {
      var ev, o = { bubbles: true, cancelable: true, clientX: cx, clientY: cy, view: W };
      try { ev = t.indexOf("pointer") === 0 ? new PointerEvent(t, { bubbles: true, cancelable: true, clientX: cx, clientY: cy, pointerType: "mouse", isPrimary: true }) : new MouseEvent(t, o); } catch (e) { return; }
      el.dispatchEvent(ev);
    });
  }
  function gameClick() {                      // -> gewonnene Sats vom Spiel (0 wenn nicht moeglich)
    var el = findEl(); if (!el || S2.fails > 4) return 0;
    var b0 = bal(), d = 0;
    if (S2.mode >= 0) { fire(el, S2.mode); d = bal() - b0; }
    else {
      fire(el, 0); d = bal() - b0; if (d > 0) S2.mode = 0;
      else { fire(el, 1); d = bal() - b0; if (d > 0) S2.mode = 1; }
    }
    if (d > 0) { S2.fails = 0; S2.P = S2.P ? S2.P * 0.8 + d * 0.2 : d; } else S2.fails++;
    return d > 0 ? d : 0;
  }

  /* ---------- Szene ---------- */
  var S = null, D = null, grp = null, scrTex = null, scrCtx = null, buzMesh = null, floatEl = null, panel = null, builtSig = "";
  var TBL = [-3.3, -1.3, -1.0, -0.1], RACK = [-4.4, -3.7, 0.5, 2.4];
  function mat(c, o) { var p = { color: c, roughness: 0.7, metalness: 0.2 }; if (o) for (var k in o) p[k] = o[k]; return new THREE.MeshStandardMaterial(p); }
  function glow(c) { return new THREE.MeshBasicMaterial({ color: c }); }
  function box(w, h, d, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, m, x, y, z, seg) { var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m); o.position.set(x || 0, y || 0, z || 0); return o; }
  var TIERS = [{ c: 0xd32f2f, e: 0x000000, m: 0.1 }, { c: 0xff7a1a, e: 0x331100, m: 0.2 }, { c: 0xcfd8dc, e: 0x000000, m: 0.9 }, { c: 0xffc107, e: 0x553a00, m: 0.9 }, { c: 0x40e0ff, e: 0x0a6a88, m: 0.5 }, { c: 0xff40d0, e: 0x88106a, m: 0.5 }];
  function scrTexMake() {
    var c = document.createElement("canvas"); c.width = 768; c.height = 432; scrCtx = c.getContext("2d"); scrTex = new THREE.CanvasTexture(c); drawScreen(true);
  }
  function drawScreen() {
    var g = scrCtx; if (!g) return; var w = 768, h = 432;
    g.fillStyle = "#07101c"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#0e2236"; g.fillRect(0, 0, w, 64); g.fillStyle = "#f7931a"; g.font = "bold 34px monospace"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("₿ HASHPOOL MINER", 22, 34);
    g.fillStyle = "#78d505"; g.textAlign = "right"; g.font = "bold 26px monospace"; g.fillText("● ONLINE", w - 22, 34);
    g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = "bold 92px monospace"; g.fillText(fmtN(bal()), w / 2, 160);
    g.fillStyle = "#6aa8ff"; g.font = "bold 28px monospace"; g.fillText("SATS", w / 2, 222);
    g.textAlign = "left"; g.fillStyle = "#cfd8dc"; g.font = "bold 28px monospace";
    g.fillText("▸ " + T("Klick", "Click") + ": +" + fmtN(Pn() + clickBonus()), 40, 290); g.fillText("▸ " + T("Passiv", "Passive") + ": " + fmtN(passRate()) + "/s", 40, 336); g.fillText("▸ " + T("Klicks", "Clicks") + ": " + S2.clicks, 40, 382);
    g.strokeStyle = "#1d4466"; g.lineWidth = 3; g.beginPath(); var base = 370; for (var i = 0; i < 24; i++) { var x = 430 + i * 14, y = base - (Math.sin(i * 0.5 + (Date.now() / 800)) * 14 + i * 3.2 + S2.lv.p1 * 4); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    scrTex.needsUpdate = true;
  }
  function stationAdd(id, x, y, z, w, h, d, label, sx, sz, action) {
    var hb = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); hb.position.set(x, y, z); hb.userData.st = id; S.scene.add(hb); S.hits.push(hb);
    var el = document.createElement("div"); el.className = "nx-lbl"; el.textContent = label; S.stage.appendChild(el);
    var st = { id: id, sx: sx, sz: sz, tx: x, tz: z, action: action, lx: x, ly: y + h / 2 + 0.15, lz: z, label: label, el: el }; S.stations[id] = st;
    el.addEventListener("click", function (e) { e.stopPropagation(); var pts = []; if ((S.pz > -1.3) !== (sz > -1.3)) { var a = S.pz > -1.3; pts.push(a ? [0, -0.4] : [0, -2.2]); pts.push(a ? [0, -2.2] : [0, -0.4]); } pts.push([sx, sz]); S.auto = { pts: pts, i: 0, id: id, face: [x, z] }; });
  }
  function build() {
    if (grp) { S.scene.remove(grp); } grp = new THREE.Group(); S.scene.add(grp); S2.leds = []; S2.interns = [];
    var lv = S2.lv, wood = mat(0x4a3526, { roughness: 0.6, metalness: 0.05 });
    // Tisch
    grp.add(box(2.0, 0.1, 0.9, mat(0x6e5740, { metalness: 0.05 }), -2.3, 0.95, -0.55)); [[-3.25, -0.95], [-1.35, -0.95], [-3.25, -0.15], [-1.35, -0.15]].forEach(function (p) { grp.add(box(0.08, 0.95, 0.08, wood, p[0] + 0.05, 0.47, p[1] + 0.05)); });
    // Buzzer (Stufe aus a1)
    var t = TIERS[Math.min(lv.a1, TIERS.length - 1)], sc = 1 + 0.07 * lv.a1;
    grp.add(cyl(0.24 * sc, 0.26 * sc, 0.09, mat(0x1d2230, { metalness: 0.6 }), -2.3, 1.05, -0.55));
    if (lv.a1 >= 2) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.235 * sc, 0.02, 8, 28), mat(t.c, { metalness: 0.95, roughness: 0.2 })); ring.rotation.x = Math.PI / 2; ring.position.set(-2.3, 1.1, -0.55); grp.add(ring); }
    buzMesh = cyl(0.18 * sc, 0.19 * sc, 0.1, mat(t.c, { metalness: t.m, roughness: 0.35, emissive: t.e, emissiveIntensity: 0.9 }), -2.3, 1.16, -0.55); grp.add(buzMesh);
    // Zusatz-Buzzer (a2)
    var ex = [[-3.0, -0.35], [-1.6, -0.35], [-3.0, -0.75]];
    for (var i = 0; i < lv.a2; i++) { grp.add(cyl(0.11, 0.12, 0.05, mat(0x1d2230, { metalness: 0.6 }), ex[i][0], 1.02, ex[i][1])); grp.add(cyl(0.085, 0.09, 0.06, mat(TIERS[(i + 1) % TIERS.length].c, { metalness: 0.5, emissive: TIERS[(i + 1) % TIERS.length].e }), ex[i][0], 1.08, ex[i][1])); }
    // Tablet (Upgrades)
    grp.add(box(0.5, 0.03, 0.34, mat(0x20262f, { metalness: 0.6 }), -1.55, 1.01, -0.4)); var tb = box(0.46, 0.02, 0.3, new THREE.MeshBasicMaterial({ map: tabTex() }), -1.55, 1.035, -0.4); grp.add(tb);
    // Wand-Bildschirme
    var wz = -1.19; grp.add(box(2.5, 1.45, 0.05, mat(0x0b0f16, { metalness: 0.6 }), -2.3, 2.0, wz)); var sp = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshBasicMaterial({ map: scrTex })); sp.position.set(-2.3, 2.0, wz + 0.03); grp.add(sp);
    if (lv.m1 >= 1) { grp.add(box(2.5, 0.34, 0.05, mat(0x0b0f16), -2.3, 3.0, wz)); grp.add(box(2.4, 0.26, 0.01, new THREE.MeshBasicMaterial({ map: tickerTex() }), -2.3, 3.0, wz + 0.03)); }
    if (lv.m1 >= 2) { grp.add(box(0.8, 1.0, 0.05, mat(0x0b0f16), -3.95, 2.0, wz)); grp.add(box(0.74, 0.94, 0.01, new THREE.MeshBasicMaterial({ map: chartTex() }), -3.95, 2.0, wz + 0.03)); }
    if (lv.m1 >= 3) { [[-2.3, 1.2, 2.5, 0.04], [-2.3, 2.76, 2.5, 0.04]].forEach(function (p) { grp.add(box(p[2], p[3], 0.03, glow(0x40e0ff), p[0], p[1], wz + 0.04)); }); grp.add(box(0.04, 1.6, 0.03, glow(0x40e0ff), -3.56, 1.98, wz + 0.04)); grp.add(box(0.04, 1.6, 0.03, glow(0x40e0ff), -1.04, 1.98, wz + 0.04)); }
    // Mini-Rigs (Regal an der linken Wand)
    if (lv.p2 > 0) {
      grp.add(box(0.5, 1.7, 1.7, mat(0x151a22, { metalness: 0.5 }), -4.1, 0.9, 1.45));
      for (var r = 0; r < lv.p2; r++) {
        var row = Math.floor(r / 2), col = r % 2, y = 0.38 + row * 0.5, z = 1.05 + col * 0.8;
        grp.add(box(0.34, 0.36, 0.66, mat(0x2b3140, { metalness: 0.5 }), -3.84, y, z)); var led = box(0.02, 0.06, 0.5, glow(0x78d505), -3.66, y + 0.08, z); grp.add(led); S2.leds.push(led);
        grp.add(box(0.02, 0.2, 0.4, glow(0x101820), -3.66, y - 0.05, z));
      }
    }
    // Praktikanten (p1): sichtbar max 3
    var n = Math.min(3, lv.p1), pos = [[-3.75, -0.7], [-3.75, 0.0], [-3.75, 0.65]];
    for (var k = 0; k < n; k++) {
      if (!S2.specs[k] && D && D.randomSpec) S2.specs[k] = D.randomSpec({ hair: ["short", "curly", "ponytail"][k], glasses: k === 1 });
      if (!D || !D.makeChar || !S2.specs[k]) continue;
      var ch = D.makeChar(S2.specs[k]); ch.g.position.set(pos[k][0], 0.12, pos[k][1]); ch.g.rotation.y = Math.PI / 2; ch.g.scale.setScalar(0.95); grp.add(ch.g);
      grp.add(box(0.4, 0.5, 0.4, mat(0x39414f), pos[k][0] + 0.6, 0.37, pos[k][1])); grp.add(cyl(0.1, 0.11, 0.06, mat(TIERS[k % TIERS.length].c, { emissive: TIERS[k % TIERS.length].e }), pos[k][0] + 0.6, 0.65, pos[k][1]));
      S2.interns.push({ ch: ch, ph: k * 1.3 });
    }
    builtSig = JSON.stringify(lv);
  }
  function tabTex() { var c = document.createElement("canvas"); c.width = 256; c.height = 160; var g = c.getContext("2d"); g.fillStyle = "#0a1830"; g.fillRect(0, 0, 256, 160); g.fillStyle = "#78d505"; g.font = "bold 34px sans-serif"; g.textAlign = "center"; g.fillText("⬆ UPGRADES", 128, 60); g.fillStyle = "#6aa8ff"; g.font = "24px sans-serif"; g.fillText("tippen", 128, 112); return new THREE.CanvasTexture(c); }
  function tickerTex() { var c = document.createElement("canvas"); c.width = 768; c.height = 80; var g = c.getContext("2d"); g.fillStyle = "#05080d"; g.fillRect(0, 0, 768, 80); g.fillStyle = "#4fe38a"; g.font = "bold 40px monospace"; g.textBaseline = "middle"; g.fillText("BTC ▲ 98.4k   ETH ▲ 4.1k   SATS ▲ HODL   HASHPOOL ▲", 12, 42); return new THREE.CanvasTexture(c); }
  function chartTex() { var c = document.createElement("canvas"); c.width = 256; c.height = 340; var g = c.getContext("2d"); g.fillStyle = "#05080d"; g.fillRect(0, 0, 256, 340); g.strokeStyle = "#f7931a"; g.lineWidth = 4; g.beginPath(); for (var i = 0; i < 20; i++) { var x = 10 + i * 12, y = 300 - i * 9 - Math.sin(i) * 20; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); g.fillStyle = "#cfd8dc"; g.font = "bold 30px monospace"; g.fillText("HASH", 12, 40); return new THREE.CanvasTexture(c); }

  /* ---------- Bedienung ---------- */
  var actx = null;
  function beep(f) { try { actx = actx || new (W.AudioContext || W.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = "square"; g.gain.value = 0.04; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.06); } catch (e) {} }
  function floatText(txt) {
    if (!S || !S.cam) return; var v = new THREE.Vector3(-2.3 + (Math.random() - 0.5) * 0.4, 1.5, -0.55); v.project(S.cam); if (v.z > 1) return;
    var w = S.stage.clientWidth, h = S.stage.clientHeight, d = document.createElement("div"); d.className = "nx-float"; d.textContent = txt; d.style.left = ((v.x * 0.5 + 0.5) * w) + "px"; d.style.top = ((-v.y * 0.5 + 0.5) * h) + "px"; S.stage.appendChild(d);
    requestAnimationFrame(function () { d.style.transform = "translate(-50%,-90px)"; d.style.opacity = "0"; }); setTimeout(function () { try { d.remove(); } catch (e) {} }, 800);
  }
  function press() {
    var d = gameClick(), gained = d;
    if (d <= 0) { gained = Pn() > 0.02 ? Pn() : 1; addBal(gained); if (!S2.P) S2.P = 1; }
    var b = clickBonus(); if (b > 0) { addBal(b); gained += b; }
    S2.clicks++; S2.sess++; S2.pressT = 0.12; beep(300 + Math.min(500, S2.lv.a1 * 60 + (S2.clicks % 5) * 40)); floatText("+" + fmtN(gained)); if (S2.clicks % 20 === 0) save();
  }
  function openUpg() {
    css(); if (!panel) {
      panel = document.createElement("div"); panel.id = "nx-upg"; S.stage.appendChild(panel);
      panel.addEventListener("click", function (e) { var t = e.target, b = t.getAttribute && t.getAttribute("data-buy"); if (b) { buy(b); return; } if (t.getAttribute && t.getAttribute("data-x")) closeUpg(); });
    }
    renderUpg(); panel.classList.add("show"); S.invOpen = true; S.joy.x = 0; S.joy.y = 0;
  }
  function closeUpg() { if (panel) panel.classList.remove("show"); S.invOpen = false; }
  function renderUpg() {
    var h = "<h4>⬆️ " + T("Upgrades", "Upgrades") + "</h4><p class='nx-sub'>💰 " + fmtN(bal()) + " sats · " + T("Klick", "Click") + " +" + fmtN(Pn() + clickBonus()) + " · " + T("Passiv", "Passive") + " " + fmtN(passRate()) + "/s</p>";
    UPG.forEach(function (u) {
      var l = S2.lv[u.id], maxed = l >= u.max, c = cost(u), can = !maxed && bal() >= c, t = de() ? u.de : u.en, pips = ""; for (var i = 0; i < u.max; i++) pips += i < l ? "●" : "○";
      h += '<div class="nx-up"><div><b>' + (u.kind === "A" ? "👆 " : "⏱ ") + t[0] + "</b> <span class='nx-pip'>" + pips + "</span><br><small>" + t[1] + "</small></div>" +
        (maxed ? '<span class="nx-max">MAX</span>' : '<button type="button" data-buy="' + u.id + '"' + (can ? "" : " disabled") + ">" + fmtN(c) + "</button>") + "</div>";
    });
    h += '<div class="nx-bt"><button type="button" data-x="1">' + T("Schließen", "Close") + "</button></div>"; panel.innerHTML = h;
  }
  function buy(id) {
    var u = null; UPG.forEach(function (x) { if (x.id === id) u = x; }); if (!u) return; var l = S2.lv[id]; if (l >= u.max) return; var c = cost(u); if (bal() < c) return;
    addBal(-c); try { W.state.lifetime -= c; } catch (e) {} S2.lv[id] = l + 1; save(); build(); renderUpg(); beep(660); toast("✔ " + (de() ? u.de[0] : u.en[0]) + " " + (l + 1));
  }
  function toast(m) { var d = document.createElement("div"); d.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 56px);z-index:100002;background:#12161c;border:1px solid #f7931a;color:#e7e9ec;border-radius:12px;padding:10px 14px;font:700 13px monospace;text-align:center"; d.textContent = m; document.body.appendChild(d); setTimeout(function () { try { d.remove(); } catch (e) {} }, 2600); }
  function css() {
    if (document.getElementById("nx-clk-style")) return; var s = document.createElement("style"); s.id = "nx-clk-style";
    s.textContent = ".nx-float{position:absolute;transform:translate(-50%,0);color:#ffd36a;font:700 20px monospace;text-shadow:0 1px 4px #000;pointer-events:none;transition:transform .75s ease-out,opacity .75s;z-index:4}" +
      "#nx-upg{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);background:#12161c;border:1px solid #f7931a;border-radius:16px;padding:12px 14px;color:#e7e9ec;font:13px sans-serif;display:none;z-index:6;max-height:74%;overflow:auto;box-shadow:0 8px 30px #000a}#nx-upg.show{display:block}" +
      "#nx-upg h4{margin:0 0 4px;font-size:15px}.nx-sub{margin:0 0 8px;color:#aeb6c2;font-size:12px}.nx-up{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #222a36;padding:8px 0}.nx-up small{color:#aeb6c2}.nx-pip{color:#f7931a;letter-spacing:1px}" +
      ".nx-up button{font:700 12px monospace;padding:9px 12px;border-radius:9px;border:1px solid #f7931a;background:#f7931a;color:#1a1206;min-width:84px}.nx-up button[disabled]{opacity:.35;background:#161c24;color:#e7e9ec;border-color:#2c3646}.nx-max{color:#78d505;font-weight:700}" +
      "#nx-upg .nx-bt{display:flex;margin-top:10px}#nx-upg .nx-bt button{flex:1;font:700 13px sans-serif;padding:11px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec}";
    document.head.appendChild(s);
  }
  function pushOut(r) {                                    // einfache Kollision fuer Tisch + Rig-Regal (world.js kennt sie nicht)
    var R = 0.3, x = S.px, z = S.pz; if (x > r[0] - R && x < r[1] + R && z > r[2] - R && z < r[3] + R) {
      var dl = x - (r[0] - R), dr = (r[1] + R) - x, dt = z - (r[2] - R), db = (r[3] + R) - z, m = Math.min(dl, dr, dt, db);
      if (m === dl) S.px = r[0] - R; else if (m === dr) S.px = r[1] + R; else if (m === dt) S.pz = r[2] - R; else S.pz = r[3] + R;
    }
  }
  var t0 = 0, acc = 0;
  function loop(ts) {
    requestAnimationFrame(loop); if (!S || !S.ready) return; var dt = Math.min(0.05, ((ts || 0) - t0) / 1000 || 0.016); t0 = ts || 0;
    pushOut(TBL); if (S2.lv.p2 > 0) pushOut(RACK);
    if (!S.shown || S.hiddenByOverlay) return;
    if (buzMesh) { S2.pressT = Math.max(0, S2.pressT - dt); buzMesh.position.y = 1.16 - (S2.pressT > 0 ? 0.045 : 0); }
    var now = Date.now() / 1000; S2.leds.forEach(function (l, i) { l.material.color.setHex(Math.sin(now * 5 + i * 1.7) > 0 ? 0x78d505 : 0x2a6a10); });
    S2.interns.forEach(function (it) { it.ph += dt * 6; var ch = it.ch; ch.armR.rotation.x = -1.0 + Math.sin(it.ph) * 0.45; ch.armL.rotation.x = -0.1; ch.head.rotation.y = 0.2; });
    acc += dt; if (acc > 0.3) { acc = 0; drawScreen(); if (panel && panel.classList.contains("show")) renderUpg(); }
  }
  function init() {
    S = W.Parts3D.nextWorld.S; D = W.Parts3D.shop && W.Parts3D.shop._dbg; load(); css(); scrTexMake(); build();
    stationAdd("buzzer", -2.3, 1.15, -0.55, 0.9, 0.5, 0.9, "🔴 Buzzer", -2.3, 0.5, press);
    stationAdd("upg", -1.55, 1.1, -0.4, 0.6, 0.3, 0.45, "⬆️ " + T("Upgrades", "Upgrades"), -1.5, 0.5, openUpg);
    // Offline-Gewinn (max. 2 h)
    var sec = Math.min(7200, Math.max(0, (Date.now() - S2.last) / 1000)), rate = passRate(); if (rate > 0 && sec > 60) { var g = rate * sec; addBal(g); toast(T("Während du weg warst: +", "While you were away: +") + fmtN(g) + " sats"); }
    S2.last = Date.now(); save();
    setInterval(function () { var r = passRate(); if (r > 0) addBal(r); S2.last = Date.now(); if (Math.random() < 0.1) save(); }, 1000);
    requestAnimationFrame(loop);
    W.Parts3D.clicker = { press: press, state: S2, upgrades: UPG, open: openUpg };
    console.log("[HASHPOOL NEXT] clicker bereit");
  }
  var n = 0, iv = setInterval(function () { n++; try { if (W.Parts3D && W.Parts3D.nextWorld && W.Parts3D.nextWorld.S.ready && W.state && typeof THREE !== "undefined") { clearInterval(iv); init(); } } catch (e) { console.warn("[clicker]", e); } if (n > 400) clearInterval(iv); }, 500);
})();

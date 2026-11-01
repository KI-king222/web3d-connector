/* orders.js — B1 Auftragssystem (additiv, braucht Parts3D.farm; nutzt Parts3D.power wenn vorhanden)
 * Button "📋 Aufträge": 8 Kundenaufträge, 1 aktiv. Annehmen -> PC bauen -> in Farm stellen -> dort abgeben.
 * Belohnung = Anteil der Teilekosten (moderat, additiv zum normalen Verkauf). Kill-Switch: ?noorders=1
 * Speichern: state.orders {active, done:{id:n}, cycle} + localStorage hashpool-orders-v1 + HashpoolSave-Payload.
 */
(function () {
  var W = window;
  if (W.__orders) return; W.__orders = true;
  if (/[?&]noorders(=|&|$)/.test(String(W.location && W.location.search))) return;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  function T(a, b) { return de() ? a : b; }
  function fmt(n) { n = Math.round(n); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  /* ---------- Katalog / Kosten ---------- */
  function catalog() { try { return W.PART_CATALOG || (typeof PART_CATALOG !== "undefined" ? PART_CATALOG : null); } catch (e) { return null; } }
  function item(id) {
    var c = catalog(); if (!c || !id) return null;
    for (var k in c) { var a = c[k].items || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; }
    return null;
  }
  function one(v) { return [].concat(v || [])[0]; }
  function costOf(ids) {
    var t = 0; ["case", "mobo", "cpu", "cooler", "ram", "gpu", "psu", "ssd"].forEach(function (k) { var it = item(one(ids[k])); if (it) t += it.cost || 0; });
    return t;
  }
  function calcOf(ids) {
    try { var P = W.Parts3D && Parts3D.power; if (!P) return null; var r = P.calc(ids); return { r: r, verdict: P.verdict(r), score: P.score(ids, r) }; } catch (e) { return null; }
  }

  /* ---------- Aufträge ---------- */
  var ORDERS = [
    { id: "o1", mult: 0.30, de: ["Starter-PC für die Schule", "Ein günstiger, stabiler Rechner. Nicht teuer, nur zuverlässig."], en: ["Starter PC for school", "A cheap, stable machine. Not fancy, just reliable."],
      req: [{ k: "cost", max: 6000 }, { k: "stable" }] },
    { id: "o2", mult: 0.35, de: ["Sparfuchs-Rig", "Der Kunde hat nur 4.000 sats. Bau etwas, das trotzdem läuft."], en: ["Budget rig", "The client only has 4,000 sats. Build something that still runs."],
      req: [{ k: "cost", max: 4000 }, { k: "stable" }] },
    { id: "o3", mult: 0.35, de: ["Flüster-PC", "Leise und kühl: CPU höchstens 65 °C, GPU höchstens 70 °C.", ], en: ["Whisper PC", "Quiet and cool: CPU at most 65 °C, GPU at most 70 °C."],
      req: [{ k: "cpuT", max: 65 }, { k: "gpuT", max: 70 }, { k: "stable" }] },
    { id: "o4", mult: 0.35, de: ["Stromspar-Kunde", "Der Strompreis nervt: höchstens 300 W Last.", ], en: ["Power saver", "Electricity is expensive: at most 300 W load."],
      req: [{ k: "load", max: 300 }, { k: "stable" }] },
    { id: "o5", mult: 0.30, de: ["Zocker-Rig", "Mindestens Score 1400, aber nicht über 20.000 sats Teilekosten.", ], en: ["Gamer rig", "At least score 1400, but no more than 20,000 sats in parts."],
      req: [{ k: "score", min: 1400 }, { k: "cost", max: 20000 }, { k: "stable" }] },
    { id: "o6", mult: 0.30, de: ["Kühl & stark", "Score ab 1800 und trotzdem CPU höchstens 75 °C, GPU höchstens 80 °C.", ], en: ["Cool & strong", "Score 1800+ yet CPU at most 75 °C, GPU at most 80 °C."],
      req: [{ k: "score", min: 1800 }, { k: "cpuT", max: 75 }, { k: "gpuT", max: 80 }, { k: "stable" }] },
    { id: "o7", mult: 0.28, de: ["Mining-Monster", "Score ab 2200, ohne Drosselung. Für den Dauerbetrieb.", ], en: ["Mining monster", "Score 2200+, no throttling. Built for 24/7."],
      req: [{ k: "score", min: 2200 }, { k: "stable" }] },
    { id: "o8", mult: 0.25, de: ["Prestige-Auftrag", "Das Beste vom Besten: Teile für mindestens 40.000 sats, Score ab 2500, stabil.", ], en: ["Prestige order", "The best of the best: parts worth 40,000+ sats, score 2500+, stable."],
      req: [{ k: "cost", min: 40000 }, { k: "score", min: 2500 }, { k: "stable" }] }
  ];
  function reqLabel(q) {
    switch (q.k) {
      case "cost": return q.max ? T("Teilekosten ≤ ", "Parts cost ≤ ") + fmt(q.max) : T("Teilekosten ≥ ", "Parts cost ≥ ") + fmt(q.min);
      case "load": return T("Last ≤ ", "Load ≤ ") + q.max + " W";
      case "cpuT": return "CPU ≤ " + q.max + " °C";
      case "gpuT": return "GPU ≤ " + q.max + " °C";
      case "score": return "Score ≥ " + q.min;
      case "stable": return T("Stabil (keine Drosselung/Crash)", "Stable (no throttle/crash)");
    }
    return q.k;
  }
  function reqValue(q, ids, c) {                                    // -> {ok, val}  (ok=null: nicht prüfbar)
    if (q.k === "cost") { var co = costOf(ids); return { ok: q.max ? co <= q.max : co >= q.min, val: fmt(co) }; }
    if (!c) return { ok: null, val: "?" };
    var r = c.r;
    switch (q.k) {
      case "load": return { ok: r.load <= q.max, val: Math.round(r.load) + " W" };
      case "cpuT": return { ok: r.cpuT <= q.max, val: Math.round(r.cpuT) + " °C" };
      case "gpuT": return { ok: r.gpuT <= q.max, val: Math.round(r.gpuT) + " °C" };
      case "score": return { ok: c.score >= q.min, val: String(c.score) };
      case "stable": return { ok: c.verdict === "ok", val: c.verdict === "ok" ? "OK" : (c.verdict === "crash" ? "Crash" : "Throttle") };
    }
    return { ok: null, val: "?" };
  }
  function evalRig(o, ids) {
    var c = calcOf(ids), rows = [], all = true;
    o.req.forEach(function (q) { var v = reqValue(q, ids, c); rows.push({ q: q, ok: v.ok, val: v.val }); if (v.ok !== true) all = false; });
    return { rows: rows, ok: all, cost: costOf(ids) };
  }
  function orderById(id) { for (var i = 0; i < ORDERS.length; i++) if (ORDERS[i].id === id) return ORDERS[i]; return null; }

  /* ---------- State / Persistenz ---------- */
  var KEY = "hashpool-orders-v1";
  function ukey() { try { var u = W.state && (W.state.user || W.state.username || W.state.account); return KEY + (u ? ":" + u : ""); } catch (e) { return KEY; } }
  function O() {
    try {
      if (!W.state) return { active: null, done: {}, cycle: 0 };
      if (!W.state.orders || typeof W.state.orders !== "object") W.state.orders = { active: null, done: {}, cycle: 0 };
      var o = W.state.orders; if (!o.done) o.done = {}; if (!o.cycle) o.cycle = 0; return o;
    } catch (e) { return { active: null, done: {}, cycle: 0 }; }
  }
  var loaded = false;
  function readLocal() {
    if (loaded) return; loaded = true;
    try {
      var s = JSON.parse(localStorage.getItem(ukey()) || "null"), o = O();
      if (s && typeof s === "object" && !o.active && !Object.keys(o.done).length && !o.cycle) { o.active = s.active || null; o.done = s.done || {}; o.cycle = s.cycle || 0; }
    } catch (e) {}
  }
  function persist() {
    try { localStorage.setItem(ukey(), JSON.stringify(O())); } catch (e) {}
    try { if (typeof W.save === "function") W.save(); } catch (e) {}
  }
  function hookPayload() {
    var H = W.HashpoolSave; if (!H) return false; if (H._orders) return true;
    var g = H.getPayload, a = H.applyPayload;
    if (typeof g !== "function" || typeof a !== "function") return false;
    H.getPayload = function () { var p = g.apply(this, arguments); if (p) { try { p.orders = O(); } catch (e) {} } return p; };
    H.applyPayload = function (saved) {
      var ok = a.apply(this, arguments);
      try { if (saved && saved.orders && typeof saved.orders === "object") { W.state.orders = { active: saved.orders.active || null, done: saved.orders.done || {}, cycle: saved.orders.cycle || 0 }; persist(); } } catch (e) {}
      return ok;
    };
    H._orders = true; return true;
  }

  /* ---------- UI ---------- */
  var btn = null, ov = null;
  function css() {
    if (document.getElementById("ord-style")) return;
    var s = document.createElement("style"); s.id = "ord-style";
    s.textContent =
      ".ord-fab{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 64px);z-index:9000;padding:10px 14px;border-radius:12px;border:1px solid #f7931a;background:#12161c;color:#f7931a;font-weight:700}" +
      "#ord-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);display:none;align-items:flex-end;justify-content:center}#ord-ov.show{display:flex}" +
      ".ord-card{width:100%;max-width:560px;max-height:88vh;overflow:auto;background:#12161c;color:#e7e9ec;border:1px solid #2c3646;border-radius:16px 16px 0 0;padding:14px 14px calc(env(safe-area-inset-bottom,0px) + 14px);font-size:13px;-webkit-overflow-scrolling:touch}" +
      ".ord-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.ord-hd b{font-size:16px}.ord-x{background:none;border:0;color:#e7e9ec;font-size:22px;padding:4px 10px;cursor:pointer}" +
      ".ord-i{border:1px solid #2c3646;border-radius:12px;padding:10px 12px;margin:8px 0;background:#161c24}.ord-i.act{border-color:#f7931a}.ord-i.done{opacity:.55}" +
      ".ord-i h4{margin:0 0 4px;font-size:14px}.ord-i p{margin:0 0 6px;color:#aeb6c2}.ord-rq{margin:2px 0;font-size:12px}.ord-rw{color:#f7931a;font-weight:700;margin-top:6px}" +
      ".ord-b{font:700 12px inherit;padding:9px 12px;border-radius:9px;cursor:pointer;border:1px solid #2c3646;background:#161c24;color:#e7e9ec;margin:6px 6px 0 0}.ord-b.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}.ord-b[disabled]{opacity:.4}" +
      ".ord-rig{border-top:1px dashed #2c3646;margin-top:8px;padding-top:6px}.ord-ok{color:#4fd37a}.ord-no{color:#ff7a6b}.ord-un{color:#aeb6c2}";
    document.head.appendChild(s);
  }
  function placeBtn() {
    if (btn) return true; if (!document.body) return false; css();
    var ref = document.getElementById("farm-open-btn") || document.getElementById("ps-open-btn");
    btn = document.createElement("button"); btn.type = "button"; btn.id = "ord-open-btn";
    btn.className = ref ? ref.className : "ord-fab";
    if (ref && ref.parentNode) ref.parentNode.insertBefore(btn, ref.nextSibling); else { btn.className = "ord-fab"; document.body.appendChild(btn); }
    btn.addEventListener("click", open); updBtn(); return true;
  }
  function updBtn() {
    if (!btn) return; var o = O(), n = 0; for (var k in o.done) n += o.done[k] ? 1 : 0;
    btn.textContent = "📋 " + T("Aufträge", "Orders") + " (" + n + "/" + ORDERS.length + ")" + (o.active ? " ●" : "");
  }
  function rewardOf(o, ids) { var cyc = Math.min(2, 1 + 0.25 * (O().cycle || 0)); return Math.max(50, Math.round(costOf(ids) * o.mult * cyc)); }
  function approxReward(o) { var cyc = Math.min(2, 1 + 0.25 * (O().cycle || 0)); return o.mult * cyc; }
  function farmRigs() { try { return (Parts3D.farm && Parts3D.farm.slots()) || []; } catch (e) { return []; } }
  function render() {
    if (!ov) return; readLocal();
    var s = O(), h = '<div class="ord-card"><div class="ord-hd"><b>📋 ' + T("Aufträge", "Orders") + '</b><button class="ord-x" id="ord-x" type="button">✕</button></div>' +
      '<p style="margin:0 0 6px;color:#aeb6c2">' + T("Nimm einen Auftrag an, baue einen passenden PC, stelle ihn in die Farm und gib ihn hier ab. Die Belohnung kommt zum normalen Verkaufserlös dazu.",
        "Accept an order, build a matching PC, place it in your farm and hand it in here. The reward comes on top of the normal sale.") + "</p>";
    var noPower = !(W.Parts3D && Parts3D.power);
    if (noPower) h += '<p class="ord-no">' + T("Hinweis: Power-/Temp-Modul nicht geladen, Watt/Temp/Score-Ziele sind nicht prüfbar.", "Note: power/temp module not loaded; watt/temp/score goals can't be checked.") + "</p>";
    ORDERS.forEach(function (o) {
      var done = s.done[o.id], act = s.active === o.id, t = de() ? o.de : o.en;
      h += '<div class="ord-i' + (act ? " act" : "") + (done ? " done" : "") + '"><h4>' + (done ? "✓ " : "") + t[0] + "</h4><p>" + t[1] + "</p>";
      o.req.forEach(function (q) { h += '<div class="ord-rq">• ' + reqLabel(q) + "</div>"; });
      h += '<div class="ord-rw">' + T("Belohnung: ", "Reward: ") + Math.round(approxReward(o) * 100) + "% " + T("der Teilekosten", "of parts cost") + "</div>";
      if (act) {
        h += '<div class="ord-rig"><b>' + T("Deine Farm-Rigs", "Your farm rigs") + "</b>";
        var rigs = farmRigs();
        if (!rigs.length) h += '<div class="ord-un">' + T("Noch kein Rig in der Farm. Bauen, dann „In Farm stellen“.", "No rig in your farm yet. Build one, then “Place in farm”.") + "</div>";
        rigs.forEach(function (r) {
          var e = evalRig(o, r.partIds);
          h += '<div style="margin-top:6px"><b>' + r.name + "</b> · " + fmt(e.cost) + " sats";
          e.rows.forEach(function (x) { h += '<div class="ord-rq ' + (x.ok === true ? "ord-ok" : x.ok === false ? "ord-no" : "ord-un") + '">' + (x.ok === true ? "✓ " : x.ok === false ? "✗ " : "? ") + reqLabel(x.q) + " (" + x.val + ")</div>"; });
          h += '<button class="ord-b pri" type="button" data-deliver="' + r.id + '"' + (e.ok ? "" : " disabled") + ">" + T("Abgeben", "Hand in") + " (+" + fmt(rewardOf(o, r.partIds)) + " sats)</button></div>";
        });
        h += '</div><button class="ord-b" type="button" data-cancel="1">' + T("Auftrag abbrechen", "Cancel order") + "</button>";
      } else if (!done) {
        h += '<button class="ord-b pri" type="button" data-accept="' + o.id + '"' + (s.active ? " disabled" : "") + ">" + T("Annehmen", "Accept") + "</button>";
      }
      h += "</div>";
    });
    h += "</div>"; ov.innerHTML = h;
  }
  function open() {
    css(); if (!ov) {
      ov = document.createElement("div"); ov.id = "ord-ov"; document.body.appendChild(ov);
      ov.addEventListener("click", function (ev) {
        var t = ev.target; if (t === ov || (t.id === "ord-x")) { close(); return; }
        var a = t.getAttribute && t.getAttribute("data-accept"); if (a) { var o = O(); if (!o.active) { o.active = a; persist(); updBtn(); render(); } return; }
        if (t.getAttribute && t.getAttribute("data-cancel")) { O().active = null; persist(); updBtn(); render(); return; }
        var d = t.getAttribute && t.getAttribute("data-deliver"); if (d) deliver(d);
      });
    }
    render(); ov.classList.add("show");
    try { if (Parts3D.farm && Parts3D.farm.close) { /* Farm-Overlay nicht gleichzeitig offen lassen */ } } catch (e) {}
  }
  function close() { if (ov) ov.classList.remove("show"); }
  function deliver(rigId) {
    var s = O(), o = orderById(s.active); if (!o) return;
    var rig = null; farmRigs().forEach(function (r) { if (r.id === rigId) rig = r; }); if (!rig) return;
    var e = evalRig(o, rig.partIds); if (!e.ok) return;
    var rew = rewardOf(o, rig.partIds);
    try { W.state.balance += rew; W.state.lifetime += rew; } catch (x) {}
    s.done[o.id] = (s.done[o.id] || 0) + 1; s.active = null;
    var all = ORDERS.every(function (q) { return s.done[q.id]; });
    var msg = T("Auftrag erledigt! +", "Order complete! +") + fmt(rew) + " sats";
    if (all) { s.done = {}; s.cycle = (s.cycle || 0) + 1; msg += T(" · Alle Aufträge erledigt, neue Runde mit mehr Belohnung!", " · All orders done, new round with a bigger reward!"); }
    persist();
    try { if (Parts3D.farm && Parts3D.farm.remove) Parts3D.farm.remove(rig.id); } catch (x) {}   // speichert zusätzlich über Farm-Persist
    updBtn(); render(); toast(msg);
  }
  function toast(m) {
    var d = document.createElement("div");
    d.style.cssText = "position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);z-index:100001;background:#12161c;border:1px solid #f7931a;color:#e7e9ec;border-radius:12px;padding:12px 14px;font-weight:700;text-align:center";
    d.textContent = "📋 " + m; document.body.appendChild(d); setTimeout(function () { try { d.remove(); } catch (e) {} }, 4000);
  }

  var n = 0, h1 = false, h2 = false;
  var iv = setInterval(function () {
    n++;
    try { if (!h1) h1 = placeBtn(); if (!h2) h2 = hookPayload(); if (h1) { readLocal(); updBtn(); } } catch (e) { console.warn("[orders]", e); }
    if ((h1 && h2) || n > 160) clearInterval(iv);
  }, 250);
  setInterval(function () { try { if (!btn || !btn.isConnected) { btn = null; placeBtn(); } updBtn(); } catch (e) {} }, 2000);
  W.Parts3D = W.Parts3D || {};
  W.Parts3D.orders = { open: open, close: close, list: function () { return ORDERS; }, eval: evalRig, state: O };
  console.log("[HASHPOOL] orders bereit");
})();

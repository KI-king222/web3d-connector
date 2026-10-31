/* parts3d/powerTemp.js - A2 Power- & Temperatur-Regeln + A3 Start-Test/Benchmark (reine Anzeige/Warnung, keine Wirtschaft)
 *  - Last: Summe der Teile-Leistung (W) gegen Netzteil x 0.9  -> sonst Warnung/Drossel
 *  - Temperatur: CPU-/GPU-Temp aus Last, Kuehler-Kapazitaet und Gehaeuse-Airflow -> Throttle moeglich
 *  - Anzeige: Leiste im Teile-Picker ("PSU 650 W | Last 480 W" + Temp-Balken) und im Farm-PC-Fenster
 *  - API: Parts3D.power.calc(ids) -> { load, psu, limit, cpuT, gpuT, perf, status, msgs }
 *  - A3: nach dem Bau (nach Paste/Software) 12-s-Start-Test mit Lüfter-Anim, Ergebnis Stabil/Gedrosselt/Absturz, Skip-Button. Aus: ?nobench=1
 *    Zusaetzlich: Fallback, wenn Paste/Software uebersprungen wurden (Start beim Wechsel bootPlayed false->true) und Button "Start-Test ansehen" in Picker/Farm
 *    Pro Rig nur EIN automatischer Test (Hook und Fallback teilen sich das Flag benchRan; Reset nach Verkauf = bootPlayed true->false)
 * Werte sind Spielwerte aus Stufe/Typ der Teile. Aus: ?nopower=1. DE/EN ueber state.lang.
 */
(function () {
  var W = window;
  if (W.__powerTemp) return; W.__powerTemp = true;
  if (/[?&]nopower(=|&|$)/.test(String(W.location && W.location.search))) return;
  if (typeof document === "undefined") return;

  var CPU = [35, 45, 65, 65, 90, 95, 125, 140, 180, 170];
  var GPU = [30, 50, 75, 120, 170, 170, 200, 285, 320, 450];
  var RAM = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var SSD = [3, 4, 5, 6, 7, 7, 8, 8, 9, 9];
  var MOBO = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
  var AIR = [0.85, 1.0, 0.85, 1.1, 1.05, 0.9, 1.15, 0.9, 1.15, 0.9];   // Airflow je Gehaeuse (Front: Blech 0.85, Mesh 1.1+, Glas 0.9)

  function de() { try { return state.lang === "de"; } catch (e) { return true; } }
  function T(d, e) { return de() ? d : e; }
  function tier(id) { var n = parseInt(String(id || "").split("-")[1], 10); return n >= 1 && n <= 10 ? n : 0; }
  function one(v) { return Array.isArray(v) ? v[0] : v; }
  function facts(id) { try { return String(W.Parts3D.partFacts(id) || ""); } catch (e) { return ""; } }
  function tab(a, id) { var t = tier(id); return t ? a[t - 1] : 0; }

  function coolCap(id) {                                   // Kuehlleistung in W
    if (!id) return 0; var f = facts(id), t = tier(id) || 1;
    var m = /AIO\s*·\s*(\d+)/.exec(f); if (m) return 200 + (parseInt(m[1], 10) / 120) * 60;
    if (/Boxed|stock/i.test(f)) return 65;
    return 60 + t * 22;
  }
  function psuWatt(id) { var m = /(\d+)\s*W/.exec(facts(id)); return m ? parseInt(m[1], 10) : 0; }

  function calc(ids) {
    ids = ids || {};
    var cpu = one(ids.cpu), gpu = one(ids.gpu), psu = one(ids.psu), co = one(ids.cooler), cs = one(ids["case"]);
    var cpuW = tab(CPU, cpu), gpuW = tab(GPU, gpu);
    var load = cpuW + gpuW + tab(RAM, one(ids.ram)) + tab(SSD, one(ids.ssd)) + tab(MOBO, one(ids.mobo)) + (co ? (/AIO/.test(facts(co)) ? 15 : 5) : 0);
    var psuW = psu ? psuWatt(psu) : 0, limit = psuW * 0.9;
    var air = cs ? AIO(tier(cs)) : 1, cap = coolCap(co);
    var cpuT = cpu ? (cap ? Math.min(110, Math.round(38 + 52 * (cpuW + 0.25 * gpuW) / (cap * air))) : 105) : 0;
    var gpuT = gpu ? Math.round(42 + 34 / Math.sqrt(air) + 0.04 * cpuW) : 0;
    var perf = 1, msgs = [], status = "ok";
    if (psu && load > limit) { perf *= 0.8; status = "over"; msgs.push(T("Netzteil überlastet: Last " + load + " W > " + Math.round(limit) + " W (90 % von " + psuW + " W). Der PC drosselt.", "PSU overloaded: load " + load + " W > " + Math.round(limit) + " W (90% of " + psuW + " W). The PC throttles.")); }
    else if (psu && load > limit * 0.85) { status = "warn"; msgs.push(T("Netzteil fast am Limit (" + Math.round(load / psuW * 100) + " %).", "PSU close to its limit (" + Math.round(load / psuW * 100) + "%).")); }
    if (cpu && cpuT > 90) { perf *= Math.max(0.6, 1 - 0.02 * (cpuT - 90)); status = "over"; msgs.push(T("CPU zu heiß (" + cpuT + " °C): Throttling. Stärkerer Kühler oder Gehäuse mit mehr Airflow hilft.", "CPU too hot (" + cpuT + " °C): throttling. A stronger cooler or a case with more airflow helps.")); }
    else if (cpu && cpuT > 80 && status === "ok") { status = "warn"; msgs.push(T("CPU wird warm (" + cpuT + " °C).", "CPU running warm (" + cpuT + " °C).")); }
    if (gpu && gpuT > 85) { perf *= Math.max(0.7, 1 - 0.015 * (gpuT - 85)); status = "over"; msgs.push(T("GPU zu heiß (" + gpuT + " °C): Throttling. Gehäuse mit mehr Airflow wählen.", "GPU too hot (" + gpuT + " °C): throttling. Pick a case with more airflow.")); }
    return { load: load, psu: psuW, limit: Math.round(limit), cpuT: cpuT, gpuT: gpuT, perf: Math.max(0.5, perf), status: status, msgs: msgs, air: air, cap: Math.round(cap) };
  }
  function AIO(t) { return AIR[Math.max(0, Math.min(9, t - 1))] || 1; }

  /* ---------- Anzeige ---------- */
  function css() {
    if (document.getElementById("pt-style")) return;
    var s = document.createElement("style"); s.id = "pt-style";
    s.textContent = ".pt-box{margin:6px 12px;padding:8px 10px;border:1px solid #2c3646;border-radius:10px;background:#10151b;font-size:11px;color:#c3cbd6;line-height:1.4}.pt-box.s-warn{border-color:#8a6d1a}.pt-box.s-over{border-color:#7a2b2b}" +
      ".pt-row{display:flex;align-items:center;gap:8px;margin:3px 0}.pt-row span{width:78px;color:#8b95a5}.pt-row u{flex:1;height:6px;background:#1b222b;border-radius:3px;overflow:hidden;text-decoration:none;display:block}.pt-row u b{display:block;height:100%;background:#78d505}.pt-row.w u b{background:#e0b030}.pt-row.o u b{background:#e0503a}.pt-row em{font-style:normal;width:84px;text-align:right;color:#e7e9ec}" +
      ".pt-bench-btn{margin-top:8px;width:100%;padding:9px;border-radius:9px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec;font:700 12px inherit;cursor:pointer}.pt-msg{margin-top:4px;color:#ff9a8a}.pt-box.s-warn .pt-msg{color:#e0b030}.pt-ok{margin-top:4px;color:#78d505}";
    document.head.appendChild(s);
  }
  function row(label, val, max, txt, warn, over) { var p = Math.max(2, Math.min(100, val / max * 100)); return '<div class="pt-row' + (over ? " o" : warn ? " w" : "") + '"><span>' + label + '</span><u><b style="width:' + p.toFixed(0) + '%"></b></u><em>' + txt + "</em></div>"; }
  function html(r) {
    var h = "";
    if (r.psu) h += row("⚡ " + T("Netzteil", "PSU"), r.load, r.psu, r.load + " / " + r.psu + " W", r.load > r.limit * 0.85, r.load > r.limit);
    else h += row("⚡ " + T("Last", "Load"), r.load, 700, "~" + r.load + " W", false, false);
    if (r.cpuT) h += row("🌡 CPU", r.cpuT - 30, 80, r.cpuT + " °C", r.cpuT > 80, r.cpuT > 90);
    if (r.gpuT) h += row("🌡 GPU", r.gpuT - 30, 70, r.gpuT + " °C", r.gpuT > 78, r.gpuT > 85);
    h += r.msgs.length ? r.msgs.map(function (m) { return '<div class="pt-msg">' + m.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</div>"; }).join("") : '<div class="pt-ok">✓ ' + T("Last und Temperatur im grünen Bereich", "Power and temperature look fine") + "</div>";
    if (r.perf < 0.995) h += '<div class="pt-msg">' + T("Leistung durch Drosselung: ", "Performance after throttling: ") + Math.round(r.perf * 100) + " %</div>";
    return h;
  }
  (function () {                                                           // "In Farm stellen?" erst zeigen, wenn die Verkaufs-Anzeige (welcome-modal) zu ist
    try { var st = document.createElement("style"); st.id = "pt-offer-style"; st.textContent = "body:has(#welcome-modal[style*=\"flex\"]) .farm-offer{display:none!important}"; document.head.appendChild(st); } catch (e) {}
  })();
  var farmIds = null;
  function BTN(src) { return '<button type="button" class="pt-bench-btn" data-bench="' + src + '">🧪 ' + T("Start-Test ansehen", "Run boot test") + "</button>"; }
  function ensureBox(parent, before, id) {
    var b = document.getElementById(id); if (b && b.parentNode === parent) return b;
    if (b) b.remove(); b = document.createElement("div"); b.id = id; b.className = "pt-box"; parent.insertBefore(b, before || null); return b;
  }
  function tickPicker() {
    var pk = document.getElementById("ps-picker"); if (!pk || !pk.classList.contains("open")) return;
    var body = document.getElementById("ps-picker-body"), bp = {}; try { bp = state.buildPick || {}; } catch (e) {}
    if (!body || !(bp.cpu || bp.gpu || bp.psu)) { var o = document.getElementById("pt-picker"); if (o) o.remove(); return; }
    css(); var b = ensureBox(pk, body, "pt-picker"), r = calc(bp), key = JSON.stringify([r, de()]);
    if (b.getAttribute("data-k") !== key) { b.setAttribute("data-k", key); b.className = "pt-box s-" + r.status; b.innerHTML = html(r) + BTN("picker"); }
  }
  function tickFarm() {
    var info = document.getElementById("farm-info"); if (!info || !info.classList.contains("show")) return;
    var parts = info.querySelector(".farm-parts"), F = W.Parts3D && W.Parts3D.farm; if (!parts || !F || !F._dbg) return;
    var rig = null, sel = F._dbg.S.sel; F.slots().forEach(function (x) { if (x.pos === sel) rig = x; }); if (!rig) return;
    css(); var old = info.querySelector(".pt-box"), r = calc(rig.partIds), key = JSON.stringify([r, de()]);
    if (old && old.getAttribute("data-k") === key) return; if (old) old.remove();
    var b = document.createElement("div"); b.className = "pt-box s-" + r.status; b.style.margin = "8px 0"; b.setAttribute("data-k", key); b.innerHTML = html(r) + '<div class="pt-ok" style="color:#c3cbd6">' + T("Test-Score: ", "Test score: ") + "<b>" + (verdict(r) === "crash" ? 0 : score(rig.partIds, r)) + "</b></div>" + BTN("farm"); farmIds = rig.partIds;
    var btns = info.querySelector(".farm-btns"); info.insertBefore(b, btns || null);
  }
  setInterval(function () { try { tickPicker(); tickFarm(); } catch (e) { console.warn("[power]", e); } }, 600);

  /* ---------- A3 Benchmark nach dem Bau (nur Anzeige, keine Wirtschaft) ---------- */
  function partPow(id) { try { var it = PART_BY_ID[id]; return it ? it.power : 0; } catch (e) { return 0; } }
  function score(ids, r) {                                 // Test-Score (Spielwert), skaliert mit Drosselung
    var b = partPow(one(ids.cpu)) * 100 + partPow(one(ids.gpu)) * 120 + partPow(one(ids.ram)) * 40 + partPow(one(ids.ssd)) * 20;
    return Math.round(b * (r ? r.perf : 1));
  }
  function verdict(r) {                                    // "ok" | "throttle" | "crash"
    if ((r.psu && r.load > r.psu) || r.cpuT >= 105) return "crash";
    return r.status === "over" ? "throttle" : "ok";
  }
  function bcss() {
    if (document.getElementById("bm-style")) return;
    var s = document.createElement("style"); s.id = "bm-style";
    s.textContent = ".bm-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99990;background:#0b0d10;color:#e7e9ec;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;font-family:inherit}" +
      ".bm-ov h2{margin:0 0 4px;font-size:17px;color:#f7931a}.bm-sub{color:#8b95a5;font-size:12px;margin-bottom:14px}" +
      ".bm-fans{display:flex;gap:18px;margin:6px 0 14px}.bm-fan{width:64px;height:64px;border-radius:50%;background:conic-gradient(#78d505 0 18%,#10151b 18% 25%,#78d505 25% 43%,#10151b 43% 50%,#78d505 50% 68%,#10151b 68% 75%,#78d505 75% 93%,#10151b 93% 100%);border:3px solid #2c3646;animation:bm-spin 1s linear infinite;box-shadow:0 0 14px rgba(120,213,5,.35)}.bm-fan.hot{box-shadow:0 0 16px rgba(224,80,58,.6);border-color:#7a2b2b}.bm-fan.off{animation:none;opacity:.4;box-shadow:none}" +
      "@keyframes bm-spin{to{transform:rotate(360deg)}}.bm-box{width:100%;max-width:360px}.bm-bar{height:8px;background:#1b222b;border-radius:4px;overflow:hidden;margin:10px 0 4px}.bm-bar b{display:block;height:100%;width:0;background:#f7931a}" +
      ".bm-box .pt-row em{width:104px;white-space:nowrap}.bm-log{font-size:12px;color:#c3cbd6;min-height:18px;margin:6px 0}.bm-res{margin:10px 0;padding:10px 12px;border:1px solid #2c3646;border-radius:10px;font-size:13px;line-height:1.45;text-align:left}.bm-res.ok{border-color:#3d7a14}.bm-res.throttle{border-color:#8a6d1a}.bm-res.crash{border-color:#7a2b2b}.bm-res b.big{display:block;font-size:20px;margin-bottom:2px}" +
      ".bm-btns{display:flex;gap:8px;width:100%;max-width:360px;margin-top:8px}.bm-btns button{flex:1;padding:12px;border-radius:10px;border:1px solid #2c3646;background:#161c24;color:#e7e9ec;font:700 13px inherit;cursor:pointer}.bm-btns button.pri{background:#f7931a;border-color:#f7931a;color:#1a1206}";
    document.head.appendChild(s);
  }
  var benchRan = false;
  function runBench(ids, done) {
    if (document.getElementById("bm-stage")) return done && done();
    bcss(); benchRan = true; var r = calc(ids), v = verdict(r), T_END = 12, t = 0, finished = false;
    var o = document.createElement("div"); o.className = "bm-ov"; o.id = "bm-stage";
    o.innerHTML = "<div class=\"bm-box\"><h2>" + T("🧪 Start-Test", "🧪 Boot test") + "</h2><div class=\"bm-sub\">" + T("Dein neuer PC läuft kurz unter Volllast.", "Your new PC runs a short full-load test.") + "</div>" +
      "<div class=\"bm-fans\"><div class=\"bm-fan\"></div><div class=\"bm-fan\"></div><div class=\"bm-fan\"></div></div>" +
      "<div class=\"bm-bar\"><b id=\"bm-p\"></b></div><div class=\"bm-log\" id=\"bm-log\"></div>" +
      "<div class=\"pt-row\"><span>⚡ " + T("Last", "Load") + "</span><u><b id=\"bm-l\" style=\"width:0\"></b></u><em id=\"bm-lt\">0 W</em></div>" +
      (r.cpuT ? "<div class=\"pt-row\"><span>🌡 CPU</span><u><b id=\"bm-c\" style=\"width:0\"></b></u><em id=\"bm-ct\">30 °C</em></div>" : "") +
      (r.gpuT ? "<div class=\"pt-row\"><span>🌡 GPU</span><u><b id=\"bm-g\" style=\"width:0\"></b></u><em id=\"bm-gt\">30 °C</em></div>" : "") +
      "<div id=\"bm-res\"></div></div><div class=\"bm-btns\" id=\"bm-btns\"><button type=\"button\" id=\"bm-skip\">" + T("Überspringen", "Skip") + "</button></div>";
    css(); document.body.appendChild(o);
    var q = function (i) { return o.querySelector("#" + i); }, fans = o.querySelectorAll(".bm-fan");
    function set(id, w, txt, tid) { var e = q(id); if (e) e.style.width = Math.max(2, Math.min(100, w)) + "%"; var te = q(tid); if (te) te.textContent = txt; }
    function show(f, crashed) {
      var ease = 1 - Math.exp(-3 * f), ld = Math.round(r.load * Math.min(1, f * 4));
      set("bm-l", r.psu ? ld / r.psu * 100 : ld / 7, r.psu ? ld + " / " + r.psu + " W" : ld + " W", "bm-lt");
      var ct = Math.round(30 + (r.cpuT - 30) * ease), gt = Math.round(30 + (r.gpuT - 30) * ease);
      if (r.cpuT) set("bm-c", (ct - 30) / 80 * 100, ct + " °C", "bm-ct"); if (r.gpuT) set("bm-g", (gt - 30) / 70 * 100, gt + " °C", "bm-gt");
      q("bm-p").style.width = (f * 100) + "%";
      var hot = f > 0.5 && v !== "ok"; fans.forEach(function (x) { x.classList.toggle("hot", hot && !crashed); x.classList.toggle("off", !!crashed); x.style.animationDuration = (crashed ? 0 : Math.max(0.25, 1.1 - f * 0.8)) + "s"; });
      q("bm-log").textContent = crashed ? T("⚠ Absturz!", "⚠ Crash!") : f < 0.3 ? T("Lüfter hochfahren …", "Spinning up fans …") : f < 0.6 ? T("Volllast …", "Full load …") : hot ? T("Temperatur kritisch – drossle …", "Temperature critical - throttling …") : T("Werte stabil …", "Holding stable …");
    }
    function finish(crashAt) {
      if (finished) return; finished = true; clearInterval(iv);
      var s = v === "crash" ? 0 : score(ids, r), cls = v, head = v === "ok" ? T("✓ Stabil", "✓ Stable") : v === "throttle" ? T("⚠ Gedrosselt", "⚠ Throttled") : T("✗ Absturz", "✗ Crashed");
      show(v === "crash" ? Math.max(0.1, crashAt || 0.5) : 1, v === "crash");
      var tips = r.msgs.length ? "<br>" + r.msgs.map(function (m) { return m.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }).join("<br>") : "";
      if (v === "crash" && !r.msgs.length) tips = "<br>" + T("Netzteil oder Kühlung reicht nicht.", "PSU or cooling is not enough.");
      q("bm-res").innerHTML = '<div class="bm-res ' + cls + '"><b class="big">' + head + "</b>" + T("Test-Score: ", "Test score: ") + "<b>" + s + "</b>" + (v === "throttle" ? " (" + Math.round(r.perf * 100) + " %)" : "") + tips + "<br><span style=\"color:#8b95a5\">" + T("Nur eine Anzeige – Verkauf und Einkommen bleiben unverändert.", "Display only - sale and income stay unchanged.") + "</span></div>";
      try { state.lastBench = { status: v, score: s, perf: r.perf, at: Date.now() }; } catch (e) {}
      var b = q("bm-btns"); b.innerHTML = '<button type="button" class="pri" id="bm-go">' + T("Weiter", "Continue") + "</button>";
      q("bm-go").addEventListener("click", function () { o.remove(); try { done(); } catch (e) { console.warn("[bench]", e); } });
    }
    var iv = setInterval(function () {
      t += 0.1; var f = Math.min(1, t / T_END); show(f, false);
      if (v === "crash" && f >= 0.55) finish(0.55); else if (t >= T_END) finish();
    }, 100);
    q("bm-skip").addEventListener("click", function () { finish(0.5); });
  }
  var benchHooked = false;
  function hookBench() {
    if (typeof openPasteStage !== "function" || openPasteStage._bm) return openPasteStage && openPasteStage._bm;
    var orig = openPasteStage;
    openPasteStage = function (onDone) {
      var fresh = true, ids = null; try { fresh = !state.pasteDone; var bp = state.buildPick || {}; ids = {}; Object.keys(bp).forEach(function (k) { ids[k] = one(bp[k]); }); } catch (e) {}
      return orig.call(this, function () { if (fresh && ids && ids.cpu && !benchRan) { try { runBench(ids, function () { if (onDone) onDone(); }); } catch (e) { console.warn("[bench]", e); if (onDone) onDone(); } } else if (onDone) onDone(); });
    };
    openPasteStage._bm = true; return true;
  }
  if (!/[?&]nobench(=|&|$)/.test(String(W.location && W.location.search))) {
    var bn = 0, biv = setInterval(function () { bn++; try { if (!benchHooked) benchHooked = !!hookBench(); } catch (e) { console.warn("[bench]", e); } if (benchHooked || bn > 120) clearInterval(biv); }, 250);
  }

  document.addEventListener("click", function (ev) {                       // Button "Start-Test ansehen" (Picker/Farm)
    var b = ev.target && ev.target.closest ? ev.target.closest(".pt-bench-btn") : null; if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    var ids = null; try { ids = b.getAttribute("data-bench") === "farm" ? farmIds : state.buildPick; } catch (e) {}
    if (ids && (one(ids.cpu) || one(ids.gpu))) { try { var c = {}; Object.keys(ids).forEach(function (k) { c[k] = one(ids[k]); }); var was = benchRan; runBench(c, function () {}); benchRan = was; } catch (e) { console.warn("[bench]", e); } }
  }, true);
  var prevBoot = null;                                                      // Fallback: Test auch starten, wenn Paste/Software uebersprungen wurden (bootPlayed false -> true)
  if (!/[?&]nobench(=|&|$)/.test(String(W.location && W.location.search))) setInterval(function () {
    try {
      var bp = (typeof bootPlayed !== "undefined") ? !!bootPlayed : null; if (bp === null) return;
      if (prevBoot === true && !bp) benchRan = false;                       // neuer Rig (nach Verkauf) -> wieder erlaubt
      if (prevBoot === false && bp === true && !benchRan) {
        var pick = state.buildPick || {}, ids = {}; Object.keys(pick).forEach(function (k) { ids[k] = one(pick[k]); });
        if (ids.cpu) runBench(ids, function () {});
      }
      prevBoot = bp;
    } catch (e) {}
  }, 400);

  W.Parts3D = W.Parts3D || {};
  W.Parts3D.power = { calc: calc, score: score, bench: runBench, verdict: verdict };
  console.log("[HASHPOOL] powerTemp bereit (A2 + A3)");
})();

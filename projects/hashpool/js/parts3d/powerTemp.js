/* parts3d/powerTemp.js - A2 Power- & Temperatur-Regeln (reine Anzeige/Warnung, keine Wirtschaft)
 *  - Last: Summe der Teile-Leistung (W) gegen Netzteil x 0.9  -> sonst Warnung/Drossel
 *  - Temperatur: CPU-/GPU-Temp aus Last, Kuehler-Kapazitaet und Gehaeuse-Airflow -> Throttle moeglich
 *  - Anzeige: Leiste im Teile-Picker ("PSU 650 W | Last 480 W" + Temp-Balken) und im Farm-PC-Fenster
 *  - API: Parts3D.power.calc(ids) -> { load, psu, limit, cpuT, gpuT, perf, status, msgs }
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
      ".pt-msg{margin-top:4px;color:#ff9a8a}.pt-box.s-warn .pt-msg{color:#e0b030}.pt-ok{margin-top:4px;color:#78d505}";
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
  function ensureBox(parent, before, id) {
    var b = document.getElementById(id); if (b && b.parentNode === parent) return b;
    if (b) b.remove(); b = document.createElement("div"); b.id = id; b.className = "pt-box"; parent.insertBefore(b, before || null); return b;
  }
  function tickPicker() {
    var pk = document.getElementById("ps-picker"); if (!pk || !pk.classList.contains("open")) return;
    var body = document.getElementById("ps-picker-body"), bp = {}; try { bp = state.buildPick || {}; } catch (e) {}
    if (!body || !(bp.cpu || bp.gpu || bp.psu)) { var o = document.getElementById("pt-picker"); if (o) o.remove(); return; }
    css(); var b = ensureBox(pk, body, "pt-picker"), r = calc(bp), key = JSON.stringify([r, de()]);
    if (b.getAttribute("data-k") !== key) { b.setAttribute("data-k", key); b.className = "pt-box s-" + r.status; b.innerHTML = html(r); }
  }
  function tickFarm() {
    var info = document.getElementById("farm-info"); if (!info || !info.classList.contains("show")) return;
    var parts = info.querySelector(".farm-parts"), F = W.Parts3D && W.Parts3D.farm; if (!parts || !F || !F._dbg) return;
    var rig = null, sel = F._dbg.S.sel; F.slots().forEach(function (x) { if (x.pos === sel) rig = x; }); if (!rig) return;
    css(); var old = info.querySelector(".pt-box"), r = calc(rig.partIds), key = JSON.stringify([r, de()]);
    if (old && old.getAttribute("data-k") === key) return; if (old) old.remove();
    var b = document.createElement("div"); b.className = "pt-box s-" + r.status; b.style.margin = "8px 0"; b.setAttribute("data-k", key); b.innerHTML = html(r);
    var btns = info.querySelector(".farm-btns"); info.insertBefore(b, btns || null);
  }
  setInterval(function () { try { tickPicker(); tickFarm(); } catch (e) { console.warn("[power]", e); } }, 600);

  W.Parts3D = W.Parts3D || {};
  W.Parts3D.power = { calc: calc };
  console.log("[HASHPOOL] powerTemp bereit");
})();

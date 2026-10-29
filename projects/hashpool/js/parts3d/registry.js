/* parts3d/registry.js — pickInfo from buildPick, with forceId override */
(function(){
  function pickInfo(cat){
    try{
      if(window.Parts3D && Parts3D._forceId && Parts3D._forceId[cat]){
        var fid = Parts3D._forceId[cat];
        var itF = (typeof PART_BY_ID !== "undefined" && PART_BY_ID[fid]) ? PART_BY_ID[fid] : null;
        return {
          id: fid,
          tier: itF ? (Number(itF.tier)||1) : 3,
          brand: itF ? (itF.brand||"") : "",
          model: itF ? (itF.model||"") : ""
        };
      }
      if(typeof state !== "undefined" && state && state.buildPick && state.buildPick[cat]){
        var id = state.buildPick[cat];
        var it = (typeof PART_BY_ID !== "undefined") ? PART_BY_ID[id] : null;
        return {
          id: id,
          tier: it ? (Number(it.tier)||1) : 3,
          brand: it ? (it.brand||"") : "",
          model: it ? (it.model||"") : ""
        };
      }
    }catch(e){}
    return { id: "", tier: 3, brand: "", model: "" };
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.pickInfo = pickInfo;
  window.Parts3D._forceId = window.Parts3D._forceId || {};
})();

/* ====================================================================================================================
 * claudeUi (steht hier in registry.js, weil diese Datei vom Loader in den Spiel-Scope gesetzt wird und so state/bootPlayed/openPasteStage sieht)
 * Oberflaeche rund um das Claude-3D-Rig (laeuft zusammen mit claudeRig.js, aendert Wirtschaft/Speichern nicht)
 *   1. Kompatibilitaet: wenige echte Regeln (Sockel, DDR/Slots, Formfaktor, Radiator, Kuehlerhoehe), Meldungen mit Teilenamen
 *   2. Teile-Auswahl: jede Zeile zeigt Daten + "passt" / "passt nicht: Grund"; Antippen eines unpassenden Teils zeigt die Meldung
 *   3. Teile-Shop: Kompatibilitaets-Daten im Detail
 *   4. Gehaeuse ohne Glasseite: Seitenwand ist waehrend des Baus abgenommen und schliesst sich nach dem Einschalten
 *   5. GPU-Beschriftung steht nicht mehr auf dem Kopf
 *   6. Software-Schritt nach der Waermeleitpaste: Betriebssystem, Treiber, Miner per Terminal installieren
 * Abschalten: ?nocu=1 an der Adresse.
 * ==================================================================================================================== */
(function () {
  var W = window;
  if (W.__claudeUi) return; W.__claudeUi = true;
  if (/[?&]nocu(=|&|$)/.test(String(W.location && W.location.search))) return;
  var P = function () { return W.Parts3D || {}; };
  function C() { return P().Claude; }
  function de() { try { return state.lang === "de"; } catch (e) { return true; } }
  function T(d, e) { return de() ? d : e; }
  function nm(id) { try { var it = PART_BY_ID[id]; if (it) return (it.brand ? it.brand + " " : "") + it.model; } catch (e) {} return id; }
  var FORM = { mini: "Mini-ITX", matx: "Micro-ATX", atx: "ATX" };

  /* ---------- Teile-Daten (aus den echten 3D-Teilen) ---------- */
  var factCache = {};
  function F(id) {
    if (factCache[id]) return factCache[id];
    var c = C(), cat = String(id).split("-")[0], f = { cat: cat, id: id, forms: [], sockets: [] };
    try {
      var g = c.buildPartRaw(id), u = g.userData, po = c.portOf;
      if (cat === "cpu") f.socket = po(g, "socket").meta.socket;
      else if (cat === "mobo") { f.form = po(g, "board").meta.form; f.socket = po(g, "cpu").meta.socket; f.ddr = u.dims.ddr; f.dimm = u.dims.dimm; f.m2 = u.dims.m2; }
      else if (cat === "ram") { f.ddr = u.members[0].ports[0].meta.ddr; f.sticks = u.members.length; }
      else if (cat === "ssd") f.m2 = u.ports[0].kind === "m2";
      else if (cat === "cooler") { f.kind = u.members ? "aio" : u.dims.kind; f.rad = u.members ? u.dims.rad : 0; f.sockets = (u.members ? u.members[0].ports[0] : po(g, "base")).meta.sockets; }
      else if (cat === "case") { f.forms = po(g, "mobo").meta.forms; f.radMax = u.dims.radMax || 0; }
      else if (cat === "gpu") f.conn = (u.plugs || []).length;
      else if (cat === "psu") f.watt = po(g, "body").meta.watt;
    } catch (e) { console.warn("[claudeUi] Teil", id, e); }
    return (factCache[id] = f);
  }
  function factText(id) {
    var f = F(id), s = [];
    if (f.cat === "cpu") s.push(T("Sockel ", "Socket ") + String(f.socket).toUpperCase());
    else if (f.cat === "mobo") s.push(String(f.socket).toUpperCase(), "DDR" + f.ddr, FORM[f.form] || f.form, f.dimm + T(" RAM-Slots", " RAM slots"));
    else if (f.cat === "ram") s.push("DDR" + f.ddr, f.sticks + T(f.sticks === 1 ? " Riegel" : " Riegel", f.sticks === 1 ? " stick" : " sticks"));
    else if (f.cat === "ssd") s.push(f.m2 ? T("M.2 (direkt aufs Mainboard)", "M.2 (on the mainboard)") : T("SATA 2,5″ (Laufwerksschacht + 2 Kabel)", "SATA 2.5″ (drive bay + 2 cables)"));
    else if (f.cat === "cooler") s.push(f.kind === "aio" ? "AIO · " + f.rad + " mm " + T("Radiator", "radiator") : (f.kind === "stock" ? T("Boxed-Kühler", "stock cooler") : T("Tower-Kühler", "tower cooler")));
    else if (f.cat === "case") s.push((f.forms.indexOf("atx") >= 0 ? T("bis ATX", "up to ATX") : f.forms.indexOf("matx") >= 0 ? T("bis Micro-ATX", "up to Micro-ATX") : T("nur Mini-ITX", "Mini-ITX only")), f.radMax ? T("Radiator bis ", "radiator up to ") + f.radMax + " mm" : T("kein Radiator", "no radiator"));
    else if (f.cat === "gpu") s.push(f.conn ? f.conn + T(" Strom-Anschluss" + (f.conn > 1 ? "e" : ""), " power connector" + (f.conn > 1 ? "s" : "")) : T("ohne Zusatzstrom", "no extra power"));
    else if (f.cat === "psu") s.push(f.watt + " W");
    return s.join(" · ");
  }

  /* ---------- Regeln ---------- */
  var overCache = {};
  function cpuFor(mb, cpuId) {
    var c = C(), want = F(mb).socket;
    if (cpuId && F(cpuId).socket === want) return cpuId;
    var l = c.CATALOG.filter(function (e) { return e.cat === "cpu" && F(e.id).socket === want; });
    return l.length ? l[Math.min(3, l.length - 1)].id : null;
  }
  /** Wie weit ragt ein Tower-Kuehler aus dem Gehaeuse (mm)? 0 = passt. Nutzt die echte 3D-Montage. */
  function towerOver(cs, mb, co, cpu) {
    var cp = cpuFor(mb, cpu); if (!cp) return 0;
    var k = cs + "|" + mb + "|" + co; if (overCache[k] !== undefined) return overCache[k];
    var o = 0;
    try {
      var rep = C().buildSystem({ case: cs, mobo: mb, cpu: cp, cooler: co }, { cables: false }).report;
      rep.errors.forEach(function (e) { var m = /ragt\s+\w\s+([\d.]+)\s*mm/.exec(e.msg || ""); if (m) o = Math.max(o, parseFloat(m[1])); });
    } catch (e) {}
    return (overCache[k] = o);
  }
  function rules(s) {
    var out = [];
    function add(a, b, d, e) { out.push({ ids: [a, b], de: d, en: e }); }
    var cp = s.cpu && F(s.cpu), mb = s.mobo && F(s.mobo), rm = s.ram && F(s.ram), cs = s.case && F(s.case), co = s.cooler && F(s.cooler);
    if (cp && mb && cp.socket !== mb.socket)
      add(s.cpu, s.mobo, nm(s.cpu) + " hat Sockel " + cp.socket.toUpperCase() + ", " + nm(s.mobo) + " braucht " + mb.socket.toUpperCase() + ".", nm(s.cpu) + " is socket " + cp.socket.toUpperCase() + ", " + nm(s.mobo) + " needs " + mb.socket.toUpperCase() + ".");
    if (cp && co && co.sockets && co.sockets.indexOf(cp.socket) < 0)
      add(s.cooler, s.cpu, nm(s.cooler) + " passt nicht auf Sockel " + cp.socket.toUpperCase() + ".", nm(s.cooler) + " does not fit socket " + cp.socket.toUpperCase() + ".");
    if (rm && mb) {
      if (rm.ddr !== mb.ddr) add(s.ram, s.mobo, nm(s.ram) + " ist DDR" + rm.ddr + ", " + nm(s.mobo) + " nimmt nur DDR" + mb.ddr + ".", nm(s.ram) + " is DDR" + rm.ddr + ", " + nm(s.mobo) + " only takes DDR" + mb.ddr + ".");
      else if (rm.sticks > mb.dimm) add(s.ram, s.mobo, rm.sticks + " Riegel brauchen " + rm.sticks + " Slots, " + nm(s.mobo) + " hat nur " + mb.dimm + ".", rm.sticks + " sticks need " + rm.sticks + " slots, " + nm(s.mobo) + " has only " + mb.dimm + ".");
    }
    if (cs && mb && cs.forms.indexOf(mb.form) < 0)
      add(s.mobo, s.case, nm(s.mobo) + " (" + FORM[mb.form] + ") ist zu groß für " + nm(s.case) + " (" + factText(s.case).split(" · ")[0] + ").", nm(s.mobo) + " (" + FORM[mb.form] + ") is too big for " + nm(s.case) + " (" + factText(s.case).split(" · ")[0] + ").");
    if (cs && co && co.kind === "aio") {
      if (!cs.radMax) add(s.cooler, s.case, nm(s.case) + " hat keinen Platz für einen Radiator (" + nm(s.cooler) + " braucht " + co.rad + " mm).", nm(s.case) + " has no radiator mount (" + nm(s.cooler) + " needs " + co.rad + " mm).");
      else if (co.rad > cs.radMax) add(s.cooler, s.case, nm(s.cooler) + " (" + co.rad + "-mm-Radiator) ist zu groß für " + nm(s.case) + " (max. " + cs.radMax + " mm).", nm(s.cooler) + " (" + co.rad + " mm radiator) is too big for " + nm(s.case) + " (max " + cs.radMax + " mm).");
    }
    if (cs && co && mb && co.kind !== "aio") {
      var over = towerOver(s.case, s.mobo, s.cooler, s.cpu);
      if (over > 6) add(s.cooler, s.case, nm(s.cooler) + " ist zu hoch für " + nm(s.case) + " (steht " + Math.round(over) + " mm über).", nm(s.cooler) + " is too tall for " + nm(s.case) + " (" + Math.round(over) + " mm too high).");
    }
    return out;
  }
  function errs(list) { return list.map(function (r) { return { part: T("Passt nicht", "Incompatible"), msg: de() ? r.de : r.en, ids: r.ids }; }); }
  function curSpec() { var f = P().specFromBuildPick; return f ? JSON.parse(JSON.stringify(f())) : {}; }
  function withPick(id) { var s = curSpec(), cat = String(id).split("-")[0]; if (cat === "ssd") s.ssd = [id]; else s[cat] = id; return s; }
  function install() {
    var p = P(); if (!p.Claude) return false;
    p.compat = function (spec) { var e = errs(rules(spec || {})); return { errors: e, warnings: [], ok: e.length === 0 }; };
    p.canPick = function (id) { var e = errs(rules(withPick(id)).filter(function (r) { return r.ids.indexOf(id) >= 0; })); return { ok: e.length === 0, errors: e }; };
    p.rules = rules; p.partFacts = factText;
    return true;
  }

  /* ---------- Stil ---------- */
  function css() {
    if (document.getElementById("cu-style")) return;
    var s = document.createElement("style"); s.id = "cu-style";
    s.textContent = ".cu-facts{font-size:11px;color:#8b95a5;margin-top:2px}.cu-note{font-size:11px;margin-top:3px;line-height:1.3}.cu-ok{color:#78d505}.cu-no{color:#ff7a6b}" +
      ".ps-row.cu-bad{opacity:.62;border-color:#7a2b2b!important}.cu-bad .ps-row-model{text-decoration:line-through;text-decoration-color:#7a2b2b}" +
      ".cu-det{margin:8px 0 2px;padding:8px 10px;border:1px dashed #2c3646;border-radius:8px;font-size:12px;color:#c3cbd6;line-height:1.45}.cu-det b{color:#e7e9ec}" +
      "#sw-stage .sw-term{background:#05080a;color:#7cfc8a;font:11px/1.4 ui-monospace,Menlo,monospace;padding:10px;border-radius:8px;min-height:150px;max-height:210px;overflow:auto;white-space:pre-wrap;word-break:break-all;margin:0 0 10px}" +
      "#sw-stage .sw-term .dim{color:#5f8f67}#sw-stage .sw-term .hl{color:#ffd166}#sw-stage .sw-big{width:100%;font:700 15px inherit;padding:14px;border-radius:10px;border:1px solid var(--btc);background:var(--btc);color:#1a1206;cursor:pointer;touch-action:manipulation;-webkit-user-select:none}#sw-stage .sw-big:disabled{opacity:.45}";
    document.head.appendChild(s);
  }
  function toast(msg) {
    var el = document.getElementById("ps-toast"); if (!el) return;
    el.textContent = msg; el.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove("show"); }, 4200);
  }

  /* ---------- Teile-Auswahl + Shop beobachten ---------- */
  var obs = null;
  function annotate() {
    var body = document.getElementById("ps-picker-body");
    if (body) {
      body.querySelectorAll("[data-pick-id]").forEach(function (row) {
        if (row.getAttribute("data-cu")) return;
        row.setAttribute("data-cu", "1");
        var id = row.getAttribute("data-pick-id"), main = row.querySelector(".ps-row-main"); if (!main) return;
        var f = document.createElement("div"); f.className = "cu-facts"; f.textContent = factText(id); main.appendChild(f);
        var r = P().canPick ? P().canPick(id) : { ok: true };
        var cat = id.split("-")[0], sp = curSpec(), ctx = Object.keys(sp).some(function (k) { return k !== cat; });
        if (!r.ok) {
          row.classList.add("cu-bad"); row.setAttribute("data-cu-msg", r.errors.map(function (e) { return e.msg; }).join(" "));
          var n = document.createElement("div"); n.className = "cu-note cu-no"; n.textContent = "✗ " + r.errors[0].msg; main.appendChild(n);
        } else if (ctx) {
          var n2 = document.createElement("div"); n2.className = "cu-note cu-ok"; n2.textContent = "✓ " + T("passt zu deiner Auswahl", "fits your selection"); main.appendChild(n2);
        }
      });
    }
    var shop = document.getElementById("ps-body");
    if (shop) {
      var sel = shop.querySelector(".ps-row.selected[data-id]"), det = shop.querySelector(".ps-detail.open");
      if (sel && det && !det.querySelector(".cu-det")) {
        var id2 = sel.getAttribute("data-id"), d = document.createElement("div"); d.className = "cu-det";
        var f2 = F(id2), tip = "";
        if (f2.cat === "cpu") tip = T("Braucht ein Mainboard mit Sockel ", "Needs a mainboard with socket ") + String(f2.socket).toUpperCase() + ".";
        else if (f2.cat === "mobo") tip = T("Passt nur zu CPUs mit Sockel ", "Only fits CPUs with socket ") + String(f2.socket).toUpperCase() + T(", RAM vom Typ DDR", ", RAM type DDR") + f2.ddr + T(" und Gehäusen für ", " and cases for ") + (FORM[f2.form] || f2.form) + ".";
        else if (f2.cat === "ram") tip = T("Nur auf Mainboards mit DDR", "Only on mainboards with DDR") + f2.ddr + (f2.sticks > 2 ? T(" und 4 Slots.", " and 4 slots.") : ".");
        else if (f2.cat === "cooler") tip = f2.kind === "aio" ? T("Der Radiator braucht ein Gehäuse mit Radiator-Platz für ", "The radiator needs a case with room for ") + f2.rad + " mm." : T("Hohe Tower-Kühler passen nicht in kleine Gehäuse.", "Tall tower coolers do not fit small cases.");
        else if (f2.cat === "case") tip = T("Nimmt Mainboards: ", "Takes mainboards: ") + f2.forms.map(function (x) { return FORM[x]; }).join(", ") + ".";
        else if (f2.cat === "ssd") tip = T("Im Spiel ist genau eine SSD verbaubar.", "Only one SSD can be installed in the game.");
        d.innerHTML = "<b>" + T("Daten", "Specs") + ":</b> " + factText(id2) + (tip ? "<br>" + tip : "");
        det.insertBefore(d, det.querySelector(".ps-detail-actions"));
      }
    }
    if (obs) obs.takeRecords();
  }
  function watch() {
    css();
    obs = new MutationObserver(function () { try { annotate(); } catch (e) { console.warn("[claudeUi] annotate", e); } });
    obs.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", function (ev) {                              // unpassendes Teil: nicht auswaehlen, Grund zeigen
      var row = ev.target && ev.target.closest && ev.target.closest(".ps-row.cu-bad[data-pick-id]"); if (!row) return;
      ev.preventDefault(); ev.stopImmediatePropagation(); toast(row.getAttribute("data-cu-msg") || T("Passt nicht zusammen.", "Does not fit."));
    }, true);
  }

  /* ---------- Gehaeuse ohne Glasseite: Wand ab, nach dem Einschalten zu ---------- */
  var wallState = { id: "", meshes: [], closed: false };
  function findWall(co) {
    var X = (co.userData.dims && co.userData.dims.L ? co.userData.dims.L : 200) / 2, H = (co.userData.dims && co.userData.dims.H) || 400, hasGlass = false, list = [];
    co.traverse(function (n) { if (n.isMesh && n.material && n.material.transparent && n.position.x < -X + 4 && n.geometry && n.geometry.parameters && n.geometry.parameters.height > H * 0.5) hasGlass = true; });
    if (hasGlass) return [];
    co.traverse(function (n) {
      var gp = n.isMesh && n.geometry && n.geometry.parameters; if (!gp || !gp.width) return;
      if (n.position.x > -X - 0.8 && n.position.x < -X + 1.6 && gp.width <= 2 && gp.height >= H * 0.3) list.push(n);
    });
    return list;
  }
  function wallTick() {
    var R = P().rig; if (!R || !R.caseMM || !R.caseMM.children[0]) return;
    var co = R.caseMM.children[0];
    if (wallState.id !== co.uuid) {
      wallState = { id: co.uuid, meshes: findWall(co), closed: false };
      wallState.meshes.forEach(function (m) { m._cuX = m.position.x; m.visible = false; });
    }
    var played = false; try { played = !!bootPlayed; } catch (e) {}
    if (played && !wallState.closed && wallState.meshes.length) {                                   // Seitenteil schliesst sich
      wallState.closed = true; var t0 = performance.now(), ms = wallState.meshes;
      ms.forEach(function (m) { m.visible = true; });
      (function step() {
        var u = Math.min(1, (performance.now() - t0) / 700), e = 1 - Math.pow(1 - u, 3);
        ms.forEach(function (m) { m.position.x = m._cuX - 220 * (1 - e); });
        if (u < 1) requestAnimationFrame(step);
      })();
    } else if (!played && wallState.closed) {                                                       // neuer Bau: wieder offen
      wallState.closed = false; wallState.meshes.forEach(function (m) { m.position.x = m._cuX; m.visible = false; });
    }
  }

  /* ---------- GPU: Beschriftung auf senkrechten Flaechen wieder richtig herum (Karte wird beim Einbau an y gespiegelt) ---------- */
  var gpuSeen = "";
  function gpuTick() {
    var R = P().rig; if (!R || !R.slots || !R.slots.gpu || !R.slots.gpu.children[0]) return;
    var w = R.slots.gpu.children[0]; if (gpuSeen === w.uuid) return; gpuSeen = w.uuid;
    var up = new THREE.Vector3();
    w.traverse(function (n) {
      if (!n.isMesh || !n.material || !n.material.map || !n.material.map.isCanvasTexture || n.userData._cuFlip) return;
      up.set(0, 0, 1).applyQuaternion(n.quaternion);
      if (Math.abs(up.y) < 0.5) { n.scale.y *= -1; n.userData._cuFlip = true; }
    });
  }

  /* ---------- Software-Schritt (nach der Waermeleitpaste, vor dem Start) ---------- */
  function softStage(onDone) {
    var host = document.getElementById("bo-rig-area");
    if (!host) { if (onDone) onDone(); return; }
    var old = document.getElementById("sw-stage"); if (old) old.remove();
    var bp = (typeof state !== "undefined" && state.buildPick) || {};
    function item(c) { try { return PART_BY_ID[bp[c]]; } catch (e) { return null; } }
    var gpu = item("gpu"), ssdId = bp.ssd, ssdM2 = ssdId ? F(ssdId).m2 : true, brand = ((gpu && gpu.brand) || "gpu").toLowerCase().replace(/[^a-z]/g, "");
    var disk = ssdM2 ? "/dev/nvme0n1" : "/dev/sda";
    var Lx = function (c) { var it = item(c); return it ? it.brand + " " + it.model : "?"; };
    var steps = [
      { cmd: "sudo hashos-install --disk " + disk, title: T("Betriebssystem installieren", "Install the operating system"), out: [
        "<dim>HashOS 4.2 Installer</dim>", "Detected CPU:  " + Lx("cpu"), "Detected RAM:  " + Lx("ram"), "Detected GPU:  " + Lx("gpu"), "Detected disk: " + Lx("ssd") + " (" + disk + ")", "<bar>Partitionen anlegen", "<bar>Dateisystem schreiben", "<bar>Bootloader installieren", "<hl>OK  HashOS installiert</hl>"] },
      { cmd: "sudo apt install gpu-driver-" + brand, title: T("Grafiktreiber installieren", "Install the graphics driver"), out: [
        "Reading package lists... Done", "<bar>gpu-driver-" + brand + " herunterladen", "<bar>Kernel-Modul bauen", "<hl>OK  " + Lx("gpu") + " erkannt – Treiber aktiv</hl>"] },
      { cmd: "hashminer --init --gpu 0 --algo sha256d", title: T("Miner-Software starten", "Start the miner software"), out: [
        "hashminer 1.0  (SHA-256d)", "Pool: stratum+tcp://pool.hashpool:3333", "<bar>Hashrate kalibrieren", "<hl>OK  Miner läuft – viel Erfolg!</hl>"] },
    ];
    var box = document.createElement("div"); box.className = "bios-stage"; box.id = "sw-stage";
    box.innerHTML = '<h3>' + T("Software installieren", "Install software") + '</h3><p id="sw-hint"></p><pre class="sw-term" id="sw-term"></pre>' +
      '<button type="button" class="sw-big" id="sw-type">⌨ ' + T("Tippen", "Type") + '</button>' +
      '<div class="paste-actions" style="margin-top:10px"><button type="button" id="sw-skip">' + T("Überspringen", "Skip") + '</button></div>';
    host.insertBefore(box, host.firstChild);
    try { box.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
    var term = box.querySelector("#sw-term"), hint = box.querySelector("#sw-hint"), btn = box.querySelector("#sw-type");
    var log = [], si = 0, typed = 0, busy = false, dead = false;
    function html(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function draw(cursor) {
      var h = log.map(function (l) { return l.cls ? '<span class="' + l.cls + '">' + html(l.t) + "</span>" : html(l.t); }).join("\n");
      term.innerHTML = h + (cursor !== undefined ? (h ? "\n" : "") + "$ " + html(cursor) + "▌" : ""); term.scrollTop = term.scrollHeight;
    }
    function showStep() { var s = steps[si]; hint.textContent = (si + 1) + "/" + steps.length + " · " + s.title + " – " + T("tippe, bis der Befehl eingegeben ist.", "tap until the command is typed."); typed = 0; draw(""); btn.disabled = false; btn.textContent = "⌨ " + T("Tippen", "Type"); busy = false; }
    function finish() { if (dead) return; dead = true; setTimeout(function () { box.remove(); try { state.softDone = true; } catch (e) {} if (onDone) onDone(); }, 600); }
    function runOutput(lines, k, done) {
      if (dead) return; if (k >= lines.length) { done(); return; }
      var raw = lines[k], delay = 260;
      if (raw.indexOf("<bar>") === 0) {
        var label = raw.slice(5), pct = 0, ent = { t: "", cls: "" }; log.push(ent);
        (function tick() {
          if (dead) return; pct = Math.min(100, pct + 6 + Math.random() * 12); var n = Math.round(pct / 5);
          ent.t = "[" + new Array(n + 1).join("#") + new Array(21 - n).join("-") + "] " + Math.round(pct) + "%  " + label; draw();
          if (pct < 100) setTimeout(tick, 70); else runOutput(lines, k + 1, done);
        })(); return;
      }
      var cls = ""; if (raw.indexOf("<dim>") === 0) { cls = "dim"; raw = raw.slice(5, -6); } else if (raw.indexOf("<hl>") === 0) { cls = "hl"; raw = raw.slice(4, -5); delay = 420; }
      log.push({ t: raw, cls: cls }); draw(); setTimeout(function () { runOutput(lines, k + 1, done); }, delay);
    }
    btn.addEventListener("pointerdown", function (e) {
      e.preventDefault(); e.stopPropagation(); if (busy || dead) return;
      var s = steps[si]; typed = Math.min(s.cmd.length, typed + 3 + Math.floor(Math.random() * 3));
      try { if (typeof sfxClick === "function") sfxClick(); } catch (x) {}
      draw(s.cmd.slice(0, typed));
      if (typed >= s.cmd.length) {
        busy = true; btn.disabled = true; btn.textContent = "…";
        log.push({ t: "$ " + s.cmd, cls: "" }); draw();
        setTimeout(function () { runOutput(s.out, 0, function () { si++; if (si >= steps.length) { hint.textContent = T("Alles installiert – das System startet.", "All installed – the system is starting."); btn.textContent = "✓"; finish(); } else setTimeout(showStep, 350); }); }, 250);
      }
    });
    box.querySelector("#sw-skip").addEventListener("pointerdown", function (e) { e.preventDefault(); dead = true; box.remove(); if (onDone) onDone(); });
    showStep();
  }
  function hookStage() {
    if (typeof openPasteStage !== "function" || openPasteStage._cu) return false;
    var orig = openPasteStage;
    openPasteStage = function (onDone) {
      var fresh = true; try { fresh = !state.pasteDone; } catch (e) {}
      return orig.call(this, function () { if (fresh) { try { softStage(onDone); } catch (e) { console.warn("[claudeUi] softStage", e); if (onDone) onDone(); } } else if (onDone) onDone(); });
    };
    openPasteStage._cu = true; return true;
  }

  /* ---------- Start ---------- */
  var n = 0, got = false, hooked = false;
  var iv = setInterval(function () {
    n++;
    try { if (!got) got = install(); if (!hooked) hooked = hookStage(); } catch (e) { console.warn("[claudeUi]", e); }
    if ((got && hooked) || n > 200) clearInterval(iv);
  }, 100);
  setInterval(function () { try { wallTick(); gpuTick(); } catch (e) {} }, 400);
  if (typeof document === "undefined") return;
  if (document.body) watch(); else document.addEventListener("DOMContentLoaded", watch);
  console.log("[HASHPOOL] claudeUi bereit");
})();

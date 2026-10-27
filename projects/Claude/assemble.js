import * as THREE from "three";
import { buildPartRaw } from "./parts.js";
import { mate, place, mul, point, I4, portOf, portsOf } from "./ports.js";

/* ============================================================================================
 * ZUSAMMENBAU: jedes Teil bringt seine Montagepunkte (ports) selbst mit. Dieses Modul rechnet nur noch
 *   Gast-Port auf Host-Port  ->  Matrix.   Keine Sonderfaelle, keine handgeschriebenen Offsets pro Teil.
 *
 *   mountPart(root, hostObj, hostPortId, guestObj, guestPortId)  - ein Teil montieren (fuer Drag & Drop im Spiel)
 *   buildSystem(spec, opts)                                      - kompletten PC aus Teile-IDs bauen
 *   compat(spec)                                                 - Regeln ohne Geometrie (Sockel, DDR, Formfaktor, Radiator ...)
 *   checkBuild(sys)                                              - Geometrie-Pruefung (Kollisionen, Platz im Gehaeuse)
 *
 * Einheiten: mm im Wurzelknoten `sys.root`; `sys.group` ist root * 0.01 (Szeneneinheiten wie buildPart).
 * Gehaeuse-Raum: x Breite (Glas -x, Tray +x), y hoch (Boden = 0), z Tiefe (Front +z).
 * ============================================================================================ */

/** Teil an einen Host-Port montieren. hostObj muss schon platziert sein (obj.userData.world). Gibt die Weltmatrix zurueck. */
export function mountPart(hostObj, hostPortId, guestObj, guestPortId, guestPort) {
  const hostPort = portOf(hostObj, hostPortId), gp = guestPort || portOf(guestObj, guestPortId);
  let hp = hostPort;
  if (hostPort.kind === "rad") hp = { ...hostPort, pos: hostPort.pos.map((v, i) => v + hostPort.fwd[i] * (gp.meta.length || 0) / 2) };   // Radiator: ab Rueckseite, nicht zentriert
  const W = mate(hostObj.userData.world || I4(), hp, gp);
  guestObj.userData.world = W; place(guestObj, W);
  return W;
}

const DIMM_PICK = { 1: { 2: [0], 4: [1] }, 2: { 2: [0, 1], 4: [1, 3] }, 4: { 4: [0, 1, 2, 3] } };   // Riegel -> Slots (A2/B2 zuerst)

/** Regeln ohne Geometrie. Liefert { errors:[], warnings:[] } mit Teile-IDs. */
export function compat(spec) {
  const errors = [], warnings = [], raw = {};
  const get = (id) => (raw[id] ||= buildPartRaw(id));
  const err = (part, msg) => errors.push({ part, msg });
  const c = spec.case && get(spec.case), mb = spec.mobo && get(spec.mobo), cp = spec.cpu && get(spec.cpu), co = spec.cooler && get(spec.cooler);
  const rm = spec.ram && get(spec.ram), gp = spec.gpu && get(spec.gpu), ps = spec.psu && get(spec.psu);
  if (mb && cp) { const a = portOf(mb, "cpu").meta.socket, b = portOf(cp, "socket").meta.socket; if (a !== b) err(spec.cpu, `CPU-Sockel ${b.toUpperCase()} passt nicht auf Mainboard-Sockel ${a.toUpperCase()}`); }
  if (cp && co) { const b = portOf(cp, "ihs").meta.socket, base = (co.userData.members ? co.userData.members[0].ports[0] : portOf(co, "base")); if (!base.meta.sockets.includes(b)) err(spec.cooler, `Kuehler unterstuetzt Sockel ${b.toUpperCase()} nicht`); }
  if (mb && rm) { const n = rm.userData.members.length, st = rm.userData.members[0].ports[0].meta.ddr, d = mb.userData.dims;
    if (st !== d.ddr) err(spec.ram, `DDR${st}-Speicher passt nicht in DDR${d.ddr}-Slots`); else if (!DIMM_PICK[n] || !DIMM_PICK[n][d.dimm]) err(spec.ram, `${n} Riegel passen nicht auf ${d.dimm} Slots`); }
  if (c && mb) { const f = portOf(mb, "board").meta.form; if (!portOf(c, "mobo").meta.forms.includes(f)) err(spec.mobo, `Formfaktor ${f} passt nicht ins Gehaeuse`); }
  if (c && ps && !portOf(c, "psu").meta.forms.includes("atx")) err(spec.psu, "Netzteil-Formfaktor passt nicht");
  if (c && co && co.userData.dims.kind === "aio") { const mx = c.userData.dims.radMax, r = co.userData.dims.rad; if (!mx) err(spec.cooler, "Gehaeuse hat keinen Radiatorplatz"); else if (r > mx) err(spec.cooler, `${r} mm Radiator passt nicht (max. ${mx} mm)`); }
  if (mb && gp && !portsOf(mb, "host", "pcie").some((p) => p.meta.primary)) err(spec.gpu, "Mainboard hat keinen x16-Slot");
  const ss = [].concat(spec.ssd || []);
  if (mb && ss.length) { let m2 = 0, sata = 0; ss.forEach((id) => (get(id).userData.ports[0].kind === "m2" ? m2++ : sata++));
    if (m2 > mb.userData.dims.m2) err(ss.find((id) => get(id).userData.ports[0].kind === "m2"), `Nur ${mb.userData.dims.m2} M.2-Slots vorhanden`);
    if (sata > 2) err(ss.find((id) => get(id).userData.ports[0].kind !== "m2"), "Nur 2 SATA-Schaechte im Gehaeuse"); }
  return { errors, warnings };
}

const box = (o) => { const b = new THREE.Box3().setFromObject(o); return { min: [b.min.x, b.min.y, b.min.z], max: [b.max.x, b.max.y, b.max.z] }; };
const overlap = (a, b, tol = 0) => [0, 1, 2].map((i) => Math.min(a.max[i], b.max[i]) - Math.max(a.min[i], b.min[i]) - tol);
/** Teile mit userData.body (z.B. Netzteil ohne Kabel) werden ueber ihr Gehaeuse geprueft: lokale Box -> Welt */
function partBox(p) {
  const bd = p.obj.userData.body; if (!bd) return box(p.obj);
  const m = p.obj.userData.world, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let k = 0; k < 8; k++) { const q = point(m, [k & 1 ? bd.max[0] : bd.min[0], k & 2 ? bd.max[1] : bd.min[1], k & 4 ? bd.max[2] : bd.min[2]]); for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i]); hi[i] = Math.max(hi[i], q[i]); } }
  return { min: lo, max: hi };
}
/** Boxen aller Einzelkoerper (Mesh) im Welt-Raum - feinere Pruefung als eine grosse Huellbox (Luft unter Kuehlerlamellen etc.) */
function meshBoxes(o) {
  o.updateMatrixWorld(true); const out = [], v = new THREE.Vector3();
  o.traverse((m) => { if (!m.isMesh || !m.visible) return; for (let a = m.parent; a; a = a.parent) if (a.userData && a.userData.flex) return; const p = m.geometry.attributes ? m.geometry.attributes.position.array : m.geometry.position; const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let i = 0; i < p.length; i += 3) { v.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(m.matrixWorld); lo[0] = Math.min(lo[0], v.x); lo[1] = Math.min(lo[1], v.y); lo[2] = Math.min(lo[2], v.z); hi[0] = Math.max(hi[0], v.x); hi[1] = Math.max(hi[1], v.y); hi[2] = Math.max(hi[2], v.z); }
    out.push({ min: lo, max: hi }); });
  return out;
}

/** Kompletten PC bauen. spec = { case, mobo, cpu, cooler, ram, gpu, ssd:[...], psu }; fehlende Teile werden einfach weggelassen. */
export function buildSystem(spec, opts = {}) {
  const root = new THREE.Group(), parts = [], at = {}, byRole = {};
  const add = (role, id, obj, host) => { obj.userData.role = role; obj.userData.partId = id; root.add(obj); parts.push({ role, id, obj, host }); byRole[role] = obj; return obj; };
  const c = spec.case ? add("case", spec.case, buildPartRaw(spec.case)) : null; if (c) { c.userData.world = I4(); place(c, I4()); if (opts.shroud === false && c.userData.shroud) c.userData.shroud.visible = false; }
  const mb = spec.mobo ? add("mobo", spec.mobo, buildPartRaw(spec.mobo)) : null;
  if (mb) { if (c) mountPart(c, "mobo", mb, "board"); else { mb.userData.world = I4(); place(mb, I4()); } }
  const need = (o, port) => o && (o.userData.ports || []).some((p) => p.id === port);
  const cp = mb && spec.cpu ? add("cpu", spec.cpu, buildPartRaw(spec.cpu)) : null; if (cp) mountPart(mb, "cpu", cp, "socket");
  if (cp && spec.cooler) {
    const raw = buildPartRaw(spec.cooler);
    if (raw.userData.members) {                                                    // AIO: Block auf die CPU, Radiator ins Gehaeuse
      const [bm, rm] = raw.userData.members, blk = add("cooler", spec.cooler + ":block", bm.obj), rad = add("radiator", spec.cooler + ":rad", rm.obj);
      mountPart(cp, "ihs", blk, "base", bm.ports[0]);
      if (c && need(c, "rad-top")) mountPart(c, "rad-top", rad, "rad", rm.ports[0]); else { rad.userData.world = mul(blk.userData.world, [1, 0, 0, 188, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); place(rad, rad.userData.world); }
      raw.userData.connect(blk.userData.world, rad.userData.world);
      blk.userData.raw = raw;
    } else { const co = add("cooler", spec.cooler, raw); mountPart(cp, "ihs", co, "base"); }
  }
  if (mb && spec.ram) {
    const raw = buildPartRaw(spec.ram), mem = raw.userData.members, slots = (DIMM_PICK[mem.length] || {})[mb.userData.dims.dimm] || [];
    mem.forEach((m, i) => { if (slots[i] === undefined) return; const o = add("ram", spec.ram + "#" + i, m.obj); mountPart(mb, "dimm" + slots[i], o, "stick", m.ports[0]); });
  }
  if (mb && spec.gpu) { const gp = add("gpu", spec.gpu, buildPartRaw(spec.gpu)), slot = portsOf(mb, "host", "pcie").find((p) => p.meta.primary); if (slot) mountPart(mb, slot.id, gp, "pcie"); }
  if (spec.psu && c) { const p = add("psu", spec.psu, buildPartRaw(spec.psu)); mountPart(c, "psu", p, "body"); }
  let m2 = 0, sata = 0;
  [].concat(spec.ssd || []).forEach((id, i) => {
    const d = buildPartRaw(id), isM2 = d.userData.ports[0].kind === "m2", o = add("ssd", id + "#" + i, d);
    if (isM2 && mb && m2 < mb.userData.dims.m2) { const hp = portOf(mb, "m2_" + m2); mountPart(mb, hp.id, o, "m2"); if (hp.shield) hp.shield.visible = false; m2++; }
    else if (!isM2 && c) mountPart(c, "sata" + sata++, o, "bay");
  });
  const group = new THREE.Group(); group.add(root); group.scale.setScalar(0.01);
  const sys = { root, group, parts, byRole, spec };
  sys.report = checkBuild(sys);
  return sys;
}

/** Geometrie-Pruefung: Teile im Gehaeuse-Innenraum, keine Ueberschneidungen (ausser an den Steckverbindungen), keine Luefter-Sperrzonen. */
export function checkBuild(sys, tol = 0.6) {
  const errors = [], warnings = [], c = sys.byRole.case, boxes = sys.parts.map((p) => ({ ...p, b: partBox(p) }));
  const name = (p) => p.id;
  if (c) {
    const it = c.userData.interior;
    boxes.filter((p) => p.role !== "case").forEach((p) => {
      const o = [0, 1, 2].map((i) => Math.max(it.min[i] - p.b.min[i], p.b.max[i] - it.max[i]));
      if (o.some((v) => v > tol)) errors.push({ part: name(p), msg: `ragt ${o.map((v, i) => (v > tol ? "xyz"[i] + " " + v.toFixed(1) + " mm" : null)).filter(Boolean).join(", ")} aus dem Gehaeuse-Innenraum` });
    });
    (c.userData.keepout || []).forEach((k) => boxes.forEach((p) => { if (p.role === "case" || p.role === "mobo") return; if (!overlap(p.b, k).every((v) => v > 1)) return;
      if (meshBoxes(p.obj).some((x) => overlap(x, k).every((v) => v > 1))) errors.push({ part: name(p), msg: `kollidiert mit ${k.n}` }); }));
  }
  const skip = (a, b) => a.role === "case" || b.role === "case" || a.role === "mobo" || b.role === "mobo" || (a.role === "ram" && b.role === "ram") || (a.role === "cooler" && b.role === "radiator") || (a.role === "radiator" && b.role === "cooler");
  const mb = new Map();
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j]; if (skip(a, b)) continue;
    const o = overlap(a.b, b.b); if (!o.every((v) => v > 0.5)) continue;                        // Huellboxen beruehren sich nicht -> fertig
    const ma = mb.get(a) || (mb.set(a, meshBoxes(a.obj)), mb.get(a)), mbb = mb.get(b) || (mb.set(b, meshBoxes(b.obj)), mb.get(b));
    let worst = null;
    for (const x of ma) { if (!overlap(x, b.b).every((v) => v > 0.5)) continue; for (const y of mbb) { const q = overlap(x, y); if (q.every((v) => v > 0.5)) { const dep = Math.min(...q); if (!worst || dep > worst.dep) worst = { dep, q }; } } }
    if (worst) errors.push({ part: name(a) + " / " + name(b), msg: `Ueberschneidung ${worst.q.map((v) => v.toFixed(1)).join(" x ")} mm` });
  }
  return { ok: errors.length === 0, errors, warnings };
}

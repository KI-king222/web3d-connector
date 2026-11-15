import * as THREE from "three";
import { bx, rb, cy, cable, label, gpuFan, gpuPlate, hex6 } from "./components.js";
export { THREE, bx, rb, cy, cable, label, gpuFan, gpuPlate, hex6 };

/* Gemeinsame Bausteine fuer alle Katalog-Teile. Alles in Millimetern, Ursprung = Mitte der Unterseite, x = Laenge, y = hoch, z = Breite. */

const cache = new Map();
/** Gecachtes Material: gleiche Farbe + Optionen = gleiches Material (spart Speicher und Draw-State-Wechsel). */
export const M = (c, o = {}) => {
  const k = c + "|" + JSON.stringify(o); let m = cache.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.45, ...o }); cache.set(k, m); }
  return m;
};
/** Leuchtendes Material */
export const G = (c, i = 1.2) => {
  const k = "g" + c + "|" + i; let m = cache.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i }); cache.set(k, m); }
  return m;
};
export const plastic = (c = 0x16161a, r = 0.62) => M(c, { metalness: 0.08, roughness: r });
export const metal = (c = 0xaeb3bb, r = 0.32) => M(c, { metalness: 0.92, roughness: r });
export const brushed = (c = 0x9a9fa8) => M(c, { metalness: 0.85, roughness: 0.5 });
export const coat = (c = 0x1a1a1f, m = 0.55, r = 0.5) => M(c, { metalness: m, roughness: r });
export const GOLD = () => M(0xd9b44a, { metalness: 1, roughness: 0.28 });
export const BLACK = () => M(0x0b0b0d, { metalness: 0.2, roughness: 0.7 });
export const glass = (c = 0x9fb4c8, o = 0.18) => M(c, { transparent: true, opacity: o, metalness: 0.9, roughness: 0.05, depthWrite: false });

export const grp = (...kids) => { const g = new THREE.Group(); kids.flat().forEach((k) => k && g.add(k)); return g; };
/** Position/Rotation setzen und das Objekt zurueckgeben. */
export const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
export const R = (deg) => (deg * Math.PI) / 180;

/** Beschriftung, die flach auf einer Oberflaeche liegt (Blick von oben, Text liest sich von links nach rechts). */
export function flat(text, w, h, x, y, z, o = {}) {
  const l = label(text, w, h, { color: o.color || "#ffffff", opacity: o.opacity ?? 0.9, bg: o.bg });
  l.rotation.x = -Math.PI / 2; if (o.rot) l.rotation.z = o.rot; l.position.set(x, y, z); return l;
}
/** Beschriftung auf einer senkrechten Flaeche mit Normale +z (face "+z"), -z, +x oder -x. */
export function wall(text, w, h, x, y, z, face = "+z", o = {}) {
  const l = label(text, w, h, { color: o.color || "#ffffff", opacity: o.opacity ?? 0.9, bg: o.bg });
  l.rotation.y = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 }[face]; l.position.set(x, y, z); return l;
}
/** Liegender Ring (Torus, Achse = y) */
export const ring = (r, tube, m, x = 0, y = 0, z = 0, seg = 48) => {
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, seg), m); o.rotation.x = Math.PI / 2; o.position.set(x, y, z); o.castShadow = true; return o;
};
/** Zylinder mit zwei Radien (Achse = y) */
export const cone = (rt, rb2, h, m, x = 0, y = 0, z = 0, seg = 40) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb2, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
};
/** Liegender Zylinder entlang x (Achse = x) */
export const cyx = (r, len, m, x = 0, y = 0, z = 0, seg = 20) => { const o = cy(r, len, m, x, y, z, seg); o.rotation.z = Math.PI / 2; return o; };
/** Liegender Zylinder entlang z */
export const cyz = (r, len, m, x = 0, y = 0, z = 0, seg = 20) => { const o = cy(r, len, m, x, y, z, seg); o.rotation.x = Math.PI / 2; return o; };

/** Platte aus Umriss in der x/z-Ebene: pts = [[x,z],...], depth = Dicke nach oben (y), Unterkante bei y. holes = [{x,z,r}] oder [[[x,z],...]] */
export function plate(pts, depth, m, x = 0, y = 0, z = 0, holes = []) {
  const s = new THREE.Shape(); pts.forEach(([px, pz], i) => (i ? s.lineTo(px, -pz) : s.moveTo(px, -pz)));
  holes.forEach((h) => {
    const p = new THREE.Path();
    if (Array.isArray(h)) h.forEach(([px, pz], i) => (i ? p.lineTo(px, -pz) : p.moveTo(px, -pz)));
    else p.absarc(h.x, -h.z, h.r, 0, Math.PI * 2, true);
    s.holes.push(p);
  });
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 48 });
  geo.rotateX(-Math.PI / 2);
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
}
/** Profil in der x/y-Ebene (Seitenansicht), extrudiert ueber die Dicke t in z (zentriert um z). */
export function profile(pts, t, m, x = 0, y = 0, z = 0) {
  const s = new THREE.Shape(); pts.forEach(([px, py], i) => (i ? s.lineTo(px, py) : s.moveTo(px, py)));
  const geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  geo.translate(0, 0, -t / 2);
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
}
/** Abgerundetes Rechteck als Punkteliste (fuer plate/profile) */
export function rrect(w, d, r, n = 6, cx = 0, cz = 0) {
  const p = [], k = Math.min(r, w / 2, d / 2);
  [[w / 2 - k, d / 2 - k, 0], [-w / 2 + k, d / 2 - k, 90], [-w / 2 + k, -d / 2 + k, 180], [w / 2 - k, -d / 2 + k, 270]].forEach(([ox, oz, a0]) => {
    for (let i = 0; i <= n; i++) { const a = R(a0 + (90 * i) / n); p.push([cx + ox + k * Math.cos(a), cz + oz + k * Math.sin(a)]); }
  });
  return p;
}
/** Achsparalleles Rechteck [[x,z]...] */
export const rectPts = (w, d, cx = 0, cz = 0) => [[cx - w / 2, cz - d / 2], [cx + w / 2, cz - d / 2], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]];

/** Quadratischer Rahmenluefter (z.B. 120/140 mm), Achse = y, Rahmen unten bei y=0 .. y=th. Rotor dreht ueber userData.spin. */
export function frameFan(size, th = 25, o = {}) {
  const g = new THREE.Group();
  const body = o.body ?? 0x16171b, acc = o.accent ?? 0x00e5ff, hole = size / 2 - 2.5;
  g.add(plate(rrect(size, size, 4), th, plastic(body, 0.55), 0, 0, 0, [{ x: 0, z: 0, r: hole }]));
  // Innenring + Nabe + Blaetter
  const f = gpuFan(hole * 2 - 1, { accent: acc, blade: o.blade, hub: o.hub }, o.speed ?? 8, o.blades ?? 9); f.position.y = th * 0.5; g.add(f);
  if (o.rgb) { g.add(ring(hole - 1.5, 1.3, G(acc, o.rgbPower ?? 1.0), 0, th - 0.6, 0, 64)); }
  if (o.corners !== false) [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => g.add(cy(1.7, 0.8, M(0x0a0a0c, { metalness: 0.2 }), a * (size / 2 - 4.2), th + 0.1, b * (size / 2 - 4.2), 10)));
  if (o.tint) g.add(ring(hole + 1, 0.8, M(o.tint, { metalness: 0.7, roughness: 0.3 }), 0, th, 0, 64));
  return g;
}

/** Kreisfoermiger Luefter-Schutzgrill (Ringe + Speichen), liegend, Mitte (x,y,z), Radius r */
export function grille(r, m, x, y, z, rings = 5, spokes = 12, wire = 0.9) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  for (let i = 1; i <= rings; i++) g.add(ring((r * i) / rings, wire, m, 0, 0, 0, 56));
  for (let i = 0; i < spokes; i++) { const b = bx(r * 2, wire * 1.6, wire * 1.6, m); b.rotation.y = (i * Math.PI) / spokes; g.add(b); }
  return g;
}
/** Reihe aus n Boxen entlang x (z.B. Lueftungsschlitze) */
export function slots(n, w, h, d, m, x0, dx, y, z) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(bx(w, h, d, m, x0 + i * dx, y, z)); return g; }
/** Seed-basierter Zufall (stabil zwischen Aufrufen) */
export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Kleine SMD-Bauteile (Kondensatoren/Widerstaende) als Raster in Box um (cx, cz) */
export function smd(nx, nz, px, pz, cx, y, cz, m = M(0x7a6a4a, { metalness: 0.2, roughness: 0.6 }), sz = [1.6, 0.8, 0.9]) {
  const g = new THREE.Group(); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) g.add(bx(sz[0], sz[1], sz[2], m, cx + (i - (nx - 1) / 2) * px, y + sz[1] / 2, cz + (j - (nz - 1) / 2) * pz));
  return g;
}
/** Schraube (Kopf) */
export const screw = (x, y, z, r = 2.2, m = metal(0xb9bec6)) => grp(cy(r, 1.2, m, x, y + 0.6, z, 12), bx(r * 1.4, 0.3, 0.5, BLACK(), x, y + 1.25, z));

/** Teil abschliessen: mm -> Szeneneinheit (0.01) */
export function finish(g, meta = {}) { g.userData.meta = meta; return g; }

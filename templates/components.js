import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* =====================================================================
 * KONVENTIONEN (bitte einhalten, dann passen Teile zusammen)
 * - Intern alles in MILLIMETERN. buildPC() skaliert am Ende mit 0.01
 *   (1 Szeneneinheit = 10 cm).
 * - Lokale Achsen eines Bauteils (liegend auf dem Tisch):
 *     x = Laenge, y = hoch/Dicke, z = Breite. Ursprung = Mitte der Unterseite
 *     (Auflageflaeche). Ausnahme: "case" ist um den Mittelpunkt zentriert.
 * - Case-Koordinaten: x = Breite (+x = Glasseite), y = hoch, z = Tiefe (+z = vorne).
 * - Mainboard-Frame ("mob" im Preset "system"): lokal x = Platinenlaenge
 *   (hinten -> vorne), y = Abstand von der Platine, z = Platinenbreite (unten -> oben).
 * - Neue Teile: Funktion in Objekt B ergaenzen, Primitive nutzen: bx, rb, cy, fan, cable.
 * ===================================================================== */

export const THEMES = {
  stealth: { body: 0x1a1a1f, accent: 0x00e5ff, pcb: 0x12161a, metal: 0x9aa0aa },
  white:   { body: 0xf2f2f2, accent: 0xff4081, pcb: 0xdedede, metal: 0xd0d3d8 },
  rgb:     { body: 0x15151a, accent: 0xff00ff, pcb: 0x14141c, metal: 0x8a8f9a },
  retro:   { body: 0xd8d0b8, accent: 0x3f51b5, pcb: 0x1f5a2d, metal: 0xb8b8b0 },
};

/* ---------- Primitive ---------- */
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.45, ...o });
const glow = (c, i = 1.4) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
const dark = () => mat(0x0b0b0d, { metalness: 0.2, roughness: 0.7 });
const gold = () => mat(0xd4af37, { metalness: 1, roughness: 0.3 });
const shadow = (o) => { o.castShadow = o.receiveShadow = true; return o; };

/** Box: Breite, Hoehe, Tiefe, Material, Position */
export const bx = (w, h, d, m, x = 0, y = 0, z = 0) => {
  const o = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)); o.position.set(x, y, z); return o;
};
/** Abgerundete Box (r = Kantenradius) */
export const rb = (w, h, d, m, r = 1.5, x = 0, y = 0, z = 0) => {
  const rr = Math.min(r, w / 2, h / 2, d / 2) * 0.98;
  const o = shadow(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rr), m)); o.position.set(x, y, z); return o;
};
/** Zylinder (Achse = y) */
export const cy = (r, h, m, x = 0, y = 0, z = 0, seg = 24) => {
  const o = shadow(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m)); o.position.set(x, y, z); return o;
};
/** Kabel entlang Punkten [[x,y,z],...] */
export function cable(pts, color = 0x151518, r = 3) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  return shadow(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, r, 8, false), mat(color, { metalness: 0.1, roughness: 0.7 })));
}
/** Luefter (Achse = y, zentriert, 25 mm dick). Rotor dreht ueber userData.spin */
export function fan(size, t, speed = 8, blades = 9) {
  const g = new THREE.Group(), th = 25, w = 3.5, inner = size - 2 * w;
  const m = mat(t.body, { metalness: 0.2, roughness: 0.6 });
  g.add(rb(size, th, w, m, 1, 0, 0, size / 2 - w / 2), rb(size, th, w, m, 1, 0, 0, -size / 2 + w / 2),
        rb(w, th, inner, m, 1, size / 2 - w / 2, 0, 0), rb(w, th, inner, m, 1, -size / 2 + w / 2, 0, 0));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(size * 0.46, 1.1, 8, 40), glow(t.accent));
  ring.rotation.x = Math.PI / 2; ring.position.y = th / 2 - 1; g.add(ring);
  const rotor = new THREE.Group(); rotor.userData.spin = speed;
  for (let i = 0; i < blades; i++) {
    const p = new THREE.Group(); p.rotation.y = (i * Math.PI * 2) / blades;
    const b = bx(size * 0.34, 1.2, size * 0.14, m, size * 0.27, 0, 0); b.rotation.x = 0.45;
    p.add(b); rotor.add(p);
  }
  rotor.add(cy(size * 0.13, th * 0.6, m));
  g.add(rotor); return g;
}

/* ---------- Layouts & Masse ---------- */
const FORMS = { atx: [305, 244], matx: [244, 244], itx: [170, 170] };
/** Positionen auf dem Mainboard (Mainboard-Frame, mm). */
export function mbLayout(form = "atx") {
  const [L, W] = FORMS[form] || FORMS.atx;
  const sx = -L / 2 + 0.33 * L, sz = W * 0.1;
  return {
    L, W, socket: [sx, sz],
    ram: { x0: sx + 70, z: sz, pitch: 8.5, n: form === "itx" ? 2 : 4 },
    pcie: [-L / 2 + 60, -W * 0.18], m2: [sx - 5, -W * 0.06],
    atx24: [L / 2 - 6, W * 0.1], cpu8: [sx - 30, W / 2 - 8],
  };
}
export const CASES = { mini: { W: 200, H: 380, D: 380 }, mid: { W: 230, H: 480, D: 460 }, full: { W: 250, H: 560, D: 520 } };
export function caseDims(size = "mid") {
  const c = CASES[size] || CASES.mid;
  return { ...c, trayX: -c.W / 2 + 28, shroudY: -c.H / 2 + 110 };
}
const P = {
  gpu: { compact: { length: 240, width: 112, slots: 2, fans: 2 }, standard: {}, flagship: { length: 336, width: 140, slots: 3.5, fans: 3 } },
  cooler: { lowprofile: { height: 70, fins: 24, fans: 1 }, tower: {}, dual: { height: 165, fans: 2, fins: 44 } },
};

/* ---------- Bauteile ---------- */
const B = {
  // NOTE: Full component library truncated in this push attempt - will complete in follow-up
  gpu(t, o = {}) {
    const p = { length: 280, width: 120, slots: 2.5, fans: 3, ...P.gpu[o.preset] || {}, ...o };
    const g = new THREE.Group();
    const m = mat(t.body), ac = glow(t.accent);
    g.add(rb(p.length, 40 * p.slots, p.width, m, 2));
    for (let i = 0; i < p.fans; i++) {
      const f = fan(80, t, 10); f.position.set(-p.length / 2 + 50 + i * 90, 20, 0); g.add(f);
    }
    return g;
  },
};

export function buildPC(kind, variant = "stealth", accent, options) {
  const t = { ...THEMES[variant] || THEMES.stealth };
  if (accent) t.accent = new THREE.Color(accent).getHex();
  const root = new THREE.Group(), inner = (B[kind] || B.gpu)(t, options || {});
  inner.scale.setScalar(0.01);
  root.add(inner);
  return root;
}

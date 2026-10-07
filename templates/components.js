import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* =====================================================================
 * KONVENTIONEN (bitte einhalten, dann passen Teile zusammen)
 * - Intern alles in MILLIMETERN. buildPC() skaliert am Ende mit 0.01
 *   (1 Szeneneinheit = 10 cm).
 * - Lokale Achsen eines Bauteils (liegend auf dem Tisch / Standard):
 *     X = Breite, Y = Höhe, Z = Tiefe
 * - Gehäuse: Front = +Z, Rückseite = -Z, links = -X, rechts = +X
 * ===================================================================== */

export const THEMES = {
  stealth: { body: 0x1a1a1f, accent: 0x00e5ff },
  white:   { body: 0xf2f2f2, accent: 0xff4081 },
  rgb:     { body: 0x15151a, accent: 0xff00ff },
  retro:   { body: 0xd8d0b8, accent: 0x3f51b5 },
};

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.45, roughness: 0.5, ...o });
const glow = (c, i = 1.2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4, metalness: 0.15 });

function bx(w, h, d, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
}
function rb(w, h, d, r, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
}
function cy(r, h, m, x = 0, y = 0, z = 0, seg = 24) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  o.position.set(x, y, z); o.castShadow = true; return o;
}
function fan(r, t, speed = 8) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.06, 8, 32), glow(t.accent));
  ring.rotation.x = Math.PI / 2; g.add(ring);
  const rotor = new THREE.Group(); rotor.userData.spin = speed;
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Group(); p.rotation.y = (i * Math.PI * 2) / 7;
    const b = bx(r * 0.9, 2, r * 0.28, mat(t.body), r * 0.5, 0, 0); b.rotation.x = 0.35;
    p.add(b); rotor.add(p);
  }
  rotor.add(cy(r * 0.22, 6, mat(t.body)));
  g.add(rotor); return g;
}
function faceZ(f, x, y, z) { f.rotation.x = Math.PI / 2; f.position.set(x, y, z); return f; }
function cable(pts, color = 0x222222, r = 2) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, r, 6, false), mat(color, { roughness: 0.8 }));
  mesh.castShadow = true; return mesh;
}

const B = {
  gpu(t, opt = {}) {
    const g = new THREE.Group();
    const L = opt.length || 300, H = 40, D = 120;
    g.add(rb(L, H, D, 3, mat(t.body)));
    g.add(bx(L - 4, 3, D - 4, mat(0x0a3d1a), 0, -H / 2 + 2, 0));
    g.add(bx(L - 10, 3, 4, glow(t.accent), 0, H / 2 - 2, D / 2 - 4));
    const n = opt.fans || 3;
    for (let i = 0; i < n; i++) {
      const f = fan(28, t);
      f.position.set((i - (n - 1) / 2) * 70, H / 2 - 2, 0);
      g.add(f);
    }
    g.add(bx(4, 80, 100, mat(0xb0b4ba, { metalness: 0.7 }), -L / 2 + 2, -10, 0));
    g.add(bx(12, 8, 55, mat(0xc9a227, { metalness: 0.85 }), -L / 2 + 20, -H / 2 + 6, 0));
    return g;
  },
  cooler(t, opt = {}) {
    const g = new THREE.Group();
    g.add(rb(75, 10, 75, 2, mat(0xb87333, { metalness: 0.7 })));
    const fins = opt.fins || 18;
    for (let i = 0; i < fins; i++) g.add(bx(110, 2.5, 85, mat(0xc8c8d0, { metalness: 0.6 }), 0, 12 + i * 7, 0));
    [-20, 0, 20].forEach((x) => g.add(cy(4, 140, mat(0xb87333, { metalness: 0.8 }), x, 80, 0)));
    g.add(bx(115, 5, 90, glow(t.accent), 0, 150, 0));
    g.add(faceZ(fan(35, t), 0, 80, 48));
    return g;
  },
  ram(t, opt = {}) {
    const g = new THREE.Group();
    const n = opt.sticks || 2;
    for (let i = 0; i < n; i++) {
      const x = i * 12;
      g.add(bx(3.5, 30, 133, mat(0x1b5e20), x, 0, 0));
      g.add(bx(5, 8, 133, mat(t.body), x, 18, 0));
      g.add(bx(5.5, 2.5, 120, glow(t.accent), x, 24, 0));
    }
    return g;
  },
  motherboard(t) {
    const g = new THREE.Group();
    // ATX-ish PCB, thin in Y when flat; for case we'll orient externally
    g.add(rb(305, 6, 244, 2, mat(0x0e3a18)));
    g.add(bx(50, 5, 50, mat(0x222222), 20, 5, -40));
    g.add(bx(55, 4, 55, mat(0xb8bec5, { metalness: 0.6 }), 20, 4, -40));
    for (let i = 0; i < 4; i++) g.add(bx(7, 12, 130, mat(t.body), 100 + i * 12, 8, -20));
    g.add(bx(28, 18, 28, mat(0x888888, { metalness: 0.5 }), -60, 10, 40));
    g.add(bx(140, 8, 10, mat(0x111111), 0, 6, 60));
    g.add(bx(90, 8, 8, glow(t.accent), -80, 5, 100));
    for (let i = 0; i < 6; i++) g.add(bx(12, 8, 18, mat(0x333333), -120, 6, -80 + i * 22));
    return g;
  },
  psu(t) {
    const g = new THREE.Group();
    g.add(rb(150, 86, 140, 3, mat(t.body)));
    g.add(faceZ(fan(35, t, 5), 0, 0, 72));
    g.add(bx(40, 18, 25, mat(0x111111), 40, 0, 70));
    g.add(bx(35, 4, 25, glow(t.accent), 35, 40, 0));
    return g;
  },
  case(t) {
    const g = new THREE.Group();
    const W = 220, H = 450, D = 450;
    const m = mat(t.body);
    const panel = mat(0x12151a);
    g.add(bx(W, 6, D, m, 0, -H / 2, 0));
    g.add(bx(W, 6, D, m, 0, H / 2, 0));
    g.add(bx(W, H, 6, panel, 0, 0, -D / 2));
    g.add(bx(W * 0.9, 40, 5, m, 0, -H / 2 + 25, D / 2));
    g.add(bx(6, H, D, panel, -W / 2, 0, 0));
    g.add(bx(8, 120, 70, mat(0x0a0c10), -W / 2 - 2, 90, -60));
    for (let i = 0; i < 7; i++) g.add(bx(5, 12, 120, mat(0x2a2e34), -W / 2 - 1, -20 - i * 22, 20));
    g.add(bx(5, 70, 90, mat(0x1a1e24), -W / 2 - 1, -H / 2 + 55, -30));
    g.add(bx(4, H - 20, D - 20, mat(0x88aacc, { transparent: true, opacity: 0.12, metalness: 0.9, roughness: 0.05 }), W / 2, 0, 0));
    g.add(bx(4, H - 50, 4, glow(t.accent), 0, 0, D / 2 + 3));
    for (let i = 0; i < 5; i++) g.add(bx(35, 5, 100, mat(0x3a4050), W / 2 - 35, H / 2 - 60 - i * 35, 0));
    return g;
  },
  fan(t) { return fan(60, t); },
};

export const KINDS = Object.keys(B);

/** options: kind-specific (fans, length, sticks, fins, …) */
export function buildPC(kind, variant = "stealth", accent, options) {
  const t = { ...(THEMES[variant] || THEMES.stealth) };
  if (accent) t.accent = new THREE.Color(accent).getHex();
  const g = (B[kind] || B.gpu)(t, options || {});
  g.scale.setScalar(0.01); // mm → scene units
  return g;
}

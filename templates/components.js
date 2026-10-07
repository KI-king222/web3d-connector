import * as THREE from "three";

// 1 Einheit = ca. 10 cm
export const THEMES = {
  stealth: { body: 0x1a1a1f, accent: 0x00e5ff },
  white:   { body: 0xf2f2f2, accent: 0xff4081 },
  rgb:     { body: 0x15151a, accent: 0xff00ff },
  retro:   { body: 0xd8d0b8, accent: 0x3f51b5 },
};

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.45, ...o });
const glow = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2 });
const box = (w, h, d, m, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o;
};
const cyl = (r, h, m, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), m);
  o.position.set(x, y, z); o.castShadow = true; return o;
};

// Luefter liegt flach (Achse = Y). Rotor dreht ueber userData.spin.
function fan(r, t, speed = 8) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.06, 8, 32), glow(t.accent));
  ring.rotation.x = Math.PI / 2; g.add(ring);
  const rotor = new THREE.Group(); rotor.userData.spin = speed;
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Group(); p.rotation.y = (i * Math.PI * 2) / 7;
    const b = box(r * 0.9, 0.02, r * 0.28, mat(t.body), r * 0.5, 0, 0); b.rotation.x = 0.4;
    p.add(b); rotor.add(p);
  }
  rotor.add(cyl(r * 0.22, 0.06, mat(t.body)));
  g.add(rotor); return g;
}
const faceZ = (f, x, y, z) => { f.rotation.x = Math.PI / 2; f.position.set(x, y, z); return f; };

const B = {
  gpu(t) {
    const g = new THREE.Group();
    g.add(box(3.2, 0.55, 1.3, mat(t.body)));
    g.add(box(3.2, 0.04, 1.3, mat(0x999999), 0, -0.3, 0));
    g.add(box(3.2, 0.05, 0.05, glow(t.accent), 0, 0.29, 0.6));
    [-1, 0, 1].forEach((i) => { const f = fan(0.42, t); f.position.set(i * 1.05, 0.29, 0); g.add(f); });
    g.add(box(0.05, 0.9, 1.2, mat(0xbbbbbb), -1.65, -0.1, 0));
    return g;
  },
  cooler(t) {
    const g = new THREE.Group();
    g.add(box(0.9, 0.12, 0.9, mat(0xb87333), 0, 0, 0));
    for (let i = 0; i < 20; i++) g.add(box(1.4, 0.03, 1.0, mat(0xc8c8d0), 0, 0.2 + i * 0.1, 0));
    [-0.3, 0, 0.3].forEach((x) => g.add(cyl(0.04, 2.2, mat(0xb87333), x, 1.1, 0)));
    g.add(box(1.45, 0.06, 1.05, glow(t.accent), 0, 2.25, 0));
    g.add(faceZ(fan(0.45, t), 0, 1.2, 0.55));
    return g;
  },
  ram(t) {
    const g = new THREE.Group();
    [0, 0.12].forEach((x) => {
      g.add(box(0.04, 0.31, 1.33, mat(0x1b5e20), x, 0, 0));
      g.add(box(0.06, 0.08, 1.33, mat(t.body), x, 0.2, 0));
      g.add(box(0.07, 0.03, 1.2, glow(t.accent), x, 0.26, 0));
    });
    return g;
  },
  motherboard(t) {
    const g = new THREE.Group();
    g.add(box(3.05, 0.06, 3.05, mat(0x14301a)));
    g.add(box(0.5, 0.05, 0.5, mat(0xcccccc), 0.2, 0.05, -0.6));
    for (let i = 0; i < 4; i++) g.add(box(0.07, 0.1, 1.3, mat(t.body), 1.0 + i * 0.12, 0.08, -0.5));
    g.add(box(1.0, 0.18, 0.25, mat(t.body), -0.6, 0.12, -1.3));
    g.add(box(0.8, 0.12, 0.8, glow(t.accent), -0.9, 0.09, 0.9));
    g.add(box(2.2, 0.08, 0.1, mat(0x111111), 0, 0.07, 0.5));
    return g;
  },
  psu(t) {
    const g = new THREE.Group();
    g.add(box(1.5, 0.86, 1.4, mat(t.body)));
    g.add(faceZ(fan(0.38, t, 5), 0, 0, 0.71));
    g.add(box(0.5, 0.04, 0.3, glow(t.accent), 0.4, 0.44, 0));
    return g;
  },
  case(t) {
    const g = new THREE.Group(), W = 2.2, H = 4.7, D = 4.7;
    const m = mat(t.body);
    g.add(box(W, 0.06, D, m, 0, -H / 2, 0));
    g.add(box(W, 0.06, D, m, 0, H / 2, 0));
    g.add(box(W, H, 0.06, m, 0, 0, -D / 2));
    g.add(box(W, H, 0.06, m, 0, 0, D / 2));
    g.add(box(0.06, H, D, m, -W / 2, 0, 0));
    g.add(box(0.04, H, D, mat(0x88aacc, { transparent: true, opacity: 0.18, metalness: 0.9, roughness: 0.05 }), W / 2, 0, 0));
    g.add(box(0.04, H - 0.4, 0.04, glow(t.accent), 0, 0, D / 2 + 0.05));
    [-1.4, 0, 1.4].forEach((y) => g.add(faceZ(fan(0.6, t, 6), 0, y, D / 2 - 0.15)));
    [[-0.9, -1.9], [0.9, -1.9], [-0.9, 1.9], [0.9, 1.9]].forEach(([x, z]) => g.add(cyl(0.08, 0.15, mat(0x333333), x, -H / 2 - 0.1, z)));
    return g;
  },
  fan(t) { return fan(0.6, t); },
};

export const KINDS = Object.keys(B);

export function buildPC(kind, variant = "stealth", accent) {
  const t = { ...(THEMES[variant] || THEMES.stealth) };
  if (accent) t.accent = new THREE.Color(accent).getHex();
  return (B[kind] || B.gpu)(t);
}

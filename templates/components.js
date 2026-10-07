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
  fan(t, o = {}) { const g = new THREE.Group(), f = fan(o.size ?? 120, t, 8, o.blades ?? 9); f.position.y = 12.5; g.add(f); return g; },

  cpu(t) {
    const g = new THREE.Group();
    g.add(rb(40, 1.2, 40, mat(0x2f5d3a, { metalness: 0.3 }), 0.5, 0, 0.6, 0));
    g.add(rb(34, 2.4, 34, mat(0xc9ccd2, { metalness: 0.95, roughness: 0.22 }), 1.5, 0, 2.4, 0));
    g.add(bx(1.5, 0.3, 1.5, gold(), -15, 3.65, -15));
    return g;
  },

  cooler(t, o = {}) {
    const c = { height: 160, fins: 36, fans: 2, ...(P.cooler[o.preset] || {}), ...o };
    const h = c.height, g = new THREE.Group();
    const cu = mat(0xb87333, { metalness: 0.9, roughness: 0.3 }), al = mat(0xc8ccd4, { metalness: 0.85, roughness: 0.35 });
    const y0 = 12, hf = h - y0 - 8;
    g.add(rb(60, 6, 60, cu, 1, 0, 3, 0));
    for (let i = 0; i < c.fins; i++) g.add(bx(0.7, hf, 110, al, -25 + i * (50 / (c.fins - 1)), y0 + hf / 2, 0));
    [-40, -20, 0, 20, 40].forEach((z) => g.add(cy(3, hf + 10, cu, 0, y0 + hf / 2, z, 12)));
    g.add(rb(54, 4, 114, mat(t.body), 1.5, 0, h - 6, 0));
    g.add(bx(40, 0.8, 8, glow(t.accent), 0, h - 3.6, 0));
    const fs = Math.min(120, hf);
    for (let i = 0; i < c.fans; i++) { // Luefter-Achse = x (Luftstrom hinten -> vorne)
      const f = fan(fs, t, 8, 9); f.rotation.z = Math.PI / 2; f.position.set(i === 0 ? 38 : -38, y0 + hf / 2, 0); g.add(f);
    }
    return g;
  },

  aio(t, o = {}) {
    const k = Math.max(1, Math.round((o.radiator ?? 240) / 120)), L = 120 * k + 35, g = new THREE.Group();
    g.add(rb(60, 6, 60, mat(0xb87333, { metalness: 0.9, roughness: 0.3 }), 1, 0, 3, 0));
    g.add(cy(38, 38, mat(t.body), 0, 25, 0, 48));
    g.add(cy(30, 1, glow(t.accent), 0, 44.5, 0, 48));
    const rx = 150 + L / 2, ry = 35;
    g.add(rb(L, 27, 120, mat(0x2b2b30, { metalness: 0.7, roughness: 0.5 }), 3, rx, ry, 0));
    for (let i = 0; i < k; i++) { const f = fan(120, t, 8, 9); f.position.set(rx + (i - (k - 1) / 2) * 120, ry + 26, 0); g.add(f); }
    [-18, 18].forEach((z) => g.add(cable([[36, 25, z], [90, 25, z * 1.6], [rx - L / 2, ry, z]], 0x111114, 5)));
    return g;
  },

  ram(t, o = {}) {
    const n = o.sticks ?? 2, pitch = o.pitch ?? 17, g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const s = new THREE.Group(); s.position.z = (i - (n - 1) / 2) * pitch;
      s.add(bx(133, 31, 1.6, mat(t.pcb), 0, 15.5, 0));
      s.add(rb(131, 29, 3, mat(t.body, { metalness: 0.6 }), 1.5, 0, 16, 2.4), rb(131, 29, 3, mat(t.body, { metalness: 0.6 }), 1.5, 0, 16, -2.4));
      s.add(rb(124, 5, 7.4, glow(t.accent, 1.1), 1.5, 0, 33, 0));
      s.add(bx(130, 3, 1.7, gold(), 0, 1.5, 0));
      g.add(s);
    }
    return g;
  },

  motherboard(t, o = {}) {
    const m = mbLayout(o.form), { L, W } = m, top = 1.6, g = new THREE.Group();
    const body = mat(t.body, { metalness: 0.5, roughness: 0.5 });
    g.add(bx(L, 1.6, W, mat(t.pcb, { metalness: 0.2, roughness: 0.6 }), 0, 0.8, 0));
    g.add(bx(52, 4, 52, dark(), m.socket[0], top + 2, m.socket[1]));
    g.add(bx(41, 4.1, 41, mat(0xb9bcc2, { metalness: 0.8 }), m.socket[0], top + 2.05, m.socket[1]));
    for (let i = 0; i < m.ram.n; i++) g.add(bx(7, 8, 133, dark(), m.ram.x0 + i * m.ram.pitch, top + 4, m.ram.z));
    const slots = o.form === "itx" ? [[89, 0]] : [[25, 38], [89, 0], [89, -61]];
    slots.forEach(([len, dz]) => g.add(bx(len, 11, 8, dark(), m.pcie[0] - 44.5 + len / 2, top + 5.5, m.pcie[1] + dz)));
    g.add(rb(22, 18, 74, body, 2, m.socket[0] - 48, top + 9, m.socket[1]));
    g.add(rb(80, 22, 18, body, 2, m.socket[0], top + 11, W / 2 - 20));
    g.add(rb(30, 36, 100, body, 3, -L / 2 + 22, top + 18, m.socket[1] + 8));
    g.add(rb(46, 9, 46, body, 2, L / 2 - 75, top + 4.5, -W * 0.3));
    g.add(cy(7, 0.6, glow(t.accent), L / 2 - 75, top + 9.3, -W * 0.3, 32));
    g.add(bx(8, 12, 32, dark(), m.atx24[0], top + 6, m.atx24[1]));
    g.add(bx(18, 9, 11, dark(), m.cpu8[0], top + 4.5, m.cpu8[1]));
    [[-L / 2 + 8, -W / 2 + 8], [L / 2 - 8, -W / 2 + 8], [-L / 2 + 8, W / 2 - 8], [L / 2 - 8, W / 2 - 8]]
      .forEach(([x, z]) => g.add(cy(2.2, 1.2, mat(t.metal, { metalness: 0.9 }), x, top + 0.6, z, 16)));
    return g;
  },

  gpu(t, o = {}) {
    const c = { length: 300, width: 115, slots: 2.5, fans: 3, ...(P.gpu[o.preset] || {}), ...o };
    const L = c.length, Wd = c.width, T = c.slots * 20.3, n = c.fans, H = T - 5, g = new THREE.Group();
    const body = mat(t.body, { metalness: 0.3, roughness: 0.5 }), metal = mat(t.metal, { metalness: 0.9, roughness: 0.3 });
    g.add(rb(L - 8, 2, Wd, metal, 1, 0, 1, 0));                       // Backplate
    g.add(bx(L - 20, 1.6, Wd - 4, mat(t.pcb), 0, 3, 0));              // Platine
    const sy = 5 + H / 2;                                              // Kuehlerrahmen
    g.add(rb(L, H, 4, body, 1.5, 0, sy, Wd / 2 - 2), rb(L, H, 4, body, 1.5, 0, sy, -Wd / 2 + 2),
          rb(4, H, Wd, body, 1.5, L / 2 - 2, sy, 0), rb(4, H, Wd, body, 1.5, -L / 2 + 2, sy, 0));
    const size = Math.min(Wd - 14, (L - 16) / n);
    for (let i = 1; i < n; i++) g.add(bx(3, H, Wd - 8, body, (i - n / 2) * size, sy, 0));
    const fins = mat(t.metal, { metalness: 0.8, roughness: 0.4 });
    for (let i = 0; i < 44; i++) g.add(bx(0.7, Math.max(H - 27, 4), Wd - 10, fins, -L / 2 + 12 + i * ((L - 24) / 43), 6 + (H - 27) / 2, 0));
    for (let i = 0; i < n; i++) { const f = fan(size - 4, t, 9, 11); f.position.set((i - (n - 1) / 2) * size, T - 12.5, 0); g.add(f); }
    g.add(bx(L - 40, 1, 1.2, glow(t.accent), 0, T, Wd / 2 - 2));
    g.add(bx(89, 1.6, 6, gold(), -L / 2 + 60, 3, -Wd / 2 + 5));       // PCIe-Kontakte
    g.add(bx(1.6, T, Wd + 4, metal, -L / 2 - 0.8, T / 2, 0));          // Slotblende
    for (let i = 0; i < 4; i++) g.add(bx(3, 7, 15, dark(), -L / 2 - 1, T * 0.5, -Wd / 2 + 18 + i * 20));
    g.add(bx(22, 9, 12, dark(), L / 2 - 40, 9, Wd / 2 - 8));           // 12V-Stecker
    g.userData.dims = { L, Wd, T };
    return g;
  },

  ssd_sata(t) {
    const g = new THREE.Group();
    g.add(rb(100, 7, 69.85, mat(t.metal, { metalness: 0.9, roughness: 0.3 }), 1.5, 0, 3.5, 0));
    g.add(bx(80, 0.3, 50, mat(t.body), 0, 7.1, 0));
    g.add(bx(60, 0.35, 3, glow(t.accent), 0, 7.2, 14));
    g.add(bx(6, 2.4, 17, dark(), 52, 3.5, -22), bx(6, 2.4, 40, dark(), 52, 3.5, 12));
    return g;
  },

  ssd_m2(t, o = {}) {
    const g = new THREE.Group();
    g.add(bx(80, 0.9, 22, mat(t.pcb), 0, 0.45, 0));
    for (let i = 0; i < 4; i++) g.add(bx(i === 0 ? 12 : 14, 1.1, i === 0 ? 12 : 14, dark(), -22 + i * 15, 1.4, 0));
    g.add(bx(7, 0.9, 18, gold(), -36.5, 0.45, 0));
    if (o.heatsink ?? true) {
      g.add(rb(68, 8, 21, mat(t.body, { metalness: 0.6 }), 1.5, 4, 5.4, 0));
      g.add(bx(50, 0.5, 2, glow(t.accent), 4, 9.5, 0));
    }
    return g;
  },

  hdd(t) {
    const g = new THREE.Group();
    g.add(rb(147, 26.1, 101.6, mat(t.metal, { metalness: 0.85, roughness: 0.35 }), 2, 0, 13.05, 0));
    g.add(bx(110, 0.3, 80, mat(t.body), 0, 26.2, 0));
    g.add(bx(110, 0.35, 6, glow(t.accent), 0, 26.3, 30));
    g.add(bx(6, 3.5, 17.5, dark(), 73.5, 8, -35), bx(6, 3.5, 40, dark(), 73.5, 8, 15));
    return g;
  },

  psu(t, o = {}) {
    const d = o.form === "sfx" ? { w: 125, h: 63.5, l: 100 } : { w: 150, h: 86, l: 160 };
    const { w, h, l } = d, down = o.fan === "down", s = down ? -1 : 1, g = new THREE.Group();
    const body = mat(t.body, { metalness: 0.5, roughness: 0.5 });
    const shellY = down ? 6 + (h - 6) / 2 : (h - 6) / 2, rimY = down ? 3 : h - 3, faceY = down ? 0 : h;
    g.add(rb(w, h - 6, l, body, 3, 0, shellY, 0));
    g.add(rb(w, 6, 12, body, 1.5, 0, rimY, l / 2 - 6), rb(w, 6, 12, body, 1.5, 0, rimY, -l / 2 + 6),
          rb(12, 6, l - 24, body, 1.5, w / 2 - 6, rimY, 0), rb(12, 6, l - 24, body, 1.5, -w / 2 + 6, rimY, 0));
    const f = fan(Math.min(w, l) - 28, t, 5, 9); f.scale.y = 0.25; f.position.y = faceY - s * 3; g.add(f);
    g.add(bx(w * 0.5, h * 0.5, 1, dark(), 0, h / 2, -l / 2 - 0.3));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) g.add(bx(14, 7, 2, dark(), (c - 2) * 22, h * (0.28 + 0.42 * r), l / 2 + 0.5));
    g.add(bx(0.6, 1.2, l * 0.6, glow(t.accent), w / 2 + 0.2, h / 2, 0));
    return g;
  },

  case(t, o = {}) {
    const { W, H, D, trayX } = caseDims(o.size), g = new THREE.Group();
    const body = mat(t.body, { metalness: 0.5, roughness: 0.55 });
    g.add(rb(W, 3, D, body, 1, 0, -H / 2 + 1.5, 0), rb(W, 3, D, body, 1, 0, H / 2 - 1.5, 0));
    g.add(bx(W, H, 3, body, 0, 0, -D / 2 + 1.5), bx(3, H, D, body, -W / 2 + 1.5, 0, 0));
    g.add(bx(1.5, H - 60, D - 100, mat(0x202026), trayX, 0, -45));                                   // Mainboard-Tray
    g.add(bx(2, H, D, mat(0x88aacc, { transparent: true, opacity: 0.15, metalness: 0.9, roughness: 0.05, depthWrite: false }), W / 2 - 1, 0, 0)); // Glas
    g.add(bx(W, 100, 4, body, 0, -H / 2 + 50, D / 2 - 2), bx(W, 20, 4, body, 0, H / 2 - 10, D / 2 - 2),
          bx(30, H, 4, body, -W / 2 + 15, 0, D / 2 - 2), bx(14, H, 4, body, W / 2 - 7, 0, D / 2 - 2)); // Frontrahmen
    g.add(bx(1.2, H - 60, 1.2, glow(t.accent), W / 2 - 7, 0, D / 2 + 0.4));
    const nf = o.size === "mini" ? 2 : 3;
    for (let i = 0; i < nf; i++) {                                                                    // Front-Luefter
      const f = fan(120, t, 6, 9); f.rotation.x = Math.PI / 2; f.position.set(8, 40 + (i - (nf - 1) / 2) * 120, D / 2 - 17); g.add(f);
    }
    const rf = fan(120, t, 6, 9); rf.rotation.x = Math.PI / 2; rf.position.set(8, 140, -D / 2 + 16); g.add(rf); // Heck-Luefter
    const len = D - 130, sx = (trayX + 1 + W / 2 - 2) / 2;
    g.add(bx(W / 2 - 3 - trayX, 3, len, mat(0x202026), sx, -H / 2 + 110, -D / 2 + 3 + len / 2)); // PSU-Shroud
    g.add(bx(W / 2 - 3 - trayX, 1, 1.2, glow(t.accent), sx, -H / 2 + 110, -D / 2 + 3 + len));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(rb(24, 12, 40, mat(0x111113), 2, a * (W / 2 - 25), -H / 2 - 6, b * (D / 2 - 60))));
    return g;
  },

  /** Kompletter Rechner, eingebaut nach den Konventionen oben. */
  system(t, o = {}) {
    const g = new THREE.Group(), cd = caseDims(o.case), mb = mbLayout(o.form), { H, D } = cd;
    g.add(B.case(t, { size: o.case }));
    const mob = new THREE.Group();                       // Mainboard-Frame -> Case-Frame: x->z, y->x, z->y
    mob.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1));
    const mobZ = -D / 2 + 14 + mb.L / 2;
    mob.position.set(cd.trayX + 7.75, 40, mobZ);
    mob.add(B.motherboard(t, { form: o.form }));
    const [sx, sz] = mb.socket;
    const cpu = B.cpu(t); cpu.position.set(sx, 3.5, sz); mob.add(cpu);
    const cool = B.cooler(t, o.cooler || {}); cool.position.set(sx, 7.1, sz); mob.add(cool);
    const n = o.ram ?? 2, ram = B.ram(t, { sticks: n, pitch: n === 4 ? 8.5 : 17 });
    ram.rotation.y = Math.PI / 2; ram.position.set(mb.ram.x0 + (n === 4 ? 12.75 : 17), 4.6, mb.ram.z); mob.add(ram);
    if (o.gpu !== false) {
      const gp = B.gpu(t, o.gpu || {}), { L: Lg, Wd } = gp.userData.dims;
      gp.rotation.x = -Math.PI / 2;                      // Kontakte zur Platine, Luefter nach unten
      gp.position.set(-mb.L / 2 + Lg / 2, 1.6 + Wd / 2 - 3, mb.pcie[1]); mob.add(gp);
    }
    const m2 = B.ssd_m2(t); m2.position.set(mb.m2[0], 1.6, mb.m2[1]); mob.add(m2);
    g.add(mob);
    const psu = B.psu(t, { fan: "down" }); psu.position.set(13, -H / 2 + 15, -D / 2 + 83); g.add(psu);
    const sata = B.ssd_sata(t); sata.rotation.y = Math.PI / 2; sata.position.set(40, cd.shroudY + 1.5, 40); g.add(sata);
    const zf = -D / 2 + 163, xe = cd.trayX + 7.75 + 13.6, ye = 40 + mb.atx24[1], ze = mobZ + mb.atx24[0];
    g.add(cable([[40, -182, zf - 10], [40, -182, zf + 80], [30, -165, D / 2 - 105], [-20, -90, D / 2 - 95],
                 [xe + 10, 10, ze + 35], [xe, ye - 8, ze + 10], [xe, ye, ze]], 0x151518, 4)); // 24-Pin-Kabel
    return g;
  },
};

export const KINDS = Object.keys(B);

/** kind: siehe KINDS, variant: Theme, accent: Hex-Farbe, options: Teile-spezifisch (siehe README) */
export function buildPC(kind, variant = "stealth", accent, options = {}) {
  const t = { ...(THEMES[variant] || THEMES.stealth) };
  if (accent) t.accent = new THREE.Color(accent).getHex();
  const root = new THREE.Group(), inner = (B[kind] || B.gpu)(t, options || {});
  inner.scale.setScalar(0.01);   // mm -> 10-cm-Einheiten
  root.add(inner);
  return root;
}

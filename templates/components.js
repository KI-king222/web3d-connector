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


/* ---------- Details: Beschriftung, Kabelbuendel, Feinheiten ---------- */
let _seed = 7;
const rnd = () => ((_seed = (_seed * 16807) % 2147483647) / 2147483647);
const hex6 = (n) => "#" + n.toString(16).padStart(6, "0");

/** Text als Textur auf einer Flaeche (Normale +z). Nur im Browser, sonst leere Gruppe. */
export function label(text, w, h, o = {}) {
  if (typeof document === "undefined") return new THREE.Group();
  const cw = 512, ch = Math.max(32, Math.round((512 * h) / w));
  const c = document.createElement("canvas"); c.width = cw; c.height = ch;
  const x = c.getContext("2d");
  if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, cw, ch); }
  let fs = ch * 0.72, font = (f) => `600 ${f}px ui-monospace, Menlo, monospace`;
  x.font = font(fs);
  const tw = x.measureText(text).width;
  if (tw > cw * 0.94) { fs *= (cw * 0.94) / tw; x.font = font(fs); }
  x.fillStyle = o.color || "#ffffff"; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(text, cw / 2, ch / 2 + fs * 0.04);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: o.opacity ?? 0.85, depthWrite: false }));
}
// Beschriftung liegt flach auf einer Platine (Normale +y) und liest sich im eingebauten Tower von der Glasseite aus richtig.
const FLAT = new THREE.Matrix4().set(-1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
export function flatLabel(text, w, h, o = {}) {
  const l = label(text, w, h, o); l.quaternion.setFromRotationMatrix(FLAT); return l;
}
/** Parallele Straenge entlang Punkten (Kabelbuendel); off = Versatz pro Strang */
export function bundle(pts, colors, off = [0, 0, 3.4], r = 1.7) {
  const g = new THREE.Group();
  colors.forEach((col, i) => {
    const k = i - (colors.length - 1) / 2;
    g.add(cable(pts.map((p) => [p[0] + off[0] * k, p[1] + off[1] * k, p[2] + off[2] * k]), col, r));
  });
  return g;
}
const tie = (g, x, y, z) => g.add(bx(9, 2.4, 9, mat(0xdddddd, { metalness: 0.1, roughness: 0.8 }), x, y, z));

function boardDetail(g, t, m) {
  const { L, W } = m, top = 1.6, [sx, sz] = m.socket, ac = hex6(t.accent);
  const lab = (txt, w, h, x, z, c) => { const l = flatLabel(txt, w, h, { color: c || "#ffffff", opacity: 0.7 }); l.position.set(x, top + 0.15, z); g.add(l); };
  const tr = glow(t.accent, 0.35);
  for (let i = 0; i < 26; i++) {                                         // Leiterbahnen
    const horiz = rnd() > 0.5, len = 20 + rnd() * 70, x = (rnd() - 0.5) * (L - 40), z = (rnd() - 0.5) * (W - 40);
    g.add(horiz ? bx(len, 0.12, 0.7, tr, x, top + 0.07, z) : bx(0.7, 0.12, len, tr, x, top + 0.07, z));
  }
  const cap = mat(0x15151a, { metalness: 0.3 }), capTop = mat(t.metal, { metalness: 0.9 });
  for (let i = 0; i < 9; i++) {                                           // Kondensatoren links vom Sockel
    const z = sz - 32 + i * 8; g.add(cy(3.1, 9, cap, sx - 66, top + 4.5, z, 16), cy(2.9, 0.4, capTop, sx - 66, top + 9.1, z, 16));
  }
  if (m.W > 200) for (let i = 0; i < 10; i++) {                           // ... und oberhalb
    const x = sx - 36 + i * 8; g.add(cy(3.1, 9, cap, x, top + 4.5, sz + 62, 16), cy(2.9, 0.4, capTop, x, top + 9.1, sz + 62, 16));
  }
  [[sx + 10, W / 2 - 8, "CPU_FAN"], [L / 2 - 20, W / 2 - 14, "SYS_FAN1"], [L / 2 - 20, -W / 2 + 14, "SYS_FAN2"]].forEach(([x, z, n]) => {
    g.add(bx(18, 6, 6, dark(), x, top + 3, z), bx(14, 0.8, 1.2, gold(), x, top + 6.2, z)); lab(n, 24, 5, x, z - 7);
  });
  for (let i = 0; i < 4; i++) g.add(bx(18, 7, 7, dark(), L / 2 - 30, top + 3.5, -W * 0.08 - i * 9)); // SATA-Ports
  lab("SATA", 20, 5, L / 2 - 30, -W * 0.08 - 40);
  g.add(cy(10, 3.2, mat(0xd0d3d8, { metalness: 0.9, roughness: 0.3 }), 20, top + 1.6, -80, 32)); lab("CR2032", 16, 5, 20, -62); // CMOS-Batterie
  g.add(bx(30, 6, 12, dark(), L / 2 - 60, top + 3, -W / 2 + 10), bx(24, 6, 10, dark(), -20, top + 3, -W / 2 + 10));
  lab("F_PANEL", 28, 5, L / 2 - 60, -W / 2 + 19); lab("USB3", 20, 5, -20, -W / 2 + 18);
  lab("NOVA X670-E", 64, 12, L / 2 - 75, -W * 0.3 - 33, ac);
  lab("PCIe 5.0 x16", 44, 7, m.pcie[0], m.pcie[1] + 8);
  lab("DDR5", 30, 8, m.ram.x0 + (m.ram.n - 1) * m.ram.pitch / 2, m.ram.z - 72, ac);
  lab("M.2_1", 22, 6, m.m2[0], m.m2[1] - 15);
  lab("EATX12V", 26, 5, m.cpu8[0], m.cpu8[1] - 9);
  lab("ATX24", 22, 5, m.atx24[0] - 14, m.atx24[1]);
}

function gpuDetail(g, t, L, Wd, T, H) {
  const dk = mat(0x0b0b0d, { roughness: 0.8 });
  const l = label("VOLT RX 9090", Math.min(L * 0.45, 120), 14, { color: hex6(t.accent), opacity: 0.95 });
  l.rotation.z = Math.PI; l.position.set(0, 5 + H / 2, Wd / 2 + 0.25); g.add(l);   // Logo auf der Glasseite
  for (let i = 0; i < 14; i++) g.add(bx(4, 0.5, Wd * 0.5, dk, -L * 0.3 + i * 7, 2.1, 0));  // Lueftungsschlitze Backplate
  g.add(bx(22, 9, 12, dk, L / 2 - 70, 9, Wd / 2 - 8));                                       // zweiter 8-Pin
  g.add(bx(18, 1, 2.2, mat(0xd4af37, { metalness: 1, roughness: 0.3 }), L / 2 - 70, 13.7, Wd / 2 - 8));
}

function caseDetail(g, t, { W, H, D }) {
  const dk = mat(0x0b0b0d, { roughness: 0.8 }), metal = mat(t.metal, { metalness: 0.9, roughness: 0.3 });
  for (let i = 0; i < 16; i++) g.add(bx(W - 80, 0.6, 5, dk, 0, H / 2 + 0.1, -D / 2 + 60 + i * 14));   // Dach-Lueftung
  const btn = cy(7, 3, glow(t.accent, 1.2), W / 2 - 45, H / 2 - 10, D / 2 + 2.5); btn.rotation.x = Math.PI / 2; g.add(btn); // Power-Button
  g.add(bx(14, 6, 2, dk, W / 2 - 75, H / 2 - 10, D / 2 + 1), bx(14, 6, 2, dk, W / 2 - 95, H / 2 - 10, D / 2 + 1), bx(10, 4, 2, dk, W / 2 - 112, H / 2 - 10, D / 2 + 1)); // USB/USB-C
  const tx = caseDims(H < 400 ? "mini" : H > 520 ? "full" : "mid").trayX;
  [[60, 130], [-40, 130], [190, -100]].forEach(([y, z]) => {                                            // Kabeldurchfuehrungen
    g.add(bx(0.8, 80, 26, mat(0x111114), tx + 0.95, y, z), bx(1, 70, 18, dk, tx + 1.05, y, z));
  });
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const s = cy(5, 2, metal, W / 2 + 1, a * (H / 2 - 12), b * (D / 2 - 12), 16); s.rotation.z = Math.PI / 2; g.add(s); }); // Glas-Schrauben
}

function systemCables(g, t, { cd, mb, mobZ, gdim }) {
  const { D } = cd, X0 = cd.trayX + 7.75, blk = 0x141417, sl = [blk, blk, blk, 0x1d1d22];
  const xe = X0 + 13.6, ye = 40 + mb.atx24[1], ze = mobZ + mb.atx24[0], zf = -D / 2 + 163;
  g.add(bundle([[40, -182, zf - 10], [40, -182, zf + 80], [30, -165, D / 2 - 105], [-20, -90, D / 2 - 95], [xe + 10, 10, ze + 35], [xe, ye - 8, ze + 10], [xe, ye, ze]], sl, [0, 0, 3.4], 1.7)); // 24-Pin
  tie(g, -20, -90, D / 2 - 95); tie(g, xe + 10, 10, ze + 35);
  const cx = X0 + 6, cy8 = 40 + mb.cpu8[1], cz8 = mobZ + mb.cpu8[0];
  g.add(bundle([[30, -175, -66], [10, -160, -120], [-20, -150, -190], [-60, -130, -218], [-74, -60, -219], [-74, 60, -219], [-74, 130, -205], [-74, cy8, cz8 - 25], [cx, cy8, cz8]], [blk, blk, 0x1d1d22], [0, 0, 4], 1.8)); // CPU 8-Pin
  tie(g, -74, -60, -219); tie(g, -74, 60, -219);
  const fx = cd.trayX + 7.75 + 6 + 8;
  g.add(bundle([[-45, 40, 203], [-72, 55, 185], [-76, 100, 120], [-74, 145, 72]], [0x2a2a30, 0x2a2a30, 0x3a3a42], [0, 0, 2.5], 1.1)); // Luefterkabel
  if (gdim) {                                                                                             // PCIe-Strom zur Grafikkarte
    const { L: Lg, Wd } = gdim, cX = X0 + 1.6 + Wd - 11, cY = 40 + mb.pcie[1] - 9, z1 = mobZ - mb.L / 2 + Lg - 40;
    [[z1, 48], [z1 - 30, 56]].forEach(([z, sx0]) => {
      g.add(cable([[sx0, -176, -70], [sx0 + 4, -160, -10], [64, -135, z - 10], [64, -70, z], [62, -20, z], [cX + 22, cY, z], [cX, cY, z]], blk, 3.2));
      tie(g, 64, -70, z);
    });
  }
  g.add(cable([[18, -125, -12], [45, -112, -5], [62, -60, 10], [62, 0, 40], [40, 20, 58], [-30, 22, 60], [X0 - 5, 40 - mb.W * 0.08, mobZ + mb.L / 2 - 30]], 0xc0392b, 1.6)); // SATA
}

/* ---------- Layouts & Masse ---------- */
const FORMS = { atx: [305, 244], matx: [244, 244], itx: [170, 170] };
/** Positionen auf dem Mainboard (Mainboard-Frame, mm). */
export function mbLayout(form = "atx") {
  const [L, W] = FORMS[form] || FORMS.atx;
  const sx = -L / 2 + 0.33 * L, sz = W * 0.1;
  return {
    L, W, socket: [sx, sz],
    ram: { x0: sx + 52, z: sz - 8, pitch: 12, n: form === "itx" ? 2 : 4 },
    pcie: [-L / 2 + 60, -W * 0.18], m2: [sx - 5, -W * 0.06],
    atx24: [L / 2 - 6, W * 0.1], cpu8: [sx - 30, W / 2 - 8],
  };
}
export const CASES = { mini: { W: 200, H: 380, D: 380 }, mid: { W: 230, H: 480, D: 460 }, full: { W: 250, H: 560, D: 520 } };
export function caseDims(size = "mid") {
  const c = CASES[size] || CASES.mid;
  return { ...c, trayX: c.W / 2 - 28 /* Solid+Tray +x */, shroudY: -c.H / 2 + 110 };
}
const P = {
  gpu: {
    compact: { length: 240, width: 112, slots: 2, fans: 2 }, standard: {}, flagship: { length: 336, width: 140, slots: 3.5, fans: 3 },
    t1: { length: 145, width: 105, slots: 1.4, fans: 1, rgb: false, backplate: false, plastic: true },
    t2: { length: 168, width: 112, slots: 1.7, fans: 1, rgb: false, backplate: false, plastic: true },
    t3: { length: 200, width: 118, slots: 2.0, fans: 2, rgb: false, backplate: false, plastic: true },
    t4: { length: 250, width: 115, slots: 2.2, fans: 2, rgb: false, backplate: true },
    t5: { length: 280, width: 118, slots: 2.5, fans: 2, rgb: true, backplate: true },
    t6: { length: 300, width: 120, slots: 2.5, fans: 3, rgb: true, backplate: true },
    t7: { length: 310, width: 125, slots: 2.7, fans: 3, rgb: true, backplate: true },
    t8: { length: 320, width: 132, slots: 3.0, fans: 3, rgb: true, backplate: true },
    t9: { length: 336, width: 140, slots: 3.2, fans: 3, rgb: true, backplate: true, premium: true },
    t10:{ length: 352, width: 148, slots: 3.5, fans: 3, rgb: true, backplate: true, premium: true },
  },
  cpu: {
    t1:{ size:26,ihs:16,pins:false,gold:false }, t2:{ size:28,ihs:18,pins:false,gold:false },
    t3:{ size:32,ihs:22,pins:true,gold:false }, t4:{ size:34,ihs:26,pins:true,gold:false },
    t5:{ size:37,ihs:29,pins:true,gold:true }, t6:{ size:40,ihs:32,pins:true,gold:true },
    t7:{ size:43,ihs:35,pins:true,gold:true }, t8:{ size:46,ihs:38,pins:true,gold:true },
    t9:{ size:48,ihs:40,pins:true,gold:true,logo:true }, t10:{ size:52,ihs:44,pins:true,gold:true,logo:true },
  },
  cooler: { lowprofile: { height: 70, fins: 24, fans: 1 }, tower: {}, dual: { height: 165, fans: 2, fins: 44 } },
};

/* ---------- Bauteile ---------- */
const B = {
  fan(t, o = {}) { const g = new THREE.Group(), f = fan(o.size ?? 120, t, 8, o.blades ?? 9); f.position.y = 12.5; g.add(f); return g; },

  cpu(t, o = {}) {
    const tier = Number(o.tier || (String(o.preset || "").match(/t?(\d+)/) || [0, 6])[1]);
    const c = { size: 40, ihs: 34, ...(P.cpu["t" + tier] || P.cpu.t6), ...o };
    const S = c.size, I = c.ihs, g = new THREE.Group();
    const subCol = tier <= 2 ? 0x0a140e : tier <= 4 ? 0x1a3a22 : tier <= 7 ? 0x2a7a38 : 0x10b050;
    g.add(rb(S, 0.7 + tier * 0.1, S, mat(subCol, { metalness: 0.1 + tier * 0.05, roughness: 0.7 - tier * 0.05 }), 0.35, 0, 0.4 + tier * 0.04, 0));
    const ihsMat = mat(tier <= 2 ? 0x55585e : tier <= 5 ? 0x8a8e94 : tier <= 8 ? 0xc5c9d0 : 0xf0f4f8, { metalness: 0.45 + tier * 0.05, roughness: 0.55 - tier * 0.04 });
    g.add(rb(I, 1.0 + tier * 0.22, I, ihsMat, 0.7 + tier * 0.1, 0, 1.2 + tier * 0.15, 0));
    for (let i = 0; i < 1 + Math.min(tier, 9); i++) {
      const a = (i / (1 + tier)) * Math.PI * 2, r = I * 0.4;
      g.add(bx(1.1, 0.4, 1.1, dark(), Math.cos(a) * r, 2.3 + tier * 0.1, Math.sin(a) * r));
    }
    if (tier >= 5) g.add(bx(2, 0.35, 2, gold(), -I * 0.3, 2.9 + tier * 0.1, -I * 0.3));
    if (tier >= 8) {
      const lab = flatLabel(tier >= 10 ? "NOVA X3D" : "NOVA", I * 0.6, 6, { color: hex6(t.accent), opacity: 0.95 });
      lab.position.set(0, 3.0 + tier * 0.12, 0); g.add(lab);
    }
    if (tier >= 3) {
      const grid = tier >= 8 ? 5 : tier >= 5 ? 3 : 2;
      for (let x = -grid; x <= grid; x++) for (let z = -grid; z <= grid; z++)
        if ((x + z) % 2 === 0) g.add(bx(0.25, 0.15 + tier * 0.02, 0.25, gold(), x * 2.2, 0.1, z * 2.2));
    }
    if (tier >= 6) {
      g.add(rb(S + 6, 1, S + 6, mat(0x222228, { metalness: 0.7 }), 0.7, 0, 0.8, 0));
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b]) => g.add(cy(1.6, 2, mat(t.metal, { metalness: 0.95 }), a * S * 0.45, 1.4, b * S * 0.45, 12)));
    }
    if (tier <= 2) g.add(bx(I * 0.5, 0.3, 2, dark(), 0, 1.5, 0));
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
    if (c.detail !== false) { const l = flatLabel("NOVA CHILL", 46, 10, { color: hex6(t.accent), opacity: 0.95 }); l.position.set(0, h - 3.9, 0); g.add(l); }
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
    // 4 RAM-Slots rechts von CPU
    for (let i = 0; i < Math.max(m.ram.n, 4); i++) {
      const rx = m.ram.x0 + i * Math.max(m.ram.pitch, 11);
      g.add(bx(6, 10, 140, dark(), rx, top + 5, m.ram.z));
      g.add(bx(4, 2.5, 136, mat(0x1a1a22), rx, top + 10.5, m.ram.z));
    }
    // 2x lange PCIe (GPU + extra) + 2 kuerzere
    const pcieSlots = o.form === "itx" ? [[89, 0]] : [[98, 0], [98, -28], [50, -56], [50, -84]];
    pcieSlots.forEach(([len, dz], idx) => {
      const th = idx < 2 ? 11 : 8;
      g.add(bx(len, th, 7.5, dark(), m.pcie[0] - 49 + len / 2, top + th / 2, m.pcie[1] + dz));
    });
    g.add(rb(22, 18, 74, body, 2, m.socket[0] - 48, top + 9, m.socket[1]));
    g.add(rb(80, 22, 18, body, 2, m.socket[0], top + 11, W / 2 - 20));
    g.add(rb(30, 36, 100, body, 3, -L / 2 + 22, top + 18, m.socket[1] + 8));
    g.add(rb(46, 9, 46, body, 2, L / 2 - 75, top + 4.5, -W * 0.3));
    g.add(cy(7, 0.6, glow(t.accent), L / 2 - 75, top + 9.3, -W * 0.3, 32));
    g.add(bx(8, 12, 32, dark(), m.atx24[0], top + 6, m.atx24[1]));
    g.add(bx(18, 9, 11, dark(), m.cpu8[0], top + 4.5, m.cpu8[1]));
    [[-L / 2 + 8, -W / 2 + 8], [L / 2 - 8, -W / 2 + 8], [-L / 2 + 8, W / 2 - 8], [L / 2 - 8, W / 2 - 8]]
      .forEach(([x, z]) => g.add(cy(2.2, 1.2, mat(t.metal, { metalness: 0.9 }), x, top + 0.6, z, 16)));
    if (o.detail !== false) boardDetail(g, t, m);
    return g;
  },

  gpu(t, o = {}) {
    const tier = Number(o.tier || (String(o.preset || "").match(/t?(\d+)/) || [0, 6])[1]);
    const pk = (o.preset && P.gpu[o.preset]) ? o.preset : ("t" + (tier || 6));
    const c = { length: 300, width: 115, slots: 2.5, fans: 3, rgb: true, backplate: true, plastic: false, premium: false, ...(P.gpu[pk] || P.gpu.t6), ...o };
    const L = c.length, Wd = c.width, T = c.slots * 20.3, n = Math.max(1, c.fans | 0), H = Math.max(T - 5, 16), g = new THREE.Group();
    const body = mat(c.plastic ? 0x3a3a42 : t.body, { metalness: c.plastic ? 0.12 : (c.premium ? 0.55 : 0.3), roughness: c.plastic ? 0.75 : 0.48 });
    const metal = mat(t.metal, { metalness: 0.9, roughness: 0.3 });
    if (c.backplate) g.add(rb(L - 8, 2, Wd, metal, 1, 0, 1, 0));
    else g.add(bx(L - 16, 1, Wd - 10, mat(0x1a1a1e), 0, 0.8, 0));
    g.add(bx(L - 18, 1.5, Wd - 6, mat(t.pcb), 0, 3, 0));
    const sy = 5 + H / 2;
    g.add(rb(L, H, 4, body, 1.5, 0, sy, Wd / 2 - 2), rb(L, H, 4, body, 1.5, 0, sy, -Wd / 2 + 2),
          rb(4, H, Wd, body, 1.5, L / 2 - 2, sy, 0), rb(4, H, Wd, body, 1.5, -L / 2 + 2, sy, 0));
    const size = Math.min(Wd - 14, (L - 20) / Math.max(n, 1));
    if (n === 1) {
      const f = fan(Math.min(Wd - 22, 70), t, 7, 7);
      f.position.set(-L * 0.12, T - 10, 0); g.add(f);
      g.add(rb(L * 0.62, Math.max(H + 2, 16), Wd - 6, body, 3, L * 0.14, sy, 0));
      for (let i = 0; i < 5; i++) g.add(bx(3, Math.max(H - 6, 6), Wd * 0.42, dark(), 0.02 * L + i * 13, sy, 0));
      g.add(bx(L * 0.22, 1.4, Wd - 14, mat(t.pcb), L * 0.34, 3.2, 0));
      for (let i = 0; i < 4; i++) g.add(bx(5, 1.1, 5, dark(), L * 0.28 + i * 9, 4.1, (i % 2) * 10 - 5));
      g.add(bx(4, 10, 18, dark(), -L / 2 - 1, T * 0.4, -Wd / 2 + 20));
      g.add(bx(3, 8, 14, dark(), -L / 2 - 1, T * 0.4, -Wd / 2 + 40));
    } else {
      for (let i = 1; i < n; i++) g.add(bx(3, H, Wd - 8, body, (i - n / 2) * size, sy, 0));
      if (!c.plastic) {
        const fins = mat(t.metal, { metalness: 0.8, roughness: 0.4 }), finN = c.premium ? 48 : 34;
        for (let i = 0; i < finN; i++) g.add(bx(0.7, Math.max(H - 27, 4), Wd - 10, fins, -L / 2 + 12 + i * ((L - 24) / Math.max(finN - 1, 1)), 6 + (H - 27) / 2, 0));
      }
      for (let i = 0; i < n; i++) {
        const f = fan(size - 4, t, 9, tier >= 7 ? 11 : 9);
        f.position.set((i - (n - 1) / 2) * size, T - 12.5, 0); g.add(f);
      }
      for (let i = 0; i < (tier <= 5 ? 3 : 4); i++) g.add(bx(3, 7, 15, dark(), -L / 2 - 1, T * 0.5, -Wd / 2 + 18 + i * 20));
    }
    if (c.rgb) g.add(bx(L - 40, 1, 1.2, glow(t.accent), 0, T, Wd / 2 - 2));
    g.add(bx(Math.min(89, L * 0.35), 1.6, 6, gold(), -L / 2 + Math.min(55, L * 0.28), 3, -Wd / 2 + 5));
    g.add(bx(1.6, T, Wd + 4, metal, -L / 2 - 0.8, T / 2, 0));
    if (tier >= 4) g.add(bx(22, 9, 12, dark(), L / 2 - 40, 9, Wd / 2 - 8));
    if (c.premium) {
      g.add(bx(L - 60, 0.6, 0.8, gold(), 0, T - 2, -Wd / 2 + 3));
      g.add(bx(8, H - 4, 2, glow(t.accent, 1.1), L / 2 - 6, sy, 0));
    }
    if (c.detail !== false && tier >= 5) gpuDetail(g, t, L, Wd, T, H);
    g.userData.dims = { L, Wd, T, tier };
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
    g.add(bx(W, H, 3, body, 0, 0, -D / 2 + 1.5), bx(3, H, D, body, W / 2 - 1.5, 0, 0));
    g.add(bx(1.5, H - 60, D - 100, mat(0x202026), trayX, 0, -45));                                   // Mainboard-Tray
    g.add(bx(2, H, D, mat(0x88aacc, { transparent: true, opacity: 0.15, metalness: 0.9, roughness: 0.05, depthWrite: false }), -W / 2 + 1, 0, 0)); // Glas -x
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
    if (o.detail !== false) caseDetail(g, t, { W, H, D });
    return g;
  },

  /** Kompletter Rechner, eingebaut nach den Konventionen oben. */
  system(t, o = {}) {
    const g = new THREE.Group(), cd = caseDims(o.case), mb = mbLayout(o.form), { H, D } = cd;
    g.add(B.case(t, { size: o.case, detail: o.detail }));
    const mob = new THREE.Group();                       // Mainboard-Frame -> Case-Frame: x->z, y->x, z->y
    mob.quaternion.setFromRotationMatrix(new THREE.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1));
    const mobZ = -D / 2 + 14 + mb.L / 2;
    mob.position.set(cd.trayX + 7.75, 40, mobZ);
    mob.add(B.motherboard(t, { form: o.form, detail: o.detail }));
    const [sx, sz] = mb.socket;
    const cpu = B.cpu(t); cpu.position.set(sx, 3.5, sz); mob.add(cpu);
    const cool = B.cooler(t, { detail: o.detail, ...(o.cooler || {}) }); cool.position.set(sx, 7.1, sz); mob.add(cool);
    const n = o.ram ?? 2, ram = B.ram(t, { sticks: n, pitch: n === 4 ? 8.5 : 17 });
    ram.rotation.y = Math.PI / 2; ram.position.set(mb.ram.x0 + (n === 4 ? 12.75 : 17), 4.6, mb.ram.z); mob.add(ram);
    let gpuDims = null;
    if (o.gpu !== false) {
      const gp = B.gpu(t, { detail: o.detail, ...(o.gpu || {}) }), { L: Lg, Wd } = gp.userData.dims;
      gpuDims = gp.userData.dims;
      gp.rotation.x = -Math.PI / 2;                      // Kontakte zur Platine, Luefter nach unten
      gp.position.set(-mb.L / 2 + Lg / 2, 1.6 + Wd / 2 - 3, mb.pcie[1]); mob.add(gp);
    }
    const m2 = B.ssd_m2(t); m2.position.set(mb.m2[0], 1.6, mb.m2[1]); mob.add(m2);
    g.add(mob);
    const psu = B.psu(t, { fan: "down" }); psu.position.set(13, -H / 2 + 15, -D / 2 + 83); g.add(psu);
    const sata = B.ssd_sata(t); sata.rotation.y = Math.PI / 2; sata.position.set(40, cd.shroudY + 1.5, 40); g.add(sata);
    const zf = -D / 2 + 163, xe = cd.trayX + 7.75 + 13.6, ye = 40 + mb.atx24[1], ze = mobZ + mb.atx24[0];
    if (o.detail === false) g.add(cable([[40, -182, zf - 10], [40, -182, zf + 80], [30, -165, D / 2 - 105], [-20, -90, D / 2 - 95],
                 [xe + 10, 10, ze + 35], [xe, ye - 8, ze + 10], [xe, ye, ze]], 0x151518, 4)); // 24-Pin-Kabel
    else systemCables(g, t, { cd, mb, mobZ, gdim: o.gpu === false ? null : gpuDims });
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

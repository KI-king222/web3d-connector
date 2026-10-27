import * as K from "./kit.js";
import { P } from "./ports.js";
const { THREE, M, G, grp, metal, BLACK, GOLD, hex6, rectPts } = K;

/* z-Spiegelung: Die Platine wird mit "+z = Oberkante" entworfen. Damit sie in der Draufsicht wie ein echtes Board
 * (I/O links, Oberkante oben) aussieht, werden alle z-Werte beim Platzieren negiert. */
const bx = (w, h, d, m, x, y, z) => K.bx(w, h, d, m, x, y, -z);
const rb = (w, h, d, m, r, x, y, z) => K.rb(w, h, d, m, r, x, y, -z);
const cy = (r, h, m, x, y, z, seg) => K.cy(r, h, m, x, y, -z, seg);
const cyx = (r, l, m, x, y, z, seg) => K.cyx(r, l, m, x, y, -z, seg);
const cyz = (r, l, m, x, y, z, seg) => K.cyz(r, l, m, x, y, -z, seg);
const screw = (x, y, z, r, m) => K.screw(x, y, -z, r, m);
const smd = (nx, nz, px, pz, cx, y, cz, m, sz) => K.smd(nx, nz, px, pz, cx, y, -cz, m, sz);
const flat = (t, w, h, x, y, z, o) => K.flat(t, w, h, x, y, -z, o);
const plate = (pts, d, m, x, y, z, holes = []) => K.plate(pts.map(([a, b]) => [a, -b]), d, m, x, y, -z, holes.map((h) => (Array.isArray(h) ? h.map(([a, b]) => [a, -b]) : { ...h, z: -h.z })));

/* Mainboards, liegend: x = Laenge (I/O-Blende links bei -x), z = Breite (+z = Oberkante), y = hoch.
 * ATX 305 x 244, mATX 244 x 244, kleines mATX 226 x 185. Platzierung wie auf echten Boards:
 * Sockel ca. 1/3 von oben, VRM links + oberhalb, DIMMs rechts, PCIe unten, Chipsatz rechts unten, 24-Pin am rechten Rand. */
const BR = { gray: 0x7a8089, steel: 0x8fa3bf, red: 0xe2332f, orange: 0xf26a21, yellow: 0xf2a900, violet: 0x9a8cf0, rog: 0xe50012 };
// plat: lga | am4 | am5.  vrm 0..4.  armor 0..3 (I/O-Abdeckung).  slots: Reihenfolge von oben nach unten ('m2' = M.2 zwischen den Slots)
const SPEC = {
  1: { form: "mini", plat: "lga", ddr: 4, dimm: 2, pcb: 0x1e4a33, col: 0x30333a, acc: BR.gray, vrm: 0, armor: 0, slots: ["x16", "x1"], m2: 1, shield: 0, sata: 4, chip: 0, code: "H6", io: { usb: 2, usbc: 0, hdmi: 1, dp: 0, rj45: 1, audio: 3, wifi: 0 } },
  2: { form: "matx", plat: "am4", ddr: 4, dimm: 4, pcb: 0x15161a, col: 0x2b2e34, acc: BR.steel, vrm: 1, armor: 0, slots: ["x16", "x1", "x4"], m2: 2, shield: 1, sata: 4, chip: 1, code: "B5M", io: { usb: 3, usbc: 0, hdmi: 1, dp: 1, rj45: 1, audio: 3, wifi: 0 } },
  3: { form: "atx", plat: "lga", ddr: 4, dimm: 4, pcb: 0x121317, col: 0x25272c, acc: BR.red, vrm: 1, armor: 0, slots: ["x16", "x1", "x16", "x1"], m2: 2, shield: 2, sata: 6, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 0 } },
  4: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 0x121317, col: 0x2a2c32, acc: BR.orange, vrm: 2, armor: 1, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
  5: { form: "atx", plat: "lga", ddr: 5, dimm: 4, pcb: 0x121317, col: 0x2d3036, acc: BR.yellow, vrm: 2, armor: 2, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B7", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
  6: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 0x0f1013, col: 0x24262b, acc: BR.red, vrm: 3, armor: 2, slots: ["x16r", "m2", "x16", "x1"], m2: 4, shield: 4, sata: 6, chip: 3, code: "X6", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
  7: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 0x15161a, col: 0x383b42, acc: BR.violet, vrm: 2, armor: 2, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
  8: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 0x0f1013, col: 0x1f2125, acc: BR.orange, vrm: 3, armor: 2, slots: ["x16r", "m2", "x16r", "x1"], m2: 4, shield: 4, sata: 6, chip: 3, code: "X6E", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
  9: { form: "atx", plat: "lga", ddr: 5, dimm: 2, pcb: 0x0c0d10, col: 0x1c1e22, acc: BR.rog, vrm: 4, armor: 3, slots: ["x16r", "x16r", "x1"], m2: 3, shield: 4, sata: 4, chip: 3, code: "Z7", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
  10: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 0x0c0d10, col: 0x1a1c20, acc: BR.rog, vrm: 4, armor: 3, slots: ["x16r", "m2", "x16r", "x16"], m2: 5, shield: 5, sata: 6, chip: 4, code: "X6E", io: { usb: 8, usbc: 2, hdmi: 1, dp: 1, rj45: 2, audio: 5, wifi: 2 }, rgb: true },
};
const FORM = { mini: [226, 185], matx: [244, 244], atx: [305, 244] };
const Y = 1.6, PITCH = 20.32;

function socket(g, plat, x, z) {
  const frame = M(0xaeb3bb, { metalness: 0.95, roughness: 0.3 }), dk = M(0x0d0e10, { metalness: 0.2, roughness: 0.6 });
  if (plat === "lga") {                       // LGA1700: Stahlrahmen mit Hebel, PnP-Abdeckung
    g.add(plate(rectPts(60, 75), 6.2, frame, x, Y, z, [rectPts(40.5, 47.5)]));
    g.add(bx(45, 2.2, 52, dk, x, Y + 0.6, z));
    g.add(bx(37.5, 2.4, 45, M(0x2b2d33, { metalness: 0.1, roughness: 0.5 }), x, Y + 2.3, z));
    g.add(cyz(1.4, 68, frame, x + 31, Y + 4, z + 0), bx(3, 2, 7, frame, x + 31, Y + 6, z + 34));
    g.add(bx(5, 3, 8, frame, x - 31, Y + 4.4, z - 33));
  } else if (plat === "am4") {                // AM4: schwarzer ZIF-Sockel 52 x 52 mit Hebel
    g.add(rb(52, 7, 52, M(0x16171a, { metalness: 0.2, roughness: 0.55 }), 1.5, x, Y + 3.5, z));
    g.add(bx(40.5, 0.6, 40.5, M(0x2b2d33, { metalness: 0.3, roughness: 0.5 }), x, Y + 7.2, z));
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) g.add(bx(1.2, 0.3, 1.2, GOLD(), x - 15 + i * 4.3, Y + 7.6, z - 15 + j * 4.3));
    g.add(cyz(1.5, 44, frame, x + 27, Y + 8, z), bx(2.6, 10, 2.6, frame, x + 27, Y + 12.4, z + 20));
  } else {                                    // AM5: LGA1718, Stahlrahmen mit Abdeckung
    g.add(plate(rectPts(66, 66), 6.4, frame, x, Y, z, [rectPts(46, 46)]));
    g.add(bx(52, 2.2, 52, dk, x, Y + 0.6, z));
    g.add(bx(40, 2.4, 40, M(0x2b2d33, { metalness: 0.1, roughness: 0.5 }), x, Y + 2.3, z));
    g.add(cyz(1.4, 58, frame, x + 33, Y + 4.6, z), bx(3, 2, 7, frame, x + 33, Y + 6.4, z + 29));
  }
}

function slotBody(g, len, x0, z, reinforce, col, acc) {
  const sh = reinforce ? 12.4 : 11, blk = M(0x15161a, { metalness: 0.2, roughness: 0.6 }), mt = M(col === 0 ? 0xb0b5bd : col, { metalness: 0.9, roughness: 0.32 });
  g.add(bx(len, sh, 7.6, blk, x0 + len / 2, Y + sh / 2, z));
  g.add(bx(len - 4, 0.3, 1.8, M(0x2a2c32), x0 + len / 2, Y + sh + 0.1, z));
  if (reinforce) { g.add(bx(len, 0.9, 9.4, mt, x0 + len / 2, Y + sh + 0.5, z)); [-1, 1].forEach((s) => g.add(bx(len, sh + 0.6, 0.9, mt, x0 + len / 2, Y + (sh + 0.6) / 2, z + s * 4.3))); }
  g.add(bx(7, 4, 9, M(0x1b1c20), x0 + len + 3.5, Y + 2, z), bx(3, 2, 3, M(acc, { metalness: 0.4 }), x0 + len + 3.5, Y + 4.4, z)); // Verriegelung
}

function dimmSlots(g, s, x0, z) {
  const L = 135, pitch = 9.2, ddr5 = s.ddr === 5;
  for (let i = 0; i < s.dimm; i++) {
    const x = x0 + i * pitch, arm = s.vrm >= 2 && ddr5;
    g.add(bx(5.4, 11, L, M(i % 2 ? 0x15161a : 0x1a1b20, { metalness: 0.25, roughness: 0.55 }), x, Y + 5.5, z));
    if (arm) g.add(bx(0.8, 10, L - 2, M(0xaeb3bb, { metalness: 0.9, roughness: 0.3 }), x - 2.8, Y + 5.2, z));
    g.add(bx(1.2, 0.3, L - 6, M(0x2a2c32), x + 0.6, Y + 11.1, z));
    [-1, 1].forEach((sd) => g.add(bx(5.4, 8, 5, M(0xd8dbe0, { metalness: 0.1, roughness: 0.6 }), x, Y + 4, z + sd * (L / 2 + 2.5))));      // Haltehebel
    g.add(bx(1, 3, 12, BLACK(), x, Y + 5.5, z + (ddr5 ? 15.3 : 5.3)));                              // Kerbe
  }
}

function m2slot(g, s, x, z, n) {
  // Sockel links (Goldfinger der SSD stecken von +x hinein), Abstandshalter rechts bei x+40.2 (2280 = 80 mm Karte, Loch bei +40)
  g.add(bx(8, 3.4, 22, BLACK(), x - 37.2, Y + 1.7, z));
  g.add(cy(2.8, 2.4, M(0xc9a24a, { metalness: 1, roughness: 0.3 }), x + 40.2, Y + 1.2, z, 16));
  const sh = s.shield, grpShield = new THREE.Group();
  if (sh > 0) {                                                  // Kuehlkoerper der Platine: wird ausgeblendet, sobald eine SSD im Slot steckt
    const h = [0, 2.2, 3.6, 5.2, 7.2, 10][sh], m = M(s.col, { metalness: 0.8, roughness: 0.38 });
    grpShield.add(rb(80, h, 22.6, m, 1, x, Y + 3.2 + h / 2, z));
    grpShield.add(bx(60, 0.3, 2.2, M(s.acc, { metalness: 0.3, roughness: 0.4 }), x - 4, Y + 3.2 + h + 0.05, z - 8));
    for (let i = 0; i < Math.max(0, sh - 2) * 3; i++) grpShield.add(bx(1.2, 0.5, 18, M(0x3a3d44, { metalness: 0.7 }), x - 22 + i * 4.4, Y + 3.2 + h + 0.2, z));
    grpShield.add(screw(x + 38, Y + 3.2 + h - 0.5, z, 2.0, metal(0xd0d3d8)));
    g.add(grpShield);
  } else g.add(screw(x + 40.2, Y + 2.4, z, 1.9, metal(0xc9a24a)));
  return grpShield;
}

function io(g, s, xi, zt) {
  const cfg = s.io, shell = M(0x8e939b, { metalness: 0.9, roughness: 0.4 }), blk = M(0x0b0c0e, { metalness: 0.2, roughness: 0.6 }), x0 = xi + 11;
  let z = zt - 10;
  const next = (d) => { const c = z - d / 2; z -= d + 1.2; return c; };
  if (cfg.hdmi) g.add(bx(14.5, 6.6, 15.5, shell, x0 + 0, Y + 4.2, next(15.5))), g.add(bx(1, 4, 12, blk, xi - 0.1, Y + 4.2, z + 7));
  if (cfg.dp) g.add(bx(14.5, 6.6, 17, shell, x0, Y + 4.2, next(17)));
  for (let i = 0; i < cfg.usb; i++) { const c = next(14.4); g.add(bx(17, 15.2, 14.4, shell, x0 + 1, Y + 7.8, c)); g.add(bx(0.8, 4.6, 12.6, i % 2 ? M(0x2a6bd1) : blk, xi - 0.3, Y + 4.4, c), bx(0.8, 4.6, 12.6, i % 2 ? M(0x2a6bd1) : blk, xi - 0.3, Y + 10.4, c)); }
  for (let i = 0; i < cfg.usbc; i++) { const c = next(10); g.add(bx(14, 7, 10, shell, x0 - 0.5, Y + 3.8, c), bx(0.8, 2.6, 8.6, blk, xi - 0.1, Y + 3.8, c)); }
  for (let i = 0; i < cfg.rj45; i++) { const c = next(16.5); g.add(bx(21, 13.5, 16.5, shell, x0 + 2.5, Y + 7.5, c)); g.add(bx(0.8, 8, 13, blk, xi + 0.1, Y + 7.2, c)); }
  const jc = [0x7bd35e, 0xe58ac4, 0x6fa8e8, 0xf0b44a, 0xb0b5bd];
  for (let i = 0; i < cfg.audio; i++) { const c = next(7.4); g.add(cyx(3.6, 14, shell, x0 - 2, Y + 4.2, c, 18), cyx(3.7, 0.4, M(jc[i % 5], { metalness: 0.4 }), xi + 5.1, Y + 4.2, c, 18)); }
  for (let i = 0; i < cfg.wifi; i++) g.add(cyx(3.2, 9, GOLD(), xi + 1, Y + 4, zt - 150 + i * 14, 14));
}

export default function mobo(tier, e) {
  const s = SPEC[tier], [L, W] = FORM[s.form], g = new THREE.Group();
  const xi = -L / 2, zt = W / 2, zb = -W / 2, small = s.form === "mini";
  const pcb = M(s.pcb, { metalness: 0.2, roughness: 0.55 }), col = M(s.col, { metalness: 0.7, roughness: 0.42 }), acc = M(s.acc, { metalness: 0.35, roughness: 0.4 });
  const sink = M(s.col, { metalness: 0.75, roughness: 0.4 }), alu = M(0xa8acb4, { metalness: 0.8, roughness: 0.35 });
  g.add(bx(L, 1.6, W, pcb, 0, 0.8, 0));
  const sx = xi + 104, sz = zt - (small ? 62 : 80);
  socket(g, s.plat, sx, sz);

  // VRM: Spulen/Drosseln + Kuehlkoerper links (x) und oberhalb (z) des Sockels
  const vh = [0, 9, 16, 22, 30][s.vrm];
  if (s.vrm === 0) {
    for (let i = 0; i < 6; i++) g.add(bx(6.4, 4.4, 6.4, BLACK(), xi + 54, Y + 2.2, sz - 25 + i * 9));
    g.add(bx(30, 7, 12, alu, xi + 60, Y + 3.5, zt - 14)); g.add(bx(14, 5, 22, alu, xi + 48, Y + 2.6, sz + 2));
    g.add(smd(6, 1, 9, 1, xi + 90, Y, zt - 12, M(0x20232a, { metalness: 0.6 }), [6.4, 4, 6.4]));
  } else {
    g.add(rb(s.vrm >= 3 ? 22 : 16, vh, s.vrm >= 3 ? 96 : 84, sink, 2, xi + 52, Y + vh / 2, sz + 2));
    g.add(rb(s.vrm >= 3 ? 100 : 82, vh * 0.85, s.vrm >= 3 ? 26 : 20, sink, 2, xi + 100, Y + vh * 0.42, zt - 16));
    for (let i = 0; i < (s.vrm >= 2 ? 10 : 4); i++) {                                           // Kuehlrippen
      g.add(bx(16, 0.6, 1.6, M(0x3a3d44, { metalness: 0.7 }), xi + 52, Y + vh + 0.05, sz - 34 + i * 8.2));
      g.add(bx(1.6, 0.6, 20, M(0x3a3d44, { metalness: 0.7 }), xi + 64 + i * 7.2, Y + vh * 0.85 + 0.05, zt - 16));
    }
    g.add(bx(s.vrm >= 3 ? 70 : 50, 0.3, 2.4, acc, xi + 100, Y + vh * 0.85 + 0.1, zt - 10));
    if (s.vrm >= 3) { const hp = cyz(3, 88, M(0xc98a4b, { metalness: 0.95, roughness: 0.3 }), xi + 78, Y + vh + 2.5, zt - 54, 14); g.add(hp, cyx(3, 40, M(0xc98a4b, { metalness: 0.95, roughness: 0.3 }), xi + 78, Y + vh + 2.5, zt - 98, 14)); }
  }
  // EPS-Stecker oben links
  g.add(bx(22, 11, 10, BLACK(), xi + 36, Y + 5.5, zt - 7)); g.add(bx(18, 0.8, 2, GOLD(), xi + 36, Y + 11.2, zt - 7));
  if (s.vrm >= 3) { g.add(bx(22, 11, 10, BLACK(), xi + 62, Y + 5.5, zt - 7)); }
  // I/O-Anschluesse und optionale Abdeckung
  io(g, s, xi, zt);
  if (s.armor > 0) {
    const ah = [0, 22, 28, 34][s.armor], aw = [0, 38, 44, 54][s.armor];
    g.add(rb(aw, ah, 124, col, 3, xi + 24 + aw / 2, Y + 17 + ah / 2, zt - 72));
    g.add(bx(aw - 6, 0.4, 3.2, s.rgb ? G(s.acc, 1.0) : acc, xi + 24 + aw / 2, Y + 17 + ah + 0.1, zt - 30));
    g.add(flat(e.game.toUpperCase(), 100, 8, xi + 24 + aw / 2, Y + 17 + ah + 0.25, zt - 80, { color: "#e8eaee", opacity: 0.95, rot: Math.PI / 2 }));
  }
  // DIMM-Slots
  dimmSlots(g, s, sx + 54, sz - 2);
  // PCIe-Slots (oben -> unten)
  const z0 = zt - (small ? 142 : 160), m2s = [], pcies = [];
  s.slots.forEach((t, k) => {
    const z = z0 - k * PITCH;
    if (t === "m2") { m2s.push({ x: xi + 76, z, shield: m2slot(g, s, xi + 76, z, k) }); return; }
    const len = t === "x1" ? 27 : t === "x4" ? 56 : 99;
    slotBody(g, len, xi + 14, z, t.endsWith("r"), t.endsWith("r") ? (s.acc === BR.rog ? 0xc4c8cf : s.col + 0x303030) : 0, s.acc);
    pcies.push({ x: xi + 14, z, lanes: len === 99 ? 16 : len === 56 ? 4 : 1 });
  });
  m2s.unshift({ x: xi + 112, z: sz - (small ? 46 : 54), shield: m2slot(g, s, xi + 112, sz - (small ? 46 : 54), 0) });   // M.2 direkt am Sockel zuerst
  // 24-Pin, SATA, Chipsatz, Front-Header
  g.add(bx(11, 14, 52, BLACK(), xi + L - 9, Y + 7, sz - 20)); g.add(bx(8, 0.8, 46, GOLD(), xi + L - 9, Y + 14.2, sz - 20));
  for (let i = 0; i < s.sata; i++) { g.add(bx(18, 7.5, 7.4, BLACK(), xi + L - 18, Y + 3.8, zb + 96 + i * 8.8)); g.add(bx(2, 1, 4.4, GOLD(), xi + L - 12, Y + 5.6, zb + 96 + i * 8.8)); }
  const cs = [[34, 8, 34], [40, 9, 40], [46, 12, 46], [54, 15, 50], [66, 20, 60]][s.chip], cx = xi + L - 70, cz = zb + (small ? 48 : 58);
  g.add(rb(cs[0], cs[1], cs[2], col, 2, cx, Y + cs[1] / 2, cz));
  if (s.chip >= 2) for (let i = 0; i < 6; i++) g.add(bx(0.8, 0.5, cs[2] - 6, M(0x3a3d44, { metalness: 0.7 }), cx - cs[0] / 2 + 6 + i * (cs[0] - 12) / 5, Y + cs[1] + 0.1, cz));
  g.add(bx(cs[0] - 8, 0.4, 2.2, s.rgb ? G(s.acc, 1.0) : acc, cx, Y + cs[1] + 0.4, cz + cs[2] / 2 - 4));
  g.add(flat(s.code, cs[0] * 0.5, 5, cx, Y + cs[1] + 0.5, cz - 2, { color: hex6(s.acc), opacity: 1 }));
  g.add(bx(22, 8, 6, BLACK(), xi + L - 52, Y + 4, zb + 8), bx(26, 8, 6, BLACK(), xi + L - 90, Y + 4, zb + 8), bx(20, 7, 6, BLACK(), xi + L - 124, Y + 3.5, zb + 8));
  g.add(cy(10, 3.2, metal(0xd0d3d8), cx - 38, Y + 1.6, cz + (small ? 8 : 4), 32));                                   // CMOS-Batterie
  // Audio-Bereich links unten
  g.add(rb(72, 4, 32, M(s.col, { metalness: 0.4, roughness: 0.5 }), 1.5, xi + 50, Y + 2, zb + 24));
  g.add(bx(60, 0.4, 2.2, s.rgb ? G(s.acc, 1.1) : acc, xi + 50, Y + 4.1, zb + 36));
  for (let i = 0; i < 6; i++) g.add(cy(3, 7, M(0xc9a24a, { metalness: 0.9, roughness: 0.4 }), xi + 22 + i * 7, Y + 3.5, zb + 8, 16));  // Audio-Kondensatoren
  // Bohrungen/Schrauben
  [[xi + 10, zt - 10], [xi + 10, zb + 10], [xi + 104, zb + 10], [xi + L - 10, zt - 10], [xi + L - 10, zb + 10], [xi + 150, zt - 10], [xi + L - 10, sz - 60]].forEach(([x, z]) => g.add(screw(x, Y, z, 3.1, metal(0xb9bec6))));
  g.add(flat(s.code + " · " + e.game.toUpperCase(), 100, 5, xi + L / 2 + 10, Y + 0.12, zb + 22, { color: "#9aa0a8", opacity: 0.5 }));
  // Kondensatoren und Spulen verstreut
  for (let i = 0; i < 8; i++) g.add(cy(3.1, 9, BLACK(), xi + 150 + i * 8, Y + 4.5, zb + 82, 14));
  // ---- Ports (die Platine wurde mit +z = Oberkante entworfen, im Bauteil-Raum ist z gespiegelt: z_port = -z_entwurf) ----
  const seatCpu = s.plat === "am4" ? Y + 7.5 : Y + 3.5;                // Auflageflaeche des Sockels (Land-Ebene)
  const ports = [
    P("board", "guest", "mobo", [-L / 2, 0, -W / 2], [0, -1, 0], [1, 0, 0], { form: s.form, L, W, socket: s.plat, ddr: s.ddr }),   // hintere obere Ecke der Unterseite
    P("cpu", "host", "cpu-socket", [sx, seatCpu, -sz], [0, 1, 0], s.plat === "lga" ? [0, 0, 1] : [1, 0, 0], { socket: s.plat }),
  ];
  for (let i = 0; i < s.dimm; i++) ports.push(P("dimm" + i, "host", "dimm", [sx + 54 + i * 9.2, Y + 7, -(sz - 2)], [0, 1, 0], [0, 0, -1], { ddr: s.ddr, index: i }));
  let primary = true;
  pcies.forEach((p, k) => { ports.push(P("pcie" + k, "host", "pcie", [p.x, Y + 5, -p.z], [0, 1, 0], [1, 0, 0], { lanes: p.lanes, phys: p.lanes, primary: p.lanes === 16 && primary })); if (p.lanes === 16) primary = false; });
  m2s.forEach((m, k) => ports.push(P("m2_" + k, "host", "m2", [m.x - 37.2, Y + 2.4, -m.z], [0, 1, 0], [1, 0, 0], { size: 2280, slot: k }, { shield: m.shield })));
  g.userData.ports = ports;
  g.userData.dims = { L, W, H: Y + 40, form: s.form, socket: s.plat, ddr: s.ddr, dimm: s.dimm, m2: m2s.length, pcie: pcies.length, sata: s.sata };
  return g;
}

import { P } from "./ports.js";
import { THREE, bx, rb, cy, M, G, grp, wall, flat, metal, BLACK, glass, frameFan, plastic, ring, cyz, hex6 } from "./kit.js";

/* Gehaeuse: x = Breite, y = Hoehe, z = Tiefe, Front = +z, Seitenfenster (Glas) bei -x, Mainboard-Tray an der +x-Seite.
 * Masse nach echten Vorbildern (B x H x T in mm). front: solid | mesh | glass. */
const SPEC = {
  1: { w: 175, h: 355, d: 380, col: 0x1e2024, front: "solid", glass: false, fans: [], rear: 0, feet: 14, io: "min", note: "Mini-Tower" },
  2: { w: 210, h: 395, d: 400, col: 0x1b1c1f, front: "mesh", glass: false, fans: [1], rear: 1, feet: 14, io: "std", note: "mATX" },
  3: { w: 225, h: 464, d: 410, col: 0x1a1b1e, front: "solid", glass: true, fans: [], rear: 1, feet: 16, io: "std", shroud: true, acc: 0xe9ebee },
  4: { w: 230, h: 453, d: 466, col: 0x111214, front: "mesh", glass: true, fans: [2], rear: 1, feet: 16, io: "std", shroud: true, acc: 0xe31937 },
  5: { w: 212, h: 440, d: 452, col: 0x16171a, front: "mesh", glass: true, fans: [2], rear: 1, feet: 16, io: "std", shroud: true, acc: 0x9aa0a8, hex: true },
  6: { w: 230, h: 495, d: 478, col: 0x15161a, front: "glass", glass: true, fans: [3], rear: 1, feet: 16, io: "std", shroud: true, acc: 0x20f0ff, rgbFans: true },
  7: { w: 245, h: 520, d: 520, col: 0x101113, front: "mesh", glass: true, fans: [3], rear: 1, feet: 18, io: "std", shroud: true, acc: 0xe31937, big: true },
  8: { w: 285, h: 465, d: 459, col: 0x0f1012, front: "glassfront", glass: true, fans: [], rear: 1, feet: 18, io: "side", shroud: false, acc: 0xe9ebee, dual: true, sideFans: 3 },
  9: { w: 242, h: 530, d: 544, col: 0x15161a, front: "mesh", glass: true, fans: [3], rear: 1, feet: 18, io: "std", shroud: true, acc: 0x9aa0a8, hex: true, big: true },
  10: { w: 285, h: 465, d: 459, col: 0xe9ebee, front: "glassfront", glass: true, fans: [], rear: 1, feet: 18, io: "side", shroud: false, acc: 0x20f0ff, dual: true, sideFans: 3, rgbFans: true, white: true },
};
const T = 1.8;

function meshPanel(g, w, h, x, y, z, col, hex) {                // Waben/Lochblech-Front als Rahmen + Lochraster
  const dark = M(0x08090a, { metalness: 0.3, roughness: 0.7 });
  g.add(bx(w, h, 1.2, dark, x, y, z));
  const nx = Math.floor(w / 9), ny = Math.floor(h / 9), hm = M(0x2d3036, { metalness: 0.6, roughness: 0.5 });
  for (let i = 0; i < nx; i++) g.add(bx(1.2, h - 6, 1.6, hm, x - w / 2 + 6 + i * ((w - 12) / (nx - 1)), y, z + 0.4));
  if (!hex) for (let j = 0; j < ny; j++) g.add(bx(w - 6, 1.2, 1.6, hm, x, y - h / 2 + 6 + j * ((h - 12) / (ny - 1)), z + 0.4));
}

export default function pcCase(tier, e) {
  const s = SPEC[tier], g = new THREE.Group(), { w, h, d } = s, f0 = s.feet;
  const sheet = M(s.col, { metalness: s.white ? 0.3 : 0.55, roughness: s.white ? 0.45 : 0.5 }), inner = M(0x0d0e10, { metalness: 0.4, roughness: 0.7 });
  const y0 = f0, X = w / 2, Z = d / 2;
  // Rahmen: Boden, Deckel, Rueckwand, +x-Wand (Tray), Frontrahmen
  g.add(bx(w, T, d, sheet, 0, y0 + T / 2, 0));
  g.add(bx(w, T, d, s.dual ? sheet : sheet, 0, y0 + h - T / 2, 0));
  g.add(bx(w, h, T, sheet, 0, y0 + h / 2, -Z + T / 2));
  g.add(bx(T, h, d, sheet, X - T / 2, y0 + h / 2, 0));
  // Deckel-Lueftung: Schlitze
  for (let i = 0; i < 12; i++) g.add(bx(w * 0.58, 0.3, 4, BLACK(), -w * 0.05, y0 + h + 0.15, -Z * 0.55 + i * 11));
  // Seite -x: Glas oder Blech mit Lueftungsschlitzen
  if (s.glass) { g.add(bx(1.0, h - 14, d - 14, glass(0x8aa0b4, 0.2), -X + 0.5, y0 + h / 2, -2)); g.add(bx(0.5, h - 10, 3, BLACK(), -X + 0.2, y0 + h / 2, -Z + 7)); }
  else { g.add(bx(T, h, d, sheet, -X + T / 2, y0 + h / 2, 0)); for (let i = 0; i < 10; i++) g.add(bx(0.4, h * 0.5, 2, BLACK(), -X - 0.1, y0 + h * 0.5, -Z * 0.5 + i * 12)); }
  // Front
  const fz = Z - 0.6, fh = h - 2 * T - 4;
  if (s.front === "solid") { g.add(rb(w - 2, fh, 12, sheet, 2, 0, y0 + h / 2, Z - 6)); g.add(bx(w * 0.45, 1.2, 1, M(s.acc ?? 0x9aa0a8, { metalness: 0.5 }), 0, y0 + h * 0.2, Z + 0.1)); }
  else if (s.front === "mesh") { g.add(bx(w, h, 12, sheet, 0, y0 + h / 2, Z - 6)); meshPanel(g, w - 12, h - 16, 0, y0 + h / 2, Z + 0.4, s.col, s.hex); }
  else if (s.front === "glass") { g.add(bx(w, h, 12, sheet, 0, y0 + h / 2, Z - 6)); g.add(bx(w - 14, h - 14, 1.2, glass(0x8aa0b4, 0.2), 0, y0 + h / 2, Z + 0.4)); }
  else { g.add(bx(w, h, 8, sheet, 0, y0 + h / 2, Z - 4)); g.add(bx(w - 10, h - 10, 1.2, glass(0x8aa0b4, 0.2), 0, y0 + h / 2, Z + 0.4)); }
  // Innenraum
  const fanCol = s.rgbFans ? s.acc : 0x2a2d34;
  const mk = (sz) => frameFan(sz, 25, { body: 0x16171b, blade: 0x24262b, hub: 0x1c1e22, accent: s.acc ?? 0x00e5ff, rgb: s.rgbFans, speed: 6 });
  g.add(bx(w - 2 * T - 4, 1.2, d - 40, inner, 0, y0 + T + 0.6, -10));
  // Mainboard-Tray (+x) mit Ausschnitt-Optik
  g.add(bx(1.4, h - 2 * T - 6, d - 40, M(0x141518, { metalness: 0.5, roughness: 0.6 }), X - T - 0.7, y0 + h / 2, -14));
  // Rueckluefter (-z) + Heckblende
  if (s.rear) { const f = mk(120); f.rotation.x = Math.PI / 2; f.position.set(X - 100, y0 + h - 100, -Z + T + 25); g.add(f); }
  // Frontluefter
  const nf = s.fans[0] ?? 0; for (let i = 0; i < nf; i++) { const f = mk(120); f.rotation.x = Math.PI / 2; f.position.set(0, y0 + 50 + 125 * i + 45, Z - 30 + 25 - 2); g.add(f); }
  // Seitenluefter (O11: 3 Stk. an der Bodenseite des Gehaeuses) bzw. Dual-Kammer
  if (s.dual) {
    for (let i = 0; i < 3; i++) { const f = mk(120); f.position.set(-X + T + 62, y0 + T, -Z + T + 66 + i * 126); f.rotation.z = 0; g.add(f); }
    g.add(bx(20, h - 40, 6, M(s.acc, { metalness: 0.4 }), X - T - 12, y0 + h / 2, Z - 18));
  }
  // PSU-Shroud
  const SHROUD_H = 92, shroudTop = y0 + T + SHROUD_H, shroudEnd = -Z + 14 + d * 0.62;
  if (s.shroud) {
    const sg = new THREE.Group(), sm = M(0x111214, { metalness: 0.4, roughness: 0.55 });
    sg.add(bx(w - 2 * T - 10, 2.4, d * 0.62, sm, 0, shroudTop - 1.2, -Z + d * 0.31 + 14));                      // Deckel
    sg.add(bx(w - 2 * T - 10, SHROUD_H, 2.4, sm, 0, y0 + T + SHROUD_H / 2, shroudEnd - 1.2));                  // Stirnwand
    sg.add(bx(2.4, SHROUD_H, d * 0.62, sm, -(w - 2 * T - 10) / 2 + 1.2, y0 + T + SHROUD_H / 2, -Z + d * 0.31 + 14));  // Glasseite
    sg.add(bx(w - 2 * T - 10, 2, 3, M(s.acc ?? 0x888888, { metalness: 0.4 }), 0, shroudTop + 0.4, shroudEnd - 4));
    g.add(sg); g.userData.shroud = sg;
  }
  // Front-I/O oben
  const ioY = y0 + h + 0.1;
  if (s.io === "std") { g.add(bx(w * 0.45, 3, 18, M(0x0a0b0d, { metalness: 0.3 }), 0, ioY, Z - 22)); [-24, -8, 8, 24].forEach((x) => g.add(bx(11, 1.4, 6, M(0x2a5a9a, { metalness: 0.2 }), x, ioY + 1.4, Z - 22)));
    g.add(cy(5, 1.6, G(0x20f0ff, 0.5), w * 0.2, ioY + 1, Z - 22, 20)); }
  if (s.io === "min") g.add(bx(22, 1.4, 6, M(0x2a5a9a, { metalness: 0.2 }), 0, ioY + 0.7, Z - 18));
  if (s.io === "side") { g.add(bx(50, 100, 4, M(0x0a0b0d, { metalness: 0.3 }), X + 0.1 - 25, y0 + h * 0.5, Z - 2)); [[-15, 0], [0, 0], [15, 0]].forEach(([dy], i) => g.add(bx(8, 4, 2, M(0x2a5a9a, { metalness: 0.2 }), X - 25, y0 + h * 0.5 + 30 - i * 14, Z + 0.4))); }
  // Aufschrift (Ingame-Name) vorn unten
  g.add(wall(e.game.toUpperCase(), w * 0.42, 6, 0, y0 + 18, Z + 0.7, "+z", { color: "#e8eaee", opacity: 0.85 }));
  // Fuesse
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(bx(w * 0.12, f0, 30, M(0x0a0a0c, { metalness: 0.2, roughness: 0.8 }), a * (X - w * 0.14), f0 / 2, b * (Z - 40))));
  // ---------------- Ports: hier steht fest, wo jedes Teil im Gehaeuse sitzt ----------------
  const psuX = s.dual ? X - T - 80 : 0, zr = -Z + T;                         // Rueckwand-Innenseite
  const yTop = y0 + h - T - 25;                                               // Oberkante des Mainboards (immer gleich)
  const trayFace = X - T - 1.4, standoff = 6.5;
  const FORMS = tier === 1 ? ["mini"] : tier === 2 ? ["mini", "matx"] : ["mini", "matx", "atx"];
  const radMax = [0, 0, 240, 240, 360, 360, 360, 360, 360, 360, 360][tier];
  const ports = [
    // Mainboard: Auflageflaeche an den Standoffs, hintere obere Ecke; x-Achse der Platine zeigt zur Front (+z), Oberkante nach oben (+y)
    P("mobo", "host", "mobo", [trayFace - standoff, yTop, zr + 3], [-1, 0, 0], [0, 0, 1], { forms: FORMS, standoff }),
    // Netzteil: liegt auf dem Boden, Rueckseite (Kaltgeraetebuchse) an der Rueckwand
    P("psu", "host", "psu", [psuX, y0 + T, zr + 7.5], [0, 1, 0], [0, 0, 1], { forms: ["atx"], shroud: !!s.shroud }),
  ];
  for (let k = 0; k < 2; k++) {                                              // zwei 2,5"-Schaechte (Plattform vor dem Netzteil)
    const zk = s.shroud ? shroudEnd - 52 - k * 86 : Z - 12 - 55 - k * 86, yk = s.shroud ? shroudTop : y0 + T;
    g.add(bx(106, 1.6, 76, M(0x2a2c31, { metalness: 0.6, roughness: 0.5 }), psuX, yk + 0.8, zk));
    ports.push(P("sata" + k, "host", "sata25", [psuX, yk + 1.6, zk], [0, 1, 0], [1, 0, 0], { slot: k }));
  }
  if (radMax) ports.push(P("rad-top", "host", "rad", [X - 135, y0 + h - T, zr + 28], [0, -1, 0], [0, 0, 1], { max: radMax, width: 120 }));
  g.userData.ports = ports;
  // Sperrzonen (Case-Raum, mm): Teile duerfen hier nicht hinein ragen (Luefter)
  const keep = [];
  if (s.rear) keep.push({ n: "rear-fan", min: [X - 160, y0 + h - 160, -Z + T], max: [X - 40, y0 + h - 40, -Z + T + 27] });
  for (let i = 0; i < nf; i++) keep.push({ n: "front-fan" + i, min: [-60, y0 + 50 + 125 * i + 45 - 60, Z - 33], max: [60, y0 + 50 + 125 * i + 45 + 60, Z - 4] });
  if (s.dual) for (let i = 0; i < 3; i++) keep.push({ n: "floor-fan" + i, min: [-X + T + 2, y0 + T, -Z + T + 6 + i * 126], max: [-X + T + 122, y0 + T + 27, -Z + T + 126 + i * 126] });
  g.userData.keepout = keep;
  g.userData.interior = { min: [-X + (s.glass ? 1.2 : T), y0 + T, -Z + T], max: [trayFace, y0 + h - T, Z - 12] };
  g.userData.dims = { L: w, W: d, H: h + f0, forms: FORMS, radMax, shroud: !!s.shroud, tier };
  return g;
}

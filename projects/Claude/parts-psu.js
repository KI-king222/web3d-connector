import { P } from "./ports.js";
import { THREE, bx, rb, cy, cable, M, G, grp, wall, plate, rrect, grille, ring, metal, BLACK, GOLD, gpuFan, hex6, slots, cyz, cyx } from "./kit.js";

/* ATX-Netzteile: 150 mm breit, 86 mm hoch, Laenge 140-200 mm je nach Leistungsklasse. Luefter oben (liegend gezeigt),
 * Rueckseite (-z): Kaltgeraetebuchse, Schalter, Luftauslass. Vorderseite (+z): Kabelausgang. fixed = fest angeschlagene
 * Kabel, full = vollmodular mit Steckplaetzen. Farbe nach Marke: Ampera gelb, Hushwatt orange, Seraph rot. */
const EFF = { BRONZE: 0xcd7f32, GOLD: 0xd9b44a, PLATINUM: 0xd9dde3, TITANIUM: 0xaeb4bd };
const SPEC = {
  1: { l: 140, w: 450, eff: "BRONZE", mod: "fixed", fan: 120, body: 0x303338, top: 0x2a2c31, acc: 0x9aa0a8, rough: 0.6, label: "GENERIC", sticker: 0xe9ebee },
  2: { l: 140, w: 550, eff: "BRONZE", mod: "fixed", fan: 120, body: 0x1a1b1e, top: 0x1a1b1e, acc: 0xf5c400, rough: 0.55, label: "AMPERA", sticker: 0x22252a },
  3: { l: 140, w: 450, eff: "BRONZE", mod: "fixed", fan: 120, body: 0x1d1f23, top: 0x1d1f23, acc: 0xe8731a, rough: 0.5, label: "HUSHWATT", sticker: 0x22252a },
  4: { l: 140, w: 650, eff: "GOLD", mod: "full", fan: 120, body: 0x17181b, top: 0x17181b, acc: 0xd9322e, rough: 0.5, label: "SERAPH", sticker: 0x1e2024 },
  5: { l: 160, w: 750, eff: "GOLD", mod: "full", fan: 135, body: 0x18191c, top: 0x18191c, acc: 0xf5c400, rough: 0.45, label: "AMPERA", sticker: 0x1e2024 },
  6: { l: 160, w: 750, eff: "PLATINUM", mod: "full", fan: 135, body: 0x2a2d32, top: 0x2a2d32, acc: 0xe8731a, rough: 0.42, label: "HUSHWATT", sticker: 0x1b1d21 },
  7: { l: 170, w: 850, eff: "PLATINUM", mod: "full", fan: 135, body: 0x111214, top: 0x111214, acc: 0xd9322e, rough: 0.28, label: "SERAPH", sticker: 0x1a1c20, gloss: true },
  8: { l: 180, w: 1000, eff: "PLATINUM", mod: "full", fan: 140, body: 0x141518, top: 0x141518, acc: 0xf5c400, rough: 0.4, label: "AMPERA", sticker: 0x1a1c20 },
  9: { l: 170, w: 1000, eff: "TITANIUM", mod: "full", fan: 135, body: 0x0f1012, top: 0x0f1012, acc: 0xd9322e, rough: 0.26, label: "SERAPH", sticker: 0x181a1e, gloss: true },
  10: { l: 200, w: 1600, eff: "TITANIUM", mod: "full", fan: 140, body: 0x1b1d21, top: 0x1b1d21, acc: 0xf5c400, rough: 0.4, label: "AMPERA", sticker: 0x16181b, display: true },
};
const W = 150, H = 86;

function sleeved(pts, n, off, r, col = 0x141417) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; g.add(cable(pts.map(([x, y, z]) => [x + off[0] * k, y + off[1] * k, z + off[2] * k]), col, r)); }
  return g;
}

export default function psu(tier, e) {
  const s = SPEC[tier], l = s.l, g = new THREE.Group();
  const bodyM = M(s.body, { metalness: s.gloss ? 0.7 : 0.55, roughness: s.rough }), topM = M(s.top, { metalness: s.gloss ? 0.7 : 0.55, roughness: s.rough });
  const accM = M(s.acc, { metalness: 0.35, roughness: 0.45 });
  // Gehaeuse: Unterteil + Rahmen + Deckel mit rundem Ausschnitt fuer den Luefter
  g.add(rb(W, 80, l, bodyM, 3, 0, 40, 0));
  [[W - 5, 6, 1.5, 0, 83, l / 2 - 1.5], [W - 5, 6, 1.5, 0, 83, -l / 2 + 1.5]].forEach(([w, h, d, x, y, z]) => g.add(bx(w, h, d, bodyM, x, y, z)));
  [[1.5, 6, l - 3, W / 2 - 1.5, 83, 0], [1.5, 6, l - 3, -W / 2 + 1.5, 83, 0]].forEach(([w, h, d, x, y, z]) => g.add(bx(w, h, d, bodyM, x, y, z)));
  const fz = (l - 24) / 2 - l / 2 + 12 + 12;                                          // Luefter sitzt etwas zur Rueckseite hin
  const fr = s.fan / 2;
  g.add(plate(rrect(W, l, 3), 3, topM, 0, 83, 0, [{ x: 0, z: fz, r: fr - 2 }]));
  g.add(bx(W - 10, 0.1, l - 10, BLACK(), 0, 80.2, 0));
  const fan = gpuFan(s.fan - 8, { accent: s.acc }, 5, 9); fan.position.set(0, 82, fz); g.add(fan);
  g.add(grille(fr - 2, M(0x0b0b0d, { metalness: 0.4, roughness: 0.5 }), 0, 86.4, fz, 5, 14, 0.9));
  g.add(ring(fr - 1, 1.1, accM, 0, 86.3, fz, 64));
  if (s.display) g.add(bx(30, 0.5, 8, G(0x20f0ff, 0.7), 0, 86.2, l / 2 - 12));
  // Seitenaufkleber (+x): Marke, Modell, Leistung, Effizienz-Plakette
  const sx = W / 2 + 0.1, sw = Math.min(l - 24, 130);
  g.add(bx(0.3, 56, sw, M(s.sticker, { metalness: 0.1, roughness: 0.6 }), sx, 42, 0));
  g.add(bx(0.34, 6, sw, accM, sx + 0.02, 66, 0));
  g.add(wall(s.label, sw * 0.5, 9, sx + 0.3, 56, -sw * 0.16, "+x", { color: hex6(s.acc), opacity: 1 }));
  g.add(wall(e.game.toUpperCase(), sw * 0.9, 6, sx + 0.3, 46, 0, "+x", { color: "#e8eaee", opacity: 1 }));
  g.add(wall(s.w + " W", sw * 0.34, 10, sx + 0.3, 30, -sw * 0.28, "+x", { color: "#ffffff", opacity: 1 }));
  g.add(cyx(10, 0.4, M(EFF[s.eff], { metalness: 0.8, roughness: 0.3 }), sx + 0.1, 31, sw * 0.28, 24));
  // Rueckseite (-z): Luftauslass, Kaltgeraetebuchse, Schalter
  const rz = -l / 2 - 0.05;
  g.add(bx(96, 52, 0.3, M(0x08090a, { metalness: 0.3 }), 14, 44, rz));
  for (let i = 0; i < 7; i++) g.add(bx(92, 2.6, 0.5, M(0x3a3e45, { metalness: 0.8, roughness: 0.4 }), 14, 24 + i * 7, rz - 0.15));
  g.add(bx(27, 20, 5, M(0x0c0d0f, { metalness: 0.2 }), -52, 16, rz - 2), bx(12, 14, 1.2, M(0x2a2c31, { metalness: 0.8 }), -52, 16, rz - 4.6));
  g.add(bx(14, 20, 7, M(0x0c0d0f, { metalness: 0.2 }), -52, 54, rz - 3), bx(10, 14, 2, M(0xd9322e, { metalness: 0.1, roughness: 0.5 }), -52, 54, rz - 6.4));
  // Vorderseite (+z): Kabelausgang
  const fz2 = l / 2 + 0.05, blk = 0x141417;
  const pbk = M(0x0a0b0d, { metalness: 0.2, roughness: 0.6 });
  if (s.mod === "full") {
    g.add(bx(W - 14, 66, 0.4, M(0x08090a, { metalness: 0.25 }), 0, 41, fz2));
    const rows = [[-52, 54, 16, 7], [-24, 54, 16, 7], [4, 54, 16, 7], [32, 54, 16, 7], [-52, 36, 16, 7], [-24, 36, 16, 7], [4, 36, 16, 7], [32, 36, 16, 7], [56, 54, 10, 7], [56, 36, 10, 7], [-52, 18, 16, 7], [-24, 18, 16, 7], [4, 18, 16, 7], [32, 18, 16, 7]];
    rows.forEach(([x, y, w, h]) => { g.add(bx(w, h + 6, 3.2, pbk, x, y, fz2 + 1.0)); g.add(bx(w - 3, h, 3.4, M(0x1d1e22, { metalness: 0.3 }), x, y, fz2 + 1.1)); });
    g.add(bx(W - 14, 1.4, 0.8, accM, 0, 70.5, fz2 + 0.5));
    // eingesteckte Kabel: 24-Pin, CPU 8-Pin, PCIe 6+2
    g.add(sleeved([[-52, 54, fz2 + 3], [-52, 50, fz2 + 20], [-70, 20, fz2 + 40], [-92, 3, fz2 + 65], [-100, 3, fz2 + 95]], 5, [3.6, 0, 0], 1.7));
    g.add(bx(26, 8, 52, M(blk, { metalness: 0.2 }), -100, 5, fz2 + 108));
    g.add(sleeved([[4, 54, fz2 + 3], [4, 48, fz2 + 18], [20, 22, fz2 + 37], [44, 3, fz2 + 60], [52, 3, fz2 + 85]], 3, [3, 0, 0], 1.7));
    g.add(bx(20, 8, 14, M(blk, { metalness: 0.2 }), 52, 5, fz2 + 90));
  } else {
    g.add(rb(34, 24, 4, bodyM, 2, 0, 42, fz2 + 1));
    g.add(bx(30, 16, 1, pbk, 0, 42, fz2 + 3.1));
    g.add(sleeved([[0, 46, fz2 + 4], [0, 40, fz2 + 17], [-22, 18, fz2 + 37], [-60, 3, fz2 + 65], [-66, 3, fz2 + 95]], 5, [3.6, 0, 0], 1.7));
    g.add(bx(26, 8, 52, M(blk, { metalness: 0.2 }), -66, 5, fz2 + 108));
    g.add(sleeved([[0, 38, fz2 + 4], [10, 30, fz2 + 20], [40, 6, fz2 + 50], [48, 3, fz2 + 75]], 3, [3, 0, 0], 1.7));
    g.add(bx(20, 8, 14, M(blk, { metalness: 0.2 }), 48, 5, fz2 + 80));
  }
  // Gummifuesse
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(cy(5, 1.2, M(0x0c0c0e, { metalness: 0.1, roughness: 0.9 }), a * (W / 2 - 14), 0.6, b * (l / 2 - 14), 16)));
  // Port: Unterseite, hinterer Rand (Rueckwand mit Kaltgeraetebuchse), Front mit Kabelausgang = +z
  g.userData.ports = [P("body", "guest", "psu", [0, 0, -l / 2], [0, -1, 0], [0, 0, 1], { form: "atx", watt: s.w })];
  g.userData.body = { min: [-W / 2, 0, -l / 2], max: [W / 2, H, l / 2] };       // Gehaeuse ohne Kabel (Kabel sind flexibel und werden nicht geprueft)
  g.userData.dims = { L: W, W: l, H, form: "atx", watt: s.w };
  return g;
}

import { THREE, bx, rb, M, G, grp, wall, profile, metal, BLACK, GOLD, smd, hex6 } from "./kit.js";
import { P } from "./ports.js";

/* Arbeitsspeicher: Riegel stehen aufrecht (x = 133,35 mm Laenge, y = Hoehe, z = Dicke). PCB 31,25 mm hoch, 1,27 mm dick.
 * DDR4: Kerbe bei 72 mm, DDR5: Kerbe bei 82 mm von links.
 * Stile: bare = nackte Platine mit 8 Chips (Standard-Riegel), lpx = flacher Low-Profile-Spreader mit Rippenkamm,
 *        beast = Spreader mit abgeschraegten Ecken + schraegem Akzent, dom = hoher Riegel mit Lamellenkamm (Dominator-Stil),
 *        reneg = DDR5-Spreader mit schraeger Kante und Lichtleiste (Renegade-Stil) */
const RED = 0xe31937, YEL = 0xf5c400;
const SPEC = {
  1: { gen: 4, n: 1, style: "bare", pcb: 0x2c6b3f, sticker: 0xe8eaee, acc: 0x808690, note: "DDR4-2666  8GB" },
  2: { gen: 4, n: 1, style: "bare", pcb: 0x2c6b3f, sticker: 0xdfe3ea, acc: RED, note: "DDR4-3200  16GB" },
  3: { gen: 4, n: 2, style: "lpx", plate: 0x16171a, acc: YEL },
  4: { gen: 4, n: 2, style: "beast", plate: 0x1b1c21, acc: RED },
  5: { gen: 4, n: 2, style: "dom", plate: 0x26292e, acc: YEL, fins: 0xb9bec6 },
  6: { gen: 5, n: 2, style: "reneg", plate: 0x1f2024, acc: RED, bar: 0x9aa0a8 },
  7: { gen: 5, n: 2, style: "dom", plate: 0x202226, acc: YEL, fins: 0x8f959d },
  8: { gen: 5, n: 2, style: "reneg", plate: 0x232529, acc: RED, bar: 0xc3c8cf, tall: 4 },
  9: { gen: 5, n: 2, style: "dom", plate: 0x202226, acc: YEL, fins: 0xc3c8cf, rgb: [0x20f0ff, 0xff2fd0] },
  10: { gen: 5, n: 2, style: "reneg", plate: 0x232529, acc: RED, bar: 0xc3c8cf, tall: 6, rgb: [0xff2fd0, 0x20f0ff] },
};
const LEN = 133.35, PH = 31.25, T = 1.27;

function stick(s, e, k) {
  const g = new THREE.Group();
  const bare = s.style === "bare";
  g.add(bx(LEN, PH, T, M(bare ? s.pcb : 0x14161a, { metalness: 0.1, roughness: 0.55 }), 0, PH / 2, 0));
  // Kontaktleiste mit Kerbe
  const nx = -LEN / 2 + (s.gen === 4 ? 72 : 82);
  g.add(bx(LEN - 2, 3.2, T + 0.08, GOLD(), 0, 1.7, 0));
  g.add(bx(1.6, 3.4, T + 0.12, M(0x0c0c0e), nx, 1.7, 0));
  if (s.gen === 5) g.add(bx(7, 5, 1.1, BLACK(), -LEN / 2 + 14, 9, T / 2 + 0.55));                          // PMIC (DDR5)
  if (bare) {
    const chip = M(0x1a1b1e, { metalness: 0.2, roughness: 0.5 }), z = T / 2 + 0.55;
    for (let i = 0; i < 8; i++) { const x = -LEN / 2 + 11 + i * 15.6 + (i > 3 ? 2 : 0); g.add(bx(11.2, 9.2, 1.1, chip, x, 19, z)); }
    g.add(smd(10, 1, 6, 1, 0, 6.2, z - 0.1, M(0x7a6a4a, { metalness: 0.2 })));                              // Kondensatoren
    g.add(bx(4, 3, 0.9, chip, nx + 9, 6.5, z));                                                              // SPD
    g.add(bx(62, 11, 0.12, M(s.sticker, { metalness: 0.05, roughness: 0.7 }), 8, 11.5, z + 0.6));            // Aufkleber
    g.add(bx(62, 1.2, 0.14, M(s.acc, { metalness: 0.2 }), 8, 17.6, z + 0.62));
    g.add(wall(e.game.toUpperCase(), 58, 4.2, 8, 12.8, z + 0.72, "+z", { color: "#20242b", opacity: 1 }));
    g.add(wall(s.note, 50, 3.4, 8, 8.8, z + 0.72, "+z", { color: "#3a4048", opacity: 1 }));
    return g;
  }
  // Spreader (beidseitig). Profil in x/y, Dicke 3 mm.
  const pm = M(s.plate, { metalness: 0.78, roughness: s.style === "dom" ? 0.34 : 0.46 }), zo = T / 2 + 1.5 + 0.02;
  const extra = s.tall || 0;
  let prof;
  if (s.style === "lpx") prof = [[-66, 4], [66, 4], [66, 31], [64, 33.4], [-64, 33.4], [-66, 31]];
  else if (s.style === "beast") prof = [[-66.2, 4], [66.2, 4], [66.2, 29], [58, 35], [-58, 35], [-66.2, 29]];
  else if (s.style === "reneg") prof = [[-66.2, 4], [66.2, 4], [66.2, 30], [48, 35 + extra], [-66.2, 35 + extra]];
  else prof = [[-66.2, 4], [66.2, 4], [66.2, 36], [-66.2, 36]];
  [-1, 1].forEach((sd) => g.add(profile(prof, 3, pm, 0, 0, sd * zo)));
  const front = zo + 1.55;
  if (s.style === "lpx") {                                                                                  // Rippenkamm obenauf
    for (let i = 0; i < 12; i++) g.add(bx(5.2, 3.2, 6.4, M(0x2a2c31, { metalness: 0.7, roughness: 0.4 }), -49.5 + i * 9, 34.6, 0));
    g.add(bx(26, 6, 0.1, M(s.acc, { metalness: 0.2 }), -44, 22, front)); g.add(bx(2, 6, 0.1, M(0x0c0c0e), -29.5, 22, front));
  }
  if (s.style === "beast") {
    const sl = bx(2.2, 34, 0.12, M(s.acc, { metalness: 0.3, roughness: 0.4 }), -22, 19, front); sl.rotation.z = -0.62; g.add(sl);
    g.add(bx(46, 8, 0.1, M(0x0c0d10, { metalness: 0.4 }), 28, 15, front));
  }
  if (s.style === "dom") {                                                                                  // Lamellenkamm + optionale Lichtleiste
    const fm = M(s.fins, { metalness: 0.9, roughness: 0.28 }), lit = s.rgb ? G(s.rgb[k % 2], 1.3) : M(0x30343a, { metalness: 0.4 });
    g.add(bx(124, 3, 7.2, M(0x16171a, { metalness: 0.5 }), 0, 37.5, 0));
    g.add(bx(112, 2.2, 5.2, lit, 0, 36.6, 0));
    for (let i = 0; i < 13; i++) g.add(bx(4.6, 15, 6.4, fm, -54 + i * 9, 46.5, 0));
    g.add(bx(110, 1.0, 6.6, fm, 0, 54.3, 0));
    g.add(bx(60, 8, 0.1, M(s.acc, { metalness: 0.3 }), 20, 22, front));
  }
  if (s.style === "reneg") {
    const barM = s.rgb ? G(s.rgb[k % 2], 1.4) : M(s.bar, { metalness: 0.9, roughness: 0.3 });
    g.add(bx(112, 3.2, 5.0, barM, -4, 36.4 + extra, 0));
    const sl = bx(2.2, 36, 0.12, M(s.acc, { metalness: 0.3, roughness: 0.4 }), 14, 19, front); sl.rotation.z = -0.55; g.add(sl);
    g.add(bx(40, 7, 0.1, M(0x0c0d10, { metalness: 0.4 }), -34, 17, front));
  }
  g.add(wall(e.game.toUpperCase(), s.style === "dom" ? 56 : 48, 4.2, s.style === "dom" ? -26 : 22, 12, front + 0.05, "+z", { color: "#e8eaee", opacity: 0.95 }));
  return g;
}

export default function ram(tier, e) {
  const s = SPEC[tier], g = new THREE.Group(), pitch = s.style === "bare" ? 14 : 15;
  const members = [];
  for (let i = 0; i < s.n; i++) {
    const st = stick(s, e, i); st.position.z = (i - (s.n - 1) / 2) * pitch; g.add(st);
    // Jeder Riegel ist ein eigenes Teil mit eigenem Port: Unterkante (Kontaktleiste), Kerbe nach +x
    members.push({ obj: st, ports: [P("stick", "guest", "dimm", [0, 0, 0], [0, -1, 0], [1, 0, 0], { ddr: s.gen })] });
  }
  g.userData.members = members;
  g.userData.dims = { L: LEN, W: pitch * s.n, H: s.style === "dom" ? 55 : 36 + (s.tall || 0) };
  return g;
}

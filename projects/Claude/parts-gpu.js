import { PARTS } from "./components.js";
import { P } from "./ports.js";
import { THREE, bx, rb, M, G, grp, wall, plastic, metal, BLACK, GOLD, hex6 } from "./kit.js";

/* Grafikkarten: je Stufe echte Laenge/Hoehe/Slotbreite/Luefterzahl.
 * Quanta = gruen (NVIDIA-Stil), Ember = rot (AMD-Stil). Mittelklasse ohne RGB, nur die Spitze leuchtet. */
const QUANTA = { body: 0x1a1b1f, accent: 0x76b900, pcb: 0x14181b, metal: 0xa9aeb5 };
const EMBER = { body: 0x19181b, accent: 0xe3262e, pcb: 0x1a1315, metal: 0xa3a7ae };

// L = Laenge, Wd = Kartenhoehe, slots = Slotbreite, fans = Luefter, conn = sichtbare Stromstecker
const SPEC = {
  1: { th: QUANTA, L: 145, Wd: 69, slots: 1.9, fans: 0, plastic: true, backplate: false, rgb: false, conn: 0 },            // passiv, Low-Profile
  2: { th: EMBER, L: 172, Wd: 111, slots: 2.0, fans: 1, plastic: true, backplate: false, rgb: false, conn: 0 },
  3: { th: QUANTA, L: 204, Wd: 118, slots: 2.0, fans: 2, plastic: true, backplate: false, rgb: false, conn: 0 },
  4: { th: EMBER, L: 243, Wd: 125, slots: 2.1, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
  5: { th: QUANTA, L: 242, Wd: 125, slots: 2.0, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
  6: { th: EMBER, L: 243, Wd: 126, slots: 2.2, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
  7: { th: QUANTA, L: 267, Wd: 126, slots: 2.5, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
  8: { th: EMBER, L: 320, Wd: 132, slots: 3.0, fans: 3, plastic: false, backplate: true, rgb: true, conn: 2 },
  9: { th: QUANTA, L: 336, Wd: 140, slots: 3.4, fans: 3, plastic: false, backplate: true, rgb: true, premium: true, conn: 1 },
  10: { th: QUANTA, L: 357, Wd: 150, slots: 3.5, fans: 3, plastic: false, backplate: true, rgb: true, premium: true, conn: 1 },
};

/** Passive Low-Profile-Karte (GT 1030 Silent): Alu-Kuehlkoerper ohne Luefter, halbhohes Slotblech mit HDMI + DVI. */
function passive(s, e) {
  const { L, Wd } = s, T = Math.round(s.slots * 20.3), g = new THREE.Group();
  const sink = M(0x2a2f36, { metalness: 0.75, roughness: 0.42 }), al = M(0x3a4048, { metalness: 0.8, roughness: 0.38 });
  g.add(bx(L - 8, 1.6, Wd - 4, M(0x14181b, { metalness: 0.15, roughness: 0.6 }), 2, 2.4, 0));          // Platine
  g.add(bx(Math.min(39, L * 0.3), 1.4, 6, GOLD(), -L / 2 + 11.5 + Math.min(39, L * 0.3) / 2, 2.2, -Wd / 2 + 5));                      // PCIe-Kontakte (x4)
  g.add(bx(L - 30, 3.4, Wd - 12, sink, 8, 6, 0));                                                        // Bodenplatte des Kuehlkoerpers
  const n = 13, span = Wd - 16;
  for (let i = 0; i < n; i++) g.add(bx(L - 34, T - 10, 1.3, al, 8, 7.7 + (T - 10) / 2, -span / 2 + (i * span) / (n - 1)));   // Lamellen
  g.add(bx(L - 34, 2, Wd - 14, sink, 8, T - 2.2, -0.0));                                                 // Deckplatte, darunter laufen die Lamellen durch
  g.add(rb(46, 1, 22, M(0x1c2127, { metalness: 0.4 }), 3, 8, T - 0.6, 0));                               // Schild-Plakette
  g.add(bx(30, 0.3, 2, G(s.th.accent, 0.8), 8, T - 0.05, 0));
  // Halbhohes Slotblech (low profile ~ 80 mm) mit HDMI + DVI-D
  g.add(bx(1.8, T + 4, 79, metal(0xb4b9c0), -L / 2 - 1, (T + 4) / 2, 4));
  g.add(rb(2.2, 6.5, 15.5, BLACK(), 1, -L / 2 - 1.1, 14, 28)); g.add(rb(2.2, 11, 36, M(0xe9ebee, { metalness: 0.1, roughness: 0.6 }), 1, -L / 2 - 1.1, 17, -2));
  g.add(wall(e.game, 60, 6, 0, T * 0.5, 0, "+z", { color: hex6(s.th.accent) }));
  g.userData.dims = { L, Wd, T, tier: 1 };
  return g;
}

/** PCIe-Port: Platinenkante (Goldfinger beginnen bei xs, z = Platinenkante). Der Generator modelliert die Karte spiegelverkehrt
 *  zu einer echten Karte (Luefter oben, Anschluesse auf +z) - mirror:"y" dreht sie beim Einbau richtig herum (Luefter nach unten). */
function withPort(g, s, tier) {
  const { L, Wd } = s;
  const xs = -L / 2 + 11.5, y = tier === 1 ? 2.4 : 3, z = tier === 1 ? -Wd / 2 + 2 : -Wd / 2 + 3;
  g.userData.ports = [P("pcie", "guest", "pcie", [xs, y, z], [0, 0, -1], [1, 0, 0], { phys: 16, watt: tier }, { mirror: "y" })];
  return g;
}

export default function gpu(tier, e) {
  const s = SPEC[tier];
  if (tier === 1) { const g = passive(s, e); g.userData.dims.W = s.Wd; g.userData.dims.H = g.userData.dims.T; return withPort(g, s, 1); }
  const g = PARTS.gpu(s.th, { preset: "t" + tier, tier, label: e.game, length: s.L, width: s.Wd, slots: s.slots, fans: s.fans, plastic: s.plastic,
    backplate: s.backplate, rgb: s.rgb, premium: !!s.premium, conn: s.conn });
  const { L, Wd, T } = g.userData.dims;
  g.traverse((o) => { if (o.isMesh && o.material && o.material.map) o.rotation.z = 0; });          // Logo liest sich bei liegender Karte von vorn richtig
  const acc = s.th.accent;
  if (tier < 5) g.add(wall(e.game, Math.min(L * 0.5, 100), 9, -L * 0.1, T * 0.5, Wd / 2 + 0.3, "+z", { color: hex6(acc) }));
  if (s.fans > 1) {                                                                               // schraege Markenstreifen zwischen den Luefterloechern
    const endM = 8, pitch = (L - 2 * endM) / s.fans;
    for (let i = 1; i < s.fans; i++) {
      const b = bx(1.4, 0.5, Wd * 0.5, s.rgb ? G(acc, 0.9) : M(acc, { metalness: 0.3, roughness: 0.4 }), -L / 2 + endM + pitch * i, T + 0.2, 0); b.rotation.y = 0.35; g.add(b);
    }
  }
  g.userData.dims = { L, W: Wd, H: T };
  return withPort(g, s, tier);
}

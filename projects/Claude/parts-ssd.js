import { THREE, bx, rb, cy, M, G, grp, wall, flat, plate, rrect, metal, BLACK, GOLD, smd, hex6 } from "./kit.js";
import { P } from "./ports.js";

/* SSDs: 2,5" SATA = 100 x 69,85 x 7 mm mit L-foermigem SATA-Anschluss. M.2 2280 = 80 x 22 mm mit Goldkontakten links,
 * Befestigungskerbe rechts, Controller, 1-2 NAND-Chips und Aufkleber; hoehere Stufen mit Kuehlkoerper. */
const BLUE_WD = 0x0067b1, SAM = 0x1428a0, RED = 0xe31937;
const SPEC = {
  1: { kind: "sata", body: 0x7c828b, plastic: true, top: 0xdfe3ea, band: 0x4a6fa5, txt: "#1c222b" },
  2: { kind: "m2", pcb: 0x16181c, label: 0x15161a, band: RED, txt: "#e8eaee", nand: 1, dram: false },
  3: { kind: "sata", body: 0x16171a, plastic: false, top: 0x16171a, band: 0xc9ced6, txt: "#e8eaee", diag: true },
  4: { kind: "m2", pcb: 0x14161a, label: 0x1a4d8f, band: 0xdde6f2, txt: "#f2f6fb", nand: 1, dram: false },
  5: { kind: "m2", pcb: 0x14161a, label: 0x0d0e11, band: SAM, txt: "#e8eaee", nand: 1, dram: true },
  6: { kind: "m2", pcb: 0x14161a, label: 0x1f6fb5, band: 0xe9edf2, txt: "#f2f6fb", nand: 2, dram: false },
  7: { kind: "m2", pcb: 0x14161a, hs: { h: 6.0, color: 0x1a1b1f, stripe: SAM, ridges: 0 }, txt: "#e8eaee", nand: 2, dram: true },
  8: { kind: "m2", pcb: 0x14161a, hs: { h: 10.5, color: 0x17181b, stripe: RED, ridges: 9, wide: true }, txt: "#e8eaee", nand: 2, dram: true },
  9: { kind: "m2", pcb: 0x14161a, hs: { h: 6.8, color: 0x202228, stripe: SAM, ridges: 0, grid: true }, txt: "#e8eaee", nand: 2, dram: true },
  10: { kind: "m2", pcb: 0x14161a, hs: { h: 8.4, color: 0x16171a, stripe: RED, ridges: 6, wide: true, logo: true }, txt: "#f2f4f7", nand: 2, dram: true },
};

function sata(s, e) {
  const g = new THREE.Group(), H = 7;
  const body = s.plastic ? M(s.body, { metalness: 0.15, roughness: 0.55 }) : M(s.body, { metalness: 0.75, roughness: 0.42 });
  g.add(rb(100, H, 69.85, body, 2.2, 0, H / 2, 0));
  g.add(rb(98.4, 0.4, 68.2, M(s.top, { metalness: s.plastic ? 0.1 : 0.55, roughness: 0.5 }), 1.5, 0, H + 0.1, 0));
  g.add(bx(98, 0.9, 1.1, M(0x0b0b0d, { metalness: 0.3 }), 0, H * 0.5, 69.85 / 2 + 0.02));                         // Gehaeusenaht (Deckel/Boden)
  if (s.diag) {                                                                                                    // schraeger Streifen wie auf Mainstream-SSDs
    g.add(plate([[-6, 34], [20, 34], [-12, -34], [-38, -34]], 0.3, M(0x23252a, { metalness: 0.7, roughness: 0.4 }), 0, H + 0.3, 0));
    g.add(plate([[22, 34], [26, 34], [-6, -34], [-10, -34]], 0.32, M(s.band, { metalness: 0.9, roughness: 0.3 }), 0, H + 0.3, 0));
  } else {
    g.add(plate([[-47, -33], [47, -33], [47, -26], [-47, -26]], 0.3, M(s.band, { metalness: 0.4, roughness: 0.5 }), 0, H + 0.3, 0));
  }
  g.add(flat(e.game.toUpperCase(), 56, 8, -14, H + 0.7, s.diag ? -6 : 6, { color: s.txt, opacity: 1 }));
  g.add(flat("SATA 6Gb/s · 2.5\"", 38, 3.2, -14, H + 0.7, s.diag ? 3 : 15, { color: s.txt, opacity: 0.75 }));
  // L-foermiger SATA-Stecker an der Schmalseite (+x): 7-poliger Daten- und 15-poliger Stromteil, dazwischen Kerbe
  const pb = M(0x0c0d10, { metalness: 0.2, roughness: 0.6 });
  g.add(bx(5.5, 4.4, 8.2, pb, 52.7, 2.9, -26.5), bx(5.5, 4.4, 22.4, pb, 52.7, 2.9, 3.6), bx(5.5, 1.6, 5.6, pb, 52.7, 1.8, -13.3));
  g.add(bx(0.4, 1.0, 6.4, GOLD(), 55.6, 2.9, -26.5), bx(0.4, 1.0, 18.6, GOLD(), 55.6, 2.9, 3.6));
  g.userData.ports = [P("bay", "guest", "sata25", [0, 0, 0], [0, -1, 0], [1, 0, 0], { size: "2.5" })];
  g.userData.dims = { L: 105, W: 69.85, H: H + 0.5, iface: "sata" };
  return g;
}

function m2(s, e) {
  const g = new THREE.Group(), L = 80, W = 22, zt = 0.8;
  // Platine mit halbrunder Befestigungskerbe am rechten Ende
  const pts = [[-40, -11], [40, -11], [40, -2.1]];
  for (let k = 1; k <= 7; k++) { const a = (-90 + 180 * (k / 8)) * Math.PI / 180; pts.push([40 - 2.1 * Math.cos(a), 2.1 * Math.sin(a)]); }
  pts.push([40, 2.1], [40, 11], [-40, 11]);
  g.add(plate(pts, zt, M(s.pcb, { metalness: 0.15, roughness: 0.5 }), 0, 0, 0));
  g.add(bx(4.8, 0.9, 20.4, GOLD(), -37.4, 0.45, 0));                                                            // Kontakte
  g.add(bx(4.8, 1.0, 1.3, BLACK(), -37.4, 0.5, 3.4));                                                           // M-Key-Kerbe
  const chip = M(0x15161a, { metalness: 0.25, roughness: 0.45 }), lid = M(0x6b707a, { metalness: 0.9, roughness: 0.3 });
  const yT = zt;
  const bare = !s.hs;
  if (bare || true) {
    g.add(bx(12, 0.9, 12, chip, -25, yT + 0.45, 0), bx(9, 0.1, 9, lid, -25, yT + 0.92, 0));                       // Controller
    if (s.dram) g.add(bx(7, 0.8, 9, chip, -13, yT + 0.4, -2));                                                    // DRAM-Cache
    const xs = s.nand === 2 ? [5, 26] : [20];
    xs.forEach((x) => g.add(bx(14, 1.0, 18, chip, x, yT + 0.5, 0)));                                              // NAND
    g.add(smd(5, 2, 2.6, 2.2, -8, yT, 7.5));
  }
  if (bare) {
    // Aufkleber ueber den NAND-Chips mit Marke, Modell und Farbband
    const lx = s.nand === 2 ? 15.5 : 20, lw = s.nand === 2 ? 38 : 24;
    g.add(bx(lw, 0.12, 19.6, M(s.label, { metalness: 0.2, roughness: 0.55 }), lx, yT + 1.05, 0));
    g.add(bx(lw, 0.14, 2.2, M(s.band, { metalness: 0.3, roughness: 0.45 }), lx, yT + 1.07, -8.2));
    g.add(flat(e.game.toUpperCase(), lw - 3, 5, lx, yT + 1.2, 0.8, { color: s.txt, opacity: 1 }));
    g.add(flat("PCIe NVMe M.2 2280", lw - 8, 2.6, lx, yT + 1.2, 6, { color: s.txt, opacity: 0.7 }));
    g.userData.dims = { L, W, H: yT + 1.4, iface: "m2" };
    g.userData.ports = [P("m2", "guest", "m2", [-37.4, 0, 0], [0, -1, 0], [1, 0, 0], { size: 2280, heatsink: false })];
    return g;
  }
  // Kuehlkoerper (Aluminium) mit Federclip
  const hs = s.hs, hx = 6.5, hl = hs.wide ? 66 : 62, hw = hs.wide ? 24 : 22.6, y0 = yT + 1.1;
  const hm = M(hs.color, { metalness: 0.78, roughness: 0.4 });
  g.add(rb(hl, hs.h, hw, hm, 1.2, hx, y0 + hs.h / 2, 0));
  g.add(bx(hl - 4, 0.3, 2.6, M(hs.stripe, { metalness: 0.3, roughness: 0.4 }), hx, y0 + hs.h + 0.05, -hw / 2 + 4));          // Akzentstreifen
  for (let i = 0; i < hs.ridges; i++) g.add(bx(2.4, 1.6, hw - 3, M(0x2a2c32, { metalness: 0.7, roughness: 0.4 }), hx - hl / 2 + 10 + i * ((hl - 20) / Math.max(1, hs.ridges - 1)), y0 + hs.h + 0.7, 0));
  if (hs.grid) for (let i = 0; i < 12; i++) g.add(bx(0.5, 0.2, hw - 5, M(0x34373e, { metalness: 0.8, roughness: 0.3 }), hx - 24 + i * 4.4, y0 + hs.h + 0.12, 0));
  g.add(flat(e.game.toUpperCase(), hl * 0.62, 5, hx - 6, y0 + hs.h + (hs.ridges ? 1.6 : 0.25), 3, { color: s.txt, opacity: 1 }));
  if (hs.logo) g.add(cy(3.2, 0.3, G(hs.stripe, 1.1), hx + 22, y0 + hs.h + 1.6, 3, 24));
  [[-1, 1], [1, 1]].forEach(([a]) => g.add(bx(1.2, hs.h * 0.7, hw + 0.8, M(0x8a8f98, { metalness: 0.95, roughness: 0.25 }), hx + a * (hl / 2 - 4), y0 + hs.h * 0.4, 0)));   // Klemmbuegel
  g.userData.dims = { L, W, H: y0 + hs.h, iface: "m2" };
  g.userData.ports = [P("m2", "guest", "m2", [-37.4, 0, 0], [0, -1, 0], [1, 0, 0], { size: 2280, heatsink: true })];
  return g;
}

export default function ssd(tier, e) { const s = SPEC[tier]; return s.kind === "sata" ? sata(s, e) : m2(s, e); }

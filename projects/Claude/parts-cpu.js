import { THREE, bx, rb, cy, M, GOLD, BLACK, grp, flat, plate, rrect, smd, hex6 } from "./kit.js";
import { P } from "./ports.js";

/* CPU-Bauformen nach echten Vorbildern (alle Masse in mm):
 *  lga  = Intel LGA1700, Traeger 45 x 37.5, Heatspreader mit abgeschraegten Ecken, Kondensatoren an den Schmalseiten
 *  am4  = AMD AM4 PGA, Traeger 40 x 40 mit sichtbaren Pins UNTEN, runder Heatspreader
 *  am5  = AMD AM5 LGA, Traeger 40 x 40, "Oktopus"-Heatspreader mit 4 Aussparungen und Kondensatoren darin */
const SPEC = {
  1: { plat: "lga", ihs: 0x8f949b, rough: 0.5, tint: 0x0071c5 },
  2: { plat: "am4", ihs: 0x9b9fa6, rough: 0.46, tint: 0xe8532a },
  3: { plat: "lga", ihs: 0xb3b7be, rough: 0.34, tint: 0x0071c5 },
  4: { plat: "am4", ihs: 0xb5b9c0, rough: 0.32, tint: 0xe8532a },
  5: { plat: "lga", ihs: 0xbfc3c9, rough: 0.3, tint: 0x0071c5 },
  6: { plat: "am4", ihs: 0xc2c6cc, rough: 0.28, tint: 0xe8532a },
  7: { plat: "lga", ihs: 0xcdd0d6, rough: 0.24, tint: 0x0071c5, lines: true },
  8: { plat: "am5", ihs: 0xc9cdd3, rough: 0.26, tint: 0xe8532a },
  9: { plat: "lga", ihs: 0xd9dce1, rough: 0.2, tint: 0x0071c5, lines: true },
  10: { plat: "am5", ihs: 0xd9dce1, rough: 0.2, tint: 0xe8532a, lines: true, x3d: true },
};

/** Umriss mit abgeschraegten Ecken */
const chamfered = (w, d, c) => [[-w / 2 + c, -d / 2], [w / 2 - c, -d / 2], [w / 2, -d / 2 + c], [w / 2, d / 2 - c], [w / 2 - c, d / 2], [-w / 2 + c, d / 2], [-w / 2, d / 2 - c], [-w / 2, -d / 2 + c]];
/** AM5-Heatspreader: Quadrat S mit 4 mittigen Aussparungen (Breite nw, Tiefe nd) und kleinen Eckfasen */
function octo(S, nw, nd, ch) {
  const h = S / 2, a = nw / 2;
  return [
    [-h + ch, -h], [-a, -h], [-a, -h + nd], [a, -h + nd], [a, -h], [h - ch, -h], [h, -h + ch],
    [h, -a], [h - nd, -a], [h - nd, a], [h, a], [h, h - ch], [h - ch, h],
    [a, h], [a, h - nd], [-a, h - nd], [-a, h], [-h + ch, h], [-h, h - ch],
    [-h, a], [-h + nd, a], [-h + nd, -a], [-h, -a], [-h, -h + ch],
  ];
}

export default function cpu(tier, e) {
  const s = SPEC[tier], g = new THREE.Group();
  const [brand, ...rest] = e.game.toUpperCase().split(" "), model = rest.join(" ");
  const ihsM = M(s.ihs, { metalness: 0.95, roughness: s.rough });
  const sub = (col) => M(col, { metalness: 0.1, roughness: 0.72 });
  let top = 0, tw = 30;                                  // top = Oberkante Heatspreader, tw = Textbreite

  if (s.plat === "lga") {
    g.add(rb(45, 1.15, 37.5, sub(0x2c6b48), 0.4, 0, 0.575, 0));
    g.add(plate(chamfered(37.2, 33.6, 3.2), 3.2, ihsM, 0, 1.15, 0));
    g.add(plate([[-23.2, 17.6], [-19.4, 17.6], [-23.2, 13.8]], 0.12, GOLD(), 0, 1.15, 0));              // Pin-1-Dreieck
    [-1, 1].forEach((sx) => g.add(smd(2, 7, 1.7, 3.8, sx * 20.9, 1.15, 0)));                              // Kondensatoren links/rechts
    [-1, 1].forEach((sz) => g.add(smd(6, 1, 3.6, 1, 0, 1.15, sz * 18.4, M(0x6e6048, { metalness: 0.2 }), [1.3, 0.6, 0.8])));
    top = 4.35; tw = 28;
    if (s.lines) [-14.5, 14.5].forEach((z) => g.add(bx(30, 0.05, 0.25, M(0x9ea3ab, { metalness: 1, roughness: 0.15 }), 0, top + 0.02, z)));
  } else if (s.plat === "am4") {
    const pin = M(0xb89f62, { metalness: 0.95, roughness: 0.3 });
    for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {                                          // 15 x 15 Pins, Mitte und eine Ecke ausgespart
      if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue; if (i === -7 && j === 7) continue;
      g.add(cy(0.3, 2.0, pin, i * 2.54, 1.0, j * 2.54, 6));
    }
    g.add(rb(40, 1.4, 40, sub(0x35603f), 0.5, 0, 2.7, 0));
    g.add(plate(rrect(34.6, 34.6, 8), 2.7, ihsM, 0, 3.4, 0));
    g.add(plate([[-20, 20], [-16.2, 20], [-20, 16.2]], 0.12, GOLD(), 0, 3.4, 0));
    [-1, 1].forEach((sx) => g.add(smd(1, 4, 1, 2.8, sx * 18.8, 3.4, -2, M(0x6e6048, { metalness: 0.2 }), [1.3, 0.6, 0.8])));
    top = 6.1; tw = 26;
  } else {
    g.add(rb(40, 1.2, 40, sub(0x2c6b48), 0.4, 0, 0.6, 0));
    g.add(plate(octo(37, 14, 6.2, 2.2), 3.0, ihsM, 0, 1.2, 0));
    g.add(plate([[-20, 20], [-16.2, 20], [-20, 16.2]], 0.12, GOLD(), 0, 1.2, 0));
    [[0, -1], [0, 1]].forEach(([, sz]) => g.add(smd(4, 2, 2.4, 2.2, 0, 1.2, sz * 17.4)));                   // Kondensatoren in den Aussparungen (oben/unten)
    [[-1], [1]].forEach(([sx]) => g.add(smd(2, 4, 2.2, 2.4, sx * 17.4, 1.2, 0)));                           // ... links/rechts
    top = 4.2; tw = 24;
    if (s.lines) g.add(plate(octo(33, 14.8, 5, 2), 0.04, M(0x8f949c, { metalness: 1, roughness: 0.12 }), 0, top, 0));
  }

  // Gravur: Marke + Modell (Ingame-Name)
  g.add(flat(brand, tw * 0.62, 3.4, 0, top + 0.06, -(s.plat === "am4" ? 2.6 : 3.2), { color: hex6(s.tint), opacity: 0.95 }));
  g.add(flat(model || brand, tw, 3.8, 0, top + 0.06, s.plat === "am4" ? 2.4 : 2.2, { color: "#2b2f36", opacity: 0.95 }));
  if (s.x3d) g.add(flat("3D V-CACHE", 12, 2.2, 0, top + 0.06, 8, { color: "#2b2f36", opacity: 0.9 }));
  // Ports: socket = Unterseite des Traegers (bei AM4 liegen die Pins 2 mm darunter und stecken im Sockel), ihs = Auflage fuer den Kuehler
  const land = s.plat === "am4" ? 2.0 : 0;
  g.userData.ports = [
    P("socket", "guest", "cpu-socket", [0, land, 0], [0, -1, 0], [1, 0, 0], { socket: s.plat }),
    P("ihs", "host", "cooler-contact", [0, top, 0], [0, 1, 0], s.plat === "lga" ? [0, 0, -1] : [1, 0, 0], { socket: s.plat }),
  ];
  g.userData.dims = { L: 45, W: 40, H: top, socket: s.plat };
  return g;
}

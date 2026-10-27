import { P, I4, mul, point, inv } from "./ports.js";
import { THREE, bx, rb, cy, cyx, cyz, cone, M, G, grp, wall, flat, plate, rrect, ring, metal, BLACK, GOLD, frameFan, cable, hex6 } from "./kit.js";

/* Kuehler, aufrecht auf der Bodenplatte stehend. Tower: Lamellenpaket (Platten in x/y, gestapelt entlang z), U-foermige Heatpipes,
 * Luefter an der +x-Seite. Stock = Radial-Kuehlkoerper mit Luefter und 4 Push-Pins. AIO = Pumpenblock + 2 Schlaeuche + Radiator mit Luefter. */
const CU = () => M(0xb87333, { metalness: 0.95, roughness: 0.3 }), NI = () => M(0xcfd3d9, { metalness: 0.95, roughness: 0.28 });
const SPEC = {
  1: { kind: "stock" },
  2: { kind: "tower", W: 120, h: 152, d: 46, pipes: 4, fin: 0x2b2d32, cap: 0x1a1b1f, trim: 0x3fb7ff, fans: [{ s: 120, body: 0x17181b, blade: 0x24262b, hub: 0x1c1e22, acc: 0x3fb7ff }] },
  3: { kind: "tower", W: 120, h: 155, d: 46, pipes: 4, fin: 0x1b1c20, cap: 0x0e0f12, trim: 0xe8731a, fans: [{ s: 120, body: 0x15161a, blade: 0x202226, hub: 0x16171b, acc: 0xe8731a }], gloss: true },
  4: { kind: "tower", W: 125, h: 158, d: 45, pipes: 5, fin: 0xcfd3d9, cap: 0xb9bec6, trim: 0x6b4a2e, fans: [{ s: 120, body: 0xd5c3a1, blade: 0x5b3f26, hub: 0x4a3320, acc: 0x6b4a2e, blades: 7, tint: 0x8a6d46 }], nickel: true },
  5: { kind: "tower", W: 132, h: 160, d: 50, pipes: 6, fin: 0x17181b, cap: 0x0b0c0e, trim: 0xe8731a, fans: [{ s: 135, body: 0x131417, blade: 0x1f2125, hub: 0x14151a, acc: 0xe8731a, blades: 7 }], gloss: true, bigTop: true },
  6: { kind: "dual", W: 150, h: 165, d: 45, gap: 36, pipes: 6, fin: 0xcfd3d9, cap: 0xb9bec6, trim: 0x6b4a2e, fan: { s: 140, body: 0xd5c3a1, blade: 0x5b3f26, hub: 0x4a3320, acc: 0x6b4a2e, blades: 7, tint: 0x8a6d46 }, nickel: true },
  7: { kind: "aio", rad: 240, block: { r: 36, cap: 0x15161a, acc: 0x3fb7ff, style: "plain" }, fan: { body: 0x17181b, blade: 0x24262b, hub: 0x1c1e22, acc: 0x3fb7ff } },
  8: { kind: "aio", rad: 240, block: { r: 37, cap: 0x101114, acc: 0xff2fd0, style: "mirror" }, fan: { body: 0x15161a, blade: 0x24262b, hub: 0x1c1e22, acc: 0xff2fd0, rgb: true } },
  9: { kind: "aio", rad: 360, block: { r: 38, cap: 0x0f1013, acc: 0x20f0ff, style: "mirror" }, fan: { body: 0x131417, blade: 0x24262b, hub: 0x1c1e22, acc: 0x20f0ff, rgb: true } },
  10: { kind: "aio", rad: 360, block: { r: 39, cap: 0x0b0c0f, acc: 0x20f0ff, style: "lcd" }, fan: { body: 0x111216, blade: 0x24262b, hub: 0x1c1e22, acc: 0xff2fd0, rgb: true } },
};
const PX = (w) => w; // Platzhalter

function fanX(o, x0, y, z = 0) {       // Rahmenluefter mit Achse entlang +x, Rahmen beginnt bei x0
  const f = frameFan(o.s, 25, { body: o.body, blade: o.blade, hub: o.hub, accent: o.acc, blades: o.blades ?? 9, tint: o.tint, rgb: o.rgb, speed: 7 });
  f.rotation.z = -Math.PI / 2; f.position.set(x0, y, z); return f;
}

function finStack(g, s, x, W, d, h, y0 = 16) {
  const fm = M(s.fin, { metalness: s.nickel ? 0.95 : 0.7, roughness: s.nickel ? 0.28 : 0.42 }), n = Math.round(W / 2.6);
  for (let i = 0; i < n; i++) g.add(bx(d, h - y0 - 3, 0.55, fm, x, y0 + (h - y0 - 3) / 2, -W / 2 + 1 + i * ((W - 2) / (n - 1))));
  g.add(rb(d + 1, 2.4, W + 1, M(s.cap, { metalness: s.gloss ? 0.8 : 0.85, roughness: s.gloss ? 0.18 : 0.3 }), 1, x, h - 1.2, 0));
  g.add(bx(d - 6, 0.25, 2, G(s.trim, 0.7), x, h + 0.05, -W / 2 + 6));
}
function pipes(g, s, x, n, W, h) {
  const pm = NI(), xs = Array.from({ length: n }, (_, i) => x - ((n - 1) / 2) * 7 + i * 7);
  xs.forEach((px, i) => {
    const zl = 24 + (i % 2) * 22 + (i > 3 ? 6 : 0);
    g.add(cyz(3, zl * 2 + 6, pm, px, 11, 0, 14));
    [-1, 1].forEach((sd) => { g.add(cy(3, h - 11, pm, px, 11 + (h - 11) / 2, sd * zl, 14)); g.add(cy(3.2, 2.6, pm, px, h + 1.2, sd * zl, 14)); });
  });
}

function tower(g, s, e) {
  g.add(rb(40, 6, 52, NI(), 1.5, 0, 3, 0));                                   // Bodenplatte (Nickel, Heatpipe-Direktkontakt)
  g.add(bx(60, 4, 62, M(0x2a2c31, { metalness: 0.7 }), 0, 8, 0));             // Montagebruecke
  g.add(cyz(2.2, 74, metal(0xb9bec6), 0, 11.5, 0));
  pipes(g, s, 0, s.pipes, s.W, s.h);
  finStack(g, s, 0, s.W, s.d, s.h);
  const f = s.fans[0], fy = Math.max(f.s / 2 + 16, 76);
  g.add(fanX(f, s.d / 2 + 0.5, fy));
  [-1, 1].forEach((sd) => g.add(bx(1.2, 0.9, f.s * 0.9, metal(0xb9bec6), s.d / 2 + 0.6 + 12, fy + sd * (f.s / 2 - 3), 0)));   // Luefterklammern
  g.add(wall(e.game.toUpperCase(), s.d * 0.9, 6, 0, s.h + 0.3, 0, "+x", { color: "#e8eaee", opacity: 0.0 }));
  g.add(flat(e.game.toUpperCase(), s.W * 0.55, 7, 0, s.h + 0.4, 0, { color: s.nickel ? "#2b2f36" : hex6(s.trim), opacity: 0.95, rot: Math.PI / 2 }));
  g.userData.dims = { L: s.d + 30, W: s.W, H: s.h };
}

function dual(g, s, e) {
  const x1 = -(s.gap / 2 + s.d / 2), x2 = s.gap / 2 + s.d / 2;
  g.add(rb(42, 6, 54, NI(), 1.5, 0, 3, 0));
  g.add(bx(110, 4, 64, M(0x2a2c31, { metalness: 0.7 }), 0, 8, 0));
  pipes(g, s, x1, 3, s.W, s.h); pipes(g, s, x2, 3, s.W, s.h);
  finStack(g, s, x1, s.W, s.d, s.h); finStack(g, s, x2, s.W, s.d, s.h, 38);   // vorderer Turm liegt hoeher (Platz ueber den RAM-Riegeln)
  const f = s.fan, fy = f.s / 2 + 38;
  g.add(fanX(f, -s.gap / 2 + 0.5 - 25 + 25, fy));                                 // Luefter zwischen den Tuermen
  g.add(fanX(f, x2 + s.d / 2 + 0.5, fy));                                         // Frontluefter
  g.add(flat(e.game.toUpperCase(), s.W * 0.5, 7, x2, s.h + 0.4, 0, { color: "#2b2f36", opacity: 0.95, rot: Math.PI / 2 }));
  g.userData.dims = { L: x2 + s.d / 2 + 30 - x1 + s.d / 2, W: s.W, H: s.h };
}

function stock(g, e) {
  const al = M(0xb9bec6, { metalness: 0.85, roughness: 0.4 }), pl = M(0x1b1c20, { metalness: 0.1, roughness: 0.6 });
  g.add(cy(14, 40, CU(), 0, 20, 0, 32));
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, b = bx(28, 34, 0.9, al, Math.cos(a) * 28, 22, Math.sin(a) * 28); b.rotation.y = -a; g.add(b); }
  g.add(cone(46, 46, 3, al, 0, 8, 0, 48));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { g.add(cy(3.4, 12, M(0xe9ebee, { metalness: 0.1, roughness: 0.6 }), a * 38, 14, b * 38, 14), cy(4.2, 5, pl, a * 38, 21, b * 38, 14)); });
  g.add(plate(rrect(94, 94, 8), 6, pl, 0, 38, 0, [{ x: 0, z: 0, r: 43 }]));
  const f = frameFan(92, 20, { body: 0x1b1c20, accent: 0x9aa0a8, blades: 9, speed: 7 }); f.position.y = 33; g.add(f);
  g.add(flat(e.game.toUpperCase(), 40, 4, 0, 44.4, 36, { color: "#c9ced6", opacity: 0.8 }));
  g.userData.dims = { L: 94, W: 94, H: 58 };
}

/** AIO: zwei eigenstaendige Teile (members): Pumpenblock (sitzt auf der CPU) und Radiator (sitzt am Gehaeuse, Luefter zur Gehaeusewand).
 *  Die Schlaeuche haengen am Block und werden von connect() nach dem Einbau auf die echten Anschluesse des Radiators neu gelegt. */
const RADH = 56.5;                                   // Radiator + Luefter: Hoehe bis zur Luefteroberkante = Auflageflaeche am Gehaeuse
function aioBlock(s, e) {
  const g = new THREE.Group(), b = s.block;
  g.add(bx(64, 5, 64, CU(), 0, 2.5, 0));
  g.add(cy(b.r, 38, M(0x131417, { metalness: 0.5, roughness: 0.45 }), 0, 24, 0, 56));
  g.add(cy(b.r - 4, 5, M(b.cap, { metalness: 0.6, roughness: 0.3 }), 0, 45.5, 0, 56));
  g.add(ring(b.r - 3, 1.1, G(b.acc, 1.0), 0, 48.4, 0, 64));
  if (b.style === "mirror") { g.add(cy(b.r - 9, 0.6, M(0x1a1c22, { metalness: 1, roughness: 0.05 }), 0, 48.2, 0, 56)); g.add(ring(b.r - 14, 0.8, G(b.acc, 1.4), 0, 48.8, 0, 64)); g.add(ring(b.r - 20, 0.6, G(b.acc, 1.4), 0, 48.8, 0, 64)); }
  if (b.style === "lcd") { g.add(cy(b.r - 8, 0.7, M(0x06101c, { metalness: 0.4, roughness: 0.1 }), 0, 48.3, 0, 56)); g.add(cy(b.r - 14, 0.2, G(0x0b6bd1, 0.9), 0, 48.8, 0, 56)); g.add(flat(e.game.toUpperCase(), 40, 6, 0, 49.1, 0, { color: "#e8fbff", opacity: 1 })); }
  else g.add(flat(e.game.toUpperCase(), 44, 5, 0, 48.7, 0, { color: "#e8eaee", opacity: 0.9 }));
  g.userData.tubeGroup = new THREE.Group(); g.userData.tubeGroup.userData.flex = true; g.add(g.userData.tubeGroup);
  return g;
}
/** Radiator liegt lokal: Mitte = Mitte der Luefter, Laenge entlang z, Anschluesse am -z-Ende, Luefter oben (y = 30.5..55.5). */
function aioRad(s, e) {
  const g = new THREE.Group(), rl = s.rad === 360 ? 397 : 274, nf = s.rad === 360 ? 3 : 2;
  g.add(rb(120, 27, rl - 30, M(0x2b2d33, { metalness: 0.75, roughness: 0.45 }), 2, 0, 17, 0));
  for (let i = 0; i < 38; i++) g.add(bx(110, 0.5, 1.1, M(0x3d4048, { metalness: 0.8, roughness: 0.35 }), 0, 30.6, -(rl - 100) / 2 + i * ((rl - 100) / 37)));
  [-1, 1].forEach((sd) => g.add(rb(120, 27, 24, M(0x18191d, { metalness: 0.4, roughness: 0.5 }), 3, 0, 17, sd * (rl / 2 - 12))));
  RAD_FIT.forEach(([dx]) => g.add(cy(7, 9, metal(0x9aa0aa), dx, 35, -(rl / 2 - 12), 20)));
  const f = s.fan;
  for (let i = 0; i < nf; i++) { const ff = frameFan(120, 25, { ...f, accent: f.acc, rgb: f.rgb, speed: 7 }); ff.position.set(0, 30.5, (i - (nf - 1) / 2) * 120); g.add(ff); }
  g.add(wall(e.game.toUpperCase(), 100, 6, 0, 14, -(rl / 2) + 70, "+x", { color: "#c9ced6", opacity: 0.7 }));
  g.userData.fit = RAD_FIT.map(([dx]) => [dx, 40, -(rl / 2 - 12)]);   // Schlauchanschluesse (lokal, mm)
  g.userData.dims = { L: 120, W: rl, H: RADH, rad: s.rad };
  return g;
}
const RAD_FIT = [[-22], [22]];

/** Schlaeuche neu legen: Block- und Radiatormatrix (Zeilen-major 4x4 in mm, gleiche Welt) -> Rohre im Block-Raum */
export function connectAio(blockObj, blockWorld, radObj, radWorld, mulFn, pointFn, invFn) {
  const tg = blockObj.userData.tubeGroup; while (tg.children.length) tg.remove(tg.children[0]);
  const toBlock = mulFn(invFn(blockWorld), radWorld), b = blockObj.userData.block;
  radObj.userData.fit.forEach((fp, i) => {
    const q = pointFn(toBlock, fp), side = i ? 1 : -1, d = Math.hypot(q[0], q[2]) || 1, ux = q[0] / d, uz = q[2] / d;
    const s0 = [ux * (b.r - 2) - uz * side * 9, 30, uz * (b.r - 2) + ux * side * 9];
    const out = [s0[0] + ux * 24, 44 + i * 6, s0[2] + uz * 24];
    const lift = [q[0] - ux * 10, Math.max(q[1] + 30, 70) + i * 4, q[2] - uz * 10];
    tg.add(cable([s0, out, [(out[0] + lift[0]) / 2, Math.max(out[1], lift[1]) + 6, (out[2] + lift[2]) / 2], lift, [q[0], q[1] + 8, q[2]], [q[0], q[1], q[2]]], 0x0e0f11, 6.5));
  });
}

function aio(g, s, e) {
  const blk = aioBlock(s, e), rad = aioRad(s, e), rl = rad.userData.dims.W;
  blk.userData.block = s.block;
  rad.position.set(188, 0, 0);                                              // nominale Lage nur fuer die Katalog-Ansicht
  g.add(blk, rad);
  g.userData.nominalConnect = true;
  g.userData.members = [
    { id: "block", obj: blk, ports: [P("base", "guest", "cooler-contact", [0, 0, 0], [0, -1, 0], [1, 0, 0], { sockets: ["lga", "am4", "am5"], aio: true })] },
    { id: "rad", obj: rad, ports: [P("rad", "guest", "rad", [0, RADH, 0], [0, 1, 0], [0, 0, 1], { size: s.rad, thick: RADH, width: 120, length: rl })] },
  ];
  g.userData.connect = (bw, rw) => connectAio(blk, bw, rad, rw, mul, point, inv);
  connectAio(blk, I4(), rad, [1, 0, 0, 188, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], mul, point, inv);   // Katalog-Ansicht: Schlaeuche in nominaler Lage
  g.userData.dims = { L: 188 + 60 + 36, W: rl + 46, H: 56, kind: "aio", rad: s.rad };
}

export default function cooler(tier, e) {
  const s = SPEC[tier], g = new THREE.Group();
  if (s.kind === "stock") stock(g, e); else if (s.kind === "tower") tower(g, s, e); else if (s.kind === "dual") dual(g, s, e); else aio(g, s, e);
  const d = g.userData.dims || {};
  if (s.kind !== "aio") {
    // Sockel-Anpassung: Tower/Stock haengen mit der Bodenplatte an der CPU (Mitte = Mitte des IHS)
    g.userData.ports = [P("base", "guest", "cooler-contact", [0, 0, 0], [0, -1, 0], [1, 0, 0], { sockets: ["lga", "am4", "am5"] })];
    g.userData.dims = { ...d, kind: s.kind, height: s.h ?? 58 };
  } else g.userData.dims = { ...g.userData.dims, height: 56 };
  return g;
}

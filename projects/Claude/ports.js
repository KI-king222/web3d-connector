import * as THREE from "three";

/* ============================================================================================
 * PORTS: Jedes Teil beschreibt selbst, wo es angebaut wird (guest) bzw. wo andere Teile angebaut werden (host).
 * Ein Port ist ein Koordinatensystem im lokalen mm-Raum des Teils:
 *   pos  = Kontaktpunkt auf der Auflageflaeche
 *   up   = Flaechennormale, die aus dem Teil HERAUS zeigt (beim Gast: weg vom Teilkoerper, in den Host hinein)
 *   fwd  = Richtung "vorwaerts" in der Auflageflaeche (senkrecht zu up) - legt die Drehung um up fest
 * Montage: Gast-Port und Host-Port fallen zusammen, der Gast wird dabei an der Auflageflaeche "umgedreht"
 * (up_gast = -up_host, fwd_gast = fwd_host). Das gilt fuer JEDES Teil gleich, es gibt keine Sonderfaelle.
 * mirror:"y" = Teil ist im Generator spiegelverkehrt modelliert (GPU): wird beim Einbau an y gespiegelt.
 * ============================================================================================ */
export const P = (id, role, kind, pos, up, fwd, meta = {}, extra = {}) => ({ id, role, kind, pos, up, fwd, meta, ...extra });

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };

/* 4x4, Zeilen-major: [r0c0 r0c1 r0c2 r0c3, r1..., ...] */
export const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export const mul = (a, b) => { const o = new Array(16).fill(0); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c]; return o; };
export const point = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
export const dir = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[4] * v[0] + m[5] * v[1] + m[6] * v[2], m[8] * v[0] + m[9] * v[1] + m[10] * v[2]];
/** Inverse einer Matrix mit orthonormaler Linearteil-Matrix (Drehung, ggf. gespiegelt) + Verschiebung */
export function inv(m) {
  const o = [m[0], m[4], m[8], 0, m[1], m[5], m[9], 0, m[2], m[6], m[10], 0, 0, 0, 0, 1];
  const t = [-(o[0] * m[3] + o[1] * m[7] + o[2] * m[11]), -(o[4] * m[3] + o[5] * m[7] + o[6] * m[11]), -(o[8] * m[3] + o[9] * m[7] + o[10] * m[11])];
  o[3] = t[0]; o[7] = t[1]; o[11] = t[2]; return o;
}
const SY = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];            // Spiegelung an y
const FLIP = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1];         // 180 Grad um die fwd-Achse

/** Koordinatensystem eines Ports (Spalten: fwd, up, fwd x up, pos). mirror = Port-Vektoren vorher an y spiegeln. */
export function frame(p, mirror = false) {
  const f = (v) => (mirror ? [v[0], -v[1], v[2]] : v);
  const pos = f(p.pos), x = norm(f(p.fwd)), y = norm(f(p.up));
  if (Math.abs(dot(x, y)) > 1e-6) throw new Error(`Port ${p.id}: fwd und up stehen nicht senkrecht aufeinander`);
  const z = cross(x, y);
  return [x[0], y[0], z[0], pos[0], x[1], y[1], z[1], pos[1], x[2], y[2], z[2], pos[2], 0, 0, 0, 1];
}

/** Weltmatrix (mm) des Gast-Teils, wenn guestPort an hostPort (Teil steht mit Matrix hostWorld) montiert wird. */
export function mate(hostWorld, hostPort, guestPort) {
  const W = mul(mul(hostWorld, frame(hostPort)), FLIP);
  return guestPort.mirror === "y" ? mul(mul(W, inv(frame(guestPort, true))), SY) : mul(W, inv(frame(guestPort)));
}

/** Matrix als position/quaternion/scale auf ein Object3D schreiben (Spiegelung ueber scale.y = -1) */
export function place(obj, m) {
  const c0 = [m[0], m[4], m[8]], c1 = [m[1], m[5], m[9]], c2 = [m[2], m[6], m[10]];
  const det = dot(cross(c0, c1), c2), flip = det < 0;
  const r = new THREE.Matrix4().set(m[0], flip ? -m[1] : m[1], m[2], 0, m[4], flip ? -m[5] : m[5], m[6], 0, m[8], flip ? -m[9] : m[9], m[10], 0, 0, 0, 0, 1);
  obj.quaternion.setFromRotationMatrix(r);
  obj.position.set(m[3], m[7], m[11]);
  obj.scale.set(1, flip ? -1 : 1, 1);
  obj.updateMatrix && obj.updateMatrix();
  return obj;
}

export const portOf = (part, id) => { const p = (part.userData.ports || []).find((q) => q.id === id); if (!p) throw new Error(`Port "${id}" fehlt`); return p; };
export const portsOf = (part, role, kind) => (part.userData.ports || []).filter((p) => (!role || p.role === role) && (!kind || p.kind === kind));

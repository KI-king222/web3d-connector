import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* Temporary stub - full file is in Web3D projects hp-gpu-10/components.js and local artifacts.
 * Run Manual Deploy after uploading full templates/components.js from artifacts.
 */
export const THEMES = {
  stealth: { body: 0x1a1a1f, accent: 0x00e5ff, pcb: 0x12161a, metal: 0x9aa0aa },
  white:   { body: 0xf2f2f2, accent: 0xff4081, pcb: 0xdedede, metal: 0xd0d3d8 },
  rgb:     { body: 0x15151a, accent: 0xff00ff, pcb: 0x14141c, metal: 0x8a8f9a },
  retro:   { body: 0xd8d0b8, accent: 0x3f51b5, pcb: 0x1f5a2d, metal: 0xb8b8b0 },
};
export function buildPC(kind, variant, accent, options) {
  console.warn('Stub components.js - upload full file from artifacts');
  return new THREE.Group();
}
export function mbLayout() { return { L: 305, W: 244, socket: [0,0], ram: { x0: 0, z: 0, pitch: 8, n: 4 }, pcie: [0,0], m2: [0,0], atx24: [0,0], cpu8: [0,0] }; }
export function caseDims() { return { W: 230, H: 480, D: 460, trayX: -87, shroudY: -130 }; }
export const CASES = { mid: { W: 230, H: 480, D: 460 } };
export const bx = () => new THREE.Group();
export const rb = () => new THREE.Group();
export const cy = () => new THREE.Group();
export function cable() { return new THREE.Group(); }
export function fan() { return new THREE.Group(); }
export function label() { return new THREE.Group(); }
export function flatLabel() { return new THREE.Group(); }
export function bundle() { return new THREE.Group(); }

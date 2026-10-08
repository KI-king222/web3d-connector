import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* SEE artifacts/web3d-connector/templates/components.js - content pushed in follow-up if truncated */
export const THEMES = { stealth: { body: 0x1a1a1f, accent: 0x00e5ff, pcb: 0x12161a, metal: 0x9aa0aa } };
export function buildPC() { return new THREE.Group(); }

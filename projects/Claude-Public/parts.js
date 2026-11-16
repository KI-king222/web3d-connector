import { THREE } from "./kit.js";
import { byId } from "./catalog.js";
import cpu from "./parts-cpu.js"; import gpu from "./parts-gpu.js"; import ram from "./parts-ram.js"; import ssd from "./parts-ssd.js";
import psu from "./parts-psu.js"; import mobo from "./parts-mobo.js"; import cooler from "./parts-cooler.js"; import pcCase from "./parts-case.js";
const GEN = { cpu, gpu, ram, ssd, psu, mobo, cooler, case: pcCase };
/** Rohteil in mm (Ursprung/Achsen siehe Teile-Doku). userData: ports, members, dims, entry. Wird vom Zusammenbau (assemble.js) benutzt. */
export function buildPartRaw(id) {
  const e = byId(id), g = GEN[e.cat](e.tier, e);
  g.userData.entry = e; g.userData.id = id;
  return g;
}
/** Baut Teil `id` (z.B. "gpu-7") in Szenen-Einheiten (mm * 0.01) - einzelnes Teil, so wie es im Katalog gezeigt wird. */
export function buildPart(id) {
  const inner = buildPartRaw(id), g = new THREE.Group();
  g.add(inner); g.scale.setScalar(0.01); g.userData.entry = inner.userData.entry; g.userData.dims = inner.userData.dims; g.userData.ports = inner.userData.ports; g.userData.id = id;
  return g;
}

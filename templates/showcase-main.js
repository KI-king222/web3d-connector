import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildPC, THEMES } from "./components.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d10);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(4, 3, 6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.5, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(5, 8, 4); key.castShadow = true;
scene.add(key);
const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
fill.position.set(-4, 2, -3); scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 48),
  new THREE.MeshStandardMaterial({ color: 0x151820, metalness: 0.2, roughness: 0.85 })
);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const params = new URLSearchParams(location.search);
let theme = params.get("theme") || "stealth";
const view = params.get("view") || "iso";

const views = {
  front: { pos: [0, 1.2, 6], target: [0, 0.8, 0] },
  side:  { pos: [6, 1.2, 0], target: [0, 0.8, 0] },
  top:   { pos: [0, 8, 0.01], target: [0, 0, 0] },
  iso:   { pos: [4, 3, 6], target: [0, 0.5, 0] },
};
if (views[view]) {
  camera.position.set(...views[view].pos);
  controls.target.set(...views[view].target);
}

const root = new THREE.Group(); scene.add(root);

async function loadEntities() {
  while (root.children.length) root.remove(root.children[0]);
  let list = [];
  try { list = await (await fetch("entities.json")).json(); } catch {}
  if (!list.length) {
    list = [
      { type: "pc", kind: "case", variant: theme, position: [0, 0, 0] },
      { type: "pc", kind: "motherboard", variant: theme, position: [0, 0.05, 0] },
      { type: "pc", kind: "gpu", variant: theme, position: [0, 0.6, 0.3] },
      { type: "pc", kind: "cooler", variant: theme, position: [0, 1.2, -0.2], scale: [0.5, 0.5, 0.5] },
      { type: "pc", kind: "ram", variant: theme, position: [0.4, 0.4, -0.3] },
      { type: "pc", kind: "psu", variant: theme, position: [0, -1.6, -0.8] },
    ];
  }
  for (const e of list) {
    const mesh = e.type === "pc"
      ? buildPC(e.kind || "gpu", e.variant || theme, e.accent)
      : new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: e.color || "#888" }));
    mesh.position.set(...(e.position || [0, 0, 0]));
    if (e.scale) mesh.scale.set(...e.scale);
    if (e.rotationY) mesh.rotation.y = e.rotationY;
    mesh.traverse((c) => { if (c.isMesh) { c.castShadow = c.receiveShadow = true; } });
    root.add(mesh);
  }
}
await loadEntities();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  controls.update();
  root.traverse((o) => {
    if (o.userData && o.userData.spin) o.rotation.y += o.userData.spin * clock.getDelta();
  });
  renderer.render(scene, camera);
});

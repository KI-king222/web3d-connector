import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { THEMES, buildPC } from "./components.js";

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b12);
scene.fog = new THREE.Fog(0x0b0b12, 12, 40);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6, 4, 8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.35));
scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(6, 10, 6); key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0x6688ff, 40, 30); rim.position.set(-6, 3, -6);
scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0x1b1b24, roughness: 0.8 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -2.5; floor.receiveShadow = true;
scene.add(floor);

let list = [];
try { list = await (await fetch("entities.json")).json(); } catch (e) { console.warn("entities.json fehlt", e); }

const group = new THREE.Group(); scene.add(group);
const q = new URLSearchParams(location.search);
const shot = q.has("view");
let override = THEMES[q.get("theme")] ? q.get("theme") : null; // null = Variante je Objekt

function build() {
  group.clear();
  for (const e of list) {
    const m = e.type === "pc"
      ? buildPC(e.kind, override || e.variant, e.accent)
      : new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: e.color || "#999" }));
    m.position.set(...e.position);
    if (e.scale) m.scale.set(...e.scale);
    if (e.rotationY) m.rotation.y = e.rotationY;
    m.name = e.name || e.kind || e.type;
    group.add(m);
  }
}
build();

if (shot) {
  document.getElementById("hud").style.display = "none";
  controls.autoRotate = false;
  const bb = new THREE.Box3().setFromObject(group);
  const c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3()).length() || 5;
  const dirs = { front: [0, 0, 1], side: [1, 0, 0], top: [0, 1, 0.001], iso: [1, 0.7, 1] };
  camera.position.copy(c).addScaledVector(new THREE.Vector3(...(dirs[q.get("view")] || dirs.iso)).normalize(), size * 1.3);
  controls.target.copy(c); camera.lookAt(c); controls.update();
  window.__ready = true;
}

const bar = document.getElementById("themes");
for (const name of [null, ...Object.keys(THEMES)]) {
  const b = document.createElement("button");
  b.textContent = name || "Original";
  b.onclick = () => { override = name; build(); };
  bar.appendChild(b);
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  group.traverse((o) => { if (o.userData.spin) o.rotation.y += o.userData.spin * dt; });
  controls.update();
  renderer.render(scene, camera);
});

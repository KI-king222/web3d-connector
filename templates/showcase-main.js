import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildPC, THEMES } from "./components.js";

const q = new URLSearchParams(location.search);
const shot = q.has("view"); // Screenshot-Modus: leichter (kein AA, keine Schatten)

const renderer = new THREE.WebGLRenderer({ antialias: !shot });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(shot ? 1 : Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = !shot;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; // Spiegelungen auf Metall/Glas
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 300);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = !shot; controls.autoRotateSpeed = 1.2; controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(8, 14, 8); key.castShadow = !shot;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
scene.add(key);
const rim = new THREE.PointLight(0x6688ff, 40, 40); rim.position.set(-8, 4, -8);
scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x1b1b24, roughness: 0.85, metalness: 0.1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
scene.add(floor);

let list = [];
try { list = await (await fetch("entities.json")).json(); } catch (e) { console.warn("entities.json fehlt", e); }

const group = new THREE.Group(); scene.add(group);
let override = THEMES[q.get("theme")] ? q.get("theme") : null; // null = Variante je Objekt

function build() {
  group.clear();
  for (const e of list) {
    const m = e.type === "pc"
      ? buildPC(e.kind, override || e.variant, e.accent, e.options)
      : new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: e.color || "#999" }));
    m.position.set(...e.position);
    if (e.scale) m.scale.set(...e.scale);
    if (e.rotationY) m.rotation.y = e.rotationY;
    m.name = e.name || e.kind || e.type;
    group.add(m);
  }
  floor.position.y = new THREE.Box3().setFromObject(group).min.y - 0.02;
}

function frame(view) {
  const bb = new THREE.Box3().setFromObject(group);
  const c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3()).length() || 5;
  const dirs = { front: [0, 0, 1], side: [1, 0, 0], top: [0, 1, 0.001], iso: [1, 0.7, 1] };
  camera.position.copy(c).addScaledVector(new THREE.Vector3(...(dirs[view] || dirs.iso)).normalize(), size * 1.25);
  controls.target.copy(c); camera.lookAt(c); controls.update();
}

build();
frame(q.get("view") || "iso");
if (shot) { document.getElementById("hud").style.display = "none"; window.__ready = true; }

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

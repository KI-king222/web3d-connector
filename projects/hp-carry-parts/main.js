import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.getElementById("title").textContent = "1 · Teile tragen";
document.getElementById("desc").textContent = "GPU in der Hand – vom Regal zum Bautisch. Kein Menü, echter Transport.";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2740);
scene.fog = new THREE.Fog(0x1a2740, 8, 22);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.05, 80);
camera.position.set(0.4, 1.55, 2.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, -0.5);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;

scene.add(new THREE.HemisphereLight(0xb0c4de, 0x1a1a22, 0.7));
const key = new THREE.DirectionalLight(0xfff0d6, 1.2);
key.position.set(3, 6, 4); key.castShadow = true;
scene.add(key);
scene.add(new THREE.PointLight(0xffc977, 0.6, 12).translateX(-2).translateY(2.5).translateZ(-1));

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.15, ...o });
const box = (w, h, d, m, x, y, z) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; scene.add(o); return o;
};

box(10, 0.08, 8, mat(0xc4b5a0), 0, 0, -1);
box(10, 3.2, 0.12, mat(0x2a4a7a), 0, 1.6, -4.2);
box(0.12, 3.2, 8, mat(0x2a4a7a), -4.5, 1.6, -1);
box(0.12, 3.2, 8, mat(0x2a4a7a), 4.5, 1.6, -1);

const wood = mat(0x4a3526);
for (let i = 0; i < 4; i++) box(1.6, 0.06, 0.5, wood, -3.2, 0.5 + i * 0.55, -2.8);
box(0.08, 2.2, 0.5, wood, -4.0, 1.2, -2.8);
box(0.08, 2.2, 0.5, wood, -2.4, 1.2, -2.8);
const pkg = mat(0x1a1a1a, { metalness: 0.3 });
const accent = mat(0xf7931a);
[[-3.5,0.65],[-2.9,0.65],[-3.5,1.2],[-2.9,1.2],[-3.2,1.75]].forEach(([x,y]) => {
  box(0.35, 0.22, 0.28, pkg, x, y, -2.8);
  box(0.35, 0.04, 0.28, accent, x, y + 0.11, -2.8);
});

box(2.4, 0.08, 0.9, mat(0x6e5740), 1.2, 0.95, -1.5);
[[0.2,-1.85],[2.2,-1.85],[0.2,-1.15],[2.2,-1.15]].forEach(([x,z]) => box(0.08, 0.95, 0.08, wood, x, 0.47, z));
box(0.5, 0.35, 0.4, mat(0x202833), 1.8, 1.2, -1.5);

const gpu = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.28), mat(0x1a1a1a, { metalness: 0.6 }));
body.castShadow = true; gpu.add(body);
const fanL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), mat(0x333));
fanL.rotation.x = Math.PI / 2; fanL.position.set(-0.12, 0.08, 0); gpu.add(fanL);
const fanR = fanL.clone(); fanR.position.x = 0.12; gpu.add(fanR);
const edge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.02), mat(0xf7931a, { emissive: 0xf7931a, emissiveIntensity: 0.4 }));
edge.position.y = -0.06; gpu.add(edge);
gpu.position.set(0.15, 1.25, 0.9);
scene.add(gpu);

function label(text, x, y, z) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#12161c"; g.fillRect(0, 0, 512, 128);
  g.strokeStyle = "#f7931a"; g.lineWidth = 8; g.strokeRect(4, 4, 504, 120);
  g.fillStyle = "#f7931a"; g.font = "bold 48px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, 256, 64);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
  m.position.set(x, y, z); scene.add(m);
}
label("REGAL", -3.2, 2.55, -2.55);
label("BAUTISCH", 1.2, 1.55, -1.0);

let t0 = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dt = (t - t0) / 1000; t0 = t;
  gpu.position.y = 1.25 + Math.sin(t * 0.003) * 0.03;
  gpu.rotation.y = Math.sin(t * 0.0015) * 0.15;
  fanL.rotation.z += dt * 8; fanR.rotation.z += dt * 8;
  controls.update();
  renderer.render(scene, camera);
}
loop(0);
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

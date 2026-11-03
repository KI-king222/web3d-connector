import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.getElementById("title").textContent = "2 · Kunden-Warteschlange";
document.getElementById("desc").textContent = "Mehrere Kunden an der Theke – Geduld sinkt, Priorität wählen.";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121820);
scene.fog = new THREE.Fog(0x121820, 10, 28);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 80);
camera.position.set(0, 2.2, 5.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0); controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0x9fb4d8, 0x1a1a22, 0.75));
const key = new THREE.DirectionalLight(0xfff5e0, 1.1); key.position.set(4, 8, 5); key.castShadow = true; scene.add(key);

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.65, metalness: 0.1, ...o });
const box = (w, h, d, m, x, y, z, parent = scene) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o;
};

box(12, 0.08, 10, mat(0x2a3140), 0, 0, 0);
box(12, 3.4, 0.15, mat(0x1e2a3c), 0, 1.7, -4.5);
box(3.2, 1.0, 0.7, mat(0x1a1f28), 0, 0.55, 1.2);
box(3.2, 0.06, 0.75, mat(0x2c3646), 0, 1.08, 1.2);
box(0.4, 0.35, 0.05, mat(0x111), -1.0, 1.35, 1.5);

function textPlane(txt, w, h, bg, fg) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
  g.fillStyle = fg; g.font = "bold 56px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(txt, 256, 64);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
}
const sign = textPlane("HASHPOOL PC-SHOP", 3.2, 0.55, "#0a1830", "#f7931a");
sign.position.set(0, 2.9, -4.4); scene.add(sign);

function makePerson(skin, shirt, x, z, mood) {
  const g = new THREE.Group();
  box(0.45, 0.7, 0.28, mat(shirt), 0, 1.05, 0, g);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), mat(skin));
  head.position.set(0, 1.6, 0); head.castShadow = true; g.add(head);
  box(0.14, 0.55, 0.16, mat(0x222), -0.1, 0.35, 0, g);
  box(0.14, 0.55, 0.16, mat(0x222), 0.1, 0.35, 0, g);
  box(0.1, 0.5, 0.1, mat(shirt), -0.32, 1.05, 0, g);
  box(0.1, 0.5, 0.1, mat(shirt), 0.32, 1.05, 0, g);
  g.position.set(x, 0, z);
  const colors = { ok: "#78d505", wait: "#f7931a", angry: "#ff4455" };
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: colors[mood] || "#f7931a" }));
  bubble.position.set(0, 2.0, 0); g.add(bubble);
  g.userData.bubble = bubble; g.userData.mood = mood;
  scene.add(g); return g;
}

const customers = [
  makePerson(0xf1c27d, 0x2d6a4f, -1.4, 2.8, "ok"),
  makePerson(0xe0ac69, 0x1b263b, -0.45, 3.3, "wait"),
  makePerson(0xc68642, 0x6c584c, 0.5, 3.5, "wait"),
  makePerson(0xffdbac, 0x5a189a, 1.4, 3.0, "angry"),
];

const patience = [1, 0.7, 0.55, 0.25];
let t0 = 0;
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (t - t0) / 1000 || 0.016); t0 = t;
  customers.forEach((c, i) => {
    patience[i] = Math.max(0, patience[i] - dt * (0.02 + i * 0.008));
    const b = c.userData.bubble;
    const p = patience[i];
    b.material.color.set(p > 0.6 ? 0x78d505 : p > 0.3 ? 0xf7931a : 0xff4455);
    b.position.y = 2.0 + Math.sin(t * 0.004 + i) * 0.05;
    b.scale.setScalar(0.8 + (1 - p) * 0.5);
  });
  controls.update();
  renderer.render(scene, camera);
}
loop(0);
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

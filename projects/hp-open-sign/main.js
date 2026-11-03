import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.getElementById("title").textContent = "5 · Öffnungszeiten & Licht";
document.getElementById("desc").textContent = "Tippe den Button – Lichter und Schild wechseln.";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const btn = document.createElement("button");
btn.style.cssText = "position:fixed;bottom:48px;left:50%;transform:translateX(-50%);z-index:10;font:700 14px monospace;padding:12px 20px;border-radius:12px;border:2px solid #f7931a;background:#f7931a;color:#1a1206;cursor:pointer";
document.body.appendChild(btn);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 50);
camera.position.set(2.5, 1.8, 4.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.3, 0); controls.enableDamping = true;

const amb = new THREE.AmbientLight(0x445566, 0.35); scene.add(amb);
const ceil1 = new THREE.PointLight(0xfff0d0, 1.2, 8); ceil1.position.set(-1, 2.8, 0); scene.add(ceil1);
const ceil2 = new THREE.PointLight(0xfff0d0, 1.0, 8); ceil2.position.set(1.5, 2.8, -1); scene.add(ceil2);

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.1, ...o });
const box = (w, h, d, m, x, y, z) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z); scene.add(o); return o;
};

box(6, 0.08, 5, mat(0x6b5a4a), 0, 0, 0);
box(6, 3, 0.12, mat(0x3d2b1f), 0, 1.5, -2.4);
box(0.12, 3, 5, mat(0x3d2b1f), -3, 1.5, 0);
box(0.12, 3, 5, mat(0x3d2b1f), 3, 1.5, 0);
box(1.2, 2.2, 0.08, mat(0x2a2a2a), 0, 1.1, 2.4);
const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.9), new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.35 }));
doorGlass.position.set(0, 1.15, 2.45); scene.add(doorGlass);

function makeSign(open) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 160;
  const g = c.getContext("2d");
  g.fillStyle = open ? "#1a3a12" : "#3a1212"; g.fillRect(0, 0, 512, 160);
  g.strokeStyle = open ? "#78d505" : "#ff4455"; g.lineWidth = 12; g.strokeRect(8, 8, 496, 144);
  g.fillStyle = open ? "#78d505" : "#ff4455";
  g.font = "bold 64px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(open ? "GEÖFFNET" : "GESCHLOSSEN", 256, 80);
  return new THREE.CanvasTexture(c);
}
const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.35), new THREE.MeshBasicMaterial({ map: makeSign(true) }));
signMesh.position.set(0, 2.0, 2.5); scene.add(signMesh);
box(0.12, 0.2, 0.06, mat(0xeee), 1.2, 1.4, 2.35);

let open = true;
function apply() {
  btn.textContent = open ? "Schließen →" : "← Öffnen";
  signMesh.material.map = makeSign(open);
  signMesh.material.needsUpdate = true;
  scene.background = new THREE.Color(open ? 0x1a2030 : 0x080a10);
  amb.intensity = open ? 0.4 : 0.12;
  ceil1.intensity = open ? 1.2 : 0.15;
  ceil2.intensity = open ? 1.0 : 0.1;
}
apply();
btn.onclick = () => { open = !open; apply(); };

function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); }
loop();
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

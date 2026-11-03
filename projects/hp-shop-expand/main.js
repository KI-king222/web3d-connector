import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.getElementById("title").textContent = "4 · Laden-Ausbau";
document.getElementById("desc").textContent = "Button: Klein → Groß (2. Tisch, höhere Regale, Kellertür).";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const btn = document.createElement("button");
btn.textContent = "Ausbauen →";
btn.style.cssText = "position:fixed;bottom:48px;left:50%;transform:translateX(-50%);z-index:10;font:700 14px monospace;padding:12px 20px;border-radius:12px;border:2px solid #f7931a;background:#f7931a;color:#1a1206;cursor:pointer";
document.body.appendChild(btn);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152038);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 60);
camera.position.set(4, 4, 6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0); controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xb0c4de, 0x1a1a22, 0.7));
const key = new THREE.DirectionalLight(0xfff0d6, 1.1); key.position.set(5, 8, 4); key.castShadow = true; scene.add(key);

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.1, ...o });
const root = new THREE.Group(); scene.add(root);

function build(expanded) {
  while (root.children.length) root.remove(root.children[0]);
  const box = (w, h, d, m, x, y, z) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; root.add(o); return o;
  };
  const W = expanded ? 7 : 4.5, D = expanded ? 6 : 4;
  box(W, 0.08, D, mat(0x6b5a4a), 0, 0, 0);
  box(W, 2.8, 0.1, mat(0x2a4a7a), 0, 1.4, -D / 2);
  box(0.1, 2.8, D, mat(0x2a4a7a), -W / 2, 1.4, 0);
  box(0.1, 2.8, D, mat(0x2a4a7a), W / 2, 1.4, 0);
  box(1.6, 0.08, 0.7, mat(0x6e5740), -1.0, 0.9, 0.5);
  const levels = expanded ? 4 : 2;
  for (let i = 0; i < levels; i++) box(1.4, 0.05, 0.4, mat(0x3a2a1a), 1.4, 0.5 + i * 0.5, -D / 2 + 0.4);
  if (expanded) {
    box(1.6, 0.08, 0.7, mat(0x6e5740), 1.2, 0.9, 0.5);
    box(0.9, 1.8, 0.08, mat(0x1a1a1a), -W / 2 + 0.2, 0.95, -0.5);
    const c = document.createElement("canvas"); c.width = 256; c.height = 64;
    const g = c.getContext("2d"); g.fillStyle = "#f7931a"; g.font = "bold 28px sans-serif"; g.fillText("KELLER", 40, 40);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }));
    lbl.position.set(-W / 2 + 0.25, 1.9, -0.45); root.add(lbl);
  }
  const tag = document.createElement("canvas"); tag.width = 512; tag.height = 96;
  const tg = tag.getContext("2d");
  tg.fillStyle = "#12161c"; tg.fillRect(0, 0, 512, 96);
  tg.fillStyle = "#f7931a"; tg.font = "bold 40px monospace"; tg.textAlign = "center";
  tg.fillText(expanded ? "AUSGEBAUT" : "KLEINER LADEN", 256, 58);
  const tm = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tag) }));
  tm.position.set(0, 2.5, -D / 2 + 0.1); root.add(tm);
}

let expanded = false;
build(false);
btn.onclick = () => { expanded = !expanded; btn.textContent = expanded ? "← Zurück (klein)" : "Ausbauen →"; build(expanded); };

function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); }
loop();
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

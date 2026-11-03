import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.getElementById("title").textContent = "3 · Ladenruf / Sterne";
document.getElementById("desc").textContent = "Wandtafel mit Ruf, Zufriedenheit und Bewertungen.";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152038);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 40);
camera.position.set(0, 1.4, 3.2);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.3, 0); controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0x667788, 0.5));
const spot = new THREE.SpotLight(0xffe8c0, 2.5, 12, 0.5, 0.4);
spot.position.set(0, 3.5, 2); scene.add(spot);
scene.add(spot.target); spot.target.position.set(0, 1.3, -0.5);

const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 0.15), new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.85 }));
wall.position.set(0, 1.6, -0.8); scene.add(wall);

function boardTex() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 768;
  const g = c.getContext("2d");
  g.fillStyle = "#1a1208"; g.fillRect(0, 0, 1024, 768);
  g.strokeStyle = "#f7931a"; g.lineWidth = 10; g.strokeRect(12, 12, 1000, 744);
  g.fillStyle = "#f7931a"; g.font = "bold 64px sans-serif"; g.textAlign = "center";
  g.fillText("HASHPOOL · Ladenruf", 512, 90);
  g.font = "72px sans-serif";
  g.fillStyle = "#ffc107"; g.fillText("★★★★", 440, 180);
  g.fillStyle = "#444"; g.fillText("☆", 620, 180);
  g.fillStyle = "#e7e9ec"; g.font = "bold 36px monospace";
  g.fillText("Kundenzufriedenheit  72 %", 512, 250);
  g.font = "28px monospace"; g.textAlign = "left"; g.fillStyle = "#aeb6c2";
  const lines = [
    "PCGamer3000  ★★★★★  Top Beratung!",
    "TechFan87    ★★★★☆  Kompetent & fair",
    "AufbauKing   ★★★★★  Gerne wieder",
    "HardwareHero ★★★★☆  Guter Shop",
  ];
  lines.forEach((l, i) => g.fillText(l, 80, 340 + i * 70));
  g.fillStyle = "#f7931a"; g.font = "22px monospace"; g.textAlign = "center";
  g.fillText("Ruf steuert, welche Kunden kommen", 512, 700);
  return new THREE.CanvasTexture(c);
}
const board = new THREE.Mesh(
  new THREE.PlaneGeometry(2.8, 2.1),
  new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.4, metalness: 0.2 })
);
board.position.set(0, 1.45, -0.7); scene.add(board);

const frameMat = new THREE.MeshStandardMaterial({ color: 0xf7931a, metalness: 0.7, roughness: 0.3 });
[[2.85,0.08,0,1.45], [2.85,0.08,0,0.4], [0.08,2.15,-1.4,1.45], [0.08,2.15,1.4,1.45]].forEach(([w,h,x,y]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frameMat);
  m.position.set(x, y, -0.68); scene.add(m);
});

function loop() {
  requestAnimationFrame(loop);
  controls.update();
  renderer.render(scene, camera);
}
loop();
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

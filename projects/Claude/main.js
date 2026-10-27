import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CATALOG, CATS } from "./catalog.js";
import { buildPart } from "./parts.js";
import { buildSystem, compat } from "./assemble.js";

const q = new URLSearchParams(location.search);
const shot = q.has("view");
const renderer = new THREE.WebGLRenderer({ antialias: !shot });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(shot ? 1 : Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = !shot;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101018);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.05, 300);
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = q.get("rotate") === "1"; controls.autoRotateSpeed = 1.2; controls.enableDamping = true;
scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(8, 14, 8); key.castShadow = !shot;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
scene.add(key);
const rim = new THREE.PointLight(0x6688ff, 40, 40); rim.position.set(-8, 4, -8); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: 0x1b1b24, roughness: 0.85, metalness: 0.1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const group = new THREE.Group(); scene.add(group);
let cat = CATS[q.get("cat")] ? q.get("cat") : "gpu";
const GAP = 0.5, MAXW = 16;

function tag(e) {                                    // Schild: Ingame-Name gross, echtes Vorbild klein
  const c = document.createElement("canvas"); c.width = 512; c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = "rgba(10,12,18,.82)"; x.roundRect(0, 0, 512, 128, 18); x.fill();
  x.fillStyle = "#fff"; x.font = "bold 38px sans-serif"; x.textAlign = "center"; x.fillText(`${e.tier}  ${e.game}`, 256, 56);
  x.fillStyle = "#8fd4ff"; x.font = "28px sans-serif"; x.fillText(e.real, 256, 100);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  s.scale.set(2.4, 0.6, 1); s.renderOrder = 10; return s;
}

function build() {
  group.clear(); group.position.set(0, 0, 0);
  let x = 0, z = 0, rowD = 0, maxX = 0;
  for (const e of CATALOG.filter((p) => p.cat === cat)) {
    const m = buildPart(e.id); m.name = e.game;
    m.position.set(0, 0, 0); m.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3());
    const w = Math.max(sz.x, 2.4);
    if (x > 0 && x + w > MAXW) { z += rowD + 1.4; x = 0; rowD = 0; }
    m.position.set(x + w / 2 - (bb.min.x + bb.max.x) / 2, -bb.min.y, z - bb.min.z);
    const t = tag(e); t.position.set(x + w / 2, bb.max.y - bb.min.y + 0.45, z + sz.z / 2); group.add(t);
    x += w + GAP; rowD = Math.max(rowD, sz.z); maxX = Math.max(maxX, x - GAP);
    group.add(m);
  }
  group.position.set(-maxX / 2, 0, -(z + rowD) / 2);
  group.updateMatrixWorld(true);
  floor.position.y = -0.02;
}
function frame(view) {
  const bb = new THREE.Box3().setFromObject(group), c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3()).length() || 5;
  const dirs = { front: [0, 0.15, 1], side: [1, 0.15, 0], top: [0, 1, 0.001], iso: [0.6, 0.6, 1], case: [-1, 0.6, 1] };
  const d = dirs[view] || (cat === "case" ? dirs.case : dirs.iso);
  camera.position.copy(c).addScaledVector(new THREE.Vector3(...d).normalize(), size * 0.95);
  controls.target.copy(c); camera.lookAt(c); controls.update();
}
/* ---------- System-Modus: kompletten PC aus den Teile-Ports zusammenbauen ---------- */
const SYS_ROLES = [["case", "Gehaeuse"], ["mobo", "Mainboard"], ["cpu", "CPU"], ["cooler", "Kuehler"], ["ram", "RAM"], ["gpu", "GPU"], ["ssd", "SSD 1"], ["ssd2", "SSD 2"], ["psu", "Netzteil"]];
const sysSpec = { case: "case-4", mobo: "mobo-4", cpu: "cpu-8", cooler: "cooler-3", ram: "ram-6", gpu: "gpu-8", ssd: "ssd-4", ssd2: "ssd-3", psu: "psu-5" };
for (const [k, v] of q) if (k in sysSpec) sysSpec[k] = v;
const sysOpt = { shroud: true, hideCase: false };
function buildSys() {
  group.clear(); group.position.set(0, 0, 0);
  const spec = { ...sysSpec, ssd: [sysSpec.ssd, sysSpec.ssd2].filter((x) => x && x !== "-") };
  for (const k of Object.keys(spec)) if (spec[k] === "-") delete spec[k];
  const sys = buildSystem(spec, { shroud: sysOpt.shroud });
  if (sysOpt.hideCase && sys.byRole.case) sys.byRole.case.visible = false;
  group.add(sys.group); group.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(group); group.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
  group.updateMatrixWorld(true); floor.position.y = -0.02;
  const rules = compat(spec), all = [...rules.errors, ...sys.report.errors];
  const box = document.getElementById("sysmsg");
  box.innerHTML = all.length ? all.map((e) => `<div class="bad">${e.part}: ${e.msg}</div>`).join("") : '<div class="ok">Alles passt - jedes Teil sitzt auf seinem Port.</div>';
}
function sysPanel() {
  let p = document.getElementById("syspanel"); if (p) { p.remove(); }
  p = document.createElement("div"); p.id = "syspanel";
  for (const [role, label] of SYS_ROLES) {
    const cc = role === "ssd2" ? "ssd" : role, sel = document.createElement("select"); sel.title = label;
    if (role === "ssd2") sel.add(new Option("SSD 2: keine", "-"));
    for (const e of CATALOG.filter((x) => x.cat === cc)) sel.add(new Option(`${label}: ${e.tier} ${e.game}`, e.id));
    sel.value = sysSpec[role]; sel.onchange = () => { sysSpec[role] = sel.value; buildSys(); };
    p.appendChild(sel);
  }
  const mk = (txt, f) => { const l = document.createElement("label"); const c = document.createElement("input"); c.type = "checkbox"; c.onchange = () => { f(c.checked); buildSys(); }; l.append(c, " " + txt); p.appendChild(l); return c; };
  mk("Gehaeuse ausblenden", (v) => (sysOpt.hideCase = v)); mk("Netzteil-Abdeckung ausblenden", (v) => (sysOpt.shroud = !v));
  const m = document.createElement("div"); m.id = "sysmsg"; p.appendChild(m); document.body.appendChild(p);
}
let mode = "parts";
function setMode(m) { mode = m; document.getElementById("syspanel")?.remove(); if (m === "system") { sysPanel(); buildSys(); frame("case"); } else { build(); frame(); } document.querySelectorAll("#themes button[data-c]").forEach((b) => b.classList.toggle("on", m === "parts" && b.dataset.c === cat)); const sb = document.getElementById("sysbtn"); if (sb) sb.classList.toggle("on", m === "system"); }
function setCat(c) { cat = c; mode = "parts"; document.getElementById("syspanel")?.remove(); build(); frame(); document.querySelectorAll("#themes button[data-c]").forEach((b) => b.classList.toggle("on", b.dataset.c === c)); }

if (q.get("mode") === "system") { setMode("system"); } else { build(); frame(q.get("view") || undefined); }
if (shot) { document.getElementById("hud").style.display = "none"; window.__ready = true; }
const bar = document.getElementById("themes");
for (const c of Object.keys(CATS)) { const b = document.createElement("button"); b.textContent = CATS[c]; b.dataset.c = c; b.onclick = () => setCat(c); bar.appendChild(b); }
{ const b = document.createElement("button"); b.id = "sysbtn"; b.textContent = "PC bauen (System)"; b.onclick = () => setMode(mode === "system" ? "parts" : "system"); bar.appendChild(b); }
{ const b = document.createElement("button"); b.textContent = "Drehen an/aus"; b.onclick = () => (controls.autoRotate = !controls.autoRotate); bar.appendChild(b); }
document.querySelectorAll("#themes button[data-c]").forEach((b) => b.classList.toggle("on", b.dataset.c === cat));

addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  group.traverse((o) => { if (o.userData.spin) o.rotation.y += o.userData.spin * dt; });
  controls.update(); renderer.render(scene, camera);
});
window.__snap = () => { renderer.render(scene, camera); return renderer.domElement.toDataURL("image/jpeg", 0.85); };
window.__ctl = { cat: setCat, system: () => setMode("system"), rotate: () => (controls.autoRotate = !controls.autoRotate), view: (v) => frame(v) };

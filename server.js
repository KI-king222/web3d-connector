import express from "express";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import * as acorn from "acorn";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const ROOT = path.resolve("workspace");
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.MCP_TOKEN; // Pflicht: geheimes Token setzen

// Pfad-Sandbox: nur Dateien innerhalb von ./workspace
const safe = (p) => {
  const f = path.resolve(ROOT, p);
  if (!f.startsWith(ROOT + path.sep)) throw new Error("Pfad nicht erlaubt");
  return f;
};
const T = (f) => fs.readFile(new URL(`./templates/${f}`, import.meta.url), "utf8");
const ghApi = async (repo, url, method = "GET", body) => {
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN fehlt auf dem Server.");
  const r = await fetch(`https://api.github.com/repos/${repo}/${url}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "web3d-connector" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  return r.json();
};
let browser;
const getBrowser = async () =>
  (browser ||= await chromium.launch({ args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] }));
const ok = (text) => ({ content: [{ type: "text", text }] });

// ---------- Templates ----------
const HTML = (name) => `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<link rel="stylesheet" href="style.css">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
</head><body>
<div id="hud"><span id="themes"></span></div>
<script type="module" src="main.js"></script>
</body></html>`;

const CSS = `html,body{margin:0;height:100%;overflow:hidden;background:#111;font-family:system-ui,sans-serif}
canvas{display:block}
#hud{position:fixed;top:12px;left:12px;color:#fff;background:#0008;padding:6px 10px;border-radius:8px;font-size:14px;z-index:1}
#hud button{margin:2px;padding:6px 10px;border:0;border-radius:6px;background:#2a2a38;color:#fff;font-size:13px}
#hud button:active{background:#44445a}`;

const MAIN = `import * as THREE from "three";
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 6, 10);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(10, 20, 10); sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
scene.add(ground);

const player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff5722 }));
player.position.y = 0.5; player.castShadow = true;
scene.add(player);

// Objekte aus entities.json (per MCP-Tool add_entity befuellt)
const geos = { box: () => new THREE.BoxGeometry(1, 1, 1), sphere: () => new THREE.SphereGeometry(0.5, 32, 16), cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32), cone: () => new THREE.ConeGeometry(0.5, 1, 32) };
try {
  const list = await (await fetch("entities.json")).json();
  for (const e of list) {
    const m = new THREE.Mesh((geos[e.type] || geos.box)(), new THREE.MeshStandardMaterial({ color: e.color || "#999" }));
    m.position.set(...e.position); m.scale.set(...(e.scale || [1, 1, 1]));
    m.castShadow = m.receiveShadow = true; m.name = e.name || e.type;
    scene.add(m);
  }
} catch (err) { console.warn("entities.json fehlt", err); }

const keys = {};
addEventListener("keydown", (e) => (keys[e.code] = true));
addEventListener("keyup", (e) => (keys[e.code] = false));
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta(), v = 6 * dt;
  if (keys.KeyW || keys.ArrowUp) player.position.z -= v;
  if (keys.KeyS || keys.ArrowDown) player.position.z += v;
  if (keys.KeyA || keys.ArrowLeft) player.position.x -= v;
  if (keys.KeyD || keys.ArrowRight) player.position.x += v;
  camera.position.lerp(new THREE.Vector3(player.position.x, 6, player.position.z + 10), 0.08);
  camera.lookAt(player.position);
  renderer.render(scene, camera);
});
`;

// ---------- MCP-Server ----------
function buildServer() {
  const s = new McpServer({ name: "web3d-game-connector", version: "1.0.0" });

  s.tool("scaffold_game", "Legt ein neues Three.js-Webgame an (index.html, style.css, main.js, entities.json).",
    { project: z.string().regex(/^[\w-]+$/), title: z.string().optional(), template: z.enum(["showcase", "game"]).default("showcase") },
    async ({ project, title, template }) => {
      const d = safe(project);
      await fs.mkdir(d, { recursive: true });
      await Promise.all([
        fs.writeFile(path.join(d, "index.html"), HTML(title || project)),
        fs.writeFile(path.join(d, "style.css"), CSS),
        fs.writeFile(path.join(d, "main.js"), template === "game" ? MAIN : await T("showcase-main.js")),
        fs.writeFile(path.join(d, "components.js"), await T("components.js")),
        fs.writeFile(path.join(d, "entities.json"), "[]"),
      ]);
      return ok(`Projekt '${project}' erstellt. Vorschau: /preview/${project}/`);
    });

  s.tool("list_files", "Listet Dateien eines Projekts.", { project: z.string() },
    async ({ project }) => {
      const out = [];
      const walk = async (dir) => {
        for (const e of await fs.readdir(dir, { withFileTypes: true })) {
          const p = path.join(dir, e.name);
          e.isDirectory() ? await walk(p) : out.push(path.relative(ROOT, p));
        }
      };
      await walk(safe(project));
      return ok(out.join("\n"));
    });

  s.tool("read_file", "Liest eine Datei.", { path: z.string() },
    async ({ path: p }) => ok(await fs.readFile(safe(p), "utf8")));

  s.tool("write_file", "Schreibt/ueberschreibt eine Datei (JS wird vorher auf Syntaxfehler geprueft).",
    { path: z.string(), content: z.string() },
    async ({ path: p, content }) => {
      if (p.endsWith(".js")) {
        try { acorn.parse(content, { ecmaVersion: "latest", sourceType: "module" }); }
        catch (e) { return { isError: true, content: [{ type: "text", text: `Syntaxfehler: ${e.message}` }] }; }
      }
      await fs.mkdir(path.dirname(safe(p)), { recursive: true });
      await fs.writeFile(safe(p), content);
      return ok(`${p} gespeichert (${content.length} Zeichen).`);
    });

  s.tool("add_entity", "Fuegt ein 3D-Objekt zur Szene hinzu (ohne Code zu schreiben).",
    {
      project: z.string(),
      type: z.enum(["box", "sphere", "cylinder", "cone"]),
      position: z.tuple([z.number(), z.number(), z.number()]),
      scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
      color: z.string().optional(),
      name: z.string().optional(),
    },
    async ({ project, ...e }) => {
      const f = safe(`${project}/entities.json`);
      const list = JSON.parse(await fs.readFile(f, "utf8"));
      list.push(e);
      await fs.writeFile(f, JSON.stringify(list, null, 2));
      return ok(`Objekt hinzugefuegt (gesamt: ${list.length}).`);
    });

  s.tool("validate_project", "Prueft alle JS-Dateien eines Projekts auf Syntaxfehler.", { project: z.string() },
    async ({ project }) => {
      const files = (await fs.readdir(safe(project))).filter((f) => f.endsWith(".js"));
      const errs = [];
      for (const f of files) {
        try { acorn.parse(await fs.readFile(safe(`${project}/${f}`), "utf8"), { ecmaVersion: "latest", sourceType: "module", locations: true }); }
        catch (e) { errs.push(`${f}: ${e.message}`); }
      }
      return ok(errs.length ? errs.join("\n") : "Keine Syntaxfehler.");
    });

  s.tool("add_pc_component", "Fuegt eine PC-Komponente (3D) in die Szene ein. Variante = Design-Theme.",
    {
      project: z.string(),
      kind: z.enum(["system", "case", "motherboard", "cpu", "cooler", "aio", "ram", "gpu", "ssd_sata", "ssd_m2", "hdd", "psu", "fan"]),
      variant: z.enum(["stealth", "white", "rgb", "retro"]).default("stealth"),
      position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
      accent: z.string().optional().describe("Akzentfarbe als Hex, z.B. #ff8800"),
      rotationY: z.number().optional(),
      name: z.string().optional(),
      options: z.record(z.any()).optional().describe("Teile-spezifische Optionen, siehe Tool list_parts"),
    },
    async ({ project, ...e }) => {
      const f = safe(`${project}/entities.json`);
      const list = JSON.parse(await fs.readFile(f, "utf8"));
      list.push({ type: "pc", ...e });
      await fs.writeFile(f, JSON.stringify(list, null, 2));
      return ok(`${e.kind} (${e.variant}) hinzugefuegt. Gesamt: ${list.length}. Neue Bauteile/Designs: components.js per write_file erweitern.`);
    });

  s.tool("github_push", "Committet und pusht alle Dateien eines Projekts in EINEM Commit nach GitHub (Repo muss existieren und mind. einen Commit haben).",
    {
      project: z.string(),
      repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).describe("owner/name"),
      branch: z.string().default("main"),
      message: z.string().default("Update via Grok"),
      subdir: z.string().regex(/^[\w\-./]*$/).default("").describe("Zielordner im Repo, z.B. pc-designs. Leer = Repo-Wurzel (Vorsicht: ueberschreibt index.html/main.js)"),
      only: z.array(z.string()).optional().describe("Nur diese Dateien pushen, z.B. [\"components.js\",\"entities.json\"]"),
    },
    async ({ project, repo, branch, message, subdir, only }) => {
      if (subdir.includes("..")) return { isError: true, content: [{ type: "text", text: "subdir ungueltig" }] };
      const prefix = subdir ? subdir.replace(/^\/+|\/+$/g, "") + "/" : "";
      if (!process.env.GITHUB_TOKEN) return { isError: true, content: [{ type: "text", text: "GITHUB_TOKEN fehlt auf dem Server." }] };
      const gh = (u, m, b) => ghApi(repo, u, m, b);
      const root = safe(project), files = [];
      const walk = async (dir) => {
        for (const e of await fs.readdir(dir, { withFileTypes: true })) {
          const p = path.join(dir, e.name);
          if (e.isDirectory()) await walk(p);
          else files.push({ path: prefix + path.relative(root, p).split(path.sep).join("/"), mode: "100644", type: "blob", content: await fs.readFile(p, "utf8") });
        }
      };
      await walk(root);
      if (only) for (let i = files.length - 1; i >= 0; i--) if (!only.includes(files[i].path.slice(prefix.length))) files.splice(i, 1);
      if (!files.length) return { isError: true, content: [{ type: "text", text: "Keine Dateien zum Pushen gefunden." }] };
      try {
        const ref = await gh(`git/ref/heads/${branch}`);
        const parent = await gh(`git/commits/${ref.object.sha}`);
        const tree = await gh("git/trees", "POST", { base_tree: parent.tree.sha, tree: files });
        const commit = await gh("git/commits", "POST", { message, tree: tree.sha, parents: [ref.object.sha] });
        await gh(`git/refs/heads/${branch}`, "PATCH", { sha: commit.sha });
        return ok(`${files.length} Dateien gepusht: https://github.com/${repo}/commit/${commit.sha}`);
      } catch (e) {
        return { isError: true, content: [{ type: "text", text: String(e.message) }] };
      }
    });

  s.tool("screenshot", "Rendert die Vorschau headless (Chromium) und liefert Bilder zurueck, damit das Ergebnis visuell geprueft werden kann. Nur fuer das Showcase-Template.",
    {
      project: z.string().regex(/^[\w-]+$/),
      views: z.array(z.enum(["front", "side", "top", "iso"])).min(1).max(4).default(["iso"]),
      theme: z.enum(["stealth", "white", "rgb", "retro"]).optional().describe("Erzwingt ein Design fuer alle Objekte"),
      width: z.number().min(320).max(1280).default(800),
      height: z.number().min(240).max(960).default(600),
    },
    async ({ project, views, theme, width, height }) => {
      const page = await (await getBrowser()).newPage({ viewport: { width, height } });
      const logs = [], content = [];
      page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`));
      page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
      try {
        for (const view of views) {
          const url = `http://127.0.0.1:${PORT}/preview/${project}/?view=${view}${theme ? `&theme=${theme}` : ""}`;
          await page.goto(url, { waitUntil: "load", timeout: 60000 });
          await page.waitForFunction("window.__ready === true", null, { timeout: 45000 });
          await page.waitForTimeout(400);
          const buf = await page.screenshot({ type: "jpeg", quality: 80 });
          content.push({ type: "image", data: buf.toString("base64"), mimeType: "image/jpeg" });
          content.push({ type: "text", text: `Ansicht: ${view}${theme ? `, Theme: ${theme}` : ""}` });
        }
      } catch (e) {
        content.push({ type: "text", text: `Fehler: ${e.message}` });
      } finally {
        await page.close();
      }
      if (logs.length) content.push({ type: "text", text: `Browser-Log:\n${logs.slice(0, 20).join("\n")}` });
      return { content };
    });

  s.tool("github_pull", "Laedt ein Projekt aus GitHub in den Workspace (z.B. nach einem Server-Neustart, da der Workspace fluechtig sein kann).",
    { project: z.string().regex(/^[\w-]+$/), repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/), branch: z.string().default("main"), subdir: z.string().regex(/^[\w\-./]*$/).default("") },
    async ({ project, repo, branch, subdir }) => {
      const prefix = subdir ? subdir.replace(/^\/+|\/+$/g, "") + "/" : "";
      try {
        const t = await ghApi(repo, `git/trees/${branch}?recursive=1`);
        let n = 0;
        for (const f of t.tree.filter((x) => x.type === "blob" && x.size < 1_000_000 && x.path.startsWith(prefix))) {
          const b = await ghApi(repo, `git/blobs/${f.sha}`);
          const dest = safe(`${project}/${f.path.slice(prefix.length)}`);
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.writeFile(dest, Buffer.from(b.content, "base64"));
          n++;
        }
        return ok(`${n} Dateien nach ${project}/ geladen.`);
      } catch (e) {
        return { isError: true, content: [{ type: "text", text: String(e.message) }] };
      }
    });

  s.tool("list_parts", "Katalog aller PC-Bauteile mit Optionen, Massen und Konventionen. Vor dem Bauen lesen.", {},
    async () => ok(`KONVENTIONEN: intern mm, Szene 1 Einheit = 10 cm. Teil-Achsen: x=Laenge, y=hoch, z=Breite, Ursprung=Mitte der Unterseite (case: Mittelpunkt). Case-Frame: x=Breite(+x Glasseite), y=hoch, z=Tiefe(+z vorne).
KINDS (add_pc_component, kind + options):
- system: kompletter eingebauter PC. options: case(mini|mid|full), form(atx|matx|itx), ram(2|4), gpu(false | {preset|length,width,slots,fans}), cooler({preset|height,fins,fans})
- case: size(mini|mid|full) 200x380x380 | 230x480x460 | 250x560x520 mm
- motherboard: form(atx 305x244 | matx 244x244 | itx 170x170); mit CPU-Sockel, 4 RAM-Slots, PCIe, VRM, Chipsatz, 24-Pin
- cpu: 40x40 mm Traeger mit Heatspreader
- cooler (Luftkuehler): preset(lowprofile|tower|dual) oder height(mm), fins, fans(1|2)
- aio: radiator(120|240|360), Pumpenblock + Schlaeuche + Luefter
- ram: sticks(Anzahl), pitch(mm); Stick 133x31 mm
- gpu: preset(compact 240mm|standard 300mm|flagship 336mm) oder length,width,slots,fans
- ssd_sata 2.5" 100x69.85x7 | ssd_m2 80x22 (options.heatsink) | hdd 3.5" 147x101.6x26.1
- psu: form(atx 150x86x160 | sfx 125x63.5x100), fan(up|down)
- fan: size(120|140), blades
THEMES (variant): stealth, white, rgb, retro. accent = Hex-Farbe.
EINBAU-REGELN: Mainboard-Frame mit Rotation Matrix (x->z, y->x, z->y); GPU rotation.x=-PI/2; RAM rotation.y=PI/2; siehe system() in templates/components.js.
NEUE TEILE: Funktion in Objekt B (components.js) ergaenzen, Primitive bx/rb/cy/fan/cable nutzen, danach screenshot pruefen.`));

  s.tool("remove_entity", "Entfernt ein Objekt aus der Szene (Index ab 0, siehe entities.json).",
    { project: z.string().regex(/^[\w-]+$/), index: z.number().int().min(0) },
    async ({ project, index }) => {
      const f = safe(`${project}/entities.json`);
      const list = JSON.parse(await fs.readFile(f, "utf8"));
      if (index >= list.length) return { isError: true, content: [{ type: "text", text: `Index ${index} existiert nicht (Anzahl: ${list.length}).` }] };
      const [gone] = list.splice(index, 1);
      await fs.writeFile(f, JSON.stringify(list, null, 2));
      return ok(`Entfernt: ${gone.name || gone.kind || gone.type}. Uebrig: ${list.length}.`);
    });

  return s;
}

// ---------- HTTP ----------
await fs.mkdir(ROOT, { recursive: true });
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use("/preview", express.static(ROOT)); // Spiel im Browser oeffnen

const auth = (req, res, next) => (TOKEN && req.get("authorization") === `Bearer ${TOKEN}` ? next() : res.status(401).json({ error: "unauthorized" }));

// Bedienoberflaeche fuer iPhone/iPad
app.get("/", (_, res) => res.sendFile(fileURLToPath(new URL("./templates/ui.html", import.meta.url))));

// Tools auch ohne Grok nutzbar: ruft dieselben MCP-Tools intern auf
async function callTool(name, args) {
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const server = buildServer(), client = new Client({ name: "ui", version: "1.0.0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  try { return await client.callTool({ name, arguments: args }, undefined, { timeout: 180000 }); }
  finally { await client.close(); await server.close(); }
}
app.post("/api/tool", auth, async (req, res) => {
  try { res.json(await callTool(String(req.body.name), req.body.args || {})); }
  catch (e) { res.status(500).json({ error: String(e.message) }); }
});
app.get("/api/projects", auth, async (_, res) => {
  const dirs = (await fs.readdir(ROOT, { withFileTypes: true })).filter((d) => d.isDirectory());
  const projects = [];
  for (const d of dirs) {
    let parts = 0;
    try { parts = JSON.parse(await fs.readFile(path.join(ROOT, d.name, "entities.json"), "utf8")).length; } catch {}
    projects.push({ name: d.name, parts });
  }
  res.json({ projects });
});
app.get("/api/entities", auth, async (req, res) => {
  try { res.json({ entities: JSON.parse(await fs.readFile(safe(`${req.query.project}/entities.json`), "utf8")) }); }
  catch (e) { res.status(404).json({ error: "Projekt oder entities.json nicht gefunden" }); }
});
app.post("/mcp", async (req, res) => {
  if (!TOKEN || req.get("authorization") !== `Bearer ${TOKEN}`) return res.sendStatus(401);
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => console.log(`MCP: http://localhost:${PORT}/mcp | Vorschau: /preview/<projekt>/`));

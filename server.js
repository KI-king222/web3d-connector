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
const TOKEN = process.env.MCP_TOKEN;

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
sun.position.set(10, 20, 10); sun.castShadow = true; scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff5722 }));
player.position.y = 0.5; player.castShadow = true; scene.add(player);
const geos = { box: () => new THREE.BoxGeometry(1, 1, 1), sphere: () => new THREE.SphereGeometry(0.5, 32, 16), cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32), cone: () => new THREE.ConeGeometry(0.5, 1, 32) };
try {
  const list = await (await fetch("entities.json")).json();
  for (const e of list) {
    const m = new THREE.Mesh((geos[e.type] || geos.box)(), new THREE.MeshStandardMaterial({ color: e.color || "#999" }));
    m.position.set(...e.position); m.scale.set(...(e.scale || [1, 1, 1]));
    m.castShadow = m.receiveShadow = true; scene.add(m);
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

function buildServer() {
  const s = new McpServer({ name: "web3d-game-connector", version: "1.0.0" });
  s.tool("scaffold_game", "Legt ein neues Three.js-Webgame an.",
    { project: z.string().regex(/^[\\w-]+$/), title: z.string().optional(), template: z.enum(["showcase", "game"]).default("showcase") },
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
      return ok(out.join("\\n"));
    });
  s.tool("read_file", "Liest eine Datei.", { path: z.string() }, async ({ path: p }) => ok(await fs.readFile(safe(p), "utf8")));
  s.tool("write_file", "Schreibt eine Datei.", { path: z.string(), content: z.string() },
    async ({ path: p, content }) => {
      if (p.endsWith(".js")) {
        try { acorn.parse(content, { ecmaVersion: "latest", sourceType: "module" }); }
        catch (e) { return { isError: true, content: [{ type: "text", text: `Syntaxfehler: ${e.message}` }] }; }
      }
      await fs.mkdir(path.dirname(safe(p)), { recursive: true });
      await fs.writeFile(safe(p), content);
      return ok(`${p} gespeichert (${content.length} Zeichen).`);
    });
  s.tool("add_entity", "Primitive hinzufuegen.", {
    project: z.string(), type: z.enum(["box", "sphere", "cylinder", "cone"]),
    position: z.tuple([z.number(), z.number(), z.number()]),
    scale: z.tuple([z.number(), z.number(), z.number()]).optional(), color: z.string().optional(), name: z.string().optional(),
  }, async ({ project, ...e }) => {
    const f = safe(`${project}/entities.json`);
    const list = JSON.parse(await fs.readFile(f, "utf8")); list.push(e);
    await fs.writeFile(f, JSON.stringify(list, null, 2));
    return ok(`Objekt hinzugefuegt (gesamt: ${list.length}).`);
  });
  s.tool("validate_project", "JS-Syntax pruefen.", { project: z.string() }, async ({ project }) => {
    const files = (await fs.readdir(safe(project))).filter((f) => f.endsWith(".js"));
    const errs = [];
    for (const f of files) {
      try { acorn.parse(await fs.readFile(safe(`${project}/${f}`), "utf8"), { ecmaVersion: "latest", sourceType: "module", locations: true }); }
      catch (e) { errs.push(`${f}: ${e.message}`); }
    }
    return ok(errs.length ? errs.join("\\n") : "Keine Syntaxfehler.");
  });
  s.tool("add_pc_component", "PC-Komponente in entities.json.", {
    project: z.string(),
    kind: z.enum(["system", "case", "motherboard", "cpu", "cooler", "aio", "ram", "gpu", "ssd_sata", "ssd_m2", "hdd", "psu", "fan"]),
    variant: z.enum(["stealth", "white", "rgb", "retro"]).default("stealth"),
    position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
    accent: z.string().optional(), rotationY: z.number().optional(), name: z.string().optional(),
    options: z.record(z.any()).optional(),
  }, async ({ project, ...e }) => {
    const f = safe(`${project}/entities.json`);
    const list = JSON.parse(await fs.readFile(f, "utf8"));
    list.push({ type: "pc", ...e });
    await fs.writeFile(f, JSON.stringify(list, null, 2));
    return ok(`${e.kind} (${e.variant}) hinzugefuegt. Gesamt: ${list.length}.`);
  });
  s.tool("list_parts", "Katalog der PC-Bauteile.", {}, async () => ok("Siehe templates/components.js und README. Themes: stealth, white, rgb, retro."));
  s.tool("remove_entity", "Entity entfernen.", { project: z.string().regex(/^[\\w-]+$/), index: z.number().int().min(0) },
    async ({ project, index }) => {
      const f = safe(`${project}/entities.json`);
      const list = JSON.parse(await fs.readFile(f, "utf8"));
      if (index >= list.length) return { isError: true, content: [{ type: "text", text: `Index ${index} fehlt` }] };
      const [gone] = list.splice(index, 1);
      await fs.writeFile(f, JSON.stringify(list, null, 2));
      return ok(`Entfernt: ${gone.name || gone.kind || gone.type}.`);
    });
  s.tool("screenshot", "Headless Screenshot.", {
    project: z.string().regex(/^[\\w-]+$/),
    views: z.array(z.enum(["front", "side", "top", "iso"])).min(1).max(4).default(["iso"]),
    theme: z.enum(["stealth", "white", "rgb", "retro"]).optional(),
    width: z.number().min(320).max(1280).default(800),
    height: z.number().min(240).max(960).default(600),
  }, async ({ project, views, theme, width, height }) => {
    const page = await (await getBrowser()).newPage({ viewport: { width, height } });
    const logs = [], content = [];
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`));
    page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
    try {
      for (const view of views) {
        const url = `http://127.0.0.1:${PORT}/preview/${project}/?view=${view}${theme ? `&theme=${theme}` : ""}`;
        await page.goto(url, { waitUntil: "load", timeout: 60000 });
        try { await page.waitForFunction("window.__ready === true", null, { timeout: 45000 }); } catch {}
        await page.waitForTimeout(400);
        const buf = await page.screenshot({ type: "jpeg", quality: 80 });
        content.push({ type: "image", data: buf.toString("base64"), mimeType: "image/jpeg" });
        content.push({ type: "text", text: `Ansicht: ${view}` });
      }
    } catch (e) { content.push({ type: "text", text: `Fehler: ${e.message}` }); }
    finally { await page.close(); }
    if (logs.length) content.push({ type: "text", text: `Browser-Log:\\n${logs.slice(0, 20).join("\\n")}` });
    return { content };
  });
  return s;
}

await fs.mkdir(ROOT, { recursive: true });
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use("/preview", express.static(ROOT));

function tokenOk(req) {
  if (!TOKEN) return false;
  const h = req.get("authorization") || "";
  if (h === `Bearer ${TOKEN}`) return true;
  if (req.params && req.params.token === TOKEN) return true;
  const q = (req.query && req.query.token) || "";
  return q === TOKEN;
}
const auth = (req, res, next) => (tokenOk(req) ? next() : res.status(401).json({ error: "unauthorized" }));

app.get("/", (_, res) => res.sendFile(fileURLToPath(new URL("./templates/ui.html", import.meta.url))));

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

async function mcp(req, res) {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
app.post("/mcp", (req, res) => (tokenOk(req) ? mcp(req, res) : res.sendStatus(401)));
app.post("/mcp/:token", (req, res) => (tokenOk(req) ? mcp(req, res) : res.sendStatus(401)));
app.get(["/mcp", "/mcp/:token"], (_, res) => res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null }));

app.listen(PORT, () => console.log(`MCP: http://localhost:${PORT}/mcp | Vorschau: /preview/<projekt>/`));

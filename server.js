import express from "express";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { chromium } from "playwright";
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
const templates = {
  showcase: async (name) => {
    const dir = safe(name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "components.js"), await T("components.js"));
    await fs.writeFile(path.join(dir, "main.js"), await T("showcase-main.js"));
    await fs.writeFile(
      path.join(dir, "index.html"),
      `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${name}</title>
<style>html,body{margin:0;height:100%;background:#0b0b12;color:#eee;font-family:system-ui,sans-serif}#c{width:100%;height:100%;display:block}#hud{position:fixed;left:12px;top:12px;z-index:2;display:flex;gap:8px;flex-wrap:wrap}button{background:#1e1e2a;color:#eee;border:1px solid #333;border-radius:8px;padding:8px 12px;cursor:pointer}button:hover{background:#2a2a3a}</style></head>
<body><div id="hud"><div id="themes"></div></div><canvas id="c"></canvas>
<script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="./main.js"></script></body></html>`
    );
    await fs.writeFile(path.join(dir, "entities.json"), "[]\n");
    return dir;
  },
  game: async (name) => {
    const dir = safe(name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "index.html"),
      `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${name}</title>
<style>html,body{margin:0;height:100%;background:#111;color:#eee}#c{width:100%;height:100%;display:block}</style></head>
<body><canvas id="c"></canvas>
<script type="importmap">{"imports":{"three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="./main.js"></script></body></html>`
    );
    await fs.writeFile(
      path.join(dir, "main.js"),
      `import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 100);
camera.position.set(3, 2, 5);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("c"), antialias: true });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(devicePixelRatio);
const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const d = new THREE.DirectionalLight(0xffffff, 1.2); d.position.set(5, 8, 5); scene.add(d);
scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0x4488ff })));
addEventListener("resize", () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
`
    );
    return dir;
  },
};

// ---------- MCP Server ----------
const createMcp = () => {
  const s = new McpServer({ name: "web3d-game-connector", version: "1.0.0" });

  s.tool("scaffold_game", "Neues 3D-Projekt anlegen", {
    name: z.string().describe("Projektname (Ordner)"),
    template: z.enum(["showcase", "game"]).default("showcase").describe("showcase = PC-Bauteile, game = leere Szene"),
  }, async ({ name, template }) => {
    await templates[template](name);
    return ok(`Projekt '${name}' mit Template '${template}' angelegt.`);
  });

  s.tool("add_pc_component", "PC-Komponente in entities.json einfügen", {
    project: z.string(),
    kind: z.enum(["gpu", "cooler", "ram", "motherboard", "psu", "case", "fan"]),
    variant: z.enum(["stealth", "white", "rgb", "retro"]).default("stealth"),
    position: z.array(z.number()).length(3).default([0, 0, 0]),
    scale: z.array(z.number()).length(3).optional(),
    rotationY: z.number().optional(),
    accent: z.string().optional(),
    name: z.string().optional(),
  }, async (a) => {
    const fp = safe(path.join(a.project, "entities.json"));
    let list = [];
    try { list = JSON.parse(await fs.readFile(fp, "utf8")); } catch {}
    list.push({ type: "pc", kind: a.kind, variant: a.variant, position: a.position, scale: a.scale, rotationY: a.rotationY, accent: a.accent, name: a.name });
    await fs.writeFile(fp, JSON.stringify(list, null, 2));
    return ok(`Komponente ${a.kind}/${a.variant} hinzugefügt.`);
  });

  s.tool("add_entity", "Einfache Primitive hinzufügen", {
    project: z.string(),
    type: z.enum(["box", "sphere", "cylinder", "cone"]),
    position: z.array(z.number()).length(3).default([0, 0, 0]),
    scale: z.array(z.number()).length(3).optional(),
    color: z.string().default("#999"),
    name: z.string().optional(),
  }, async (a) => {
    const fp = safe(path.join(a.project, "entities.json"));
    let list = [];
    try { list = JSON.parse(await fs.readFile(fp, "utf8")); } catch {}
    list.push({ type: a.type, position: a.position, scale: a.scale, color: a.color, name: a.name });
    await fs.writeFile(fp, JSON.stringify(list, null, 2));
    return ok(`Entity ${a.type} hinzugefügt.`);
  });

  s.tool("list_files", "Dateien im Projekt auflisten", { project: z.string() }, async ({ project }) => {
    const dir = safe(project);
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return ok(entries.map((e) => (e.isDirectory() ? e.name + "/" : e.name)).join("\n") || "(leer)");
  });

  s.tool("read_file", "Datei lesen", { project: z.string(), path: z.string() }, async ({ project, path: p }) => {
    return ok(await fs.readFile(safe(path.join(project, p)), "utf8"));
  });

  s.tool("write_file", "Datei schreiben (JS wird auf Syntax geprüft)", {
    project: z.string(), path: z.string(), content: z.string(),
  }, async ({ project, path: p, content }) => {
    if (p.endsWith(".js")) {
      try { acorn.parse(content, { ecmaVersion: "latest", sourceType: "module" }); }
      catch (e) { return ok(`Syntaxfehler: ${e.message}`); }
    }
    const fp = safe(path.join(project, p));
    await fs.mkdir(path.dirname(fp), { recursive: true });
    await fs.writeFile(fp, content);
    return ok(`Geschrieben: ${p}`);
  });

  s.tool("validate_project", "Alle JS-Dateien prüfen", { project: z.string() }, async ({ project }) => {
    const dir = safe(project);
    const walk = async (d) => {
      const out = [];
      for (const e of await fs.readdir(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) out.push(...(await walk(full)));
        else if (e.name.endsWith(".js")) out.push(full);
      }
      return out;
    };
    const errors = [];
    for (const f of await walk(dir)) {
      try { acorn.parse(await fs.readFile(f, "utf8"), { ecmaVersion: "latest", sourceType: "module" }); }
      catch (e) { errors.push(`${path.relative(dir, f)}: ${e.message}`); }
    }
    return ok(errors.length ? errors.join("\n") : "Alle JS-Dateien OK.");
  });

  s.tool("screenshot", "Headless-Screenshots (front/side/top/iso)", {
    project: z.string(),
    theme: z.enum(["stealth", "white", "rgb", "retro"]).optional(),
    views: z.array(z.enum(["front", "side", "top", "iso"])).default(["iso", "front", "side"]),
  }, async ({ project, theme, views }) => {
    const dir = safe(project);
    const b = await getBrowser();
    const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const base = `http://127.0.0.1:${PORT}/preview/${project}/`;
    const images = [];
    for (const view of views) {
      const q = new URLSearchParams({ view });
      if (theme) q.set("theme", theme);
      await page.goto(base + "?" + q.toString(), { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(400);
      const buf = await page.screenshot({ type: "png" });
      images.push({ view, data: buf.toString("base64") });
    }
    await page.close();
    return {
      content: images.map((im) => ({
        type: "image",
        data: im.data,
        mimeType: "image/png",
      })),
    };
  });

  s.tool("github_push", "Projekt in einem Commit nach GitHub pushen", {
    project: z.string(),
    repo: z.string().describe("owner/name"),
    message: z.string().default("update from web3d-connector"),
    branch: z.string().default("main"),
  }, async ({ project, repo, message, branch }) => {
    const dir = safe(project);
    const walk = async (d, prefix = "") => {
      const out = [];
      for (const e of await fs.readdir(d, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${e.name}` : e.name;
        if (e.isDirectory()) out.push(...(await walk(path.join(d, e.name), rel)));
        else out.push({ path: rel, content: await fs.readFile(path.join(d, e.name), "utf8") });
      }
      return out;
    };
    const files = await walk(dir);
    // Get base tree SHA
    let baseSha;
    try {
      const ref = await ghApi(repo, `git/ref/heads/${branch}`);
      baseSha = ref.object.sha;
    } catch {
      baseSha = null;
    }
    const blobs = [];
    for (const f of files) {
      const blob = await ghApi(repo, "git/blobs", "POST", { content: Buffer.from(f.content).toString("base64"), encoding: "base64" });
      blobs.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await ghApi(repo, "git/trees", "POST", { base_tree: baseSha ? (await ghApi(repo, `git/commits/${baseSha}`)).tree.sha : undefined, tree: blobs });
    const commit = await ghApi(repo, "git/commits", "POST", { message, tree: tree.sha, parents: baseSha ? [baseSha] : [] });
    if (baseSha) await ghApi(repo, `git/refs/heads/${branch}`, "PATCH", { sha: commit.sha });
    else await ghApi(repo, "git/refs", "POST", { ref: `refs/heads/${branch}`, sha: commit.sha });
    return ok(`Gepusht: ${repo}@${branch} (${files.length} Dateien, ${commit.sha.slice(0, 7)})`);
  });

  s.tool("github_pull", "Projekt aus GitHub in den Workspace laden", {
    project: z.string(),
    repo: z.string().describe("owner/name"),
    branch: z.string().default("main"),
    path: z.string().default("").describe("Unterordner im Repo (optional)"),
  }, async ({ project, repo, branch, path: sub }) => {
    const dir = safe(project);
    await fs.mkdir(dir, { recursive: true });
    const tree = await ghApi(repo, `git/trees/${branch}?recursive=1`);
    let n = 0;
    for (const item of tree.tree || []) {
      if (item.type !== "blob") continue;
      if (sub && !item.path.startsWith(sub.replace(/\/+$/, "") + "/") && item.path !== sub) continue;
      let rel = item.path;
      if (sub) rel = item.path.slice(sub.replace(/\/+$/, "").length).replace(/^\//, "");
      if (!rel) continue;
      const blob = await ghApi(repo, `git/blobs/${item.sha}`);
      const content = Buffer.from(blob.content, "base64");
      const fp = path.join(dir, rel);
      await fs.mkdir(path.dirname(fp), { recursive: true });
      await fs.writeFile(fp, content);
      n++;
    }
    return ok(`${n} Dateien nach workspace/${project} geladen.`);
  });

  return s;
};

// ---------- Express ----------
const app = express();
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/preview", express.static(ROOT, { extensions: ["html"], index: ["index.html"] }));

app.post("/mcp", async (req, res) => {
  if (!TOKEN) return res.status(500).json({ error: "MCP_TOKEN nicht gesetzt" });
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${TOKEN}`) return res.status(401).json({ error: "Unauthorized" });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  const server = createMcp();
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

await fs.mkdir(ROOT, { recursive: true });
app.listen(PORT, () => console.log(`web3d-connector on :${PORT}`));

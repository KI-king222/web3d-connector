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
#hud button{margin:0 4px;padding:4px 8px;border:0;border-radius:6px;cursor:pointer;background:#333;color:#fff}
#hud button.active{background:#0af;color:#000}`;

await fs.mkdir(ROOT, { recursive: true });
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use("/preview", express.static(ROOT));
app.get("/", (_, res) => res.send("web3d connector ok"));

function buildServer() {
  const s = new McpServer({ name: "web3d", version: "1.0.0" });
  s.tool("scaffold_game", "Neues 3D-Projekt anlegen", {
    name: z.string().describe("Projektname (Ordner)"),
    template: z.enum(["showcase", "game"]).default("showcase"),
  }, async ({ name, template }) => {
    const dir = safe(name);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), HTML(name));
    await fs.writeFile(path.join(dir, "style.css"), CSS);
    await fs.writeFile(path.join(dir, "main.js"), await T("showcase-main.js"));
    await fs.writeFile(path.join(dir, "components.js"), await T("components.js"));
    await fs.writeFile(path.join(dir, "entities.json"), "[]");
    return ok(`Projekt '${name}' mit Template '${template}' angelegt.`);
  });
  s.tool("list_files", "Dateien im Projekt auflisten", { project: z.string() }, async ({ project }) => {
    const dir = safe(project);
    const files = await fs.readdir(dir);
    return ok(files.join("\n"));
  });
  s.tool("read_file", "Datei lesen", { project: z.string(), path: z.string() }, async ({ project, path: p }) => {
    const f = safe(path.join(project, p));
    return ok(await fs.readFile(f, "utf8"));
  });
  s.tool("write_file", "Datei schreiben (JS wird auf Syntax geprüft)", {
    project: z.string(), path: z.string(), content: z.string(),
  }, async ({ project, path: p, content }) => {
    if (p.endsWith(".js")) {
      try { acorn.parse(content, { ecmaVersion: "latest", sourceType: "module" }); }
      catch (e) { return ok(`Syntax-Fehler: ${e.message}`); }
    }
    const f = safe(path.join(project, p));
    await fs.mkdir(path.dirname(f), { recursive: true });
    await fs.writeFile(f, content);
    return ok(`Geschrieben: ${p}`);
  });
  s.tool("validate_project", "Alle JS-Dateien prüfen", { project: z.string() }, async ({ project }) => {
    const dir = safe(project);
    const files = (await fs.readdir(dir)).filter((x) => x.endsWith(".js"));
    const errs = [];
    for (const file of files) {
      try { acorn.parse(await fs.readFile(path.join(dir, file), "utf8"), { ecmaVersion: "latest", sourceType: "module" }); }
      catch (e) { errs.push(`${file}: ${e.message}`); }
    }
    return ok(errs.length ? errs.join("\n") : "Alle JS-Dateien OK.");
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
  }, async (args) => {
    const f = safe(path.join(args.project, "entities.json"));
    let list = [];
    try { list = JSON.parse(await fs.readFile(f, "utf8")); } catch {}
    const ent = { type: "pc", kind: args.kind, variant: args.variant, position: args.position };
    if (args.scale) ent.scale = args.scale;
    if (args.rotationY != null) ent.rotationY = args.rotationY;
    if (args.accent) ent.accent = args.accent;
    if (args.name) ent.name = args.name;
    list.push(ent);
    await fs.writeFile(f, JSON.stringify(list, null, 2));
    return ok(`Komponente ${args.kind} hinzugefügt (${list.length} entities).`);
  });
  s.tool("add_entity", "Einfache Primitive hinzufügen", {
    project: z.string(),
    type: z.enum(["box", "sphere", "cylinder", "cone"]),
    position: z.array(z.number()).length(3).default([0, 0, 0]),
    scale: z.array(z.number()).length(3).optional(),
    color: z.string().default("#999"),
    name: z.string().optional(),
  }, async (args) => {
    const f = safe(path.join(args.project, "entities.json"));
    let list = [];
    try { list = JSON.parse(await fs.readFile(f, "utf8")); } catch {}
    list.push({ type: args.type, position: args.position, scale: args.scale, color: args.color, name: args.name });
    await fs.writeFile(f, JSON.stringify(list, null, 2));
    return ok(`Entity ${args.type} hinzugefügt.`);
  });
  s.tool("screenshot", "Headless-Screenshots (front/side/top/iso)", {
    project: z.string(),
    theme: z.enum(["stealth", "white", "rgb", "retro"]).optional(),
    views: z.array(z.enum(["front", "side", "top", "iso"])).default(["iso", "front", "side"]),
  }, async ({ project, theme, views }) => {
    const url = `http://127.0.0.1:${PORT}/preview/${project}/?theme=${theme || "stealth"}`;
    const b = await getBrowser();
    const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);
      const out = [];
      for (const v of views) {
        await page.goto(`${url}&view=${v}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(800);
        const buf = await page.screenshot({ type: "png" });
        const fp = safe(path.join(project, `shot-${v}.png`));
        await fs.writeFile(fp, buf);
        out.push(`shot-${v}.png`);
      }
      return ok(`Screenshots: ${out.join(", ")}`);
    } finally { await page.close(); }
  });
  return s;
}

app.post("/mcp", async (req, res) => {
  const auth = req.get("authorization") || "";
  const q = (req.query && req.query.token) ? String(req.query.token) : "";
  const okAuth = TOKEN && (auth === `Bearer ${TOKEN}` || q === TOKEN);
  if (!okAuth) return res.sendStatus(401);
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { transport.close(); server.close(); });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => console.log(`MCP: http://localhost:${PORT}/mcp | Vorschau: /preview/<projekt>/`));

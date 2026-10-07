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

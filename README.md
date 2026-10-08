# Web3D Connector – Anleitung für Grok

## Was ist das?
Ein MCP-Server (Node.js) für 3D-Webprojekte mit **Three.js**. Fokus: PC-Komponenten (GPU, CPU, Cooler, RAM, Mainboard, PSU, Case, Fan) in Themes `stealth`, `white`, `rgb`, `retro`.

Repo: `KI-king222/web3d-connector`  
Live: `https://web3d-connector.onrender.com/`

## Auth (MCP)
1. Header: `Authorization: Bearer <MCP_TOKEN>`
2. Path: `POST /mcp/<MCP_TOKEN>`
3. Query: `POST /mcp?token=<MCP_TOKEN>` (für Grok-Connector ohne Header-Feld)

## MCP-Tools
| Tool | Zweck |
|---|---|
| scaffold_game | Projekt anlegen (`project`, template showcase\|game) |
| list_files / read_file / write_file | Dateien |
| validate_project | JS-Syntax |
| add_pc_component | GPU, cooler, ram, motherboard, psu, case, fan, … |
| add_entity / remove_entity | Primitive |
| list_parts | Katalog + Einbau-Regeln |
| screenshot | Headless PNG/JPEG |
| github_push / github_pull | Sync (braucht GITHUB_TOKEN) |

## Env (nie committen)
- `MCP_TOKEN` (Render generateValue)
- `GITHUB_TOKEN` (optional, Contents R/W)

## Workflow HASHPOOL
1. scaffold_game → add_pc_component / write_file components.js
2. Preview: `/preview/<projekt>/`
3. Meshes nach `Bitcoin-Clicker/js/parts3d/` portieren

## Einheit
Intern mm; Szene 1 Einheit ≈ 10 cm.

## Deploy
Render Blueprint → Repo; `GITHUB_TOKEN` setzen; Manual Deploy nach Code-Push.

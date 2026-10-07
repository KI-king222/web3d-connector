# Web3D Connector – Anleitung für Grok

## Was ist das?
Ein MCP-Server (Node.js), mit dem ein KI-Assistent 3D-Webprojekte mit **Three.js, JavaScript und CSS** bauen kann. Aktueller Fokus: **Designs für PC-Komponenten** (GPU, CPU-Kühler, RAM, Mainboard, Netzteil, Gehäuse, Lüfter) in den Themes `stealth`, `white`, `rgb`, `retro`.

Der Nutzer arbeitet nur mit iPhone und iPad. Der Server läuft in der Cloud (Docker / Render). GitHub ist der dauerhafte Speicher.

## Repo
`KI-king222/web3d-connector` — Live: `https://web3d-connector.onrender.com/`

## MCP-Tools
| Tool | Zweck |
|---|---|
| `scaffold_game` | Neues Projekt anlegen (`showcase` oder `game`) |
| `list_files` / `read_file` / `write_file` | Dateien im Projekt |
| `validate_project` | JS-Syntax prüfen |
| `add_pc_component` | GPU, cooler, ram, motherboard, psu, case, fan |
| `add_entity` | Primitive (box, sphere, …) |
| `screenshot` | Headless PNG (front/side/top/iso) |
| `github_push` / `github_pull` | Sync mit GitHub (wenn GITHUB_TOKEN gesetzt) |

## Auth
- Header: `Authorization: Bearer <MCP_TOKEN>`
- Oder Query (Grok-UI): `https://web3d-connector.onrender.com/mcp?token=<MCP_TOKEN>`

## Themes
`stealth`, `white`, `rgb`, `retro`

## Workflow für HASHPOOL
1. In Web3D Prototypen bauen (`scaffold_game` → `add_pc_component` / `write_file`)
2. Mit Preview prüfen: `/preview/<projekt>/`
3. Bewährte Meshes nach `Bitcoin-Clicker/js/parts3d/` portieren
4. Layout-Koordinaten in `sceneLayout.js` halten

## Env (nie committen)
- `MCP_TOKEN`
- `GITHUB_TOKEN` (optional, Contents R/W)

## Einheit
1 Einheit ≈ 10 cm

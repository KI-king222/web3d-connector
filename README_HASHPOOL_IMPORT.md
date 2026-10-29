# HASHPOOL in Web3D (für andere KIs)

## Einmalig nach Deploy

1. Render Env (optional, Auto beim Start):
   - `MIRROR_REPO` = `KI-king222/Bitcoin-Clicker`
   - `MIRROR_PROJECT` = `hashpool`
   - `GITHUB_TOKEN` braucht Leserecht auf Bitcoin-Clicker (Schreiben wenn zurückgepusht wird)

2. Oder in der UI Tab **GitHub** → **HASHPOOL-REPO FÜR KI** → **Ganzes HASHPOOL laden**

3. Oder per MCP:
```json
{ "name": "import_repo", "arguments": {
  "project": "hashpool",
  "repo": "KI-king222/Bitcoin-Clicker",
  "branch": "main",
  "subdir": ""
}}
```

## Danach für andere KIs

- `list_files` mit `project: "hashpool"`
- `read_file` / `write_file` mit Pfad z.B. `hashpool/js/parts3d/gpu.js`
- Zurück: `github_push` mit `project: "hashpool"`, `repo: "KI-king222/Bitcoin-Clicker"`, `subdir: ""` (Vorsicht) oder gezielter Unterordner

Dateien > 1 MB werden beim Import übersprungen.

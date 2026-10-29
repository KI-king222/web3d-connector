# Deploy: HASHPOOL voll in Web3D

## 1) Dateien aktualisieren

Im Repo liegen bereit:
- `server.js` (mit `import_repo` + Auto-Spiegel) — **manuell hochladen aus artifacts/web3d-connector/server.js wenn noch nicht aktuell**
- `templates/ui.html` (Button „Ganzes HASHPOOL laden“)
- `projects/hashpool/README.md`

Wenn `server.js` auf GitHub noch **kein** `import_repo` enthält: Inhalt aus dem lokalen Artifact `web3d-connector/server.js` (31 KB) nach `server.js` im Repo kopieren (GitHub Web Upload oder Desktop).

## 2) Render → Manual Deploy

Beim Start lädt der Server automatisch:

`KI-king222/Bitcoin-Clicker` → `workspace/hashpool/`

(sofern `GITHUB_TOKEN` gesetzt und `MIRROR_REPO` nicht `off` ist)

## 3) Andere KIs

MCP-URL wie bisher. Dann z.B.:

- `list_files` `{ "project": "hashpool" }`
- `read_file` `{ "path": "hashpool/js/parts3d/gpu.js" }`
- `write_file` …
- `github_push` zurück nach `KI-king222/Bitcoin-Clicker`

## Env (optional)

| Key | Default |
|-----|--------|
| MIRROR_REPO | KI-king222/Bitcoin-Clicker |
| MIRROR_PROJECT | hashpool |
| MIRROR_REPO=off | Spiegel aus |

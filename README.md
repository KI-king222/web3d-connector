# Web3D Connector – Anleitung für Grok

## Was ist das?
Ein MCP-Server (Node.js), mit dem ein KI-Assistent 3D-Webprojekte mit **Three.js, JavaScript und CSS** bauen kann. Aktueller Fokus: **Designs für PC-Komponenten** (GPU, CPU-Kühler, RAM, Mainboard, Netzteil, Gehäuse, Lüfter) in den Themes `stealth`, `white`, `rgb`, `retro`.

Der Nutzer arbeitet nur mit iPhone und iPad. Der Server läuft deshalb in der Cloud (Docker, z. B. Render). GitHub ist der dauerhafte Speicher.

## Deine Aufgabe jetzt
1. Erstelle ein neues GitHub-Repo (z. B. `web3d-connector`) **mit initialem Commit** (README anlegen), damit `github_push` später funktioniert.
2. Lege alle Dateien mit **exakt dieser Struktur** an und übernimm den Inhalt unverändert:
   ```
   server.js
   package.json
   Dockerfile
   render.yaml
   README.md
   .gitignore          (Inhalt: node_modules und workspace, je eine Zeile)
   templates/components.js
   templates/showcase-main.js
   ```
3. **Keine Tokens oder Passwörter ins Repo schreiben.**
4. Sag dem Nutzer den Repo-Namen (`owner/name`). Das Deployment auf Render macht er selbst (siehe unten).

## Anmeldung am MCP-Endpunkt
Der Server nutzt **kein OAuth**. Zwei Wege: (1) Header `Authorization: Bearer <MCP_TOKEN>` auf `/mcp`, oder (2) wenn der Client kein Header-Feld hat (z. B. Grok verlangt sonst OAuth): die URL `https://<server>/mcp/<MCP_TOKEN>` ohne Authentifizierung eintragen. Das Token steht dann in der URL und ist wie ein Passwort zu behandeln.

## Hosting auf dem Gratis-Plan (v4)
- Das Standard-`Dockerfile` ist schlank (ohne Chromium) und läuft auf Render Free (512 MB RAM). `screenshot` per Server gibt dort eine Fehlermeldung; die Weboberfläche macht Fotos im eigenen Browser (Knopf „Foto“). Wer Server-Screenshots braucht, nimmt `Dockerfile.screenshots` auf einem Plan mit mehr RAM.
- Der Gratis-Server schläft nach ca. 15 Minuten und vergisst beim Neustart alle Dateien. **Lösung:** Umgebungsvariable `STATE_REPO=owner/name` setzen (Repo mit mindestens einem Commit, `GITHUB_TOKEN` braucht Schreibrechte darauf). Jede Änderung wird dann nach ca. 15 s automatisch nach `projects/<name>/` gesichert, beim Start werden fehlende Projekte zurückgeholt. Tools: `github_list` (Projekte in einem Repo finden), `delete_project`.

## Bedienoberfläche (für den Nutzer, iPhone/iPad)
Die Startseite `/` ist ein Studio mit Tabs: **Projekte**, **Bauen**, Live-Vorschau, Foto (client-seitig), Designs. Siehe UI unter `/`.

## MCP-Tools
| Tool | Zweck |
|---|---|
| `scaffold_game` | Neues Projekt anlegen (`template`: `showcase` Standard, oder `game`) |
| `remove_entity` | Objekt aus der Szene entfernen (`index` ab 0) |
| `list_parts` | Katalog aller Bauteile, Optionen, Maße und Konventionen (zuerst lesen) |
| `add_pc_component` | Komponente einfügen (`kind`, `variant`, `position`, `accent`, `options`) |
| `add_entity` | Einfache Primitive (Box, Kugel, Zylinder, Kegel) hinzufügen |
| `list_files`, `read_file`, `write_file` | Dateien lesen und schreiben. `write_file` prüft JS auf Syntaxfehler |
| `validate_project` | Alle JS-Dateien eines Projekts prüfen |
| `screenshot` | Vorschau headless rendern (nur mit Dockerfile.screenshots) |
| `github_push` | Projekt in **einem Commit** nach GitHub pushen. **Immer `subdir` setzen** (z. B. `pc-designs`) |
| `github_pull` | Projekt aus GitHub in den Workspace laden |
| `github_list` / `delete_project` | Projekte auflisten / löschen (mit STATE_REPO) |

## Baukasten: Bauteile und Konventionen
Alles liegt in `templates/components.js`. Einheit: intern mm, `buildPC()` skaliert auf 0.01.

**Einbau-Regeln:** GPU mit `rotation.x = -Math.PI/2` auf den PCIe-Slot, RAM mit `rotation.y = Math.PI/2`, Kühler auf die CPU, PSU unten hinten, Mainboard im Abstand von 7,75 mm zum Tray. Siehe `B.system()`.

**Details:** `options.detail` (Standard `true`) – Beschriftungen, Leiterbahnen, Kabel. `detail: false` schaltet ab.

## Umgebungsvariablen (nie committen)
- `MCP_TOKEN`: geheimes Token für `/mcp`
- `GITHUB_TOKEN`: Fine-grained Token Contents R/W
- `STATE_REPO`: optional owner/name für automatische Projekt-Sicherung

## Deployment
Render: *New → Blueprint* → Repo → `GITHUB_TOKEN` / optional `STATE_REPO` → Manual Deploy nach Code-Push.

## Einbindung ins Spiel (HASHPOOL)
Unterordner z. B. `pc-designs/`. `github_push` mit `subdir: "pc-designs"` und `only: ["components.js", "entities.json"]`.
`import { buildPC } from "./pc-designs/components.js";` – Import-Map braucht `three` und `three/addons/` (0.160.0).

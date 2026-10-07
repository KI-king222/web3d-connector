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

## Wie der Code funktioniert
- `server.js` startet einen Express-Server mit zwei Teilen:
  - Der Endpunkt **`POST /mcp`** (geschützt per `Authorization: Bearer <MCP_TOKEN>`) stellt die MCP-Tools bereit.
  - **`/preview/<projekt>/`** liefert die erzeugten Projekte als statische Webseite aus (zum Ansehen im Browser).
- Alle Projekte liegen im Ordner `workspace/<projekt>/`. Dateizugriffe sind auf diesen Ordner beschränkt.
- `templates/components.js` enthält die parametrischen 3D-Bauteile (`GPU`, `cooler`, `ram`, `motherboard`, `psu`, `case`, `fan`) und die Design-Themes. Neue Bauteile oder Themes werden dort ergänzt (Objekt `B` bzw. `THEMES`).
- `templates/showcase-main.js` ist der Viewer: Orbit-Kamera, Auto-Rotation, Buttons zum Umschalten der Themes. Mit URL-Parametern (`?view=front|side|top|iso&theme=rgb`) rendert er für Screenshots.

## MCP-Tools
| Tool | Zweck |
|---|---|
| `scaffold_game` | Neues Projekt anlegen (`template`: `showcase` Standard, oder `game`) |
| `add_pc_component` | Komponente einfügen (`kind`, `variant`, `position`, `accent`) |
| `add_entity` | Einfache Primitive (Box, Kugel, Zylinder, Kegel) hinzufügen |
| `list_files`, `read_file`, `write_file` | Dateien lesen und schreiben. `write_file` prüft JS auf Syntaxfehler |
| `validate_project` | Alle JS-Dateien eines Projekts prüfen |
| `screenshot` | Vorschau headless rendern und Bilder zurückgeben (Ansichten `front`, `side`, `top`, `iso`; optional `theme`) |
| `github_push` | Ganzes Projekt in **einem Commit** nach GitHub pushen |
| `github_pull` | Projekt aus GitHub in den Workspace laden (der Server-Speicher ist flüchtig) |

## Empfohlener Arbeitsablauf
1. `github_pull`, falls das Projekt schon existiert, sonst `scaffold_game`.
2. Bauteile mit `add_pc_component` einfügen oder `components.js` per `write_file` erweitern.
3. **`screenshot` aufrufen und das Ergebnis prüfen** (Überschneidungen, Farben, Proportionen), dann korrigieren.
4. Nach jeder größeren Änderung `github_push`.

## Umgebungsvariablen (im Hosting setzen, nie committen)
- `MCP_TOKEN`: geheimes Token für `/mcp` (Render erzeugt es automatisch)
- `GITHUB_TOKEN`: Fine-grained Token mit „Contents: Read and write“ für das Ziel-Repo

## Deployment (macht der Nutzer)
Auf render.com: *New → Blueprint* → Repo wählen → `GITHUB_TOKEN` eintragen. Danach die URL `https://<name>.onrender.com/mcp` und das `MCP_TOKEN` in Grok als Remote-MCP-Tool eintragen.

## Hinweise
- Einheit in der Szene: 1 Einheit ≈ 10 cm.
- `screenshot` funktioniert nur mit dem Showcase-Template.
- Die Vorschau unter `/preview/` ist öffentlich, `/mcp` ist durch das Token geschützt.

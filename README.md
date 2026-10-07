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

## Bedienoberfläche (für den Nutzer, iPhone/iPad)
Die Startseite `/` des Servers ist ein Steuerpult: Anmeldung mit `MCP_TOKEN`, Projektauswahl, Live-Vorschau, Screenshots, Bauteile hinzufügen und löschen, neues Projekt, Push/Pull nach GitHub. Sie ruft über `/api/tool` dieselben MCP-Tools auf wie Grok.

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
| `remove_entity` | Objekt aus der Szene entfernen (`index` ab 0) |
| `list_parts` | Katalog aller Bauteile, Optionen, Maße und Konventionen (zuerst lesen) |
| `add_pc_component` | Komponente einfügen (`kind`, `variant`, `position`, `accent`, `options`) |
| `add_entity` | Einfache Primitive (Box, Kugel, Zylinder, Kegel) hinzufügen |
| `list_files`, `read_file`, `write_file` | Dateien lesen und schreiben. `write_file` prüft JS auf Syntaxfehler |
| `validate_project` | Alle JS-Dateien eines Projekts prüfen |
| `screenshot` | Vorschau headless rendern und Bilder zurückgeben (Ansichten `front`, `side`, `top`, `iso`; optional `theme`) |
| `github_push` | Projekt in **einem Commit** nach GitHub pushen. **Immer `subdir` setzen** (z. B. `pc-designs`), sonst werden `index.html` und `main.js` des Spiels in der Repo-Wurzel überschrieben. Mit `only` lassen sich einzelne Dateien pushen |
| `github_pull` | Projekt (oder nur den Ordner `subdir`) aus GitHub in den Workspace laden (der Server-Speicher ist flüchtig) |

## Baukasten (v2): Bauteile und Konventionen
Alles liegt in `templates/components.js` (wird beim Anlegen eines Projekts kopiert). Das Tool `list_parts` liefert den aktuellen Katalog.

- **Einheit:** intern Millimeter, `buildPC()` skaliert auf 0.01 (1 Szeneneinheit = 10 cm). Maße sind echte Bauteilmaße.
- **Achsen eines Teils:** x = Länge, y = hoch, z = Breite. Ursprung = Mitte der Unterseite (Auflagefläche). Ausnahme: `case` ist zentriert.
- **Case-Frame:** x = Breite (+x = Glasseite), y = hoch, z = Tiefe (+z = vorne).
- **Mainboard-Frame:** lokal x = Platinenlänge (hinten→vorne), y = Abstand von der Platine, z = Breite (unten→oben). Wird per Rotationsmatrix ins Case gesetzt (x→z, y→x, z→y).

| kind | Inhalt | wichtige options |
|---|---|---|
| `system` | kompletter, eingebauter PC | `case`, `form`, `ram`, `gpu`, `cooler` |
| `case` | Gehäuse mit Glas, Tray, Frontlüftern, Shroud | `size`: mini, mid, full |
| `motherboard` | Sockel, RAM-Slots, PCIe, VRM, Chipsatz | `form`: atx, matx, itx |
| `cpu`, `cooler`, `aio` | Prozessor, Luftkühler, Wasserkühlung | `preset`, `height`, `fans`, `radiator` |
| `ram` | Module mit Heatspreader | `sticks`, `pitch` |
| `gpu` | Grafikkarte | `preset`: compact, standard, flagship; `length`, `slots`, `fans` |
| `ssd_sata`, `ssd_m2`, `hdd` | Laufwerke | `heatsink` (M.2) |
| `psu`, `fan` | Netzteil, Lüfter | `form`, `fan`; `size` |

**Einbau-Regeln (wie im echten Leben):** GPU mit `rotation.x = -Math.PI/2` auf den PCIe-Slot, RAM mit `rotation.y = Math.PI/2` in die Slots, Kühler auf die CPU, PSU unten hinten (Lüfter nach unten), Mainboard im Abstand von 7,75 mm zum Tray. Das fertige Beispiel steht in `B.system()`.

**Neues Bauteil:** Funktion in das Objekt `B` schreiben, Primitive nutzen (`bx` Box, `rb` abgerundete Box, `cy` Zylinder, `fan`, `cable`), danach `screenshot` aufrufen und die Proportionen prüfen.

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

## Einbindung ins bestehende Web-Spiel
Die PC-Bauteile gehören in den Spiel-Code (Repo des Spiels), aber in einen **eigenen Unterordner**, z. B. `pc-designs/`. Immer `github_push` mit `subdir: "pc-designs"` und `only: ["components.js", "entities.json"]` nutzen, wenn nur die Bauteile ins Spiel sollen.
Im Spiel: `import { buildPC } from "./pc-designs/components.js";` und `scene.add(buildPC("gpu", "rgb"))`. Das Spiel braucht im Import-Map die Einträge `three` und `three/addons/` (gleiche three-Version wie im Viewer, 0.160.0).

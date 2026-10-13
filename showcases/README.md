# HASHPOOL 3D-Showcases

Die Showcase-Szenen verwenden die gemeinsame `templates/components.js`-Bibliothek. Jede Szene besteht aus einer `entities.json` und kann mit dem vorhandenen Showcase-Template geöffnet werden.

## Preview öffnen

Nach dem Start des Connectors (`npm install && npm start`) liegen die Szenen unter:

- `http://localhost:3000/preview/hp-gpu-10/`
- `http://localhost:3000/preview/hp-cpu-10/`
- `http://localhost:3000/preview/hp-mobo/`
- `http://localhost:3000/preview/hp-case-io/`
- `http://localhost:3000/preview/hp-components/`

Für feste Kamerasichten können `?view=top`, `?view=front`, `?view=side` oder `?view=iso` angehängt werden. `&rotate=1` aktiviert die automatische Drehung; `&theme=rgb` überschreibt die Variante für alle Objekte.

## Render-Workspace befüllen

Die Ordner enthalten die fertigen `entities.json`-Payloads. Im Connector-UI können für jedes Projekt ein Showcase-Projekt angelegt und die jeweilige Datei übernommen werden. Bei aktiviertem `STATE_REPO` bleiben die Projekte nach einem Render-Neustart erhalten.

## Erwartete Prüfpunkte

- GPU: T1/T2 mit einem eng eingefassten Lüfter, T3/T4 mit zwei Lüftern, T5+ mit Backplate/RGB und T10 mit drei Lüftern.
- Mainboard: I/O oben, CPU-Sockel oben-mittig, vier RAM-Slots rechts, M.2 zwischen CPU und PCIe, langer x16-Slot direkt darunter.
- Case: Mid-Tower mit Glasseite, drei Front-Intakes, Heck-Exhaust und sichtbaren I/O-/Front-Anschlüssen.

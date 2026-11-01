# HASHPOOL NEXT — Shop-Simulator (Test-Version)

**Stand:** 2026-11-01

## Idee
Zwei Versionen auf derselben Domain:
- **Öffentlich:** `https://hashpool.pages.dev/` (unverändert, stabil)
- **Test:** `https://hashpool.pages.dev/next/` — hier entsteht der Shop-Simulator (Laden, Hinterraum, Teile-Bestellcomputer, Regal, Bautisch, später Laufen).

## Zugang
Im Code-Feld des Spiels **`OPEN-SHOP`** eingeben (oder direkt `/next/` aufrufen). Umgesetzt in `js/parts3d/farmFix.js` (v5), Kill-Switch gibt es nicht nötig: ohne den Code passiert nichts.
Oben in der Test-Version zeigt ein oranger Balken „NEXT · Test-Version“ mit Link zurück zur stabilen Version.

## Aufbau
- `next/index.html` — Kopie des öffentlichen Laders mit `<base href="../">`: alle Pfade (`hp_b64_*.txt`, `js/...`) zeigen auf die Repo-Wurzel; lädt danach `next/next.js`.
- `next/next.js` — nur hier geladen; neue Features (Phase 1+) kommen **hierhin** oder in neue Dateien unter `next/`.
- Gemeinsame Dateien (`js/parts3d/*`, Bundle) wirken weiterhin in beiden Versionen. **Regel:** Alles, was nur NEXT betrifft, nur unter `next/` ablegen und nur von `next/next.js` laden.
- Spielstand: gleiche Domain = gleicher Browser-Speicher. Neue NEXT-Daten bitte unter eigenen Schlüsseln (`hashpool-next-*`) speichern, damit die öffentliche Version nie davon beeinflusst wird.

## Rückweg / Backup
Die öffentliche Version ist der Stand vor diesen Änderungen (Git-Commit `527c89b` und davor). Zurück: Dateien dieses Commits wiederherstellen (`git revert` / `git checkout 527c89b -- index.html js/`). Die Hauptseite (`index.html`) wurde für NEXT **nicht** verändert.

## Roadmap NEXT
1. Hinterraum im Laden: Bestell-Computer (Teile-Shop), Regal (Inventar sichtbar), Bautisch (startet Zusammenbau)
2. Laden als Hauptscreen in NEXT
3. Klick-Einkommen eingebettet (Mining-Rig/Kasse/Farm-Terminal)
4. Laufen mit Joystick (optional)

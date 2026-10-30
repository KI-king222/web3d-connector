# HASHPOOL — Changelog / Projekt-Protokoll

**Regel:** Bei neuen Loader-Patches **nie** ältere Patches entfernen (additive only).

---

## 2026-10-30 — A2 Power- & Temperatur-Regeln

### Neu
- `js/parts3d/powerTemp.js` — Last (Summe Teile-Watt) gegen Netzteil × 0.9, CPU-/GPU-Temperatur aus Last, Kühler-Kapazität und Gehäuse-Airflow
- Anzeige: Leiste im Teile-Picker („⚡ Netzteil 420 / 650 W“, Temp-Balken, Warntexte) und im Farm-PC-Fenster
- Warnung/Drossel nur als Anzeige („Leistung nach Drosselung: x %“) — **keine** Änderung an Economy/Clicker
- `Parts3D.power.calc(ids)` für spätere Features (A3 Benchmark, B1 Aufträge)
- Spielwerte aus Teilestufe/Typ (Catalog hat kein tdp/heat); Netzteil-Watt und Kühlertyp aus `Parts3D.partFacts`
- Kill-Switch `?nopower=1`; Loader in `sceneLayout.js` lädt jetzt `farmRoom` und `powerTemp`

---

## 2026-10-30 — A1 Farm-Raum 3D

### Neu
- `js/parts3d/farmRoom.js` — Button „🏭 Meine Farm (n/6)“ neben dem Teile-Shop; Overlay mit 3D-Raum (Boden, Wand, Licht, 1 Rack, 6 Plätze)
- Orbit/Zoom/Pan wie im Bau-Modus (1 Finger drehen, 2 Finger zoomen/verschieben), PC antippen → Teileliste + grobe Werte (Leistung/Effizienz/Preis-Leistung, Teilewert)
- Nach dem Verkauf eines Rigs: „In Farm stellen?“ (Verkauf/Belohnung unverändert); Farm voll → Hinweis; Rig entfernen mit Doppel-Tipp-Bestätigung
- Leere Plätze: „Beispiel-Rig hier abstellen“
- `state.farmSlots = [{ id, name, partIds, placedAt, pos }]`; Speicherung in `localStorage` (`hashpool-farm-v1[:user]`) bei jedem `save()` und im `HashpoolSave`-Payload
- DE/EN über `state.lang`; Kill-Switch `?nofarm=1`
- Geladen per kleinem Loader am Ende von `sceneLayout.js` (direktes `eval` im Spiel-Scope)

### Nicht in A1
- Strom/Temperatur-Simulation, Multiplayer, Kabel zwischen Racks

### Sonstiges (2026-10-29)
- `registry.js` enthält zusätzlich `claudeUi` (Kompatibilitätsregeln, Auswahlreihenfolge Mainboard zuerst, Kauf-Hinweise, Seitenwand bei Gehäusen ohne Glas, GPU-Beschriftung, Software-Install-Stage)

---

## 2026-10-27 — Claude-Zusammenbau im Spiel

### Runtime
- `ports.js` + `assemble.js` — Kompatibilität, Port-API, buildAssembledPC
- `assembleSync.js` — CABLES-Endpunkte an LAYOUT (24-Pin, CPU, GPU, Fan)
- `claudeBridge.js` — wraps `recomputeCables`, soft-Warnung beim Teile-Pick
- AssembleHook — hard-Block bei inkompatiblem Build-Start
- Demo: `Parts3D.applyDemoPick()` setzt kompatibles Set in buildPick/partInv
- Cache `?v=20261027c`

### Referenz
- Claude-Meshes: `web3d-connector/projects/Claude` (nächste Mesh-Stufe)
- `js/parts3d/claude/README.md`

---

## Frühere Einträge
Siehe Git-Historie / docs/CHANGELOG.md

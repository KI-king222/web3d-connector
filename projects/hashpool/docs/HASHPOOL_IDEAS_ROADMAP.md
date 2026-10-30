# HASHPOOL — Ideendatei & Anleitung für Folge-KIs
**Stand:** 2026-10-29  
**Spiel:** HASHPOOL (Bitcoin-Clicker) — https://hashpool.pages.dev/  
**Repos:** KI-king222/Bitcoin-Clicker  
**3D-Studio:** KI-king222/web3d-connector (Projekt Claude / claude3d + claudeRig)

---

## Ziel des Spiels (Produktvision)

Weg vom **reinen Clicker** (nur Buttons drücken) hin zu:

1. **3D-PC bauen** (bereits vorhanden, weiter verfeinern)
2. **Simulations- und Aufbau-Gameplay** (neu)
3. Klicken bleibt **Nebeneinkommen**, Fortschritt kommt aus **Bauen → Farm → Aufträge**

**Nicht** in Phase 1 anfassen: Economy-Balancing der reinen Click-Upgrades (außer wenn ein Feature es zwingend braucht).  
**Immer** additive Loader-Patches; bestehende Patches nicht löschen.

---

## Vorhandene Basis (nicht neu erfinden)

| System | Ort / Hinweis |
|--------|----------------|
| Teile-Shop, Inventar, buildPick | `js/partShop.js`, `js/partCatalog.js` |
| 3D-Zusammenbau Claude | `js/parts3d/claude3d.js`, `js/parts3d/claudeRig.js` |
| Loader | `index.html` → `p3d = ["registry","sceneLayout","claude3d","claudeRig"]` |
| Ports / compat / Kabel | in Claude-Bundle: `buildSystem`, `compat`, Plugs |
| Save | `partInv`, `buildPick`, `tutorialDone`, … in state/saveApi |
| Live | Cloudflare Pages `hashpool.pages.dev` |

Demo-Spec (kompatibel):  
`{ case:"case-7", mobo:"mobo-6", cpu:"cpu-8", cooler:"cooler-6", ram:"ram-6", gpu:"gpu-7", psu:"psu-6", ssd:["ssd-5"] }`

---

# TEIL A — Geringer Aufwand (jetzt / nächste Sprints)

## A1. Farm-Raum 3D (Priorität 1)

**Idee:** Gebaute/verkaufte Rigs stehen in einem **3D-Raum mit Racks**.

### Spieler-Erlebnis
- Button „Meine Farm“ / „Visit Farm“
- Raum: Boden, 1–2 Racks, Beleuchtung
- Jeder Farm-PC = 1 Mesh; Klick → Komponenten + grobe Stats
- Kamera: Orbit + Pan wie im Bau-Modus

### Technik
- Modul `js/parts3d/farmRoom.js` (oder Web3D-Projekt `hp-farm`)
- `state.farmSlots = [{ id, partIds, placedAt, pos }]`
- Nach Build/Sell optional „In Farm stellen“
- Erst Low-Poly-Cases, später Claude-Builds

### Akzeptanzkriterien
- [ ] 1 Rack, 4–8 Slots (Mobile)
- [ ] Leerer Raum ohne Crash
- [ ] Speichern/Laden
- [ ] DE/EN

### Nicht in A1
Stromsimulation, Multiplayer, Kabel zwischen Racks

---

## A2. Power- & Temperatur-Regeln (Priorität 2)

Teile: `tdpW`, `heat`; PSU `wattage`; Cooler `cooling`; Case `airflow`.

- Power: Summe TDP ≤ PSU × 0.9 sonst Warnung/Drossel
- Temp: einfach aus heat − cooling − airflow → Throttle möglich
- UI: „PSU 650W | Last 480W“ + Temp-Balken

---

## A3. Benchmark nach dem Bau (Priorität 3)

Nach Zusammenbau: kurzer Start-Test (8–15s), Lüfter-Anim, Stabil/Throttle/Crash, leichter Einfluss auf Verkauf/Farm-Hashrate. Skip-Button. Mobile-tauglich.

---

# TEIL B — Mittelaufwand

## B1. Auftragssystem
Constraints (Budget, Watt, „leise“). Annehmen → bauen → abgeben. 5–10 Aufträge, 1 aktiv.

## B2. Werkstatt / Diagnose
Fehlersymptome, Teil tauschen, Test (A3). Nutzt Claude-Ports.

## B3. BIOS / Overclock-Lab
Ausbau bestehender Paste/BIOS-Ideen; Mobile-Slider; Risiko Throttle.

## B4. Rack-Kabel-Minispiel (optional)
Kurz, session-basiert.

---

# TEIL C — Große Vision (später, nicht jetzt bauen)

- **C1** Leiterplatten-Fabrik (Tycoon über dem Shop)
- **C2** Rechenzentrum-Tycoon (Gebäude, Strompreis, Kühlung)
- **C3** Multiplayer/Handel erst mit Server-Validierung

---

# Reihenfolge

1. A1 Farm-Raum  
2. A2 Power/Temp  
3. A3 Benchmark  
4. B1 Aufträge  
5. B2 Diagnose  
6. B3 BIOS  
7. Teil C nur nach explizitem Auftrag

---

# Regeln für die implementierende KI

1. Repo Bitcoin-Clicker, CHANGELOG.md pflegen  
2. Loader additiv  
3. Claude-Ports bevorzugen  
4. Mobile first, DE+EN  
5. Saves nicht brechen  
6. Economy moderat  
7. Keine echten Marken-Texturen  
8. Live-Code hat Vorrang vor dieser Datei bei Widerspruch

---

# Copy-Paste-Auftrag (A1)

```
Implementiere HASHPOOL Feature A1: Farm-Raum 3D.
Repo: KI-king222/Bitcoin-Clicker. 3D-Basis: claude3d.js + claudeRig.js (nicht ersetzen).
Neuer Overlay „Meine Farm“, 1 Rack, bis 6 Slots, state.farmSlots speichern,
nach Build optional in Farm stellen, Klick zeigt Teile/Stats, DE/EN, CHANGELOG.
Nicht: Stromsim, Multiplayer, Fabrik.
Lies: docs/HASHPOOL_IDEAS_ROADMAP.md
```

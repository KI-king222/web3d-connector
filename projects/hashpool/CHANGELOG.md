# HASHPOOL — Changelog / Projekt-Protokoll

**Regel:** Bei neuen Loader-Patches **nie** ältere Patches entfernen (additive only).

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

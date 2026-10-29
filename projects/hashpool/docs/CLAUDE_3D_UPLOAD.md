# Claude 3D Delivery – manuell hochladen

Wegen großer Dateien bitte einmal im GitHub-Web-UI:

1. Repo: KI-king222/Bitcoin-Clicker
2. Upload / ersetzen:
   - `js/parts3d/claude3d.js` (aus dem Delivery-ZIP, ~139 KB)
   - `js/parts3d/claudeRig.js` (aus dem Delivery-ZIP, ~22 KB)
3. `index.html` Loader: `p3d = ["registry","sceneLayout","claude3d","claudeRig"]`
4. Cache: `?v=20261029a`

**Nicht** mehr laden: cpu, gpu, ram, ssd, psu, cooler, ports, assemble, assembleSync, claudeBridge, patch

Danach Hard-Reload auf https://hashpool.pages.dev/

Demo-Spec (0 Fehler): `{case:"case-7", mobo:"mobo-6", cpu:"cpu-8", cooler:"cooler-6", ram:"ram-6", gpu:"gpu-7", psu:"psu-6", ssd:["ssd-5"]}`

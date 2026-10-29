# Changelog

## 2026-10-04 — Parts Shop + 3D detail + cheats
- Fullscreen Parts Shop (shelves), ~10 SKUs/category, brand chips, 1–10 scales
- Inventory + build picker: only selected parts consumed on sell
- Modest sell mult by average tier (~12–27%)
- `js/parts3d/*`: tier/brand meshes (CPU/GPU/RAM/SSD/PSU/cooler), axis fixes
- `js/partCheat.js`: buy/select SFX; grant-all-parts for obscured cheat codes
- SEO: meta, robots, sitemap, Search Console tag

## 2026-10-04 — SEO for Google
- index.html: title, description, keywords, canonical, Open Graph, Twitter cards
- robots.txt + sitemap.xml (hashpool.pages.dev)
- noscript fallback with HASHPOOL text for crawlers
- Next step for you: Google Search Console → property + index request

## 2026-10-03 — SFX-Katalog für Videos
- `docs/SFX_CATALOG.md`: Name ↔ beep.js-Funktion ↔ Einsatz
- `sfx/generate_sfx.py`: erzeugt click, crit, buy, install, halving (+ Aliase)
- Regel: neuer Sound im Code → Generator/Katalog aktualisieren
- Video-Sync: Event-Zeitstempel + `sfx/*.wav` 1:1 mixen

## 2026-10-01 — Text-Flicker-Fix
- Balance/USD/Hashrate: Cache in JS statt DOM-Vergleich (weniger Flackern)
- Mine-Klick: nur leichte UI-Update statt volles `render()`
- Passive-Tick: Shop-`disabled` nur bei echter Änderung setzen
- `fmtSats`: stabile Formatierung ohne `compact`-Sprünge

## 2026-09-30 — Modul-Aufteilung
- CSS nach Funktion: base, account, build, shop, modals, minigames
- JS nach Funktion (benannte Module), schrittweiser Upload
- Account-System, Boot entfernt, Humanish-Bot, PC-Bau 3D

## Früher
- Three.js PC-Bau, Paste/BIOS-Minispiele, Halving, i18n DE/EN

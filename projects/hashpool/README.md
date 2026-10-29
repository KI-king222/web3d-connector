# HASHPOOL — Bitcoin Clicker

Live: **https://ki-king222.github.io/Bitcoin-Clicker/**

---

## Struktur (nach Funktion benannt)

```
Bitcoin-Clicker/
├── index.html              ← HTML-Gerüst (lädt CSS + JS)
├── css/
│   ├── base.css            ← Variablen, Layout, Header
│   ├── account.css         ← Login, Account, Halving
│   ├── build.css           ← PC-Werkstatt, 3D-Case
│   ├── shop.css            ← Balance, Mine-Button, Shop
│   ├── modals.css          ← Dialoge, Toasts
│   └── minigames.css       ← Paste- & BIOS-Minispiele
├── js/
│   ├── data-*.js           ← Upgrades, Teile, State, Texte
│   ├── account-*.js        ← Login, Register, Snapshots
│   ├── build3d-*.js        ← Three.js Bauteile & Szene
│   ├── ui.js               ← Sprache, Dialoge
│   ├── audio.js            ← Sounds
│   ├── save-*.js           ← Speichern, Kosten, Format
│   ├── render-shop-*.js    ← Shop-Anzeige
│   ├── build-*.js          ← Werkstatt Drag&Drop
│   ├── minigames-*.js      ← Paste, BIOS, Boot
│   ├── shop.js             ← Kauf + Tick/Events
│   ├── main-*.js           ← weitere Events
│   └── expansion-*.js      ← Farm, Markt, Missionen
├── docs/
└── tools/
```

Jede Datei beginnt mit einem Kommentar zur Funktion, z.B.
`/* build.css — PC-Bau Overlay, 3D-Case, Teile-Tray */`

---

## Live

Solange nicht alle JS-Module online sind, kann die Startseite noch den
vollen Stand per CDN laden (Spiel bleibt spielbar).

## Links

| Was | URL |
|-----|-----|
| Spiel | https://ki-king222.github.io/Bitcoin-Clicker/ |
| Tester | https://ki-king222.github.io/Bitcoin-Clicker/tools/tester.html |

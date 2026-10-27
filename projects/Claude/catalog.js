/* Katalog: 8 Kategorien x 10 Preisklassen. game = Ingame-Name (steht auf dem Modell), real = echtes Vorbild. */
export const CATS = {
  cpu: "CPU", gpu: "Grafikkarte", ram: "Arbeitsspeicher", ssd: "SSD", psu: "Netzteil", mobo: "Mainboard", cooler: "Kühler", case: "Gehäuse",
};
const L = (cat, rows) => rows.map(([game, real], i) => ({ id: `${cat}-${i + 1}`, cat, tier: i + 1, game, real }));

export const CATALOG = [
  ...L("cpu", [
    ["Axiom Pulse G2", "Intel Celeron / Pentium G"], ["Ember Spark 3K", "AMD Athlon 3000G"], ["Axiom Flux 3-1210", "Intel Core i3-12100"],
    ["Ember Pyra 5 5600", "AMD Ryzen 5 5600"], ["Axiom Flux 5-1340F", "Intel Core i5-13400F"], ["Ember Pyra 7 5700", "AMD Ryzen 7 5700"],
    ["Axiom Flux 7-1370K", "Intel Core i7-13700K"], ["Ember Pyra 9 7900", "AMD Ryzen 9 7900"], ["Axiom Flux 9-1490K", "Intel Core i9-14900K"],
    ["Ember Pyra 9 7950 3D", "AMD Ryzen 9 7950X3D"],
  ]),
  ...L("gpu", [
    ["Quanta Lite 1030", "NVIDIA GT 1030"], ["Ember Blaze 640", "AMD RX 6400"], ["Quanta Core 1650", "NVIDIA GTX 1650"],
    ["Ember Blaze 660", "AMD RX 6600"], ["Quanta Pro 3060", "NVIDIA RTX 3060"], ["Ember Blaze 760", "AMD RX 7600"],
    ["Quanta Pro 4070", "NVIDIA RTX 4070"], ["Ember Blaze 780 XT", "AMD RX 7800 XT"], ["Quanta Elite 4080", "NVIDIA RTX 4080"],
    ["Quanta Titan 4090", "NVIDIA RTX 4090"],
  ]),
  ...L("ram", [
    ["Generic DDR4 8GB 2666", "DDR4-2666 8 GB"], ["Kinetic Value 16GB 3200", "Budget DDR4-3200 16 GB"], ["Stormbyte Raider 16GB", "Gaming DDR4 16 GB"],
    ["Kinetic Blade 32GB", "Performance 32 GB"], ["Stormbyte Overlord 32GB", "High-End 32 GB"], ["Kinetic Tempest 32GB", "DDR5 32 GB"],
    ["Stormbyte Overlord 64GB", "64 GB Kit"], ["Kinetic Tempest 5 64GB", "DDR5 64 GB"], ["Stormbyte Overlord RGB 64GB", "RGB 64 GB"],
    ["Kinetic Tempest 5 RGB 96GB", "DDR5 RGB ~96 GB"],
  ]),
  ...L("ssd", [
    ["Generic SATA 256GB", "SATA 256 GB"], ["Kinetic N2 500GB", "NVMe Entry 500 GB"], ["Lumen L870 1TB", "Samsung 870 EVO-Stil"],
    ["Stratum S570 1TB", "WD SN570-Stil"], ["Lumen L980 1TB", "Samsung 980-Stil"], ["Stratum S770 2TB", "WD SN770-Stil"],
    ["Lumen L980 Pro 2TB", "Samsung 980 PRO-Stil"], ["Stratum FireDrake 2TB", "FireCuda-Stil"], ["Lumen L990 Pro 2TB", "Samsung 990 PRO-Stil"],
    ["Stratum S850X 4TB", "WD SN850X-Stil"],
  ]),
  ...L("psu", [
    ["Generic 450W Bronze", "450 W Bronze"], ["Ampera A550", "~550 W Budget"], ["Hushwatt Silent Core 450", "be quiet! Pure Power"],
    ["Seraph Focus 650", "Seasonic Focus 650 W"], ["Ampera R750", "750 W Gold"], ["Hushwatt Silent Pro 750", "be quiet! Straight Power"],
    ["Seraph Prime 850", "Seasonic Prime 850 W"], ["Ampera H1000", "1000 W"], ["Seraph Prime 1000", "Seasonic Prime 1000 W"],
    ["Ampera X1600", "~1600 W Extreme"],
  ]),
  ...L("mobo", [
    ["Generic H6 Board", "H610"], ["Basalt B5M Pro", "B550M / B560M"], ["Nebulon B6 Hawk", "B660 Gaming"], ["Forgeline B6 Gaming", "B650 / B760 Gaming"],
    ["Titanix Rugged B7", "B760 / B650"], ["Nebulon X6 Max", "X670 / Z690"], ["Titanix Phantom B6", "B650 Phantom"],
    ["Forgeline X6E Falcon", "X670E"], ["Titanix Apex Z7", "Z790 Apex"], ["Titanix Summit X6E", "X670E / Z790 Flagship"],
  ]),
  ...L("cooler", [
    ["Stock Boxed Cooler", "Stock-Kühler"], ["Icewing FK400", "Tower ~400"], ["Hushwatt Pure Stone 2", "be quiet! Pure Rock 2"],
    ["Nocturne U12S", "Noctua NH-U12S"], ["Hushwatt Dark Stone 4", "be quiet! Dark Rock 4"], ["Nocturne T15", "Noctua NH-D15"],
    ["Icewing Cryo Flow II 240", "240 mm AIO"], ["Abyssal AIO 240 RGB", "240 mm AIO RGB"], ["Abyssal Leviathan 360", "360 mm AIO"],
    ["Abyssal AIO 360 Elite", "360 mm AIO Elite"],
  ]),
  ...L("case", [
    ["Generic Mini Tower", "Mini-Tower Budget"], ["Fjordic Core 1", "Fractal Core"], ["Prisma H5", "NZXT H5"], ["Corvus 4K Airflow", "Corsair 4000D Airflow"],
    ["Fjordic Meshline C", "Fractal Meshify C"], ["Lumio Coolant 2", "Lian Li Lancool"], ["Corvus 5K Airflow", "Corsair 5000D Airflow"],
    ["Lumio Orbit Dynamic", "Lian Li O11 Dynamic"], ["Fjordic Torrento", "Fractal Torrent"], ["Lumio Orbit Evo RGB", "Lian Li O11 Evo RGB"],
  ]),
];
export const byId = (id) => CATALOG.find((e) => e.id === id);
/** Erstes Wort des Ingame-Namens = Marke */
export const brandOf = (e) => e.game.split(" ")[0];

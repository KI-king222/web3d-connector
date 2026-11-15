/* Katalog: 8 Kategorien x 10 Preisklassen. game = Ingame-Name (steht auf dem Modell), real = nur noch eine neutrale Klassenbezeichnung (keine echten Marken- oder Produktnamen). */
export const CATS = {
  cpu: "CPU", gpu: "Grafikkarte", ram: "Arbeitsspeicher", ssd: "SSD", psu: "Netzteil", mobo: "Mainboard", cooler: "Kühler", case: "Gehäuse",
};
const CLASSES = ["Einsteiger", "Einsteiger Plus", "Budget", "Budget Plus", "Mittelklasse", "Mittelklasse Plus", "Oberklasse", "Oberklasse Plus", "High-End", "Flaggschiff"];
const L = (cat, rows) => rows.map((game, i) => ({ id: `${cat}-${i + 1}`, cat, tier: i + 1, game, real: CLASSES[i] }));

export const CATALOG = [
  ...L("cpu", [
    "Axiom Pulse G2", "Ember Spark 3K", "Axiom Flux 3-1210", "Ember Pyra 5 5600", "Axiom Flux 5-1340F",
    "Ember Pyra 7 5700", "Axiom Flux 7-1370K", "Ember Pyra 9 7900", "Axiom Flux 9-1490K", "Ember Pyra 9 7950 3D",
  ]),
  ...L("gpu", [
    "Quanta Lite 1030", "Ember Blaze 640", "Quanta Core 1650", "Ember Blaze 660", "Quanta Pro 3060",
    "Ember Blaze 760", "Quanta Pro 4070", "Ember Blaze 780 XT", "Quanta Elite 4080", "Quanta Titan 4090",
  ]),
  ...L("ram", [
    "Generic DDR4 8GB 2666", "Kinetic Value 16GB 3200", "Stormbyte Raider 16GB", "Kinetic Blade 32GB", "Stormbyte Overlord 32GB",
    "Kinetic Tempest 32GB", "Stormbyte Overlord 64GB", "Kinetic Tempest 5 64GB", "Stormbyte Overlord RGB 64GB", "Kinetic Tempest 5 RGB 96GB",
  ]),
  ...L("ssd", [
    "Generic SATA 256GB", "Kinetic N2 500GB", "Lumen L870 1TB", "Stratum S570 1TB", "Lumen L980 1TB",
    "Stratum S770 2TB", "Lumen L980 Pro 2TB", "Stratum FireDrake 2TB", "Lumen L990 Pro 2TB", "Stratum S850X 4TB",
  ]),
  ...L("psu", [
    "Generic 450W Bronze", "Ampera A550", "Hushwatt Silent Core 450", "Seraph Focus 650", "Ampera R750",
    "Hushwatt Silent Pro 750", "Seraph Prime 850", "Ampera H1000", "Seraph Prime 1000", "Ampera X1600",
  ]),
  ...L("mobo", [
    "Generic H6 Board", "Basalt B5M Pro", "Nebulon B6 Hawk", "Forgeline B6 Gaming", "Titanix Rugged B7",
    "Nebulon X6 Max", "Titanix Phantom B6", "Forgeline X6E Falcon", "Titanix Apex Z7", "Titanix Summit X6E",
  ]),
  ...L("cooler", [
    "Stock Boxed Cooler", "Icewing FK400", "Hushwatt Pure Stone 2", "Nocturne U12S", "Hushwatt Dark Stone 4",
    "Nocturne T15", "Icewing Cryo Flow II 240", "Abyssal AIO 240 RGB", "Abyssal Leviathan 360", "Abyssal AIO 360 Elite",
  ]),
  ...L("case", [
    "Generic Mini Tower", "Fjordic Core 1", "Prisma H5", "Corvus 4K Airflow", "Fjordic Meshline C",
    "Lumio Coolant 2", "Corvus 5K Airflow", "Lumio Orbit Dynamic", "Fjordic Torrento", "Lumio Orbit Evo RGB",
  ]),
];
export const byId = (id) => CATALOG.find((e) => e.id === id);
/** Erstes Wort des Ingame-Namens = Marke */
export const brandOf = (e) => e.game.split(" ")[0];

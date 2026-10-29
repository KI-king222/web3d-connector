/* data.js — Upgrades, Teile, Übersetzungen, State, Cheats */


var KEY = "hashpool-save-v2";

  var ACCT_KEY = "hashpool-accounts-v1";

  var KEY = "hashpool-save-v2";
var ACCT_KEY = "hashpool-accounts-v1";
var UPGRADES = [
    {id:"usb", base:15,  hr:0.08, icon:"🔌",
      name:{en:"USB Miner", de:"USB-Miner"},
      desc:{en:"A novelty stick that gets warm.", de:"Ein Spielzeug-Stick, der warm wird."}},
    {id:"gpu", base:160, hr:0.55, icon:"🖥️",
      name:{en:"GPU Rig", de:"GPU-Rig"},
      desc:{en:"One graphics card, six fans.", de:"Eine Grafikkarte, sechs Lüfter."}},
    {id:"fpga",base:1400, hr:3.5, icon:"🧩",
      name:{en:"FPGA Board", de:"FPGA-Board"},
      desc:{en:"Purpose-built silicon, quiet and cold.", de:"Speziell gebauter Chip, leise und kühl."}},
    {id:"asic",base:11000, hr:22, icon:"📦",
      name:{en:"ASIC Unit", de:"ASIC-Einheit"},
      desc:{en:"Sounds like a jet engine. Mines like one too.", de:"Klingt wie ein Düsentriebwerk. Mint auch wie eins."}},
    {id:"farm",base:85000, hr:140, icon:"🏭",
      name:{en:"Container Farm", de:"Container-Farm"},
      desc:{en:"A shipping container full of ASICs.", de:"Ein Schiffscontainer voller ASICs."}},
    {id:"plant",base:650000, hr:900, icon:"☀️",
      name:{en:"Solar Mining Plant", de:"Solar-Miningpark"},
      desc:{en:"Your own power grid, dedicated to hashes.", de:"Dein eigenes Stromnetz, nur für Hashes."}}
  ];

  var CLICK_UPGRADES = [
    {id:"pick", base:35, mult:1.35, icon:"⛏️",
      name:{en:"Sharper Pickaxe", de:"Schärfere Spitzhacke"},
      desc:{en:"Cuts through hashes a bit faster.", de:"Schneidet etwas schneller durch Hashes."}},
    {id:"cool", base:480, mult:1.5, icon:"❄️",
      name:{en:"Liquid Cooling", de:"Wasserkühlung"},
      desc:{en:"Overclock without melting anything.", de:"Übertakten, ohne dass etwas schmilzt."}},
    {id:"asicpen", base:5500, mult:1.75, icon:"🖊️",
      name:{en:"ASIC Pen", de:"ASIC-Stift"},
      desc:{en:"A handheld chip, just for tapping.", de:"Ein Handheld-Chip, nur zum Tippen."}},
    {id:"quantum", base:75000, mult:2.1, icon:"✨",
      name:{en:"Quantum Tap", de:"Quanten-Tap"},
      desc:{en:"Mines a little bit of tomorrow too.", de:"Mint ein bisschen von morgen mit."}}
  ];

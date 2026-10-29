/* partCatalog.js — fictional brands & models (same tiers/stats as real-world counterparts, no real trademarks) */
var PART_CATALOG={
"cpu":{"name":{"en":"CPU","de":"CPU"},"icon":"⚙️","items":[
{"id":"cpu-1","brand":"Axiom","model":"Pulse G2","power":2,"efficiency":7,"value":9,"cost":400,"tier":1},
{"id":"cpu-2","brand":"Ember","model":"Spark 3K","power":3,"efficiency":7,"value":8,"cost":650,"tier":2},
{"id":"cpu-3","brand":"Axiom","model":"Flux 3-1210","power":4,"efficiency":8,"value":9,"cost":1200,"tier":3},
{"id":"cpu-4","brand":"Ember","model":"Pyra 5 5600","power":6,"efficiency":8,"value":9,"cost":2200,"tier":4},
{"id":"cpu-5","brand":"Axiom","model":"Flux 5-1340F","power":7,"efficiency":7,"value":8,"cost":3500,"tier":5},
{"id":"cpu-6","brand":"Ember","model":"Pyra 7 5700","power":8,"efficiency":8,"value":8,"cost":5200,"tier":6},
{"id":"cpu-7","brand":"Axiom","model":"Flux 7-1370K","power":9,"efficiency":6,"value":6,"cost":8500,"tier":7},
{"id":"cpu-8","brand":"Ember","model":"Pyra 9 7900","power":9,"efficiency":7,"value":5,"cost":12000,"tier":8},
{"id":"cpu-9","brand":"Axiom","model":"Flux 9-1490K","power":10,"efficiency":5,"value":4,"cost":16000,"tier":9},
{"id":"cpu-10","brand":"Ember","model":"Pyra 9 7950 3D","power":10,"efficiency":7,"value":4,"cost":22000,"tier":10}]},
"gpu":{"name":{"en":"Graphics Card","de":"Grafikkarte"},"icon":"🎮","items":[
{"id":"gpu-1","brand":"Quanta","model":"Lite 1030","power":2,"efficiency":8,"value":9,"cost":500,"tier":1},
{"id":"gpu-2","brand":"Ember","model":"Blaze 640","power":3,"efficiency":8,"value":8,"cost":900,"tier":2},
{"id":"gpu-3","brand":"Quanta","model":"Core 1650","power":4,"efficiency":7,"value":8,"cost":1600,"tier":3},
{"id":"gpu-4","brand":"Ember","model":"Blaze 660","power":6,"efficiency":8,"value":9,"cost":3200,"tier":4},
{"id":"gpu-5","brand":"Quanta","model":"Pro 3060","power":7,"efficiency":7,"value":8,"cost":4800,"tier":5},
{"id":"gpu-6","brand":"Ember","model":"Blaze 760","power":7,"efficiency":8,"value":8,"cost":6500,"tier":6},
{"id":"gpu-7","brand":"Quanta","model":"Pro 4070","power":8,"efficiency":8,"value":7,"cost":9500,"tier":7},
{"id":"gpu-8","brand":"Ember","model":"Blaze 780 XT","power":9,"efficiency":7,"value":6,"cost":13000,"tier":8},
{"id":"gpu-9","brand":"Quanta","model":"Elite 4080","power":9,"efficiency":7,"value":5,"cost":18000,"tier":9},
{"id":"gpu-10","brand":"Quanta","model":"Titan 4090","power":10,"efficiency":6,"value":4,"cost":28000,"tier":10}]},
"ram":{"name":{"en":"RAM","de":"RAM"},"icon":"💾","items":[
{"id":"ram-1","brand":"Generic","model":"DDR4 8GB 2666","power":2,"efficiency":8,"value":9,"cost":300,"tier":1},
{"id":"ram-2","brand":"Kinetic","model":"Value 16GB 3200","power":3,"efficiency":8,"value":9,"cost":550,"tier":2},
{"id":"ram-3","brand":"Stormbyte","model":"Raider 16GB","power":5,"efficiency":7,"value":8,"cost":900,"tier":3},
{"id":"ram-4","brand":"Kinetic","model":"Blade 32GB","power":6,"efficiency":7,"value":8,"cost":1400,"tier":4},
{"id":"ram-5","brand":"Stormbyte","model":"Overlord 32GB","power":7,"efficiency":7,"value":7,"cost":2000,"tier":5},
{"id":"ram-6","brand":"Kinetic","model":"Tempest 32GB","power":8,"efficiency":6,"value":7,"cost":2800,"tier":6},
{"id":"ram-7","brand":"Stormbyte","model":"Overlord 64GB","power":8,"efficiency":6,"value":6,"cost":4000,"tier":7},
{"id":"ram-8","brand":"Kinetic","model":"Tempest 5 64GB","power":9,"efficiency":6,"value":5,"cost":5500,"tier":8},
{"id":"ram-9","brand":"Stormbyte","model":"Overlord RGB 64GB","power":9,"efficiency":5,"value":5,"cost":7000,"tier":9},
{"id":"ram-10","brand":"Kinetic","model":"Tempest 5 RGB 96GB","power":10,"efficiency":5,"value":4,"cost":9500,"tier":10}]},
"ssd":{"name":{"en":"SSD","de":"SSD"},"icon":"💽","items":[
{"id":"ssd-1","brand":"Generic","model":"SATA 256GB","power":2,"efficiency":8,"value":9,"cost":250,"tier":1},
{"id":"ssd-2","brand":"Kinetic","model":"N2 500GB","power":3,"efficiency":8,"value":9,"cost":450,"tier":2},
{"id":"ssd-3","brand":"Lumen","model":"L870 1TB","power":5,"efficiency":8,"value":8,"cost":800,"tier":3},
{"id":"ssd-4","brand":"Stratum","model":"S570 1TB","power":6,"efficiency":8,"value":8,"cost":1100,"tier":4},
{"id":"ssd-5","brand":"Lumen","model":"L980 1TB","power":7,"efficiency":7,"value":7,"cost":1500,"tier":5},
{"id":"ssd-6","brand":"Stratum","model":"S770 2TB","power":7,"efficiency":7,"value":7,"cost":2200,"tier":6},
{"id":"ssd-7","brand":"Lumen","model":"L980 Pro 2TB","power":8,"efficiency":7,"value":6,"cost":3200,"tier":7},
{"id":"ssd-8","brand":"Stratum","model":"FireDrake 2TB","power":8,"efficiency":6,"value":6,"cost":4000,"tier":8},
{"id":"ssd-9","brand":"Lumen","model":"L990 Pro 2TB","power":9,"efficiency":6,"value":5,"cost":5200,"tier":9},
{"id":"ssd-10","brand":"Stratum","model":"S850X 4TB","power":10,"efficiency":6,"value":4,"cost":7500,"tier":10}]},
"psu":{"name":{"en":"Power Supply","de":"Netzteil"},"icon":"🔋","items":[
{"id":"psu-1","brand":"Generic","model":"450W Bronze","power":2,"efficiency":6,"value":9,"cost":350,"tier":1},
{"id":"psu-2","brand":"Ampera","model":"A550","power":3,"efficiency":7,"value":8,"cost":550,"tier":2},
{"id":"psu-3","brand":"Hushwatt","model":"Silent Core 450","power":4,"efficiency":7,"value":8,"cost":750,"tier":3},
{"id":"psu-4","brand":"Seraph","model":"Focus 650","power":6,"efficiency":8,"value":8,"cost":1200,"tier":4},
{"id":"psu-5","brand":"Ampera","model":"R750","power":7,"efficiency":8,"value":7,"cost":1600,"tier":5},
{"id":"psu-6","brand":"Hushwatt","model":"Silent Pro 750","power":7,"efficiency":8,"value":7,"cost":2000,"tier":6},
{"id":"psu-7","brand":"Seraph","model":"Prime 850","power":8,"efficiency":9,"value":6,"cost":2800,"tier":7},
{"id":"psu-8","brand":"Ampera","model":"H1000","power":9,"efficiency":9,"value":5,"cost":3800,"tier":8},
{"id":"psu-9","brand":"Seraph","model":"Prime 1000","power":9,"efficiency":9,"value":5,"cost":4800,"tier":9},
{"id":"psu-10","brand":"Ampera","model":"X1600","power":10,"efficiency":9,"value":4,"cost":6500,"tier":10}]},
"mobo":{"name":{"en":"Motherboard","de":"Mainboard"},"icon":"🧩","items":[
{"id":"mobo-1","brand":"Generic","model":"H6 Board","power":2,"efficiency":7,"value":9,"cost":400,"tier":1},
{"id":"mobo-2","brand":"Basalt","model":"B5M Pro","power":3,"efficiency":7,"value":8,"cost":700,"tier":2},
{"id":"mobo-3","brand":"Nebulon","model":"B6 Hawk","power":5,"efficiency":7,"value":8,"cost":1100,"tier":3},
{"id":"mobo-4","brand":"Forgeline","model":"B6 Gaming","power":6,"efficiency":7,"value":7,"cost":1600,"tier":4},
{"id":"mobo-5","brand":"Titanix","model":"Rugged B7","power":7,"efficiency":7,"value":7,"cost":2200,"tier":5},
{"id":"mobo-6","brand":"Nebulon","model":"X6 Max","power":7,"efficiency":6,"value":6,"cost":3000,"tier":6},
{"id":"mobo-7","brand":"Titanix","model":"Phantom B6","power":8,"efficiency":6,"value":6,"cost":4000,"tier":7},
{"id":"mobo-8","brand":"Forgeline","model":"X6E Falcon","power":9,"efficiency":6,"value":5,"cost":5200,"tier":8},
{"id":"mobo-9","brand":"Titanix","model":"Apex Z7","power":9,"efficiency":5,"value":5,"cost":7000,"tier":9},
{"id":"mobo-10","brand":"Titanix","model":"Summit X6E","power":10,"efficiency":5,"value":4,"cost":9000,"tier":10}]},
"cooler":{"name":{"en":"Cooler","de":"Kühler"},"icon":"❄️","items":[
{"id":"cooler-1","brand":"Stock","model":"Boxed Cooler","power":2,"efficiency":6,"value":9,"cost":100,"tier":1},
{"id":"cooler-2","brand":"Icewing","model":"FK400","power":3,"efficiency":7,"value":9,"cost":280,"tier":2},
{"id":"cooler-3","brand":"Hushwatt","model":"Pure Stone 2","power":4,"efficiency":8,"value":8,"cost":450,"tier":3},
{"id":"cooler-4","brand":"Nocturne","model":"U12S","power":6,"efficiency":9,"value":8,"cost":800,"tier":4},
{"id":"cooler-5","brand":"Hushwatt","model":"Dark Stone 4","power":7,"efficiency":9,"value":7,"cost":1100,"tier":5},
{"id":"cooler-6","brand":"Nocturne","model":"T15","power":8,"efficiency":9,"value":7,"cost":1500,"tier":6},
{"id":"cooler-7","brand":"Icewing","model":"Cryo Flow II 240","power":8,"efficiency":8,"value":7,"cost":1900,"tier":7},
{"id":"cooler-8","brand":"Abyssal","model":"AIO 240 RGB","power":9,"efficiency":8,"value":6,"cost":2500,"tier":8},
{"id":"cooler-9","brand":"Abyssal","model":"Leviathan 360","power":9,"efficiency":8,"value":5,"cost":3200,"tier":9},
{"id":"cooler-10","brand":"Abyssal","model":"AIO 360 Elite","power":10,"efficiency":8,"value":4,"cost":4200,"tier":10}]},
"case":{"name":{"en":"Case","de":"Gehäuse"},"icon":"🖥️","items":[
{"id":"case-1","brand":"Generic","model":"Mini Tower","power":2,"efficiency":7,"value":9,"cost":200,"tier":1},
{"id":"case-2","brand":"Fjordic","model":"Core 1","power":3,"efficiency":7,"value":8,"cost":400,"tier":2},
{"id":"case-3","brand":"Prisma","model":"H5","power":5,"efficiency":7,"value":8,"cost":700,"tier":3},
{"id":"case-4","brand":"Corvus","model":"4K Airflow","power":6,"efficiency":7,"value":7,"cost":1000,"tier":4},
{"id":"case-5","brand":"Fjordic","model":"Meshline C","power":7,"efficiency":8,"value":7,"cost":1400,"tier":5},
{"id":"case-6","brand":"Lumio","model":"Coolant 2","power":7,"efficiency":8,"value":7,"cost":1800,"tier":6},
{"id":"case-7","brand":"Corvus","model":"5K Airflow","power":8,"efficiency":8,"value":6,"cost":2400,"tier":7},
{"id":"case-8","brand":"Lumio","model":"Orbit Dynamic","power":9,"efficiency":7,"value":5,"cost":3200,"tier":8},
{"id":"case-9","brand":"Fjordic","model":"Torrento","power":9,"efficiency":8,"value":5,"cost":4000,"tier":9},
{"id":"case-10","brand":"Lumio","model":"Orbit Evo RGB","power":10,"efficiency":7,"value":4,"cost":5500,"tier":10}]}
};
var PART_CATEGORIES=Object.keys(PART_CATALOG);
var PART_BY_ID={};
PART_CATEGORIES.forEach(function(cat){PART_CATALOG[cat].items.forEach(function(it){PART_BY_ID[it.id]=Object.assign({cat:cat},it);});});
function partBaseName(it){return(it.brand?it.brand+' ':'')+it.model;}
function partLang(){try{if(typeof state!=='undefined'&&state&&state.lang)return state.lang==='de'?'de':'en';return(typeof navigator!=='undefined'&&/^de/i.test(navigator.language||''))?'de':'en';}catch(e){return'de';}}
function partDisplayName(it){return partBaseName(it)+' · '+partTierLabel(it,partLang());}
function partAvgScore(it){return Math.round((it.power+it.efficiency+it.value)/3*10)/10;}
var PART_TIER_LABELS={
 en:["Entry","Basic","Budget","Mainstream","Mainstream+","Performance","High-End","High-End+","Enthusiast","Flagship"],
 de:["Einsteiger","Basis","Budget","Mittelklasse","Mittelklasse+","Gehoben","High-End","High-End+","Enthusiast","Flaggschiff"]
};
function partTierLabel(it,lang){var l=PART_TIER_LABELS[lang]||PART_TIER_LABELS.de;return l[it.tier-1];}
function partTierBadge(it,lang){return 'T'+it.tier+' · '+partTierLabel(it,lang);}

/* PARTS.js — Modul 3/22 */

  var PARTS = [
    {id:"psu", icon:"🔋", base:280, name:{en:"Power Supply", de:"Netzteil"}},
    {id:"mobo", icon:"🧩", base:420, name:{en:"Motherboard", de:"Mainboard"}},
    {id:"cooler", icon:"❄️", base:320, name:{en:"Cooler", de:"Kühler"}},
    {id:"ram", icon:"💾", base:260, name:{en:"RAM", de:"RAM"}},
    {id:"ssd", icon:"💽", base:200, name:{en:"SSD", de:"SSD"}},
    {id:"cpu", icon:"⚙️", base:680, name:{en:"CPU", de:"CPU"}},
    {id:"gpu", icon:"🎮", base:1100, name:{en:"Graphics Card", de:"Grafikkarte"}}
  ];

  var PARTS_BY_ID = {};
  PARTS.forEach(function(p){ PARTS_BY_ID[p.id] = p; });

  var PART3D = {
    mobo:   { pos:[-0.3, 0,   -0.62] },
    cpu:    { pos:[-0.75, 0.85,-0.42] },
    ram:    { pos:[ 0.05, 0.85,-0.42] },
    ssd:    { pos:[-0.85,-0.55,-0.4] },
    cooler: { pos:[-0.75, 0.15,-0.3] },
    gpu:    { pos:[-0.45,-0.95,-0.35] },
    psu:    { pos:[ 1.0, -0.7,  0.0] }
  };
  var BENCH = { mobo: [2.6, -0.93, 0.2] };
  var camTarget = { x:0.95, y:0, z:12.5 };
  var framingDone = false, framingDoneCase = false;
  var moboCaseAnim = null;
  var autoRotate = true;

  var COL = {
    pcb:0x0c1116, chip:0x111417, gold:0xc9a227, silver:0xb8bec5,
    shroud:0x2b2f35, fanBlack:0x111417, psuMetal:0x4a4f57,
    frame:0x2a2e34, screw:0x585d63, ram1:0x1b3a4a, ram2:0x3a1b4a,
    rgb1:0x22d3ee, rgb2:0xa855f7
  };

  var scene3d, camera3d, renderer3d, rigGroup, partMeshes = {};
  var animQueue = {}, installedAnimated = {};
  var screwMeshes = {}, screwQueue = [];
  var cableMeshes = {}, rgbMeshes = [];
  var moboTexture = null;

  function mat(color, opts){
    opts = opts || {};
    var params = { color:color, roughness:opts.rough!==undefined?opts.rough:0.55, metalness:opts.metal!==undefined?opts.metal:0.2 };
    if(opts.map) params.map = opts.map;
    return new THREE.MeshStandardMaterial(params);
  }
  function glowMat(color, intensity){
    return new THREE.MeshStandardMaterial({ color:color, emissive:color, emissiveIntensity: intensity||1.1, roughness:0.4, metalness:0.1 });
  }

  function getMoboTexture(){
    if(moboTexture) return moboTexture;
    var c = document.createElement("canvas");
    c.width = 256; c.height = 480;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#0c1116"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#1f6b52"; ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
    for(var i=0;i<55;i++){
      var x = Math.random()*c.width, y = Math.random()*c.height;
      ctx.beginPath(); ctx.moveTo(x, y);
      var segs = 2 + Math.floor(Math.random()*3);
      for(var s=0;s<segs;s++){
        if(Math.random()<0.5) x += (Math.random()<0.5?1:-1) * (10 + Math.random()*36);
        else y += (Math.random()<0.5?1:-1) * (10 + Math.random()*36);
        x = Math.max(4, Math.min(c.width-4, x));
        y = Math.max(4, Math.min(c.height-4, y));
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for(var j=0;j<10;j++){
      ctx.fillStyle = "#c9a227";
      var px = 12 + Math.random()*(c.width-24), py = 12 + Math.random()*(c.height-24);
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI*2); ctx.fill();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    moboTexture = tex;
    return tex;
  }

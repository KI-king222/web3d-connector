/* parts3d/assemble.js — Kompatibilität, Zusammenbau, Kabel (Claude + HASHPOOL-Kabel) */
(function(){
  if(typeof THREE === "undefined"){ console.warn("[assemble] THREE missing"); return; }
  var Ports = (window.Parts3D && Parts3D.Ports) || null;

  function metaOf(id){
    var it = (typeof PART_BY_ID !== "undefined" && PART_BY_ID[id]) ? PART_BY_ID[id] : null;
    var tier = it ? (Number(it.tier)||1) : parseInt(String(id).split("-")[1],10)||1;
    var cat = String(id).split("-")[0];
    var m = { id:id, cat:cat, tier:tier };
    if(cat==="cpu"){
      var brand = it && it.brand;
      if(brand==="Ember" || /Pyra|Spark/.test((it&&it.model)||"")) m.socket = tier>=8 ? "am5" : "am4";
      else m.socket = tier>=3 ? "lga1700" : "lga1200";
    }
    if(cat==="mobo"){
      if(tier<=1){ m.form="matx"; m.socket="lga1200"; m.ddr=4; m.dimm=2; m.m2=1; }
      else if(tier===2){ m.form="matx"; m.socket="am4"; m.ddr=4; m.dimm=4; m.m2=1; }
      else if(tier<=5){ m.form="atx"; m.socket = tier%2? "lga1700":"am4"; m.ddr=4; m.dimm=4; m.m2=2; }
      else if(tier<=7){ m.form="atx"; m.socket = tier%2? "lga1700":"am5"; m.ddr=5; m.dimm=4; m.m2=2; }
      else { m.form="atx"; m.socket = tier%2? "lga1700":"am5"; m.ddr=5; m.dimm=4; m.m2=3; }
    }
    if(cat==="ram"){ m.ddr = tier>=6 ? 5 : 4; m.sticks = tier<=2?1:2; }
    if(cat==="cooler"){
      m.sockets = ["am4","am5","lga1700","lga1200"];
      m.kind = tier>=7 ? "aio" : "air";
      m.rad = tier>=9 ? 360 : (tier>=7 ? 240 : 0);
    }
    if(cat==="case"){
      m.forms = tier<=2 ? ["itx","matx"] : (tier<=4 ? ["itx","matx","atx"] : ["itx","matx","atx"]);
      m.radMax = tier<=3 ? 0 : (tier<=6 ? 240 : 360);
      m.psuForms = ["atx"];
    }
    if(cat==="psu"){ m.form="atx"; }
    if(cat==="ssd"){ m.kind = tier===1 || (it&&/SATA/i.test(it.model||"")) ? "sata" : "m2"; }
    if(cat==="gpu"){ m.needsPcie16=true; }
    if(it){
      if(it.socket) m.socket=it.socket;
      if(it.form) m.form=it.form;
      if(it.ddr) m.ddr=it.ddr;
      if(it.forms) m.forms=it.forms;
      if(it.radMax!=null) m.radMax=it.radMax;
    }
    return m;
  }

  function compat(spec){
    var errors=[], warnings=[];
    function err(part,msg){ errors.push({part:part,msg:msg}); }
    var c=spec.case&&metaOf(spec.case), mb=spec.mobo&&metaOf(spec.mobo), cp=spec.cpu&&metaOf(spec.cpu);
    var co=spec.cooler&&metaOf(spec.cooler), rm=spec.ram&&metaOf(spec.ram), gp=spec.gpu&&metaOf(spec.gpu);
    var ps=spec.psu&&metaOf(spec.psu);
    if(mb&&cp && mb.socket!==cp.socket)
      err(spec.cpu, "CPU-Sockel "+String(cp.socket).toUpperCase()+" passt nicht auf Mainboard-Sockel "+String(mb.socket).toUpperCase());
    if(cp&&co && co.sockets && co.sockets.indexOf(cp.socket)<0)
      err(spec.cooler, "Kuehler unterstuetzt Sockel "+String(cp.socket).toUpperCase()+" nicht");
    if(mb&&rm && mb.ddr!==rm.ddr)
      err(spec.ram, "DDR"+rm.ddr+"-Speicher passt nicht in DDR"+mb.ddr+"-Slots");
    if(c&&mb && c.forms && c.forms.indexOf(mb.form)<0)
      err(spec.mobo, "Formfaktor "+mb.form+" passt nicht ins Gehaeuse");
    if(c&&ps && c.psuForms && c.psuForms.indexOf(ps.form)<0)
      err(spec.psu, "Netzteil-Formfaktor passt nicht");
    if(c&&co && co.kind==="aio"){
      if(!c.radMax) err(spec.cooler, "Gehaeuse hat keinen Radiatorplatz");
      else if(co.rad>c.radMax) err(spec.cooler, co.rad+" mm Radiator passt nicht (max. "+c.radMax+" mm)");
    }
    var ss=[].concat(spec.ssd||[]);
    if(mb&&ss.length){
      var m2=0,sata=0;
      ss.forEach(function(id){ var x=metaOf(id); if(x.kind==="m2") m2++; else sata++; });
      if(m2>(mb.m2||1)) err(ss[0], "Nur "+(mb.m2||1)+" M.2-Slots vorhanden");
      if(sata>2) err(ss[0], "Nur 2 SATA-Schaechte im Gehaeuse");
    }
    return { errors:errors, warnings:warnings, ok: errors.length===0 };
  }

  function mat(c,o){ o=o||{}; return new THREE.MeshStandardMaterial({color:c,metalness:o.metal||0.1,roughness:o.rough!=null?o.rough:0.7}); }
  function cable(pts, color, r){
    var curve=new THREE.CatmullRomCurve3(pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);}));
    return new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r||0.03, 6, false), mat(color||0x151518));
  }
  function bundle(pts, colors, off, r){
    var g=new THREE.Group(); off=off||[0,0,0.034]; r=r||0.017;
    colors.forEach(function(col,i){
      var k=i-(colors.length-1)/2;
      g.add(cable(pts.map(function(p){return[p[0]+off[0]*k,p[1]+off[1]*k,p[2]+off[2]*k];}), col, r));
    });
    return g;
  }

  function addSystemCables(root, L){
    L = L || (window.Parts3D && Parts3D.LAYOUT) || {};
    var mob = L.caseMobo || [-1.92, 1.00, 0.05];
    var gpu = L.gpu || [-2.35, -0.40, 0.12];
    var psu = L.psu || [-2.40, -0.95, 0.20];
    var g = new THREE.Group(); g.name = "systemCables";
    g.add(bundle([
      [psu[0]+0.15, psu[1]+0.2, psu[2]],
      [psu[0]+0.3, psu[1]+0.5, psu[2]+0.3],
      [mob[0]+0.4, mob[1]+0.1, mob[2]+0.5],
      [mob[0]+0.55, mob[1]+0.05, mob[2]+0.2]
    ], [0x141417,0x141417,0x1d1d22], [0,0,0.025], 0.018));
    g.add(bundle([
      [psu[0]+0.1, psu[1]+0.25, psu[2]-0.1],
      [psu[0]-0.2, psu[1]+0.8, psu[2]-0.4],
      [mob[0]-0.3, mob[1]+0.6, mob[2]-0.3],
      [mob[0]-0.15, mob[1]+0.35, mob[2]-0.15]
    ], [0x141417,0x1d1d22], [0,0,0.03], 0.016));
    g.add(cable([
      [psu[0]+0.2, psu[1]+0.15, psu[2]+0.1],
      [gpu[0]+0.3, gpu[1]-0.2, gpu[2]],
      [gpu[0]+0.1, gpu[1]+0.05, gpu[2]+0.15],
      [gpu[0]-0.05, gpu[1]+0.15, gpu[2]+0.2]
    ], 0x141417, 0.022));
    g.add(cable([
      [mob[0]+0.2, mob[1]-0.1, mob[2]+0.4],
      [mob[0]+0.5, mob[1]-0.3, mob[2]+0.6],
      [psu[0]+0.5, psu[1]+0.4, psu[2]+0.5]
    ], 0xc0392b, 0.012));
    root.add(g);
    return g;
  }

  function buildAssembledPC(spec, opts){
    opts = opts || {};
    spec = spec || {};
    if(!spec.case && typeof state!=="undefined" && state.buildPick){
      var bp=state.buildPick;
      spec={ case:bp.case, mobo:bp.mobo, cpu:bp.cpu, cooler:bp.cooler, ram:bp.ram, gpu:bp.gpu, psu:bp.psu, ssd:bp.ssd?[].concat(bp.ssd):[] };
    }
    var report = compat(spec);
    if(!report.ok && !opts.force){
      return { group:new THREE.Group(), report:report, parts:[], spec:spec };
    }
    var root = new THREE.Group();
    var L = (window.Parts3D && Parts3D.LAYOUT) || {};
    var pick = function(cat){
      if(window.Parts3D && Parts3D.pickInfo) return Parts3D.pickInfo(cat);
      return { id: spec[cat]||"", tier:3 };
    };
    function addBuilt(builder, cat, pos, rotY){
      if(!builder) return null;
      var info = pick(cat);
      if(spec[cat]) info.id = spec[cat];
      var mesh;
      try{ mesh = builder(info); }catch(e){ try{ mesh = builder(info.tier||3); }catch(e2){ return null; } }
      if(!mesh) return null;
      if(pos) mesh.position.set(pos[0],pos[1],pos[2]);
      if(rotY!=null) mesh.rotation.y = rotY;
      root.add(mesh);
      return mesh;
    }
    if(Parts3D.buildFrame) root.add(Parts3D.buildFrame());
    var mobPos = L.caseMobo || [-1.92,1,0.05];
    if(typeof buildMobo==="function") addBuilt(function(i){return buildMobo(i);},"mobo",mobPos);
    else if(Parts3D.buildMobo) addBuilt(Parts3D.buildMobo,"mobo",mobPos);
    if(Parts3D.buildCpu) addBuilt(Parts3D.buildCpu,"cpu",[mobPos[0],mobPos[1]+0.08,mobPos[2]]);
    if(Parts3D.buildCooler) addBuilt(Parts3D.buildCooler,"cooler",[mobPos[0],mobPos[1]+0.22,mobPos[2]]);
    if(Parts3D.buildRam) addBuilt(Parts3D.buildRam,"ram",[mobPos[0]+0.35,mobPos[1]+0.12,mobPos[2]]);
    var gpuPos = L.gpu || [-2.35,-0.4,0.12];
    if(Parts3D.buildGpu) addBuilt(Parts3D.buildGpu,"gpu",gpuPos);
    var psuPos = L.psu || [-2.4,-0.95,0.2];
    if(Parts3D.buildPsu) addBuilt(Parts3D.buildPsu,"psu",psuPos, L.psuRotY);
    if(Parts3D.buildSsd) addBuilt(Parts3D.buildSsd,"ssd",[mobPos[0],mobPos[1]+0.05,mobPos[2]-0.35]);
    if(opts.cables !== false) addSystemCables(root, L);
    var group = new THREE.Group(); group.add(root);
    return { group:group, root:root, report:report, spec:spec, ok:report.ok };
  }

  function specFromBuildPick(){
    if(typeof state==="undefined"||!state.buildPick) return {};
    var b=state.buildPick, s={};
    ["case","mobo","cpu","cooler","ram","gpu","psu"].forEach(function(k){ if(b[k]) s[k]=b[k]; });
    if(b.ssd) s.ssd=[].concat(b.ssd);
    return s;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.compat = compat;
  window.Parts3D.metaOf = metaOf;
  window.Parts3D.buildAssembledPC = buildAssembledPC;
  window.Parts3D.addSystemCables = addSystemCables;
  window.Parts3D.specFromBuildPick = specFromBuildPick;
  console.log("[HASHPOOL] assemble.js ready (compat + cables)");
})();

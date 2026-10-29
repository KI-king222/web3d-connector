/* BUILDERS.js — Modul 6/22 */

  var BUILDERS = { mobo:buildMobo, cpu:buildCpu, ram:buildRam, ssd:buildSsd, cooler:buildCooler, gpu:buildGpu, psu:buildPsu };

  function makeCable(p1, p2, sag, color, radius){
    var mid = new THREE.Vector3(
      (p1[0]+p2[0])/2 + (sag?sag[0]:0),
      (p1[1]+p2[1])/2 + (sag?sag[1]:0.15),
      (p1[2]+p2[2])/2 + (sag?sag[2]:0.3)
    );
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(p1[0],p1[1],p1[2]), mid, new THREE.Vector3(p2[0],p2[1],p2[2])
    ]);
    var geo = new THREE.TubeGeometry(curve, 20, radius||0.028, 6, false);
    return new THREE.Mesh(geo, mat(color, {rough:0.55, metal:0.1}));
  }

  var CABLES = {
    mainPower: { needs:["psu","moboCase"], from:[0.75,-0.5,0.2], to:[0.35,1.35,-0.58], sag:[0.25,0.1,0.5], color:0x17181a, r:0.032, icon:"🔌", labelKey:"cableMain" },
    cpuPower:  { needs:["psu","cpu"],  from:[0.75,-0.35,-0.15], to:[-0.7,1.55,-0.55], sag:[0.05,0.55,0.3], color:0x17181a, r:0.026, icon:"🔌", labelKey:"cableCpu" },
    gpuPower:  { needs:["psu","gpu"],  from:[0.7,-0.6,0.15], to:[-0.1,-0.75,-0.25], sag:[0.2,-0.15,0.4], color:0x111214, r:0.026, icon:"🔌", labelKey:"cableGpu" },
    fanCable:  { needs:["cooler","moboCase"], from:[-0.75,0.42,0.0], to:[-0.55,0.55,-0.58], sag:[0.05,0.2,0.1], color:0x0d0f11, r:0.016, icon:"🧷", labelKey:"cableFan" },
    frontPanel:{ needs:["moboCase"], from:[-1.3,-1.5,0.75], to:[-0.9,-0.9,-0.58], sag:[-0.1,-0.3,0.3], color:0x0d0f11, r:0.016, icon:"🔘", labelKey:"cableFront" }
  };

  function recomputeCables(){
    if(!rigGroup) return;
    Object.keys(CABLES).forEach(function(key){
      var cfg = CABLES[key];
      var partsReady = cfg.needs.every(function(id){ return id === "moboCase" ? !!state.moboCased : !!state.buildInstalled[id]; });
      var want = state.buildMode === "detailed" ? (partsReady && !!state.buildCablesDone[key]) : partsReady;
      if(want && !cableMeshes[key]){
        var m = makeCable(cfg.from, cfg.to, cfg.sag, cfg.color, cfg.r);
        rigGroup.add(m);
        cableMeshes[key] = m;
      } else if(!want && cableMeshes[key]){
        rigGroup.remove(cableMeshes[key]);
        delete cableMeshes[key];
      }
    });
    updateSockets();
  }
  var socketMeshes = {};
  function buildSockets(){
    Object.keys(CABLES).forEach(function(key){
      var cfg = CABLES[key];
      var g = new THREE.Group();
      var base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.05), mat(0x0a0c0e, {rough:0.5}));
      g.add(base);
      for(var i=0;i<4;i++){
        var pin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat(COL.gold, {metal:0.8, rough:0.3}));
        pin.position.set(-0.066 + i*0.044, 0, 0.03); g.add(pin);
      }
      var halo = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 8, 28), glowMat(0xf7931a, 1.2));
      halo.position.z = 0.04; g.add(halo);
      g.userData.halo = halo;
      g.position.set(cfg.to[0], cfg.to[1], cfg.to[2] + 0.03);
      g.visible = false;
      rigGroup.add(g);
      socketMeshes[key] = g;
    });
  }
  function updateSockets(){
    Object.keys(socketMeshes).forEach(function(key){
      var cfg = CABLES[key];
      var ready = cfg.needs.every(function(id){ return id === "moboCase" ? !!state.moboCased : !!state.buildInstalled[id]; });
      socketMeshes[key].visible = state.buildMode === "detailed" && ready && !state.buildCablesDone[key] && allInstalled();
    });
  }
  function removeAllCables(){
    Object.keys(cableMeshes).forEach(function(key){ rigGroup.remove(cableMeshes[key]); });
    cableMeshes = {};
  }

  function buildFrame(){
    var g = new THREE.Group();
    var fmat = mat(COL.frame, {metal:0.6, rough:0.4});
    var xs = [-1.5, 1.5], zs = [-0.8, 0.8];
    xs.forEach(function(x){ zs.forEach(function(z){
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.06), fmat);
      post.position.set(x, 0, z); g.add(post);
    }); });
    [1.7, -1.7].forEach(function(y){
      xs.forEach(function(x){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.6), fmat);
        rail.position.set(x, y, 0); g.add(rail);
      });
      zs.forEach(function(z){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(3, 0.06, 0.06), fmat);
        rail.position.set(0, y, z); g.add(rail);
      });
    });
    var back = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.3, 0.03), mat(0x1c1f24, {rough:0.8}));
    back.position.z = -0.79; g.add(back);
    return g;
  }

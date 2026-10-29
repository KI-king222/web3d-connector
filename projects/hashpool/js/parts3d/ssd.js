/* parts3d/ssd.js — M.2 with heatsink on higher tiers */
(function(){
  function buildSsdDetailed(){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("ssd") : {tier:3,brand:""};
    var tier = info.tier||3;
    var g = new THREE.Group();
    var stick = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.58, 0.012), mat(0x0d1a14, {rough:0.45}));
    g.add(stick);
    var ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.01), mat(0x2a2a2a, {rough:0.35}));
    ctrl.position.set(0, 0.18, 0.012); g.add(ctrl);
    var nands = tier >= 7 ? 4 : 2;
    for(var i=0;i<nands;i++){
      var nand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.01), mat(0x1a2030, {rough:0.4}));
      nand.position.set(0, 0.05 - i*0.12, 0.012); g.add(nand);
    }
    if(tier >= 5){
      var hs = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 0.03), mat(0x888890,{metal:0.7,rough:0.25}));
      hs.position.z = 0.03; g.add(hs);
      for(var f=0;f<6;f++){
        var fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.025), mat(0x666670,{metal:0.6,rough:0.3}));
        fin.position.set(0, -0.2 + f*0.08, 0.04); g.add(fin);
      }
    }
    var label = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.004), mat(tier>=8?0x1428a0:0x333333,{rough:0.5}));
    label.position.set(0, 0.2, tier>=5?0.05:0.015); g.add(label);
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildSsd = buildSsdDetailed;
})();

/* parts3d/ram.js — DIMM heatspreader / RGB by tier */
(function(){
  function buildRamDetailed(color){
    var info = (window.Parts3D && Parts3D.pickInfo) ? Parts3D.pickInfo("ram") : {tier:3,brand:""};
    var tier = info.tier||3;
    var g = new THREE.Group();
    var h = 0.28 + tier*0.012;
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, h), mat(0x0a3d1a, {rough:0.7}));
    pcb.position.z = h/2; g.add(pcb);
    for(var i=0;i<8;i++){
      var contact = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.012), mat(0xd4a017, {metal:0.9, rough:0.2}));
      contact.position.set(0, -0.32 + i*0.08, 0.02); g.add(contact);
    }
    for(var c=0;c<Math.min(8, 2+tier);c++){
      var chip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.04), mat(0x1a1a1a,{rough:0.35}));
      chip.position.set(0.015, -0.25 + c*0.08, h*0.45); g.add(chip);
    }
    var hsCol = color || (tier>=6 ? 0x222228 : 0x3a3a42);
    var heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, h*0.85), mat(hsCol, {metal:0.55, rough:0.3}));
    heatsink.position.z = h*0.5; g.add(heatsink);
    if(tier >= 5){
      var rgb = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.7, 0.02), mat(tier>=8?0x00ffcc:0xff3366, {rough:0.4, metal:0.2}));
      rgb.position.z = h*0.9; g.add(rgb);
    }
    return g;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildRam = buildRamDetailed;
})();

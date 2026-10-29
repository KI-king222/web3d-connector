/* buildGpu.js — Modul 5/22 */

  function buildGpu(){
    var g = new THREE.Group();
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.11, 0.03), mat(0x0a3d1a, {rough:0.5}));
    pcb.position.set(0, 0, 0.02); g.add(pcb);
    var back = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.2, 0.02), mat(0x2a2e34, {metal:0.45, rough:0.35}));
    back.position.set(0, -0.02, 0.42); g.add(back);
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.28, 0.36), mat(COL.shroud, {rough:0.32, metal:0.28}));
    shroud.position.set(0.02, 0.02, 0.22); g.add(shroud);
    [-0.36, 0.0, 0.36].forEach(function(x){
      var fanG = new THREE.Group();
      fanG.position.set(x, 0.16, 0.22);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 22), mat(0x1a1d22, {rough:0.4}));
      ring.rotation.x = Math.PI/2;
      fanG.add(ring);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), mat(COL.silver, {metal:0.65}));
      fanG.add(hub);
      for(var i=0;i<7;i++){
        var blade = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.008, 0.09), mat(0x12151a));
        blade.rotation.y = (i/7)*Math.PI*2;
        fanG.add(blade);
      }
      g.add(fanG);
    });
    var rgbEdge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.02), glowMat(COL.rgb2, 1.6));
    rgbEdge.position.set(0.02, 0.17, 0.40); g.add(rgbEdge);
    rgbMeshes.push(rgbEdge);
    var rgbSide = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.3), glowMat(COL.rgb1, 1.2));
    rgbSide.position.set(0.6, 0.05, 0.22); g.add(rgbSide);
    rgbMeshes.push(rgbSide);
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.28), mat(COL.silver, {metal:0.8, rough:0.25}));
    bracket.position.set(-0.68, 0, 0.16); g.add(bracket);
    for(var p=0;p<3;p++){
      var port = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.04), mat(0x0a0c0e));
      port.position.set(-0.72, -0.06+p*0.06, 0.08); g.add(port);
    }
    var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), mat(0x111417));
    pwr.position.set(0.45, 0.14, 0.1); g.add(pwr);
    for(var f=0;f<12;f++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.02), mat(COL.gold, {metal:0.9, rough:0.2}));
      finger.position.set(-0.5 + f*0.1, 0, 0.005); g.add(finger);
    }
    return g;
  }
  function buildPsu(){
    var g = new THREE.Group();
    var box = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.95, 1.15), mat(COL.psuMetal, {metal:0.55, rough:0.35}));
    g.add(box);
    var label = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.01), mat(0x1a1d22, {rough:0.6}));
    label.position.set(0, 0.2, 0.58); g.add(label);
    var grille = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), mat(COL.fanBlack));
    grille.rotation.x = Math.PI/2; grille.position.z = 0.58; g.add(grille);
    for(var i=0;i<6;i++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.01), mat(0x1a1d20));
      blade.position.z = 0.585;
      blade.rotation.z = (i/6) * Math.PI * 2;
      g.add(blade);
    }
    for(var p=0;p<3;p++){
      var port = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), mat(0x0a0c0e));
      port.position.set(-0.15+p*0.15, -0.35, 0.58); g.add(port);
    }
    return g;
  }

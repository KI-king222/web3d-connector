/* PARTS-2.js — buildMobo 3D */
  function buildMobo(){
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.0, 0.05), mat(0xffffff, {rough:0.65, metal:0.05, map:getMoboTexture()}));
    g.add(base);
    var socket = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.03), mat(COL.chip, {rough:0.4}));
    socket.position.set(-0.45, 0.85, 0.04); g.add(socket);
    var ilm = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.02), mat(COL.silver, {metal:0.7, rough:0.3}));
    ilm.position.set(-0.45, 0.85, 0.03); g.add(ilm);
    [0.12, 0.22, 0.32, 0.42].forEach(function(x){
      var slot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.88, 0.035), mat(0x1a1d22));
      slot.position.set(x, 0.85, 0.04); g.add(slot);
      var latch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), mat(COL.silver, {metal:0.5}));
      latch.position.set(x, 1.28, 0.05); g.add(latch);
    });
    var chipset = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.05), mat(COL.silver, {metal:0.65, rough:0.28}));
    chipset.position.set(-0.45, -0.3, 0.05); g.add(chipset);
    for(var v=0;v<3;v++){
      var vrm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.08), mat(0x2a2e34, {metal:0.4, rough:0.4}));
      vrm.position.set(-0.85, 0.55 + v*0.05, 0.06); g.add(vrm);
    }
    var pcie = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.03), mat(COL.chip));
    pcie.position.set(-0.15, -0.95, 0.04); g.add(pcie);
    var pcie2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.025), mat(0x1a1d22));
    pcie2.position.set(-0.1, -1.15, 0.035); g.add(pcie2);
    for(var i=0;i<5;i++){
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,0.07,8), mat(COL.silver, {metal:0.75}));
      cap.position.set(-0.72 + i*0.1, 0.35, 0.06); cap.rotation.x = Math.PI/2; g.add(cap);
    }
    var hdr = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.04), mat(0x1a1206));
    hdr.position.set(0.55, 1.2, 0.05); g.add(hdr);
    for(var h=0;h<6;h++){
      var pin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), mat(COL.gold, {metal:0.8}));
      pin.position.set(0.4 + h*0.05, 1.2, 0.07); g.add(pin);
    }
    var m2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.01), mat(0x05070a, {rough:0.8}));
    m2.position.set(-0.55, -0.55, 0.035); g.add(m2);
    var accent = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.035, 0.02), glowMat(COL.rgb1, 1.1));
    accent.position.set(0, -1.35, 0.05); g.add(accent);
    rgbMeshes.push(accent);
    return g;
  }

/* buildSsd.js — Modul 4/22 */

  function buildSsd(){
    var g = new THREE.Group();
    var stick = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.58, 0.012), mat(0x0d1a14, {rough:0.45}));
    g.add(stick);
    var ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.01), mat(COL.chip, {rough:0.35}));
    ctrl.position.set(0, 0.18, 0.012); g.add(ctrl);
    for(var i=0;i<2;i++){
      var nand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.01), mat(0x1a2030, {rough:0.4}));
      nand.position.set(0, 0.02 - i*0.16, 0.012); g.add(nand);
    }
    var label = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.005), mat(0x3a4048, {rough:0.55}));
    label.position.set(0, -0.2, 0.01); g.add(label);
    var gold = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.004), mat(COL.gold, {metal:0.9, rough:0.2}));
    gold.position.set(0, 0.28, 0.002); g.add(gold);
    return g;
  }
  function buildCpu(){
    var g = new THREE.Group();
    var sub = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.018), mat(COL.pcb, {rough:0.65}));
    sub.position.z = 0.009; g.add(sub);
    [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]].forEach(function(c){
      var n = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), mat(0x080a0c));
      n.position.set(c[0], c[1], 0.01); g.add(n);
    });
    var ihs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), mat(COL.silver, {metal:0.8, rough:0.18}));
    ihs.position.z = 0.04; g.add(ihs);
    var die = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.004), mat(0x8a9098, {metal:0.5, rough:0.3}));
    die.position.z = 0.067; g.add(die);
    var logo = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.003), mat(0x111417, {rough:0.45}));
    logo.position.set(0, -0.1, 0.067); g.add(logo);
    return g;
  }
  function buildRamStick(color){
    var g = new THREE.Group();
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.28), mat(COL.pcb, {rough:0.7}));
    pcb.position.z = 0.14; g.add(pcb);
    for(var i=0;i<6;i++){
      var contact = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.012), mat(COL.gold, {metal:0.9, rough:0.2}));
      contact.position.set(0, -0.28 + i*0.1, 0.02); g.add(contact);
    }
    var heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.22), mat(color, {metal:0.45, rough:0.35}));
    heatsink.position.z = 0.16; g.add(heatsink);
    var rgbBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.55, 0.2), glowMat(color === COL.ram1 ? COL.rgb1 : COL.rgb2, 1.0));
    rgbBar.position.set(0.03, 0, 0.16); g.add(rgbBar);
    rgbMeshes.push(rgbBar);
    return g;
  }
  function buildRam(){
    var g = new THREE.Group();
    var s1 = buildRamStick(COL.ram1); s1.position.x = -0.08; g.add(s1);
    var s2 = buildRamStick(COL.ram2); s2.position.x = 0.08; g.add(s2);
    return g;
  }
  function buildCooler(){
    var g = new THREE.Group();
    var basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.035), mat(0xb87333, {metal:0.75, rough:0.3}));
    basePlate.position.z = 0.018; g.add(basePlate);
    for(var h=0;h<4;h++){
      var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), mat(0xc0a060, {metal:0.8, rough:0.25}));
      pipe.position.set(-0.1 + h*0.07, 0, 0.2);
      g.add(pipe);
    }
    for(var f=0;f<10;f++){
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.01), mat(COL.silver, {metal:0.7, rough:0.28}));
      fin.position.z = 0.06 + f*0.028; g.add(fin);
    }
    var fanGroup = new THREE.Group();
    fanGroup.position.z = 0.36;
    var fanRing = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.028, 20), mat(COL.fanBlack, {rough:0.55}));
    fanRing.rotation.x = Math.PI/2; fanGroup.add(fanRing);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), mat(COL.silver, {metal:0.5}));
    hub.rotation.x = Math.PI/2; fanGroup.add(hub);
    for(var i=0;i<7;i++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.01), mat(0x15181c));
      blade.rotation.z = (i / 7) * Math.PI * 2;
      fanGroup.add(blade);
    }
    g.add(fanGroup);
    g.userData.spin = fanGroup;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.01, 8, 24), glowMat(COL.rgb1, 1.2));
    ring.position.z = 0.38; g.add(ring);
    rgbMeshes.push(ring);
    return g;
  }

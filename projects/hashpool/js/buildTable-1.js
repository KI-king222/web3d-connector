/* buildTable.js — Modul 7/22 */

  function buildTable(){
    var g = new THREE.Group();
    var wood = mat(0x6b4428, {rough:0.8, metal:0.04});
    var dark = mat(0x3d2918, {rough:0.85, metal:0.04});
    var top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.09, 3.5), wood);
    top.position.set(2.6, -1.0, 0.2); g.add(top);
    var pad = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.008, 3.3), mat(0x1e242c, {rough:0.95, metal:0}));
    pad.position.set(2.6, -0.95, 0.2); g.add(pad);
    for(var gi=0; gi<6; gi++){
      var line = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.002, 0.008), mat(0x2c343e, {rough:1}));
      line.position.set(2.6, -0.944, -1.2 + gi*0.5); g.add(line);
    }
    [[1.7,-1.4],[3.5,-1.4],[1.7,1.8],[3.5,1.8]].forEach(function(c){
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.09), dark);
      leg.position.set(c[0], -1.39, c[1]); g.add(leg);
    });
    return g;
  }

  function initCase3D(){
    if(typeof THREE === "undefined") return;
    var el = document.getElementById("case-3d");
    var w = el.clientWidth || 280, h = el.clientHeight || 250;

    scene3d = new THREE.Scene();
    camera3d = new THREE.PerspectiveCamera(40, w / h, 0.1, 60);
    camera3d.position.set(0.95, 0, 12.5);

    renderer3d = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer3d.setSize(w, h);
    el.appendChild(renderer3d.domElement);

    scene3d.add(new THREE.AmbientLight(0x7a8494, 0.75));
    var hemi = new THREE.HemisphereLight(0xc8d4e8, 0x2a2018, 0.55);
    scene3d.add(hemi);
    var dl = new THREE.DirectionalLight(0xffffff, 1.05);
    dl.position.set(3.2, 5.5, 4.5);
    scene3d.add(dl);
    var fill = new THREE.DirectionalLight(0x88a0c0, 0.35);
    fill.position.set(-3, 2, -2);
    scene3d.add(fill);
    var shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 32),
      new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.28 })
    );
    shadow.rotation.x = -Math.PI/2;
    shadow.position.set(2.6, -1.74, 0.2);
    scene3d.add(shadow);

    rigGroup = new THREE.Group();
    scene3d.add(rigGroup);
    rigGroup.add(buildFrame());
    rigGroup.add(buildTable());
    buildSockets();

    var MOBO_LOCAL = {
      cpu:    [-0.45,  0.85, 0.042],
      ram:    [ 0.22,  0.85, 0.03],
      ssd:    [-0.55, -0.55, 0.032],
      cooler: [-0.45,  0.85, 0.10]
    };
    PARTS.forEach(function(p){
      var cfg = PART3D[p.id];
      var group = BUILDERS[p.id]();
      group.visible = false;
      if(MOBO_LOCAL[p.id]){
        var loc = MOBO_LOCAL[p.id];
        group.position.set(loc[0], loc[1], loc[2]);
        if(p.id !== "mobo" && partMeshes.mobo){
          partMeshes.mobo.add(group);
        } else {
          group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
          rigGroup.add(group);
        }
      } else {
        group.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        rigGroup.add(group);
      }
      partMeshes[p.id] = group;
    });
    if(partMeshes.cooler && partMeshes.mobo && partMeshes.cooler.parent !== partMeshes.mobo){
      var cl = MOBO_LOCAL.cooler;
      partMeshes.cooler.position.set(cl[0], cl[1], cl[2]);
      partMeshes.mobo.add(partMeshes.cooler);
    }

    rigGroup.rotation.y = 0.35;
    rigGroup.rotation.x = -0.1;

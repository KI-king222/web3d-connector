/* parts3d/psu.js — modular PSU; fan + IEC on the same face (rear when rotated) */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.4:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }

  function buildPsuDetailed(){
    var info = { tier: 3 };
    try {
      if(window.Parts3D && Parts3D.pickInfo) info = Parts3D.pickInfo("psu") || info;
      if(Parts3D._forceId && Parts3D._forceId.psu){
        var it = (typeof PART_BY_ID !== "undefined") ? PART_BY_ID[Parts3D._forceId.psu] : null;
        if(it) info.tier = Number(it.tier)||3;
      }
    } catch(e){}
    var tier = Math.max(1, Math.min(10, Number(info.tier)||3));
    var g = new THREE.Group();

    var W = 0.70 + tier * 0.02;
    var H = 0.55 + tier * 0.015;
    var D = 0.95 + tier * 0.02;

    var body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mat(0x4a4f57, { metal:0.55, rough:0.32 }));
    g.add(body);

    var rear = new THREE.Mesh(new THREE.BoxGeometry(W * 0.96, H * 0.96, 0.02), mat(0x2a2e34, { metal:0.4, rough:0.4 }));
    rear.position.set(0, 0, D * 0.5 + 0.01); g.add(rear);

    var fanR = 0.16 + tier * 0.006;
    var ring = new THREE.Mesh(new THREE.CylinderGeometry(fanR, fanR, 0.03, 20), mat(0x111417, { metal:0.3 }));
    ring.rotation.x = Math.PI/2;
    ring.position.set(-W * 0.12, 0.02, D * 0.5 + 0.025); g.add(ring);
    for(var b=0;b<7;b++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, fanR * 0.9), mat(0x1a1d20));
      blade.position.set(-W * 0.12, 0.02, D * 0.5 + 0.03);
      blade.rotation.z = (b/7) * Math.PI * 2;
      g.add(blade);
    }

    var iec = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.06), mat(0x0a0c0e, { rough:0.6 }));
    iec.position.set(W * 0.28, -H * 0.28, D * 0.5 + 0.04); g.add(iec);
    var iecIn = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.03), mat(0x1a1a1a));
    iecIn.position.set(W * 0.28, -H * 0.28, D * 0.5 + 0.07); g.add(iecIn);

    var sw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.04), mat(0x222222));
    sw.position.set(W * 0.42, -H * 0.28, D * 0.5 + 0.04); g.add(sw);

    for(var p=0;p<4;p++){
      var port = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.05), mat(0x0a0c0e));
      port.position.set(-W * 0.25 + (p % 2) * 0.28, H * 0.15 - Math.floor(p/2) * 0.18, -D * 0.5 - 0.02);
      g.add(port);
    }

    var badgeCol = tier <= 3 ? 0xb87333 : (tier <= 6 ? 0xc0c0c0 : (tier <= 8 ? 0xffd700 : 0xe8e8ff));
    var badge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.015), mat(badgeCol, { metal:0.7, rough:0.25 }));
    badge.position.set(0, H * 0.35, D * 0.5 + 0.02); g.add(badge);

    var label = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.01), mat(0x1a1d22, { rough:0.6 }));
    label.position.set(W * 0.05, H * 0.05, D * 0.5 + 0.02); g.add(label);

    try {
      if(window.Parts3D && Parts3D.LAYOUT && Parts3D.LAYOUT.psuRotY){
        g.rotation.y = Parts3D.LAYOUT.psuRotY;
      } else {
        g.rotation.y = Math.PI;
      }
    } catch(e){ g.rotation.y = Math.PI; }

    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildPsu = buildPsuDetailed;
})();

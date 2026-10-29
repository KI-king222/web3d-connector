/* parts3d/sceneLayout.js — mobo flush to left I/O wall */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.5:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function glow(c, i){
    return new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i||1.0, roughness:0.4, metalness:0.1 });
  }

  function buildTableDetailed(){
    var g = new THREE.Group();
    var wood = mat(0x6b4428, { rough:0.82, metal:0.03 });
    var dark = mat(0x3a2818, { rough:0.88, metal:0.03 });
    var edge = mat(0x4a321c, { rough:0.75, metal:0.05 });
    var top = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.12, 5.2), wood);
    top.position.set(0.4, -1.15, 0); g.add(top);
    var rim = new THREE.Mesh(new THREE.BoxGeometry(9.55, 0.04, 5.25), edge);
    rim.position.set(0.4, -1.10, 0); g.add(rim);
    var pad = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.01, 4.0), mat(0x1a222c, { rough:0.95 }));
    pad.position.set(2.8, -1.08, 0); g.add(pad);
    for(var gi=0; gi<10; gi++){
      var line = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.002, 0.01), mat(0x2a3440, { rough:1 }));
      line.position.set(2.8, -1.074, -1.7 + gi * 0.38); g.add(line);
    }
    var tray = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.35), mat(0x2a2e34, { metal:0.4, rough:0.4 }));
    tray.position.set(4.0, -1.05, 1.7); g.add(tray);
    [[-3.8,-2.2],[4.6,-2.2],[-3.8,2.2],[4.6,2.2]].forEach(function(c){
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), dark);
      leg.position.set(c[0], -1.55, c[1]); g.add(leg);
      var foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.18), mat(0x1a120c, { rough:0.9 }));
      foot.position.set(c[0], -1.98, c[1]); g.add(foot);
    });
    var brace = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.06, 0.06), dark);
    brace.position.set(0.4, -1.7, 0); g.add(brace);
    return g;
  }

  function buildFrameDetailed(){
    var g = new THREE.Group();
    var fmat = mat(0x2a2e34, { metal:0.55, rough:0.38 });
    var panel = mat(0x161a20, { rough:0.75, metal:0.15 });
    var darkPanel = mat(0x0e1014, { rough:0.7, metal:0.2 });
    var accent = mat(0x3a4050, { metal:0.4, rough:0.35 });
    var meshMat = mat(0x1a1e24, { metal:0.45, rough:0.35 });

    var cx = -1.20, cy = 0.95, cz = 0;
    var halfW = 1.55, halfH = 2.05, halfD = 0.85;
    var xs = [cx - halfW, cx + halfW], zs = [cz - halfD, cz + halfD];
    var yTop = cy + halfH, yBot = cy - halfH;

    xs.forEach(function(x){ zs.forEach(function(z){
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, halfH * 2, 0.06), fmat);
      post.position.set(x, cy, z); g.add(post);
    }); });
    [yTop, yBot].forEach(function(y){
      xs.forEach(function(x){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, halfD * 2), fmat);
        rail.position.set(x, y, cz); g.add(rail);
      });
      zs.forEach(function(z){
        var rail = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.06, 0.06), fmat);
        rail.position.set(cx, y, z); g.add(rail);
      });
    });

    var bottom = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.05, 0.04, halfD * 2 - 0.05), panel);
    bottom.position.set(cx, yBot + 0.02, cz); g.add(bottom);

    var rear = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.06, halfH * 2 - 0.1, 0.05), panel);
    rear.position.set(cx, cy, cz - halfD - 0.01); g.add(rear);
    for(var er=0; er<5; er++){
      var line = new THREE.Mesh(new THREE.BoxGeometry(halfW * 1.7, 0.02, 0.02), darkPanel);
      line.position.set(cx, yTop - 0.35 - er * 0.75, cz - halfD - 0.04); g.add(line);
    }

    var lx = cx - halfW - 0.01;
    var ioShield = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.35, 0.60), mat(0x0a0c10, { metal:0.3, rough:0.5 }));
    ioShield.position.set(lx, cy + 0.65, cz + 0.10); g.add(ioShield);
    var portColors = [0x111111, 0x222222, 0x8b0000, 0x8b0000, 0x1a1a1a, 0x1a1a1a, 0xc9a227, 0xc9a227];
    for(var ip=0; ip<8; ip++){
      var po = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.13), mat(portColors[ip], { metal:0.4 }));
      po.position.set(lx - 0.03, cy + 1.10 - Math.floor(ip/2)*0.24, cz + 0.10 + (ip%2)*0.20 - 0.09);
      g.add(po);
    }
    for(var es=0; es<8; es++){
      var slotY = cy - 0.05 - es * 0.20;
      var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 1.50), mat(0x2a2e34, { metal:0.5, rough:0.35 }));
      bracket.position.set(lx, slotY, cz - 0.05); g.add(bracket);
      var opening = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 1.30), darkPanel);
      opening.position.set(lx - 0.02, slotY, cz - 0.05); g.add(opening);
    }
    for(var gp=0; gp<3; gp++){
      var gport = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.13), mat(0x1a1a1a, { metal:0.6 }));
      gport.position.set(lx - 0.04, cy - 0.05, cz + 0.30 - gp * 0.20); g.add(gport);
    }
    var fanCut = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 24), meshMat);
    fanCut.rotation.z = Math.PI/2;
    fanCut.position.set(lx, cy + 0.75, cz - 0.30); g.add(fanCut);
    var fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.05, 12), mat(0x333333, { metal:0.4 }));
    fanHub.rotation.z = Math.PI/2;
    fanHub.position.set(lx - 0.01, cy + 0.75, cz - 0.30); g.add(fanHub);
    var psuWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.80, 0.95), meshMat);
    psuWin.position.set(lx, yBot + 0.48, cz + 0.15); g.add(psuWin);
    for(var hg=0; hg<5; hg++){
      var hline = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.75), darkPanel);
      hline.position.set(lx - 0.02, yBot + 0.62 + hg * 0.09, cz + 0.15); g.add(hline);
    }
    var iecCut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.28), darkPanel);
    iecCut.position.set(lx - 0.02, yBot + 0.30, cz + 0.35); g.add(iecCut);
    var psuSw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.10, 0.06), mat(0x222222));
    psuSw.position.set(lx - 0.02, yBot + 0.30, cz + 0.10); g.add(psuSw);
    var leftTop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.55, halfD * 2 - 0.1), panel);
    leftTop.position.set(lx + 0.02, yTop - 0.35, cz); g.add(leftTop);

    var rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.04, halfH * 2 - 0.1, halfD * 2 - 0.1), panel);
    rightPanel.position.set(cx + halfW, cy, cz); g.add(rightPanel);
    for(var dc=0; dc<6; dc++){
      var cage = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.06, 1.15), accent);
      cage.position.set(cx + halfW - 0.28, yTop - 0.45 - dc * 0.38, cz); g.add(cage);
    }
    var sled = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.80), mat(0x2a2e34, { metal:0.4 }));
    sled.position.set(cx + halfW - 0.45, yBot + 0.60, cz + 0.20); g.add(sled);

    var bezel = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.1, 0.48, 0.05), fmat);
    bezel.position.set(cx, yBot + 0.28, cz + halfD + 0.02); g.add(bezel);
    var pwr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), mat(0xc0c4c8, { metal:0.7 }));
    pwr.rotation.x = Math.PI/2;
    pwr.position.set(cx - 0.65, yBot + 0.32, cz + halfD + 0.05); g.add(pwr);
    var led = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 10), glow(0x22d3ee, 1.4));
    led.rotation.x = Math.PI/2;
    led.position.set(cx - 0.42, yBot + 0.32, cz + halfD + 0.05); g.add(led);

    var glass = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 - 0.28, halfH * 1.75, 0.02), mat(0x1a2030, { metal:0.15, rough:0.12 }));
    glass.position.set(cx, cy + 0.15, cz + halfD + 0.03);
    glass.material.transparent = true;
    glass.material.opacity = 0.07;
    g.add(glass);

    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildTable = buildTableDetailed;
  window.Parts3D.buildFrame = buildFrameDetailed;
  window.Parts3D.LAYOUT = {
    /* left wall ≈ -2.76; mobo halfW=0.8 → center -1.92 = left edge -2.72 (flush to I/O wall) */
    benchMobo: [2.80, -1.05, 0.0],
    caseMobo:  [-1.92, 1.00, 0.05],
    gpu:       [-2.35, -0.40, 0.12],
    psu:       [-2.40, -0.95, 0.20],
    psuRotY:   -Math.PI / 2,
    camPrep:   { x: 1.6, y: 0.35, z: 12 },
    camCase:   { x: -0.5, y: 0.5, z: 10.5 }
  };
})();

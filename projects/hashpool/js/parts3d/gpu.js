/* parts3d/gpu.js — high-detail if/else by id gpu-1..gpu-10
 * Web3D workshop mirror: flagship / dual / entry tiers by id
 */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.45:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function glow(c,i){
    return new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:i||1.1, roughness:0.35, metalness:0.1 });
  }

  function fan(g, x, y, z, r){
    var ring = new THREE.Mesh(new THREE.TorusGeometry(r, Math.max(0.01, r*0.08), 8, 28), mat(0x12151a, { rough:0.4, metal:0.35 }));
    ring.rotation.x = Math.PI/2; ring.position.set(x,y,z); g.add(ring);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(r*0.22, r*0.22, 0.035, 14), mat(0xc8c8c8, { metal:0.75, rough:0.2 }));
    hub.position.set(x,y,z); g.add(hub);
    for(var b=0;b<9;b++){
      var blade = new THREE.Mesh(new THREE.BoxGeometry(r*0.9, 0.008, r*0.28), mat(0x0e1014, { rough:0.5 }));
      blade.position.set(x + Math.cos((b/9)*Math.PI*2)*r*0.35, y, z + Math.sin((b/9)*Math.PI*2)*r*0.35);
      blade.rotation.y = (b/9)*Math.PI*2;
      blade.rotation.x = 0.25;
      g.add(blade);
    }
  }

  /** Horizontal card: length X, height Y, depth Z — bracket on -X */
  function card(g, L, H, D, shroud, accent, fans, rgb, backplate, dualPwr){
    // PCB
    var pcb = new THREE.Mesh(new THREE.BoxGeometry(L*0.95, 0.04, D*0.88), mat(0x0a3d1a, { rough:0.55 }));
    pcb.position.set(0.02, -H*0.45, 0); g.add(pcb);
    // gold fingers (PCIe)
    for(var i=0;i<16;i++){
      var finger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.06), mat(0xd4a017, { metal:0.92, rough:0.15 }));
      finger.position.set(-L*0.42 + i*0.045, -H*0.52, 0); g.add(finger);
    }
    // shroud body
    var body = new THREE.Mesh(new THREE.BoxGeometry(L, H, D), mat(shroud, { metal:0.28, rough:0.32 }));
    body.position.set(0, 0, 0); g.add(body);
    // top edge metal
    g.add(new THREE.Mesh(new THREE.BoxGeometry(L*0.98, 0.025, D*0.95), mat(0xb0b4ba, { metal:0.7, rough:0.25 }))).position.set(0, H*0.48, 0);
    // accent strip front-top
    var strip = new THREE.Mesh(new THREE.BoxGeometry(L*0.9, 0.03, 0.04), mat(accent, { metal:0.45, rough:0.25 }));
    strip.position.set(0, H*0.42, D*0.48); g.add(strip);
    if(rgb){
      var rgbM = new THREE.Mesh(new THREE.BoxGeometry(L*0.8, 0.02, 0.03), glow(0x66ccff, 1.4));
      rgbM.position.set(0, H*0.5, D*0.4); g.add(rgbM);
      var rgb2 = new THREE.Mesh(new THREE.BoxGeometry(L*0.5, 0.015, 0.02), glow(accent, 1.1));
      rgb2.position.set(0, -H*0.2, D*0.5); g.add(rgb2);
    }
    if(backplate){
      var bp = new THREE.Mesh(new THREE.BoxGeometry(L*0.96, 0.02, D*0.9), mat(0x1a1e24, { metal:0.55, rough:0.28 }));
      bp.position.set(0, -H*0.55, 0); g.add(bp);
    }
    // fans on top face
    var fanR = fans===1 ? 0.28 : (fans===2 ? 0.26 : 0.24);
    for(var f=0;f<fans;f++){
      var fx = 0;
      if(fans===2) fx = -0.35 + f*0.7;
      if(fans===3) fx = -0.55 + f*0.55;
      if(fans===1) fx = 0.1;
      fan(g, fx, H*0.52, 0, fanR);
    }
    // PCIe bracket left
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, H+0.35, D*0.95), mat(0x888888, { metal:0.7, rough:0.25 }));
    bracket.position.set(-L*0.52, -0.05, 0); g.add(bracket);
    // display ports on left bracket face outward
    for(var p=0;p<(fans>=3?4:2);p++){
      var port = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.1), mat(0x0a0c0e));
      port.position.set(-L*0.56, 0.05 - p*0.1, 0.15 - (p%2)*0.25); g.add(port);
    }
    // power connectors
    for(var pw=0; pw<dualPwr; pw++){
      var pwr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), mat(0x1a1a1a, { metal:0.2 }));
      pwr.position.set(L*0.15 + pw*0.18, H*0.35, -D*0.4); g.add(pwr);
    }
    // side vents
    for(var v=0; v<5; v++){
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.08), mat(0x2a2e34, { metal:0.5 }));
      fin.position.set(L*0.48, 0, -0.3 + v*0.14); g.add(fin);
    }
  }

  function buildGpuDetailed(){
    var id = "";
    try {
      if(window.Parts3D && Parts3D.pickInfo) id = (Parts3D.pickInfo("gpu").id || "");
      if(!id && Parts3D._forceId && Parts3D._forceId.gpu) id = Parts3D._forceId.gpu;
    } catch(e){}
    var g = new THREE.Group();
    var n = parseInt((id.split("-")[1]||"3"), 10) || 3;
    if(n < 1) n = 1; if(n > 10) n = 10;

    // Tier look: green-ish vs red-ish alternate brands (not real trademarks)
    var isA = (n % 2 === 1);
    var accent = isA ? 0x76b900 : 0xed1c24;
    var shroud = isA ? 0x1a222c : 0x1c1214;

    // Strong visible scale by tier
    var L, H, D, fans, rgb, bp, pwr;
    if(n <= 3){
      // entry single fan
      L = 1.35 + n * 0.08; H = 0.32; D = 0.95; fans = 1; rgb = false; bp = false; pwr = 0;
    } else if(n <= 6){
      // mid dual fan
      L = 1.75 + (n-3) * 0.12; H = 0.40; D = 1.08; fans = 2; rgb = n >= 5; bp = true; pwr = 1;
    } else {
      // flagship triple fan
      L = 2.2 + (n-7) * 0.12; H = 0.48; D = 1.18; fans = 3; rgb = true; bp = true; pwr = 2;
    }
    if(id === "gpu-10"){
      L = 2.7; H = 0.52; D = 1.22; fans = 3; rgb = true; bp = true; pwr = 2;
      accent = 0x9acd32; shroud = 0x0a1018;
    }

    card(g, L, H, D, shroud, accent, fans, rgb, bp, pwr);

    if(n >= 9){
      var gold = new THREE.Mesh(new THREE.BoxGeometry(L*0.5, 0.02, 0.03), mat(0xc9a227, { metal:0.9, rough:0.2 }));
      gold.position.set(0.2, H*0.35, D*0.5); g.add(gold);
    }
    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildGpu = buildGpuDetailed;
})();

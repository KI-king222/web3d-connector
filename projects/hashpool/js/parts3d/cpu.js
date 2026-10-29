/* parts3d/cpu.js — high-detail if/else by id cpu-1..cpu-10 */
(function(){
  function mat(c, o){
    o = o || {};
    if(typeof THREE !== "undefined" && THREE.MeshStandardMaterial)
      return new THREE.MeshStandardMaterial({ color:c, metalness:o.metal||0, roughness:o.rough==null?0.45:o.rough });
    return new THREE.MeshLambertMaterial({ color:c });
  }
  function box(sx,sy,sz,c,x,y,z,metal,rough){
    var m = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), mat(c,{metal:metal||0,rough:rough==null?0.4:rough}));
    m.position.set(x||0,y||0,z||0); return m;
  }
  function cyl(r,h,c,x,y,z,metal){
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10), mat(c,{metal:metal||0.3,rough:0.35}));
    m.rotation.x = Math.PI/2; m.position.set(x,y,z); return m;
  }
  function caps(g, r, n, col){
    for(var i=0;i<n;i++){
      var a = (i/n)*Math.PI*2;
      g.add(cyl(0.014, 0.022, col, Math.cos(a)*r*0.82, Math.sin(a)*r*0.82, 0.022, 0.4));
    }
  }
  function screws(g, s, z){
    [[-s,-s],[s,-s],[-s,s],[s,s]].forEach(function(p){
      g.add(cyl(0.012, 0.01, 0x888890, p[0], p[1], z, 0.85));
    });
  }

  function buildCpuDetailed(){
    var id = "";
    try {
      if(window.Parts3D && Parts3D.pickInfo) id = (Parts3D.pickInfo("cpu").id || "");
      if(!id && Parts3D._forceId && Parts3D._forceId.cpu) id = Parts3D._forceId.cpu;
    } catch(e){}
    var g = new THREE.Group();
    var n = parseInt((id.split("-")[1]||"3"), 10) || 3;
    if(n < 1) n = 3;

    var pcb = 0.32 + n * 0.038;
    var ihs = 0.16 + n * 0.036;
    var ihsH = 0.032 + n * 0.004;
    var isEmber = (n % 2 === 0);
    var subCol = isEmber ? 0x1a3a0c : 0x0a2814;
    var logoCol = isEmber ? 0xed1c24 : 0x1565c0;
    var dual = n >= 6;

    g.add(box(pcb, pcb, 0.018, subCol, 0, 0, 0.009, 0, 0.7));
    g.add(box(pcb*1.02, pcb*1.02, 0.004, 0x0d4a1a, 0, 0, 0.002, 0, 0.6));
    caps(g, pcb*0.42, 4 + Math.floor(n*0.8), 0x1a1a1a);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c){
      g.add(box(0.04, 0.04, 0.012, 0x080a0c, c[0]*pcb*0.42, c[1]*pcb*0.42, 0.01));
    });
    screws(g, pcb*0.38, 0.016);

    if(dual){
      var half = ihs * 0.42;
      g.add(box(half, half, ihsH, 0xd8dce0, -ihs*0.28, 0, 0.02+ihsH*0.5, 0.85, 0.12));
      g.add(box(half, half, ihsH, 0xd8dce0,  ihs*0.28, 0, 0.02+ihsH*0.5, 0.85, 0.12));
      g.add(box(0.03, ihs*0.7, ihsH*0.5, 0x2a2a2e, 0, 0, 0.02+ihsH*0.3, 0.5));
    } else {
      g.add(box(ihs, ihs, ihsH, 0xc8ccd0, 0, 0, 0.02+ihsH*0.5, 0.7+n*0.02, 0.12));
      if(n >= 4){
        g.add(box(ihs*1.06, ihs*1.06, 0.008, 0x9a9ea4, 0, 0, 0.02, 0.65, 0.25));
      }
    }

    g.add(box(ihs*0.5, ihs*0.14, 0.006, logoCol, 0, ihs*0.15, 0.02+ihsH+0.005, 0.3, 0.35));
    if(n >= 3){
      g.add(box(ihs*0.65, ihs*0.06, 0.004, 0x2a2a2e, 0, -ihs*0.28, 0.02+ihsH+0.003, 0, 0.5));
    }
    if(n >= 4){
      for(var px=-3; px<=3; px++){
        for(var py=-3; py<=3; py++){
          if(Math.abs(px)+Math.abs(py) > 5) continue;
          g.add(cyl(0.006, 0.01, 0xc0a060, px*0.045, py*0.045, -0.002, 0.9));
        }
      }
    }
    if(n >= 9){
      g.add(box(pcb+0.04, 0.025, 0.01, 0xffd700, 0, pcb*0.5, 0.02, 0.95, 0.2));
      g.add(box(pcb+0.04, 0.025, 0.01, 0xffd700, 0, -pcb*0.5, 0.02, 0.95, 0.2));
      g.add(box(0.025, pcb+0.04, 0.01, 0xffd700, pcb*0.5, 0, 0.02, 0.95, 0.2));
      g.add(box(0.025, pcb+0.04, 0.01, 0xffd700, -pcb*0.5, 0, 0.02, 0.95, 0.2));
    }
    return g;
  }

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.buildCpu = buildCpuDetailed;
})();

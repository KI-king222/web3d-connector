/* spawnScrews.js — Modul 8/22 */

  function spawnScrews(id, posOverride){
    var mesh = partMeshes[id];
    var parent = (mesh && mesh.parent) || rigGroup;
    var base = posOverride || (mesh ? mesh.position : PART3D[id].pos);
    var bx = base.x!==undefined ? base.x : base[0];
    var by = base.y!==undefined ? base.y : base[1];
    var bz = base.z!==undefined ? base.z : base[2];
    var offsets = [[-0.12, 0.1, 0.018], [0.12, -0.1, 0.018]];
    var smat = mat(COL.screw, { metal:0.7, rough:0.3 });
    var arr = [];
    offsets.forEach(function(off){
      var m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8), smat);
      m.position.set(bx + off[0], by + off[1], bz + off[2]);
      m.scale.set(0.01, 0.01, 0.01);
      parent.add(m);
      arr.push(m);
      screwQueue.push({ mesh:m, start: performance.now(), duration: 400 });
    });
    screwMeshes[id] = arr;
  }
  function removeScrews(id){
    var mesh = partMeshes[id];
    var parent = (mesh && mesh.parent) || rigGroup;
    if(!parent) { screwMeshes[id] = []; return; }
    (screwMeshes[id] || []).forEach(function(m){ parent.remove(m); });
    screwMeshes[id] = [];
  }

  function setPartVisual(id, installed){
    var mesh = partMeshes[id];
    if(!mesh) return;
    if(installed){
      mesh.visible = true;
      if(id === "mobo" && !moboCaseAnim){
        var mb = state.moboCased ? PART3D.mobo.pos : BENCH.mobo;
        mesh.position.set(mb[0], mb[1], mb[2]);
        mesh.rotation.x = state.moboCased ? 0 : -Math.PI/2;
      }
      if(!installedAnimated[id]){
        installedAnimated[id] = true;
        mesh.scale.set(0.2, 0.2, 0.2);
        animQueue[id] = { start: performance.now(), duration: 450 };
        if(id !== "mobo") spawnScrews(id);
      }
    } else {
      mesh.visible = false;
      mesh.scale.set(1, 1, 1);
      delete installedAnimated[id];
      delete animQueue[id];
      removeScrews(id);
    }
    recomputeCables();
  }

  var CHEATS = {
    "SATOSHI": { sats: 100000000 },
    "HODLGANG": { sats: 25000000 }
  };

  var state = {
    balance: 0,
    perClick: 1,
    owned: {},
    clickOwned: {},
    price: 68000,
    lang: (navigator.language||"en").slice(0,2) === "de" ? "de" : "en",
    buyQty: 1,
    username: "",
    redeemed: {},
    lifetime: 0,
    halvings: 0,
    muted: false,
    buildBought: {},
    buildInstalled: {},
    buildCablesDone: {},
    buildMode: "quick",
    moboCased: false,
    pasteQuality: 0.75,
    pasteDone: false,
    biosDone: false,
    biosQuality: 0.8,
    ex: null,
    rigsSold: 0
  };

  PARTS.forEach(function(p){ state.buildBought[p.id] = false; state.buildInstalled[p.id] = false; });
  Object.keys(CABLES).forEach(function(k){ state.buildCablesDone[k] = false; });

  UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
  CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });

  function t(key){ return I18N[state.lang][key]; }

  function showConfirm(message, onYes){
    var modal = document.getElementById("confirm-modal");
    document.getElementById("confirm-text").textContent = message;
    document.getElementById("confirm-cancel").textContent = t("cancel");
    document.getElementById("confirm-ok").textContent = t("confirmOk");
    modal.style.display = "flex";
    var okBtn = document.getElementById("confirm-ok");
    var cancelBtn = document.getElementById("confirm-cancel");
    function cleanup(){
      modal.style.display = "none";
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    }
    function onOk(){ cleanup(); onYes(); }
    function onCancel(){ cleanup(); }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  }

  var audioCtx = null;
  function ensureAudio(){
    if(!audioCtx){
      try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
    }
    if(audioCtx && audioCtx.state === "suspended"){ audioCtx.resume(); }
    return audioCtx;
  }

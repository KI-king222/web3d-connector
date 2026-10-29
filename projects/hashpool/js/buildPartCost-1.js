/* buildPartCost.js — Modul 12/22 */

  function buildPartCost(p){
    return Math.round(p.base * Math.pow(1.55, state.rigsSold) * exDealFactor(p.id));
  }
  function buildTotalCost(){
    var total = 0;
    PARTS.forEach(function(p){ total += buildPartCost(p); });
    return total;
  }
  function renderBuild(){
    document.getElementById("title-build").textContent = t("titleBuild");
    document.getElementById("build-desc").textContent = t("buildDesc");
    var boughtN = PARTS.filter(function(p){ return state.buildBought[p.id]; }).length;
    var installedN = PARTS.filter(function(p){ return state.buildInstalled[p.id]; }).length;
    var costNow = buildTotalCost();
    var profitNow = Math.round(costNow * 1.38);
    var progressLine = t("buildProgress").replace("{bought}", boughtN).replace("{installed}", installedN);
    var profitLine = t("buildProfitHint").replace("{profit}", fmtCost(profitNow)).replace("{cost}", fmtCost(costNow));
    document.getElementById("build-stat").textContent = t("rigsSold") + " " + state.rigsSold + " · " + progressLine;
    var openBtn = document.getElementById("open-build-btn");
    var unlocked = state.lifetime >= 40 || state.rigsSold > 0;
    openBtn.disabled = !unlocked;
    openBtn.textContent = unlocked ? t("launchBtn") : t("buildLocked");
    openBtn.style.opacity = unlocked ? "1" : "0.55";
    openBtn.title = unlocked ? profitLine : t("buildLocked");
    document.getElementById("drag-hint").textContent = t("dragHint");

    if(buildOverlayOpen()) renderBuildOverlay();
  }

  function buildOverlayOpen(){
    return document.getElementById("build-overlay").style.display !== "none";
  }
  var PART_DEPENDS = {
    cpu:["mobo"], ram:["cpu"], ssd:["ram"],
    gpu:["ssd","moboCase"], cooler:["gpu"], psu:["cooler"]
  };
  var PSEUDO_NAMES = { moboCase: { en:"motherboard in case", de:"Mainboard im Gehäuse" } };
  function moboReadyForCase(){
    return !!(state.buildInstalled.cpu && state.buildInstalled.ram && state.buildInstalled.ssd);
  }
  function partAvailable(id){
    var deps = PART_DEPENDS[id];
    if(!deps) return true;
    return deps.every(function(d){ return d === "moboCase" ? !!state.moboCased : !!state.buildInstalled[d]; });
  }
  function missingDepsLabel(id){
    var deps = PART_DEPENDS[id] || [];
    var missing = deps.filter(function(d){ return d === "moboCase" ? !state.moboCased : !state.buildInstalled[d]; });
    var names = missing.map(function(d){ return d === "moboCase" ? PSEUDO_NAMES.moboCase[state.lang] : PARTS_BY_ID[d].name[state.lang]; });
    return t("lockedHintPrefix") + " " + names.join(", ");
  }
  function caseTheMobo(){
    var mesh = partMeshes.mobo;
    if(!mesh || state.moboCased) return;
    var from = mesh.position.clone();
    var to = new THREE.Vector3(PART3D.mobo.pos[0], PART3D.mobo.pos[1], PART3D.mobo.pos[2]);
    moboCaseAnim = { mesh:mesh, from:from, to:to, start: performance.now(), duration: 1100 };
    state.moboCased = true;
    camTarget.x = 0; camTarget.y = 0; camTarget.z = 8;
    sfxInstall();
    save();
    render();
  }
  function allBought(){ return PARTS.every(function(p){ return state.buildBought[p.id]; }); }
  function allInstalled(){ return PARTS.every(function(p){ return state.buildInstalled[p.id]; }); }
  function allCablesReady(){
    if(state.buildMode !== "detailed") return true;
    return Object.keys(CABLES).every(function(k){ return !!state.buildCablesDone[k]; });
  }

  var dragState = null, dragActive = false;

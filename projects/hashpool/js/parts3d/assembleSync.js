/* parts3d/assembleSync.js — CABLES an LAYOUT, canPick, demoSpec */
(function(){
  function syncGameCables(){
    if(typeof CABLES === "undefined") return false;
    var L = (window.Parts3D && Parts3D.LAYOUT) || {};
    var mob = L.caseMobo || [-1.92, 1.00, 0.05];
    var gpu = L.gpu || [-2.35, -0.40, 0.12];
    var psu = L.psu || [-2.40, -0.95, 0.20];
    if(CABLES.mainPower){
      CABLES.mainPower.from = [psu[0]+0.2, psu[1]+0.25, psu[2]];
      CABLES.mainPower.to   = [mob[0]+0.5, mob[1]+0.15, mob[2]+0.25];
      CABLES.mainPower.sag  = [0.15, 0.35, 0.2];
    }
    if(CABLES.cpuPower){
      CABLES.cpuPower.from = [psu[0]+0.15, psu[1]+0.3, psu[2]-0.1];
      CABLES.cpuPower.to   = [mob[0]-0.2, mob[1]+0.4, mob[2]-0.15];
      CABLES.cpuPower.sag  = [0.05, 0.45, -0.15];
    }
    if(CABLES.gpuPower){
      CABLES.gpuPower.from = [psu[0]+0.2, psu[1]+0.2, psu[2]+0.1];
      CABLES.gpuPower.to   = [gpu[0]+0.15, gpu[1]+0.1, gpu[2]+0.15];
      CABLES.gpuPower.sag  = [0.2, -0.1, 0.25];
    }
    if(CABLES.fanCable){
      CABLES.fanCable.from = [mob[0]-0.15, mob[1]+0.35, mob[2]];
      CABLES.fanCable.to   = [mob[0]-0.05, mob[1]+0.2, mob[2]-0.2];
    }
    if(typeof recomputeCables === "function") try{ recomputeCables(); }catch(e){}
    console.log("[HASHPOOL] CABLES synced to LAYOUT");
    return true;
  }
  function canPick(partId){
    if(!window.Parts3D || !Parts3D.compat || !Parts3D.specFromBuildPick) return {ok:true,errors:[]};
    var spec = Parts3D.specFromBuildPick();
    var cat = String(partId).split("-")[0];
    var map = { case:"case", mobo:"mobo", cpu:"cpu", cooler:"cooler", ram:"ram", gpu:"gpu", psu:"psu", ssd:"ssd" };
    var key = map[cat] || cat;
    if(key==="ssd") spec.ssd = [].concat(spec.ssd||[], [partId]);
    else spec[key] = partId;
    return Parts3D.compat(spec);
  }
  function demoSpec(){
    return { case:"case-7", mobo:"mobo-6", cpu:"cpu-8", cooler:"cooler-6", ram:"ram-6", gpu:"gpu-7", psu:"psu-6", ssd:["ssd-5"] };
  }
  function applyDemoPick(){
    if(typeof state === "undefined") return;
    if(!state.buildPick) state.buildPick = {};
    if(!state.partInv) state.partInv = {};
    var d = demoSpec();
    ["case","mobo","cpu","cooler","ram","gpu","psu"].forEach(function(k){
      if(d[k]){ state.buildPick[k]=d[k]; state.partInv[d[k]]=(state.partInv[d[k]]||0)+1; }
    });
    (d.ssd||[]).forEach(function(id){ state.partInv[id]=(state.partInv[id]||0)+1; });
    try{ if(typeof save==="function") save(); }catch(e){}
    console.log("[HASHPOOL] demo pick applied", d);
    return d;
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.syncGameCables = syncGameCables;
  window.Parts3D.canPick = canPick;
  window.Parts3D.demoSpec = demoSpec;
  window.Parts3D.applyDemoPick = applyDemoPick;
  setTimeout(syncGameCables, 500);
  setTimeout(syncGameCables, 2000);
  setTimeout(syncGameCables, 4000);
})();

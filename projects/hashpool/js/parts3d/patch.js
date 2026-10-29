/* parts3d/patch.js — optional late bind */
(function(){
  function apply(){
    if(typeof THREE === "undefined") return false;
    if(window.Parts3D){
      try{
        if(Parts3D.buildCpu) buildCpu = Parts3D.buildCpu;
        if(Parts3D.buildGpu) buildGpu = Parts3D.buildGpu;
        if(Parts3D.buildRam) buildRamStick = function(c){ return Parts3D.buildRam(c); };
        if(Parts3D.buildSsd) buildSsd = Parts3D.buildSsd;
        if(Parts3D.buildPsu) buildPsu = Parts3D.buildPsu;
        if(Parts3D.buildCooler) buildCooler = Parts3D.buildCooler;
      }catch(e){}
      return true;
    }
    return false;
  }
  setTimeout(apply, 50);
  setTimeout(apply, 200);
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.applyPatch = apply;
})();

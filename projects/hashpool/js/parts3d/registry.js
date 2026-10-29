/* parts3d/registry.js — pickInfo from buildPick, with forceId override */
(function(){
  function pickInfo(cat){
    try{
      if(window.Parts3D && Parts3D._forceId && Parts3D._forceId[cat]){
        var fid = Parts3D._forceId[cat];
        var itF = (typeof PART_BY_ID !== "undefined" && PART_BY_ID[fid]) ? PART_BY_ID[fid] : null;
        return {
          id: fid,
          tier: itF ? (Number(itF.tier)||1) : 3,
          brand: itF ? (itF.brand||"") : "",
          model: itF ? (itF.model||"") : ""
        };
      }
      if(typeof state !== "undefined" && state && state.buildPick && state.buildPick[cat]){
        var id = state.buildPick[cat];
        var it = (typeof PART_BY_ID !== "undefined") ? PART_BY_ID[id] : null;
        return {
          id: id,
          tier: it ? (Number(it.tier)||1) : 3,
          brand: it ? (it.brand||"") : "",
          model: it ? (it.model||"") : ""
        };
      }
    }catch(e){}
    return { id: "", tier: 3, brand: "", model: "" };
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.pickInfo = pickInfo;
  window.Parts3D._forceId = window.Parts3D._forceId || {};
})();

electedBuildCost(){
    ensureInv(); var total = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it){ total += it.cost; n++; }
    });
    return n ? total : 0;
  }
  function clearBuildSelectionUI(){
    ensureInv();
    try{ state._assemblyActive = false; }catch(_a){}
    state.buildPick = {};
    pickerExpand = {};
    if(state.buildBought){
      REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
      if(state.buildBought.case) delete state.buildBought.case;
    }
    try {
      if(state.buildInstalled){ Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; }); }
      if(state.buildCablesDone){ Object.keys(state.buildCablesDone).forEach(function(k){ state.buildCablesDone[k] = false; }); }
      state.moboCased = false;
      state.pasteDone = false;
    } catch(e){}
    var pick = document.getElementById("ps-picker");
    if(pick && pick.classList.contains("open")) renderPicker();
  }
  function consumeBuildParts(){
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat];
      if(id && state.partInv[id]){
        state.partInv[id] -= 1;
        if(state.partInv[id] <= 0) delete state.partInv[id];
      }
      delete state.buildPick[cat];
    });
    clearBuildSelectionUI();
    if(typeof save === "function") save();
  }
  function brandChipClass(brand, tier){
    var b = (brand||"").toLowerCase().replace(/[^a-z]/g,"");
    var map = {intel:"ps-chip-intel",amd:"ps-chip-amd",nvidia:"ps-chip-nvidia",corsair:"ps-chip-corsair",samsung:"ps-chip-samsung",kingston:"ps-chip-kingston",noc
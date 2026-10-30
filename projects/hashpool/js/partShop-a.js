/* partShop.js — original shelves + detail scales (Tier, Leistung, Effizienz, Preis/Leistung) */
(function(){
  if(typeof PART_CATALOG === "undefined") return;
  var REQUIRED_FOR_BUILD = ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"];
  function fmt(n){
    if(typeof fmtSats === "function") return fmtSats(n);
    n = Math.floor(Number(n)||0);
    if(n >= 1e6) return (n/1e6).toFixed(2)+"M";
    if(n >= 1e3) return (n/1e3).toFixed(1)+"k";
    return String(n);
  }
  function ensureInv(){
    if(!state.partInv) state.partInv = {};
    if(!state.buildPick) state.buildPick = {};
  }
  function ownedCount(partId){ ensureInv(); return state.partInv[partId] || 0; }
  function categoryOwned(cat){
    ensureInv(); var n = 0;
    (PART_CATALOG[cat].items||[]).forEach(function(it){ n += state.partInv[it.id] || 0; });
    return n;
  }
  function hasAnyInCat(cat){ return categoryOwned(cat) > 0; }
  function canBuildPC(){ return REQUIRED_FOR_BUILD.every(hasAnyInCat); }
  function ownedItemsInCat(cat){
    ensureInv();
    return (PART_CATALOG[cat].items||[]).filter(function(it){ return (state.partInv[it.id]||0) > 0; });
  }
  function allPicked(){
    ensureInv();
    return REQUIRED_FOR_BUILD.every(function(cat){ return !!state.buildPick[cat]; });
  }
  function clearBuildSelectionUI(){
    try{
      state.buildPick = {};
      if(state.buildBought){
        REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
      }
      if(state.buildInstalled){ Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; }); }
      if(state.buildCablesDone){ Object.keys(state.buildCablesDone).forEach(function(k){ state.buildCablesDone[k] = false; }); }
      state.moboCased = false;
      state.pasteDone = false;
    } catch(e){}
    try{ state._assemblyActive = false; }catch(_a){}
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
    var map = {intel:"ps-chip-intel",amd:"ps-chip-amd",nvidia:"ps-chip-nvidia",corsair:"ps-chip-corsair",samsung:"ps-chip-samsung",kingston:"ps-chip-kingston",noctua:"ps-chip-noctua",asus:"ps-chip-asus",msi:"ps-chip-msi",gigabyte:"ps-chip-gigabyte",seasonic:"ps-chip-seasonic",bequiet:"ps-chip-bequiet",deepcool:"ps-chip-default",arctic:"ps-chip-default",nzxt:"ps-chip-corsair",fractal:"ps-chip-default",lianli:"ps-chip-default",crucial:"ps-chip-kingston",wd:"ps-chip-default",seagate:"ps-chip-default",gskill:"ps-chip-corsair",stock:"ps-chip-default",asrock:"ps-chip-amd",generic:"ps-chip-default",nocturne:"ps-chip-noctua",icewing:"ps-chip-default",abyssal:"ps-chip-default",corvus:"ps-chip-corsair",samsum:"ps-chip-samsung",fjordic:"ps-chip-default",lumio:"ps-chip-default",prisma:"ps-chip-default",kingforge:"ps-chip-kingston",crux:"ps-chip-kingston",seaguard:"ps-chip-default",seasonicx:"ps-chip-seasonic",asusx:"ps-chip-asus",msx:"ps-chip-msi",asrockx:"ps-chip-amd",axiom:"ps-chip-intel",ember:"ps-chip-amd",quanta:"ps-chip-intel",blaze:"ps-chip-amd",fjord:"ps-chip-default"};
    var cls = map[b] || "ps-chip-default";
    if(tier >= 8) cls += " ps-chip-tier-hi";
    else if(tier >= 5) cls += " ps-chip-tier-mid";
    return cls;
  }
  function chipLabel(it){ return (it.brand||"").slice(0,3).toUpperCase() + "\nT" + it.tier; }
  function showToast(msg){
    var el = document.getElementById("ps-toast");
    if(!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ el.classList.remove("show"); }, 3200);
  }
  var view = { mode: "shelves", cat: null, selected: null };
  var pickerExpand = {};

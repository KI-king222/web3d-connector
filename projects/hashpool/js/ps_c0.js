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
    return REQUIRED_FOR_BUILD.every(function(cat){
      var id = state.buildPick[cat];
      return id && (state.partInv[id]||0) > 0;
    });
  }
  function avgPickedTier(){
    ensureInv(); var sum = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it){ sum += it.tier; n++; }
    });
    return n ? sum / n : 1;
  }
  function sellMult(){
    var t = avgPickedTier();
    return 1.12 + Math.min(0.15, (t - 1) * 0.0167);
  }
  function s
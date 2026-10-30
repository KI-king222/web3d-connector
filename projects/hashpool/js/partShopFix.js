/* partShopFix — expose state + tier helpers after init + soft clear */
(function(){
  function ensureHelpers(){
    try{
      if(typeof partBaseName==="function") window.partBaseName=partBaseName;
      if(typeof partTierLabel==="function") window.partTierLabel=partTierLabel;
      if(typeof partTierBadge==="function") window.partTierBadge=partTierBadge;
      if(typeof partDisplayName==="function") window.partDisplayName=partDisplayName;
      if(typeof PART_TIER_LABELS!=="undefined") window.PART_TIER_LABELS=PART_TIER_LABELS;
    }catch(e){}
    if(typeof window.partBaseName!=="function"){
      window.partBaseName=function(it){if(!it)return"";return(it.brand?it.brand+" ":"")+(it.model||"");};
    }
    if(typeof window.partTierLabel!=="function"){
      window.PART_TIER_LABELS=window.PART_TIER_LABELS||{
        en:["Entry","Basic","Budget","Mainstream","Mainstream+","Performance","High-End","High-End+","Enthusiast","Flagship"],
        de:["Einsteiger","Basis","Budget","Mittelklasse","Mittelklasse+","Gehoben","High-End","High-End+","Enthusiast","Flaggschiff"]
      };
      window.partTierLabel=function(it,lang){
        var L=window.PART_TIER_LABELS[lang||(window.state&&window.state.lang==="de"?"de":"en")]||window.PART_TIER_LABELS.de;
        var t=(it&&it.tier)?it.tier:1;
        return L[Math.max(0,Math.min(L.length-1,t-1))]||("T"+t);
      };
    }
    if(typeof window.partTierBadge!=="function"){
      window.partTierBadge=function(it,lang){
        var t=(it&&it.tier)?it.tier:1;
        return "T"+t+" · "+window.partTierLabel(it,lang);
      };
    }
    if(typeof window.partDisplayName!=="function"){
      window.partDisplayName=function(it){return window.partBaseName(it)+" · "+window.partTierLabel(it);};
    }
  }
  function expose(){
    try{
      if(typeof state!=="undefined" && state && typeof state.balance==="number"){
        window.state=state;
      }
      if(typeof PART_CATALOG!=="undefined" && PART_CATALOG){
        window.PART_CATALOG=PART_CATALOG;
        window.PART_CATEGORIES=PART_CATEGORIES;
        window.PART_BY_ID=PART_BY_ID;
      }
      if(typeof save==="function") window.save=save;
      if(typeof fmtSats==="function") window.fmtSats=fmtSats;
      if(typeof updateBalanceUI==="function") window.updateBalanceUI=updateBalanceUI;
      if(typeof openBuildOverlay==="function") window.openBuildOverlay=openBuildOverlay;
      if(typeof renderBuildOverlay==="function") window.renderBuildOverlay=renderBuildOverlay;
    }catch(e){}
    ensureHelpers();
  }
  function forceClear(){
    try{if(!state)return;state._assemblyActive=false;state.buildPick={};
      if(state.buildBought)["cpu","gpu","ram","ssd","psu","mobo","cooler","case"].forEach(function(c){delete state.buildBought[c];});
      state.moboCased=false;state.pasteDone=false;state.biosDone=false;}catch(e){}
  }
  function boot(){
    expose();
    try{if(window.PartShop){PartShop.forceClearBuildSelectionUI=forceClear;
      var p=PartShop.consumeBuildParts;PartShop.consumeBuildParts=function(){if(typeof p==="function")p();forceClear();};}}catch(e){}
  }
  boot();
  var n=0,iv=setInterval(function(){n++;expose();boot();if(n>40)clearInterval(iv);},250);
  var n2=0,iv2=setInterval(function(){n2++;ensureHelpers();if(n2>60)clearInterval(iv2);},200);
  console.log("[HASHPOOL] partShopFix helpers=", typeof window.partTierBadge);
})();

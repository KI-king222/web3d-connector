/* partShop.js — wait for window.state + catalog, then chunks; polyfill tier helpers */
(function(){
  var N=11, base="https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/", v="?v=20261030p";
  var booted=false, tries=0;

  function ensureHelpers(){
    if(typeof window.partBaseName !== "function"){
      window.partBaseName = function(it){
        if(!it) return "";
        return (it.brand ? it.brand + " " : "") + (it.model || "");
      };
    }
    if(typeof window.partTierLabel !== "function"){
      window.PART_TIER_LABELS = window.PART_TIER_LABELS || {
        en:["Entry","Basic","Budget","Mainstream","Mainstream+","Performance","High-End","High-End+","Enthusiast","Flagship"],
        de:["Einsteiger","Basis","Budget","Mittelklasse","Mittelklasse+","Gehoben","High-End","High-End+","Enthusiast","Flaggschiff"]
      };
      window.partTierLabel = function(it, lang){
        var L = window.PART_TIER_LABELS[lang || (window.state && window.state.lang === "de" ? "de" : "en")] || window.PART_TIER_LABELS.de;
        var t = (it && it.tier) ? it.tier : 1;
        return L[Math.max(0, Math.min(L.length - 1, t - 1))] || ("T" + t);
      };
    }
    if(typeof window.partTierBadge !== "function"){
      window.partTierBadge = function(it, lang){
        var t = (it && it.tier) ? it.tier : 1;
        return "T" + t + " · " + window.partTierLabel(it, lang);
      };
    }
    if(typeof window.partDisplayName !== "function"){
      window.partDisplayName = function(it){
        return window.partBaseName(it) + " · " + window.partTierLabel(it);
      };
    }
  }

  function run(){
    if(booted) return;
    booted=true;
    ensureHelpers();
    var parts=new Array(N), done=0;
    function go(){
      if(done<N) return;
      try{
        ensureHelpers();
        var prefix =
          "var PART_CATALOG=window.PART_CATALOG;" +
          "var PART_CATEGORIES=window.PART_CATEGORIES;" +
          "var PART_BY_ID=window.PART_BY_ID;" +
          "var state=window.state;" +
          "var save=window.save;" +
          "var fmtSats=window.fmtSats;" +
          "var updateBalanceUI=window.updateBalanceUI;" +
          "var openBuildOverlay=window.openBuildOverlay;" +
          "var renderBuildOverlay=window.renderBuildOverlay;" +
          "var partBaseName=window.partBaseName;" +
          "var partTierLabel=window.partTierLabel;" +
          "var partTierBadge=window.partTierBadge;" +
          "var partDisplayName=window.partDisplayName;" +
          "var PART_TIER_LABELS=window.PART_TIER_LABELS;";
        (0,eval)(prefix + parts.join(""));
        console.log("[HASHPOOL] partShop open=", !!(window.PartShop&&window.PartShop.open), "state=", !!window.state, "tierBadge=", typeof window.partTierBadge);
      }catch(e){console.error("[HASHPOOL] partShop",e);}
    }
    for(var i=0;i<N;i++)(function(i){
      fetch(base+"ps_c"+i+".js"+v,{cache:"no-store"}).then(function(r){return r.text();}).then(function(t){parts[i]=t;done++;go();}).catch(function(){parts[i]="";done++;go();});
    })(i);
  }
  function ensureCat(cb){
    ensureHelpers();
    if(window.PART_CATALOG){ cb(); return; }
    if(typeof PART_CATALOG!=="undefined"){
      window.PART_CATALOG=PART_CATALOG;
      window.PART_CATEGORIES=typeof PART_CATEGORIES!=="undefined"?PART_CATEGORIES:Object.keys(PART_CATALOG);
      window.PART_BY_ID=typeof PART_BY_ID!=="undefined"?PART_BY_ID:{};
      cb(); return;
    }
    fetch(base+"partCatalog.js"+v,{cache:"no-store"}).then(function(r){return r.text();}).then(function(t){
      (0,eval)(t);
      try{
        window.PART_CATALOG=PART_CATALOG;
        window.PART_CATEGORIES=PART_CATEGORIES;
        window.PART_BY_ID=PART_BY_ID;
        if(typeof partBaseName==="function") window.partBaseName=partBaseName;
        if(typeof partTierLabel==="function") window.partTierLabel=partTierLabel;
        if(typeof partTierBadge==="function") window.partTierBadge=partTierBadge;
        if(typeof partDisplayName==="function") window.partDisplayName=partDisplayName;
        if(typeof PART_TIER_LABELS!=="undefined") window.PART_TIER_LABELS=PART_TIER_LABELS;
      }catch(_e){}
      ensureHelpers();
      cb();
    }).catch(function(){ ensureHelpers(); cb(); });
  }
  function wait(){
    tries++;
    if(window.state){ ensureCat(run); return; }
    if(tries<50) setTimeout(wait, 100);
    else { console.warn("[HASHPOOL] no window.state after 5s"); ensureCat(run); }
  }
  setTimeout(wait, 200);
})();

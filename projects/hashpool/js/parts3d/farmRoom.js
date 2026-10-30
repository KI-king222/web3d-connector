/* farmRoom loader + partTierBadge polyfill (shop list crash fix) */
(function () {
  var W = window;
  /* --- tier helpers: PartShop list/picker crash without these --- */
  function ensureHelpers(){
    if(typeof W.partBaseName!=="function"){
      W.partBaseName=function(it){if(!it)return"";return(it.brand?it.brand+" ":"")+(it.model||"");};
    }
    if(typeof W.partTierLabel!=="function"){
      W.PART_TIER_LABELS=W.PART_TIER_LABELS||{
        en:["Entry","Basic","Budget","Mainstream","Mainstream+","Performance","High-End","High-End+","Enthusiast","Flagship"],
        de:["Einsteiger","Basis","Budget","Mittelklasse","Mittelklasse+","Gehoben","High-End","High-End+","Enthusiast","Flaggschiff"]
      };
      W.partTierLabel=function(it,lang){
        var L=W.PART_TIER_LABELS[lang||(W.state&&W.state.lang==="de"?"de":"en")]||W.PART_TIER_LABELS.de;
        var t=(it&&it.tier)?it.tier:1;
        return L[Math.max(0,Math.min(L.length-1,t-1))]||("T"+t);
      };
    }
    if(typeof W.partTierBadge!=="function"){
      W.partTierBadge=function(it,lang){
        var t=(it&&it.tier)?it.tier:1;
        return "T"+t+" \u00b7 "+W.partTierLabel(it,lang);
      };
    }
    if(typeof W.partDisplayName!=="function"){
      W.partDisplayName=function(it){return W.partBaseName(it)+" \u00b7 "+W.partTierLabel(it);};
    }
    try{
      if(typeof partBaseName==="undefined") partBaseName=W.partBaseName;
      if(typeof partTierLabel==="undefined") partTierLabel=W.partTierLabel;
      if(typeof partTierBadge==="undefined") partTierBadge=W.partTierBadge;
      if(typeof partDisplayName==="undefined") partDisplayName=W.partDisplayName;
    }catch(e){}
  }
  ensureHelpers();
  setInterval(ensureHelpers, 500);
  console.log("[HASHPOOL] tierHelpers=", typeof W.partTierBadge);

  if (W.__farmRoomLoader) return; W.__farmRoomLoader = true;
  if (/[?&]nofarm(=|&|$)/.test(String(W.location && W.location.search))) return;
  function loadOne(url, label, done) {
    fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        if (!t || t.length < 50) throw new Error("empty");
        try { (0, eval)(t); } catch (e) { console.warn("[" + label + "] eval", e); }
        if (done) done();
      })
      .catch(function (e) { console.warn("[" + label + "]", e); if (done) done(); });
  }
  var roomUrls = [
    "https://cdn.jsdelivr.net/gh/KI-king222/Bitcoin-Clicker@98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js",
    "https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/98a2051876686a35cd8dced32a566924e5e17a6e/js/parts3d/farmRoom.js"
  ];
  function loadRoom(i) {
    if (i >= roomUrls.length) { loadFix(); return; }
    fetch(roomUrls[i], { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        if (!t || t.indexOf("function hookSell") < 0) throw new Error("bad body");
        try { (0, eval)(t); } catch (e) { console.warn("[farmRoom] eval", e); }
        loadFix();
      })
      .catch(function (e) { console.warn("[farmRoom] try", i, e); loadRoom(i + 1); });
  }
  function loadFix() {
    loadOne("https://cdn.jsdelivr.net/gh/KI-king222/Bitcoin-Clicker@c822a2762420bcf43c351ea7e1919fafc56c6bbc/js/parts3d/farmFix.js", "farmFix");
    loadOne("https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/parts3d/farmFix.js", "farmFix-raw");
  }
  loadRoom(0);
})();

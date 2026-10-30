/* farmFix.js — click-capture so 3D Farm gets buildPick after sell (game is in IIFE) */
(function(){
  var W = window;
  if (W.__farmFix) return; W.__farmFix = true;
  function captureIds(){
    try {
      var bp = (W.state && W.state.buildPick) || {};
      var ids = {};
      ["case","mobo","cpu","cooler","ram","gpu","psu","ssd"].forEach(function(k){
        if (bp[k]) ids[k] = [].concat(bp[k])[0];
      });
      return Object.keys(ids).length ? ids : null;
    } catch(e){ return null; }
  }
  function tryOffer(ids){
    try {
      if (!ids) return;
      W.dispatchEvent(new CustomEvent("hashpool-farm-offer", { detail: { partIds: ids } }));
    } catch(e){ console.warn("[farmFix]", e); }
  }
  document.addEventListener("click", function(ev){
    try {
      var t = ev.target && (ev.target.closest ? ev.target.closest("#bo-action-btn,#bo-farm-btn") : null);
      if (!t) return;
      var txt = (t.textContent || "").toLowerCase();
      var isSell = t.id === "bo-action-btn" && (txt.indexOf("sell") >= 0 || txt.indexOf("verkauf") >= 0);
      var isFarm = t.id === "bo-farm-btn";
      if (!isSell && !isFarm) return;
      var ids = captureIds();
      if (!ids) return;
      setTimeout(function(){ tryOffer(ids); }, isFarm ? 150 : 700);
    } catch(e){}
  }, true);
  W.addEventListener("hashpool-farm-offer", function(ev){
    try {
      var ids = ev.detail && ev.detail.partIds;
      if (!ids) return;
      if (W.Parts3D && Parts3D.farm && Parts3D.farm.add) {
        var full = (Parts3D.farm.slots() || []).length >= 6;
        if (full) {
          if (Parts3D.farm.open) Parts3D.farm.open();
          return;
        }
        var r = Parts3D.farm.add(ids);
        if (r && Parts3D.farm.open) { Parts3D.farm.open(); if (Parts3D.farm.select) Parts3D.farm.select(r.pos); }
      }
    } catch(e){ console.warn("[farmFix] offer", e); }
  });
  console.log("[HASHPOOL] farmFix active");
})();

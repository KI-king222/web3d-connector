/* farmFix.js — click-capture so 3D Farm gets buildPick after sell (game is in IIFE)
 * Fixes (2026-10-31):
 *  - Angebot erst, wenn der Verkauf wirklich stattgefunden hat (state.rigsSold steigt), nicht schon beim Klick (z. B. bei abgebrochener Bestaetigung)
 *  - Nach dem Verkauf: uebrig gebliebene Teile-Auswahl (buildPick) verbrauchen und Bau-Menue schliessen, damit derselbe PC nicht nochmal gebaut werden kann
 *  - Doppelte Eintraege vermeiden (gleiches Rig innerhalb weniger Sekunden schon in der Farm)
 */
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
  function sold(){ try { return Number(W.state && W.state.rigsSold) || 0; } catch(e){ return 0; } }
  function tryOffer(ids, wasSale){
    try {
      if (!ids) return;
      W.dispatchEvent(new CustomEvent("hashpool-farm-offer", { detail: { partIds: ids, sale: !!wasSale } }));
    } catch(e){ console.warn("[farmFix]", e); }
  }
  function afterSaleCleanup(){
    try {
      var bp = W.state && W.state.buildPick;
      if (bp && (bp.cpu || bp.mobo || bp["case"])) {                       // Auswahl ist nach dem Verkauf noch da -> verbrauchen
        if (W.PartShop && W.PartShop.consumeBuildParts) W.PartShop.consumeBuildParts();
        else if (W.PartShop && W.PartShop.clearBuildSelectionUI) W.PartShop.clearBuildSelectionUI();
        else W.state.buildPick = {};
      }
      var bo = document.getElementById("build-overlay");
      if (bo && bo.style.display && bo.style.display !== "none") bo.style.display = "none";
    } catch(e){ console.warn("[farmFix] cleanup", e); }
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
      if (isFarm) { setTimeout(function(){ tryOffer(ids, false); }, 150); return; }
      var before = sold(), n = 0;                                          // Verkauf abwarten (bis 30 s, falls eine Bestaetigung dazwischen liegt)
      var iv = setInterval(function(){
        n++;
        if (sold() > before) { clearInterval(iv); setTimeout(function(){ tryOffer(ids, true); }, 400); }
        else if (n > 100) clearInterval(iv);
      }, 300);
    } catch(e){}
  }, true);
  W.addEventListener("hashpool-farm-offer", function(ev){
    try {
      var ids = ev.detail && ev.detail.partIds, wasSale = !!(ev.detail && ev.detail.sale);
      if (!ids) return;
      if (wasSale) afterSaleCleanup();
      if (W.Parts3D && Parts3D.farm && Parts3D.farm.add) {
        var slots = Parts3D.farm.slots() || [], key = JSON.stringify(ids), now = Date.now();
        for (var i = 0; i < slots.length; i++) {                           // schon (gerade eben) abgestellt? nicht doppelt
          if (JSON.stringify(slots[i].partIds) === key && now - (slots[i].placedAt || 0) < 15000) { if (Parts3D.farm.open) Parts3D.farm.open(); return; }
        }
        var full = slots.length >= 6;
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

/* farmFix.js v4 — click-capture so 3D Farm gets buildPick after sell / "In Farm stellen" (game is in IIFE)
 *  - Angebot bei Verkauf erst nach echtem Verkauf (state.rigsSold steigt); bei "In Farm stellen" sofort
 *  - In beiden Faellen: Auswahl verbrauchen, Bau-Menue/Picker versteckt halten -> nach dem Schliessen der Farm Hauptscreen,
 *    bis der Spieler selbst wieder "Bauen" startet (max. 5 Min.)
 *  - Keine Doppel-Eintraege
 */
(function(){
  var W = window;
  if (W.__farmFixVer >= 4) return;
  W.__farmFixVer = 4; W.__farmFix = true;
  var guardUntil = 0;
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
  function hideBuildUI(){
    ["build-overlay","ps-picker"].forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.style.display !== "none") el.style.display = "none";
    });
  }
  setInterval(function(){ if (Date.now() < guardUntil) hideBuildUI(); }, 150);
  document.addEventListener("click", function(ev){
    try {
      if (Date.now() >= guardUntil) return;
      var t = ev.target && ev.target.closest ? ev.target.closest("button,[onclick],.btn,a") : null;
      if (!t) return;
      var s = ((t.id || "") + " " + (t.textContent || "")).toLowerCase();
      if (/build|bauen|zusammenbau|assemble|ps-open|neuen pc|new pc/.test(s) && !/farm/.test(s)) guardUntil = 0;
    } catch(e){}
  }, true);
  function afterOfferCleanup(){
    guardUntil = Date.now() + 300000;
    try {
      var bp = W.state && W.state.buildPick;
      if (bp && (bp.cpu || bp.mobo || bp["case"])) {
        if (W.PartShop && W.PartShop.consumeBuildParts) W.PartShop.consumeBuildParts();
        else if (W.PartShop && W.PartShop.clearBuildSelectionUI) W.PartShop.clearBuildSelectionUI();
        else W.state.buildPick = {};
      }
      hideBuildUI();
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
      var before = sold(), n = 0;
      var iv = setInterval(function(){
        n++;
        if (sold() > before) { clearInterval(iv); setTimeout(function(){ tryOffer(ids, true); }, 400); }
        else if (n > 100) clearInterval(iv);
      }, 300);
    } catch(e){}
  }, true);
  W.addEventListener("hashpool-farm-offer", function(ev){
    try {
      var ids = ev.detail && ev.detail.partIds;
      if (!ids) return;
      if (W.Parts3D && Parts3D.farm && Parts3D.farm.add) {
        var slots = Parts3D.farm.slots() || [], key = JSON.stringify(ids), now = Date.now();
        for (var i = 0; i < slots.length; i++) {
          if (JSON.stringify(slots[i].partIds) === key && now - (slots[i].placedAt || 0) < 15000) { afterOfferCleanup(); if (Parts3D.farm.open) Parts3D.farm.open(); return; }
        }
        if (slots.length >= 6) { if (Parts3D.farm.open) Parts3D.farm.open(); return; }
        var r = Parts3D.farm.add(ids);
        afterOfferCleanup();
        if (r && Parts3D.farm.open) { Parts3D.farm.open(); if (Parts3D.farm.select) Parts3D.farm.select(r.pos); }
      }
    } catch(e){ console.warn("[farmFix] offer", e); }
  });
  console.log("[HASHPOOL] farmFix v4 active");
})();

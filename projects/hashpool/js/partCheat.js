/* partCheat.js — grantAllParts by catalog id + buy/select SFX */
(function(){
  function ensureInv(){
    if(typeof state === "undefined") return false;
    if(!state.partInv) state.partInv = {};
    if(!state.buildBought) state.buildBought = {};
    return true;
  }
  function grantAllParts(qty){
    if(!ensureInv()) return 0;
    qty = Math.max(1, Number(qty)||1);
    var n = 0;
    try{
      if(typeof PART_BY_ID !== "undefined" && PART_BY_ID){
        Object.keys(PART_BY_ID).forEach(function(id){
          state.partInv[id] = (state.partInv[id]||0) + qty;
          n++;
          var it = PART_BY_ID[id];
          if(it && it.cat) state.buildBought[it.cat] = true;
        });
      } else if(typeof PART_CATALOG !== "undefined" && PART_CATALOG){
        Object.keys(PART_CATALOG).forEach(function(cat){
          (PART_CATALOG[cat].items||[]).forEach(function(it){
            if(!it || !it.id) return;
            state.partInv[it.id] = (state.partInv[it.id]||0) + qty;
            n++;
          });
          state.buildBought[cat] = true;
        });
      }
      if(typeof save === "function") save();
      if(typeof updateBalanceUI === "function") updateBalanceUI();
    }catch(e){ console.warn("grantAllParts", e); }
    return n;
  }
  function sfxBuy(){
    try{
      if(typeof beep === "function"){ beep(660, 0.07, "sine", 0.14); setTimeout(function(){ beep(880, 0.08, "sine", 0.12); }, 70); }
      else if(typeof sfxClick === "function") sfxClick();
    }catch(e){}
  }
  function sfxSelect(){
    try{
      if(typeof beep === "function") beep(440, 0.04, "triangle", 0.10);
      else if(typeof sfxClick === "function") sfxClick();
    }catch(e){}
  }
  function bind(){
    window.PartShop = window.PartShop || {};
    window.PartShop.grantAllParts = grantAllParts;
    window.PartShop.sfxBuy = sfxBuy;
    window.PartShop.sfxSelect = sfxSelect;
  }
  bind();
  setTimeout(bind, 500);
  setTimeout(bind, 2000);
  document.addEventListener("click", function(e){
    var t = e.target;
    if(!t) return;
    if(t.id === "ps-buy" || (t.closest && t.closest("#ps-buy"))){
      sfxBuy();
    } else if(t.closest && (t.closest(".ps-row") || t.closest("[data-pick-id]"))){
      sfxSelect();
    }
  }, true);
})();

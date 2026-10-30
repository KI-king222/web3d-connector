/* partShopFix — expose state after init + soft clear */
(function(){
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
  setTimeout(boot,300);
  setTimeout(boot,800);
  setTimeout(boot,1500);
  setTimeout(boot,3000);
})();

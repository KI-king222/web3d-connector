kBtn) backBtn.addEventListener("click", function(){
      if(view.mode === "list"){ view.mode = "shelves"; view.cat = null; view.selected = null; render(); }
    });
    var buildBtn = document.getElementById("open-build-btn");
    if(buildBtn && !buildBtn._psWired){
      buildBtn._psWired = true;
      buildBtn.addEventListener("click", function(e){
        e.stopImmediatePropagation(); e.preventDefault();
        openPicker();
      }, true);
    }
  }
  window.PartShop = {
    open: openShop, close: closeShop, openPicker: openPicker, closePicker: closePicker,
    canBuildPC: canBuildPC, selectedBuildCost: selectedBuildCost, sellMult: sellMult,
    avgPickedTier: avgPickedTier, allPicked: allPicked,
    consumeBuildParts: consumeBuildParts, clearBuildSelectionUI: clearBuildSelectionUI,
    REQUIRED: REQUIRED_FOR_BUILD, ensureInv: ensureInv
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else setTimeout(wire, 0);
})();

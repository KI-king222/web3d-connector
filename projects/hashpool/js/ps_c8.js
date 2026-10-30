2px">'+(state.lang==="de"?"Noch nicht alle Kategorien gewählt":"Select all categories first")+'</button>';
    }
    body.innerHTML = html;
    body.querySelectorAll("[data-acc-cat]").forEach(function(el){
      el.addEventListener("click", function(){
        var c = el.getAttribute("data-acc-cat");
        pickerExpand[c] = !pickerExpand[c];
        renderPicker();
      });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click", function(){
        state.buildPick[el.getAttribute("data-pick-cat")] = el.getAttribute("data-pick-id");
        try{ if(window.PartShop && PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
        renderPicker();
      });
    });
    var go = document.getElementById("ps-picker-go");
    if(go) go.addEventListener("click", function(){
      ensureInv();
      if(!state.buildBought) state.buildBought = {};
      REQUIRED_FOR_BUILD.forEach(function(c){ state.buildBought[c] = true; });
      try{ if(typeof PARTS !== "undefined"){ PARTS.forEach(function(p){ state.buildBought[p.id] = true; }); } }catch(_p){}
      state._assemblyActive = true;
      if(typeof save === "function") save();
      closePicker();
      if(typeof openBuildOverlay === "function") openBuildOverlay();
      /* force assembly view — never leave old shop panel visible */
      try{
        var sp = document.getElementById("bo-shop");
        var rp = document.getElementById("bo-rig-area");
        if(sp) sp.style.display = "none";
        if(rp) rp.style.display = "flex";
        if(typeof renderBuildOverlay === "function") renderBuildOverlay();
        if(sp) sp.style.display = "none";
        if(rp) rp.style.display =
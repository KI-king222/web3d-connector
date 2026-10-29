/* moveGhost-2.js — renderBuildOverlay */
  function renderBuildOverlay(){
    var shopPanel = document.getElementById("bo-shop");
    var rigPanel = document.getElementById("bo-rig-area");
    var stepsEl = document.getElementById("bo-steps");
    var actionBtn = document.getElementById("bo-action-btn");
    var bootScreen = document.getElementById("boot-screen");

    document.getElementById("mode-quick-label").textContent = t("modeQuick");
    document.getElementById("mode-detailed-label").textContent = t("modeDetailed");
    document.getElementById("mode-quick").className = "bo-mode-btn" + (state.buildMode === "quick" ? " active" : "");
    document.getElementById("mode-detailed").className = "bo-mode-btn" + (state.buildMode === "detailed" ? " active" : "");
    document.getElementById("mode-quick").onclick = function(){ if(state.buildMode!=="quick"){ state.buildMode="quick"; save(); render(); } };
    document.getElementById("mode-detailed").onclick = function(){ if(state.buildMode!=="detailed"){ state.buildMode="detailed"; save(); render(); } };

    if(!allBought()){
      shopPanel.style.display = "flex";
      rigPanel.style.display = "none";
      autoRotate = true;
      var bn = PARTS.filter(function(p){ return state.buildBought[p.id]; }).length;
      stepsEl.textContent = t("stepShop") + " · " + t("partsProgress").replace("{n}", bn);
      document.getElementById("bo-shop-hint").textContent = t("shopHint");
      var assBtn = document.getElementById("bo-to-assemble");
      if(assBtn) assBtn.textContent = t("startAssembly");

      var grid = document.getElementById("bo-shop-grid");
      grid.innerHTML = "";
      PARTS.forEach(function(p){
        var bought = !!state.buildBought[p.id];
        var c = buildPartCost(p);
        var affordable = state.balance >= c;
        var btn = document.createElement("button");
        btn.className = "tray-part";
        btn.disabled = bought || !affordable;
        btn.innerHTML =
          '<span class="picon">'+p.icon+'</span>' +
          '<span class="pname">'+p.name[state.lang]+'</span>' +
          '<span class="pcost">'+(bought ? "✓" : fmtCost(c))+'</span>';
        if(!bought){
          btn.addEventListener("click", function(){
            if(state.balance < c) return;
            state.balance -= c;
            state.buildBought[p.id] = true;
            if(state.ex.deals[p.id]) state.ex.used[p.id] = true;
            sfxBuy();
            save();
            render();
          });
        }
        grid.appendChild(btn);
      });
      document.getElementById("bo-to-assemble").disabled = !allBought();
    } else {
      shopPanel.style.display = "none";
      rigPanel.style.display = "flex";
      autoRotate = false;
      exHideFarmBtn();
      if(!state.moboCased && !moboCaseAnim && !framingDone){ camTarget.x = 0.95; camTarget.y = 0; camTarget.z = 12.5; framingDone = true; }
      if(state.moboCased && !framingDoneCase){ camTarget.x = 0; camTarget.y = 0; camTarget.z = 8; framingDoneCase = true; }

      PARTS.forEach(function(p){ setPartVisual(p.id, !!state.buildInstalled[p.id]); });

      var tableEl = document.getElementById("parts-tray");
      tableEl.innerHTML = "";
      var partsDone = allInstalled();
      var cablesDone = allCablesReady();
      var done = partsDone && cablesDone;
      if(!partsDone){
        stepsEl.textContent = t("stepAssemble");
        if(moboReadyForCase() && !state.moboCased){
          var caseCard = document.createElement("button");
          caseCard.className = "tray-part";
          caseCard.innerHTML =
            '<span class="picon">🧩➡️🖥️</span>' +
            '<span class="pname">'+PSEUDO_NAMES.moboCase[state.lang]+'</span>' +
            '<span class="pcost">'+(state.buildMode === "detailed" ? t("dragToInstall") : t("tapToInstall"))+'</span>';
          if(state.buildMode === "detailed"){
            caseCard.addEventListener("pointerdown", function(e){
              startDrag(e, "moboCase", "mobo", "🧩➡️🖥️", PSEUDO_NAMES.moboCase[state.lang]);
            });
          } else {
            caseCard.addEventListener("click", function(){ caseTheMobo(); });
          }
          tableEl.appendChild(caseCard);
        }
        PARTS.slice().sort(functi

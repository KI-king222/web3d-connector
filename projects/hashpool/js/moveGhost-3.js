/* moveGhost-3.js — build overlay stages */
on(a,b){ return (partAvailable(b.id)?1:0) - (partAvailable(a.id)?1:0); }).forEach(function(p){
          if(state.buildInstalled[p.id]) return;
          var available = partAvailable(p.id);
          var card = document.createElement("button");
          card.className = "tray-part" + (available ? "" : " pending");
          card.disabled = !available;
          card.innerHTML =
            '<span class="picon">'+p.icon+'</span>' +
            '<span class="pname">'+p.name[state.lang]+'</span>' +
            '<span class="pcost">'+(!available ? missingDepsLabel(p.id) : (state.buildMode === "detailed" ? t("dragToInstall") : t("tapToInstall")))+'</span>';
          if(available){
            if(state.buildMode === "detailed"){
              card.addEventListener("pointerdown", function(e){
                startDrag(e, "part", p.id, p.icon, p.name[state.lang]);
              });
            } else {
              card.addEventListener("click", function(){
                state.buildInstalled[p.id] = true;
                sfxInstall();
                save();
                render();
              });
            }
          }
          tableEl.appendChild(card);
        });
        actionBtn.style.display = "none";
        bootScreen.style.display = "none";
      } else if(!cablesDone){
        stepsEl.textContent = t("stepAssemble");
        Object.keys(CABLES).forEach(function(key){
          if(state.buildCablesDone[key]) return;
          var cfg = CABLES[key];
          var card = document.createElement("button");
          card.className = "tray-part";
          card.innerHTML =
            '<span class="picon">'+cfg.icon+'</span>' +
            '<span class="pname">'+t(cfg.labelKey)+'</span>' +
            '<span class="pcost">'+t("dragToConnect")+'</span>';
          card.addEventListener("pointerdown", function(e){
            startDrag(e, "cable", key, cfg.icon, t(cfg.labelKey));
          });
          tableEl.appendChild(card);
        });
        actionBtn.style.display = "none";
        bootScreen.style.display = "none";
      } else if(!bootPlayed){
        autoRotate = true;
        stepsEl.textContent = t("stepBoot");
        actionBtn.style.display = "block";
        actionBtn.disabled = bootPlaying;
        actionBtn.textContent = t("powerOnBtn");
        actionBtn.onclick = function(){
          // Paste, then BIOS key-press minigame (mobile-friendly buttons), then ready to sell
          openPasteStage(function(){
            openBiosStage(function(){
              bootPlayed = true;
              bootPlaying = false;
              var bs = document.getElementById("boot-screen");
              if(bs) bs.style.display = "none";
              save();
              render();
            });
          });
        };
        bootScreen.style.display = bootPlaying ? "block" : "none";
      } else {
        stepsEl.textContent = t("stepComplete");
        bootScreen.style.display = "none";
        actionBtn.style.display = "block";
        actionBtn.disabled = false;
        var pasteMul = 0.85 + 0.25 * (state.pasteQuality || 0.75);
        var biosMul = 0.9 + 0.15 * (state.biosQuality || 0.8);
        var reward = Math.round(buildTotalCost() * 1.38 * pasteMul * biosMul * exMarketMult() * exSpeedBonus());
        actionBtn.textContent = t("sellBtn") + " " + fmtCost(reward);
        actionBtn.onclick = function(){ sellRig(reward); };
        exFarmBtn(reward);
      }
    }
  }


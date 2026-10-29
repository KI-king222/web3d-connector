/* playBootSequence.js — Modul 16/22 */

  function playBootSequence(){
    if(bootPlaying) return;
    bootPlaying = true;
    var bootScreen = document.getElementById("boot-screen");
    var bootText = document.getElementById("boot-text");
    var bar = document.getElementById("boot-bar-fill");
    bootScreen.style.display = "block";
    bootText.textContent = "";
    bar.style.width = "0%";
    document.getElementById("bo-action-btn").disabled = true;

    var lines = t("bootLines");
    lines.forEach(function(line, i){
      setTimeout(function(){
        bootText.textContent += (i>0 ? "\n" : "") + line;
      }, i * 380);
    });
    setTimeout(function(){ bar.style.width = "100%"; }, 50);
    sfxInstall();

    setTimeout(function(){
      bootPlaying = false;
      if(exBootFault()){ render(); return; }
      bootPlayed = true;
      exAfterBoot();
      render();
    }, lines.length * 380 + 500);
  }

  function sellRig(reward){
    state.balance += reward;
    state.lifetime += reward;
    state.rigsSold += 1;
    PARTS.forEach(function(p){
      state.buildBought[p.id] = false;
      state.buildInstalled[p.id] = false;
      removeScrews(p.id);
    });
    Object.keys(CABLES).forEach(function(k){ state.buildCablesDone[k] = false; });
    removeAllCables();
    state.moboCased = false;
    state.pasteQuality = 0.75;
    state.pasteDone = false;
    state.biosDone = false;
    state.biosQuality = 0.8;
    exOnSell();
    framingDone = false; framingDoneCase = false;
    bootPlayed = false;
    sfxHalving();
    save();
    render();
    if(reward > 0){
      try {
        document.getElementById("build-overlay").style.display = "none";
        document.getElementById("welcome-title").textContent = t("buildSoldTitle");
        document.getElementById("welcome-body").textContent = t("buildSoldBody") + " " + t("buildNextHint");
        document.getElementById("welcome-amount").textContent = "+" + fmtSats(reward) + " sats";
        document.getElementById("welcome-close").textContent = t("close");
        document.getElementById("welcome-modal").style.display = "flex";
      } catch (e) {}
    }
  }

  function renderHalving(){
    var mult = state.halvings * 50;
    document.getElementById("halving-title").textContent = t("halvingTitle");
    document.getElementById("halving-desc").textContent = t("halvingDesc");
    document.getElementById("halving-mult-val").textContent = "+" + mult + "%";
    var need = halvingThreshold();
    var pct = Math.min(100, (state.lifetime / need) * 100);
    document.getElementById("halving-fill").style.width = pct + "%";
    document.getElementById("halving-progress-text").textContent = fmtSats(state.lifetime) + " / " + fmtSats(need) + " " + t("halvingNeed");
    var btn = document.getElementById("halving-btn");
    var unlocked = state.lifetime >= need;
    btn.disabled = !unlocked;
    btn.textContent = unlocked ? t("halvingBtn") : t("halvingLocked");
  }

  function showBuyToast(msg){
    var el = document.getElementById("buy-toast");
    if(!el){
      el = document.createElement("div");
      el.id = "buy-toast";
      el.className = "buy-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showBuyToast._t);
    showBuyToast._t = setTimeout(function(){ el.classList.remove("show"); }, 1400);
  }

  function buy(u){
    var c = bulkCost(u, state.owned[u.id], state.buyQty);
    if(state.balance < c) return;
    state.balance -= c;
    state.owned[u.id] += state.buyQty;
    showBuyToast(t("bought") + " " + u.name[state.lang] + " ×" + state.buyQty);
    sfxBuy();
    save();
    render();
  }

  function buyClick(u){
    var c = bulkCost(u, state.clickOwned[u.id], state.buyQty);
    if(state.balance < c) return;
    state.balance -= c;
    state.clickOwned[u.id] += state.buyQty;
    showBuyToast(t("bought") + " " + u.name[state.lang] + " ×" + state.buyQty);
    sfxBuy();
    save();
    render();
  }

  function spawnFloat(amount, x, crit){
    var f = document.createElement("div");
    f.className = "float" + (crit ? " crit" : "");
    f.style.left = (50 + x) + "%";
    f.textContent = (crit ? t("critical") + " " : "") + "+" + fmtSats(amount);
    floaters.appendChild(f);
    setTimeout(function(){ f.remove(); }, 950);
  }

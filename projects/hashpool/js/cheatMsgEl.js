/* cheatMsgEl.js — Modul 18/22 */

  var cheatMsgEl = document.getElementById("cheat-msg");
  var cheatMsgTimer = null;
  function showCheatMsg(text, ok){
    cheatMsgEl.textContent = text;
    cheatMsgEl.className = "cheat-msg " + (ok ? "ok" : "err");
    clearTimeout(cheatMsgTimer);
    cheatMsgTimer = setTimeout(function(){ cheatMsgEl.textContent = ""; cheatMsgEl.className = "cheat-msg"; }, 4000);
  }
  function redeemCheat(){
    var input = document.getElementById("cheat-input");
    var code = input.value.trim().toUpperCase();
    if(!code) return;
    if(state.redeemed[code]){
      showCheatMsg(t("cheatUsed"), false);
      return;
    }
    var reward = CHEATS[code];
    if(!reward){
      showCheatMsg(t("cheatInvalid"), false);
      return;
    }
    state.redeemed[code] = true;
    state.balance += reward.sats;
    state.lifetime += reward.sats;
    save();
    render();
    input.value = "";
    balanceEl.classList.remove("flash");
    void balanceEl.offsetWidth;
    balanceEl.classList.add("flash");
    showCheatMsg(t("cheatOk") + " +" + fmtSats(reward.sats) + " sats", true);
  }
  document.getElementById("cheat-btn").addEventListener("click", redeemCheat);
  document.getElementById("cheat-input").addEventListener("keydown", function(e){
    if(e.key === "Enter") redeemCheat();
  });

  document.getElementById("mute-btn").addEventListener("click", function(){
    state.muted = !state.muted;
    save();
    applyStaticText();
    if(!state.muted) sfxClick();
  });

  function currentSaveData(){
    return {
      balance:state.balance, owned:state.owned, clickOwned:state.clickOwned, lang:state.lang,
      username:state.username, redeemed:state.redeemed, lifetime:state.lifetime,
      halvings:state.halvings, muted:state.muted, buildBought:state.buildBought, buildInstalled:state.buildInstalled, rigsSold:state.rigsSold, lastSeen:Date.now()
    };
  }

  document.getElementById("export-btn").addEventListener("click", async function(){
    var data = JSON.stringify(currentSaveData(), null, 2);
    try{
      var downloads = window.claude && window.claude.use ? await window.claude.use("downloads") : null;
      if(downloads){
        await downloads.save({ filename: "hashpool-save.json", data: data });
        showCheatMsg(t("exportedMsg"), true);
        return;
      }
    }catch(e){}
    try{
      var blob = new Blob([data], {type:"application/json"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "hashpool-save.json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showCheatMsg(t("exportedMsg"), true);
    }catch(e){}
  });

  document.getElementById("import-btn").addEventListener("click", function(){
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", function(e){
    var file = e.target.files && e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var data = JSON.parse(reader.result);
        if(typeof data.balance !== "number" || typeof data.owned !== "object"){
          throw new Error("invalid");
        }
        state.balance = data.balance || 0;
        state.owned = data.owned || state.owned;
        state.clickOwned = data.clickOwned || state.clickOwned;
        state.lang = data.lang || state.lang;
        state.username = data.username || "";
        state.redeemed = data.redeemed || {};
        state.lifetime = data.lifetime || 0;
        state.halvings = data.halvings || 0;
        state.muted = !!data.muted;
        state.buildBought = data.buildBought || state.buildBought;
        state.buildInstalled = data.buildInstalled || state.buildInstalled;
        state.rigsSold = data.rigsSold || 0;
        save();
        render();
        showCheatMsg(t("importedMsg"), true);
      }catch(err){
        showCheatMsg(t("importError"), false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("open-build-btn").addEventListener("click", openBuildOverlay);
  document.getElementById("bo-close").addEventListener("click", closeBuildOverlay);
  document.getElementById("bo-to-assemble").addEventListener("click", function(){ renderBuildOverlay(); });

  document.getElementById("welcome-close").addEventListener("click", function(){
    document.getElementById("welcome-modal").style.display = "none";
  });

  /* ================= EXTRAS: Markt, Hitze, Events, Farm, Missionen ================= */

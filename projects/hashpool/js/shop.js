/* shop.js — Kauf-Aktionen Miner & Click-Power */
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

  var mineBtn = document.getElementById("mine-btn");
  mineBtn.addEventListener("click", function(e){
    var crit = Math.random() < 0.08;
    var gain = crit ? state.perClick * 8 : state.perClick;
    state.balance += gain;
    state.lifetime += gain;
    if(crit){ sfxCrit(); } else { sfxClick(); }
    spawnFloat(gain, (Math.random()*20-10), crit);
    save();
    render();
  });

  // passive income tick
  var lastTick = Date.now();
  setInterval(function(){
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    var gain = passiveRate() * dt;
    if(gain > 0){
      state.balance += gain;
      state.lifetime += gain;
      render();
    }
  }, 1000);

  // faux price drift + block height, cosmetic only
  var block = 863000 + Math.floor(Math.random()*500);
  setInterval(function(){
    state.price = Math.max(20000, state.price + (Math.random()*400 - 200));
    block += 1;
    tickEl.textContent = t("blockHeight") + " " + block.toLocaleString();
    priceEl.textContent = "$" + Math.round(state.price).toLocaleString();
    usdEl.textContent = "≈ " + fmtUSD(state.balance);
  }, 4000);

  document.getElementById("halving-btn").addEventListener("click", function(){
    if(state.lifetime < halvingThreshold()) return;
    showConfirm(t("halvingConfirm"), function(){
      state.balance = 0;
      UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
      CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });
      state.halvings += 1;
      sfxHalving();
      save();
      render();
    });
  });

  document.getElementById("reset-btn").addEventListener("click", function(){
    showConfirm(t("resetConfirm"), function(){
      state.balance = 0;
      UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
      CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });
      state.lifetime = 0;
      state.halvings = 0;
      PARTS.forEach(function(p){
        state.buildBought[p.id] = false;
        state.buildInstalled[p.id] = false;
        removeScrews(p.id);
      });
      bootPlayed = false;
      save();
      render();
    });
  });

  document.querySelectorAll(".lang-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      state.lang = btn.getAttribute("data-lang");
      save();
      render();
    });
  });

  document.querySelectorAll(".qty-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      state.buyQty = Number(btn.getAttribute("data-qty"));
      render();
    });
  });

  document.getElementById("login-btn").addEventListener("click", doLogin);
  document.getElementById("username-input").addEventListener("keydown", function(e){
    if(e.key === "Enter") doLogin();
  });

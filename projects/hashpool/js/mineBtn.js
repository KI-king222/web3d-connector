/* mineBtn.js — Mine-Klick, Passive-Tick, UI-Events (Flicker-Fix) */
  var mineBtn = document.getElementById("mine-btn");
mineBtn.addEventListener("click", function(e){
    var crit = Math.random() < 0.08;
    var gain = crit ? state.perClick * 8 : state.perClick;
    state.balance += gain;
    state.lifetime += gain;
    if(crit){ sfxCrit(); } else { sfxClick(); }
    spawnFloat(gain, (Math.random()*20-10), crit);
    save();
    updateBalanceUI();
    updateShopDisabled();
  });

  var _uiBal = "", _uiUsd = "", _uiHr = "";
  function updateBalanceUI(){
    var _balTxt = fmtSats(state.balance) + "<small> sats</small>";
    if(_balTxt !== _uiBal){ _uiBal = _balTxt; balanceEl.innerHTML = _balTxt; }
    var _usdTxt = "≈ " + fmtUSD(state.balance);
    if(_usdTxt !== _uiUsd){ _uiUsd = _usdTxt; usdEl.textContent = _usdTxt; }
    var _hrTxt = fmtSats(passiveRate()) + " " + t("passive") + " · " + fmtSats(state.perClick) + " " + t("perClick");
    if(_hrTxt !== _uiHr){ _uiHr = _hrTxt; hrEl.textContent = _hrTxt; }
  }
  function updateShopDisabled(){
    Array.prototype.forEach.call(shopClickEl.children, function(row){
      var dis = state.balance < Number(row.dataset.cost);
      if(row.disabled !== dis) row.disabled = dis;
    });
    Array.prototype.forEach.call(shopEl.children, function(row){
      var dis = state.balance < Number(row.dataset.cost);
      if(row.disabled !== dis) row.disabled = dis;
    });
  }

  var lastTick = Date.now();
  setInterval(function(){
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;
    var gain = passiveRate() * dt;
    if(gain > 0){
      state.balance += gain;
      state.lifetime += gain;
      updateBalanceUI();
      updateShopDisabled();
    }
  }, 1000);

/* _staticSig-2.js — render() */
  function render(){
    applyStaticText();
    state.perClick = currentPerClick();
    var _balTxt = fmtSats(state.balance) + "<small> sats</small>";
    if(balanceEl.innerHTML !== _balTxt) balanceEl.innerHTML = _balTxt;
    var _usdTxt = "≈ " + fmtUSD(state.balance);
    if(usdEl.textContent !== _usdTxt) usdEl.textContent = _usdTxt;
    var _hrTxt = fmtSats(passiveRate()) + " " + t("passive") + " · " + fmtSats(state.perClick) + " " + t("perClick");
    if(hrEl.textContent !== _hrTxt) hrEl.textContent = _hrTxt;
    var _priceTxt = "$" + Math.round(state.price).toLocaleString();
    if(priceEl.textContent !== _priceTxt) priceEl.textContent = _priceTxt;

    var clickSig = state.lang + "|" + state.buyQty + "|" + CLICK_UPGRADES.map(function(u){ return state.clickOwned[u.id]; }).join(",");
    if(clickSig !== shopClickSig){
      shopClickSig = clickSig;
      shopClickEl.innerHTML = "";
      CLICK_UPGRADES.forEach(function(u){
        var n = state.clickOwned[u.id];
        var qty = state.buyQty;
        var c = bulkCost(u, n, qty);
        var row = document.createElement("button");
        row.className = "item";
        row.dataset.cost = c;
        var ownedTxt = n > 0 ? " · " + t("owned") + " " + n : "";
        row.innerHTML =
          '<div class="name">'+u.name[state.lang]+ownedTxt+'</div>' +
          '<div class="desc">'+u.desc[state.lang]+' · ×'+u.mult+' '+t("perClickSuffix")+'</div>' +
          '<div class="cost">'+(qty>1 ? t("buy")+" "+qty+"<br>" : "")+fmtCost(c)+'</div>';
        row.addEventListener("click", function(){ buyClick(u); });
        shopClickEl.appendChild(row);
      });
    }
    Array.prototype.forEach.call(shopClickEl.children, function(row){ row.disabled = state.balance < Number(row.dataset.cost); });

    var shopSig = state.lang + "|" + state.buyQty + "|" + UPGRADES.map(function(u){ return state.owned[u.id]; }).join(",");
    if(shopSig !== shopSig2){
      shopSig2 = shopSig;
      shopEl.innerHTML = "";
      UPGRADES.forEach(function(u){
        var n = state.owned[u.id];
        var qty = state.buyQty;
        var c = bulkCost(u, n, qty);
        var row = document.createElement("button");
        row.className = "item";
        row.dataset.cost = c;
        var ownedTxt = n > 0 ? " · " + t("owned") + " " + n : "";
        row.innerHTML =
          '<div class="name">'+u.name[state.lang]+ownedTxt+'</div>' +
          '<div class="desc">'+u.desc[state.lang]+' · +'+u.hr+' H/s</div>' +
          '<div class="cost">'+(qty>1 ? t("buy")+" "+qty+"<br>" : "")+fmtCost(c)+'</div>';
        row.addEventListener("click", function(){ buy(u); });
        shopEl.appendChild(row);
      });
    }
    Array.prototype.forEach.call(shopEl.children, function(row){ row.disabled = state.balance < Number(row.dataset.cost); });

    renderRig();
    renderHalving();
    renderBuild();
  }

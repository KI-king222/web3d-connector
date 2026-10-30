.efficiency, "eff") +
          scaleRow(state.lang==="de"?"Preis/Leistung":"Value", it.value, "val") +
          '<div class="ps-detail-actions"><div class="ps-price-big">'+fmt(it.cost)+' sats</div><button class="ps-buy-btn" id="ps-buy"'+(canBuy?"":" disabled")+'>'+(state.lang==="de"?"Kaufen":"Buy")+'</button></div></div>';
      }
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll(".ps-row").forEach(function(el){
      el.addEventListener("click", function(){
        view.selected = el.getAttribute("data-id");
        try{ if(window.PartShop && PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
        render();
      });
    });
    var buy = document.getElementById("ps-buy");
    if(buy) buy.addEventListener("click", function(e){ e.stopPropagation(); buySelected(); });
  }
  function buySelected(){
    ensureInv();
    if(!view.selected) return;
    var it = PART_BY_ID[view.selected];
    if(!it) return;
    var cost = Number(it.cost)||0;
    if(state.balance < cost){ showToast(state.lang==="de"?"Nicht genug sats":"Not enough sats"); return; }
    state.balance -= cost;
    state.partInv[it.id] = (state.partInv[it.id]||0) + 1;
    try{ if(window.PartShop && PartShop.sfxBuy) PartShop.sfxBuy(); }catch(e){}
    if(typeof save === "function") save();
    showToast((state.lang==="de"?"Gekauft: ":"Bought: ") + partDisplayName(it) + " (x"+state.partInv[it.id]+")");
    if(typeof updateBalanceUI === "function") updateBalanceUI();
    render();
  }
  function ensurePickerDom(){
    if(document.getElementById("ps-picker")) return;
    var d = document.createElement("div");
    d.id = "ps-picker"; d.className = "ps-overlay";
    d.innerHTML = '
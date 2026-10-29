/* exSigs-3.js — deals, speed, missions, RGB look */
, ex.slots - 4);
      e.appendChild(exBtn("➕ " + exL("Extra slot ", "Extra-Platz ") + fmtCost(sc), function(){ if(state.balance >= sc && ex.slots < 12){ state.balance -= sc; ex.slots++; save(); render(); exRenderPanel(); } }, ex.slots >= 12 || state.balance < sc));
      var t2 = document.createElement("span"); t2.className = "ex-small"; t2.textContent = exL("Finished rigs can go into the farm instead of being sold.", "Fertige Rigs kannst du in die Farm stellen statt sie zu verkaufen."); e.appendChild(t2);
    });
    exEl("ex-h-deals").textContent = "🛒 " + exL("USED PARTS MARKET (today)", "GEBRAUCHTMARKT (heute)");
    exSet("ex-deals", Object.keys(ex.deals).join() + state.lang, function(e){
      e.innerHTML = "";
      Object.keys(ex.deals).forEach(function(id){
        var p = PARTS_BY_ID[id]; if(!p) return; var r = document.createElement("div"); r.className = "ex-small"; r.style.margin = "4px 0";
        r.textContent = p.name[state.lang] + " −" + Math.round(ex.deals[id] * 100) + "% · " + exL("used: may be faulty", "gebraucht: evtl. defekt"); e.appendChild(r);
      });
      var n = document.createElement("div"); n.className = "ex-small"; n.style.marginTop = "6px"; n.textContent = exL("Discount applies automatically in the PC build shop.", "Der Rabatt gilt automatisch im PC-Bau-Shop."); e.appendChild(n);
    });
    exEl("ex-h-speed").textContent = "⏱️ " + exL("SPEED BUILD", "SPEEDBAU");
    exSet("ex-speed", ex.speed + "|" + ex.best.join() + state.lang, function(e){
      e.innerHTML = ""; e.appendChild(exBtn(exL("Timer ", "Zeitmessung ") + (ex.speed ? "ON" : "OFF"), function(){ ex.speed = !ex.speed; save(); exRenderPanel(); }, false, ex.speed ? "on" : ""));
      var t3 = document.createElement("span"); t3.className = "ex-small"; t3.textContent = (ex.best.length ? exL("Best: ", "Bestzeiten: ") + ex.best.map(function(x){ return x.toFixed(0) + "s"; }).join(" · ") : exL("Under 2 min = +25% sale price", "Unter 2 Min = +25% Verkaufspreis")); e.appendChild(t3);
    });
    exEl("ex-h-ach").textContent = "🏆 " + exL("MISSIONS", "MISSIONEN");
    exSet("ex-ach", EX_ACH.map(function(a){ return ex.ach[a.id] ? 1 : 0; }).join("") + state.lang, function(e){
      e.innerHTML = "";
      EX_ACH.forEach(function(a){ var r = document.createElement("div"); r.className = "ex-small"; r.style.margin = "4px 0"; r.style.color = ex.ach[a.id] ? "var(--green)" : "var(--muted)"; r.textContent = (ex.ach[a.id] ? "✓ " : "○ ") + a.t[state.lang === "de" ? 1 : 0] + " (+" + fmtSats(a.r) + ")"; e.appendChild(r); });
    });
    exEl("ex-h-look").textContent = "🎨 " + exL("CASE LOOK (RGB)", "GEHÄUSE-LOOK (RGB)");
    exSet("ex-look", ex.style + "|" + ex.styles.join() + Math.floor(state.balance / 500) + state.lang, function(e){
      e.innerHTML = "";
      EX_STYLES.forEach(function(s, i){
        var own = ex.styles[i];
        e.appendChild(exBtn((i === ex.style ? "✓ " : "") + s.n[state.lang === "de" ? 1 : 0] + (own ? "" : "<br>" + fmtCost(s.cost)), function(){
          if(!own){ if(state.balance < s.cost) return; state.balance -= s.cost; ex.styles[i] = true; }
          ex.style = i; exApplyStyle(); save(); render(); exRenderPanel();
        }, !own && state.balance < s.cost, i === ex.style ? "on" : ""));
      });
    });
  }

/* exSigs-2.js — exRenderPanel */
  function exRenderPanel(){
    var ex = state.ex; if(!ex || !exEl("ex-root")) return;
    if(!exEl("ex-mkt")) exBuildRoot();
    exEl("ex-h-mkt").textContent = "📈 " + exL("BITCOIN MARKET", "BITCOIN-MARKT");
    exEl("ex-mkt").textContent = "×" + ex.mkt.toFixed(2);
    exEl("ex-mkt").style.color = ex.mkt >= 1 ? "var(--green)" : "var(--red)";
    exEl("ex-mkt-sub").textContent = exL("multiplies mining income and rig sale prices", "wirkt auf Mining-Einnahmen und Rig-Verkaufspreise");
    exEl("ex-mkt-hint").textContent = ex.mkt > 1.35 ? exL("Bull market — good time to sell rigs!", "Bullenmarkt – gute Zeit, Rigs zu verkaufen!") : ex.mkt < 0.8 ? exL("Crash — hold your rigs, don't sell.", "Crash – Rigs behalten, nicht verkaufen.") : exL("Sideways market.", "Seitwärtsmarkt.");
    exSpark();
    exEl("ex-h-ops").textContent = "🔥 " + exL("POWER & HEAT", "STROM & HITZE");
    exEl("ex-heat-txt").textContent = exL("Heat", "Hitze") + " " + Math.round(ex.heat) + "% · " + (ex.throttle < 1 ? exL("throttled ×", "gedrosselt ×") + ex.throttle : exL("stable", "stabil"));
    var hb = exEl("ex-heat-bar"); hb.style.width = ex.heat + "%"; hb.style.background = ex.heat > 90 ? "var(--red)" : ex.heat > 75 ? "var(--btc)" : "var(--green)";
    exEl("ex-ops-info").textContent = exL("Electricity cost ", "Stromkosten ") + Math.round(EX_ELEC[ex.tariff] * 100) + "% · " + exL("Difficulty ", "Schwierigkeit ") + exDiff().toFixed(2) + " · Pool +" + ex.pool * 12 + "%" + (Date.now() < ex.blackout ? " · ⚡ " + exL("BLACKOUT", "STROMAUSFALL") : "");
    var upSig = [ex.cool, ex.tariff, ex.pool, ex.oc, Math.floor(state.balance / 500), state.lang].join();
    exSet("ex-ups", upSig, function(e){
      e.innerHTML = "";
      var cc = 3000 * Math.pow(3, ex.cool), tc = 8000 * Math.pow(3, ex.tariff), pc = 5000 * Math.pow(2.5, ex.pool);
      e.appendChild(exBtn("❄️ " + exL("Cooling ", "Kühlung ") + ex.cool + "/4<br>" + (ex.cool < 4 ? fmtCost(cc) : "MAX"), function(){ if(ex.cool < 4 && state.balance >= cc){ state.balance -= cc; ex.cool++; save(); render(); exRenderPanel(); } }, ex.cool >= 4 || state.balance < cc));
      e.appendChild(exBtn("💡 " + exL("Power plan ", "Stromtarif ") + ex.tariff + "/3<br>" + (ex.tariff < 3 ? fmtCost(tc) : "MAX"), function(){ if(ex.tariff < 3 && state.balance >= tc){ state.balance -= tc; ex.tariff++; save(); render(); exRenderPanel(); } }, ex.tariff >= 3 || state.balance < tc));
      e.appendChild(exBtn("🤝 Pool " + ex.pool + "/5<br>" + (ex.pool < 5 ? fmtCost(pc) : "MAX"), function(){ if(ex.pool < 5 && state.balance >= pc){ state.balance -= pc; ex.pool++; save(); render(); exRenderPanel(); } }, ex.pool >= 5 || state.balance < pc));
      e.appendChild(exBtn("⚡ " + exL("Overclock ", "Übertakten ") + (ex.oc ? "ON" : "OFF") + "<br>+30% / " + exL("hot", "heiß"), function(){ ex.oc = !ex.oc; save(); exRenderPanel(); }, false, ex.oc ? "on" : ""));
    });
    exEl("ex-h-farm").textContent = "🏭 " + exL("MINING FARM", "MINING-FARM") + " (" + ex.farm.length + "/" + ex.slots + ")";
    var farmSig = ex.farm.map(function(f){ return Math.round(f.dust / 10) + ":" + Math.round(f.cost); }).join("|") + ex.slots + state.lang + Math.floor(state.balance / 500);
    exSet("ex-farm", farmSig, function(e){
      e.innerHTML = "";
      for(var i = 0; i < ex.slots; i++){
        (function(i){
          var f = ex.farm[i]; var s = document.createElement("div"); s.className = "ex-slot" + (f ? " full" : "");
          if(f){
            var inc = f.cost * 0.005 * (1 - f.dust / 160);
            s.innerHTML = "🖥️ Rig #" + (i + 1) + "<br><span class='ex-small'>+" + fmtSats(inc) + "/s · " + exL("dust ", "Staub ") + Math.round(f.dust) + "%</span>";
            s.appendChild(document.createElement("br"));
            s.appendChild(exBtn("🧹 " + exL("Clean", "Reinigen"), function(){ f.dust = 0; save(); exSigs["ex-farm"] = ""; exRenderPanel(); }, f.dust < 5));
          } else s.innerHTML = "<span class='ex-small'>" + exL("empty slot", "freier Platz") + "</span>";
          e.appendChild(s);
        })(i);
      }
    });
    exSet("ex-farm-ctl", ex.slots + "|" + Math.floor(state.balance / 500) + state.lang, function(e){
      e.innerHTML = ""; var sc = 20000 * Math.pow(2

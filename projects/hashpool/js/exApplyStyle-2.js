/* exApplyStyle-2.js — random events (outage, hack, dust, fire) */
  function exEvent(kind){
    if(exActive) return;
    var ex = state.ex;
    var D = {
      outage:{i:"⚡", t:exL("Power outage!", "Stromausfall!"), b:exL("Flip the fuse", "Sicherung einschalten"), need:1, time:8, fail:function(){ ex.blackout = Date.now() + 25000; }},
      hack:{i:"🛡️", t:exL("Hacker attack!", "Hackerangriff!"), b:exL("DEFEND!", "ABWEHREN!"), need:6, time:7, fail:function(){ var l = Math.floor(state.balance * 0.1); state.balance -= l; }},
      dust:{i:"🌫️", t:exL("Dust storm in the hall", "Staubsturm in der Halle"), b:exL("Blow it out", "Auspusten"), need:4, time:8, fail:function(){ ex.farm.forEach(function(f){ f.dust = Math.min(100, f.dust + 35); }); ex.heat = Math.min(100, ex.heat + 15); }},
      fire:{i:"🔥", t:exL("Cable fire!", "Kabelbrand!"), b:exL("EXTINGUISH", "LÖSCHEN"), need:6, time:6, fail:function(){ if(ex.farm.length) ex.farm.pop(); else state.balance -= state.balance * 0.15; }}
    };
    var d = D[kind]; if(!d) return;
    var box = document.createElement("div"); box.id = "ex-toast";
    box.innerHTML = "<b>" + d.i + " " + d.t + "</b><div class='ex-small' id='ex-tt'></div><button class='ex-btn' id='ex-tb'></button><div class='ex-bar'><div id='ex-tbar' style='background:var(--red);width:100%'></div></div>";
    document.body.appendChild(box);
    var count = 0, start = Date.now(); exActive = kind;
    var btn = exEl("ex-tb");
    function label(){ btn.textContent = d.b + (d.need > 1 ? " (" + count + "/" + d.need + ")" : ""); }
    label();
    function finish(win){
      clearInterval(iv); exActive = null; box.remove();
      if(win){ var rw = Math.max(50, Math.round(passiveRate() * 45)); state.balance += rw; state.lifetime += rw; exToast("✅ " + exL("Saved! ", "Gerettet! ") + "+" + fmtSats(rw)); }
      else { d.fail(); exToast("💥 " + exL("Failed – you took damage.", "Fehlgeschlagen – es gab Schaden.")); }
      ex.ev++; save(); render(); exRenderPanel(); exCheckMissions();
    }
    btn.addEventListener("click", function(){ count++; label(); if(count >= d.need) finish(true); });
    var iv = setInterval(function(){
      var left = d.time - (Date.now() - start) / 1000;
      exEl("ex-tbar").style.width = Math.max(0, left / d.time * 100) + "%";
      if(left <= 0) finish(false);
    }, 100);
  }

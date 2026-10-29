/* beep.js — Teil 9/22 */

  function beep(freq, dur, type, vol){
    if(state.muted) return;
    var ctx = ensureAudio();
    if(!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  }
  function sfxClick(){ beep(520, 0.05, "sine", 0.10); }
  function sfxCrit(){ beep(880, 0.05, "triangle", 0.16); setTimeout(function(){ beep(1320, 0.09, "triangle", 0.14); }, 40); }
  function sfxBuy(){ beep(320, 0.05, "square", 0.08); setTimeout(function(){ beep(480, 0.08, "square", 0.08); }, 45); }
  function sfxInstall(){ [0,60,120,180].forEach(function(t,i){ setTimeout(function(){ beep(720 - i*40, 0.03, "square", 0.06); }, t); }); }
  function sfxHalving(){ [300,450,650,900].forEach(function(f,i){ setTimeout(function(){ beep(f, 0.14, "triangle", 0.15); }, i*90); }); }

  var offlineEarnings = 0;

  function load(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw){
        state.balance = 12;
        state.lifetime = 12;
        state._starter = true;
      }
      if(raw){
        var saved = JSON.parse(raw);
        state.balance = saved.balance || 0;
        state.owned = saved.owned || state.owned;
        state.clickOwned = saved.clickOwned || state.clickOwned;
        state.lang = saved.lang || state.lang;
        state.username = saved.username || "";
        state.redeemed = saved.redeemed || {};
        state.lifetime = saved.lifetime || 0;
        state.halvings = saved.halvings || 0;
        state.muted = !!saved.muted;
        if(saved.buildBought){
          state.buildBought = saved.buildBought;
          state.buildInstalled = saved.buildInstalled || saved.buildBought;
        } else if(saved.buildParts){
          PARTS.forEach(function(p){
            var v = !!saved.buildParts[p.id];
            state.buildBought[p.id] = v;
            state.buildInstalled[p.id] = v;
          });
        }
        state.rigsSold = saved.rigsSold || 0;
        state.buildMode = saved.buildMode === "detailed" ? "detailed" : "quick";
        state.moboCased = !!saved.moboCased;
      }
    } catch(e){}
  }

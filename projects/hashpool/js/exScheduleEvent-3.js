/* exScheduleEvent-3.js — resetSoft + humanish runBot */
    resetSoft: function(){
      try{ localStorage.removeItem(KEY); }catch(e){}
      state.balance = 0; state.lifetime = 0; state.perClick = 1;
      state.rigsSold = 0;
      UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
      CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });
      PARTS.forEach(function(p){ state.buildBought[p.id]=false; state.buildInstalled[p.id]=false; });
      state.pasteDone=false; state.biosDone=false; state.moboCased=false;
      save(); render();
      return true;
    },
    runBot: function(opts){
      opts = opts || {};
      var maxMs = opts.maxMs || 12000;
      var t0 = Date.now();
      var log = [];
      var issues = [];
      var score = 10;
      var actions = [];

      function note(msg){ log.push({ t: Date.now()-t0, msg: msg }); }
      function fail(msg, penalty){ issues.push(msg); score = Math.max(1, score - (penalty||1)); note("FAIL: "+msg); }
      function act(name, detail){ actions.push(name); note(name + (detail ? ": "+detail : "")); }

      try{
        if(opts.reset !== false) window.HASHPOOL.resetSoft();
        act("wake_up", "fresh save");

        var s0 = window.HASHPOOL.getState();
        if(typeof s0.balance !== "number") fail("balance not numeric", 3);
        if(s0.perClick < 1) fail("perClick < 1", 2);

        var burst = 15 + Math.floor(Math.random()*20);
        var g1 = window.HASHPOOL.mine(burst);
        act("click_burst", burst + " clicks, +" + g1.toFixed(1));
        if(g1 <= 0) fail("mine gained 0", 3);

        var buys = 0, clicks = burst, thinkBuys = 0;
        while(Date.now() - t0 < maxMs * 0.85){
          var st = window.HASHPOOL.getState();
          var list = window.HASHPOOL.listUpgrades().slice().sort(function(a,b){ return a.cost - b.cost; });
          var target = list[0];
          var buffer = Math.max(3, st.balance * 0.15);
          var canBuy = target && st.balance >= target.cost + buffer;
          if(!canBuy && target && st.balance >= target.cost && Math.random() < 0.25){
            canBuy = true;
            act("impulse_buy_temptation", target.id);
          }
          if(canBuy){
            var r = window.HASHPOOL.buyUpgrade(target.id, 1);
            if(r.ok){
              buys++; thinkBuys++;
              act("buy", target.id + " @" + r.cost);
            } else {
              window.HASHPOOL.mine(12);
              clicks += 12;
            }
          } else {
            var need = target ? Math.max(0, target.cost - st.balance) : 10;
            var n = need > 30 ? 35 : (need > 10 ? 18 : 8);
            window.HASHPOOL.mine(n);
            clicks += n;
            act("grind", n + " clicks (need ~" + need.toFixed(0) + ")");
          }
          st = window.HASHPOOL.getState();
          if(st.passive >= 0.5 && buys >= 2 && Math.random() < 0.15){
            act("bored_enough", "passive "+st.passive.toFixed(3));
            break;
          }
        }

        var s2 = window.HASHPOOL.getState();
        if(s2.balance <= 0 && buys === 0) fail("stuck at zero with no buys", 2);
        if(s2.passive < 0) fail("negative passive", 3);
        if(buys === 0) fail("never bought anything (pacing too hard?)", 1);

        var fun = 5;
        if(buys >= 2) fun += 1;
        if(buys >= 4) fun += 1;
        if(s2.passive > 0.15) fun += 1;
        if(thinkBuys > 0 && clicks > 40) fun += 1;
        if(actions.indexOf("impulse_buy_temptation") >= 0) fun += 0.5;
        fun -= issues.length;
        fun = Math.max(1, Math.min(10, Math.round(fun*10)/10));

        var report = {
          ok: issues

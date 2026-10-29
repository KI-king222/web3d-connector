/* exScheduleEvent-2.js — sell reset, timer, init, HASHPOOL bot API */
  function exOnSell(){ state.ex.bonus = 1; state.ex.used = {}; exCheckMissions(); }

  (function(){
    var bh = document.querySelector(".bo-header");
    var tm = document.createElement("div"); tm.id = "ex-timer"; bh.appendChild(tm);
    var toA = exEl("bo-to-assemble");
    if(toA) toA.addEventListener("click", function(){ if(state.ex.speed) state.ex.tStart = Date.now(); });
    setInterval(function(){
      var ex = state.ex;
      tm.textContent = (ex.speed && ex.tStart) ? "⏱️ " + ((Date.now() - ex.tStart) / 1000).toFixed(0) + "s" : "";
    }, 500);
  })();

  if(!state.ex) state.ex = exDefaults();
  exDayDeals();
  setTimeout(function(){ exBuildRoot(); exRenderPanel(); exApplyStyle(); }, 50);
  setInterval(function(){ exApplyStyle(); }, 2000);
  exScheduleEvent();

  setInterval(save, 10000);
  window.addEventListener("beforeunload", save);

  load();

  if(state._starter){
    setTimeout(function(){
      document.getElementById("welcome-title").textContent = t("starterTitle");
      document.getElementById("welcome-body").textContent = t("starterBody");
      document.getElementById("welcome-amount").textContent = "+12 sats";
      document.getElementById("welcome-close").textContent = t("close");
      document.getElementById("welcome-modal").style.display = "flex";
      state._starter = false;
      save();
    }, 400);
  }
  (function restoreSession(){
    var db = acctLoadDB();
    if(db.session && db.users[db.session]){
      var u = db.users[db.session];
      state.username = u.name || db.session;
      if(u.save) applySnapshot(u.save);
    }
  })();

  render();

  window.HASHPOOL = {
    version: "bot-1",
    getState: function(){
      return {
        balance: state.balance,
        perClick: state.perClick,
        passive: passiveRate(),
        lifetime: state.lifetime,
        owned: Object.assign({}, state.owned),
        clickOwned: Object.assign({}, state.clickOwned),
        rigsSold: state.rigsSold,
        lang: state.lang,
        pasteDone: !!state.pasteDone,
        biosDone: !!state.biosDone,
        buildBought: Object.assign({}, state.buildBought),
        buildInstalled: Object.assign({}, state.buildInstalled)
      };
    },
    mine: function(n){
      n = n || 1;
      var gained = 0;
      for(var i=0;i<n;i++){
        var crit = Math.random() < 0.08;
        var gain = crit ? state.perClick * 8 : state.perClick;
        state.balance += gain;
        state.lifetime += gain;
        gained += gain;
      }
      save(); render();
      return gained;
    },
    buyUpgrade: function(id, qty){
      var u = UPGRADES.filter(function(x){ return x.id === id; })[0];
      if(!u) return { ok:false, reason:"unknown" };
      var q = qty || 1;
      var oldQty = state.buyQty;
      state.buyQty = q;
      var c = bulkCost(u, state.owned[u.id], q);
      if(state.balance < c){ state.buyQty = oldQty; return { ok:false, reason:"broke", cost:c }; }
      state.balance -= c;
      state.owned[u.id] += q;
      state.buyQty = oldQty;
      save(); render();
      return { ok:true, cost:c, owned: state.owned[u.id] };
    },
    buyClick: function(id, qty){
      var u = CLICK_UPGRADES.filter(function(x){ return x.id === id; })[0];
      if(!u) return { ok:false, reason:"unknown" };
      var q = qty || 1;
      var oldQty = state.buyQty;
      state.buyQty = q;
      var c = bulkCost(u, state.clickOwned[u.id], q);
      if(state.balance < c){ state.buyQty = oldQty; return { ok:false, reason:"broke", cost:c }; }
      state.balance -= c;
      state.clickOwned[u.id] += q;
      state.buyQty = oldQty;
      save(); render();
      return { ok:true, cost:c, owned: state.clickOwned[u.id] };
    },
    costOf: function(id){
      var u = UPGRADES.filter(function(x){ return x.id === id; })[0];
      if(!u) return null;
      return bulkCost(u, state.owned[u.id], 1);
    },
    listUpgrades: function(){
      return UPGRADES.map(function(u){
        return { id:u.id, name:u.name.en, hr:u.hr, owned:state.owned[u.id]||0, cost: bulkCost(u, state.owned[u.id]||0, 1) };
      });
    },
    resetSof

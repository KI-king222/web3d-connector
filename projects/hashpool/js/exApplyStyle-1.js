/* exApplyStyle.js — Modul 21/22 */

  function exApplyStyle(){
    var c = EX_STYLES[state.ex.style].c;
    if(typeof rgbMeshes !== "undefined") rgbMeshes.forEach(function(m){ m.material.color.setHex(c); m.material.emissive.setHex(c); });
  }

  /* --- missions --- */
  var EX_ACH = [
    {id:"first", r:500, t:["Build your first PC","Baue deinen ersten PC"], ok:function(){ return state.rigsSold >= 1; }},
    {id:"sold3", r:5000, t:["Finish 3 rigs","Stelle 3 Rigs fertig"], ok:function(){ return state.rigsSold >= 3; }},
    {id:"farm3", r:15000, t:["3 rigs in the farm","3 Rigs in der Farm"], ok:function(){ return state.ex.farm.length >= 3; }},
    {id:"speed", r:8000, t:["Build a PC in under 2 min","Baue einen PC in unter 2 Min"], ok:function(){ return state.ex.best.length && state.ex.best[0] <= 120; }},
    {id:"fix", r:3000, t:["Find a faulty part","Finde ein defektes Teil"], ok:function(){ return state.ex.fixes >= 1; }},
    {id:"ev5", r:6000, t:["Survive 5 incidents","Überstehe 5 Zwischenfälle"], ok:function(){ return state.ex.ev >= 5; }},
    {id:"m1", r:20000, t:["Mine 1M sats in total","Minde insgesamt 1 Mio. Sats"], ok:function(){ return state.lifetime >= 1e6; }},
    {id:"cool", r:4000, t:["Cooling level 2","Kühlung Stufe 2"], ok:function(){ return state.ex.cool >= 2; }}
  ];
  function exCheckMissions(){
    var got = false;
    EX_ACH.forEach(function(a){
      if(!state.ex.ach[a.id] && a.ok()){ state.ex.ach[a.id] = true; state.balance += a.r; state.lifetime += a.r; got = true; exToast("🏆 " + a.t[state.lang === "de" ? 1 : 0] + " +" + fmtSats(a.r)); }
    });
    if(got){ save(); render(); }
  }

  /* --- market, heat, dust, deals --- */
  function exDayDeals(){
    var day = new Date().toISOString().slice(0, 10);
    if(state.ex.dealDay === day) return;
    state.ex.dealDay = day; state.ex.deals = {};
    var ids = PARTS.map(function(p){ return p.id; }).sort(function(){ return Math.random() - 0.5; }).slice(0, 3);
    ids.forEach(function(id){ state.ex.deals[id] = 0.3 + Math.random() * 0.2; });
  }
  setInterval(function(){
    var ex = state.ex;
    ex.trend = ex.trend * 0.9 + (Math.random() - 0.5) * 0.06;
    if(Math.random() < 0.04) ex.trend += (Math.random() < 0.5 ? -0.25 : 0.25);
    ex.mkt = Math.max(0.55, Math.min(2.1, ex.mkt + ex.trend + (1 - ex.mkt) * 0.03));
    ex.hist.push(ex.mkt); if(ex.hist.length > 16) ex.hist.shift();
  }, 3000);
  setInterval(function(){
    var ex = state.ex, units = 0;
    UPGRADES.forEach(function(u){ units += state.owned[u.id]; });
    var load = units * 1.5 + ex.farm.length * 9 + (ex.oc ? 18 : 0), cap = 40 + ex.cool * 30;
    var target = Math.min(100, load / cap * 65);
    ex.heat += (target - ex.heat) * 0.1;
    ex.throttle = ex.heat > 90 ? 0.5 : ex.heat > 75 ? 0.8 : 1;
    ex.farm.forEach(function(f){ f.dust = Math.min(100, f.dust + 0.2 + Math.random() * 0.15); });
    exDayDeals();
    exCheckMissions();
    exRenderPanel();
  }, 1000);

  /* --- random events (quick-time) --- */

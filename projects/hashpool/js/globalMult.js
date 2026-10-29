/* globalMult.js — Modul 10/22 */

  function globalMult(){
    return 1 + state.halvings * 0.5;
  }
  function passiveRate(){
    var r = 0;
    UPGRADES.forEach(function(u){ r += u.hr * state.owned[u.id]; });
    return (r * globalMult() + exFarmBase()) * exMult();
  }
  function currentPerClick(){
    var v = 1;
    CLICK_UPGRADES.forEach(function(u){ v *= Math.pow(u.mult, state.clickOwned[u.id]); });
    return Math.round(v * globalMult());
  }
  function halvingThreshold(){
    return 28000 * Math.pow(5.5, state.halvings);
  }
  function locale(){ return state.lang === "de" ? "de-DE" : "en-US"; }
  function fmtSats(n){
    n = Number(n) || 0;
    if(n === 0) return "0";
    var abs = Math.abs(n);
    if(abs < 1) return (Math.round(n * 100) / 100).toFixed(2);
    if(abs < 10 && n % 1 !== 0) return (Math.round(n * 10) / 10).toFixed(1);
    if(abs < 1e6) return String(Math.floor(n));
    if(abs < 1e9) return (Math.floor(n / 1e4) / 100).toFixed(2) + "M";
    return (Math.floor(n / 1e7) / 100).toFixed(2) + "B";
  }
  function fmtUSD(n){
    var v = (n / 100000000) * state.price;
    return "$" + v.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function fmtCost(n){
    n = Math.ceil(n);
    var s = n < 100000 ? n.toLocaleString(locale()) : n.toLocaleString(locale(), {notation:"compact", maximumFractionDigits:2});
    return s + " sats";
  }

  var balanceEl = document.getElementById("balance");
  var usdEl = document.getElementById("usd-val");
  var hrEl = document.getElementById("hashrate");
  var priceEl = document.getElementById("price");
  var shopEl = document.getElementById("shop");
  var tickEl = document.getElementById("tick");
  var floaters = document.getElementById("floaters");

  var shopClickEl = document.getElementById("shop-click");
  var rigEl = document.getElementById("rig-scene");

  var rigSig = "";
  function renderRig(){
    var fanOn = passiveRate() > 0;
    var sig = state.lang + "|" + fanOn + "|" +
      CLICK_UPGRADES.map(function(u){ return state.clickOwned[u.id]; }).join(",") + "|" +
      UPGRADES.map(function(u){ return state.owned[u.id]; }).join(",");
    if(sig === rigSig) return;
    rigSig = sig;
    var toolsHTML = "";
    CLICK_UPGRADES.forEach(function(u, i){
      var n = state.clickOwned[u.id];
      var cx = 60 + i * 60;
      toolsHTML +=
        '<circle cx="'+cx+'" cy="18" r="14" fill="'+(n>0?"#1c3b2e":"#171a1f")+'" stroke="'+(n>0?"var(--green)":"var(--line)")+'" stroke-width="1.5"/>' +
        '<text x="'+cx+'" y="23" font-size="13" text-anchor="middle">'+u.icon+'</text>' +
        (n>0 ? '<text x="'+cx+'" y="42" text-anchor="middle" class="bay-label" fill="var(--green)">×'+n+'</text>' : '');
    });

    var bayHTML = "";
    UPGRADES.forEach(function(u, i){
      var n = state.owned[u.id];
      var lit = n > 0;
      var y = 108 + i * 32;
      bayHTML +=
        '<rect x="35" y="'+y+'" width="230" height="26" rx="6" ' +
          'fill="'+(lit?"url(#bayLit)":"#14171c")+'" stroke="'+(lit?"var(--btc-dim)":"var(--line)")+'"/>' +
        '<text x="48" y="'+(y+18)+'" font-size="14">'+u.icon+'</text>' +
        '<text x="70" y="'+(y+17)+'" class="bay-label" fill="'+(lit?"var(--text)":"var(--muted)")+'">'+u.name[state.lang]+'</text>' +
        (lit ? '<circle cx="248" cy="'+(y+13)+'" r="11" fill="var(--btc)"/><text x="248" y="'+(y+17)+'" text-anchor="middle" class="bay-count">'+n+'</text>' : '');
    });

    var fanClass = passiveRate() > 0 ? "fan-blades" : "fan-blades idle";
    var fanSpeed = Math.max(0.35, 2.4 - Math.min(2, passiveRate() / 50));

    rigEl.innerHTML =
      '<svg viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><linearGradient id="bayLit" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#3a2308"/><stop offset="100%" stop-color="#241605"/>' +
        '</linearGradient></defs>' +
        toolsHTML +
        '<rect x="20" y="52" width="260" height="252" rx="14" fill="var(--panel)" stroke="var(--line)"/>' +
        '<line x1="34" y1="52" x2="34" y2="304" stroke="var(--line)"/>' +
        '<circle cx="150" cy="82" r="20" fill="#0d0f13" stroke="var(--line)"/>' +
        '<g class="'+fanClass+'" style="animation-duration:'+fanSpeed+'s">' +
          '<line x1="150" y1="82" x2="150" y2="66" stroke="var(--btc-dim)" stroke-width="4" stroke-linecap="round"/>' +
          '<line x1="150" y1="82" x2="134" y2="90" stroke="var(--btc-dim)" stroke-width="4" stroke-linecap="round"/>' +
          '<line x1="150" y1="82" x2="166" y2="90" stroke="var(--btc-dim)" stroke-width="4" stroke-linecap="round"/>' +
        '</g>' +
        '<circle cx="150" cy="82" r="4" fill="var(--btc)"/>' +
        bayHTML +
      '</svg>';
  }

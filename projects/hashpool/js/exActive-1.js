/* exActive.js — Modul 19/22 */

  var exActive = null;
  function exL(en, de){ return state.lang === "de" ? de : en; }
  function exEl(id){ return document.getElementById(id); }
  var EX_STYLES = [
    {n:["Cyan","Cyan"], c:0x22d3ee, cost:0}, {n:["Red","Rot"], c:0xff3b3b, cost:5000},
    {n:["Green","Grün"], c:0x2fd98a, cost:5000}, {n:["Purple","Lila"], c:0xa855f7, cost:5000}
  ];
  var EX_ELEC = [0.30, 0.20, 0.10, 0.04];
  var EX_SYMPTOM = {
    cpu:["No POST, board stays black","Kein POST, Board bleibt schwarz"],
    ram:["Three long beeps","Dreimal langes Piepen"],
    ssd:["No boot device found","Kein Startlaufwerk gefunden"],
    mobo:["Random restarts, dead USB","Zufällige Neustarts, USB tot"],
    gpu:["No display signal","Kein Bildsignal"],
    cooler:["CPU at 100°C, shuts down","CPU bei 100°C, schaltet ab"],
    psu:["Clicks and turns itself off","Klickt und schaltet sich ab"]
  };
  function exDefaults(){
    return {mkt:1, hist:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], heat:20, throttle:1, cool:0, tariff:0, pool:0, oc:false,
      farm:[], slots:4, style:0, styles:[true,false,false,false], speed:false, tStart:0, best:[], bonus:1,
      deals:{}, dealDay:"", used:{}, ach:{}, ev:0, fixes:0, blackout:0, trend:0, faultPart:""};
  }
  function exDiff(){ return 1 + 0.03 * state.rigsSold + 0.05 * state.ex.farm.length; }
  function exMult(){
    var ex = state.ex; if(!ex) return 1;
    if(Date.now() < ex.blackout) return 0;
    return ex.mkt * ex.throttle * (ex.oc ? 1.3 : 1) * (1 + 0.12 * ex.pool) / exDiff() * (1 - EX_ELEC[ex.tariff]);
  }
  function exFarmBase(){
    var ex = state.ex; if(!ex) return 0; var s = 0;
    ex.farm.forEach(function(f){ s += f.cost * 0.005 * (1 - f.dust / 160); });
    return s;
  }
  function exMarketMult(){ return state.ex ? state.ex.mkt : 1; }
  function exSpeedBonus(){ return state.ex && state.ex.speed ? state.ex.bonus : 1; }
  function exDealFactor(id){ var d = state.ex && state.ex.deals[id]; return d ? (1 - d) : 1; }
  function exToast(msg){
    var d = document.createElement("div"); d.className = "ex-note"; d.textContent = msg;
    document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 3200);
  }

  /* --- panel --- */

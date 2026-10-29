/* KEY.js — Teil 1/22 */
var KEY = "hashpool-save-v2";

  var ACCT_KEY = "hashpool-accounts-v1";

  function acctLoadDB(){
    try {
      var raw = localStorage.getItem(ACCT_KEY);
      if(!raw) return { users:{}, session:null };
      var db = JSON.parse(raw);
      if(!db.users) db.users = {};
      return db;
    } catch(e){ return { users:{}, session:null }; }
  }
  function acctSaveDB(db){
    try { localStorage.setItem(ACCT_KEY, JSON.stringify(db)); } catch(e){}
  }
  function acctNormName(n){
    return String(n || "").trim().slice(0, 18);
  }
  function acctNameKey(n){
    return acctNormName(n).toLowerCase();
  }
  // Lightweight client hash (not bank-grade — local game only)
  function acctHash(pass, salt){
    var s = salt + ":" + pass + ":hashpool";
    var h = 2166136261;
    for(var i=0;i<s.length;i++){
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // second mix
    var h2 = 0;
    for(var j=0;j<s.length;j++){ h2 = ((h2 << 5) - h2) + s.charCodeAt(j); h2 |= 0; }
    return (h >>> 0).toString(16) + ":" + (h2 >>> 0).toString(16);
  }
  function acctSalt(){
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function acctShowMsg(msg, kind){
    var el = document.getElementById("account-msg");
    if(!el) return;
    el.textContent = msg || "";
    el.className = "account-msg" + (kind ? " " + kind : "");
  }
  function snapshotFromState(){
    return {
      balance:state.balance, owned:state.owned, clickOwned:state.clickOwned, lang:state.lang,
      redeemed:state.redeemed, lifetime:state.lifetime, halvings:state.halvings, muted:state.muted,
      buildBought:state.buildBought, buildInstalled:state.buildInstalled, buildCablesDone:state.buildCablesDone,
      buildMode:state.buildMode, moboCased:state.moboCased, pasteQuality:state.pasteQuality, pasteDone:state.pasteDone,
      biosDone:state.biosDone, biosQuality:state.biosQuality, ex:state.ex, rigsSold:state.rigsSold,
      lastSeen:Date.now()
    };
  }
  function applySnapshot(saved){
    if(!saved) return;
    state.balance = saved.balance || 0;
    state.owned = saved.owned || state.owned;
    state.clickOwned = saved.clickOwned || state.clickOwned;
    if(saved.lang) state.lang = saved.lang;
    state.redeemed = saved.redeemed || {};
    state.lifetime = saved.lifetime || 0;
    state.halvings = saved.halvings || 0;
    state.muted = !!saved.muted;
    state.buildBought = saved.buildBought || state.buildBought;
    state.buildInstalled = saved.buildInstalled || state.buildInstalled;
    state.buildCablesDone = saved.buildCablesDone || state.buildCablesDone;
    state.buildMode = saved.buildMode || state.buildMode;
    state.moboCased = !!saved.moboCased;
    if(typeof saved.pasteQuality === "number") state.pasteQuality = saved.pasteQuality;
    state.pasteDone = !!saved.pasteDone;
    state.biosDone = !!saved.biosDone;
    if(typeof saved.biosQuality === "number") state.biosQuality = saved.biosQuality;
    if(saved.ex){ state.ex = Object.assign(exDefaults(), saved.ex); }
    state.rigsSold = saved.rigsSold || 0;
  }
  function guestReset(){
    state.balance = 0; state.lifetime = 0; state.perClick = 1; state.rigsSold = 0;
    state.redeemed = {};
    UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
    CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });
    PARTS.forEach(function(p){ state.buildBought[p.id]=false; state.buildInstalled[p.id]=false; });
    Object.keys(CABLES).forEach(function(k){ state.buildCablesDone[k]=false; });
    state.moboCased=false; state.pasteDone=false; state.biosDone=false;
    state.ex = exDefaults();
  }
  function acctPersistCurrent(){
    var db = acctLoadDB();
    if(!state.username) return;
    var key = acctNameKey(state.username);
    if(!db.users[key]) return;
    db.users[key].save = snapshotFromState();
    db.session = key;
    acctSaveDB(db);
  }
  function acctRegister(){
    var name = acctNormName(document.getElementById("username-input").value);
    var pass = document.getElementById("password-input").value;
    if(name.length < 3){ acctShowMsg(t("errUserShort"), "err"); return; }
    if(pass.length < 6){ acctShowMsg(t("errPassShort"), "err"); return; }
    var db = acctLoadDB();
    var key = acctNameKey(name);
    if(db.users[key]){ acctShowMsg(t("errUserTaken"), "err"); return; }
    var salt = acctSalt();
    db.users[key] = {
      name: name,
      salt: salt,
      hash: acctHash(pass, salt),
      created: Date.now(),
      save: snapshotFromState()
    };
    db.session = key;
    acctSaveDB(db);
    state.username = name;
    document.getElementById("password-input").value = "";
    acctShowMsg(t("okRegistered"), "ok");
    save();
    applyStaticText();
    render();
  }

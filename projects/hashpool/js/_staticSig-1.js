/* _staticSig.js — Modul 11/22 */

  var _staticSig = "";
  function applyStaticText(force){
    var sig = state.lang + "|" + state.username + "|" + state.muted + "|" + state.buyQty + "|" + (!!state.username);
    if(!force && sig === _staticSig) return;
    _staticSig = sig;
    document.getElementById("mine-label").textContent = t("mine");
    document.getElementById("title-rig").textContent = t("titleRig");
    document.getElementById("title-click").textContent = t("titleClick");
    document.getElementById("title-hw").textContent = t("titleHw");
    document.getElementById("reset-btn").textContent = t("reset");
    document.getElementById("lang-de").classList.toggle("active", state.lang === "de");
    document.getElementById("lang-en").classList.toggle("active", state.lang === "en");
    document.getElementById("mute-btn").textContent = state.muted ? "🔇" : "🔊";
    document.getElementById("export-btn").textContent = t("exportBtn");
    document.getElementById("import-btn").textContent = t("importBtn");
    document.querySelectorAll(".qty-btn").forEach(function(b){
      b.classList.toggle("active", Number(b.getAttribute("data-qty")) === state.buyQty);
    });
    document.getElementById("username-input").placeholder = t("loginPlaceholder");
    document.getElementById("login-btn").textContent = t("loginBtn");
    document.getElementById("logout-btn").textContent = t("logout");
    document.getElementById("cheat-input").placeholder = t("cheatPlaceholder");
    var ah = document.getElementById("account-hint"); if(ah) ah.textContent = t("accountHint");
    document.getElementById("cheat-btn").textContent = t("cheatBtn");
    var hasName = !!state.username;
    var authBox = document.getElementById("auth-box");
    if(authBox) authBox.style.display = hasName ? "none" : "block";
    document.getElementById("greeting-row").style.display = hasName ? "flex" : "none";
    if(hasName){
      document.getElementById("greeting-text").innerHTML = t("signedInAs") + " <b>" + state.username.replace(/</g,"&lt;") + "</b>";
    }
    var ui = document.getElementById("username-input");
    var pi = document.getElementById("password-input");
    if(ui) ui.placeholder = t("userPh");
    if(pi) pi.placeholder = t("passPh");
    var lb = document.getElementById("login-btn"); if(lb) lb.textContent = t("loginBtn");
    var rb = document.getElementById("register-btn"); if(rb) rb.textContent = t("registerBtn");
    var ah = document.getElementById("account-hint");
    if(ah) ah.textContent = t("accountHintAuth");
    document.documentElement.lang = state.lang;
  }

  var shopClickSig = "", shopSig2 = "";

/* tutorial.js — after +12 starter bonus; precise outlines on real elements */
(function(){
  var STYLE_ID = "hp-tut-style";
  var ROOT_ID = "hp-tut";
  var TARGET_CLS = "hp-tut-target";
  var steps = [
    {
      id: "mine",
      de: { title: "1 · Tippen zum Minen", body: "Drücke den großen orangen Button „Tap to Mine“ in der Mitte. Jeder Tipp bringt Sats." },
      en: { title: "1 · Tap to mine", body: "Press the big orange “Tap to Mine” button in the center. Each tap earns sats." },
      target: "#mine-btn"
    },
    {
      id: "balance",
      de: { title: "2 · Dein Guthaben", body: "Oben siehst du deine Sats. Nach Upgrades steigen hier auch passive Einnahmen und Sats pro Klick." },
      en: { title: "2 · Your balance", body: "Your sats are shown at the top. After upgrades, passive income and sats per click rise here too." },
      target: "#balance"
    },
    {
      id: "shop",
      de: { title: "3 · Teile-Shop", body: "Öffne „Teile-Shop“. Dort kaufst du CPU, GPU, RAM, SSD, Netzteil, Mainboard und Kühler (Stufen 1–10)." },
      en: { title: "3 · Parts Shop", body: "Open Parts Shop to buy CPU, GPU, RAM, SSD, PSU, motherboard and cooler (tiers 1–10)." },
      target: "#ps-open-btn"
    },
    {
      id: "build",
      de: { title: "4 · PC bauen", body: "Hast du von jeder Kategorie mind. 1 Teil: „PC bauen“ → je 1 Teil wählen → Zusammenbau starten → im 3D-Menü einbauen und verkaufen." },
      en: { title: "4 · Build a PC", body: "With ≥1 part per category: open Build → pick one each → start assembly → install in 3D and sell." },
      target: "#open-build-btn"
    },
    {
      id: "clickUp",
      de: { title: "5 · Klick-Power", body: "Unter „CLICK POWER“ / Klick-Upgrades kaufst du stärkere Klicks (z. B. Spitzhacke). Das erhöht Sats pro Tipp." },
      en: { title: "5 · Click power", body: "Under CLICK POWER buy stronger taps (e.g. pickaxe). That raises sats per click." },
      target: "#title-click, #shop-click"
    },
    {
      id: "passive",
      de: { title: "6 · Passive Hardware", body: "Unter Hardware (PASSIVE) kaufst du Miner, die dauerhaft Sats pro Sekunde generieren — auch wenn du nicht tippst." },
      en: { title: "6 · Passive hardware", body: "Under Hardware (PASSIVE) buy miners that generate sats every second — even when you’re not tapping." },
      target: "#title-hw, #shop"
    },
    {
      id: "done",
      de: { title: "Fertig!", body: "Ablauf: Minen → Upgrades/Teile → PC bauen → verkaufen → wiederholen. Viel Erfolg bei HASHPOOL!" },
      en: { title: "You’re ready!", body: "Loop: mine → upgrades/parts → build PC → sell → repeat. Enjoy HASHPOOL!" },
      target: null
    }
  ];
  var idx = 0;
  var activeEl = null;
  var phase = "idle";

  function lang(){
    try { return (state && state.lang === "de") ? "de" : "en"; } catch(e){ return "de"; }
  }
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      "#hp-tut{position:fixed;inset:0;z-index:100000;pointer-events:none;font-family:system-ui,-apple-system,sans-serif}",
      "#hp-tut .hp-tut-dim{position:absolute;inset:0;background:rgba(0,0,0,0.18);pointer-events:auto}",
      "#hp-tut .hp-tut-card{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:min(400px,94vw);background:rgba(18,21,26,0.97);border:2px solid #f7931a;border-radius:16px;padding:16px 18px;color:#f0f2f5;pointer-events:auto;box-shadow:0 12px 32px rgba(0,0,0,0.4)}",
      "#hp-tut .hp-tut-card h3{margin:0 0 8px;font-size:16px;color:#f7931a;font-weight:800}",
      "#hp-tut .hp-tut-card p{margin:0 0 14px;font-size:13.5px;line-height:1.5;color:#d0d6e0}",
      "#hp-tut .hp-tut-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}",
      "#hp-tut .hp-tut-actions button{font:700 13px system-ui;padding:10px 14px;border-radius:10px;border:1px solid #2a313c;background:#1a1f27;color:#e7e9ec;cursor:pointer}",
      "#hp-tut .hp-tut-actions button.primary{background:#f7931a;color:#1a1206;border-color:#f7931a}",
      "#hp-tut .hp-tut-progress{font-size:11px;color:#8b95a5;margin-bottom:8px}",
      "." + TARGET_CLS + "{outline:3px solid #f7931a !important;outline-offset:5px !important;",
      "box-shadow:0 0 0 4px rgba(247,147,26,0.3),0 0 22px rgba(247,147,26,0.55) !important;",
      "position:relative !important;z-index:100001 !important;border-radius:10px;}",
      "@keyframes hpTutPulse{0%,100%{outline-color:#f7931a}50%{outline-color:#ffc14d}}",
      "." + TARGET_CLS + "{animation:hpTutPulse 1.4s ease-in-out infinite}"
    ].join("\n");
    document.head.appendChild(s);
  }
  function clearTarget(){
    if(activeEl){
      activeEl.classList.remove(TARGET_CLS);
      activeEl = null;
    }
  }
  function resolveTarget(sel){
    if(!sel) return null;
    var parts = sel.split(",");
    for(var i=0;i<parts.length;i++){
      var t = document.querySelector(parts[i].trim());
      if(t && t.offsetParent !== null) return t;
    }
    for(var j=0;j<parts.length;j++){
      var t2 = document.querySelector(parts[j].trim());
      if(t2) return t2;
    }
    return null;
  }
  function highlight(sel){
    clearTarget();
    if(!sel) return;
    var t = resolveTarget(sel);
    if(!t) return;
    try {
      t.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    } catch(e){}
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        t = resolveTarget(sel) || t;
        if(!t) return;
        t.classList.add(TARGET_CLS);
        activeEl = t;
      });
    });
  }
  function finish(){
    clearTarget();
    phase = "idle";
    try {
      if(typeof state !== "undefined") state.tutorialDone = true;
      if(typeof save === "function") save();
    } catch(e){}
    var el = document.getElementById(ROOT_ID);
    if(el) el.remove();
  }
  function ensureRoot(){
    ensureStyle();
    var root = document.getElementById(ROOT_ID);
    if(root) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = '<div class="hp-tut-dim"></div><div class="hp-tut-card" id="hp-tut-card"></div>';
    document.body.appendChild(root);
    return root;
  }
  function renderGuide(){
    phase = "guide";
    ensureRoot();
    var step = steps[idx];
    if(!step){ finish(); return; }
    var L = step[lang()] || step.en;
    var card = document.getElementById("hp-tut-card");
    var isLast = idx >= steps.length - 1;
    card.innerHTML =
      '<div class="hp-tut-progress">' + (idx + 1) + " / " + steps.length + '</div>' +
      '<h3>' + L.title + '</h3>' +
      '<p>' + L.body + '</p>' +
      '<div class="hp-tut-actions">' +
        (idx > 0 ? '<button type="button" id="hp-tut-back">' + (lang()==="de"?"Zurück":"Back") + '</button>' : '') +
        '<button type="button" id="hp-tut-skip">' + (lang()==="de"?"Überspringen":"Skip") + '</button>' +
        '<button type="button" class="primary" id="hp-tut-next">' + (isLast ? (lang()==="de"?"Los geht\'s":"Let\'s go") : (lang()==="de"?"Weiter":"Next")) + '</button>' +
      '</div>';
    highlight(step.target);
    document.getElementById("hp-tut-next").onclick = function(){
      if(isLast) finish();
      else { idx++; renderGuide(); }
    };
    var sk = document.getElementById("hp-tut-skip");
    if(sk) sk.onclick = finish;
    var bk = document.getElementById("hp-tut-back");
    if(bk) bk.onclick = function(){ idx = Math.max(0, idx - 1); renderGuide(); };
  }
  function renderOffer(){
    phase = "offer";
    ensureRoot();
    clearTarget();
    var card = document.getElementById("hp-tut-card");
    var de = lang() === "de";
    card.innerHTML =
      '<div class="hp-tut-progress">' + (de ? "Nach dem Starter-Bonus" : "After your starter bonus") + '</div>' +
      '<h3>' + (de ? "Kurze Einführung?" : "Quick tutorial?") + '</h3>' +
      '<p>' + (de
        ? "Du hast +12 Sats erhalten. Soll ich dir in ein paar Schritten zeigen, wo du minen, den Teile-Shop öffnen und einen PC bauen kannst?"
        : "You received +12 sats. Want a short walkthrough of mining, the parts shop, and building a PC?") + '</p>' +
      '<div class="hp-tut-actions">' +
        '<button type="button" id="hp-tut-skip">' + (de ? "Nein, danke" : "No thanks") + '</button>' +
        '<button type="button" class="primary" id="hp-tut-next">' + (de ? "Tutorial starten" : "Start tutorial") + '</button>' +
      '</div>';
    document.getElementById("hp-tut-next").onclick = function(){
      idx = 0;
      renderGuide();
    };
    document.getElementById("hp-tut-skip").onclick = finish;
  }
  function shouldOffer(){
    try {
      if(typeof state === "undefined") return false;
      if(state.tutorialDone) return false;
      if((state.rigsSold || 0) > 0) return false;
      if((state.lifetime || 0) > 50) return false;
      return true;
    } catch(e){ return false; }
  }
  function onStarterClosed(){
    if(phase !== "idle") return;
    if(!shouldOffer()) return;
    setTimeout(function(){ if(phase === "idle" && shouldOffer()) renderOffer(); }, 280);
  }
  function wireWelcomeClose(){
    var btn = document.getElementById("welcome-close");
    if(btn && !btn._hpTutWired){
      btn._hpTutWired = true;
      btn.addEventListener("click", function(){ onStarterClosed(); });
    }
    var modal = document.getElementById("welcome-modal");
    if(modal && !modal._hpTutObs){
      modal._hpTutObs = true;
      try {
        var obs = new MutationObserver(function(){
          if(modal.style.display === "none" || getComputedStyle(modal).display === "none"){
            onStarterClosed();
          }
        });
        obs.observe(modal, { attributes: true, attributeFilter: ["style", "class"] });
      } catch(e){}
    }
  }
  function boot(){
    wireWelcomeClose();
    var tries = 0;
    var t = setInterval(function(){
      wireWelcomeClose();
      tries++;
      if(tries > 40) clearInterval(t);
    }, 250);
  }
  window.HashpoolTutorial = {
    start: function(){ idx = 0; renderGuide(); },
    offer: renderOffer,
    finish: finish
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

/* exSigs.js — Modul 20/22 */

  var exSigs = {};
  function exSet(id, sig, build){
    if(exSigs[id] === sig) return; exSigs[id] = sig; var e = exEl(id); if(e) build(e);
  }
  function exBtn(txt, fn, disabled, cls){
    var b = document.createElement("button"); b.className = "ex-btn" + (cls ? " " + cls : ""); b.innerHTML = txt; b.disabled = !!disabled;
    b.addEventListener("click", fn); return b;
  }
  function exBuildRoot(){
    var root = exEl("ex-root"); if(!root) return;
    root.setAttribute("data-tab", exTab);
    root.innerHTML =
      '<div class="ex-tabs" id="ex-tabs"></div><div class="ex-cards">' +
      '<div class="ex-card" data-t="m"><div class="ex-h" id="ex-h-mkt"></div><div class="ex-row"><span class="ex-big" id="ex-mkt"></span><span class="ex-small" id="ex-mkt-sub"></span></div><canvas id="ex-spark" width="300" height="46" style="width:100%;height:46px;margin-top:8px"></canvas><div class="ex-small" id="ex-mkt-hint"></div></div>' +
      '<div class="ex-card" data-t="m"><div class="ex-h" id="ex-h-ops"></div><div class="ex-small" id="ex-heat-txt"></div><div class="ex-bar"><div id="ex-heat-bar"></div></div><div class="ex-small" id="ex-ops-info" style="margin-top:6px"></div><div class="ex-row" id="ex-ups"></div></div>' +
      '<div class="ex-card" data-t="f"><div class="ex-h" id="ex-h-farm"></div><div class="ex-grid" id="ex-farm"></div><div class="ex-row" id="ex-farm-ctl"></div></div>' +
      '<div class="ex-card" data-t="f"><div class="ex-h" id="ex-h-speed"></div><div class="ex-row" id="ex-speed"></div></div>' +
      '<div class="ex-card" data-t="s"><div class="ex-h" id="ex-h-deals"></div><div id="ex-deals"></div></div>' +
      '<div class="ex-card" data-t="s"><div class="ex-h" id="ex-h-look"></div><div class="ex-row" id="ex-look"></div></div>' +
      '<div class="ex-card" data-t="a"><div class="ex-h" id="ex-h-ach"></div><div id="ex-ach"></div></div></div>';
    exRenderTabs();
  }
  var exTab = "m";
  function exRenderTabs(){
    var bar = exEl("ex-tabs"); if(!bar) return; bar.innerHTML = "";
    [["m","📈 " + exL("Market","Markt")],["f","🏭 Farm"],["s","🛒 Shop"],["a","🏆 " + exL("Missions","Missionen")]].forEach(function(t2){
      var b = document.createElement("button"); b.className = "ex-tab" + (exTab === t2[0] ? " on" : ""); b.textContent = t2[1];
      b.addEventListener("click", function(){ exTab = t2[0]; exEl("ex-root").setAttribute("data-tab", exTab); exRenderTabs(); if(exTab === "m") exSpark(); });
      bar.appendChild(b);
    });
  }
  function exSpark(){
    var c = exEl("ex-spark"); if(!c) return; var g = c.getContext("2d"); var h = state.ex.hist; g.clearRect(0,0,c.width,c.height);
    g.strokeStyle = state.ex.mkt >= 1 ? "#2fd98a" : "#ff5c5c"; g.lineWidth = 2; g.beginPath();
    h.forEach(function(v, i){ var x = i / (h.length - 1) * (c.width - 4) + 2, y = c.height - 4 - (v - 0.5) / 1.7 * (c.height - 8); if(i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke();
  }

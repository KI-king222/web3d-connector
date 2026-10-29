/* exScheduleEvent.js — Modul 22/22 */

  function exScheduleEvent(){
    setTimeout(function(){
      var ex = state.ex, kinds = ["outage", "hack", "dust"];
      if(ex.farm.length || ex.oc) kinds.push("fire");
      var kind = (ex.oc && ex.heat > 80 && Math.random() < 0.5) ? "fire" : kinds[Math.floor(Math.random() * kinds.length)];
      if(exEl("build-overlay") && exEl("build-overlay").style.display !== "none") { /* not while building */ } else exEvent(kind);
      exScheduleEvent();
    }, 45000 + Math.random() * 45000);
  }

  /* --- boot faults (used parts / bent pins) --- */
  function exBootFault(){
    var ex = state.ex, cand = PARTS.filter(function(p){ return ex.used[p.id] && Math.random() < 0.3; }).map(function(p){ return p.id; });
    if(!cand.length && Math.random() < 0.08) cand = [PARTS[Math.floor(Math.random() * PARTS.length)].id];
    if(!cand.length) return false;
    ex.faultPart = cand[0];
    var m = document.createElement("div"); m.id = "ex-fault";
    var sym = EX_SYMPTOM[ex.faultPart][state.lang === "de" ? 1 : 0];
    m.innerHTML = "<div class='box'><div class='ex-h'>⚠️ " + exL("BOOT FAILED", "BOOT FEHLGESCHLAGEN") + "</div><div class='ex-small' style='font-size:12px;color:var(--text)'>" + exL("Symptom: ", "Symptom: ") + "<b>" + sym + "</b><br>" + exL("Which part is faulty?", "Welches Teil ist defekt?") + "</div><div class='ex-grid' id='ex-fp'></div><div class='ex-small' id='ex-fmsg' style='margin-top:8px'></div></div>";
    document.body.appendChild(m);
    PARTS.forEach(function(p){
      exEl("ex-fp").appendChild(exBtn(p.icon + " " + p.name[state.lang], function(){
        if(p.id === ex.faultPart){
          var c = Math.min(state.balance, Math.round(buildPartCost(p) * 0.3)); state.balance -= c; ex.used[p.id] = false; ex.fixes++; m.remove();
          exToast("🔧 " + exL("Fixed! Replacement cost ", "Behoben! Ersatzteil ") + fmtCost(c)); bootPlayed = true; exAfterBoot(); save(); render();
        } else {
          var pen = Math.min(state.balance, Math.round(state.balance * 0.03)); state.balance -= pen; exEl("ex-fmsg").textContent = "❌ " + exL("Wrong part, lost ", "Falsches Teil, verloren: ") + fmtCost(pen); render();
        }
      }));
    });
    return true;
  }
  function exAfterBoot(){
    var ex = state.ex;
    if(ex.speed && ex.tStart){
      var s = (Date.now() - ex.tStart) / 1000; ex.tStart = 0;
      ex.best.push(s); ex.best.sort(function(a, b){ return a - b; }); ex.best = ex.best.slice(0, 5);
      ex.bonus = s <= 120 ? 1.25 : s <= 240 ? 1.1 : 1;
      exToast("⏱️ " + s.toFixed(0) + "s" + (ex.bonus > 1 ? " · +" + Math.round((ex.bonus - 1) * 100) + "% " + exL("sale bonus", "Verkaufsbonus") : ""));
    }
    exCheckMissions();
  }

  /* --- farm placement + sell reset --- */
  function exFarmBtn(reward){
    var b = exEl("bo-farm-btn");
    if(!b){
      b = document.createElement("button"); b.id = "bo-farm-btn"; b.className = "bo-primary-btn"; b.style.marginTop = "8px";
      var ref = exEl("bo-action-btn"); ref.parentNode.insertBefore(b, ref.nextSibling);
    }
    var ex = state.ex, cost = buildTotalCost();
    var full = ex.farm.length >= ex.slots;
    b.style.display = "block"; b.disabled = full;
    b.textContent = full ? "🏭 " + exL("Farm is full", "Farm ist voll") : "🏭 " + exL("Place in farm  +", "In Farm stellen  +") + fmtSats(cost * 0.005) + "/s";
    b.onclick = function(){ if(full) return; ex.farm.push({cost: cost, dust: 0}); ex.bonus = 1; ex.used = {}; exSigs["ex-farm"] = ""; sellRig(0); exToast("🏭 " + exL("Rig placed in the farm", "Rig in die Farm gestellt")); };
  }
  function exHideFarmBtn(){ var b = exEl("bo-farm-btn"); if(b) b.style.display = "none"; }

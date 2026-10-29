/* openBiosStage.js — Modul 15/22 */

  function openBiosStage(onDone){
    if(state.biosDone){ if(onDone) onDone(); return; }
    var host = document.getElementById("bo-rig-area");
    if(!host){ if(onDone) onDone(); return; }
    var old = document.getElementById("bios-stage");
    if(old) old.remove();
    var keys = ["Del","F2","F10","Esc"];
    var seq = [];
    for(var i=0;i<4;i++) seq.push(keys[Math.floor(Math.random()*keys.length)]);
    var step = 0;
    var box = document.createElement("div");
    box.className = "bios-stage"; box.id = "bios-stage";
    box.innerHTML =
      '<h3>'+t("biosTitle")+'</h3>' +
      '<p>'+t("biosHint")+'</p>' +
      '<div class="bios-bar"><div id="bios-timer"></div></div>' +
      '<div class="bios-target" id="bios-target">'+seq[0]+'</div>' +
      '<div class="bios-seq" id="bios-seq"></div>' +
      '<div class="bios-keys" id="bios-keys"></div>' +
      '<div class="bios-msg" id="bios-msg"></div>' +
      '<div class="paste-actions"><button type="button" id="bios-skip">'+t("biosSkip")+'</button></div>';
    host.insertBefore(box, host.firstChild);
    try{ box.scrollIntoView({ behavior:"smooth", block:"nearest" }); }catch(e){}

    var seqEl = document.getElementById("bios-seq");
    seq.forEach(function(k, idx){
      var d = document.createElement("div");
      d.className = "bios-key" + (idx===0 ? " next" : "");
      d.textContent = k;
      seqEl.appendChild(d);
    });

    var totalTime = (window.innerWidth < 600) ? 18000 : 14000;
    var timeLeft = totalTime, t0 = performance.now();
    var bar = document.getElementById("bios-timer");
    var targetEl = document.getElementById("bios-target");
    var msgEl = document.getElementById("bios-msg");
    var finished = false;

    function refreshTarget(){
      if(targetEl) targetEl.textContent = step < seq.length ? seq[step] : "OK";
    }

    function onKey(k){
      if(finished) return;
      if(k === seq[step]){
        var nodes = seqEl.querySelectorAll(".bios-key");
        if(nodes[step]){ nodes[step].classList.add("done"); nodes[step].classList.remove("next"); }
        step++;
        if(nodes[step]) nodes[step].classList.add("next");
        refreshTarget();
        if(step >= seq.length){
          finished = true;
          clearInterval(timer);
          state.biosDone = true;
          state.biosQuality = Math.max(0.7, 1 - (1 - timeLeft/totalTime) * 0.3);
          msgEl.textContent = t("biosOk");
          msgEl.style.color = "var(--green)";
          setTimeout(function(){ box.remove(); save(); if(onDone) onDone(); }, 400);
        }
      } else {
        msgEl.textContent = t("biosFail");
        msgEl.style.color = "var(--red)";
        step = 0;
        seqEl.querySelectorAll(".bios-key").forEach(function(n, idx){
          n.classList.remove("done", "next");
          if(idx===0) n.classList.add("next");
        });
        refreshTarget();
      }
    }

    var keysEl = document.getElementById("bios-keys");
    keys.forEach(function(k){
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = k;
      b.addEventListener("pointerdown", function(e){
        e.preventDefault();
        e.stopPropagation();
        onKey(k);
      });
      keysEl.appendChild(b);
    });

    var timer = setInterval(function(){
      if(finished) return;
      timeLeft = Math.max(0, totalTime - (performance.now() - t0));
      if(bar) bar.style.transform = "scaleX(" + (timeLeft/totalTime) + ")";
      if(timeLeft <= 0){
        msgEl.textContent = t("biosFail");
        msgEl.style.color = "var(--red)";
        step = 0;
        seqEl.querySelectorAll(".bios-key").forEach(function(n, idx){
          n.classList.remove("done", "next");
          if(idx===0) n.classList.add("next");
        });
        refreshTarget();
        t0 = performance.now();
      }
    }, 50);

    document.getElementById("bios-skip").addEventListener("pointerdown", function(e){
      e.preventDefault();
      finished = true;
      clearInterval(timer);
      state.biosDone = true;
      state.biosQuality = 0.6;
      box.remove();
      save();
      if(onDone) onDone();
    });
  }

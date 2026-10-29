/* pasteScoreFromCoverage.js — Modul 14/22 */

  function pasteScoreFromCoverage(cov, overspread){
    var c = Math.max(0, Math.min(1, cov));
    var ideal = 1 - Math.abs(c - 0.7) / 0.7;
    var penalty = Math.min(1, overspread * 1.2);
    return Math.max(0.15, Math.min(1, ideal * (1 - penalty * 0.5)));
  }
  function openPasteStage(onDone){
    if(state.pasteDone){ if(onDone) onDone(); return; }
    var host = document.getElementById("bo-rig-area");
    if(!host){ if(onDone) onDone(); return; }
    var existing = document.getElementById("paste-stage");
    if(existing) existing.remove();
    var box = document.createElement("div");
    box.className = "paste-stage"; box.id = "paste-stage";
    box.innerHTML = '<h3>'+t("pasteTitle")+'</h3><p>'+t("pasteHint")+'</p>' +
      '<div class="paste-canvas-wrap"><canvas id="paste-canvas" width="260" height="260"></canvas></div>' +
      '<div class="paste-meta"><span>'+t("pasteTitle")+'</span><b id="paste-score">—</b></div>' +
      '<div class="paste-actions"><button type="button" id="paste-skip">'+t("pasteSkip")+'</button>' +
      '<button type="button" class="primary" id="paste-apply">'+t("pasteBtn")+'</button></div>';
    host.insertBefore(box, host.firstChild);
    var canvas = document.getElementById("paste-canvas");
    var ctx = canvas.getContext("2d");
    var grid = 32, cells = grid*grid, painted = new Uint8Array(cells);
    var painting = false, strokes = 0;
    function draw(){
      ctx.fillStyle = "#0c1116"; ctx.fillRect(0,0,260,260);
      ctx.fillStyle = "#3a4048"; ctx.fillRect(70,70,120,120);
      ctx.fillStyle = "#b8bec5"; ctx.fillRect(90,90,80,80);
      var cell = 120/grid;
      for(var i=0;i<cells;i++){
        if(!painted[i]) continue;
        var x = i % grid, y = (i/grid)|0;
        ctx.fillStyle = "rgba(247,147,26,0.85)";
        ctx.fillRect(70 + x*cell, 70 + y*cell, cell+0.5, cell+0.5);
      }
      var cov = 0; for(var k=0;k<cells;k++) if(painted[k]) cov++;
      cov /= cells;
      var over = Math.max(0, strokes/cells - cov);
      var score = pasteScoreFromCoverage(cov, over);
      var el = document.getElementById("paste-score");
      if(el) el.textContent = Math.round(score*100) + "%";
      box.dataset.score = String(score);
    }
    function paintAt(cx, cy){
      var rect = canvas.getBoundingClientRect();
      var x = (cx - rect.left) / rect.width * 260;
      var y = (cy - rect.top) / rect.height * 260;
      if(x<70||y<70||x>190||y>190) return;
      var gx = Math.min(grid-1, Math.max(0, ((x-70)/120*grid)|0));
      var gy = Math.min(grid-1, Math.max(0, ((y-70)/120*grid)|0));
      var brush = 2;
      for(var dy=-brush; dy<=brush; dy++) for(var dx=-brush; dx<=brush; dx++){
        var nx = gx+dx, ny = gy+dy;
        if(nx<0||ny<0||nx>=grid||ny>=grid) continue;
        painted[ny*grid+nx] = 1; strokes++;
      }
      draw();
    }
    function ptrDown(e){ painting = true; paintAt(e.clientX, e.clientY); e.preventDefault(); }
    function ptrMove(e){ if(!painting) return; paintAt(e.clientX, e.clientY); e.preventDefault(); }
    function ptrUp(){ painting = false; }
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", ptrDown);
    canvas.addEventListener("pointermove", ptrMove);
    window.addEventListener("pointerup", ptrUp);
    canvas.addEventListener("touchstart", function(e){ e.preventDefault(); }, {passive:false});
    canvas.addEventListener("touchmove", function(e){ e.preventDefault(); }, {passive:false});
    draw();
    document.getElementById("paste-apply").addEventListener("pointerdown", function(e){
      e.preventDefault();
      state.pasteQuality = parseFloat(box.dataset.score || "0.5");
      state.pasteDone = true;
      window.removeEventListener("pointerup", ptrUp);
      box.remove();
      save();
      if(onDone) onDone();
    });
    document.getElementById("paste-skip").addEventListener("pointerdown", function(e){
      e.preventDefault();
      state.pasteQuality = 0.55;
      state.pasteDone = true;
      window.removeEventListener("pointerup", ptrUp);
      box.remove();
      save();
      if(onDone) onDone();
    });
  }

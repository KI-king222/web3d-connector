/* moveGhost.js — Modul 13/22 */

  function moveGhost(x, y){
    if(!dragState) return;
    dragState.ghost.style.left = x + "px";
    dragState.ghost.style.top = y + "px";
    if(dragState.cableLine){
      dragState.cableLine.setAttribute("x2", x);
      dragState.cableLine.setAttribute("y2", y);
    }
  }
  function onDragMove(e){ moveGhost(e.clientX, e.clientY); }
  function onDragEnd(e){
    if(!dragState) return;
    var ds = dragState;
    var ok = tryDrop(ds.type, ds.id, e.clientX, e.clientY);
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
    dragActive = false;
    var svgEl = document.getElementById("cable-drag-svg");
    if(svgEl) svgEl.remove();
    if(!ok){
      ds.ghost.classList.add("shake");
      setTimeout(function(){ ds.ghost.remove(); }, 260);
    } else {
      ds.ghost.remove();
    }
    dragState = null;
  }
  function screenPosOfLocal(vec3local){
    if(!rigGroup || !camera3d) return null;
    var el = document.getElementById("case-3d");
    if(!el) return null;
    var rect = el.getBoundingClientRect();
    rigGroup.updateMatrixWorld(true);
    var v = vec3local.clone().applyMatrix4(rigGroup.matrixWorld);
    v.project(camera3d);
    return { x: rect.left + (v.x*0.5+0.5)*rect.width, y: rect.top + (-v.y*0.5+0.5)*rect.height };
  }
  function tryDrop(type, id, x, y){
    var el = document.getElementById("case-3d");
    if(!el) return false;
    var rect = el.getBoundingClientRect();
    if(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return false;
    var THRESH = 95;
    if(type === "part"){
      var mesh = partMeshes[id];
      if(!mesh || !camera3d || !partAvailable(id)) return false;
      var wp = new THREE.Vector3();
      if(id === "mobo"){
        rigGroup.updateMatrixWorld(true);
        wp.set(BENCH.mobo[0], BENCH.mobo[1], BENCH.mobo[2]).applyMatrix4(rigGroup.matrixWorld);
      } else {
        mesh.getWorldPosition(wp);
      }
      wp.project(camera3d);
      var pos = { x: rect.left + (wp.x*0.5+0.5)*rect.width, y: rect.top + (-wp.y*0.5+0.5)*rect.height };
      if(Math.hypot(pos.x-x, pos.y-y) > THRESH) return false;
      state.buildInstalled[id] = true;
      sfxInstall(); save(); render();
      return true;
    } else if(type === "cable"){
      var cfg = CABLES[id];
      if(!cfg) return false;
      var pos2 = screenPosOfLocal(new THREE.Vector3(cfg.to[0], cfg.to[1], cfg.to[2]));
      if(!pos2) return false;
      if(Math.hypot(pos2.x-x, pos2.y-y) > THRESH) return false;
      state.buildCablesDone[id] = true;
      sfxInstall(); save(); render();
      return true;
    } else if(type === "moboCase"){
      if(!moboReadyForCase() || state.moboCased) return false;
      var pos3 = screenPosOfLocal(new THREE.Vector3(PART3D.mobo.pos[0], PART3D.mobo.pos[1], PART3D.mobo.pos[2]));
      if(!pos3) return false;
      if(Math.hypot(pos3.x-x, pos3.y-y) > THRESH) return false;
      caseTheMobo();
      return true;
    }
    return false;
  }

  var bootPlayed = false, bootPlaying = false;

  function openBuildOverlay(){
    document.getElementById("build-overlay").style.display = "flex";
    ensureCase3D();
    if(allInstalled()) bootPlayed = true;
    renderBuildOverlay();
  }
  function closeBuildOverlay(){
    document.getElementById("build-overlay").style.display = "none";
  }
  function ensureCase3D(){
    if(!renderer3d) initCase3D();
  }

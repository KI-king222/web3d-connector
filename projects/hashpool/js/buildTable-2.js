/* buildTable-2.js — camera pan/zoom/pinch + anim tick start */
    var isDragging = false, isPanning = false, lastX = 0, lastY = 0, multiTouch = false;
    el.addEventListener("pointerdown", function(e){
      if(multiTouch) return;
      isPanning = (e.button === 1 || e.button === 2 || e.shiftKey);
      isDragging = true; lastX = e.clientX; lastY = e.clientY;
      try{ el.setPointerCapture(e.pointerId); }catch(err){}
    });
    el.addEventListener("contextmenu", function(e){ e.preventDefault(); });
    el.addEventListener("pointermove", function(e){
      if(!isDragging || multiTouch) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      if(isPanning || e.shiftKey){
        camTarget.x = Math.max(-4, Math.min(6, camTarget.x - dx * 0.012));
        camTarget.y = Math.max(-3, Math.min(3, camTarget.y + dy * 0.012));
      } else {
        rigGroup.rotation.y += dx * 0.01;
        rigGroup.rotation.x = Math.max(-0.6, Math.min(0.6, rigGroup.rotation.x + dy * 0.008));
      }
    });
    window.addEventListener("pointerup", function(){ isDragging = false; isPanning = false; });

    var camZmin = 2.4, camZmax = 18;
    el.addEventListener("wheel", function(e){
      e.preventDefault();
      camTarget.z = Math.max(camZmin, Math.min(camZmax, camTarget.z + e.deltaY * 0.006));
    }, { passive:false });
    var pinchDist = null;
    el.addEventListener("touchstart", function(e){
      if(e.touches.length >= 2){ multiTouch = true; isDragging = false; pinchDist = null; }
    }, { passive:true });
    var pinchMid = null;
    el.addEventListener("touchmove", function(e){
      if(e.touches.length === 2){
        e.preventDefault();
        multiTouch = true; isDragging = false;
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.hypot(dx, dy);
        var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        if(pinchDist != null){
          camTarget.z = Math.max(camZmin, Math.min(camZmax, camTarget.z - (dist - pinchDist) * 0.025));
        }
        if(pinchMid != null){
          camTarget.x = Math.max(-4, Math.min(6, camTarget.x - (midX - pinchMid.x) * 0.01));
          camTarget.y = Math.max(-3, Math.min(3, camTarget.y + (midY - pinchMid.y) * 0.01));
        }
        pinchDist = dist;
        pinchMid = { x: midX, y: midY };
      }
    }, { passive:false });
    el.addEventListener("touchend", function(e){
      if(e.touches.length < 2){ pinchDist = null; }
      if(e.touches.length === 0){ setTimeout(function(){ multiTouch = false; }, 60); }
    });

    var expandBtn = document.getElementById("case-expand-btn");
    if(expandBtn){
      expandBtn.addEventListener("pointerdown", function(ev){ ev.stopPropagation(); });
      expandBtn.addEventListener("click", function(ev){
        ev.stopPropagation();
        el.classList.toggle("expanded");
        expandBtn.textContent = el.classList.contains("expanded") ? "⤡" : "⤢";
        setTimeout(function(){ window.dispatchEvent(new Event("resize")); }, 30);
      });
    }

    function resize3d(){
      var ww = el.clientWidth || 280, hh = el.clientHeight || 250;
      camera3d.aspect = ww / hh;
      camera3d.updateProjectionMatrix();
      renderer3d.setSize(ww, hh);
    }
    window.addEventListener("resize", resize3d);

    function tick(){
      requestAnimationFrame(tick);
      var now = performance.now();
      Object.keys(animQueue).forEach(function(id){
        var a = animQueue[id];
        var pr = Math.min(1, (now - a.start) / a.duration);
        var eased = 1 - Math.pow(1 - pr, 3);
        var s = 0.25 + eased * 0.75;
        partMeshes[id].scale.set(s, s, s);
        if(pr >= 1) delete animQueue[id];
      });
      screwQueue = screwQueue.filter(function(sc){
        var pr = Math.min(1, (now - sc.start) / sc.duration);
        var s = Math.min(1, pr * 1.3);
        sc.mesh.scale.set(s, s, s);
        sc.mesh.rotation.y += 0.9;

/* buildPartCost-2.js — startDrag */
  function startDrag(e, type, id, icon, label){
    if(e.cancelable) e.preventDefault();
    var ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.innerHTML = "<span>"+icon+"</span><span class=\"gname\">"+label+"</span>";
    document.body.appendChild(ghost);
    dragState = { type:type, id:id, ghost:ghost };
    dragActive = true;
    moveGhost(e.clientX, e.clientY);
    if(type === "cable"){
      var cfg = CABLES[id];
      var fromPos = screenPosOfLocal(new THREE.Vector3(cfg.from[0], cfg.from[1], cfg.from[2]));
      if(fromPos){
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = "cable-drag-svg";
        svg.setAttribute("style", "position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;");
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", fromPos.x); line.setAttribute("y1", fromPos.y);
        line.setAttribute("x2", fromPos.x); line.setAttribute("y2", fromPos.y);
        line.setAttribute("stroke", "#f7931a"); line.setAttribute("stroke-width", "4"); line.setAttribute("stroke-linecap", "round");
        svg.appendChild(line);
        document.body.appendChild(svg);
        dragState.cableLine = line;
      }
    }
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
  }

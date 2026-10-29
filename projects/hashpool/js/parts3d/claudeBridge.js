/* parts3d/claudeBridge.js — bindet Claude-Zusammenbau an HASHPOOL-Spielzustand */
(function(){
  function trySync(){
    if(window.Parts3D && Parts3D.syncGameCables) Parts3D.syncGameCables();
  }
  var _iv = setInterval(function(){
    if(typeof recomputeCables === "function" && window.Parts3D && Parts3D.syncGameCables){
      var _rc = recomputeCables;
      if(_rc._claudeBound){ clearInterval(_iv); return; }
      window.recomputeCables = function(){
        try{ Parts3D.syncGameCables(); }catch(e){}
        return _rc.apply(this, arguments);
      };
      window.recomputeCables._claudeBound = true;
      trySync();
      clearInterval(_iv);
      console.log("[HASHPOOL] claudeBridge: recomputeCables wrapped");
    }
  }, 300);
  setTimeout(function(){ clearInterval(_iv); }, 15000);

  document.addEventListener("click", function(ev){
    var el = ev.target && ev.target.closest && ev.target.closest("[data-pick-id]");
    if(!el || !window.Parts3D || !Parts3D.canPick) return;
    var id = el.getAttribute("data-pick-id");
    var r = Parts3D.canPick(id);
    if(r && r.ok===false){
      var msg = r.errors.map(function(e){ return e.msg; }).join(" · ");
      try{
        if(window.PartShop && PartShop.toast) PartShop.toast(msg);
        else if(typeof toast==="function") toast(msg, "err");
      }catch(e){}
      el.setAttribute("title", msg);
    }
  }, true);

  window.Parts3D = window.Parts3D || {};
  window.Parts3D.claudeBridge = true;
})();

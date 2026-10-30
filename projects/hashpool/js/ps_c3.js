ill '+(cls||'')+'" style="width:'+(score*10)+'%"></div></div></div>';
  }
  var view = { mode:"shelves", cat:null, selected:null };
  var pickerExpand = {};
  function render(){
    var body = document.getElementById("ps-body");
    var title = document.getElementById("ps-title");
    var back = document.getElementById("ps-back");
    var sats = document.getElementById("ps-sats");
    if(!body) return;
    ensureInv();
    if(sats) sats.textContent = fmt(state.balance) + " sats";
    if(view.mode === "shelves"){
      if(title) title.textContent = state.lang==="de" ? "Teile-Shop" : "Parts Shop";
      if(back) back.style.visibility = "hidden";
      var html = '<p class="ps-inv-hint">'+(state.lang==="de"
        ? "Kaufen · später im Bau-Menü aus dem Inventar wählen. Nur gewählte Teile werden verbraucht."
        : "Buy · later pick from inventory in build menu. Only selected parts are used up.")+'</p><div class="ps-shelves">';
      PART_CATEGORIES.forEach(function(c){
        var info = PART_CATALOG[c];
        var nm = (info.name && (info.name[state.lang]||info.name.en)) || c;
        var own = categoryOwned(c);
        html += '<div class="ps-shelf" data-cat="'+c+'"><span class="ps-shelf-icon">'+(info.icon||"📦")+'</span><div class="ps-shelf-name">'+nm+'</div><div class="ps-shelf-count">'+(own ? (state.lang==="de"?"Inventar: "+own:"Owned: "+own) : ((info.items||[]).length+" models"))+'</div></div>';
      });
      html += '</div><div class="ps-floor"></div>';
      if(canBuildPC()){
        html += '<button type="button" class="ps-buy-btn" id="ps-go-build" style="width:100%;margin-top:14px">'+(state.lang==="de"?"Zum Zusammenbauen":"Go to assembly")+'</button>';
      
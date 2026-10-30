}
      body.innerHTML = html;
      body.querySelectorAll(".ps-shelf").forEach(function(el){
        el.addEventListener("click", function(){
          view.mode = "list"; view.cat = el.getAttribute("data-cat"); view.selected = null; render();
        });
      });
      var gb = document.getElementById("ps-go-build");
      if(gb) gb.addEventListener("click", function(){ closeShop(); openPicker(); });
      return;
    }
    var cat = view.cat;
    var info = PART_CATALOG[cat] || {};
    if(title) title.textContent = (info.name && (info.name[state.lang]||info.name.en)) || cat;
    if(back) back.style.visibility = "visible";
    var html = '<div class="ps-list-wrap">';
    (info.items||[]).forEach(function(it){
      var sel = view.selected === it.id;
      var own = ownedCount(it.id);
      var chip = brandChipClass(it.brand, it.tier);
      html += '<div class="ps-row'+(sel?" selected":"")+'" data-id="'+it.id+'">' +
        '<div class="ps-row-icon '+chip+'">'+chipLabel(it).replace("\n","<br>")+'</div>' +
        '<div class="ps-row-main"><div class="ps-row-brand">'+it.brand+'</div><div class="ps-row-model">'+it.model+'</div><div class="ps-row-tier">'+partTierBadge(it)+(own? ' <span class="ps-row-owned">x'+own+'</span>':'')+'</div></div>' +
        '<div class="ps-row-price">'+fmt(it.cost)+'</div></div>';
      if(sel){
        var canBuy = state.balance >= (it.cost||0);
        html += '<div class="ps-detail open"><div class="ps-detail-name">'+partBaseName(it)+'</div><div class="ps-detail-brand">'+partTierBadge(it)+'</div>' +
          scaleRow(state.lang==="de"?"Leistung":"Performance", it.power, "") +
          scaleRow(state.lang==="de"?"Effizienz":"Efficiency", it
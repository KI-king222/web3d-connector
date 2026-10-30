y"));
      html += '<div class="ps-acc'+(open?" open":"")+(pickedIt?" has-pick":"")+'">';
      html += '<button type="button" class="ps-acc-head" data-acc-cat="'+cat+'">';
      html += '<span class="ps-acc-left">'+(info.icon||"")+' <strong>'+nm+'</strong></span>';
      html += '<span class="ps-acc-mid">'+summary+'</span>';
      html += '<span class="ps-acc-arrow" aria-hidden="true">'+(open?"▾":"▸")+'</span>';
      html += '</button>';
      if(open){
        html += '<div class="ps-acc-body">';
        if(!owned.length){
          html += '<div class="ps-row ps-muted">'+(state.lang==="de"?"Keine Teile — im Shop kaufen":"No parts — buy in shop")+'</div>';
        } else {
          owned.forEach(function(it){
            var picked = state.buildPick[cat] === it.id;
            var chip = brandChipClass(it.brand, it.tier);
            html += '<div class="ps-row'+(picked?" selected":"")+'" data-pick-cat="'+cat+'" data-pick-id="'+it.id+'">' +
              '<div class="ps-row-icon '+chip+'">'+chipLabel(it).replace("\n","<br>")+'</div>' +
              '<div class="ps-row-main"><div class="ps-row-brand">'+it.brand+'</div><div class="ps-row-model">'+it.model+'</div>' +
              '<div class="ps-row-tier">'+partTierBadge(it)+' · x'+ownedCount(it.id)+'</div></div></div>';
          });
        }
        html += '</div>';
      }
      html += '</div>';
    });
    if(allPicked()){
      html += '<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%;margin-top:12px">'+(state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    } else {
      html += '<button type="button" class="ps-buy-btn" disabled style="width:100%;margin-top:1
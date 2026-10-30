 "flex";
      }catch(_force){}
    });
  }
  function openPicker(){
    if(!canBuildPC()){
      showToast(state.lang==="de"
        ? "Zuerst im Teile-Shop je 1 Teil pro Kategorie kaufen"
        : "First buy 1 part per category in the Parts Shop");
    }
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat];
      if(id && !(state.partInv[id] > 0)) delete state.buildPick[cat];
    });
    ensurePickerDom();
    document.getElementById("ps-picker").classList.add("open");
    renderPicker();
  }
  function closePicker(){
    var el = document.getElementById("ps-picker");
    if(el) el.classList.remove("open");
  }
  function updateOpenBtnLabel(){
    var el = document.getElementById("ps-open-label");
    if(el) el.textContent = (state.lang==="de") ? "Teile-Shop" : "Parts Shop";
    else {
      var btn = document.getElementById("ps-open-btn");
      if(btn) btn.innerHTML = (state.lang==="de") ? "🛒 Teile-Shop" : "🛒 Parts Shop";
    }
  }
  function openShop(){
    updateOpenBtnLabel();
    var ov = document.getElementById("ps-overlay");
    if(!ov) return;
    view.mode = "shelves"; view.cat = null; view.selected = null;
    ov.classList.add("open");
    render();
  }
  function closeShop(){
    var ov = document.getElementById("ps-overlay");
    if(ov) ov.classList.remove("open");
  }
  function wire(){
    var openBtn = document.getElementById("ps-open-btn");
    var closeBtn = document.getElementById("ps-close");
    var backBtn = document.getElementById("ps-back");
    updateOpenBtnLabel();
    if(openBtn) openBtn.addEventListener("click", openShop);
    if(closeBtn) closeBtn.addEventListener("click", closeShop);
    if(bac
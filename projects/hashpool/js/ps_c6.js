<div class="ps-top"><button type="button" class="ps-back" id="ps-picker-back" style="visibility:hidden">←</button><h2 id="ps-picker-title">Build</h2><div class="ps-sats" id="ps-picker-cost">—</div><button type="button" class="ps-close" id="ps-picker-close">✕</button></div><div class="ps-body" id="ps-picker-body"></div>';
    document.body.appendChild(d);
    document.getElementById("ps-picker-close").addEventListener("click", closePicker);
  }
  function renderPicker(){
    ensurePickerDom(); ensureInv();
    var body = document.getElementById("ps-picker-body");
    var title = document.getElementById("ps-picker-title");
    var costEl = document.getElementById("ps-picker-cost");
    if(title) title.textContent = state.lang==="de" ? "Teile für den Bau" : "Parts for this build";
    if(costEl) costEl.textContent = fmt(selectedBuildCost())+" sats";
    var html = '<p class="ps-inv-hint">'+(state.lang==="de"
      ? "Tippe eine Kategorie, um sie auszuklappen. Wähle je ein Teil aus deinem Inventar."
      : "Tap a category to expand. Pick one owned part per category.")+'</p>';
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var info = PART_CATALOG[cat] || {name:{en:cat,de:cat}, icon:"📦"};
      var nm = (info.name && (info.name[state.lang]||info.name.en)) || cat;
      var owned = ownedItemsInCat(cat);
      var open = !!pickerExpand[cat];
      var pickedId = state.buildPick[cat];
      var pickedIt = pickedId && PART_BY_ID[pickedId];
      var summary = pickedIt
        ? (partBaseName(pickedIt) + " · " + partTierLabel(pickedIt))
        : (owned.length
            ? (owned.length+(state.lang==="de"?" im Inventar":" owned"))
            : (state.lang==="de"?"leer":"empt
tua:"ps-chip-noctua",asus:"ps-chip-asus",msi:"ps-chip-msi",gigabyte:"ps-chip-gigabyte",seasonic:"ps-chip-seasonic",bequiet:"ps-chip-bequiet",deepcool:"ps-chip-default",arctic:"ps-chip-default",nzxt:"ps-chip-corsair",fractal:"ps-chip-default",lianli:"ps-chip-default",crucial:"ps-chip-kingston",wd:"ps-chip-default",seagate:"ps-chip-default",gskill:"ps-chip-corsair",stock:"ps-chip-default",asrock:"ps-chip-amd",generic:"ps-chip-default",nocturne:"ps-chip-noctua",icewing:"ps-chip-default",abyssal:"ps-chip-default",corvus:"ps-chip-corsair",samsum:"ps-chip-samsung",fjordic:"ps-chip-default",lumio:"ps-chip-default",prisma:"ps-chip-default",kingforge:"ps-chip-kingston",crux:"ps-chip-kingston",seaguard:"ps-chip-default",seasonicx:"ps-chip-seasonic",asusx:"ps-chip-asus",msx:"ps-chip-msi",asrockx:"ps-chip-amd",axiom:"ps-chip-intel",ember:"ps-chip-amd",quanta:"ps-chip-intel",blaze:"ps-chip-amd",fjord:"ps-chip-default"};
    var cls = map[b] || "ps-chip-default";
    if(tier >= 8) cls += " ps-chip-tier-hi";
    else if(tier >= 5) cls += " ps-chip-tier-mid";
    return cls;
  }
  function chipLabel(it){ return (it.brand||"").slice(0,3).toUpperCase() + "\nT" + it.tier; }
  function showToast(msg){
    var el = document.getElementById("ps-toast");
    if(!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ el.classList.remove("show"); }, 3200);
  }
  function scaleRow(label, score, cls){
    score = Math.max(1, Math.min(10, Number(score)||1));
    return '<div class="ps-scale"><div class="ps-scale-label"><span>'+label+'</span><span>'+score+'/10</span></div><div class="ps-scale-bar"><div class="ps-scale-f
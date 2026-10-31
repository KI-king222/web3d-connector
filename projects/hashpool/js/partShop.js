/* partShop.js — Loader fuer den Teile-Shop (Chunks ps_c0..ps_c10.js).
 * Laeuft im Spiel-Scope (vom index.html-Lader in das Spiel-Script eingefuegt): direktes eval behaelt state/save/fmtSats/PART_*.
 * Fehler -> console.warn, Spiel laeuft weiter. */
(function(){
  var N = 11, base = "https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/", parts = new Array(N), done = 0, failed = false;
  function go(){
    if(done < N) return;
    if(failed){ console.warn("[HASHPOOL] partShop: Chunk fehlt, Shop nicht geladen"); return; }
    try{
      eval(parts.join(""));
      console.log("[HASHPOOL] partShop geladen:", !!(window.PartShop && window.PartShop.open));
    }catch(e){ console.error("[HASHPOOL] partShop", e); }
  }
  for(var i = 0; i < N; i++) (function(i){
    fetch(base + "ps_c" + i + ".js?v=" + Date.now(), { cache: "no-store" })
      .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function(t){ parts[i] = t; })
      .catch(function(e){ failed = true; parts[i] = ""; console.warn("[HASHPOOL] ps_c" + i, e); })
      .then(function(){ done++; go(); });
  })(i);
})();

/* next.js — nur in /next/ geladen. Spielwiese fuer den Shop-Simulator.
 * Phase 0: Kennzeichnung, Rueckweg zur stabilen Version. (Hinterraum/Bautisch folgen hier.)
 */
(function () {
  var W = window;
  if (W.__hpNext) return; W.__hpNext = true;
  function de() { try { return !(W.state && W.state.lang === "en"); } catch (e) { return true; } }
  var bar = document.createElement("div");
  bar.id = "hp-next-bar";
  bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 2px) 8px 2px;background:#f7931a;color:#1a1206;font:700 11px monospace;pointer-events:none";
  var a = document.createElement("span"); a.textContent = "NEXT · Test-Version";
  var sp = document.createElement("span"); sp.style.flex = "1";
  var back = document.createElement("a"); back.href = "./"; back.textContent = (de() ? "← stabile Version" : "← stable version");
  back.style.cssText = "pointer-events:auto;color:#1a1206;text-decoration:underline";
  bar.appendChild(a); bar.appendChild(sp); bar.appendChild(back);
  function put() { if (document.body && !document.getElementById("hp-next-bar")) document.body.appendChild(bar); }
  put(); setInterval(put, 2000);
  console.log("[HASHPOOL NEXT] aktiv");
})();

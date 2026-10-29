/* exScheduleEvent Teil 4 */

            ? ("Humanish bot OK — "+clicks+" clicks, "+buys+" buys, passive "+s2.passive.toFixed(3)+"/s, fun~"+fun+"/10")
            : ("Humanish bot issues ("+issues.length+"): "+issues.join("; "))
        };
        console.log("[HASHPOOL bot]", report.summary, report);
        return report;
      } catch(err){
        return { ok:false, score:1, funEstimate:1, style:"humanish-rules", issues:[String(err)], log:log, actions:actions, summary:"Bot crashed: "+err };
      }
    }
  };

  // Auto-run when ?bot=1
  if(/[?&]bot=1(?:&|$)/.test(location.search)){
    setTimeout(function(){
      var r = window.HASHPOOL.runBot({ maxMs: 6000, reset: true });
      var pre = document.createElement("pre");
      pre.id = "bot-report";
      pre.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;max-height:40vh;overflow:auto;z-index:99999;background:#0b0d10;color:#2fd98a;border:1px solid #242a32;border-radius:10px;padding:12px;font:12px/1.4 monospace;white-space:pre-wrap;";
      pre.textContent = JSON.stringify(r, null, 2);
      document.body.appendChild(pre);
    }, 600);
  }

  if(offlineEarnings > 0){
    document.getElementById("welcome-title").textContent = t("welcomeTitle");
    document.getElementById("welcome-body").textContent = t("welcomeBody");
    document.getElementById("welcome-amount").textContent = "+" + fmtSats(offlineEarnings) + " sats";
    document.getElementById("welcome-close").textContent = t("close");
    document.getElementById("welcome-modal").style.display = "flex";
  }

/* ui.js — Sprache (t), Bestätigung, Render der Oberfläche */
function t(key){ return I18N[state.lang][key]; }

  function showConfirm(message, onYes){
    var modal = document.getElementById("confirm-modal");
    document.getElementById("confirm-text").textContent = message;
    document.getElementById("confirm-cancel").textContent = t("cancel");
    document.getElementById("confirm-ok").textContent = t("confirmOk");
    modal.style.display = "flex";
    var okBtn = document.getElementById("confirm-ok");
    var cancelBtn = document.getElementById("confirm-cancel");
    function cleanup(){
      modal.style.display = "none";
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    }
    function onOk(){ cleanup(); onYes(); }
    function onCancel(){ cleanup(); }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  }

  var audioCtx = null;

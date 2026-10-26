/* شاشات الطفل (D / r3): يضبط حالة الرأس الموحّد وعناوين الشاشات وردّ لمس مرتدّ. لا يمسّ منطق التطبيق. */
(function(){
  "use strict";
  var de = document.documentElement;
  var TITLES = {
    "view-surahs":"حفظ القرآن","view-ayahs":"حفظ آيات","view-letters":"عالم الحروف","view-numbers":"عالم الأرقام",
    "view-adhkar":"الأذكار","view-ayq":"اسألني في الآيات","view-brain":"ألعاب الدماغ","view-prophets":"قصص الأنبياء",
    "view-quiz":"المسابقات","view-noor":"القاعدة النورانية","view-library":"مكتبتي","view-door":""
  };
  function buildTitles(){
    Object.keys(TITLES).forEach(function(id){
      var v = document.getElementById(id); if(!v) return;
      var head = v.querySelector(".browse-head"); if(!head || head.querySelector(".sc-title")) return;
      var t = document.createElement("div"); t.className = "sc-title"; t.textContent = TITLES[id]; t.setAttribute("role","heading"); t.setAttribute("aria-level","1");
      head.appendChild(t);
    });
    var dt = document.getElementById("doorTitle"), dv = document.querySelector("#view-door .sc-title");
    if(dt && dv){
      var sync = function(){ dv.textContent = dt.textContent; };
      sync(); try{ new MutationObserver(sync).observe(dt,{childList:true,characterData:true,subtree:true}); }catch(e){}
    }
  }
  function sync(){
    var a = document.querySelector(".view.active"), id = a ? a.id : "";
    var sub = id && id !== "view-home" && id !== "view-surah";
    de.classList.toggle("sc-sub", !!sub);
    de.setAttribute("data-sv", id);
  }
  function init(){
    de.classList.add("sc-on");
    buildTitles(); sync();
    var main = document.querySelector("main");
    if(main){ try{ new MutationObserver(sync).observe(main,{attributes:true,attributeFilter:["class"],subtree:true}); }catch(e){} }
    // :active على iOS
    document.addEventListener("touchstart", function(){}, {passive:true});
    // ارتداد مرن عند اللمس (سلس: خاصية scale المستقلة فلا تتعارض مع transform الأصلي)
    var SEL = ".lq-say,.pill-btn,.mini-btn,.start-btn,.seg-btn,.letter-tile,.adk-tile,.adk-opt,.choice-tile,.ps-card,.us-chip,.us-lan,.lt-h,.nm-chip,.surah-card,.back-btn,.gear-btn,.pin-key,.ayq-stage,.ayq-opt";
    document.addEventListener("pointerup", function(e){
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if(!el || el.disabled) return;
      el.classList.remove("sc-pop"); void el.offsetWidth; el.classList.add("sc-pop");
      setTimeout(function(){ el.classList.remove("sc-pop"); }, 460);
    }, true);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

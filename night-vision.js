/* GECE HATTI / HOME INTERACTION */
(function(){
 "use strict";
 var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 var progress=document.createElement("div");
 progress.className="night-progress";
 progress.innerHTML="<span></span>";
 document.body.appendChild(progress);
 var bar=progress.firstElementChild, ticking=false;
 function updateProgress(){
   var max=document.documentElement.scrollHeight-window.innerHeight;
   bar.style.transform="scaleX("+ (max>0?Math.min(1,window.scrollY/max):0) +")";
   topButton.classList.toggle("is-visible",window.scrollY>520);
   ticking=false;
 }
 window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(updateProgress)}},{passive:true});
 var topButton=document.createElement("button");
 topButton.type="button";topButton.className="night-top-button";topButton.setAttribute("aria-label","Sayfanın başına dön");topButton.textContent="↑";
 topButton.addEventListener("click",function(){window.scrollTo({top:0,behavior:reduce?"auto":"smooth"})});
 document.body.appendChild(topButton);
 var sections=["hava","topos","kuslar","atolye","ustalik-rotasi","laboratuvar","frekans","sinyal","arsiv","proje-tepsisi","hat"];
 sections.forEach(function(id){
   var section=document.getElementById(id);if(!section)return;
   var heading=section.querySelector("h2");
   if(!heading)return;
   var keep=new Set();
   var candidates=[
     section.querySelector(".cockpit-heading"),section.querySelector(".topos-frame"),
     section.querySelector(".archive-heading"),section.querySelector(".workbench-hero"),
     section.querySelector(".workbench-project-head"),section.querySelector(".catlab-heading"),
     section.querySelector(".project-tray-head")
   ].filter(Boolean);
   candidates.forEach(function(el){keep.add(el)});
   keep.add(heading);
   var headingParent=heading.parentElement;
   if(headingParent&&headingParent!==section&&headingParent.children.length<=3)keep.add(headingParent);
   var kicker=section.querySelector(":scope > .kicker");
   if(kicker)keep.add(kicker);
   var lede=section.querySelector(":scope > .lede");
   if(lede)keep.add(lede);
   var panel=document.createElement("div");panel.className="night-fold-panel";
   var nodes=Array.prototype.slice.call(section.childNodes);
   nodes.forEach(function(node){
     if(node.nodeType===1&&Array.from(keep).some(function(el){return el===node||el.contains(node)||node.contains(el)}))return;
     if(node.nodeType===3&&!node.textContent.trim())return;
     if(node.nodeType===1&&node.matches("script,style"))return;
     panel.appendChild(node);
   });
   if(!panel.childNodes.length)return;
   var button=document.createElement("button");
   button.type="button";button.className="night-fold-toggle";button.setAttribute("aria-expanded","true");
   var label=(heading.textContent||"Bölüm").replace(/\s+/g," ").trim();
   button.innerHTML='<span class="fold-mark" aria-hidden="true">⌄</span><span>İÇERİĞİ DARALT</span>';
   button.setAttribute("aria-label",label+" bölümünün içeriğini daralt");
   button.addEventListener("click",function(){
     var open=button.getAttribute("aria-expanded")==="true";
     button.setAttribute("aria-expanded",String(!open));
     panel.classList.toggle("is-folded",open);
     button.querySelector("span:last-child").textContent=open?"İÇERİĞİ AÇ":"İÇERİĞİ DARALT";
     button.setAttribute("aria-label",label+" bölümünün içeriğini "+(open?"aç":"daralt"));
   });
   section.appendChild(button);section.appendChild(panel);
 });
 updateProgress();
})();
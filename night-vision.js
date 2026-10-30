/* GECE HATTI / INTERACTION & ACCESSIBLE FOLDERS */
(function(){
 "use strict";
 var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 var progress=document.createElement("div");progress.className="night-progress";progress.innerHTML="<span></span>";document.body.appendChild(progress);
 var bar=progress.firstElementChild,topButton=document.createElement("button"),ticking=false;
 topButton.type="button";topButton.className="night-top-button";topButton.setAttribute("aria-label","Sayfanın başına dön");topButton.textContent="↑";
 topButton.addEventListener("click",function(){window.scrollTo({top:0,behavior:reduce?"auto":"smooth"})});document.body.appendChild(topButton);
 function update(){var max=document.documentElement.scrollHeight-window.innerHeight;bar.style.transform="scaleX("+(max>0?Math.min(1,window.scrollY/max):0)+")";topButton.classList.toggle("is-visible",window.scrollY>480);ticking=false}
 window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
 var plans=[["hava",".cockpit-frame-shell,.cockpit-footer-line"],["topos",".topos-visual"],["kuslar",".bird-home-layout"],["atolye",".workbench-grid"],["ustalik-rotasi",".grid.projects"],["laboratuvar",".catlab-layout"],["frekans","img.frame"],["sinyal","img.frame"],["arsiv",".archive-composition"],["proje-tepsisi",".project-tray-controls,.tray-status,.project-tray-grid"],["hat","ul"]];
 function fold(section,selector){
  if(!section)return;var chosen=Array.prototype.slice.call(section.querySelectorAll(selector));if(!chosen.length)return;
  if(section.id==="frekans"||section.id==="sinyal"){var first=chosen[0],p=first.parentElement,children=Array.prototype.slice.call(p.children),at=children.indexOf(first);chosen=children.slice(at).filter(function(el){return !el.matches("script,style,.night-fold-toggle,.night-fold-panel")})}
  var parent=chosen[0].parentElement;chosen=chosen.filter(function(el){return el.parentElement===parent});if(!chosen.length)return;
  var panel=document.createElement("div");panel.className="night-fold-panel";
  var button=document.createElement("button");button.type="button";button.className="night-fold-toggle";button.setAttribute("aria-expanded","true");
  var h=section.querySelector("h2,h3"),label=(h?h.textContent:section.id).replace(/\s+/g," ").trim();
  button.innerHTML='<span class="fold-mark" aria-hidden="true">⌄</span><span>İÇERİĞİ DARALT</span>';
  button.setAttribute("aria-label",label+" bölümünün içeriğini daralt");parent.insertBefore(button,chosen[0]);parent.insertBefore(panel,chosen[0]);chosen.forEach(function(el){panel.appendChild(el)});
  button.addEventListener("click",function(){var open=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!open));panel.classList.toggle("is-folded",open);panel.setAttribute("aria-hidden",String(open));panel.inert=open;button.querySelector("span:last-child").textContent=open?"İÇERİĞİ AÇ":"İÇERİĞİ DARALT";button.setAttribute("aria-label",label+" bölümünün içeriğini "+(open?"aç":"daralt"))});
 }
 plans.forEach(function(p){fold(document.getElementById(p[0]),p[1])});
 var links=Array.prototype.slice.call(document.querySelectorAll('.top nav a[href^="#"]')),targets=links.map(function(a){return document.querySelector(a.getAttribute("href"))}).filter(Boolean);
 if("IntersectionObserver" in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;links.forEach(function(a){a.removeAttribute("aria-current")});var active=links.find(function(a){return a.getAttribute("href")==="#"+entry.target.id});if(active)active.setAttribute("aria-current","location")})},{rootMargin:"-22% 0px -68% 0px"});targets.forEach(function(t){observer.observe(t)})}
 update();
})();
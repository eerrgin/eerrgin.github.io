/* GECE HATTI / route instrument + reading room */
(() => {
  "use strict";
  const stops = [
    ["top","00","Giriş"],["istasyon-notlari","01","Gece Hattı"],["hava","02","İstanbul"],
    ["topos","03","Gökyüzü"],["kuslar","04","Kuş Hattı"],["atolye","05","Atölye"],
    ["tigerk","06","Tigerk"],["laboratuvar","07","Laboratuvar"],["frekans","08","Frekans"],
    ["sinyal","09","Dış Sinyal"],["arsiv","10","Arşiv"],["proje-tepsisi","11","Açık Dosyalar"]
  ];
  const items = stops.map(([id,no,label]) => ({id,no,label,node:document.getElementById(id)})).filter(x => x.node);
  if (!items.length) return;
  const nav = document.createElement("nav");
  nav.className = "gh-route-instrument";
  nav.setAttribute("aria-label","Gece Hattı bölüm göstergesi");
  items.forEach(item => {
    const a = document.createElement("a");
    a.className = "gh-route-stop"; a.href = "#" + item.id; a.textContent = item.no;
    a.setAttribute("aria-label",item.label);
    const label = document.createElement("span"); label.className = "gh-route-label"; label.textContent = item.label;
    a.append(label); nav.append(a);
  });
  document.body.append(nav);
  const toggle = document.createElement("button");
  toggle.type = "button"; toggle.className = "gh-reading-toggle"; toggle.textContent = "¶";
  toggle.setAttribute("aria-label","Okuma odasını aç"); toggle.setAttribute("aria-pressed","false");
  toggle.title = "Okuma odası · G"; document.body.append(toggle);
  const caption = document.createElement("div"); caption.className = "gh-reading-caption";
  caption.textContent = "OKUMA ODASI / GECE HATTI"; document.body.append(caption);
  function setMode(on) {
    document.body.classList.toggle("gh-reading-mode",on);
    toggle.setAttribute("aria-pressed",String(on));
    toggle.setAttribute("aria-label",on ? "Okuma odasını kapat" : "Okuma odasını aç");
    toggle.title = on ? "Okuma odasını kapat · G / ESC" : "Okuma odası · G";
  }
  toggle.addEventListener("click",() => setMode(!document.body.classList.contains("gh-reading-mode")));
  document.addEventListener("keydown",event => {
    const target = event.target, typing = target && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
    if (typing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key.toLowerCase() === "g") setMode(!document.body.classList.contains("gh-reading-mode"));
    if (event.key === "Escape") setMode(false);
  });
  if ("IntersectionObserver" in window) {
    const links = Array.from(nav.querySelectorAll("a"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.removeAttribute("aria-current"));
      const active = links.find(link => link.getAttribute("href") === "#" + entry.target.id);
      if (active) active.setAttribute("aria-current","location");
    }),{rootMargin:"-28% 0px -62% 0px"});
    items.forEach(item => observer.observe(item.node));
  }
})();
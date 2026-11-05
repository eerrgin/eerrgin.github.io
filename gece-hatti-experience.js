/* GECE HATTI / route instrument + reading room + kanit kartlari */
(() => {
  "use strict";
  const proofs = [
    ["systems", "21 \u00b7 C / BELLEK", "Bellek Alan\u0131", "Yerel g\u00fcnl\u00fck turu i\u00e7in sabit arena. Hizalama, ta\u015fma reddi, \u00f6m\u00fcr ve otomatik test.", "https://github.com/eerrgin/ergin-bellek-alani", "C kayna\u011f\u0131 \u2197"],
    ["systems", "22 \u00b7 C++ / LINUX", "S\u00fcre\u00e7 Omurgas\u0131", "RSS, i\u015f par\u00e7ac\u0131\u011f\u0131 ve g\u00f6n\u00fcll\u00fc ile g\u00f6n\u00fcls\u00fcz ba\u011flam anahtar\u0131n\u0131 /proc \u00fczerinden okur.", "https://github.com/eerrgin/ergin-surec-omurgasi", "C++ kayna\u011f\u0131 \u2197"],
    ["secure", "23 \u00b7 ELF / SAVUNMA", "ELF Defteri", "Salt okunur ba\u015fl\u0131k okuyucusu. Y\u0131\u011f\u0131n NX bayra\u011f\u0131n\u0131 \u00f6l\u00e7er. \u0130stismar yok.", "https://github.com/eerrgin/ergin-elf-defteri", "\u00d6l\u00e7\u00fcm\u00fc a\u00e7 \u2197"]
  ];
  const grid = document.querySelector(".project-tray-grid");
  const archive = grid && grid.querySelector('[data-tray-category="archive"]');
  if (grid && archive && !grid.querySelector('[href="https://github.com/eerrgin/ergin-elf-defteri"]')) {
    proofs.forEach(([cat, no, title, copy, href, link]) => {
      const a = document.createElement("a");
      a.className = "tray-card";
      a.dataset.trayCategory = cat;
      a.href = href;
      a.innerHTML = '<span class="tray-no"></span><h3></h3><p></p><span class="tray-link"></span>';
      a.querySelector(".tray-no").textContent = no;
      a.querySelector("h3").textContent = title;
      a.querySelector("p").textContent = copy;
      a.querySelector(".tray-link").textContent = link;
      grid.insertBefore(a, archive);
    });
  }
  const cmds = document.querySelector(".cmd-links");
  if (cmds && !cmds.querySelector('[href="https://github.com/eerrgin/ergin-elf-defteri"]')) {
    [
      ["https://github.com/eerrgin/ergin-bellek-alani", "Bellek Alan\u0131 / C \u2197"],
      ["https://github.com/eerrgin/ergin-surec-omurgasi", "S\u00fcre\u00e7 Omurgas\u0131 / C++ \u2197"],
      ["https://github.com/eerrgin/ergin-elf-defteri", "ELF Defteri \u2197"]
    ].forEach(([href, label]) => {
      const a = document.createElement("a");
      a.className = "cmd-item";
      a.href = href;
      a.rel = "noopener";
      a.textContent = label;
      cmds.append(a);
    });
  }
  const trayHead = document.querySelector(".project-tray-head p:last-child");
  if (trayHead && trayHead.textContent.includes("Kategori se\u00e7erek")) {
    trayHead.textContent = "Deneyler ve ara\u00e7lar. Kategori se\u00e7; masa\u00fcst\u00fcnde alt\u0131, telefonda d\u00f6rt kart.";
  }
  const stops = [
    ["top","00","Giri\u015f"],["istasyon-notlari","01","Gece Hatt\u0131"],["hava","02","\u0130stanbul"],
    ["topos","03","G\u00f6ky\u00fcz\u00fc"],["kuslar","04","Ku\u015f Hatt\u0131"],["atolye","05","At\u00f6lye"],
    ["tigerk","06","Tigerk"],["laboratuvar","07","Laboratuvar"],["frekans","08","Frekans"],
    ["sinyal","09","D\u0131\u015f Sinyal"],["arsiv","10","Ar\u015fiv"],["proje-tepsisi","11","A\u00e7\u0131k Dosyalar"]
  ];
  const items = stops.map(([id,no,label]) => ({id,no,label,node:document.getElementById(id)})).filter(x => x.node);
  if (!items.length) return;
  const nav = document.createElement("nav");
  nav.className = "gh-route-instrument";
  nav.setAttribute("aria-label","Gece Hatt\u0131 b\u00f6l\u00fcm g\u00f6stergesi");
  items.forEach(item => {
    const a = document.createElement("a");
    a.className = "gh-route-stop"; a.href = "#" + item.id; a.textContent = item.no;
    a.setAttribute("aria-label",item.label);
    const label = document.createElement("span"); label.className = "gh-route-label"; label.textContent = item.label;
    a.append(label); nav.append(a);
  });
  document.body.append(nav);
  const toggle = document.createElement("button");
  toggle.type = "button"; toggle.className = "gh-reading-toggle"; toggle.textContent = "\u00b6";
  toggle.setAttribute("aria-label","Okuma odas\u0131n\u0131 a\u00e7"); toggle.setAttribute("aria-pressed","false");
  toggle.title = "Okuma odas\u0131 \u00b7 G"; document.body.append(toggle);
  const caption = document.createElement("div"); caption.className = "gh-reading-caption";
  caption.textContent = "OKUMA ODASI / GECE HATTI"; document.body.append(caption);
  function setMode(on) {
    document.body.classList.toggle("gh-reading-mode",on);
    toggle.setAttribute("aria-pressed",String(on));
    toggle.setAttribute("aria-label",on ? "Okuma odas\u0131n\u0131 kapat" : "Okuma odas\u0131n\u0131 a\u00e7");
    toggle.title = on ? "Okuma odas\u0131n\u0131 kapat \u00b7 G / ESC" : "Okuma odas\u0131 \u00b7 G";
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

/* Ergin Lab / açıklama katlama, medya erteleme ve küçük düzeltmeler */
(() => {
  "use strict";
  const cardZones = ".card,.project-card,.tray-card,.featured-project,.night-route-card,.station,.bird-preview-panel,.bird-table-panel,.topos-reading-guide article";
  const isLong = (node) => (node.textContent || "").replace(/\s+/g," ").trim().length >= 125;

  function unwrap(details) {
    const parent = details.parentNode;
    if (!parent) return;
    while (details.firstChild) parent.insertBefore(details.firstChild, details);
    details.remove();
  }

  function normalizeFolds() {
    document.querySelectorAll("details.archive-reading-fold,details.read-more").forEach((details) => {
      const paragraph = details.querySelector(":scope > p");
      if (!paragraph) return;
      if (paragraph.closest(cardZones) || !isLong(paragraph)) {
        unwrap(details);
        return;
      }
      const section = paragraph.closest("section,article") || document.querySelector("main");
      const heading = section && section.querySelector("h2,h3,h4");
      const title = heading ? heading.textContent.replace(/\s+/g," ").trim().slice(0,48) : "BÖLÜM AÇIKLAMASI";
      const summary = details.querySelector(":scope > summary");
      if (summary && details.classList.contains("archive-reading-fold")) {
        summary.textContent = title + " · DEVAMINI OKU";
        details.addEventListener("toggle", () => {
          summary.textContent = title + (details.open ? " · KAPAT" : " · DEVAMINI OKU");
        }, { once:false });
      }
    });

    document.querySelectorAll("main section,main article").forEach((root) => {
      root.querySelectorAll(":scope > p, :scope > div > p, .workbench-copy > p, .catlab-heading p").forEach((paragraph) => {
        if (!isLong(paragraph) || paragraph.closest("details,.card,form,nav,button,a")) return;
        if (paragraph.dataset.compactFolded === "true") return;
        const details = document.createElement("details");
        details.className = "archive-reading-fold";
        const summary = document.createElement("summary");
        const heading = root.querySelector("h2,h3,h4");
        summary.textContent = (heading ? heading.textContent.trim().slice(0,48) : "BÖLÜM") + " · DEVAMINI OKU";
        paragraph.parentNode.insertBefore(details, paragraph);
        details.append(summary, paragraph);
        paragraph.dataset.compactFolded = "true";
      });
    });
  }

  function deferNonCriticalImages() {
    document.querySelectorAll("main img:not([fetchpriority='high'])").forEach((img) => {
      if (!img.hasAttribute("loading")) img.loading = "lazy";
      if (!img.hasAttribute("decoding")) img.decoding = "async";
    });
  }

  function addAccessibleDisclosureHints() {
    document.querySelectorAll("#golgedeki-yolcu > details > summary").forEach((summary) => {
      summary.setAttribute("aria-label","Gölgedeki Yolcu hikâyesini aç veya kapat");
    });
  }

  function init() {
    normalizeFolds();
    deferNonCriticalImages();
    addAccessibleDisclosureHints();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
})();

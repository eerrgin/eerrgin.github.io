/* Ergin Lab / yardımcılar: lazy image ve hikâye disclosure erişilebilirliği */
(() => {
  "use strict";

  function deferNonCriticalImages() {
    document.querySelectorAll("main img:not([fetchpriority='high'])").forEach((img) => {
      if (!img.hasAttribute("loading")) img.loading = "lazy";
      if (!img.hasAttribute("decoding")) img.decoding = "async";
    });
  }

  function addAccessibleDisclosureHints() {
    document.querySelectorAll("#golgedeki-yolcu > details > summary").forEach((summary) => {
      summary.setAttribute("aria-label", "Gölgedeki Yolcu hikâyesini aç veya kapat");
    });
  }

  function init() {
    deferNonCriticalImages();
    addAccessibleDisclosureHints();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

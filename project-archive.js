/* All project names stay visible in the compact station directory. */
(() => {
  "use strict";
  function init() {
    const source = document.querySelector(".project-tray-grid");
    const target = document.getElementById("project-index-list");
    if (!source || !target) return;

    const links = [];
    const addLink = (title, href, category) => {
      if (!title || !href || links.some((item) => item.title === title)) return;
      const anchor = document.createElement("a");
      anchor.className = "project-index-link";
      anchor.href = href;
      anchor.dataset.category = category || "archive";
      anchor.textContent = title;
      anchor.setAttribute("aria-label", title + " projesini aç");
      links.push({ title, category: category || "archive", node: anchor });
    };

    source.querySelectorAll(".tray-card").forEach((card) => {
      const title = card.querySelector("h3")?.textContent.trim();
      const href = card.getAttribute("href");
      addLink(title, href, card.dataset.trayCategory);
    });
    document.querySelectorAll("[data-project-index]").forEach((item) => {
      addLink(item.textContent.trim(), item.getAttribute("href"), item.dataset.category || "archive");
    });

    const fragment = document.createDocumentFragment();
    links.forEach((item) => fragment.appendChild(item.node));
    target.replaceChildren(fragment);

    const count = document.getElementById("project-index-count");
    const filters = Array.from(document.querySelectorAll("[data-tray-filter]"));
    function sync() {
      const selected = document.querySelector("[data-tray-filter][aria-pressed='true']");
      const active = selected ? selected.dataset.trayFilter || "all" : "all";
      let visible = 0;
      links.forEach((item) => {
        const show = active === "all" || item.category === active;
        item.node.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = visible + " / " + links.length + " DOSYA";
    }
    filters.forEach((button) => button.addEventListener("click", sync));
    sync();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

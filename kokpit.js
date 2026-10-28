/* Ergin gece kokpiti: yerel radyo, klavye kısayolları ve hızlı yön bulma. */
(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const dialog = $("#cmd");
  const search = $("#cmd-filter");
  const empty = $("#cmd-empty");
  const volume = $("#radio-volume");
  const volumeValue = $("#radio-volume-value");
  const mixerState = $("#radio-mixer-state");
  const sleepSelect = $("#radio-sleep");
  const sleepStatus = $("#radio-sleep-status");
  const randomButton = $("#radio-random");
  const muteButton = $("#radio-mute");
  const cmdTimerButtons = $$("[data-cmd-action]");
  let sleepDeadline = 0;
  let sleepInterval = null;
  let fadeInterval = null;

  function gecev() {
    return window.Gece && typeof window.Gece === "object" ? window.Gece : null;
  }

  function isEditable(target) {
    return Boolean(target && (
      target.isContentEditable ||
      target.matches("input, textarea, select, button[aria-haspopup='listbox']")
    ));
  }

  function currentStation() {
    return $(".station.on") || $(".station");
  }

  function pickRandomStation() {
    const stations = $$(".station");
    if (!stations.length) return false;
    const current = currentStation();
    const options = stations.filter((item) => item !== current);
    const pool = options.length ? options : stations;
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (!next) return false;
    const api = gecev();
    if (api && typeof api.tune === "function") {
      api.tune(next.dataset.kind);
      syncMixer();
      return true;
    }
    next.click();
    return true;
  }

  function syncMixer() {
    const api = gecev();
    if (!api) return;
    const currentVolume = typeof api.radioVolume === "function" ? api.radioVolume() : 0.78;
    if (volume && document.activeElement !== volume) volume.value = String(Math.round(currentVolume * 100));
    if (volumeValue) volumeValue.value = Math.round(currentVolume * 100) + "%";
    if (muteButton) {
      const muted = typeof api.radioMuted === "function" && api.radioMuted();
      muteButton.textContent = muted ? "Sesi geri aç" : "Anında sustur";
      muteButton.setAttribute("aria-pressed", String(muted));
    }
    const station = currentStation();
    const running = typeof api.radioOn === "function" && api.radioOn();
    if (mixerState) {
      mixerState.textContent = running && station
        ? "YAYINDA / " + (station.dataset.freq || "") + " MHZ"
        : "HAZIR / 10 FREKANS";
    }
    if (randomButton) randomButton.setAttribute("aria-label", "Rastgele kanal seç. Mevcut kanal: " + (station?.dataset.name || "Gece Otobüsü"));
  }

  function clearSleepTimer() {
    if (sleepInterval !== null) window.clearInterval(sleepInterval);
    if (fadeInterval !== null) window.clearInterval(fadeInterval);
    sleepInterval = null;
    fadeInterval = null;
    sleepDeadline = 0;
  }

  function showSleepStatus(message) {
    if (sleepStatus) sleepStatus.textContent = message;
  }

  function setSleepTimer(minutes) {
    clearSleepTimer();
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) {
      showSleepStatus("Ses yalnızca bu tarayıcıda üretilir. Zamanlayıcı kapalı.");
      return;
    }
    sleepDeadline = Date.now() + value * 60 * 1000;
    showSleepStatus("Uyku sayacı kuruldu: " + value + " dakika. İstediğin zaman kapatabilirsin.");
    sleepInterval = window.setInterval(updateSleepTimer, 1000);
    updateSleepTimer();
  }

  function updateSleepTimer() {
    if (!sleepDeadline) return;
    const left = Math.max(0, sleepDeadline - Date.now());
    if (left <= 0) {
      clearSleepTimer();
      fadeOutRadio();
      return;
    }
    const seconds = Math.ceil(left / 1000);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    showSleepStatus("Uyku zamanlayıcısı · " + mm + ":" + ss + " kaldı");
  }

  function fadeOutRadio() {
    const api = gecev();
    if (!api || typeof api.setRadioVolume !== "function") {
      if (api && typeof api.halt === "function") api.halt();
      showSleepStatus("Zamanlayıcı tamamlandı. Yayın durduruldu.");
      if (sleepSelect) sleepSelect.value = "0";
      syncMixer();
      return;
    }
    const original = typeof api.radioVolume === "function" ? api.radioVolume() : 0.78;
    let step = 0;
    showSleepStatus("Gece yayını yumuşakça kapatılıyor…");
    fadeInterval = window.setInterval(() => {
      step += 1;
      api.setRadioVolume(original * Math.max(0, 1 - step / 12));
      if (step >= 12) {
        window.clearInterval(fadeInterval);
        fadeInterval = null;
        api.halt();
        api.setRadioVolume(original);
        if (sleepSelect) sleepSelect.value = "0";
        showSleepStatus("Uyku zamanı. Yayın kapandı; iyi geceler.");
        syncMixer();
      }
    }, 300);
  }

  function openCommandPalette() {
    if (!dialog) return;
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    if (search) {
      search.value = "";
      filterCommandItems("");
      window.requestAnimationFrame(() => search.focus());
    }
  }

  function closeCommandPalette() {
    if (dialog && dialog.open) dialog.close();
  }

  function filterCommandItems(raw) {
    const query = String(raw || "").trim().toLocaleLowerCase("tr-TR");
    let count = 0;
    $$(".cmd-item").forEach((item) => {
      const haystack = (item.textContent + " " + (item.dataset.cmdSearch || "")).toLocaleLowerCase("tr-TR");
      const show = !query || haystack.includes(query);
      item.hidden = !show;
      if (show) count += 1;
    });
    $$(".cmd-action").forEach((item) => {
      const haystack = (item.textContent + " " + (item.dataset.cmdSearch || "")).toLocaleLowerCase("tr-TR");
      const show = !query || haystack.includes(query);
      item.hidden = !show;
      if (show) count += 1;
    });
    if (empty) empty.hidden = count > 0;
  }

  function runCommand(action) {
    const api = gecev();
    const station = currentStation();
    if (action === "radio-toggle") {
      if (api && api.radioOn()) api.halt();
      else if (api && station) api.tune(station.dataset.kind);
    } else if (action === "radio-random") {
      pickRandomStation();
    } else if (action === "archive-next") {
      if (api && typeof api.nextNote === "function") api.nextNote();
      if (api && typeof api.go === "function") api.go("arsiv");
    } else if (action === "motion-toggle") {
      const control = $("#motion-toggle");
      if (control) control.click();
    }
    syncMixer();
    closeCommandPalette();
  }

  if (volume) {
    const api = gecev();
    if (api && typeof api.radioVolume === "function") volume.value = String(Math.round(api.radioVolume() * 100));
    if (volumeValue) volumeValue.value = volume.value + "%";
    volume.addEventListener("input", () => {
      const current = gecev();
      if (current && typeof current.setRadioVolume === "function") current.setRadioVolume(Number(volume.value) / 100);
      if (volumeValue) volumeValue.value = volume.value + "%";
      syncMixer();
    });
  }

  if (sleepSelect) sleepSelect.addEventListener("change", () => setSleepTimer(sleepSelect.value));

  if (muteButton) {
    muteButton.addEventListener("click", () => {
      const api = gecev();
      if (!api || typeof api.setRadioMuted !== "function") return;
      api.setRadioMuted(!api.radioMuted());
      syncMixer();
      if (api.radioMuted()) showSleepStatus("Ses susturuldu. Kanal ve zamanlayıcı korunuyor.");
      else if (sleepDeadline) updateSleepTimer();
      else showSleepStatus("Ses geri açıldı. Seçili kanal aynı yerde devam ediyor.");
    });
  }

  if (randomButton) randomButton.addEventListener("click", pickRandomStation);

  $("#cmd-close")?.addEventListener("click", closeCommandPalette);
  dialog?.addEventListener("close", () => {
    if (search) {
      search.value = "";
      filterCommandItems("");
    }
  });
  search?.addEventListener("input", (event) => filterCommandItems(event.currentTarget.value));

  cmdTimerButtons.forEach((button) => {
    button.addEventListener("click", () => runCommand(button.dataset.cmdAction));
  });

  $$(".nav-more-menu a").forEach((link) => link.addEventListener("click", () => {
    const details = link.closest("details");
    if (details) details.open = false;
  }));

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isEditable(event.target)) {
      event.preventDefault();
      openCommandPalette();
      return;
    }
    if (event.key === "Escape") {
      $$(".nav-more[open]").forEach((details) => { details.open = false; });
      return;
    }
    if (isEditable(event.target) || event.ctrlKey || event.metaKey || event.altKey || dialog?.open) return;
    if (event.key.toLowerCase() === "r") {
      const api = gecev();
      const station = currentStation();
      if (!api || !station) return;
      event.preventDefault();
      if (api.radioOn()) api.halt();
      else api.tune(station.dataset.kind);
      syncMixer();
    } else if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      pickRandomStation();
    }
  });

  // Station selection is already handled by the main radio engine; this keeps
  // the compact cockpit display in sync without creating another audio graph.
  $$(".station").forEach((button) => button.addEventListener("click", () => {
    window.setTimeout(syncMixer, 0);
  }));
  $("#play")?.addEventListener("click", () => window.setTimeout(syncMixer, 0));
  $("#stop-radio")?.addEventListener("click", () => window.setTimeout(syncMixer, 0));

  window.addEventListener("storage", syncMixer);
  syncMixer();
  window.setInterval(syncMixer, 1200);
})();

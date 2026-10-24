/* HAT — gece sevk terminali.
   Bash değil. İlk kelime komutsa doğrudan çalışır.
   Değilse Tigerk niyeti okur ve aynı yerel ağa sorar. */
(function () {
  const root = document.getElementById("sevk");
  const screen = document.getElementById("hat-screen");
  const form = document.getElementById("hat-form");
  const input = document.getElementById("hat-in");
  const status = document.getElementById("hat-status");
  if (!root || !screen || !form || !input || !window.Tigerk || !window.Gece) return;

  const COMMANDS = ["yardım", "help", "review", "debug", "api", "test", "mimari", "performans", "güvenlik", "deploy", "hava", "saat", "ay", "radyo", "kedi", "git", "iskelet", "tema", "titreşim", "tigerk", "eğit", "ağ", "not", "temiz", "clear", "kapat", "sıfır", "bant"];
  const PLACES = [
    ["kuslar", ["istanbul", "şehir", "sehir", "galata", "eminönü", "eminonu", "samatya", "ayasofya", "süleymaniye", "suleymaniye", "kuş hattı", "kus hatti"]],
    ["atolye", ["atolye", "atölye", "workbench", "proje", "veil", "masa"]],
    ["tigerk", ["tigerk", "ağ", "ag", "nöron", "noron"]],
    ["laboratuvar", ["laboratuvar", "kedi", "lab"]],
    ["frekans", ["frekans", "radyo", "fm", "greyfield"]],
    ["sinyal", ["sinyal", "dışarı", "disari"]],
    ["arsiv", ["arsiv", "arşiv", "not", "çekmece", "cekmec"]],
    ["hat", ["kırmızı", "kirmizi", "sınır", "sinir", "hat"]],
  ];
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("e.hat.hist") || "[]");
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }
  let cursor = history.length;
  let welcomed = false;
  let idleAt = Date.now();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fold(value) {
    return window.Tigerk.fold(value);
  }

  function paintStatus() {
    const weather = window.Gece.weather();
    const station = window.Gece.station();
    const air = window.Gece.radioOn() ? station?.freq || "yayın" : "sessiz";
    const sky = weather ? `${weather.temp}° ${weather.code}` : "hava ·";
    status.textContent = `${window.Gece.clock() || "--:--:--"} · ${sky} · ${air} · ${window.Gece.theme()} · titreşim ${window.Gece.tremor() ? "açık" : "kapalı"}`;
  }

  function line(text, kind) {
    const row = document.createElement("p");
    row.className = kind ? `hat-line ${kind}` : "hat-line";
    row.textContent = text;
    screen.append(row);
    while (screen.children.length > 80) screen.firstChild.remove();
    screen.scrollTop = screen.scrollHeight;
  }

  function remember(value) {
    if (!value) return;
    if (history[history.length - 1] !== value) history.push(value);
    if (history.length > 40) history.shift();
    cursor = history.length;
    try {
      localStorage.setItem("e.hat.hist", JSON.stringify(history));
    } catch {
      /* oturum belleği yeter */
    }
  }

  function bars(conf) {
    const n = Math.max(0, Math.min(8, Math.round(conf * 8)));
    return `${"|".repeat(n)}${".".repeat(8 - n)}`;
  }

  function helpText() {
    return [
      "HAT / LOCAL ENGINEERING CONSOLE · EL-2945",
      "Serbest istem: API sözleşmesi, code review, root-cause, test planı, performans, güvenlik veya mimari.",
      "İnceleme formatı: hedef + beklenen/gerçek davranış + ilgili trace/diff + kısıt.",
      "Çıktı: bulgu → etki → doğrulama → en küçük güvenli düzeltme.",
      "Örnek: API retry semantiğini idempotency, eşzamanlı tekrar ve 5xx davranışı açısından değerlendir.",
      "Yerel komutlar: hava · saat · ay · radyo [otobüs|vhs|neon|kes] · tema [gece|amber|kemik|sis]",
      "git <bölüm> · kedi · iskelet <metin> · tigerk <istem> · eğit · ağ · not · temiz · kapat",
      "Kısayol: backtick aç/kapa · ↑/↓ geçmiş · Tab komut tamamlama.",
    ].join("\n");
  }

  function weatherText() {
    const weather = window.Gece.weather();
    if (!weather) return "Open-Meteo henüz cevap vermedi. Yerel hat ayakta. Birazdan yeniden dener.";
    return `İstanbul ${weather.temp}° · ${weather.label} · hissedilen ${weather.feel}° · nem %${weather.hum} · rüzgâr ${weather.wind} km/sa · bugün ${weather.low}° / ${weather.high}°`;
  }

  function placeFrom(text) {
    const folded = fold(text);
    for (const [id, keys] of PLACES) {
      if (keys.some((key) => folded.includes(fold(key)))) return id;
    }
    return "";
  }

  function go(id) {
    const target = id === "kirmizi" ? "hat" : id;
    if (!window.Gece.go(target)) return `Bant yok: ${id}`;
    window.Gece.pulse("tick");
    return `bant ${target} · kaydırıldı`;
  }

  function radioFrom(text) {
    const folded = fold(text);
    if (/kes|kapat|sus|durdur|kapa/.test(folded)) {
      window.Gece.halt();
      return "yayın kesildi. hat sessiz.";
    }
    let kind = "bus";
    if (/vhs|87/.test(folded)) kind = "vhs";
    else if (/neon|91|pas/.test(folded)) kind = "neon";
    else if (/otob|88|bus|gece/.test(folded)) kind = "bus";
    else if (window.Gece.radioOn()) {
      window.Gece.halt();
      return "yayın kesildi.";
    }
    if (!window.Gece.tune(kind)) return "ses motoru bu tarayıcıda yok.";
    const station = window.Gece.station();
    return `${station.freq} ${station.name} yayında. osiloskop frekans bölümünde.`;
  }

  function themeFrom(text) {
    const folded = fold(text);
    const found = window.Gece.themes.find((name) => folded.includes(name));
    const next = window.Gece.setTheme(found || "");
    return `tema ${next}. kırmızı hat bu rengi titreşimle taşıyor.`;
  }

  function tremorFrom(text) {
    const folded = fold(text);
    const off = /kapa|kapat|sus|off|0/.test(folded);
    const on = /aç|ac|on|1/.test(folded);
    const next = window.Gece.setTremor(off && !on ? false : on ? true : !window.Gece.tremor());
    return next === "on"
      ? "titreşim açık. tema kenarı titrer. telefon destekliyorsa kısa bir vuruş gelir."
      : "titreşim kapalı. görüntü ve telefon susar.";
  }

  function noteText(advance) {
    const note = advance ? window.Gece.nextNote() : window.Gece.note();
    return `${note.title}\n${note.body}`;
  }

  function trainText(hard) {
    const before = window.Tigerk.state().loss;
    const state = hard ? window.Tigerk.reset() : window.Tigerk.trainEpochs(8, 0.4);
    window.Gece.pulse("tigerk");
    return hard
      ? `ağ sıfırlandı ve yeniden doğdu. kayıp ${state.loss.toFixed(3)} · tur ${state.epochs}`
      : `geri yayılım. kayıp ${before.toFixed(3)} → ${state.loss.toFixed(3)} · tur ${state.epochs}`;
  }

  function answerFor(intent, text, read) {
    if (intent === "yardim") return helpText();
    if (intent === "hava") return weatherText();
    if (intent === "saat") return `İstanbul ${window.Gece.clock()} · Europe/Istanbul`;
    if (intent === "ay") return `bu gece ${window.Gece.moon()}`;
    if (intent === "radyo") return radioFrom(text);
    if (intent === "kedi") {
      window.Gece.go("laboratuvar");
      return "Kedi laboratuvarı açıldı. Tüy, desen, gövde seç ya da fotoğraf bırak. Dosya cihazdan çıkmaz. Sonuç kaşe değil, yakınlık.";
    }
    if (intent === "git") return go(placeFrom(text) || "tigerk");
    if (intent === "iskelet") return `iskelet  ${read.bone}`;
    if (intent === "tema") return themeFrom(text);
    if (intent === "titresim") return tremorFrom(text);
    if (intent === "egit") return trainText(false);
    if (intent === "not") return noteText(true);
    if (intent === "sor") return window.Tigerk.speak ? window.Tigerk.speak(text, read) : (read.passage ? `${read.passage.title}\n${read.passage.body}` : "Bu hatta kayıt yok. Uydurmuyorum.");
    return helpText();
  }

  function publish(read, answer) {
    const out = document.getElementById("tigerk-out");
    const meta = document.getElementById("tigerk-meta");
    if (out) out.textContent = answer;
    if (meta && read) {
      const net = window.Tigerk.state();
      const topic = read.topic || (read.passage && read.passage.title) || "ENGINEERING TRIAGE";
      meta.textContent = topic + " · LOCAL ROUTER · SESSION " + net.epochs;
    }
    const canvas = document.getElementById("tigerk-net");
    if (canvas && read) window.Tigerk.draw(canvas, read);
  }

  function runFree(text) {
    const read = window.Tigerk.ask(text);
    const answer = answerFor(read.intent, text, read);
    const topic = read.topic || (read.passage && read.passage.title) || "ENGINEERING TRIAGE";
    line("ROUTE / " + topic + " · LOCAL SESSION", "dim");
    answer.split("\n").forEach((row, index) => line(row, index === 0 ? "" : "dim"));
    publish(read, answer);
    window.Gece.pulse("tigerk");
  }

  function soft(value) {
    return fold(value)
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");
  }

  function exec(raw) {
    const text = String(raw || "").trim();
    if (!text) return;
    idleAt = Date.now();
    line(`▸ ${text}`, "ask");
    remember(text);
    const token = soft(text).split(" ")[0];
    const rest = text.includes(" ") ? text.slice(text.indexOf(" ") + 1).trim() : "";

    if (token === "yardim" || token === "help") {
      helpText().split("\n").forEach((row) => line(row, "dim"));
      return;
    }
    if (token === "hava") {
      const answer = weatherText();
      line(answer);
      publish(window.Tigerk.ask(text), answer);
      return;
    }
    if (token === "saat") {
      line(`İstanbul ${window.Gece.clock()} · Europe/Istanbul`);
      return;
    }
    if (token === "ay") {
      line(`bu gece ${window.Gece.moon()}`);
      return;
    }
    if (token === "radyo") {
      line(radioFrom(rest || text));
      return;
    }
    if (token === "kedi") {
      line(answerFor("kedi", text, window.Tigerk.ask(text)));
      return;
    }
    if (token === "git") {
      line(go(placeFrom(rest || text) || "istanbul"));
      return;
    }
    if (token === "iskelet") {
      const read = window.Tigerk.ask(rest || text);
      const bone = window.Tigerk.skeleton(rest || text);
      const answer = rest ? `iskelet  ${bone.text}` : `iskelet  ${read.bone}`;
      line(answer);
      publish({ ...read, bone: bone.text, intent: "iskelet" }, answer);
      return;
    }
    if (token === "tema") {
      line(themeFrom(rest || text));
      return;
    }
    if (token === "titresim" || token === "titre") {
      line(tremorFrom(rest || text));
      return;
    }
    if (token === "tigerk") {
      runFree(rest || text);
      return;
    }
    if (token === "egit") {
      const answer = trainText(false);
      line(answer);
      publish(window.Tigerk.ask("ağı eğit"), answer);
      return;
    }
    if (token === "ag") {
      const state = window.Tigerk.state();
      const answer = `Tigerk ${state.input} giriş · ${state.hidden} gizli · ${state.outputs} niyet · sigmoid · MSE · kayıp ${state.loss.toFixed(3)} · tur ${state.epochs}`;
      line(answer);
      publish(window.Tigerk.ask("tigerk nedir"), answer);
      return;
    }
    if (token === "not") {
      line(noteText(true).replace("\n", " — "));
      return;
    }
    if (token === "temiz" || token === "clear") {
      screen.replaceChildren();
      line("ekran silindi. ağ duruyor.", "dim");
      return;
    }
    if (token === "kapat") {
      closeHat();
      return;
    }
    if (token === "sifir") {
      line(trainText(true));
      return;
    }
    if (token === "bant") {
      PLACES.forEach(([id]) => line(id, "dim"));
      return;
    }
    runFree(text);
  }

  function openHat() {
    root.hidden = false;
    root.classList.add("open");
    document.body.classList.add("hat-open");
    paintStatus();

    if (!welcomed) {
      welcomed = true;
      line("HAT / EL-2945 · LOCAL ENGINEERING CONSOLE", "ghost");
      line("Tigerk reasoning layer hazır. İsteği bağlamıyla gönder.", "ask");
      line("Örnek: API retry semantiği · race condition · kod incelemesi · test stratejisi", "dim");
      line("Çıktı: bulgu → etki → doğrulama → düzeltme.", "dim");
    }
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.setTimeout(() => input.focus(), 30);
    }
  }

  function closeHat() {
    root.classList.remove("open");
    root.hidden = true;
    document.body.classList.remove("hat-open");
  }

  document.getElementById("open-hat")?.addEventListener("click", openHat);
  document.getElementById("open-tigerk-hat")?.addEventListener("click", openHat);
  document.getElementById("hat-fab")?.addEventListener("click", openHat);

  document.querySelectorAll('a[href="#tigerk"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const commandDialog = document.getElementById("cmd");
      if (commandDialog?.open) commandDialog.close();
      window.Gece.go("tigerk");
      openHat();
    });
  });
  document.getElementById("hat-close")?.addEventListener("click", closeHat);
  document.querySelectorAll('a[href="#sevk"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const dialog = document.getElementById("cmd");
      if (dialog && dialog.open) dialog.close();
      openHat();
    });
  });
  root.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      exec(`git ${button.dataset.go}`);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    exec(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor] || "";
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      const needle = soft(input.value);
      const hit = needle ? COMMANDS.find((command) => soft(command).startsWith(needle)) : null;
      if (hit) input.value = hit;
    } else if (event.key === "Escape") {
      closeHat();
    }
  });

  document.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (event.key === "`" && tag !== "INPUT" && tag !== "TEXTAREA") {
      event.preventDefault();
      if (root.classList.contains("open")) closeHat();
      else openHat();
    }
  });

  if (location.hash === "#sevk") openHat();

  document.getElementById("tigerk-run")?.addEventListener("click", () => {
    const value = document.getElementById("tigerk-in")?.value.trim();
    if (!value) {
      publish(window.Tigerk.ask(""), "Boş cümle. İskelet de boş.");
      return;
    }
    const read = window.Tigerk.ask(value);
    const answer = answerFor(read.intent, value, read);
    publish(read, answer);
    if (root.classList.contains("open")) {
      line(`▸ ${value}`, "ask");
      line(answer.split("\n")[0]);
    }
    window.Gece.pulse("tigerk");
  });
  document.getElementById("tigerk-bone")?.addEventListener("click", () => {
    const value = document.getElementById("tigerk-in")?.value.trim() || "";
    const bone = window.Tigerk.skeleton(value);
    const read = window.Tigerk.ask(value || "iskelet");
    const answer = value ? `iskelet  ${bone.text}` : "Boş cümle. İskelet de boş.";
    publish({ ...read, bone: bone.text, intent: "iskelet", dropped: bone.dropped }, answer);
  });
  document.getElementById("tigerk-train")?.addEventListener("click", () => {
    const answer = trainText(false);
    publish(window.Tigerk.ask("ağı eğit"), answer);
  });
  document.getElementById("tigerk-clear")?.addEventListener("click", () => {
    const field = document.getElementById("tigerk-in");
    if (field) field.value = "";
    const out = document.getElementById("tigerk-out");
    if (out) out.textContent = "—";
    const meta = document.getElementById("tigerk-meta");
    if (meta) meta.textContent = "silindi";
    window.Tigerk.draw(document.getElementById("tigerk-net"), null);
  });
  document.getElementById("tigerk-in")?.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      document.getElementById("tigerk-run")?.click();
    }
  });

  window.Hat = { exec, open: openHat, close: closeHat };
  paintStatus();
  setInterval(paintStatus, 1000);
  window.Tigerk.draw(document.getElementById("tigerk-net"), null);

  window.setInterval(() => {
    if (!root.classList.contains("open") || reduced || !window.Gece.tremor()) return;
    if (Date.now() - idleAt < 28000) return;
    idleAt = Date.now();
    const weather = window.Gece.weather();
    const scrap = weather ? `${weather.temp}° ${weather.code}` : "hava yok";
    line(`cızırtı · ${window.Gece.moon()} · ${scrap} · ${document.getElementById("hud-depth")?.textContent || "derinlik"}`, "ghost");
  }, 32000);
})();

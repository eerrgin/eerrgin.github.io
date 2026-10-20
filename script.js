const breeds = [
  ["Ankara kedisi", "Uzun tüy, çoğu zaman beyaz. İnce kemik.", { fur: ["long", "medium"], pattern: ["solid"], build: ["slender", "medium"], ears: ["straight", "tuft"] }],
  ["Van kedisi", "Gövde beyaz, renk başta ve kuyrukta.", { fur: ["long", "medium"], pattern: ["bicolor", "solid"], build: ["medium", "large"], ears: ["straight"] }],
  ["Maine Coon", "İri gövde, kulak püskülü, uzun tüy.", { fur: ["long", "medium"], pattern: ["tabby", "bicolor"], build: ["large"], ears: ["tuft"] }],
  ["British Shorthair", "Kısa sık tüy, yuvarlak yüz.", { fur: ["short"], pattern: ["solid"], build: ["compact"], ears: ["straight"] }],
  ["İran kedisi", "Uzun tüy, basık yüz.", { fur: ["long"], pattern: ["solid", "bicolor"], build: ["compact"], ears: ["straight"] }],
  ["Siyam kedisi", "Açık gövde, koyu uçlar.", { fur: ["short"], pattern: ["point"], build: ["slender"], ears: ["straight"] }],
  ["Bengal", "Keskin çizgi, sıcak zemin, kısa tüy.", { fur: ["short"], pattern: ["tabby"], build: ["slender", "medium"], ears: ["straight"] }],
  ["Sfenks", "Tüy yok denecek kadar az.", { fur: ["hairless"], pattern: ["solid", "bicolor"], build: ["slender"], ears: ["straight"] }],
  ["Scottish Fold", "Kulak öne katlanır.", { fur: ["short", "medium"], pattern: ["solid", "tabby", "bicolor"], build: ["compact"], ears: ["fold"] }],
  ["Russian Blue", "Düz gri, çizgisiz, kısa tüy.", { fur: ["short"], pattern: ["solid"], build: ["slender"], ears: ["straight"] }],
  ["Kısa tüylü ev kedisi", "Soy kütüğü şart değil. En dürüst ihtimal çoğu zaman bu.", { fur: ["short", "medium"], pattern: ["solid", "tabby", "bicolor", "point"], build: ["medium", "compact", "slender"], ears: ["straight"] }],
];

const choice = { fur: "any", pattern: "any", build: "any", ears: "any" };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const THEMES = ["gece", "amber", "kemik", "sis"];
let lastWeather = null;

function pulse(kind) {
  const tremorOn = document.documentElement.dataset.tremor !== "off";
  if (!reduceMotion && tremorOn) {
    document.body.classList.remove("tremor");
    void document.body.offsetWidth;
    document.body.classList.add("tremor");
    window.setTimeout(() => document.body.classList.remove("tremor"), 480);
  }
  if (!reduceMotion && tremorOn && typeof navigator.vibrate === "function") {
    const patterns = {
      tick: [14],
      radio: [18, 46, 18, 46, 28],
      theme: [12, 36, 22, 36, 12],
      kavra: [10, 28, 10],
    };
    try {
      navigator.vibrate(patterns[kind] || patterns.tick);
    } catch {
      /* bazı tarayıcılar titreşimi reddeder */
    }
  }
}

function currentTheme() {
  return document.documentElement.dataset.theme || "gece";
}

function setTheme(name) {
  const wanted = String(name || "").toLocaleLowerCase("tr");
  const next = THEMES.includes(wanted)
    ? wanted
    : THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("e.theme", next);
  } catch {
    /* depolama kapalıysa tema yine bu oturumda kalır */
  }
  pulse("theme");
  return next;
}

function setTremor(on) {
  const next = on ? "on" : "off";
  document.documentElement.dataset.tremor = next;
  try {
    localStorage.setItem("e.tremor", next);
  } catch {
    /* yok say */
  }
  if (on) pulse("tick");
  return next;
}

function rankTraits() {
  const keys = Object.keys(choice).filter((key) => choice[key] !== "any");
  if (!keys.length) return [];
  return breeds
    .map(([name, note, profile]) => {
      let hit = 0;
      keys.forEach((key) => {
        if (profile[key].includes(choice[key])) hit += 1;
      });
      const narrow = keys.reduce((sum, key) => sum + (profile[key].includes(choice[key]) ? 1 / profile[key].length : 0), 0);
      let score = (hit / keys.length) * (0.7 + 0.3 * (hit ? narrow / hit : 0));
      if (name.startsWith("Kısa")) score *= 0.72;
      return { name, note, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function renderGuesses(items, line) {
  const root = document.querySelector("#guesses");
  const note = document.querySelector("#lab-note");
  if (!root || !note) return;
  note.textContent = line;
  root.innerHTML = items
    .map(
      (item, index) => `<li><strong>0${index + 1} ${item.name}</strong> <span>${Math.round(item.score * 100)}</span>
      <div class="score"><span style="width:${Math.round(item.score * 100)}%"></span></div>
      <p>${item.note}</p></li>`,
    )
    .join("");
}

document.querySelectorAll("[data-trait]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.trait;
    choice[key] = button.dataset.value;
    document.querySelectorAll(`[data-trait="${key}"]`).forEach((node) => node.setAttribute("aria-checked", "false"));
    button.setAttribute("aria-checked", "true");
  });
});

document.querySelector("#compare-traits")?.addEventListener("click", () => {
  const items = rankTraits();
  if (!items.length) {
    renderGuesses([], "Bir özellik seç. Hepsi boşsa herkes aynı görünür.");
    return;
  }
  renderGuesses(items, "Yakınlık, kimlik değildir. Bu bir veteriner kaşesi değil.");
});

const preview = document.querySelector("#preview");
const fileInput = document.querySelector("#photo");
let image = null;
fileInput?.addEventListener("change", () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  image = new Image();
  image.onload = () => {
    preview.src = url;
    preview.hidden = false;
  };
  image.onerror = () => {
    image = null;
    preview.hidden = true;
    renderGuesses([], "Bu dosya okunamadı. Başka bir fotoğraf dene.");
  };
  image.src = url;
});

function readPhoto(img) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let white = 0;
  let orange = 0;
  let dark = 0;
  let changes = 0;
  let count = 0;
  let prev = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    count += 1;
    if (L > 185) white += 1;
    if (r > g + 18 && r > b + 25) orange += 1;
    if (L < 50) dark += 1;
    if (count > 1 && Math.abs(L - prev) > 18) changes += 1;
    prev = L;
  }
  return { white: white / count, orange: orange / count, dark: dark / count, stripe: changes / count };
}

document.querySelector("#compare-photo")?.addEventListener("click", () => {
  if (!image) {
    renderGuesses([], "Önce bir fotoğraf bırak. Dosya bu tarayıcıdan çıkmaz.");
    return;
  }
  const seen = readPhoto(image);
  const items = [
    ["Ankara kedisi", seen.white],
    ["Van kedisi", seen.white * 0.7 + (1 - seen.white) * 0.25],
    ["Bengal", seen.stripe * 1.4 + seen.orange],
    ["Siyam kedisi", seen.dark * 0.5 + (1 - seen.white) * 0.15],
    ["Russian Blue", (1 - seen.orange) * (1 - seen.stripe)],
    ["Kısa tüylü ev kedisi", 0.46],
  ]
    .map(([name, score]) => ({ name, note: "Fotoğraf okuması kaba: renk ve çizgi. Yüz iddiası yok.", score: Math.max(0, Math.min(1, score)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  renderGuesses(items, `Beyaz %${Math.round(seen.white * 100)} · sıcak %${Math.round(seen.orange * 100)} · çizgi ${seen.stripe > 0.22 ? "var" : "silik"}. Yakınlık, kimlik değildir.`);
});

let audio = null;
let analyser = null;
let wave = null;
function stopRadio() {
  if (audio) audio.close();
  audio = null;
  analyser = null;
  wave = null;
  document.body.classList.remove("live");
  const air = document.querySelector("#air");
  if (air) air.textContent = "BEKLEMEDE";
}
function noise(ctx) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}
function startRadio(kind) {
  stopRadio();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const air = document.querySelector("#air");
  if (!AudioCtx) {
    if (air) air.textContent = "SES DESTEKLENMİYOR";
    return false;
  }
  const ctx = new AudioCtx();
  audio = ctx;
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
  const tap = ctx.createAnalyser();
  tap.fftSize = 1024;
  tap.smoothingTimeConstant = 0.72;
  master.connect(tap);
  analyser = tap;
  wave = new Uint8Array(tap.fftSize);
  const bed = ctx.createBufferSource();
  bed.buffer = noise(ctx);
  bed.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = kind === "vhs" ? "highpass" : kind === "neon" ? "bandpass" : "lowpass";
  filter.frequency.value = kind === "vhs" ? 1600 : kind === "neon" ? 780 : 220;
  const gain = ctx.createGain();
  gain.gain.value = kind === "vhs" ? 0.08 : 0.4;
  bed.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  bed.start();
  if (kind !== "vhs") {
    const osc = ctx.createOscillator();
    osc.frequency.value = kind === "neon" ? 73 : 48;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    osc.connect(g);
    g.connect(master);
    osc.start();
  }
  document.body.classList.add("live");
  if (air) air.textContent = "YAYINDA";
  pulse("radio");
  return true;
}
document.querySelectorAll(".station").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".station").forEach((node) => node.classList.remove("on"));
    button.classList.add("on");
    document.querySelector("#freq").textContent = button.dataset.freq;
    document.querySelector("#sname").textContent = button.dataset.name;
    if (audio) startRadio(button.dataset.kind);
  });
});
document.querySelector("#play")?.addEventListener("click", () => {
  const play = document.querySelector("#play");
  if (audio) {
    stopRadio();
    play.textContent = "Yayını başlat";
    return;
  }
  const current = document.querySelector(".station.on");
  if (startRadio(current.dataset.kind) === false) return;
  play.textContent = "Yayını kes";
});

const tape = new Audio();
document.querySelector("#tape")?.addEventListener("change", () => {
  const file = document.querySelector("#tape").files[0];
  if (!file) return;
  stopRadio();
  document.querySelector("#play").textContent = "Yayını başlat";
  tape.src = URL.createObjectURL(file);
  tape.play().catch(() => {
    document.querySelector("#tape-name").textContent = `${file.name} (tarayıcı oynatmayı engelledi, tekrar dene)`;
  });
  document.querySelector("#tape-name").textContent = file.name;
});

const lines = [
  ["Bağlantısı kırık bir hafıza", "Bazen sayfa durur; onu anlamlı kılan bağlantılar ortadan kalkmıştır."],
  ["404", "Bulunamaması, orada hiçbir şey olmadığı anlamına gelmez. Bazen yalnızca adres değişmiştir."],
  ["Sekmeler", "Açık kalan sekmeler, bitmemiş düşüncelerin küçük ve parlak mezarlığıdır."],
  ["Sessiz hata", "Ekranda görünmeyen hata bitmiş değildir. Doğru soru henüz sorulmamış olabilir."],
  ["KAVRA", "Henüz bir vitrin değil. İskelet masada. Model başka odada, kapısı kapalı."],
  ["Statik", "Gürültü de bir sinyaldir. Sadece henüz kime ait olduğu belli değildir."],
];
let fragment = 0;
function nextNote() {
  fragment = (fragment + 1) % lines.length;
  const title = document.querySelector("#note-title");
  const body = document.querySelector("#note-body");
  if (title) title.textContent = lines[fragment][0];
  if (body) body.textContent = lines[fragment][1];
  return { title: lines[fragment][0], body: lines[fragment][1] };
}
document.querySelector("#next-note")?.addEventListener("click", () => {
  nextNote();
  pulse("tick");
});

function tick() {
  const clock = document.querySelector("#clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
tick();
setInterval(tick, 1000);

const dialog = document.querySelector("#cmd");
const openCmd = () => {
  if (dialog && typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
};
document.querySelector("#open-cmd")?.addEventListener("click", openCmd);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCmd();
  }
});
dialog?.addEventListener("click", (event) => {
  if (event.target.closest("a")) dialog.close();
});

let staticArmed = false;
document.querySelector("#cmd-filter")?.addEventListener("input", (event) => {
  const needle = event.target.value.toLocaleLowerCase("tr");
  dialog.querySelectorAll("a").forEach((link) => {
    link.hidden = needle && !link.textContent.toLocaleLowerCase("tr").includes(needle);
  });
  if (needle.trim() === "statik" && !staticArmed) {
    staticArmed = true;
    burst();
    const title = document.querySelector("#note-title");
    const body = document.querySelector("#note-body");
    if (title && body) {
      title.textContent = "Statik";
      body.textContent = "Komut kutusu bir frekans açtı. Sayfa bir an dağıldı, sonra yerine döndü.";
    }
  }
  if (needle.trim() !== "statik") staticArmed = false;
});

const WMO = {
  0: ["AÇIK", "Açık"], 1: ["AÇIK", "Çoğunlukla açık"], 2: ["PARÇA", "Parçalı bulutlu"], 3: ["KAPALI", "Kapalı"],
  45: ["SİS", "Sisli"], 48: ["SİS", "Kırağılı sis"],
  51: ["ÇİSE", "Hafif çiseleme"], 53: ["ÇİSE", "Çiseleme"], 55: ["ÇİSE", "Yoğun çiseleme"],
  56: ["ÇİSE", "Dondurucu çiseleme"], 57: ["ÇİSE", "Dondurucu çiseleme"],
  61: ["YAĞMUR", "Hafif yağmur"], 63: ["YAĞMUR", "Yağmur"], 65: ["YAĞMUR", "Şiddetli yağmur"],
  66: ["YAĞMUR", "Dondurucu yağmur"], 67: ["YAĞMUR", "Dondurucu yağmur"],
  71: ["KAR", "Hafif kar"], 73: ["KAR", "Kar"], 75: ["KAR", "Yoğun kar"], 77: ["KAR", "Kar taneleri"],
  80: ["SAĞNAK", "Hafif sağanak"], 81: ["SAĞNAK", "Sağanak"], 82: ["SAĞNAK", "Şiddetli sağanak"],
  85: ["KAR", "Kar sağanağı"], 86: ["KAR", "Yoğun kar sağanağı"],
  95: ["FIRTINA", "Gök gürültülü fırtına"], 96: ["FIRTINA", "Dolulu fırtına"], 99: ["FIRTINA", "Şiddetli dolulu fırtına"],
};
const wmo = (code) => WMO[code] || ["····", "Bilinmiyor"];
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784" +
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
  "&timezone=Europe%2FIstanbul&forecast_days=4&wind_speed_unit=kmh";

function setText(id, text) {
  const node = document.getElementById(id);
  if (node) node.textContent = text;
}

function showWeatherError() {
  setText("w-icon", "YOK");
  setText("w-temp", "--");
  setText("w-desc", "Hava alınamadı");
  setText("w-feel", "Yerel bölümler ayakta. Sayfayı yenilemek yeter.");
}

async function loadWeather() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(WEATHER_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const cur = data.current;
    const day = data.daily;
    if (!cur || !day) throw new Error("beklenmeyen yanıt");
    const [icon, label] = wmo(cur.weather_code);
    setText("w-icon", icon);
    setText("w-temp", Math.round(cur.temperature_2m));
    setText("w-desc", label);
    setText("w-feel", `Hissedilen ${Math.round(cur.apparent_temperature)}°C`);
    setText("w-hum", `%${Math.round(cur.relative_humidity_2m)}`);
    setText("w-wind", `${Math.round(cur.wind_speed_10m)} km/sa`);
    setText("w-range", `${Math.round(day.temperature_2m_min[0])}° / ${Math.round(day.temperature_2m_max[0])}°`);
    const list = document.getElementById("w-days");
    if (list) {
      list.replaceChildren();
      for (let i = 1; i < day.time.length; i += 1) {
        const li = document.createElement("li");
        const name = document.createElement("strong");
        name.textContent = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "Europe/Istanbul" }).format(
          new Date(`${day.time[i]}T12:00:00+03:00`),
        );
        const ico = document.createElement("span");
        ico.textContent = wmo(day.weather_code[i])[0];
        li.append(name, ico, document.createTextNode(`${Math.round(day.temperature_2m_min[i])}° / ${Math.round(day.temperature_2m_max[i])}°`));
        li.title = wmo(day.weather_code[i])[1];
        list.append(li);
      }
    }
    setText("w-time", `· ${new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`);
    lastWeather = {
      temp: Math.round(cur.temperature_2m),
      feel: Math.round(cur.apparent_temperature),
      label,
      code: icon,
      hum: Math.round(cur.relative_humidity_2m),
      wind: Math.round(cur.wind_speed_10m),
      low: Math.round(day.temperature_2m_min[0]),
      high: Math.round(day.temperature_2m_max[0]),
    };
  } catch {
    showWeatherError();
  } finally {
    clearTimeout(timer);
  }
}
loadWeather();
setInterval(loadWeather, 15 * 60 * 1000);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

const frame = document.getElementById("portrait");
const ghost = document.getElementById("ghost");
const mast = document.getElementById("mast");
let clearFx = 0;
let clearName = 0;

function glitchOnce() {
  if (!frame || !ghost || reduceMotion) return;
  const roll = Math.random();
  const kind = roll < 0.28 ? "jitter" : roll < 0.5 ? "shear" : roll < 0.74 ? "slice" : roll < 0.88 ? "scan" : "rgb";
  frame.dataset.fx = kind === "slice" ? "rgb" : kind;
  if (kind === "slice" || kind === "rgb") {
    const y = 8 + Math.random() * 70;
    const h = 8 + Math.random() * 16;
    const dir = Math.random() > 0.5 ? 1 : -1;
    if (kind === "slice") {
      ghost.style.clipPath = `inset(${y}% 0 ${Math.max(0, 100 - y - h)}% 0)`;
      ghost.style.transform = `translateX(${dir * (8 + Math.random() * 10)}px)`;
    } else {
      ghost.style.clipPath = "inset(0)";
      ghost.style.transform = `translate(${dir * 6}px, 0)`;
    }
    ghost.style.opacity = "0.9";
  } else {
    ghost.style.opacity = "0";
    ghost.style.transform = "none";
    ghost.style.clipPath = "none";
  }
  window.clearTimeout(clearFx);
  clearFx = window.setTimeout(() => {
    frame.dataset.fx = "";
    ghost.style.opacity = "0";
  }, kind === "scan" ? 480 : 180);
}

function burst() {
  if (reduceMotion) return;
  glitchOnce();
  window.setTimeout(glitchOnce, 140);
  window.setTimeout(glitchOnce, 280);
  if (mast) {
    mast.dataset.fx = "shift";
    window.clearTimeout(clearName);
    clearName = window.setTimeout(() => {
      mast.dataset.fx = "";
    }, 180);
  }
}

if (!reduceMotion && frame) {
  const loop = () => {
    if (Math.random() > 0.55 && mast) {
      mast.dataset.fx = Math.random() > 0.5 ? "jitter" : "shift";
      window.clearTimeout(clearName);
      clearName = window.setTimeout(() => {
        mast.dataset.fx = "";
      }, 160);
    }
    glitchOnce();
    window.setTimeout(loop, 2200 + Math.random() * 2600);
  };
  window.setTimeout(loop, 1400);
}

function paintScope(now) {
  const canvas = document.getElementById("scope");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 72;
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(226, 58, 47, 0.22)";
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  ctx.strokeStyle = "#e23a2f";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  if (analyser && wave) {
    analyser.getByteTimeDomainData(wave);
    for (let i = 0; i < wave.length; i += 2) {
      const x = (i / (wave.length - 1)) * w;
      const y = (wave[i] / 255) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else {
    const t = now / 1000;
    for (let x = 0; x <= w; x += 3) {
      const y = h / 2 + Math.sin(x * 0.035 + t * 1.3) * 3.2 + Math.sin(x * 0.011 - t * 0.55) * 1.6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  if (!reduceMotion) requestAnimationFrame(paintScope);
}
requestAnimationFrame(paintScope);

function moonName(date) {
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - known) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  if (age < 1.5 || age > 28.3) return "yeni ay";
  if (age < 6.4) return "hilal";
  if (age < 9.0) return "ilk dördün";
  if (age < 13.8) return "şişkin ay";
  if (age < 16.6) return "dolunay";
  if (age < 21.0) return "şişkin ay";
  if (age < 23.6) return "son dördün";
  return "ince ay";
}

function paintHud() {
  const depth = document.getElementById("hud-depth");
  const moon = document.getElementById("hud-moon");
  const coord = document.getElementById("hud-coord");
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.round((window.scrollY / max) * 100);
  if (depth) depth.textContent = `derinlik ${pct}`;
  if (moon) moon.textContent = `ay · ${moonName(new Date())}`;
  if (coord && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const x = window.__nx ?? 0.5;
    const y = window.__ny ?? 0.42;
    const lat = 41.0082 + (0.5 - y) * 0.08;
    const lon = 28.9784 + (x - 0.5) * 0.12;
    coord.textContent = `${lat.toFixed(3)}°N ${lon.toFixed(3)}°E`;
  }
}
window.addEventListener("scroll", paintHud, { passive: true });
window.addEventListener("pointermove", (event) => {
  window.__nx = event.clientX / Math.max(1, window.innerWidth);
  window.__ny = event.clientY / Math.max(1, window.innerHeight);
  paintHud();
}, { passive: true });
paintHud();

if (!reduceMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("section.reveal").forEach((section) => io.observe(section));
} else {
  document.querySelectorAll("section.reveal").forEach((section) => section.classList.add("in"));
}

function tune(kind) {
  const button = document.querySelector(`.station[data-kind="${kind}"]`);
  if (!button) return false;
  document.querySelectorAll(".station").forEach((node) => node.classList.remove("on"));
  button.classList.add("on");
  const freq = document.querySelector("#freq");
  const name = document.querySelector("#sname");
  if (freq) freq.textContent = button.dataset.freq;
  if (name) name.textContent = button.dataset.name;
  if (startRadio(kind) === false) return false;
  const play = document.querySelector("#play");
  if (play) play.textContent = "Yayını kes";
  return true;
}

window.Gece = {
  pulse,
  themes: THEMES,
  theme: currentTheme,
  setTheme,
  tremor() {
    return document.documentElement.dataset.tremor !== "off";
  },
  setTremor,
  weather() {
    return lastWeather;
  },
  moon() {
    return moonName(new Date());
  },
  clock() {
    return document.querySelector("#clock")?.textContent || "";
  },
  radioOn() {
    return Boolean(audio);
  },
  station() {
    const button = document.querySelector(".station.on");
    return button
      ? { kind: button.dataset.kind, freq: button.dataset.freq, name: button.dataset.name }
      : null;
  },
  tune,
  halt() {
    stopRadio();
    const play = document.querySelector("#play");
    if (play) play.textContent = "Yayını başlat";
  },
  nextNote,
  note() {
    return {
      title: document.querySelector("#note-title")?.textContent || "",
      body: document.querySelector("#note-body")?.textContent || "",
    };
  },
  go(id) {
    const node = document.getElementById(id);
    if (!node) return false;
    node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    return true;
  },
};


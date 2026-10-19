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

document.querySelector("#compare-traits").addEventListener("click", () => {
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
fileInput.addEventListener("change", () => {
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
  const ctx = canvas.getContext("2d");
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

document.querySelector("#compare-photo").addEventListener("click", () => {
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
let timers = [];
function stopRadio() {
  timers.forEach(clearInterval);
  timers = [];
  if (audio) audio.close();
  audio = null;
  document.querySelector("#air").textContent = "BEKLEMEDE";
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
  if (!AudioCtx) {
    document.querySelector("#air").textContent = "SES DESTEKLENMİYOR";
    return false;
  }
  const ctx = new AudioCtx();
  audio = ctx;
  const master = ctx.createGain();
  master.gain.value = 0.35;
  master.connect(ctx.destination);
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
  document.querySelector("#air").textContent = "YAYINDA";
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
document.querySelector("#play").addEventListener("click", () => {
  if (audio) {
    stopRadio();
    document.querySelector("#play").textContent = "Yayını başlat";
    return;
  }
  const current = document.querySelector(".station.on");
  if (startRadio(current.dataset.kind) === false) return;
  document.querySelector("#play").textContent = "Yayını kes";
});

const tape = new Audio();
document.querySelector("#tape").addEventListener("change", () => {
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
];
let fragment = 0;
document.querySelector("#next-note").addEventListener("click", () => {
  fragment = (fragment + 1) % lines.length;
  document.querySelector("#note-title").textContent = lines[fragment][0];
  document.querySelector("#note-body").textContent = lines[fragment][1];
});

function tick() {
  document.querySelector("#clock").textContent = new Intl.DateTimeFormat("tr-TR", {
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
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
};
document.querySelector("#open-cmd").addEventListener("click", openCmd);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCmd();
  }
});
dialog.addEventListener("click", (event) => {
  if (event.target.closest("a")) dialog.close();
});
document.querySelector("#cmd-filter").addEventListener("input", (event) => {
  const needle = event.target.value.toLocaleLowerCase("tr");
  dialog.querySelectorAll("a").forEach((link) => {
    link.hidden = needle && !link.textContent.toLocaleLowerCase("tr").includes(needle);
  });
});


/* ---- İstanbul hava durumu (Open-Meteo, anahtar gerekmez) ---- */
const WMO = {
  0: ["☀️", "Açık"], 1: ["🌤️", "Çoğunlukla açık"], 2: ["⛅", "Parçalı bulutlu"], 3: ["☁️", "Kapalı"],
  45: ["🌫️", "Sisli"], 48: ["🌫️", "Kırağılı sis"],
  51: ["🌦️", "Hafif çiseleme"], 53: ["🌦️", "Çiseleme"], 55: ["🌧️", "Yoğun çiseleme"],
  56: ["🌧️", "Dondurucu çiseleme"], 57: ["🌧️", "Dondurucu çiseleme"],
  61: ["🌧️", "Hafif yağmur"], 63: ["🌧️", "Yağmur"], 65: ["🌧️", "Şiddetli yağmur"],
  66: ["🌧️", "Dondurucu yağmur"], 67: ["🌧️", "Dondurucu yağmur"],
  71: ["🌨️", "Hafif kar"], 73: ["🌨️", "Kar"], 75: ["❄️", "Yoğun kar"], 77: ["🌨️", "Kar taneleri"],
  80: ["🌦️", "Hafif sağanak"], 81: ["🌧️", "Sağanak"], 82: ["⛈️", "Şiddetli sağanak"],
  85: ["🌨️", "Kar sağanağı"], 86: ["❄️", "Yoğun kar sağanağı"],
  95: ["⛈️", "Gök gürültülü fırtına"], 96: ["⛈️", "Dolulu fırtına"], 99: ["⛈️", "Şiddetli dolulu fırtına"],
};
const wmo = (code) => WMO[code] || ["🌡️", "Bilinmiyor"];
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
  setText("w-icon", "·");
  setText("w-temp", "--");
  setText("w-desc", "Hava durumu şu an alınamadı");
  setText("w-feel", "Bağlantını kontrol edip sayfayı yenile.");
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
        ico.setAttribute("aria-hidden", "true");
        li.append(name, ico, `${Math.round(day.temperature_2m_min[i])}° / ${Math.round(day.temperature_2m_max[i])}°`);
        li.title = wmo(day.weather_code[i])[1];
        list.append(li);
      }
    }
    setText("w-time", `· Güncelleme ${new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`);
  } catch (error) {
    showWeatherError();
  } finally {
    clearTimeout(timer);
  }
}
loadWeather();
setInterval(loadWeather, 15 * 60 * 1000);

/* SW cleanup */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
  if (window.caches) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

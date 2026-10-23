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
const tape = new Audio();
let tapeUrl = null;
let radioTimers = [];
let autoStartTimer = null;
let selectedRadio = "bus";

const RADIO_SCENES = {
  bus: {
    volume: 0.24,
    layers: [
      { color: "brown", filter: "lowpass", freq: 220, gain: 0.20, q: 0.6, pulseHz: 0.08, depth: 0.035 },
      { color: "brown", filter: "bandpass", freq: 540, gain: 0.022, q: 0.5 }
    ],
    tones: [
      { freq: 46, type: "sine", gain: 0.055, vibrato: 1.4 },
      { freq: 92, type: "sine", gain: 0.012, vibrato: 1.8 },
      { freq: 138, type: "triangle", gain: 0.004, vibrato: 1.1 }
    ]
  },
  vhs: {
    volume: 0.22,
    layers: [
      { color: "white", filter: "highpass", freq: 1500, gain: 0.027, q: 0.5 },
      { color: "brown", filter: "lowpass", freq: 420, gain: 0.055, q: 0.6, pulseHz: 0.13, depth: 0.012 }
    ],
    tones: [
      { freq: 110, type: "sine", gain: 0.018, vibrato: 8 },
      { freq: 110.7, type: "sine", gain: 0.016, vibrato: 10 },
      { freq: 220, type: "sine", gain: 0.005, vibrato: 5 }
    ]
  },
  neon: {
    volume: 0.21,
    layers: [
      { color: "brown", filter: "bandpass", freq: 680, gain: 0.055, q: 1.0, pulseHz: 0.17, depth: 0.018 },
      { color: "white", filter: "highpass", freq: 2200, gain: 0.005, q: 0.7 }
    ],
    tones: [
      { freq: 73, type: "sawtooth", gain: 0.014, vibrato: 3.5 },
      { freq: 146.8, type: "sine", gain: 0.010, vibrato: 5 },
      { freq: 220, type: "sine", gain: 0.004, vibrato: 4 }
    ]
  },
  forest: {
    volume: 0.20,
    layers: [
      { color: "brown", filter: "lowpass", freq: 480, gain: 0.085, q: 0.7, pulseHz: 0.06, depth: 0.02 },
      { color: "white", filter: "highpass", freq: 3400, gain: 0.006, q: 0.5 }
    ],
    tones: [
      { freq: 55, type: "sine", gain: 0.018, vibrato: 2.4 },
      { freq: 110, type: "sine", gain: 0.007, vibrato: 3.5 }
    ]
  },
  purr: {
    volume: 0.22,
    layers: [
      { color: "brown", filter: "lowpass", freq: 190, gain: 0.105, q: 0.7, pulseHz: 24, depth: 0.026 },
      { color: "white", filter: "lowpass", freq: 680, gain: 0.009, q: 0.8, pulseHz: 24, depth: 0.002 }
    ],
    tones: [
      { freq: 27, type: "triangle", gain: 0.014, vibrato: 1.2 },
      { freq: 54, type: "sine", gain: 0.006, vibrato: 1.5 }
    ]
  },
  rain: {
    volume: 0.20,
    layers: [
      { color: "white", filter: "lowpass", freq: 1300, gain: 0.026, q: 0.6 },
      { color: "brown", filter: "lowpass", freq: 270, gain: 0.052, q: 0.7 },
      { color: "white", filter: "bandpass", freq: 2400, gain: 0.011, q: 0.5 }
    ],
    tones: [
      { freq: 164.8, type: "sine", gain: 0.005, vibrato: 1.8 }
    ]
  },
  lighthouse: {
    volume: 0.22,
    layers: [
      { color: "brown", filter: "lowpass", freq: 360, gain: 0.10, q: 0.7, pulseHz: 0.075, depth: 0.04 },
      { color: "white", filter: "lowpass", freq: 720, gain: 0.007, q: 0.6 }
    ],
    tones: [
      { freq: 65.4, type: "sine", gain: 0.022, vibrato: 1.6 },
      { freq: 130.8, type: "sine", gain: 0.007, vibrato: 2.4 }
    ],
    echo: true
  },
  cosmos: {
    volume: 0.18,
    layers: [
      { color: "white", filter: "highpass", freq: 2800, gain: 0.008, q: 0.5 },
      { color: "brown", filter: "bandpass", freq: 1250, gain: 0.025, q: 0.7, pulseHz: 0.045, depth: 0.01 }
    ],
    tones: [
      { freq: 174.61, type: "sine", gain: 0.016, vibrato: 3 },
      { freq: 261.63, type: "sine", gain: 0.012, vibrato: 4 },
      { freq: 392, type: "sine", gain: 0.005, vibrato: 3.5 },
      { freq: 432, type: "sine", gain: 0.004, vibrato: 2 }
    ],
    echo: true
  },
  platform: {
    volume: 0.22,
    layers: [
      { color: "brown", filter: "lowpass", freq: 185, gain: 0.09, q: 0.7, pulseHz: 1.25, depth: 0.018 },
      { color: "white", filter: "bandpass", freq: 650, gain: 0.012, q: 0.8 }
    ],
    tones: [
      { freq: 41, type: "sine", gain: 0.030, vibrato: 1.0 },
      { freq: 82, type: "triangle", gain: 0.008, vibrato: 1.4 }
    ]
  },
  longing: {
    volume: 0.18,
    layers: [
      { color: "brown", filter: "lowpass", freq: 520, gain: 0.030, q: 0.7, pulseHz: 0.055, depth: 0.008 },
      { color: "white", filter: "lowpass", freq: 1700, gain: 0.003, q: 0.6 }
    ],
    tones: [
      { freq: 174.61, type: "sine", gain: 0.020, vibrato: 1.3 },
      { freq: 220, type: "sine", gain: 0.016, vibrato: 1.6 },
      { freq: 261.63, type: "sine", gain: 0.013, vibrato: 1.2 },
      { freq: 329.63, type: "sine", gain: 0.008, vibrato: 1.8 },
      { freq: 440, type: "sine", gain: 0.003, vibrato: 2 }
    ],
    echo: true
  }
};

function syncRadioUI() {
  const active = audio;
  const air = document.querySelector("#air");
  const play = document.querySelector("#play");
  const help = document.querySelector("#radio-help");
  const selected = document.querySelector(".station.on");
  const frequency = selected ? selected.dataset.freq : "88.8";
  const name = selected ? selected.dataset.name : "Gece Otobüsü";
  const running = Boolean(active && active.state === "running");
  const suspended = Boolean(active && active.state === "suspended");
  if (air) air.textContent = running ? "YAYINDA · " + frequency : suspended ? "İLK DOKUNUŞTA SES" : "SESSİZ";
  if (play) {
    play.textContent = running ? "Yayını durdur" : suspended ? "Sesi etkinleştir" : "Yayını başlat";
    play.setAttribute("aria-pressed", String(running));
  }
  if (help) {
    help.textContent = running
      ? name + " çalıyor. İstediğin kanalı değiştir veya “Sesi kapat” düğmesine bas."
      : suspended
        ? "Tarayıcı otomatik sesi bekletiyor olabilir. Sayfaya bir kez dokununca seçili kanal kendiliğinden uyanır."
        : "Dinleme kapalı. Bir kanala dokunarak hemen başlatabilir ya da “Yayını başlat” düğmesini kullanabilirsin.";
  }
  if (running) document.body.classList.add("live");
  else document.body.classList.remove("live");
}

function stopRadio() {
  if (autoStartTimer !== null) {
    window.clearTimeout(autoStartTimer);
    autoStartTimer = null;
  }
  radioTimers.forEach((timer) => window.clearInterval(timer));
  radioTimers = [];
  const old = audio;
  audio = null;
  analyser = null;
  wave = null;
  if (old) {
    old.onstatechange = null;
    if (old.state !== "closed") old.close().catch(() => {});
  }
  if (tape && !tape.paused) tape.pause();
  document.body.classList.remove("live");
  syncRadioUI();
}

function noise(ctx, color) {
  const length = ctx.sampleRate * 8;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (color === "white") {
      data[i] = white * 0.34;
    } else {
      last = (last + 0.025 * white) / 1.025;
      data[i] = last * 3.3;
    }
  }
  return buffer;
}

function addNoiseLayer(ctx, destination, settings) {
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx, settings.color || "brown");
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = settings.filter || "lowpass";
  filter.frequency.value = Math.min(settings.freq || 500, ctx.sampleRate * 0.42);
  filter.Q.value = settings.q || 0.7;
  const amp = ctx.createGain();
  amp.gain.value = settings.gain || 0.01;
  source.connect(filter);
  filter.connect(amp);
  amp.connect(destination);
  source.start();
  if (settings.pulseHz && settings.depth) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = settings.pulseHz;
    depth.gain.value = settings.depth;
    lfo.connect(depth);
    depth.connect(amp.gain);
    lfo.start();
  }
}

function addDrone(ctx, destination, tone) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = tone.type || "sine";
  osc.frequency.value = tone.freq;
  osc.detune.value = tone.detune || 0;
  amp.gain.value = tone.gain || 0.01;
  osc.connect(amp);
  amp.connect(destination);
  osc.start();
  if (tone.vibrato) {
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 0.035 + Math.random() * 0.08;
    depth.gain.value = tone.vibrato;
    lfo.connect(depth);
    depth.connect(osc.detune);
    lfo.start();
  }
}

function createEcho(ctx, destination) {
  const delay = ctx.createDelay(2.5);
  delay.delayTime.value = 0.68;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.22;
  const wet = ctx.createGain();
  wet.gain.value = 0.16;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(destination);
  return delay;
}

function playPing(ctx, destination, echo, frequency, volume, duration, type, slideTo) {
  if (audio !== ctx || ctx.state === "closed") return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo && slideTo > 0) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration * 0.62);
  }
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(envelope);
  envelope.connect(destination);
  if (echo) {
    const send = ctx.createGain();
    send.gain.value = 0.12;
    envelope.connect(send);
    send.connect(echo);
  }
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

function playMeow(ctx, destination) {
  if (audio !== ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(360 + Math.random() * 70, now);
  osc.frequency.exponentialRampToValueAtTime(560 + Math.random() * 70, now + 0.16);
  osc.frequency.exponentialRampToValueAtTime(320 + Math.random() * 60, now + 0.72);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.012, now + 0.045);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.76);
  osc.connect(envelope);
  envelope.connect(destination);
  osc.start(now);
  osc.stop(now + 0.8);
}

function loopRadio(ctx, callback, interval) {
  const timer = window.setInterval(() => {
    if (audio === ctx && ctx.state === "running") callback();
  }, interval);
  radioTimers.push(timer);
}

function buildScene(ctx, master, kind, echo) {
  const scene = RADIO_SCENES[kind] || RADIO_SCENES.bus;
  scene.layers.forEach((layer) => addNoiseLayer(ctx, master, layer));
  scene.tones.forEach((tone) => addDrone(ctx, master, tone));

  if (kind === "forest") {
    loopRadio(ctx, () => {
      if (Math.random() < 0.84) {
        const start = 1450 + Math.random() * 1500;
        playPing(ctx, master, echo, start, 0.006 + Math.random() * 0.003, 0.32 + Math.random() * 0.42, "sine", start * (1.12 + Math.random() * 0.45));
      }
    }, 2100);
    loopRadio(ctx, () => {
      if (Math.random() < 0.45) playPing(ctx, master, echo, 260 + Math.random() * 180, 0.0035, 0.65, "sine", 190 + Math.random() * 100);
    }, 5100);
  } else if (kind === "purr") {
    loopRadio(ctx, () => {
      if (Math.random() < 0.72) playMeow(ctx, master);
    }, 6900);
  } else if (kind === "rain") {
    loopRadio(ctx, () => {
      if (Math.random() < 0.68) {
        const drop = 1000 + Math.random() * 1800;
        playPing(ctx, master, null, drop, 0.004 + Math.random() * 0.004, 0.10 + Math.random() * 0.09, "sine", 450 + Math.random() * 500);
      }
    }, 410);
  } else if (kind === "lighthouse") {
    const bells = [392, 523.25, 587.33, 659.25];
    let note = 0;
    loopRadio(ctx, () => {
      playPing(ctx, master, echo, bells[note % bells.length], 0.018, 1.9, "sine");
      note += 1;
    }, 4700);
  } else if (kind === "cosmos") {
    const bells = [523.25, 659.25, 783.99, 587.33, 880];
    let note = 0;
    loopRadio(ctx, () => {
      if (Math.random() < 0.8) playPing(ctx, master, echo, bells[note % bells.length], 0.010, 2.2, "sine");
      note += 1;
    }, 3900);
  } else if (kind === "platform") {
    loopRadio(ctx, () => {
      playPing(ctx, master, null, 72 + Math.random() * 48, 0.010, 0.075, "triangle", 48 + Math.random() * 30);
      if (Math.random() < 0.38) {
        window.setTimeout(() => {
          if (audio === ctx && ctx.state === "running") playPing(ctx, master, null, 90 + Math.random() * 40, 0.007, 0.07, "triangle", 55);
        }, 115);
      }
    }, 720);
  } else if (kind === "longing") {
    const notes = [392, 329.63, 293.66, 261.63, 220, 293.66, 329.63, 261.63];
    let note = 0;
    loopRadio(ctx, () => {
      playPing(ctx, master, echo, notes[note % notes.length], 0.010 + Math.random() * 0.004, 2.5, "sine");
      note += 1;
    }, 3300);
  }
}

function selectRadio(kind, persist) {
  selectedRadio = RADIO_SCENES[kind] ? kind : "bus";
  document.querySelectorAll(".station").forEach((button) => {
    const active = button.dataset.kind === selectedRadio;
    button.classList.toggle("on", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const selected = document.querySelector(".station.on");
  if (selected) {
    const frequency = document.querySelector("#freq");
    const name = document.querySelector("#sname");
    if (frequency) frequency.textContent = selected.dataset.freq;
    if (name) name.textContent = selected.dataset.name;
  }
  if (persist) {
    try { localStorage.setItem("e.radio.station", selectedRadio); } catch {}
  }
}

function startRadio(kind, options) {
  const autoStart = Boolean(options && options.autoStart);
  stopRadio();
  tape.pause();
  selectRadio(kind, true);
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const air = document.querySelector("#air");
  if (!AudioCtx) {
    if (air) air.textContent = "SES DESTEKLENMİYOR";
    const help = document.querySelector("#radio-help");
    if (help) help.textContent = "Bu tarayıcı Web Audio desteği sunmuyor. Başka bir güncel tarayıcıda tekrar dene.";
    return false;
  }
  const ctx = new AudioCtx();
  audio = ctx;
  const master = ctx.createGain();
  master.gain.value = RADIO_SCENES[selectedRadio].volume;
  const tap = ctx.createAnalyser();
  tap.fftSize = 1024;
  tap.smoothingTimeConstant = 0.78;
  master.connect(tap);
  analyser = tap;
  wave = new Uint8Array(tap.fftSize);
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.008;
  compressor.release.value = 0.22;
  tap.connect(compressor);
  compressor.connect(ctx.destination);
  const echo = RADIO_SCENES[selectedRadio].echo ? createEcho(ctx, master) : null;
  buildScene(ctx, master, selectedRadio, echo);
  ctx.onstatechange = () => { if (audio === ctx) syncRadioUI(); };
  try {
    const resumed = ctx.resume();
    if (resumed && typeof resumed.catch === "function") resumed.catch(() => syncRadioUI());
  } catch {}
  syncRadioUI();
  if (!autoStart) pulse("radio");
  return true;
}

document.querySelectorAll(".station").forEach((button) => {
  button.addEventListener("click", () => {
    selectRadio(button.dataset.kind, true);
    startRadio(button.dataset.kind);
  });
});

document.querySelector("#play")?.addEventListener("click", () => {
  if (audio && audio.state === "running") {
    stopRadio();
    return;
  }
  if (audio && audio.state === "suspended") {
    const ctx = audio;
    ctx.resume().then(() => { if (audio === ctx) syncRadioUI(); }).catch(() => syncRadioUI());
    return;
  }
  startRadio(selectedRadio);
});

document.querySelector("#stop-radio")?.addEventListener("click", () => {
  stopRadio();
  tape.pause();
  try { tape.currentTime = 0; } catch {}
  const air = document.querySelector("#air");
  if (air) air.textContent = "SESSİZ";
});

function unlockRadio() {
  if (!audio || audio.state !== "suspended") return;
  const ctx = audio;
  ctx.resume().then(() => { if (audio === ctx) syncRadioUI(); }).catch(() => syncRadioUI());
}
document.addEventListener("pointerdown", unlockRadio, { passive: true });
document.addEventListener("keydown", unlockRadio);

try {
  const saved = localStorage.getItem("e.radio.station");
  if (saved && RADIO_SCENES[saved]) selectedRadio = saved;
} catch {}
selectRadio(selectedRadio, false);
autoStartTimer = window.setTimeout(() => {
  autoStartTimer = null;
  if (!audio) startRadio(selectedRadio, { autoStart: true });
}, 350);

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


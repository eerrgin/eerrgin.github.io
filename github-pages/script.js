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
const reduceMotion = document.documentElement.dataset.motion !== "on";
const THEMES = ["gece", "amber", "kemik", "sis"];
let lastWeather = null;

// İstanbul arşivi: erişilebilir, klavyeyle de kullanılabilen büyük görsel görünümü.
(() => {
  const dialog = document.getElementById("place-lightbox");
  const lightboxImage = document.getElementById("place-lightbox-image");
  const title = document.getElementById("place-lightbox-title");
  const kicker = document.getElementById("place-lightbox-kicker");
  const description = document.getElementById("place-lightbox-description");
  const closeButton = document.getElementById("place-lightbox-close");
  if (!dialog || !lightboxImage || !title || !kicker || !description || !closeButton) return;

  let activeTrigger = null;

  function closeLightbox() {
    if (dialog.open) dialog.close();
    if (activeTrigger && activeTrigger.isConnected) activeTrigger.focus({ preventScroll: true });
    activeTrigger = null;
  }

  document.querySelectorAll("[data-lightbox-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const card = trigger.closest(".place");
      const image = trigger.querySelector("img");
      const heading = card?.querySelector(".place-body h3");
      const label = card?.querySelector(".place-body > .kicker");
      const story = card?.querySelector(".place-story-copy > p:not(.meta)");
      if (!image || !heading) return;

      activeTrigger = trigger;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || heading.textContent.trim();
      title.textContent = heading.textContent.trim();
      kicker.textContent = label?.textContent.trim() || "İSTANBUL ARŞİVİ";
      description.textContent = story?.textContent.trim() || "Şehrin taş hafızasından bir kayıt.";
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      closeButton.focus({ preventScroll: true });
      pulse("tick");
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeLightbox();
  });
  dialog.addEventListener("close", () => {
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    }
    if (activeTrigger && activeTrigger.isConnected) activeTrigger.focus({ preventScroll: true });
    activeTrigger = null;
  });
})();

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
      tigerk: [10, 28, 10],
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
  document.documentElement.dataset.motion = next;
  document.documentElement.dataset.tremor = next;
  try {
    localStorage.setItem("e.motion", next);
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
      const matched = keys.filter((key) => Array.isArray(profile[key]) && profile[key].includes(choice[key]));
      const score = Math.round((matched.length / keys.length) * 100);
      const matchedLabels = matched.map((key) => ({ fur: "tüy", pattern: "desen", build: "gövde", ears: "kulak" })[key]);
      return {
        name,
        note,
        score,
        evidence: matchedLabels.length
          ? `${matchedLabels.join(" · ")}: ${matchedLabels.length}/${keys.length} seçili özellik`
          : `Seçili ${keys.length} özellikten örtüşen yok`,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"))
    .slice(0, 5);
}

function renderGuesses(items, line) {
  const root = document.querySelector("#guesses");
  const note = document.querySelector("#lab-note");
  if (!root || !note) return;
  note.textContent = line;
  root.replaceChildren();
  items.forEach((item, index) => {
    const li = document.createElement("li");
    const heading = document.createElement("div");
    heading.className = "catlab-match-line";
    const name = document.createElement("strong");
    name.textContent = `${String(index + 1).padStart(2, "0")} / ${item.name}`;
    const score = document.createElement("span");
    score.textContent = `${item.score}%`;
    score.setAttribute("aria-label", `Seçili görünür özelliklerin yüzde ${item.score} kadarı örtüşüyor`);
    heading.append(name, score);
    const bar = document.createElement("div");
    bar.className = "score";
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", `Özellik örtüşmesi yüzde ${item.score}`);
    const fill = document.createElement("span");
    fill.style.width = `${item.score}%`;
    bar.append(fill);
    const copy = document.createElement("p");
    copy.textContent = item.note;
    const evidence = document.createElement("small");
    evidence.className = "catlab-match-evidence";
    evidence.textContent = item.evidence;
    li.append(heading, bar, copy, evidence);
    root.append(li);
  });
}

const CAT_LABELS = {
  fur: { short: "Kısa tüy", long: "Uzun tüy", hairless: "Tüysüz" },
  pattern: { solid: "Tek renk", tabby: "Tekir", point: "Uçları koyu", bicolor: "İki renk" },
  build: { slender: "İnce gövde", large: "İri gövde", compact: "Kompakt gövde" },
  ears: { fold: "Katlı kulak", tuft: "Kulak püskülü" },
};
const CAT_EYES = { amber: "Kehribar göz", green: "Yeşil göz", blue: "Mavi göz", odd: "İki farklı göz", unknown: "Göz rengi bilinmiyor" };
const CAT_VIBES = {
  curious: "Meraklı", playful: "Oyuncu", gentle: "Yumuşak huylu", shy: "Çekingen",
  chatty: "Sohbetçi", independent: "Bağımsız", chaotic: "Gece vardiyası",
};
const CAT_STAGES = { kitten: "Yavru", young: "Genç", adult: "Yetişkin", senior: "Kıdemli kedi", unknown: "Yaşam evresi bilinmiyor" };
const CAT_NAMES = ["Mırmır", "Zeytin", "Gece", "Tarçın", "Bulut", "Piksel", "Kömür", "Misket", "Lokum", "Fındık", "Luna", "Miso", "Çorap", "Duman"];
let catEye = "amber";
let catVibe = "curious";
let image = null;
let imageUrl = null;

const catNameInput = document.querySelector("#cat-name");
const catStageInput = document.querySelector("#cat-stage");
const catPhotoInput = document.querySelector("#photo");
const catPhoto = document.querySelector("#cat-card-photo");
const catPalette = document.querySelector("#cat-palette");
const catPaletteNote = document.querySelector("#cat-palette-note");
const catLayout = document.querySelector(".catlab-layout");

function catProfile() {
  const name = (catNameInput?.value || "").trim().slice(0, 32) || "İsimsiz dost";
  const stage = catStageInput?.value || "unknown";
  return { name, stage, eyes: catEye, vibe: catVibe, traits: { ...choice } };
}

function catProfileText(profile = catProfile()) {
  const traits = Object.entries(profile.traits)
    .filter(([, value]) => value !== "any")
    .map(([key, value]) => CAT_LABELS[key]?.[value])
    .filter(Boolean);
  return [
    `${profile.name} · ERGİN LAB Kedi Dosyası`,
    `Kayıt: ${makeCatCode(profile)}`,
    `Yaşam evresi: ${CAT_STAGES[profile.stage] || CAT_STAGES.unknown}`,
    `Görünüş: ${traits.length ? traits.join(", ") : "Henüz işaretlenmedi"}`,
    `Göz: ${CAT_EYES[profile.eyes] || CAT_EYES.unknown}`,
    `Mizaç: ${CAT_VIBES[profile.vibe] || CAT_VIBES.curious}`,
    "",
    "Bu dosya gözlem ve eğlence içindir. Irk, soy kütüğü veya sağlık tanısı değildir.",
    "Fotoğraf analizi yalnızca bu cihazdaki renk örneklemesine dayanır.",
  ].join("\n");
}

function makeCatCode(profile = catProfile()) {
  const raw = `${profile.name}|${profile.stage}|${profile.eyes}|${profile.vibe}|${JSON.stringify(profile.traits)}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) hash = (Math.imul(hash, 31) + raw.charCodeAt(i)) >>> 0;
  return `FEL-${String((hash % 8999) + 1000)}`;
}

function addCatBadge(root, label) {
  const tag = document.createElement("span");
  tag.className = "catlab-tag";
  tag.textContent = label;
  root.append(tag);
}

function updateCatDossier() {
  const profile = catProfile();
  const code = makeCatCode(profile);
  const name = document.querySelector("#cat-card-name");
  const subtitle = document.querySelector("#cat-card-subtitle");
  const codeNode = document.querySelector("#cat-card-code");
  const footer = document.querySelector("#cat-card-footer");
  const tags = document.querySelector("#cat-card-tags");
  const facts = document.querySelector("#cat-card-facts");
  const status = document.querySelector("#cat-record-status");
  if (name) name.textContent = profile.name;
  if (subtitle) subtitle.textContent = `${CAT_VIBES[profile.vibe]} · ${CAT_STAGES[profile.stage]?.toLocaleLowerCase("tr-TR") || "evre bilinmiyor"} · saha kaydı`;
  if (codeNode) codeNode.textContent = code;
  if (footer) footer.textContent = `${CAT_EYES[profile.eyes].toLocaleUpperCase("tr-TR")} · GÖZLEM`;
  if (status) status.textContent = "DRAFT / LIVE";
  if (catLayout) catLayout.dataset.coat = choice.pattern === "any" ? "tabby" : choice.pattern;
  if (tags) {
    tags.replaceChildren();
    addCatBadge(tags, CAT_EYES[profile.eyes]);
    addCatBadge(tags, CAT_VIBES[profile.vibe]);
    Object.entries(choice).forEach(([key, value]) => {
      if (value !== "any" && CAT_LABELS[key]?.[value]) addCatBadge(tags, CAT_LABELS[key][value]);
    });
  }
  if (facts) {
    facts.replaceChildren();
    const entries = [
      ["YAŞAM EVRESİ", CAT_STAGES[profile.stage] || CAT_STAGES.unknown],
      ["TÜY", CAT_LABELS.fur[choice.fur] || "Henüz seçilmedi"],
      ["DESEN", CAT_LABELS.pattern[choice.pattern] || "Henüz seçilmedi"],
      ["GÖVDE", CAT_LABELS.build[choice.build] || "Henüz seçilmedi"],
      ["KULAK", CAT_LABELS.ears[choice.ears] || "Henüz seçilmedi"],
      ["MİZAÇ", CAT_VIBES[profile.vibe]],
    ];
    entries.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "catlab-fact";
      const small = document.createElement("span");
      small.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      item.append(small, strong);
      facts.append(item);
    });
  }
}

function syncCatChoices() {
  document.querySelectorAll("[data-trait]").forEach((button) => {
    const checked = choice[button.dataset.trait] === button.dataset.value;
    button.setAttribute("aria-checked", String(checked));
  });
  document.querySelectorAll("[data-cat-eye]").forEach((button) => {
    button.setAttribute("aria-pressed", String(catEye === button.dataset.catEye));
  });
  document.querySelectorAll("[data-cat-vibe]").forEach((button) => {
    button.setAttribute("aria-pressed", String(catVibe === button.dataset.catVibe));
  });
}

document.querySelectorAll("[data-trait]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.trait;
    if (!key || !(key in choice)) return;
    choice[key] = button.dataset.value || "any";
    syncCatChoices();
    updateCatDossier();
  });
});
document.querySelectorAll("[data-cat-eye]").forEach((button) => {
  button.addEventListener("click", () => {
    catEye = button.dataset.catEye || "unknown";
    syncCatChoices();
    updateCatDossier();
  });
});
document.querySelectorAll("[data-cat-vibe]").forEach((button) => {
  button.addEventListener("click", () => {
    catVibe = button.dataset.catVibe || "curious";
    syncCatChoices();
    updateCatDossier();
  });
});
catNameInput?.addEventListener("input", updateCatDossier);
catStageInput?.addEventListener("change", updateCatDossier);

document.querySelector("#compare-traits")?.addEventListener("click", () => {
  const keys = Object.keys(choice).filter((key) => choice[key] !== "any");
  const items = rankTraits();
  if (!keys.length) {
    renderGuesses([], "Önce tüy, desen, gövde veya kulak özelliklerinden en az birini seç.");
    return;
  }
  if (!items.length) {
    renderGuesses([], "Bu kombinasyonda görünür özellik örtüşmesi bulamadım. Ev kedilerinin çeşitliliği zaten eşsiz.");
    return;
  }
  renderGuesses(items, `Karşılaştırma: ${keys.length} görünür özellik. Yüzdeler seçili işaretlerle örtüşmedir, ırk olasılığı değildir.`);
});

function readCatPhoto(img) {
  const size = 72;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas kullanılamıyor.");
  const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const width = img.naturalWidth * scale;
  const height = img.naturalHeight * scale;
  ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
  const data = ctx.getImageData(0, 0, size, size).data;
  const bins = new Map();
  let light = 0;
  let warm = 0;
  let pixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i], green = data[i + 1], blue = data[i + 2];
    const key = `${red >> 5},${green >> 5},${blue >> 5}`;
    let bin = bins.get(key);
    if (!bin) {
      bin = { r: 0, g: 0, b: 0, count: 0 };
      bins.set(key, bin);
    }
    bin.r += red; bin.g += green; bin.b += blue; bin.count += 1;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    if (luminance > 182) light += 1;
    if (red > green + 16 && red > blue + 16) warm += 1;
    pixels += 1;
  }
  const dominant = [...bins.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((bin) => ({
      hex: "#" + [bin.r, bin.g, bin.b].map((channel) => Math.round(channel / bin.count).toString(16).padStart(2, "0")).join(""),
      share: Math.round((bin.count / pixels) * 100),
    }));
  return { dominant, light: Math.round((light / pixels) * 100), warm: Math.round((warm / pixels) * 100) };
}

function renderCatPalette(result) {
  if (!catPalette) return;
  catPalette.replaceChildren();
  result.dominant.forEach(({ hex, share }) => {
    const item = document.createElement("div");
    item.className = "catlab-swatch";
    item.style.backgroundColor = hex;
    item.title = `${hex} · örneklenmiş renk`;
    item.setAttribute("role", "img");
    item.setAttribute("aria-label", `${hex}, örneklenen piksellerin yaklaşık yüzde ${share}si`);
    const code = document.createElement("span");
    code.textContent = hex.toUpperCase();
    item.append(code);
    catPalette.append(item);
  });
}

catPhotoInput?.addEventListener("change", () => {
  const file = catPhotoInput.files?.[0];
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  image = null;
  if (!file) {
    if (catPhoto) catPhoto.src = "photos/kedi.jpg";
    const caption = document.querySelector("#cat-photo-caption");
    if (caption) caption.textContent = "Örnek portre · kendi fotoğrafınla değiştir";
    return;
  }
  if (!file.type.startsWith("image/")) {
    catPaletteNote.textContent = "Bu dosya bir görsel değil. JPG, PNG veya WebP seç.";
    catPhotoInput.value = "";
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    catPaletteNote.textContent = "Dosya 12 MB sınırını aşıyor. Daha küçük bir fotoğraf seç.";
    catPhotoInput.value = "";
    return;
  }
  const url = URL.createObjectURL(file);
  imageUrl = url;
  const nextImage = new Image();
  image = nextImage;
  nextImage.onload = () => {
    if (image !== nextImage || imageUrl !== url) return;
    if (catPhoto) {
      catPhoto.src = url;
      catPhoto.alt = `${file.name || "Seçilen"} adlı yerel kedi fotoğrafı`;
    }
    const caption = document.querySelector("#cat-photo-caption");
    if (caption) caption.textContent = `YEREL PORTRE · ${file.name.slice(0, 48)}`;
    if (catPaletteNote) catPaletteNote.textContent = "Fotoğraf hazır. Renk haritasını istediğinde çıkarabilirsin.";
  };
  nextImage.onerror = () => {
    if (image !== nextImage) return;
    image = null;
    if (imageUrl === url) {
      URL.revokeObjectURL(url);
      imageUrl = null;
    }
    catPaletteNote.textContent = "Fotoğraf okunamadı. Başka bir JPG, PNG veya WebP dene.";
  };
  nextImage.src = url;
});

document.querySelector("#compare-photo")?.addEventListener("click", () => {
  if (!image) {
    if (catPaletteNote) catPaletteNote.textContent = "Önce cihazından bir fotoğraf seç. Örnek portre değil, yalnızca seçtiğin fotoğraf incelenir.";
    return;
  }
  try {
    const palette = readCatPhoto(image);
    renderCatPalette(palette);
    const tone = palette.light >= 55 ? "açık tonlar baskın" : palette.light <= 22 ? "koyu tonlar baskın" : "açık ve koyu tonlar dengeli";
    const warmth = palette.warm >= 25 ? "sıcak tonlar belirgin" : "sıcak renk oranı düşük";
    if (catPaletteNote) catPaletteNote.textContent = `${tone}; ${warmth}. Yaklaşık ${palette.light}% açık piksel, ${palette.warm}% sıcak piksel örneklendi.`;
  } catch {
    if (catPaletteNote) catPaletteNote.textContent = "Tarayıcı bu görselin renklerini okuyamadı. Başka bir fotoğraf dene.";
  }
});

function getSavedCats() {
  try {
    const saved = JSON.parse(localStorage.getItem("e.cat-dossiers.v1") || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item === "object" && typeof item.uid === "string") : [];
  } catch {
    return [];
  }
}

function renderSavedCats() {
  const root = document.querySelector("#cat-saved");
  const count = document.querySelector("#cat-saved-count");
  if (!root || !count) return;
  const saved = getSavedCats().slice(0, 6);
  count.textContent = `${saved.length} / 6`;
  root.replaceChildren();
  if (!saved.length) {
    const empty = document.createElement("li");
    empty.className = "catlab-saved-empty";
    empty.textContent = "Henüz kayıt yok. Bir kedi dosyası sakla.";
    root.append(empty);
    return;
  }
  saved.forEach((item) => {
    const li = document.createElement("li");
    li.className = "catlab-saved-item";
    const load = document.createElement("button");
    load.type = "button";
    load.className = "catlab-saved-load";
    load.dataset.catLoad = item.uid;
    const strong = document.createElement("strong");
    strong.textContent = item.profile.name || "İsimsiz dost";
    const small = document.createElement("small");
    small.textContent = `${item.code || "FEL-000"} · ${CAT_VIBES[item.profile.vibe] || "Kedi dosyası"}`;
    load.append(strong, small);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "catlab-saved-delete";
    remove.dataset.catDelete = item.uid;
    remove.setAttribute("aria-label", `${item.profile.name || "Kedi dosyası"} kaydını sil`);
    remove.textContent = "×";
    li.append(load, remove);
    root.append(li);
  });
}

function loadCatProfile(profile) {
  if (!profile || typeof profile !== "object") return;
  const sourceTraits = profile.traits || {};
  Object.keys(choice).forEach((key) => {
    const allowed = breeds.some((breed) => Array.isArray(breed[2][key]) && breed[2][key].includes(sourceTraits[key]));
    choice[key] = sourceTraits[key] === "any" || allowed ? (sourceTraits[key] || "any") : "any";
  });
  catEye = CAT_EYES[profile.eyes] ? profile.eyes : "unknown";
  catVibe = CAT_VIBES[profile.vibe] ? profile.vibe : "curious";
  if (catNameInput) catNameInput.value = String(profile.name || "").slice(0, 32);
  if (catStageInput) catStageInput.value = CAT_STAGES[profile.stage] ? profile.stage : "unknown";
  syncCatChoices();
  updateCatDossier();
}

document.querySelector("#cat-save")?.addEventListener("click", () => {
  const profile = catProfile();
  const saved = getSavedCats().filter((item) => item.profile?.name !== profile.name);
  saved.unshift({ uid: String(Date.now()), code: makeCatCode(profile), profile, text: catProfileText(profile), savedAt: new Date().toISOString() });
  try {
    localStorage.setItem("e.cat-dossiers.v1", JSON.stringify(saved.slice(0, 6)));
    renderSavedCats();
    const status = document.querySelector("#cat-record-status");
    if (status) status.textContent = "SAVED / LOCAL";
  } catch {
    const note = document.querySelector("#cat-palette-note");
    if (note) note.textContent = "Tarayıcının yerel deposu kapalı; bu kaydı saklayamadım.";
  }
});

document.querySelector("#cat-saved")?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const loadId = target.closest("[data-cat-load]")?.getAttribute("data-cat-load");
  const deleteId = target.closest("[data-cat-delete]")?.getAttribute("data-cat-delete");
  if (loadId) {
    const record = getSavedCats().find((item) => item.uid === loadId);
    if (record) loadCatProfile(record.profile);
    return;
  }
  if (deleteId) {
    try {
      localStorage.setItem("e.cat-dossiers.v1", JSON.stringify(getSavedCats().filter((item) => item.uid !== deleteId)));
      renderSavedCats();
    } catch {
      /* Silme yapılamazsa kayıt ekranda tutulur. */
    }
  }
});

document.querySelector("#cat-copy")?.addEventListener("click", async () => {
  const text = catProfileText();
  try {
    await navigator.clipboard.writeText(text);
    const status = document.querySelector("#cat-record-status");
    if (status) status.textContent = "COPIED / READY";
  } catch {
    if (catPaletteNote) catPaletteNote.textContent = "Kopyalama izni yok. Profil alanlarını yine de ekranda görebilir veya PNG kartını indirebilirsin.";
  }
});

document.querySelector("#cat-download")?.addEventListener("click", () => {
  const profile = catProfile();
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#100b0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1d1312";
  ctx.fillRect(32, 32, 1136, 566);
  ctx.strokeStyle = "#57302b";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1136, 566);
  ctx.fillStyle = "#e56c55";
  ctx.fillRect(32, 32, 8, 566);
  if (catPhoto?.complete && catPhoto.naturalWidth > 0) {
    const w = 400, h = 500, x = 80, y = 82;
    const scale = Math.max(w / catPhoto.naturalWidth, h / catPhoto.naturalHeight);
    const sw = catPhoto.naturalWidth * scale, sh = catPhoto.naturalHeight * scale;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.drawImage(catPhoto, x + (w - sw) / 2, y + (h - sh) / 2, sw, sh);
    ctx.restore();
  }
  ctx.fillStyle = "#d0b9aa";
  ctx.font = "18px monospace";
  ctx.fillText("ERGİN LAB / FELINE IDENTITY RECORD", 530, 112);
  ctx.fillStyle = "#f5e9df";
  ctx.font = "bold 56px Georgia, serif";
  ctx.fillText(profile.name.slice(0, 22), 530, 198);
  ctx.fillStyle = "#e56c55";
  ctx.font = "24px monospace";
  ctx.fillText(makeCatCode(profile), 530, 242);
  ctx.fillStyle = "#d0b9aa";
  ctx.font = "23px sans-serif";
  const lines = [
    CAT_STAGES[profile.stage] || "Yaşam evresi bilinmiyor",
    CAT_EYES[profile.eyes] || "Göz rengi bilinmiyor",
    CAT_VIBES[profile.vibe] || "Mizaç bilinmiyor",
    ...Object.entries(profile.traits).filter(([, value]) => value !== "any").map(([key, value]) => CAT_LABELS[key]?.[value]).filter(Boolean),
  ];
  lines.slice(0, 7).forEach((line, index) => ctx.fillText(line, 530, 300 + index * 38, 570));
  ctx.fillStyle = "#e56c55";
  ctx.font = "16px monospace";
  ctx.fillText("GÖZLEM, SOY KÜTÜĞÜ DEĞİL · FOTOĞRAF CİHAZDA KALIR", 530, 558);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kedi"}-dosyasi.png`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
});

document.querySelector("#cat-random")?.addEventListener("click", () => {
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const options = {
    fur: ["short", "long", "hairless"],
    pattern: ["solid", "tabby", "point", "bicolor"],
    build: ["slender", "large", "compact"],
    ears: ["any", "fold", "tuft"],
  };
  Object.keys(choice).forEach((key) => { choice[key] = pick(options[key]); });
  catEye = pick(Object.keys(CAT_EYES));
  catVibe = pick(Object.keys(CAT_VIBES));
  if (catNameInput) catNameInput.value = pick(CAT_NAMES);
  if (catStageInput) catStageInput.value = pick(Object.keys(CAT_STAGES));
  syncCatChoices();
  updateCatDossier();
  renderGuesses([], "Yeni kedi taslağı hazır. İstersen görünüş eşleşmelerini ayrıca çalıştır.");
  if (catPaletteNote) catPaletteNote.textContent = "Rastgele kedi oluşturuldu. Fotoğraf paleti için kendi fotoğrafını seç.";
});

document.querySelector("#cat-clear")?.addEventListener("click", () => {
  Object.keys(choice).forEach((key) => { choice[key] = "any"; });
  catEye = "amber";
  catVibe = "curious";
  if (catNameInput) catNameInput.value = "";
  if (catStageInput) catStageInput.value = "unknown";
  if (catPhotoInput) catPhotoInput.value = "";
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  image = null;
  if (catPhoto) {
    catPhoto.src = "photos/kedi.jpg";
    catPhoto.alt = "Kedi kimliği laboratuvarının örnek portresi; koyu fonda beyaz bir kedi.";
  }
  const caption = document.querySelector("#cat-photo-caption");
  if (caption) caption.textContent = "Örnek portre · kendi fotoğrafınla değiştir";
  if (catPalette) catPalette.replaceChildren();
  if (catPaletteNote) catPaletteNote.textContent = "Bir fotoğraf seçip renk paletini çıkar.";
  syncCatChoices();
  updateCatDossier();
  renderGuesses([], "Temiz bir dosya açıldı. Görünür özellikleri yeniden seçebilirsin.");
});

syncCatChoices();
updateCatDossier();
renderSavedCats();
window.addEventListener("beforeunload", () => { if (imageUrl) URL.revokeObjectURL(imageUrl); });

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

document.querySelector("#tape")?.addEventListener("change", (event) => {
  const picker = event.currentTarget;
  const file = picker.files && picker.files[0];
  if (!file) return;

  if (file.type && !file.type.startsWith("audio/")) {
    document.querySelector("#tape-name").textContent = "Bu dosya ses dosyası değil.";
    return;
  }

  stopRadio();
  tape.pause();
  if (tapeUrl) URL.revokeObjectURL(tapeUrl);
  tapeUrl = URL.createObjectURL(file);
  document.querySelector("#play").textContent = "Yayını başlat";
  tape.src = tapeUrl;
  tape.load();
  tape.play().catch(() => {
    document.querySelector("#tape-name").textContent = `${file.name} (tarayıcı oynatmayı engelledi, tekrar dene)`;
  });
  document.querySelector("#tape-name").textContent = file.name;
});

window.addEventListener("pagehide", () => {
  stopRadio();
  if (imageUrl) {
    URL.revokeObjectURL(imageUrl);
    imageUrl = null;
  }
  tape.pause();
  if (tapeUrl) {
    URL.revokeObjectURL(tapeUrl);
    tapeUrl = null;
  }
});

const lines = [
  ["Geceye kalan", "Bazı sesler birini çağırmaz; yalnızca bir zamanın kapısını aralar. Hatırlamak, geri dönmek zorunda olmak değildir."],
  ["Eski ışık", "Şehir değişiyor; yine de bazı pencereler içimizde aynı akşamı aydınlatıyor."],
  ["Bir şarkının arası", "Bazen şarkının kendisini değil, onu ilk duyduğumuz zamanki hâlimizi hatırlarız."],
  ["Gönderilmeyen", "Her cümlenin bir alıcısı olmak zorunda değil. Bazıları, sessizce yerini bulunca tamamlanır."],
  ["Kıyı çizgisi", "Bir zamanlar bildiğin yol, artık aynı yere çıkmasa da hafızanın haritasında durur."],
  ["Kayıt dışı", "Gürültü geçer. Birkaç frekans, hiçbir istasyon açık değilken bile kalır."],
];
let fragment = 0;
function nextNote() {
  fragment = (fragment + 1) % lines.length;
  const title = document.querySelector("#note-title");
  const body = document.querySelector("#note-body");
  const counter = document.querySelector("#note-counter");
  const label = document.querySelector(".archive-note-label");
  if (title) title.textContent = lines[fragment][0];
  if (body) body.textContent = lines[fragment][1];
  if (counter) counter.textContent = String(fragment + 1).padStart(2, "0") + " / " + String(lines.length).padStart(2, "0");
  if (label) label.textContent = "NOT / " + String(fragment + 1).padStart(2, "0") + " · KAYIT DIŞI";
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

const motionToggle = document.getElementById("motion-toggle");
if (motionToggle) {
  const syncMotionButton = () => {
    const enabled = document.documentElement.dataset.motion === "on";
    motionToggle.setAttribute("aria-pressed", String(enabled));
    motionToggle.innerHTML = enabled
      ? 'HAREKET · AÇIK <span aria-hidden="true">↗</span>'
      : 'HAREKET · KAPALI <span aria-hidden="true">↗</span>';
    motionToggle.title = enabled
      ? "Hareketli arka planı kapat"
      : "Hareketli arka planı ve atölye çizimini etkinleştir";
  };
  syncMotionButton();
  motionToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.motion !== "on" ? "on" : "off";
    try {
      localStorage.setItem("e.motion", next);
      localStorage.setItem("e.tremor", next);
    } catch {
      /* Tercih bu oturumda da uygulanır. */
    }
    document.documentElement.dataset.motion = next;
    document.documentElement.dataset.tremor = next;
    window.location.reload();
  });
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


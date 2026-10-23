/* Tigerk — deponun içindeki tarayıcı ağı.
   Python kaynağındakiyle aynı iskelet: nöron, katman, sigmoid, ileri besleme,
   ortalama kare hata, geri yayılım. Ağırlık bu tarayıcıda kalır. */
(function () {
  const STEMS = [
    "yardim", "help", "komut", "hava", "yagmur", "derece", "semsiye", "ruzgar", "sicak", "nem",
    "saat", "ay", "dolunay", "radyo", "yayin", "vhs", "neon", "otobus", "kanal", "ses", "cal", "muzik",
    "kedi", "irk", "laboratuvar", "git", "gec", "bolum", "iskelet", "tema", "amber", "kemik",
    "sis", "titre", "telefon", "tigerk", "noron", "egit", "ogren", "not", "arsiv", "galata",
    "ayasofya", "sinan", "samatya", "eminonu", "kule", "veil", "grey", "recon", "site", "nedir",
    "nasil", "nerede", "kim",
  ];
  const HASH = 8;
  const INPUT = STEMS.length + HASH;
  const HIDDEN = 16;
  const INTENTS = ["yardim", "hava", "saat", "radyo", "kedi", "git", "iskelet", "tema", "titresim", "sor", "egit", "ay", "not"];
  const VOWELS = new Set("aeıioöuüâîû".split(""));

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sigmoid(x) {
    if (x > 18) return 1;
    if (x < -18) return 0;
    return 1 / (1 + Math.exp(-x));
  }

  class Noron {
    constructor(n, rnd) {
      this.w = Array.from({ length: n }, () => (rnd() * 2 - 1) * 0.45);
      this.b = 0;
      this.out = 0;
    }
  }

  class Katman {
    constructor(nIn, nOut, rnd) {
      this.noronlar = Array.from({ length: nOut }, () => new Noron(nIn, rnd));
    }
    ileri(x) {
      this._in = x;
      return this.noronlar.map((noron) => {
        let z = noron.b;
        for (let i = 0; i < x.length; i += 1) z += noron.w[i] * x[i];
        noron.out = sigmoid(z);
        return noron.out;
      });
    }
    geri(hata, lr) {
      const x = this._in;
      const prev = new Array(x.length).fill(0);
      this.noronlar.forEach((noron, j) => {
        const delta = hata[j] * noron.out * (1 - noron.out);
        for (let i = 0; i < x.length; i += 1) {
          prev[i] += delta * noron.w[i];
          noron.w[i] += lr * delta * x[i];
        }
        noron.b += lr * delta;
      });
      return prev;
    }
  }

  class Ag {
    constructor(rnd) {
      this.katmanlar = [new Katman(INPUT, HIDDEN, rnd), new Katman(HIDDEN, INTENTS.length, rnd)];
    }
    ileri(x) {
      return this.katmanlar.reduce((value, layer) => layer.ileri(value), x);
    }
    egitBir(x, hedef, lr) {
      const y = this.ileri(x);
      let loss = 0;
      const hata = y.map((value, index) => {
        const error = hedef[index] - value;
        loss += error * error;
        return error;
      });
      let grad = hata;
      for (let i = this.katmanlar.length - 1; i >= 0; i -= 1) grad = this.katmanlar[i].geri(grad, lr);
      return loss / hedef.length;
    }
  }

  function fold(value) {
    return String(value || "")
      .toLocaleLowerCase("tr")
      .replace(/[^a-z0-9çğıöşü\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
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

  function vec(text) {
    const words = soft(text).split(" ").filter(Boolean);
    const exact = new Set(["ay", "sis", "kim", "git"]);
    const has = (stem) => words.some((word) => word === stem || (!exact.has(stem) && word.startsWith(stem)));
    const out = STEMS.map((stem) => (has(stem) ? 1 : 0));
    const source = ` ${words.join(" ")} `;
    const buckets = new Array(HASH).fill(0);
    for (let i = 0; i < source.length - 2; i += 1) {
      let hash = 2166136261;
      for (let k = 0; k < 3; k += 1) hash = Math.imul(hash ^ source.charCodeAt(i + k), 16777619);
      buckets[(hash >>> 0) % HASH] += 1;
    }
    const peak = Math.max(1, ...buckets);
    return out.concat(buckets.map((n) => n / peak));
  }

  const SAMPLES = [
    ["yardim", "yardım"],
    ["yardim", "yardim"],
    ["yardim", "ne yapabilirsin"],
    ["yardim", "komutları göster"],
    ["yardim", "help"],
    ["hava", "hava nasıl"],
    ["hava", "hava durumu"],
    ["hava", "istanbulda yağmur var mı"],
    ["hava", "şimdi kaç derece"],
    ["hava", "şemsiye lazım mı"],
    ["hava", "rüzgar kuvvetli mi"],
    ["hava", "bugün sıcak mı"],
    ["hava", "nem oranı ne"],
    ["saat", "saat kaç"],
    ["saat", "istanbul saati"],
    ["saat", "şimdiki saat"],
    ["saat", "saat kaç oldu"],
    ["radyo", "radyoyu aç"],
    ["radyo", "gece otobüsünü çal"],
    ["radyo", "bir kanal aç"],
    ["radyo", "yayını kes"],
    ["radyo", "vhs rüyası gelsin"],
    ["radyo", "neon kanalına geç"],
    ["radyo", "sesi kapat"],
    ["radyo", "greyfield çalsın"],
    ["radyo", "bir şeyler çalsın"],
    ["radyo", "çal bakalım"],
    ["radyo", "müzik aç"],
    ["kedi", "kedi laboratuvarı"],
    ["kedi", "bu kedi hangi ırk"],
    ["kedi", "kediyi oku"],
    ["kedi", "van kedisi anlat"],
    ["kedi", "kedi kimliği"],
    ["git", "istanbul bölümüne git"],
    ["git", "atölyeye git"],
    ["git", "frekansa geç"],
    ["git", "arşivi aç"],
    ["git", "kırmızı hata git"],
    ["git", "sinyal bölümüne git"],
    ["git", "Tigerk'e git"],
    ["iskelet", "iskeleti çıkar"],
    ["iskelet", "sesli harfleri düşür"],
    ["iskelet", "bunun iskeletini ver"],
    ["tema", "temayı değiştir"],
    ["tema", "amber tema"],
    ["tema", "gece teması"],
    ["tema", "sis modu"],
    ["tema", "kemik rengi"],
    ["titresim", "titreşim aç"],
    ["titresim", "titreşimi kapat"],
    ["titresim", "telefonu titret"],
    ["titresim", "titreşim kapansın"],
    ["sor", "galata kulesi ne zaman yapıldı"],
    ["sor", "ayasofya kim yaptırdı"],
    ["sor", "tigerk nedir"],
    ["sor", "veilcheck ne işe yarar"],
    ["sor", "kız kulesi nerede"],
    ["sor", "süleymaniye camii kim yaptı"],
    ["sor", "samatya nasıl bir yer"],
    ["sor", "bu site ne"],
    ["sor", "greysignal ne okur"],
    ["sor", "eminönü nesi meşhur"],
    ["egit", "ağı eğit"],
    ["egit", "bir tur eğitim"],
    ["egit", "geri yayılım yap"],
    ["egit", "tigerk öğren"],
    ["ay", "ay hangi evrede"],
    ["ay", "dolunay mı"],
    ["ay", "bu gece ay nasıl"],
    ["ay", "ayın hali"],
    ["ay", "ay evresi ne"],
    ["not", "çekmecedeki not"],
    ["not", "sonraki not"],
    ["not", "arşiv notunu oku"],
    ["not", "notu aç"],
    ["not", "masanın notu"],
  ];

  const CORPUS = [
    {
      title: "Galata Kulesi",
      keys: ["galata", "ceneviz", "beyoğlu", "beyoglu"],
      body: "Cenevizliler 1348'de Galata surlarının en yüksek noktasına inşa etti. Gövde yaklaşık 67 metre. Yüzyıllarca yangın gözetleme kulesi olarak da kullanıldı. Tepesinden Haliç, Tarihi Yarımada ve Boğaz görünür.",
    },
    {
      title: "Eminönü",
      keys: ["eminönü", "eminonu", "yeni cami", "mısır", "misir"],
      body: "Galata Köprüsü'nün Tarihi Yarımada ayağı. Yeni Cami'nin yapımı 1597'de başladı, 1665'te bitti. Mısır Çarşısı aynı külliyenin parçası.",
    },
    {
      title: "Samatya",
      keys: ["samatya", "surp kevork", "kevork", "marmara", "rum", "ermeni"],
      body: "Surların güneyinde, Marmara'ya bakan eski mahalle. Rum ve Ermeni cemaatlerinin sokakları, kiliseler, ahşap evler ve balıkçı meyhaneleri. Turist kalabalığından uzak.",
    },
    {
      title: "Ayasofya",
      keys: ["ayasofya", "jüstinyanus", "justinianus", "bizans"],
      body: "Jüstinyanus döneminde 537'de tamamlandı. Yaklaşık bin yıl kilise, sonra yüzyıllar boyunca cami. Kubbesi mimarlık tarihinin dönüm noktalarından.",
    },
    {
      title: "Süleymaniye Camii",
      keys: ["süleymaniye", "suleymaniye", "sinan", "kanuni"],
      body: "Mimar Sinan'ın Kanuni Sultan Süleyman için yaptığı külliye 1557'de tamamlandı. Haliç'e bakan tepede klasik Osmanlı kubbe düzeninin örneği.",
    },
    {
      title: "Kız Kulesi",
      keys: ["kız", "kiz", "üsküdar", "uskudar", "boğaz", "bogaz"],
      body: "Üsküdar açığında, Boğaz'ın girişinde küçük bir adacıkta. Bugünkü görünüm 1830'lardaki yenilemeye dayanır. Gün batımında iki yakadan da görünür.",
    },
    {
      title: "Tigerk",
      keys: ["tigerk", "nöron", "noron", "sigmoid", "katman"],
      body: "Tigerk, yapay sinir ağını harici kütüphane olmadan anlatan Python projesi. Bu sayfadaki prova aynı parçaları kullanır: nöron, katman, sigmoid, ileri besleme, ortalama kare hata ve geri yayılım. Ağ tarayıcıda eğitilir, ağırlık cihazdan çıkmaz.",
    },
    {
      title: "VeilCheck",
      keys: ["veilcheck", "veil", "sır", "sir"],
      body: "VeilCheck, kodun içinde unutulmuş sır işaretlerini arar. Dosyayı dışarı taşımaz, bulunan değeri ifşa etmez. Python, standart kütüphane.",
    },
    {
      title: "GreySignal",
      keys: ["greysignal", "header", "başlık", "baslik"],
      body: "GreySignal bir adresin yanıt başlıklarını okur. Eksik tabelayı kendiliğinden açık kapı ilan etmez. Yalnızca okuma.",
    },
    {
      title: "ReconX",
      keys: ["reconx", "recon", "keşif", "kesif"],
      body: "ReconX izin verilen keşif içindir. Davetiye yoksa kapı da yoktur. Çıktıyı okunur bir rapora çevirir.",
    },
    {
      title: "local-sqli-lab",
      keys: ["sqli", "sqlite", "enjeksiyon"],
      body: "local-sqli-lab, SQL enjeksiyonunu internete çıkmadan küçük bir SQLite masasında anlatır. Eğitim aracı.",
    },
    {
      title: "Greyfield FM",
      keys: ["radyo", "greyfield", "frekans", "otobüs", "otobus", "vhs", "neon"],
      body: "Greyfield FM hazır şarkı çalmaz. 88.8 Gece Otobüsü, 87.9 VHS Rüyası ve 91.3 Paslı Neon tarayıcıda, o an üretilir. Ses dışarı akmaz.",
    },
    {
      title: "Kedi laboratuvarı",
      keys: ["kedi", "ırk", "irk", "laboratuvar", "ankara", "van"],
      body: "Kedi laboratuvarı yerel bir yakınlık deneyi. Tüy, desen, gövde seçilir ya da fotoğraf bırakılır. Fotoğraf cihazdan çıkmaz. Sonuç veteriner kaşesi değildir.",
    },
    {
      title: "Gece vardiyası",
      keys: ["site", "eerrgin", "ergin", "gece", "vardiya", "izleme"],
      body: "eerrgin, Ergin Kaplan'ın İstanbul gece vardiyası. Düz HTML. İzleme yok. Hava Open-Meteo'dan gelir, gelmezse sayfa ayakta kalır. Ergin Lab'de Taskflow, Calc Lab, Skyline ve Tempo durur.",
    },
    {
      title: "Kırmızı hat",
      keys: ["sınır", "sinir", "kırmızı", "kirmizi", "gizlilik"],
      body: "Sayfa izleme kodu taşımaz. Radyo sesi, fotoğraf, teyp ve Tigerk ağırlığı bu cihazda kalır. HAT terminali de aynı kurala bağlıdır.",
    },
  ];

  let rnd = mulberry32(0x6a17c0de);
  let ag = new Ag(rnd);
  let loss = 1;
  let epochs = 0;

  function snapshot() {
    return ag.katmanlar.map((layer) => layer.noronlar.map((noron) => ({ w: noron.w.slice(), b: noron.b })));
  }

  function restore(dump) {
    dump.forEach((layer, li) => {
      layer.forEach((noron, ni) => {
        ag.katmanlar[li].noronlar[ni].w = noron.w.slice();
        ag.katmanlar[li].noronlar[ni].b = noron.b;
      });
    });
  }

  function persist() {
    try {
      localStorage.setItem("e.tigerk", JSON.stringify({ dump: snapshot(), loss, epochs }));
    } catch {
      /* gizli pencerede hafıza kapalı olabilir */
    }
  }

  function hydrate() {
    try {
      const raw = localStorage.getItem("e.tigerk") || localStorage.getItem("e.\u006bavra");
      if (!raw) return false;
      if (!localStorage.getItem("e.tigerk")) localStorage.setItem("e.tigerk", raw);
      const data = JSON.parse(raw);
      if (!data.dump || data.dump.length !== 2 || data.dump[0][0].w.length !== INPUT) return false;
      restore(data.dump);
      loss = Number(data.loss) || loss;
      epochs = Number(data.epochs) || 0;
      return true;
    } catch {
      return false;
    }
  }

  function oneHot(name) {
    const index = INTENTS.indexOf(name);
    return INTENTS.map((_, i) => (i === index ? 1 : 0));
  }

  function trainEpochs(count, rate) {
    const steps = Math.max(1, Math.min(60, count || 1));
    const lr = rate || 0.55;
    let last = loss;
    for (let epoch = 0; epoch < steps; epoch += 1) {
      let sum = 0;
      for (let i = SAMPLES.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rnd() * (i + 1));
        const swap = SAMPLES[i];
        SAMPLES[i] = SAMPLES[j];
        SAMPLES[j] = swap;
      }
      for (const [label, phrase] of SAMPLES) sum += ag.egitBir(vec(phrase), oneHot(label), lr);
      last = sum / SAMPLES.length;
      epochs += 1;
    }
    loss = last;
    persist();
    return { loss, epochs };
  }

  if (!hydrate()) trainEpochs(48, 0.8);

  function classify(text) {
    const scores = ag.ileri(vec(text));
    let best = 0;
    for (let i = 1; i < scores.length; i += 1) if (scores[i] > scores[best]) best = i;
    const hidden = ag.katmanlar[0].noronlar.map((noron) => noron.out);
    return { intent: INTENTS[best], conf: scores[best], scores, hidden };
  }

  function skeleton(text) {
    let dropped = 0;
    const bone = Array.from(String(text || ""))
      .map((ch) => {
        if (ch === " " || ch === "\n" || ch === "\t") return " ";
        if (VOWELS.has(ch.toLocaleLowerCase("tr"))) {
          dropped += 1;
          return "·";
        }
        return ch;
      })
      .join("")
      .replace(/[ ]{2,}/g, " ")
      .trim();
    return { text: bone || "·", dropped };
  }

  function entropy(text) {
    const value = String(text || "");
    if (!value) return 0;
    const counts = new Map();
    for (const ch of value) counts.set(ch, (counts.get(ch) || 0) + 1);
    let h = 0;
    for (const n of counts.values()) {
      const p = n / value.length;
      h -= p * Math.log2(p);
    }
    return h;
  }

  function retrieve(text) {
    const words = soft(text).split(" ").filter((word) => word.length > 2);
    const aliases = { kule: ["galata", "kız", "kiz"], cami: ["ayasofya", "suleymaniye", "eminonu"], ai: ["tigerk"], yapay: ["tigerk"] };
    const expanded = words.flatMap((word) => [word, ...(aliases[word] || [])]);
    if (!words.length) return null;
    let best = null;
    let bestScore = 0;
    for (const page of CORPUS) {
      const keys = page.keys.map(fold);
      const hay = fold(`${page.title} ${page.body} ${keys.join(" ")}`);
      let score = 0;
      for (const word of expanded) {
        if (keys.some((key) => key === word || key.includes(word) || word.includes(key))) score += 3;
        else if (hay.includes(word)) score += 1;
      }
      score /= Math.sqrt(words.length);
      if (score > bestScore) {
        bestScore = score;
        best = page;
      }
    }
    if (!best || bestScore < 0.72) return best && bestScore > 0.35 ? { title: best.title, body: best.body, score: bestScore, weak: true } : null;
    return { title: best.title, body: best.body, score: bestScore };
  }

  function ask(text) {
    const clean = String(text || "").trim();
    const bone = skeleton(clean);
    const bits = entropy(clean);
    if (!clean) {
      return {
        intent: "bos",
        conf: 0,
        margin: 0,
        answer: "Boş cümle. İskelet de boş.",
        bone: bone.text,
        dropped: 0,
        bits: 0,
        hidden: [],
        scores: [],
        passage: null,
      };
    }
    const hit = classify(clean);
    const order = hit.scores.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);
    const margin = order[0].value - order[1].value;
    let intent = hit.intent;
    const qwords = new Set(["ne", "nasil", "kim", "nerede", "neden", "niye", "mi", "mu", "kac", "hangi", "nedir", "nicin"]);
    const question = soft(clean).split(" ").some((word) => qwords.has(word));
    if (hit.conf < 0.55 || margin < 0.08) intent = "sor";
    if (question && (intent === "git" || intent === "not" || intent === "radyo" || intent === "kedi")) intent = "sor";
    const passage = retrieve(clean);
    return {
      intent,
      conf: hit.conf,
      margin,
      bone: bone.text,
      dropped: bone.dropped,
      bits,
      hidden: hit.hidden,
      scores: hit.scores,
      passage,
      label: INTENTS[order[0].index],
    };
  }

  function draw(canvas, read) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || 640;
    const h = 132;
    if (canvas.width !== Math.floor(w * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const hidden = read && read.hidden && read.hidden.length ? read.hidden : new Array(HIDDEN).fill(0.15);
    const scores = read && read.scores && read.scores.length ? read.scores : new Array(INTENTS.length).fill(0.08);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#e23a2f";
    const bone = getComputedStyle(document.documentElement).getPropertyValue("--bone").trim() || "#d9c8b2";
    const line = getComputedStyle(document.documentElement).getPropertyValue("--line").trim() || "#2a241f";
    ctx.font = "11px Outfit, sans-serif";
    ctx.fillStyle = bone;
    ctx.fillText(`katman 32 → ${HIDDEN} → ${INTENTS.length}   kayıp ${loss.toFixed(3)}   tur ${epochs}`, 8, 16);
    const rows = Math.min(8, hidden.length);
    hidden.slice(0, rows).forEach((value, index) => {
      const y = 28 + index * 12;
      ctx.fillStyle = line;
      ctx.fillRect(8, y, 90, 7);
      ctx.fillStyle = color;
      ctx.fillRect(8, y, Math.max(2, value * 90), 7);
    });
    const barW = Math.max(18, Math.floor((w - 120) / INTENTS.length) - 4);
    scores.forEach((value, index) => {
      const x = 112 + index * (barW + 4);
      const bh = Math.max(2, value * 78);
      ctx.fillStyle = index === scores.indexOf(Math.max(...scores)) ? color : line;
      ctx.fillRect(x, 108 - bh, barW, bh);
      ctx.save();
      ctx.translate(x + barW, 122);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = bone;
      ctx.fillText(INTENTS[index], 0, 0);
      ctx.restore();
    });
  }

  function speak(text, read) {
    const clean = String(text || "").trim();
    const folded = soft(clean);
    if (!clean) return "Boş cümle. İskelet de boş.";
    const hit = read || ask(clean);
    if (/(^|\s)(saat|saati)(\s|$)/.test(folded) || folded.includes("saat kac")) {
      const now = new Date().toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour12: false });
      return `İstanbul saati ${now}. Duvar saati yalan söylemez, ben de söylemem.`;
    }
    if (hit.passage && !hit.passage.weak) {
      return `${hit.passage.title}. ${hit.passage.body}`;
    }
    if (/^(selam|merhaba|hey|naber|nasilsin|nbr)/.test(folded)) {
      return "Buradayım. Gece vardiyası açık. Sor: Galata, Ayasofya, Süleymaniye, Kız Kulesi, Tigerk, VeilCheck, hava, saat. Uydurmam.";
    }
    if (folded.includes("kimsin") || folded.includes("adin ne") || folded.includes("sen kim") || folded.includes("nesin")) {
      return "Tigerk. Bu sekmede doğan küçük bir ağ. Ergin Kaplan'ın gece masası. Model indirmem, anahtar istemem, boşluğu süslemem.";
    }
    if (hit.intent === "hava") return "Hava Open-Meteo'dan gelir. Üstteki şerit doluysa sayı oradadır; değilse hat susmuştur, sayfa ayaktadır.";
    if (hit.intent === "yardim") return "Sor ya da komut yaz. hava, saat, radyo, kedi, galata kulesi, ayasofya, veilcheck, tigerk nedir. İlk kelime HAT'ta komutsa o çalışır.";
    if (hit.passage && hit.passage.weak) {
      return `En yakın kayıt ${hit.passage.title}. ${hit.passage.body} Eşleşme zayıf; kesin diye satmıyorum.`;
    }
    return "Bu cümlenin kaydı yok. Uydurup boşluk doldurmam. Galata, Eminönü, Samatya, Ayasofya, Süleymaniye, Kız Kulesi, VeilCheck, GreySignal, ReconX, radyo, kedi, saat, hava — bunları sorarsan cevaplarım.";
  }

  function paintAnswer(text) {
    const read = ask(text);
    const answer = speak(text, read);
    const out = document.getElementById("tigerk-out");
    const meta = document.getElementById("tigerk-meta");
    if (out) out.textContent = answer;
    if (meta) {
      const net = state();
      const conf = read.conf || 0;
      const n = Math.max(0, Math.min(8, Math.round(conf * 8)));
      const bars = `${"|".repeat(n)}${".".repeat(8 - n)}`;
      meta.textContent = `${read.intent} ${bars} ${(conf * 100).toFixed(0)}% · iskelet ${read.bone} · ${(read.bits || 0).toFixed(2)} bit · kayıp ${net.loss.toFixed(3)}`;
    }
    draw(document.getElementById("tigerk-net"), read);
    if (window.Gece && window.Gece.pulse) window.Gece.pulse("tigerk");
    return { read, answer };
  }

  function state() {
    return { loss, epochs, input: INPUT, hidden: HIDDEN, outputs: INTENTS.length };
  }

  function reset() {
    try {
      localStorage.removeItem("e.tigerk");
      localStorage.removeItem("e.\u006bavra");
    } catch {
      /* yok say */
    }
    rnd = mulberry32(0x6a17c0de);
    ag = new Ag(rnd);
    epochs = 0;
    return trainEpochs(48, 0.8);
  }

  window.Tigerk = {
    ask,
    classify,
    skeleton,
    entropy,
    retrieve,
    trainEpochs,
    draw,
    reset,
    speak,
    paintAnswer,
    fold,
    intents: INTENTS,
    state,
  };

  function bindAsk() {
    const run = document.getElementById("tigerk-run");
    const field = document.getElementById("tigerk-in");
    const boneBtn = document.getElementById("tigerk-bone");
    const trainBtn = document.getElementById("tigerk-train");
    const clearBtn = document.getElementById("tigerk-clear");
    if (!run || run.dataset.bound) return;
    run.dataset.bound = "1";
    run.addEventListener("click", () => {
      paintAnswer(field ? field.value.trim() : "");
    });
    boneBtn?.addEventListener("click", () => {
      const value = field?.value.trim() || "";
      const bone = skeleton(value);
      const out = document.getElementById("tigerk-out");
      if (out) out.textContent = value ? `iskelet  ${bone.text}` : "Boş cümle. İskelet de boş.";
    });
    trainBtn?.addEventListener("click", () => {
      const before = state().loss;
      const next = trainEpochs(8, 0.4);
      const out = document.getElementById("tigerk-out");
      if (out) out.textContent = `Geri yayılım bitti. Kayıp ${before.toFixed(3)} → ${next.loss.toFixed(3)}. Tur ${next.epochs}. Ağ bu sekmede kaldı.`;
      draw(document.getElementById("tigerk-net"), ask("ağı eğit"));
    });
    clearBtn?.addEventListener("click", () => {
      if (field) field.value = "";
      const out = document.getElementById("tigerk-out");
      if (out) out.textContent = "Silindi. Yeni cümle bekliyorum.";
      const meta = document.getElementById("tigerk-meta");
      if (meta) meta.textContent = "temiz";
      draw(document.getElementById("tigerk-net"), null);
    });
    field?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey || !event.shiftKey)) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          run.click();
        }
      }
    });
    const waiting = document.getElementById("tigerk-out");
    if (waiting) waiting.textContent = "Ağ ayakta. Soruyu yaz, cevap burada durur.";
    draw(document.getElementById("tigerk-net"), null);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindAsk);
  else bindAsk();
})();

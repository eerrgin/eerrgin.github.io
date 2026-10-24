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
    ["sor", "review this pull request for breaking changes"],
    ["sor", "kod incelemesinde riskleri sırala"],
    ["sor", "stack trace üzerinden kök nedeni bul"],
    ["sor", "race condition nasıl izole edilir"],
    ["sor", "API sözleşmesini idempotency ve retry açısından değerlendir"],
    ["sor", "rate limit ve pagination tasarımını incele"],
    ["sor", "unit integration test stratejisi oluştur"],
    ["sor", "React state ve hydration sorunu"],
    ["sor", "CSS layout CLS ve erişilebilirlik incelemesi"],
    ["sor", "p95 latency ve bellek tüketimini analiz et"],
    ["sor", "mimari sınırları ve failure mode ları değerlendir"],
    ["sor", "GitHub Actions deployment rollback stratejisi"],
    ["sor", "SQL query plan ve index tasarımı"],
    ["sor", "threat model ve yetkilendirme sınırlarını incele"],
    ["sor", "backpropagation loss ve overfitting farkı"],
    ["sor", "bu kod için regresyon testi öner"],
    ["sor", "git merge conflict ve rebase stratejisi"],
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

  function engineeringResponse(text) {
    const q = soft(text);
    const reply = (label, answer) => ({ label, answer });

    if (/(^|\s)(kimsin|sen kimsin|adin ne|nesin|tigerk nedir|tigerk ne yapar)(\s|$)/.test(q)) {
      return reply("AGENT / SESSION", [
        "Tigerk / Engineering Reasoning Layer",
        "İstek yönlendirme, yerel bilgi erişimi ve mühendislik playbook'larını ayrı katmanlarda çalıştırır.",
        "Odak: kod inceleme, hata ayıklama, API sözleşmeleri, test stratejileri, performans ve mimari kararlar.",
        "İnceleme protokolü: bulgu → etki → doğrulama → en küçük güvenli düzeltme."
      ].join("\n"));
    }
    if (/^(selam|merhaba|hey|naber|nasilsin|nbr)(\s|$)/.test(q)) {
      return reply("SESSION / READY", "Tigerk çekirdeği hazır. Bir diff, stack trace, API sözleşmesi veya sistem davranışı gönder; analizi risk ve doğrulama adımlarıyla açayım.");
    }
    if (/(idempot|retry|retries|rate limit|pagination|webhook|http status|api contract|api sozles|endpoint|rest api|graphql)/.test(q)) {
      if (/(idempot|retry|retries|at least once|duplicate request|tekrar dene)/.test(q)) {
        return reply("API CONTRACT / RETRY SEMANTICS", [
          "İnceleme odağı: tekrar gönderim güvenliği.",
          "• Mutasyonlarda Idempotency-Key veya doğal bir benzersiz işlem anahtarı tanımla; aynı anahtarın eşzamanlı isteklerde de tek sonuca bağlandığını doğrula.",
          "• Anahtar + istek özeti + sonuç kaydını atomik tut. Aynı anahtarla farklı payload gelirse sessizce yeni işlem başlatma; açık bir conflict sözleşmesi döndür.",
          "• Retry politikasını timeout, 429 ve geçici 5xx yanıtlarıyla sınırla; exponential backoff ve jitter kullan, Retry-After başlığını uygula.",
          "• Test matrisi: aynı isteğin tekrarları, eşzamanlı tekrar, bağlantı kopması sonrası tekrar, anahtar süresi dolması ve kısmi başarısızlık.",
          "Beklenen çıktı: endpoint sözleşmesi + hata matrisi + tekrar senaryolarını kapsayan kontrat testleri."
        ].join("\n"));
      }
      return reply("API CONTRACT / SEMANTICS", [
        "Sözleşmeyi üç yüzeyde değerlendir:",
        "• Girdi: tip, zorunluluk, sınır değer, pagination ve idempotency garantisi.",
        "• Çıktı: başarı şeması, hata gövdesi, status code, correlation/request ID ve geriye uyumluluk.",
        "• Çalışma zamanı: timeout bütçesi, retry edilebilir hata sınıfları, rate-limit politikası ve yan etkiler.",
        "İlk doğrulama: OpenAPI şemasını örnek request/response çiftleriyle karşılaştır; başarısızlıkları kontrat testine bağla.",
        "Kararı netleştirmek için endpoint ve beklenen davranışı ekle."
      ].join("\n"));
    }
    if (/(race condition|deadlock|concurren|parallel request|eszamanli|yaris durumu|thread safe|lock contention)/.test(q)) {
      return reply("CONCURRENCY / RACE ANALYSIS", [
        "Öncelik: paylaşılan durum ve işlem sınırını bulmak.",
        "1. Yarışa girebilen iki yürütme yolunu ve ortak kaynağı işaretle.",
        "2. Okuma → karar → yazma aralığının atomik olup olmadığını incele; uygulama kilidi tek başına yeterli değilse veritabanı constraint/transaction seviyesine in.",
        "3. Tekrarlanabilir testte bariyer veya kontrollü gecikmeyle interleaving üret; rastgele sleep ile doğrulama yapma.",
        "4. Düzeltmeyi invariant ile tanımla: unique constraint, compare-and-swap, transaction isolation veya doğru kapsamlı mutex.",
        "5. Aynı yarış sırasını yeniden üreten regresyon testi ekle.",
        "İhtiyaç duyulan bağlam: runtime, paylaşılan state, ilgili kod yolu ve olay sırası."
      ].join("\n"));
    }
    if (/(security|guvenlik|threat model|auth|oauth|csrf|xss|sqli|sql injection|cors|secret|token leak|yetkilendirme|authorization|permission|rbac|acl|injection)/.test(q)) {
      return reply("SECURITY / TRUST BOUNDARIES", [
        "Tehdit modeli üzerinden ilerle:",
        "• Varlık ve sınır: hangi veri korunuyor, hangi aktör hangi güven sınırını geçiyor?",
        "• Kimlik doğrulama ≠ yetkilendirme. Her nesne erişiminde sunucu tarafı ownership/permission kontrolünü doğrula.",
        "• Girdi: SQL parametreleme, output encoding, CSRF/CORS ayrımı ve güvenilmeyen URL/file işleme yolları.",
        "• Sırlar: log, hata mesajı, client bundle ve CI çıktılarında sızıntı; rotasyon ve minimum ayrıcalık.",
        "• Kanıt: kötüye kullanım senaryosu + otomatik negatif test + log/alert sinyali.",
        "Öncelik sırası: sömürülebilirlik × etki × erişim koşulu. Bir kontrolün varlığını değil, bypass yolunu da test et."
      ].join("\n"));
    }
    if (/(code review|pull request|merge request|pr review|review this|review et|kod incele|diff review|refactor review|refactor)/.test(q)) {
      return reply("CODE REVIEW / CHANGE RISK", [
        "İnceleme protokolü",
        "01 · Davranış: değişen invariant, public contract ve geriye uyumluluk.",
        "02 · Failure path: timeout, retry, boş/bozuk input, cleanup ve kısmi commit.",
        "03 · State: yarış koşulu, tekrar çağrı, cache invalidation ve tutarlılık.",
        "04 · Boundary: yetki kontrolü, input validation, secret/log sızıntısı.",
        "05 · Operasyon: gözlemlenebilirlik, migration, rollback ve deploy sırası.",
        "06 · Test: yeni davranışın pozitif/negatif/regresyon kanıtı.",
        "Çıktı formatı: [BLOCKER|MAJOR|MINOR] dosya/satır → etki → yeniden üretim → önerilen en küçük patch.",
        "Diff'i veya değişen fonksiyonu eklediğinde bulguları bu formatta somutlaştır."
      ].join("\n"));
    }
    if (/(stack trace|stacktrace|debug|debugging|hata ayik|exception|regression|timeout|crash|bug\b|kok neden|root cause|unexpected behavior|beklenmeyen davranis|neden calismiyor|neden bozul)/.test(q)) {
      return reply("DEBUG / ROOT-CAUSE TRIAGE", [
        "Önce semptomu değil, ilk yanlış durumu bul.",
        "1. Beklenen ve gerçek çıktıyı; ortam, sürüm ve tetikleme adımlarıyla sabitle.",
        "2. Stack trace'te ilk uygulama frame'ini bul; son görünen frame çoğu kez yalnızca hatanın yüzeyidir.",
        "3. Sınırları ölç: giriş → dönüşüm → dış çağrı → yan etki. Her adımda invariant kontrolü koy.",
        "4. En küçük yeniden üretimi çıkar; tek değişkenli bir deneyle hipotezi ele.",
        "5. Düzeltmeyi regresyon testiyle kilitle; log'a sır, token veya kişisel veri basma.",
        "Gönderilecek bağlam: hata satırı, kısa trace, beklenen/gerçek davranış ve son değişiklik."
      ].join("\n"));
    }
    if (/(unit test|integration test|e2e|end to end|test strategy|test strateji|regression test|coverage|mock|fixture|contract test|test yaz|test suite)/.test(q)) {
      return reply("TEST STRATEGY / EVIDENCE", [
        "Test piramidini davranış riskine göre kur:",
        "• Unit: saf dönüşümler, sınır değerler ve invariant'lar.",
        "• Integration: veritabanı/queue/cache ile gerçek transaction ve hata davranışı.",
        "• Contract: consumer-provider şeması, status code ve geriye uyumluluk.",
        "• E2E: kritik kullanıcı yolunun küçük, deterministik bir smoke kümesi.",
        "Her hata senaryosunda yalnızca happy path değil: timeout, duplicate request, yetkisiz istek, boş payload ve rollback kontrolü de olmalı.",
        "Coverage yüzdesi tek başına kanıt değildir; testin başarısız olması gereken değişiklikte gerçekten başarısız olduğunu doğrula."
      ].join("\n"));
    }
    if (/(sql query|query plan|database|veritabani|index|postgres|sqlite|redis|transaction|migration|n\+1|schema design|data model)/.test(q)) {
      return reply("DATA LAYER / CONSISTENCY", [
        "Veri katmanı incelemesi:",
        "• Sorgu planını ve gerçek cardinality'yi oku; index'i yalnızca kolon adına bakarak ekleme.",
        "• Birlikte güncellenmesi gereken kayıtları tek transaction ve açık isolation beklentisiyle tanımla.",
        "• Unique/check/foreign-key constraint'lerini uygulama kontrolünün son savunması yap.",
        "• N+1, gereksiz full scan, aşırı geniş SELECT ve pagination kararlılığını ölç.",
        "• Migration için expand → migrate → contract sırası; rollback ve çift yazım dönemi için doğrulama ekle.",
        "Ölçüm: query plan, p95 süre, satır sayısı, lock wait ve connection pool doygunluğu."
      ].join("\n"));
    }
    if (/(css|layout|responsive|react|state management|hydration|accessibility|a11y|keyboard|mobile|dom|flexbox|grid layout|typography|font|component|frontend|front end|render loop|cls\b|lcp\b)/.test(q)) {
      return reply("FRONTEND / RENDERING CONTRACT", [
        "Arayüzü üç katmanda incele:",
        "• Layout: min-width:0, intrinsic sizing, grid/flex kırılımları ve uzun metin taşması.",
        "• State: tek doğruluk kaynağı, stale closure, hydration farkı ve gereksiz render döngüsü.",
        "• UX/accessibility: klavye odağı, semantic controls, loading/error/empty state ve reduced-motion tercihi.",
        "• Performance: görsel boyutları, font preload, layout shift ve ana iş parçacığı işi.",
        "Doğrulama seti: dar telefon, tablet, 1440px masaüstü; klavye-only gezinme; konsolda hata yok; CLS ve gerçek etkileşim süresi."
      ].join("\n"));
    }
    if (/(performance|performans|latency|throughput|p95|p99|profil|benchmark|memory leak|bellek|cache|caching|optimize|bundle size|cpu bound|io bound|slow query)/.test(q)) {
      return reply("PERFORMANCE / MEASUREMENT PLAN", [
        "Optimizasyondan önce bütçe ve darboğazı ölç.",
        "1. SLI seç: p50/p95 latency, throughput, error rate veya heap growth.",
        "2. CPU, I/O, network, database ve client rendering maliyetlerini ayrı ölç.",
        "3. Profildeki en pahalı yolu minimal workload ile yeniden üret.",
        "4. Cache ekliyorsan invalidation, staleness, stampede ve memory budget'ı tanımla.",
        "5. Aynı yükte değişiklik öncesi/sonrası ölç; ortalama tek başına kuyruk gecikmesini saklar.",
        "Çıktı: hipotez, baseline, deney, regresyon eşiği."
      ].join("\n"));
    }
    if (/(architecture|mimari|microservice|monolith|event driven|event-driven|service boundary|sinirlar|boundary design|modular design|moduler mimari|system design|design decision)/.test(q)) {
      return reply("SYSTEM DESIGN / BOUNDARIES", [
        "Mimaride önce kutuları değil, değişim ve hata sınırlarını çiz.",
        "• Sorumluluk: her modülün sahip olduğu state ve invariant.",
        "• Sözleşme: input/output, error semantics, versioning ve ownership.",
        "• Failure mode: timeout, retry, partial success, duplicate delivery ve degradation.",
        "• Operasyon: log/metric/trace, migration, rollout ve rollback.",
        "• Evrim: modül içi değişikliğin kaç tüketiciyi etkilediği; dağıtık sınırın gerçek bir bağımsızlık sağlayıp sağlamadığı.",
        "Karar kaydı için seçenek, trade-off, reddedilen alternatif ve geri dönüş maliyetini açık yaz."
      ].join("\n"));
    }
    if (/(github actions|ci\/cd|pipeline|deploy|deployment|rollback|release|docker|container|workflow|build failure|build fail|pages deploy|github pages)/.test(q)) {
      return reply("DELIVERY PIPELINE / RELEASE SAFETY", [
        "Dağıtımı dört kapıyla güvenceye al:",
        "01 · Validate: syntax, links/assets, type/lint ve test.",
        "02 · Build: tekrarlanabilir dependency çözümü ve artifact hash'i.",
        "03 · Release: environment/secret ayrımı, minimum izinler ve atomik yayın.",
        "04 · Verify: health check, hata oranı ve geri dönüş koşulu.",
        "GitHub Pages gibi statik yayında özellikle relative asset yolları, base path, kırık anchor ve case-sensitive dosya adlarını kontrol et.",
        "Rollback için son başarılı artifact'i ve deploy commit'ini açıkça kaydet."
      ].join("\n"));
    }
    if (/(backprop|backpropagation|gradient|sigmoid|neural network|sinir agi|embedding|inference|overfit|overfitting|loss function|loss|dataset|tokenization|classifier|model training|training loop|machine learning|makine ogrenmesi)/.test(q)) {
      return reply("MODEL SYSTEMS / LEARNING LOOP", [
        "Model hattını veri, optimizasyon ve değerlendirme olarak ayır.",
        "• Veri: label kalitesi, sınıf dengesi, leakage ve train/eval ayrımı.",
        "• Optimizasyon: loss tanımı, gradient scale, learning rate, initialization ve deterministik seed.",
        "• Genelleme: görülmemiş örnekler, confusion matrix, precision/recall ve kalibrasyon.",
        "• Runtime: inference latency, model/version hash'i, fallback davranışı ve gözlemlenebilirlik.",
        "Kayıp azalması tek başına doğru davranışın kanıtı değildir. Holdout set ve görev bazlı regresyon örnekleri gerekir."
      ].join("\n"));
    }
    if (/(git diff|git status|merge conflict|cherry.pick|rebase|branch protection|commit history|pull request|github actions)/.test(q)) {
      return reply("GIT / CHANGE CONTROL", [
        "Değişikliği önce kapsam, sonra geçmiş üzerinden değerlendir.",
        "• git diff --check: whitespace ve patch sorunları.",
        "• git diff --stat + dosya bazlı diff: beklenmeyen kapsam genişlemesi.",
        "• Rebase/merge sırasında aynı invariant üzerinde çakışan değişiklikleri elle birleştir; yalnızca conflict marker silmek yeterli değil.",
        "• Testleri birleştirme tabanında tekrar çalıştır ve commit'i doğrulanabilir bir davranış değişikliğiyle eşleştir.",
        "• Release tag'i ve son bilinen iyi commit'i rollback için sakla."
      ].join("\n"));
    }
    if (/(code|kod|function|fonksiyon|implement|implementation|refactor|review|debug|typescript|python|javascript|algorithm|algoritma)/.test(q)) {
      return reply("ENGINEERING TRIAGE / REQUEST SHAPING", [
        "İsteği uygulanabilir bir teknik probleme çeviriyorum.",
        "Girdi formatı: amaç + mevcut davranış + beklenen davranış + ilgili kod/trace + kısıt.",
        "Çıktı formatı: en olası nedenler, etkilediği sınır, doğrulama adımı ve en küçük güvenli düzeltme.",
        "Belirsiz varsayımı açık işaretle; kanıtlanmış bulgu ile hipotezi aynı seviyede sunma."
      ].join("\n"));
    }
    return null;
  }

  function commandRoute(text) {
    const q = soft(text);
    if (/^(help|yardim|komutlar|capabilities)(\s|$)/.test(q)) return { intent: "yardim", label: "SESSION / CAPABILITIES" };
    if (/^(hava|weather)(\s|$)/.test(q)) return { intent: "hava", label: "WEATHER / LIVE DATA" };
    if (/^(saat|clock)(\s|$)/.test(q)) return { intent: "saat", label: "CLOCK / EUROPE-ISTANBUL" };
    if (/^(radyo|radio|muzik|yayin|yayini|greyfield)(\s|$)/.test(q)) return { intent: "radyo", label: "AUDIO / SYNTHESIS" };
    if (/^(tema|theme)(\s|$)/.test(q)) return { intent: "tema", label: "INTERFACE / THEME" };
    if (/^(titresim|titre|vibration)(\s|$)/.test(q)) return { intent: "titresim", label: "INTERFACE / MOTION" };
    if (/^(egit|train)(\s|$)/.test(q)) return { intent: "egit", label: "MODEL / TRAINING LOOP" };
    if (/^(not|arsiv notu|sonraki not)(\s|$)/.test(q)) return { intent: "not", label: "ARCHIVE / NOTE" };
    if (/^(iskelet|skeleton)(\s|$)/.test(q)) return { intent: "iskelet", label: "TEXT / NORMALIZATION" };
    if (/^(kedi|cat)(\s|$)/.test(q)) return { intent: "kedi", label: "LOCAL / IMAGE LAB" };
    if (/^(ay|moon)(\s|$)/.test(q)) return { intent: "ay", label: "LUNAR / EPHEMERIS" };
    if (/^(git|go)\s+(kuslar|kus hatti|atolye|workbench|tigerk|laboratuvar|kedi|frekans|radyo|sinyal|arsiv|hat|kirmizi)(\s|$)/.test(q)) return { intent: "git", label: "NAVIGATION / SECTION ROUTER" };
    return null;
  }

  function ask(text) {
    const clean = String(text || "").trim();
    const bone = skeleton(clean);
    const bits = entropy(clean);
    if (!clean) {
      return {
        intent: "bos", conf: 0, margin: 0, answer: "Boş istem.",
        bone: bone.text, dropped: 0, bits: 0, hidden: [], scores: [],
        passage: null, topic: "REQUEST / EMPTY",
      };
    }
    const hit = classify(clean);
    const order = hit.scores.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);
    const margin = order[0].value - order[1].value;
    const specialist = engineeringResponse(clean);
    const command = commandRoute(clean);
    let intent = specialist ? "sor" : command ? command.intent : hit.intent;
    const qwords = new Set(["ne", "nasil", "kim", "nerede", "neden", "niye", "mi", "mu", "kac", "hangi", "nedir", "nicin"]);
    const question = soft(clean).split(" ").some((word) => qwords.has(word));
    if (!specialist && !command) {
      if (hit.conf < 0.55 || margin < 0.08) intent = "sor";
      if (question && (intent === "git" || intent === "not" || intent === "radyo" || intent === "kedi")) intent = "sor";
    }
    const passage = retrieve(clean);
    const fallbackLabel = passage && !passage.weak ? passage.title : INTENTS[order[0].index].toUpperCase();
    return {
      intent, conf: hit.conf, margin, bone: bone.text, dropped: bone.dropped, bits,
      hidden: hit.hidden, scores: hit.scores, passage,
      label: INTENTS[order[0].index],
      topic: specialist ? specialist.label : command ? command.label : fallbackLabel,
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
    ctx.fillText(`katman ${INPUT} → ${HIDDEN} → ${INTENTS.length}   kayıp ${loss.toFixed(3)}   tur ${epochs}`, 8, 16);
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
    if (!clean) return "İstem boş. İnceleme için bir hedef veya belirti gir.";
    const hit = read || ask(clean);
    const specialist = engineeringResponse(clean);
    if (specialist) return specialist.answer;

    if (/(^|\s)(saat|saati)(\s|$)/.test(folded) || folded.includes("saat kac")) {
      const now = new Date().toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul", hour12: false });
      return "İstanbul saati " + now + " · Europe/Istanbul.";
    }
    if (hit.passage && !hit.passage.weak) {
      return hit.passage.title + "\n" + hit.passage.body;
    }
    if (hit.intent === "hava") {
      return "Hava verisi üstteki İstanbul panelinden gelir. İstek anındaki değer panelde varsa onu kullan; veri akışı yoksa eski bir değeri canlıymış gibi sunma.";
    }
    if (hit.intent === "yardim") {
      return [
        "Tigerk / Engineering Reasoning Layer",
        "API sözleşmesi · code review · root-cause triage · test stratejisi · performans · güvenlik sınırları · sistem tasarımı.",
        "Örnek istem: API retry semantiğini idempotency, concurrency ve failure response açısından incele.",
        "Çıktı: bulgu → etki → doğrulama → düzeltme."
      ].join("\n");
    }
    if (hit.passage && hit.passage.weak) {
      return "Yakın kayıt: " + hit.passage.title + ". " + hit.passage.body + "\nBu eşleşme sorunun tamamını doğrulamıyor; hedefi veya ilgili kod parçasını daralt.";
    }
    return [
      "REQUEST TRIAGE / CONTEXT REQUIRED",
      "İsteği bir inceleme hedefiyle eşleştiremedim. Teknik bağlamı tek bir iz üzerinden daralt:",
      "• Beklenen davranış ve gerçek çıktı",
      "• İlgili fonksiyon, diff veya stack trace",
      "• Runtime / sürüm ve değişmeyen kısıtlar",
      "Sonuç biçimi: hipotezler, risk sırası, doğrulama deneyi ve minimum düzeltme."
    ].join("\n");
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
      meta.textContent = `${read.topic || "ENGINEERING TRIAGE"} · LOCAL ROUTER · SESSION ${net.epochs}`;
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
    if (waiting) waiting.textContent = "ENGINEERING SESSION / READY. Bir sözleşme, hata izi veya tasarım kararıyla başla.";
    draw(document.getElementById("tigerk-net"), null);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindAsk);
  else bindAsk();
})();

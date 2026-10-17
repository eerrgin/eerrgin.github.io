(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const safeText = (value) => typeof value === "string" ? value : "";
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  // Footer year and Istanbul clock.
  if ($("year")) $("year").textContent = String(new Date().getFullYear());
  const tick = () => {
    const clock = $("clock");
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }).format(new Date());
  };
  tick();
  window.setInterval(tick, 1000);

  // Weather is optional; the page remains usable if the service is unavailable.
  const weatherNames = {0:"açık",1:"açık",2:"parçalı",3:"kapalı",45:"sis",48:"sis",51:"çisenti",53:"çisenti",55:"çisenti",61:"yağmur",63:"yağmur",65:"sağanak",71:"kar",73:"kar",75:"tipi",80:"sağanak",81:"sağanak",82:"sağanak",95:"gök gürültüsü"};
  fetch("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul")
    .then((r) => { if (!r.ok) throw new Error("weather"); return r.json(); })
    .then((data) => {
      const current = data?.current;
      if (current && typeof current.temperature_2m === "number" && $("weather")) {
        $("weather").textContent = `${Math.round(current.temperature_2m)}° ${weatherNames[current.weather_code] || "istanbul"}`;
      }
    }).catch(() => {});

  // CRT portrait/name glitch, disabled for reduced-motion users.
  if (!reduceMotion && $("portrait") && $("ghost") && $("mast")) {
    const frame = $("portrait"), ghost = $("ghost"), mast = $("mast");
    const glitch = () => {
      const roll = Math.random();
      const kind = roll < .28 ? "jitter" : roll < .48 ? "shear" : roll < .7 ? "slice" : roll < .86 ? "scan" : "rgb";
      frame.dataset.fx = kind;
      if (kind === "slice") {
        const y = 8 + Math.random() * 72, h = 7 + Math.random() * 18, dir = Math.random() > .5 ? 1 : -1;
        ghost.style.clipPath = `inset(${y}% 0 ${Math.max(0, 100-y-h)}% 0)`;
        ghost.style.transform = `translateX(${dir * (10 + Math.random() * 14)}px)`; ghost.style.opacity = "1";
      } else if (kind === "rgb") {
        ghost.style.clipPath = "inset(0)"; ghost.style.transform = `translate(${Math.random() > .5 ? 6 : -6}px, 0)`; ghost.style.opacity = ".85";
      } else { ghost.style.opacity = "0"; ghost.style.transform = "none"; ghost.style.clipPath = "none"; }
      window.setTimeout(() => { if (frame.dataset.fx === kind) frame.dataset.fx = ""; ghost.style.opacity = "0"; }, kind === "scan" ? 520 : 190);
      window.setTimeout(glitch, 2400 + Math.random() * 5600);
    };
    window.setTimeout(glitch, 900);
    const nameTick = () => {
      mast.dataset.fx = Math.random() > .45 ? "jitter" : "shift";
      window.setTimeout(() => { mast.dataset.fx = ""; }, 170);
      window.setTimeout(nameTick, 4200 + Math.random() * 7000);
    };
    window.setTimeout(nameTick, 1800);
  }

  // Tape player: no forced autoplay; users control playback explicitly.
  const audio = $("audio"), tape = $("tape"), tapeBtn = $("tapeBtn"), tapeState = $("tapeState"), tapeHint = $("tapeHint"), led = $("led");
  if (audio && tape && tapeBtn && tapeState && led) {
    audio.volume = .55;
    const paintTape = (on, blocked = false) => {
      tapeBtn.setAttribute("aria-pressed", on ? "true" : "false");
      led.classList.toggle("hot", on);
      tapeState.textContent = on ? "kapat" : blocked ? "bas" : "aç";
      if (tapeHint) tapeHint.hidden = !(blocked && !on);
    };
    tapeBtn.addEventListener("click", async () => {
      if (audio.paused) {
        try { await audio.play(); paintTape(true); }
        catch { paintTape(false, true); }
      } else { audio.pause(); paintTape(false); }
    });
    audio.addEventListener("ended", () => paintTape(false));
  }

  // The local archive is the primary source: it works offline and is never copied from third-party sites.
  const localNotes = [
    ["ilk pakete inanma.", "bazen ilk paket tek dürüst olandır."],
    ["log yalan söylemez.", "log, onu yazan kadar dürüsttür."],
    ["eksik başlık deliktir.", "eksik başlık sadece bir sorudur."],
    ["yerelde çalışıyorsa bitti.", "yerelde çalışması hiçbir şeyi kanıtlamaz."],
    ["gizlediğin şey sızar.", "açıkta bıraktığın şey de kaybolur."],
    ["otomasyon tembelliktir.", "elle yapmak da tembellik. sadece daha yavaş."],
    ["okumadan çalıştırma.", "okuyarak da kandırılırsın. sadece daha geç."],
    ["araç az olsun.", "araç yoksa her şeyi baştan yazarsın. o da bir hastalık."],
    ["sessiz kod temiz koddur.", "sessiz kod, bağırması gereken yerde susandır."],
    ["yorum satırı yalandır.", "yorumsuz kod da bir tür kibirdir."],
    ["test varsa güvendesindir.", "test, senin aklına gelen hatayı arar."],
    ["versiyon numarası ciddiyet.", "versiyon numarası da cümledir. çoğu boş."],
    ["kopyalamak öğrenmektir.", "açıklayamadığın kopya henüz sende değildir."],
    ["acele iz bırakır.", "iz de bir veridir. silindi sanılan yerde durur."],
    ["uzun parola yeter.", "repoya yapışmış uzun parola kısadır."],
    ["ölçülmeyen şey yok olur.", "yok olmaz. sadece sen görmezsin."],
    ["her şey kaydedilmez.", "kaydedilen her şey de hatırlanmaz."],
    ["çalışıyor.", "hangi koşulda, ne kadar süreyle ve kimin için?"],
    ["bir hata daha.", "bir varsayım daha sınanmış oldu."],
    ["daha hızlı.", "önce doğru yere gidip gitmediğini kontrol et."],
    ["güven varsayılan değildir.", "bir gerekçesi ve sınırı olmalıdır."],
    ["her şeyi otomatikleştir.", "önce ne yaptığını anladığından emin ol."],
    ["arşiv dolu.", "aradığın şeyin orada olduğuna dair kanıt yok."],
    ["sistem sessiz.", "bu, her şeyin yolunda olduğu anlamına gelmez."]
  ];
  let archive = [];
  let previousClipIds = [];
  let previousPairIndex = -1;
  const categories = ["teknoloji", "internet-kulturu", "bilim", "felsefe", "edebiyat", "mini-deneme"];

  const chooseNew = (items, previous, limit) => {
    if (!items.length) return null;
    let pool = items.filter((item) => !previous.includes(item.id));
    if (!pool.length) { previous.splice(0, previous.length); pool = items; }
    const selected = pick(pool);
    previous.push(selected.id);
    while (previous.length > limit) previous.shift();
    return selected;
  };
  const categoryName = (category) => ({"internet-kulturu":"internet kültürü","mini-deneme":"mini deneme"}[category] || category || "yerel arşiv");
  const renderClip = (card, pending = false) => {
    const clip = $("clip"), file = $("clipFile"), body = $("clipBody");
    if (!clip || !file || !body) return;
    clip.classList.toggle("pending", pending);
    file.textContent = card?.file || "kirpintilar/icerik.json";
    body.replaceChildren();
    if (!card) {
      const p = document.createElement("p"); p.className = "waiting"; p.textContent = "arşiv açılıyor"; body.append(p); return;
    }
    const title = document.createElement("h3"); title.className = "clip-title"; title.textContent = safeText(card.title); body.append(title);
    const p = document.createElement("p"); p.className = "clip-text"; p.textContent = safeText(card.text); body.append(p);
    const foot = document.createElement("div"); foot.className = "clip-foot";
    const meta = document.createElement("span"); meta.textContent = `${categoryName(card.category)} · özgün metin`; foot.append(meta);
    body.append(foot);
  };
  const showPair = () => {
    const split = $("split"), wait = $("noteWait");
    if (!split || !wait) return;
    wait.hidden = true; split.hidden = false;
    let idx = Math.floor(Math.random() * localNotes.length);
    if (localNotes.length > 1 && idx === previousPairIndex) idx = (idx + 1 + Math.floor(Math.random() * (localNotes.length - 1))) % localNotes.length;
    previousPairIndex = idx;
    const pair = localNotes[idx];
    const date = new Intl.DateTimeFormat("tr-TR", {timeZone:"Europe/Istanbul", day:"2-digit", month:"short"}).format(new Date());
    const clock = new Intl.DateTimeFormat("tr-TR", {timeZone:"Europe/Istanbul", hour:"2-digit", minute:"2-digit", hourCycle:"h23"}).format(new Date());
    if ($("stampA")) $("stampA").textContent = `${date} · ${clock}`;
    if ($("stampB")) $("stampB").textContent = `${date} · ${clock}`;
    if ($("slipA")) $("slipA").textContent = pair[0];
    if ($("slipB")) $("slipB").textContent = pair[1];
  };
  const loadArchive = async () => {
    try {
      const response = await fetch("kirpintilar/icerik.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("archive unavailable");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("invalid archive");
      archive = data.filter((item) => item && typeof item.id === "string" && typeof item.title === "string" && typeof item.text === "string" && item.license === "original");
    } catch {
      // Keep the site functional when JSON fails to load or the page is opened as file://.
      archive = [
        {id:"fallback-1",category:"teknoloji",title:"Küçük onarım",text:"Bir şeyi düzeltmek her zaman yeniden yapmak değildir. Bazen doğru yerdeki tek satır, bütün davranışı değiştirir."},
        {id:"fallback-2",category:"internet-kulturu",title:"Bağlantısı kırık bir hafıza",text:"Bazen sayfa durur; onu anlamlı kılan bağlantılar ortadan kalkmıştır."},
        {id:"fallback-3",category:"felsefe",title:"Sessizlik",text:"Sessizlik bazen düşüncenin kendini duyabildiği aralıktır."}
      ];
    }
    if (!archive.length) archive = [{id:"fallback-4",category:"mini-deneme",title:"Arşiv boş",text:"kirpintilar/icerik.json dosyasına özgün içerik ekleyebilirsin."}];
    nextClip();
  };
  function nextClip() {
    const card = chooseNew(archive, previousClipIds, 15);
    if (!card) return;
    renderClip({...card, file:"kirpintilar/icerik.json"});
    const clip = $("clip");
    if (clip) clip.dataset.category = card.category || "";
  }
  const reroll = $("reroll");
  if (reroll) reroll.addEventListener("click", () => { showPair(); nextClip(); });
  showPair();
  loadArchive();
})();

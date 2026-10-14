(() => {
  const $ = (id) => document.getElementById(id);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("year").textContent = String(new Date().getFullYear());

  const weatherNames = {
    0: "açık", 1: "açık", 2: "parçalı", 3: "kapalı",
    45: "sis", 48: "sis", 51: "çisenti", 53: "çisenti", 55: "çisenti",
    61: "yağmur", 63: "yağmur", 65: "sağanak", 71: "kar", 73: "kar", 75: "tipi",
    80: "sağanak", 81: "sağanak", 82: "sağanak", 95: "gök gürültüsü",
  };

  const clockEl = $("clock");
  const tick = () => {
    clockEl.textContent = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(new Date());
  };
  tick();
  window.setInterval(tick, 1000);

  fetch("https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul")
    .then((res) => {
      if (!res.ok) throw new Error("weather");
      return res.json();
    })
    .then((data) => {
      const current = data && data.current;
      if (!current || typeof current.temperature_2m !== "number") return;
      const label = weatherNames[current.weather_code] || "istanbul";
      $("weather").textContent = `${Math.round(current.temperature_2m)}° ${label}`;
    })
    .catch(() => {});

  if (!reduce) {
    const frame = $("portrait");
    const ghost = $("ghost");
    let clearFx = 0;
    const glitch = () => {
      const roll = Math.random();
      const kind = roll < 0.28 ? "jitter" : roll < 0.48 ? "shear" : roll < 0.7 ? "slice" : roll < 0.86 ? "scan" : "rgb";
      frame.dataset.fx = kind;
      if (kind === "slice") {
        const y = 8 + Math.random() * 72;
        const h = 7 + Math.random() * 18;
        const dir = Math.random() > 0.5 ? 1 : -1;
        ghost.style.clipPath = `inset(${y}% 0 ${Math.max(0, 100 - y - h)}% 0)`;
        ghost.style.transform = `translateX(${dir * (10 + Math.random() * 14)}px)`;
        ghost.style.opacity = "1";
      } else if (kind === "rgb") {
        ghost.style.clipPath = "inset(0)";
        ghost.style.transform = `translate(${Math.random() > 0.5 ? 6 : -6}px, 0)`;
        ghost.style.opacity = "0.85";
      } else {
        ghost.style.opacity = "0";
        ghost.style.transform = "none";
        ghost.style.clipPath = "none";
      }
      window.clearTimeout(clearFx);
      clearFx = window.setTimeout(() => {
        if (frame.dataset.fx === kind) frame.dataset.fx = "";
        ghost.style.opacity = "0";
      }, kind === "scan" ? 520 : 190);
      window.setTimeout(glitch, 2400 + Math.random() * 5600);
    };
    window.setTimeout(glitch, 900);

    const mast = $("mast");
    let clearName = 0;
    const nameTick = () => {
      mast.dataset.fx = Math.random() > 0.45 ? "jitter" : "shift";
      window.clearTimeout(clearName);
      clearName = window.setTimeout(() => {
        mast.dataset.fx = "";
      }, 170);
      window.setTimeout(nameTick, 4200 + Math.random() * 7000);
    };
    window.setTimeout(nameTick, 1800);
  }

  const audio = $("audio");
  const tape = $("tape");
  const tapeBtn = $("tapeBtn");
  const tapeState = $("tapeState");
  const tapeHint = $("tapeHint");
  const led = $("led");
  let stopped = false;
  audio.volume = 0.55;

  const paintTape = (on, blocked) => {
    tapeBtn.setAttribute("aria-pressed", on ? "true" : "false");
    led.classList.toggle("hot", on);
    tapeState.textContent = on ? "kapat" : blocked ? "bas" : "aç";
    tapeHint.hidden = !(blocked && !on);
  };

  const startAudio = () => {
    if (stopped || !audio.paused) return;
    audio.play().then(() => paintTape(true, false)).catch(() => paintTape(false, true));
  };

  audio.play().then(() => paintTape(true, false)).catch(() => {
    paintTape(false, true);
    const onGesture = (event) => {
      if (event.target instanceof Node && tape.contains(event.target)) return;
      startAudio();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
  });

  tapeBtn.addEventListener("click", () => {
    if (audio.paused) {
      stopped = false;
      audio.play().then(() => paintTape(true, false)).catch(() => paintTape(false, true));
    } else {
      stopped = true;
      audio.pause();
      paintTape(false, false);
    }
  });

  const slips = [
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
  ];

  const benchNotes = [
    { title: "karartılmış eşleşme", text: "Bir sırrı ekrana basmamak, onu yok saymak değildir. Satır durur. Gerisini sen okursun.", href: "https://github.com/eerrgin/VeilCheck" },
    { title: "tek istek", text: "Bir başlık eksikse dünya yanmaz. Yine de o satır orada olmadığı için bir soru durur.", href: "https://github.com/eerrgin/GreySignal" },
    { title: "izin yazılmadan", text: "Keşif, kapısı açık sandığın her yere girmek değildir. Yazılı olmayan yerde araç da susar.", href: "https://github.com/eerrgin/ReconX-Web-Reconnaissance-Toolkit-" },
    { title: "sorgu metni", text: "Girdi cümlenin içine karışırsa cümle artık senin cümlen değildir. Parametre ayrı durur.", href: "https://github.com/eerrgin/local-sqli-lab" },
    { title: "tezgahta kalan", text: "Hesap makinesi, parçacık imleci, boş klasör. Duruyorlar. Bu sayfaya çıkmadılar.", href: "https://github.com/eerrgin" },
    { title: "saat istanbul", text: "Buradaki saat yerelde. Dışarı susarsa not susmaz. Yenile, başka bir şey düşmüş olur.", href: "https://github.com/eerrgin" },
  ];

  const clockPair = (roll) => {
    const h1 = Math.abs(roll) % 24;
    const m1 = Math.abs(roll * 3) % 60;
    let h2 = Math.abs(roll * 5 + 7) % 24;
    const m2 = Math.abs(roll * 11) % 60;
    if (h1 === h2 && m1 === m2) h2 = (h2 + 5) % 24;
    const fmt = (h, m) => `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
    return [fmt(h1, m1), fmt(h2, m2)];
  };

  const localCard = (roll) => {
    const note = benchNotes[Math.abs(roll) % benchNotes.length];
    return { file: "notlar/yerel.txt", title: note.title, text: note.text, href: note.href, meta: "yerel not · dışarı suskun" };
  };

  const isObj = (v) => typeof v === "object" && v !== null;

  const getJson = async (url, signal) => {
    const res = await fetch(url, { signal, headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  };

  const loaders = {
    async headline(signal) {
      const raw = await getJson("https://hacker-news.firebaseio.com/v0/topstories.json", signal);
      if (!Array.isArray(raw) || !raw.length) return null;
      const ids = raw.filter((id) => typeof id === "number").slice(0, 30);
      const id = ids[Math.floor(Math.random() * ids.length)];
      if (!id) return null;
      const item = await getJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, signal);
      if (!isObj(item) || typeof item.title !== "string") return null;
      return {
        file: "kirpintilar/baslik.txt",
        title: item.title,
        text: "masaya ilişti. durduğu sürece durur.",
        href: typeof item.url === "string" ? item.url : `https://news.ycombinator.com/item?id=${id}`,
        discuss: `https://news.ycombinator.com/item?id=${id}`,
        meta: `ycombinator · skor ${item.score ?? "—"} · yorum ${item.descendants ?? "—"}`,
      };
    },
    async picture(signal) {
      const data = await getJson("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true", signal);
      if (!isObj(data) || data.media_type !== "image" || typeof data.title !== "string" || typeof data.url !== "string") return null;
      const explanation = typeof data.explanation === "string" ? data.explanation : "";
      return {
        file: "kirpintilar/kare.jpg",
        title: data.title,
        text: explanation.length > 320 ? `${explanation.slice(0, 317).trim()}…` : explanation,
        href: "https://apod.nasa.gov/apod/",
        image: data.url,
        meta: "nasa · bugünün karesi",
      };
    },
    async trace(signal) {
      const raw = await getJson("https://api.github.com/users/eerrgin/events/public?per_page=8", signal);
      if (!Array.isArray(raw) || !raw.length) return null;
      const events = raw.filter(isObj);
      const ev = events[Math.floor(Math.random() * events.length)];
      if (!ev) return null;
      const repo = isObj(ev.repo) && typeof ev.repo.name === "string" ? ev.repo.name : "eerrgin";
      const type = typeof ev.type === "string" ? ev.type : "Event";
      let title = repo;
      let text = "depoda bir hareket.";
      if (type === "PushEvent" && isObj(ev.payload) && Array.isArray(ev.payload.commits)) {
        const first = ev.payload.commits.find(isObj);
        const msg = first && typeof first.message === "string" ? first.message.split("\n")[0] : "";
        title = msg || repo;
        text = `${ev.payload.commits.length} kayıt. ${repo}`;
      } else if (type === "CreateEvent") {
        title = `${repo} içinde yeni bir şey`;
        text = "açılmış. detay depoda.";
      } else if (type === "WatchEvent") {
        title = repo;
        text = "biri bakmış. ya da ben bakmışımdır.";
      } else if (type === "IssuesEvent" || type === "IssueCommentEvent") {
        title = repo;
        text = "bir mesele açılmış ya da yazılmış.";
      } else {
        text = type.replace("Event", "").toLowerCase();
      }
      return { file: "kirpintilar/depo.txt", title, text, href: `https://github.com/${repo}`, meta: `github · ${repo}` };
    },
    async page(signal) {
      const res = await fetch("https://tr.wikipedia.org/api/rest_v1/page/random/summary", {
        signal,
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (!isObj(data) || typeof data.title !== "string") return null;
      const extract = typeof data.extract === "string" ? data.extract : "";
      let href = "https://tr.wikipedia.org/";
      if (isObj(data.content_urls) && isObj(data.content_urls.desktop) && typeof data.content_urls.desktop.page === "string") {
        href = data.content_urls.desktop.page;
      }
      const card = {
        file: "kirpintilar/ansiklopedi.txt",
        title: data.title,
        text: (extract.length > 360 ? `${extract.slice(0, 357).trim()}…` : extract) || "kısa bir madde. gerisi bağlantıda.",
        href,
        meta: "vikipedi · rastgele madde",
      };
      if (isObj(data.thumbnail) && typeof data.thumbnail.source === "string") card.image = data.thumbnail.source;
      return card;
    },
  };

  const kinds = ["headline", "picture", "trace", "page"];

  const loadDrift = async (roll, signal) => {
    const start = Math.abs(roll) % kinds.length;
    const order = kinds.slice(start).concat(kinds.slice(0, start));
    for (const kind of order) {
      if (signal.aborted) return localCard(roll);
      try {
        const card = await loaders[kind](signal);
        if (signal.aborted) return localCard(roll);
        if (card) return card;
      } catch {
        if (signal.aborted) return localCard(roll);
      }
    }
    return localCard(roll);
  };

  const renderClip = (card, pending) => {
    const clip = $("clip");
    clip.classList.toggle("pending", pending);
    $("clipFile").textContent = card ? card.file : "kirpintilar/——";
    const body = $("clipBody");
    if (!card) {
      body.replaceChildren(Object.assign(document.createElement("p"), { className: "waiting", textContent: "hat çekiliyor" }));
      return;
    }
    body.replaceChildren();
    if (card.image) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = card.image;
      img.addEventListener("error", () => img.remove());
      body.append(img);
    }
    const title = document.createElement("h3");
    title.className = "clip-title";
    title.textContent = card.title;
    body.append(title);
    if (card.text) {
      const text = document.createElement("p");
      text.className = "clip-text";
      text.textContent = card.text;
      body.append(text);
    }
    const foot = document.createElement("div");
    foot.className = "clip-foot";
    const meta = document.createElement("span");
    meta.textContent = card.meta;
    const links = document.createElement("span");
    links.className = "clip-links";
    const source = document.createElement("a");
    source.href = card.href;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = "kaynağa git";
    links.append(source);
    if (card.discuss) {
      const discuss = document.createElement("a");
      discuss.href = card.discuss;
      discuss.target = "_blank";
      discuss.rel = "noreferrer";
      discuss.textContent = "yorum";
      links.append(discuss);
    }
    foot.append(meta, links);
    body.append(foot);
  };

  const showNotes = (roll) => {
    if (roll == null) {
      $("split").hidden = true;
      $("noteWait").hidden = false;
      return;
    }
    $("noteWait").hidden = true;
    $("split").hidden = false;
    const pair = slips[Math.abs(roll) % slips.length];
    const times = clockPair(roll);
    const date = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "short",
    }).format(new Date());
    $("stampA").textContent = `${date} · ${times[0]}`;
    $("stampB").textContent = `${date} · ${times[1]}`;
    $("slipA").textContent = pair[0];
    $("slipB").textContent = pair[1];
  };

  let roll = null;
  let driftGen = 0;
  let currentAc = null;

  const pull = (next) => {
    roll = next;
    showNotes(roll);
    if (currentAc) currentAc.abort();
    const ac = new AbortController();
    currentAc = ac;
    const gen = ++driftGen;
    const timer = window.setTimeout(() => ac.abort(), 9000);
    renderClip(null, true);
    loadDrift(roll, ac.signal).then((card) => {
      window.clearTimeout(timer);
      if (gen !== driftGen) return;
      renderClip(card, false);
    });
  };

  $("reroll").addEventListener("click", () => {
    pull((roll ?? 0) + 1 + Math.floor(Math.random() * 40));
  });

  pull(1 + Math.floor(Math.random() * 997));
})();

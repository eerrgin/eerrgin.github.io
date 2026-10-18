(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  if (touch) document.body.classList.add('touch-device');

  const safeStore = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  };
  const dateLabel = (date) => new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  const timeLabel = () => new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date());

  // Clock is local; it does not need a remote clock service.
  const clock = $('clock');
  const tickClock = () => { if (clock) clock.textContent = timeLabel(); };
  tickClock();
  window.setInterval(tickClock, 1000);
  if ($('year')) $('year').textContent = String(new Date().getFullYear());
  if ($('heroDate')) $('heroDate').textContent = dateLabel(new Date());

  let toastTimer;
  const toast = (message) => {
    const node = $('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove('show'), 2600);
    if (touch && navigator.vibrate) { try { navigator.vibrate(10); } catch (_) {} }
  };

  // Scroll progress and subtle pointer-based hardware parallax, disabled for reduced motion/touch.
  const progress = $('readProgress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
  if (!touch && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('js-pointer');
    const machine = $('heroMachine');
    window.addEventListener('pointermove', (event) => {
      document.documentElement.style.setProperty('--px', `${event.clientX}px`);
      document.documentElement.style.setProperty('--py', `${event.clientY}px`);
      if (!machine) return;
      const bounds = machine.getBoundingClientRect();
      if (event.clientX < bounds.left - 100 || event.clientX > bounds.right + 100 || event.clientY < bounds.top - 100 || event.clientY > bounds.bottom + 100) {
        machine.style.transform = '';
        return;
      }
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      machine.style.transform = `perspective(1000px) rotateY(${x * 3.2}deg) rotateX(${-y * 3.2}deg) translateY(-2px)`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (machine) machine.style.transform = ''; });
  }

  const weatherNames = { 0: 'açık', 1: 'çoğunlukla açık', 2: 'parçalı', 3: 'kapalı', 45: 'sis', 48: 'sis', 51: 'çisenti', 53: 'çisenti', 55: 'çisenti', 61: 'yağmur', 63: 'yağmur', 65: 'sağanak', 71: 'kar', 73: 'kar', 75: 'yoğun kar', 80: 'sağanak', 81: 'sağanak', 82: 'kuvvetli sağanak', 95: 'gök gürültüsü', 96: 'dolu ihtimali', 99: 'kuvvetli fırtına' };
  async function fetchJson(url, timeoutMs = 9000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { window.clearTimeout(timeout); }
  }
  async function loadWeather(force = false) {
    const node = $('weather');
    if (!node) return;
    const cache = safeStore.get('greyfield-weather-v2');
    if (!force && cache && Date.now() - cache.at < 20 * 60 * 1000) {
      node.textContent = `İSTANBUL / ${cache.label}`;
      return;
    }
    try {
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul';
      const data = await fetchJson(url);
      const current = data && data.current;
      if (!current || typeof current.temperature_2m !== 'number') throw new Error('weather payload');
      const label = `${Math.round(current.temperature_2m)}° ${weatherNames[current.weather_code] || 'hava'}`;
      node.textContent = `İSTANBUL / ${label}`;
      safeStore.set('greyfield-weather-v2', { at: Date.now(), label });
    } catch (_) {
      const old = safeStore.get('greyfield-weather-v2');
      node.textContent = old && old.label ? `İSTANBUL / ${old.label} · ÖNBELLEK` : 'İSTANBUL / ÇEVRİMDIŞI';
    }
  }
  loadWeather();
  window.setInterval(() => { if (document.visibilityState === 'visible') loadWeather(); }, 30 * 60 * 1000);

  // Public repository radar: one API call, with a small local cache and a static fallback.
  async function loadRepos(force = false) {
    const list = $('repoList');
    if (!list) return;
    const cache = safeStore.get('greyfield-repos-v2');
    if (!force && cache && Array.isArray(cache.items) && Date.now() - cache.at < 5 * 60 * 1000) {
      renderRepos(cache.items);
      return;
    }
    list.replaceChildren();
    const loading = document.createElement('div'); loading.className = 'skeleton-line';
    const loading2 = document.createElement('div'); loading2.className = 'skeleton-line';
    const loading3 = document.createElement('div'); loading3.className = 'skeleton-line';
    list.append(loading, loading2, loading3);
    try {
      const repos = await fetchJson('https://api.github.com/users/eerrgin/repos?sort=updated&per_page=30');
      if (!Array.isArray(repos)) throw new Error('repos payload');
      const items = repos.filter(repo => !repo.fork && !repo.archived).slice(0, 6).map(repo => ({
        name: String(repo.name || 'untitled'), url: String(repo.html_url || 'https://github.com/eerrgin'),
        description: String(repo.description || 'Açıklama bırakılmamış.'), language: String(repo.language || 'misc'),
        updated: String(repo.updated_at || '')
      }));
      if (!items.length) throw new Error('empty repos');
      safeStore.set('greyfield-repos-v2', { at: Date.now(), items });
      renderRepos(items);
    } catch (_) {
      list.replaceChildren();
      const note = document.createElement('p'); note.className = 'quiet-text';
      note.textContent = 'GitHub yanıt vermedi. Sabit proje bağlantıları çalışıyor; birkaç dakika sonra tekrar deneyebilirsin.';
      list.append(note);
    }
  }
  function renderRepos(items) {
    const list = $('repoList');
    if (!list) return;
    list.replaceChildren();
    items.forEach(item => {
      const link = document.createElement('a'); link.className = 'repo-item'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const name = document.createElement('strong'); name.textContent = item.name;
      const meta = document.createElement('span');
      const stamp = item.updated ? new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.updated)) : 'tarih yok';
      meta.textContent = `${item.language} · güncellendi ${stamp}`;
      link.append(name, meta); link.title = item.description; list.append(link);
    });
  }
  $('refreshRepos')?.addEventListener('click', () => { loadRepos(true); toast('Depo sinyali yeniden sorgulanıyor.'); });
  loadRepos();
  window.setInterval(() => { if (document.visibilityState === 'visible') loadRepos(); }, 10 * 60 * 1000);

  // Hacker News official Firebase API. Only short headlines + source links are shown.
  const hnCacheKey = 'greyfield-hn-v2';
  async function loadHackerNews(force = false) {
    const list = $('hnList');
    if (!list) return;
    const cache = safeStore.get(hnCacheKey);
    if (!force && cache && Array.isArray(cache.items) && Date.now() - cache.at < 4 * 60 * 1000) {
      renderHn(cache.items); return;
    }
    list.replaceChildren();
    for (let i = 0; i < 4; i++) { const skeleton = document.createElement('div'); skeleton.className = 'skeleton-line'; list.append(skeleton); }
    try {
      const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!Array.isArray(ids)) throw new Error('hn ids');
      const picked = ids.slice(0, 7);
      const stories = await Promise.all(picked.map(id => fetchJson(`https://hacker-news.firebaseio.com/v0/item/${Number(id)}.json`).catch(() => null)));
      const items = stories.filter(s => s && typeof s.title === 'string').map(s => ({
        title: s.title.slice(0, 240), url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        score: Number(s.score || 0), comments: Number(s.descendants || 0), id: Number(s.id)
      }));
      if (!items.length) throw new Error('hn empty');
      safeStore.set(hnCacheKey, { at: Date.now(), items });
      renderHn(items);
      if ($('hnUpdated')) $('hnUpdated').textContent = `son kontrol ${timeLabel()}`;
    } catch (_) {
      if (cache && Array.isArray(cache.items)) {
        renderHn(cache.items);
        if ($('hnUpdated')) $('hnUpdated').textContent = 'önbellek · bağlantı yok';
      } else {
        list.replaceChildren();
        const note = document.createElement('p'); note.className = 'quiet-text'; note.textContent = 'Hacker News şu an yanıt vermiyor. Bu bölüm dışında kalan her şey çalışıyor.'; list.append(note);
        if ($('hnUpdated')) $('hnUpdated').textContent = 'çevrimdışı';
      }
    }
  }
  function renderHn(items) {
    const list = $('hnList'); if (!list) return;
    list.replaceChildren();
    items.slice(0, 7).forEach((item, index) => {
      const a = document.createElement('a'); a.className = 'headline-item'; a.href = item.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const rank = document.createElement('span'); rank.className = 'headline-rank'; rank.textContent = String(index + 1).padStart(2, '0');
      const wrap = document.createElement('span');
      const title = document.createElement('span'); title.className = 'headline-title'; title.textContent = item.title;
      const meta = document.createElement('span'); meta.className = 'headline-meta'; meta.textContent = `${item.score} puan · ${item.comments} yorum · HN #${item.id}`;
      wrap.append(title, meta); a.append(rank, wrap); list.append(a);
    });
  }
  $('refreshHn')?.addEventListener('click', () => { loadHackerNews(true); toast('Hacker News başlıkları yeniden alınıyor.'); });
  loadHackerNews();
  window.setInterval(() => { if (document.visibilityState === 'visible') loadHackerNews(); }, 5 * 60 * 1000);

  // Random Wikipedia page: short excerpt is attributed and linked to the article + edit history.
  let wikiRun = 0;
  async function loadWiki(force = false) {
    const card = $('wikiCard');
    const loader = $('wikiLoader');
    if (!card) return;
    const cache = safeStore.get('greyfield-wiki-v2');
    if (!force && cache && cache.item && Date.now() - cache.at < 30 * 60 * 1000) {
      renderWiki(cache.item); return;
    }
    const run = ++wikiRun;
    if (loader) loader.textContent = 'SCAN…';
    card.replaceChildren();
    const waiting = document.createElement('p'); waiting.textContent = 'Rastgele madde aranıyor. Wikimedia yanıtı bekleniyor…'; card.append(waiting);
    try {
      const data = await fetchJson('https://tr.wikipedia.org/api/rest_v1/page/random/summary', 10000);
      if (run !== wikiRun) return;
      if (!data || !data.title || !data.content_urls || !data.content_urls.desktop) throw new Error('wiki payload');
      const item = {
        title: String(data.title), description: String(data.description || ''),
        extract: String(data.extract || '').slice(0, 520),
        page: String(data.content_urls.desktop.page),
        titleEncoded: encodeURIComponent(String(data.title).replace(/ /g, '_'))
      };
      safeStore.set('greyfield-wiki-v2', { at: Date.now(), item });
      renderWiki(item);
    } catch (_) {
      if (run !== wikiRun) return;
      card.replaceChildren();
      const h = document.createElement('h4'); h.textContent = 'Arşiv kapalı değil; bağlantı yok.';
      const p = document.createElement('p'); p.textContent = 'Wikipedia API yanıt vermedi. Rastgele maddeyi doğrudan açabilirsin.';
      const actions = document.createElement('div'); actions.className = 'wiki-actions';
      const a = document.createElement('a'); a.href = 'https://tr.wikipedia.org/wiki/%C3%96zel:Rastgele'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'rastgele maddeyi aç ↗';
      actions.append(a); card.append(h, p, actions);
    } finally { if (run === wikiRun && loader) loader.textContent = 'READY'; }
  }
  function renderWiki(item) {
    const card = $('wikiCard'); if (!card) return;
    card.replaceChildren();
    const h = document.createElement('h4'); h.textContent = item.title;
    const p = document.createElement('p'); p.textContent = item.extract || item.description || 'Bu madde kısa bir özet sunmuyor; asıl sayfayı aç.';
    const actions = document.createElement('div'); actions.className = 'wiki-actions';
    const article = document.createElement('a'); article.href = item.page; article.target = '_blank'; article.rel = 'noopener noreferrer'; article.textContent = 'maddeyi oku ↗';
    const history = document.createElement('a'); history.href = `https://tr.wikipedia.org/w/index.php?title=${item.titleEncoded}&action=history`; history.target = '_blank'; history.rel = 'noopener noreferrer'; history.textContent = 'katkı geçmişi ↗';
    actions.append(article, history); card.append(h, p, actions);
  }
  $('refreshWiki')?.addEventListener('click', () => { safeStore.set('greyfield-wiki-v2', null); loadWiki(true); toast('Yeni bir Wikipedia maddesi aranıyor.'); });
  loadWiki();
  window.setInterval(() => { if (document.visibilityState === 'visible') loadWiki(); }, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { loadWeather(); loadRepos(); loadHackerNews(); loadWiki(); } });

  // Locally authored archive fragments — no remote text feed.
  const snippets = [
    ['internet kültürü','Bağlantısı kırık bir hafıza','İnternetin kaybolan kısmı her zaman silinen sayfalar değildir. Bazen sayfa durur; onu anlamlı kılan bağlantılar ortadan kalkar.'],
    ['internet kültürü','404: hatırlanmıyor','Bir sayfa bulunamadığında yalnızca adres kaybolmaz. Bazen birinin yıllarca biriktirdiği küçük dünya da görünmez olur.'],
    ['internet kültürü','Eski web','Eski internetin güzelliği kusursuz olmasında değildi. Birinin bir şey öğrenip onu hemen dünyaya bırakabilmesindeydi.'],
    ['teknoloji','Log dosyası','Bir sistem olan biteni kaydeder, ama neden olduğunu her zaman açıklamaz. Hafıza da böyledir.'],
    ['teknoloji','Kenar durumu','Kodun karakteri çoğu zaman her şey yolundayken değil, kimsenin düşünmediği koşul ortaya çıktığında belli olur.'],
    ['teknoloji','Yedek','Yedeğin varlığı değil, geri yüklenebildiğinin denenmiş olması güven verir.'],
    ['teknoloji','Sessiz varsayım','En pahalı hata bazen yanlış kod değil, kimsenin yazmaya gerek görmediği bir varsayımdır.'],
    ['teknoloji','Yorum satırı','Kodun neden böyle olduğunu anlat. Ne yaptığını zaten satırlar gösteriyor; asıl kaybolan şey gerekçedir.'],
    ['bilim','Harita ve arazi','Model, dünyayı anlamak için kurulur. Modelin kendisini dünya sanmaya başladığımızda yanılırız.'],
    ['bilim','Belirsizlik','Belirsizlik bilgisizliğin başka adı değildir. Bazen ne bildiğimizi dürüstçe tarif etmenin tek yoludur.'],
    ['felsefe','Karar','Karar vermemek de bir seçimdir; yalnızca sonucunun sorumluluğu daha kolay görünmez olur.'],
    ['felsefe','Sessizlik','Sessizlik her zaman cevap değildir. Bazen sorunun henüz doğru kurulmadığını gösterir.'],
    ['mini deneme','Gece vardiyası','Şehir uyurken ekranın ışığı masaya düşüyor. Bir dosya açılıyor, kapanıyor. Dışarıda hiçbir şey değişmemiş gibi; içerideyse küçük bir karar verilmiş.'],
    ['mini deneme','Son kayıt','Klasörün adı “son” idi. İçinde “son2”, “son-gerçek” ve “bu-sefer-son” vardı. İnsan bazen bitiremediği şeyi dosya adına taşır.'],
    ['açık bilgi','Açık lisans','İnternette erişilebilen her metin serbestçe kopyalanamaz. Paylaşmadan önce lisansı, atıf şartını ve kullanım kısıtlarını kontrol et.'],
    ['açık bilgi','Kaynak göstermek','Kaynak göstermek yalnızca bir bağlantı bırakmak değildir. Okuyanın iddiayı kontrol edebilmesini sağlayacak kadar bilgi vermektir.'],
    ['internet kültürü','Sekmeler','Açık kalan sekmeler bazen yapılacak işleri değil, kapatmaya henüz hazır olmadığımız düşünceleri gösterir.'],
    ['teknoloji','Parametre','Girdiyi komutun içine karıştırma. Veriyi veri olarak tutmak, yalnızca düzen değil, güvenlik meselesidir.'],
    ['felsefe','Kontrol','Her şeyi kontrol etmeye çalışmak, hangi şeylerin kontrolümüzde olmadığını da sürekli hatırlatır.'],
    ['mini deneme','Eski cihaz','Açılmayan bilgisayarı atmadı. İçinde önemli bir şey olduğu için değil; bir zamanlar onunla bir şey öğrenmiş olduğu için.'],
    ['açık bilgi','Bilgi ve iddia','Etkileyici bir cümle, doğru bir bilgiyle aynı şey değildir. Gerçek iddiaları mümkün olduğunda güvenilir kaynaklarla doğrula.'],
    ['teknoloji','Hata mesajı','İyi bir hata mesajı yalnızca neyin bozulduğunu söylemez; bir sonraki adımı da görünür kılar.'],
    ['bilim','Ölçüm','Ölçmek, gerçeği bütünüyle yakalamak değildir. Hangi kısmı görebildiğimizi açıkça belirtmektir.'],
    ['internet kültürü','Çevrimdışı','Bağlantı kesildiğinde her şey durmaz. Bazı şeyler ancak dışarıdan gelen ses azaldığında duyulur.'],
    ['mini deneme','Masa','Masada yalnızca bir kablo, yarım bardak su ve açık bir not vardı. Dağınıklık gibi görünüyordu. Oysa her şey bir sonraki adımın yerini biliyordu.'],
    ['açık bilgi','Kopya değil, iz','Bir metni paylaşmak istiyorsan lisansını kontrol et. Uygun değilse kendi cümlelerinle özetle ve asıl kaynağa yönlendir.']
  ];
  const contradictions = [
    ['ilk pakete inanma.','bazen ilk paket tek dürüst olandır.'],
    ['log yalan söylemez.','log, onu yazan kadar dürüsttür.'],
    ['eksik başlık deliktir.','eksik başlık sadece bir sorudur.'],
    ['yerelde çalışıyorsa bitti.','yerelde çalışması hiçbir şeyi kanıtlamaz.'],
    ['gizlediğin şey sızar.','açıkta bıraktığın şey de kaybolur.'],
    ['otomasyon tembelliktir.','elle yapmak da tembellik; yalnızca daha yavaş.'],
    ['okumadan çalıştırma.','okuyarak da kandırılırsın; sadece daha geç.'],
    ['araç az olsun.','araç yoksa her şeyi baştan yazarsın.'],
    ['sessiz kod temiz koddur.','sessiz kod, bağırması gereken yerde susandır.'],
    ['test varsa güvendesin.','test, senin aklına gelen hatayı arar.'],
    ['uzun parola yeter.','repoya yapışmış uzun parola kısadır.'],
    ['kaynak vermek yeterlidir.','kaynağın doğru ve lisansın uygun olması da gerekir.'],
    ['internet unutmaz.','internet bazen yalnızca kırık bir bağlantıyı saklar.'],
    ['hız her şeydir.','yanlış yere gidiyorsan hız sadece kaybı artırır.'],
    ['sadelik kolaydır.','sadelik çoğu zaman fazlalığı ayıklama emeğidir.'],
    ['bitti diyebilirsin.','bazen yalnızca şimdilik durduğunu söylemek daha doğrudur.']
  ];
  let lastSnippet = -1, lastContradiction = -1;
  function randomIndex(length, previous) {
    if (length <= 1) return 0;
    let index = Math.floor(Math.random() * length);
    while (index === previous) index = Math.floor(Math.random() * length);
    return index;
  }
  function nextSnippet() {
    lastSnippet = randomIndex(snippets.length, lastSnippet);
    const item = snippets[lastSnippet];
    $('snippetCategory').textContent = item[0]; $('snippetTitle').textContent = item[1]; $('snippetText').textContent = item[2];
    $('snippetIndex').textContent = `FRAG-${String(lastSnippet + 1).padStart(3, '0')}`;
    $('snippetCounter').textContent = `${snippets.length} YEREL KIRINTI · ${lastSnippet + 1}/${snippets.length}`;
  }
  function nextContradiction() {
    lastContradiction = randomIndex(contradictions.length, lastContradiction);
    $('slipA').textContent = contradictions[lastContradiction][0]; $('slipB').textContent = contradictions[lastContradiction][1];
  }
  $('nextSnippet')?.addEventListener('click', nextSnippet);
  $('nextContradiction')?.addEventListener('click', nextContradiction);
  nextSnippet(); nextContradiction();

  // Local image deck: preferred existing repo images, then included original SVG fallbacks.
  const gallery = [
    { file: '12.jpg', alt: '12.jpg — kişisel arşiv karesi', fallback: '/assets/fallback-01.svg' },
    { file: '122.jpg', alt: '122.jpg — kişisel arşiv karesi', fallback: '/assets/fallback-02.svg' },
    { file: '1232.jpg', alt: '1232.jpg — kişisel arşiv karesi', fallback: '/assets/fallback-03.svg' },
    { file: 'hero.png', alt: 'hero.png — çalışma görseli', fallback: '/assets/signal-art.svg' },
    { file: 'final-hero.png', alt: 'final-hero.png — çalışma görseli', fallback: '/assets/fallback-02.svg' },
    { file: 'work.png', alt: 'work.png — çalışma arşivi', fallback: '/assets/fallback-03.svg' },
    { file: 'varan-otogar-erginkaplan2003topkapi.jpg', alt: 'varan-otogar-erginkaplan2003topkapi.jpg — kişisel arşiv karesi', fallback: '/assets/fallback-01.svg' }
  ];
  let galleryIndex = 0;
  const brokenCandidates = new Set();
  function setGalleryImage(index) {
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex], img = $('archiveImage');
    $('galleryCurrent').textContent = String(galleryIndex + 1).padStart(2, '0');
    $('galleryFileName').textContent = item.file;
    img.onerror = () => {
      if (img.dataset.fallbackApplied === 'yes') return;
      brokenCandidates.add(item.file); img.dataset.fallbackApplied = 'yes'; img.src = item.fallback;
    };
    img.onload = () => { img.dataset.fallbackApplied = 'no'; };
    img.alt = item.alt;
    img.dataset.fallbackApplied = 'no';
    img.src = item.file;
    document.querySelectorAll('.gallery-thumb').forEach((button, i) => button.classList.toggle('active', i === galleryIndex));
  }
  function initGallery() {
    $('galleryTotal').textContent = String(gallery.length).padStart(2, '0');
    const holder = $('galleryThumbnails'); holder.replaceChildren();
    gallery.forEach((item, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-thumb'; button.setAttribute('aria-label', `${index + 1}. görsel: ${item.file}`);
      const img = document.createElement('img'); img.alt = ''; img.loading = 'lazy';
      img.onerror = () => { if (img.dataset.fallbackApplied === 'yes') return; img.dataset.fallbackApplied = 'yes'; img.src = item.fallback; };
      img.src = item.file;
      button.append(img); button.addEventListener('click', () => setGalleryImage(index)); holder.append(button);
    });
    setGalleryImage(0);
  }
  $('galleryPrev')?.addEventListener('click', () => setGalleryImage(galleryIndex - 1));
  $('galleryNext')?.addEventListener('click', () => setGalleryImage(galleryIndex + 1));
  initGallery();

  // Original procedural radio. No remote songs or third-party music streams are pulled into the site.
  const stations = {
    night: { label: 'Gece Otobüsü', freq: '88.8 MHz', base: 110, tempo: 330, wave: 'triangle', scale: [0, 2, 3, 7, 10], color: '#d3543e', subtitle: 'DÜŞÜK DEVİR · GECE YOLU' },
    vhs: { label: 'VHS Rüyası', freq: '87.9 MHz', base: 146.83, tempo: 275, wave: 'sine', scale: [0, 3, 5, 7, 10], color: '#91b4a0', subtitle: 'HİS ARIZASI · ESKİ MANYETİK' },
    rust: { label: 'Paslı Neon', freq: '91.3 MHz', base: 98, tempo: 235, wave: 'sawtooth', scale: [0, 2, 5, 7, 9], color: '#e3a15e', subtitle: 'GECE VARDİYASI · HAFİF BOZUK' }
  };
  const radio = { context: null, master: null, analyser: null, filter: null, oscillators: [], timer: null, trackTimer: null, visualFrame: 0, beat: 0, station: 'night', playing: false, trackCounter: 0 };
  const spectrum = $('spectrum');
  const spectrumCtx = spectrum ? spectrum.getContext('2d') : null;
  const trackNames = {
    night: ['Peron 4 / boş koltuk', 'Şehrin arka tarafı', 'Son otobüsün gölgesi', 'Küçük bir kırılma', 'Camdaki başka şehir', 'Vardiya bitmedi'],
    vhs: ['Manyetik yağmur', 'Görüntü izi / 02', 'Yarım kalmış kayıt', 'Mavi ekranlı yaz', 'Kaset döndükçe', 'Kayıp frekans'],
    rust: ['Neon altında pas', 'Çıkış kapısı yok', 'Geç saat protokolü', 'Kızıl sinyal', 'Yan sokak frekansı', 'Son ışık yanıyor']
  };
  function setRadioDisplay() {
    const station = stations[radio.station];
    $('radioFrequency').textContent = station.freq;
    document.querySelectorAll('.station-button').forEach(button => {
      const selected = button.dataset.station === radio.station;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    if (!radio.playing) $('trackName').textContent = `${station.label} / beklemede`;
    $('trackMeta').textContent = `ORIGINAL WEB AUDIO · ${station.subtitle}`;
  }
  function pickTrack() {
    const options = trackNames[radio.station];
    radio.trackCounter += 1;
    const name = options[Math.floor(Math.random() * options.length)];
    $('trackName').textContent = `${name} / ${String(radio.trackCounter).padStart(2, '0')}`;
    $('trackId').textContent = `GF-${String(radio.trackCounter).padStart(3, '0')}`;
  }
  function makeTone(ctx, frequency, type, duration, peak, destination, startAt = ctx.currentTime, detune = 0) {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(Math.max(20, frequency), startAt); osc.detune.setValueAtTime(detune, startAt);
    gain.gain.setValueAtTime(0.0001, startAt); gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), startAt + Math.min(.025, duration * .15));
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain); gain.connect(destination); osc.start(startAt); osc.stop(startAt + duration + .04);
  }
  function addDrone(ctx, station) {
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = station.station === 'vhs' ? 1300 : 900; filter.Q.value = .65;
    filter.connect(radio.master); radio.filter = filter;
    [1, 1.5, 2.003].forEach((ratio, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = i === 2 ? 'sine' : station.wave; osc.frequency.value = station.base * ratio;
      gain.gain.value = i === 0 ? .07 : i === 1 ? .025 : .012;
      osc.connect(gain); gain.connect(filter); osc.start(); radio.oscillators.push(osc);
    });
    const lfo = ctx.createOscillator(); const lfoGain = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = station.station === 'rust' ? .09 : .055; lfoGain.gain.value = 200;
    lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start(); radio.oscillators.push(lfo);
  }
  function playStep() {
    if (!radio.context || !radio.master || !radio.playing) return;
    const ctx = radio.context, station = stations[radio.station], t = ctx.currentTime;
    const scale = station.scale;
    const noteIndex = scale[Math.floor(Math.random() * scale.length)];
    const octave = (radio.beat % 8 === 0) ? .5 : (Math.random() > .72 ? 2 : 1);
    const detune = (radio.station === 'vhs' ? Math.sin(radio.beat / 3) * 6 : Math.random() * 4 - 2);
    const freq = station.base * Math.pow(2, noteIndex / 12) * octave;
    makeTone(ctx, freq, station.wave, radio.station === 'rust' ? .62 : .82, radio.station === 'rust' ? .055 : .04, radio.filter || radio.master, t, detune);
    if (radio.beat % 4 === 0) makeTone(ctx, station.base * .5, 'sine', .5, .065, radio.master, t);
    if (radio.beat % 8 === 4) makeTone(ctx, station.base * 4.01, 'sine', .075, .009, radio.master, t);
    if (radio.beat % 16 === 0 && radio.filter) {
      const cutoff = radio.station === 'vhs' ? 1800 : 800 + Math.random() * 700;
      radio.filter.frequency.setTargetAtTime(cutoff, t, .7);
    }
    radio.beat += 1;
  }
  function drawSpectrum() {
    if (!spectrumCtx || !spectrum || !radio.playing || !radio.analyser) return;
    const width = spectrum.width, height = spectrum.height;
    const data = new Uint8Array(radio.analyser.frequencyBinCount);
    radio.analyser.getByteFrequencyData(data);
    spectrumCtx.clearRect(0, 0, width, height);
    spectrumCtx.fillStyle = '#090c0d'; spectrumCtx.fillRect(0, 0, width, height);
    spectrumCtx.strokeStyle = 'rgba(190,200,190,.09)'; spectrumCtx.lineWidth = 1;
    for (let y = 24; y < height; y += 30) { spectrumCtx.beginPath(); spectrumCtx.moveTo(0, y); spectrumCtx.lineTo(width, y); spectrumCtx.stroke(); }
    for (let x = 0; x < width; x += 60) { spectrumCtx.beginPath(); spectrumCtx.moveTo(x, 0); spectrumCtx.lineTo(x, height); spectrumCtx.stroke(); }
    const gap = 3, count = Math.min(84, data.length), barW = (width - gap * (count - 1)) / count, station = stations[radio.station];
    for (let i = 0; i < count; i++) {
      const value = data[i] / 255, barH = Math.max(2, value * height * .82);
      spectrumCtx.globalAlpha = .35 + value * .65; spectrumCtx.fillStyle = station.color;
      spectrumCtx.fillRect(i * (barW + gap), height - barH - 4, Math.max(1, barW), barH);
    }
    spectrumCtx.globalAlpha = 1;
    radio.visualFrame = window.requestAnimationFrame(drawSpectrum);
  }
  async function startRadio(nextStation) {
    if (nextStation && stations[nextStation]) radio.station = nextStation;
    if (radio.playing) {
      // A station switch is a user gesture; restart the local generator on the new preset.
      stopRadio(true);
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { toast('Bu tarayıcı Web Audio API desteklemiyor.'); return; }
    try {
      const ctx = new AudioCtx(); radio.context = ctx;
      const master = ctx.createGain(); master.gain.value = Number($('radioVolume').value) / 100 * .36;
      const analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = .84;
      const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -16; compressor.knee.value = 18; compressor.ratio.value = 4; compressor.attack.value = .01; compressor.release.value = .24;
      master.connect(compressor); compressor.connect(analyser); analyser.connect(ctx.destination);
      radio.master = master; radio.analyser = analyser; radio.beat = 0; radio.playing = true;
      const station = { ...stations[radio.station], station: radio.station };
      await ctx.resume();
      addDrone(ctx, station);
      $('radioConsole').classList.add('is-playing'); $('radioStatus').textContent = 'ON AIR · LOCAL SYNTH'; $('radioToggleText').textContent = 'yayını durdur'; $('onAirLabel').textContent = 'ON AIR'; $('tapeHint').textContent = 'Teyp ile radyo ayrı kaynaklardır; ikisi birden çalabilir.';
      setRadioDisplay(); pickTrack();
      const interval = station.tempo;
      playStep(); radio.timer = window.setInterval(playStep, interval);
      radio.trackTimer = window.setInterval(pickTrack, 18000);
      window.cancelAnimationFrame(radio.visualFrame); drawSpectrum();
      toast(`${stations[radio.station].label}: frekans açıldı.`);
    } catch (_) {
      radio.playing = false; $('radioStatus').textContent = 'AUDIO CONTEXT FAILED'; toast('Ses başlatılamadı. Tarayıcı izinlerini veya ses çıkışını kontrol et.');
    }
  }
  function stopRadio(silent = false) {
    radio.playing = false;
    window.clearInterval(radio.timer); window.clearInterval(radio.trackTimer); radio.timer = null; radio.trackTimer = null;
    window.cancelAnimationFrame(radio.visualFrame);
    if (radio.context) {
      try { radio.oscillators.forEach(osc => { try { osc.stop(); } catch (_) {} }); } catch (_) {}
      try { radio.context.close(); } catch (_) {}
    }
    radio.context = null; radio.master = null; radio.analyser = null; radio.filter = null; radio.oscillators = [];
    $('radioConsole').classList.remove('is-playing'); $('radioStatus').textContent = 'STANDBY · LOCAL AUDIO STOPPED'; $('radioToggleText').textContent = 'yayını başlat'; $('onAirLabel').textContent = 'OFF AIR';
    setRadioDisplay();
    if (spectrumCtx && spectrum) { spectrumCtx.clearRect(0, 0, spectrum.width, spectrum.height); spectrumCtx.fillStyle = '#090c0d'; spectrumCtx.fillRect(0, 0, spectrum.width, spectrum.height); }
    if (!silent) toast('Frekans kapatıldı.');
  }
  $('radioToggle')?.addEventListener('click', () => radio.playing ? stopRadio() : startRadio());
  $('heroRadioBtn')?.addEventListener('click', () => { $('radio').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); startRadio(); });
  document.querySelectorAll('.station-button').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.station;
    if (radio.playing) startRadio(id); else { radio.station = id; setRadioDisplay(); toast(`${stations[id].label} seçildi; başlatmak sende.`); }
  }));
  $('radioVolume')?.addEventListener('input', (event) => {
    const volume = Number(event.target.value); $('radioVolumeOut').textContent = `${volume}%`;
    if (radio.master && radio.context) radio.master.gain.setTargetAtTime(volume / 100 * .36, radio.context.currentTime, .05);
  });
  setRadioDisplay();
  window.addEventListener('pagehide', () => { if (radio.playing) stopRadio(true); try { $('legacyAudio')?.pause(); } catch (_) {} });

  // Optional local tape: the bundled package intentionally does not include the old MP3.
  const legacyAudio = $('legacyAudio');
  let selectedObjectUrl = null;
  const tapeToggle = $('tapeToggle');
  const updateTapeUi = () => {
    if (!legacyAudio) return;
    const playing = !legacyAudio.paused;
    $('tapeReels')?.classList.toggle('tape-playing', playing);
    tapeToggle.textContent = playing ? 'yerel dosyayı durdur Ⅱ' : 'yerel dosyayı dene ▶';
    $('tapeStatus').textContent = playing ? 'PLAY / LOCAL' : (legacyAudio.currentSrc ? 'HAZIR / LOCAL FILE' : 'DOSYA BEKLENİYOR');
  };
  legacyAudio?.addEventListener('play', updateTapeUi); legacyAudio?.addEventListener('pause', updateTapeUi); legacyAudio?.addEventListener('ended', updateTapeUi);
  legacyAudio?.addEventListener('error', () => { if (!legacyAudio.paused) toast('Yerel MP3 bulunamadı. “Başka dosya seç” ile kendi kaydını aç.'); $('tapeStatus').textContent = 'DOSYA YOK / SEÇ'; });
  tapeToggle?.addEventListener('click', async () => {
    if (!legacyAudio) return;
    if (!legacyAudio.paused) { legacyAudio.pause(); updateTapeUi(); return; }
    try { await legacyAudio.play(); updateTapeUi(); }
    catch (_) { $('tapeStatus').textContent = 'MP3 YOK / DOSYA SEÇ'; $('tapeHint').textContent = '7mix.mp3 bu klasörde bulunamadı ya da oynatma engellendi. Başka bir ses dosyası seçebilirsin.'; toast('Eski 7mix.mp3 bulunamadı. Bir ses dosyası seç.'); }
  });
  $('tapeFile')?.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0]; if (!file) return;
    if (selectedObjectUrl) URL.revokeObjectURL(selectedObjectUrl);
    selectedObjectUrl = URL.createObjectURL(file); legacyAudio.pause(); legacyAudio.src = selectedObjectUrl; legacyAudio.load();
    $('tapeStatus').textContent = file.name; $('tapeHint').textContent = 'Bu dosya yalnızca tarayıcıda seçildi; sunucuya yüklenmedi.'; toast('Dosya yerel olarak seçildi. Çalmak için düğmeye bas.');
  });

  // Commands are explicitly limited to navigation and harmless visual controls; this is not a shell.
  const actions = [
    { title: 'Tezgâh / projeler', detail: 'Yerel araçlara git', keys: 'W', run: () => location.hash = '#work' },
    { title: 'Canlı başlıklar', detail: 'Hacker News ve rastgele Wikipedia maddesi', keys: 'N', run: () => location.hash = '#signals' },
    { title: 'Greyfield FM', detail: 'Özgün, cihaz içinde üretilen retro sesi aç', keys: 'R', run: () => { location.hash = '#radio'; startRadio(); } },
    { title: 'Yeni kırıntı', detail: 'Yerel arşivden başka bir not getir', keys: 'S', run: () => { nextSnippet(); location.hash = '#archive'; } },
    { title: 'Masayı değiştir', detail: 'İki cümleyi yeniden karıştır', keys: 'D', run: nextContradiction },
    { title: 'Görsel arşiv', detail: 'Eski repo resimlerini sırayla aç', keys: 'I', run: () => { setGalleryImage(galleryIndex + 1); location.hash = '#archive'; } },
    { title: 'GitHub profili', detail: 'Yeni sekmede eerrgin deposunu aç', keys: 'G', run: () => window.open('https://github.com/eerrgin', '_blank', 'noopener,noreferrer') },
    { title: 'Tesla / xAI kaynakları', detail: 'Resmî şirket bağlantılarına git', keys: 'X', run: () => location.hash = '#signals' },
    { title: 'Durum imzasını kopyala', detail: '0xB16B00B5_ACTIVE', keys: 'C', run: copySignal },
    { title: 'Cep modu', detail: 'Mobilde sade görünüm', keys: 'M', run: togglePocketMode },
    { title: 'Uygulamayı yükle', detail: 'Destekleyen tarayıcıda ana ekrana ekle', keys: 'P', run: installApp },
    { title: 'Güncellemeleri yenile', detail: 'Hava, HN ve GitHub yeniden sorgula', keys: '↻', run: () => { loadWeather(true); loadHackerNews(true); loadRepos(true); loadWiki(true); toast('Dış kaynaklar tekrar sorgulanıyor.'); } }
  ];
  const dialog = $('commandDialog'), input = $('commandInput'), results = $('commandResults');
  let selectedAction = 0, filteredActions = [...actions];
  function renderActions(query = '') {
    if (!results) return;
    const q = query.trim().toLocaleLowerCase('tr-TR');
    filteredActions = actions.filter(a => `${a.title} ${a.detail}`.toLocaleLowerCase('tr-TR').includes(q));
    selectedAction = Math.min(selectedAction, Math.max(0, filteredActions.length - 1));
    results.replaceChildren();
    if (!filteredActions.length) { const p = document.createElement('p'); p.className = 'quiet-text'; p.textContent = 'Komut yok. Gerçek terminal değil; burada yalnızca site kısayolları var.'; results.append(p); return; }
    filteredActions.forEach((action, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `command-option${index === selectedAction ? ' selected' : ''}`;
      const left = document.createElement('span'); const title = document.createElement('b'); title.textContent = action.title; const detail = document.createElement('small'); detail.textContent = action.detail; left.append(title, detail);
      const keys = document.createElement('kbd'); keys.textContent = action.keys; button.append(left, keys);
      button.addEventListener('mouseenter', () => { selectedAction = index; highlightAction(); });
      button.addEventListener('click', () => { closeDialog(); action.run(); }); results.append(button);
    });
  }
  function highlightAction() { results?.querySelectorAll('.command-option').forEach((node, i) => node.classList.toggle('selected', i === selectedAction)); }
  function openDialog() { if (!dialog) return; if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); input.value = ''; selectedAction = 0; renderActions(); window.setTimeout(() => input.focus(), 20); }
  function closeDialog() { if (!dialog) return; if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else dialog.removeAttribute('open'); }
  $('openCommand')?.addEventListener('click', openDialog); $('mobileCommand')?.addEventListener('click', openDialog); $('closeCommand')?.addEventListener('click', closeDialog);
  input?.addEventListener('input', () => { selectedAction = 0; renderActions(input.value); });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); selectedAction = Math.min(filteredActions.length - 1, selectedAction + 1); highlightAction(); results?.querySelectorAll('.command-option')[selectedAction]?.scrollIntoView({ block: 'nearest' }); }
    if (event.key === 'ArrowUp') { event.preventDefault(); selectedAction = Math.max(0, selectedAction - 1); highlightAction(); results?.querySelectorAll('.command-option')[selectedAction]?.scrollIntoView({ block: 'nearest' }); }
    if (event.key === 'Enter' && filteredActions[selectedAction]) { event.preventDefault(); const action = filteredActions[selectedAction]; closeDialog(); action.run(); }
  });
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); dialog.open ? closeDialog() : openDialog(); }
    if (event.key === 'Escape' && dialog?.open) closeDialog();
    if (!dialog?.open && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key.toLowerCase() === 'r' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { $('radio').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
    }
  });

  async function copySignal() {
    const text = '0xB16B00B5_ACTIVE';
    try { await navigator.clipboard.writeText(text); toast('İmza panoya kopyalandı.'); }
    catch (_) {
      const helper = document.createElement('textarea'); helper.value = text; helper.style.position = 'fixed'; helper.style.opacity = '0'; document.body.append(helper); helper.select();
      try { document.execCommand('copy'); toast('İmza kopyalama isteği gönderildi.'); } catch (_) { toast(text); }
      helper.remove();
    }
  }
  $('copySignal')?.addEventListener('click', copySignal);

  let installPromptEvent = null;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPromptEvent = event; });
  async function installApp() {
    if (!installPromptEvent) { toast('Yükleme menüsü bu tarayıcıda görünmüyor. Tarayıcı menüsünden “Ana ekrana ekle” seçeneğini dene.'); return; }
    installPromptEvent.prompt();
    try { await installPromptEvent.userChoice; } catch (_) {}
    installPromptEvent = null;
  }
  function togglePocketMode() {
    const enabled = document.body.classList.toggle('pocket-mode');
    safeStore.set('greyfield-pocket-mode', enabled);
    if ($('pocketMode')) $('pocketMode').classList.toggle('active', enabled);
    toast(enabled ? 'Cep modu açık. İsteğe bağlı paneller saklandı.' : 'Tam masa geri geldi.');
  }
  $('pocketMode')?.addEventListener('click', togglePocketMode);
  document.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => { document.querySelector(button.dataset.jump)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }));
  if (safeStore.get('greyfield-pocket-mode') === true) { document.body.classList.add('pocket-mode'); $('pocketMode')?.classList.add('active'); }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) { window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}), { once: true }); }
  if (safeStore.get('greyfield-focus-mode') === true) document.body.classList.add('focus-mode');

  // Start with the site's local features ready. External features can fail independently.
  window.addEventListener('offline', () => toast('Bağlantı gitti. Yerel arşiv ve sentez radyo kullanılabilir.'));
  window.addEventListener('online', () => toast('Bağlantı geri geldi. Dış kaynaklar yenilenebilir.'));
})();

(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeStore = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  };
  const toast = (message) => {
    const node = $('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 2600);
  };
  const timeLabel = () => new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date());
  const clock = $('clock');
  const tickClock = () => { if (clock) clock.textContent = timeLabel(); };
  tickClock(); window.setInterval(tickClock, 1000);
  if ($('year')) $('year').textContent = String(new Date().getFullYear());

  const progress = $('readProgress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true }); updateProgress();

  // Mobile navigation
  const mobileMenu = $('mobileMenu');
  const mainNav = $('mainNav');
  mobileMenu?.addEventListener('click', () => {
    const expanded = mobileMenu.getAttribute('aria-expanded') === 'true';
    mobileMenu.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.setAttribute('aria-label', expanded ? 'Menüyü aç' : 'Menüyü kapat');
    mobileMenu.textContent = expanded ? '☰' : '×';
    mainNav?.classList.toggle('is-open', !expanded);
  });
  mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mainNav.classList.remove('is-open'); mobileMenu?.setAttribute('aria-expanded', 'false');
    if (mobileMenu) { mobileMenu.textContent = '☰'; mobileMenu.setAttribute('aria-label', 'Menüyü aç'); }
  }));

  async function fetchJson(url, timeoutMs = 8500) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { window.clearTimeout(timeout); }
  }

  const weatherNames = { 0: 'açık', 1: 'çoğunlukla açık', 2: 'parçalı bulutlu', 3: 'kapalı', 45: 'sis', 48: 'sis', 51: 'çisenti', 53: 'çisenti', 55: 'çisenti', 61: 'yağmur', 63: 'yağmur', 65: 'sağanak', 71: 'kar', 73: 'kar', 75: 'yoğun kar', 80: 'sağanak', 81: 'sağanak', 82: 'kuvvetli sağanak', 95: 'gök gürültüsü', 96: 'dolu ihtimali', 99: 'kuvvetli fırtına' };
  async function loadWeather(force = false) {
    const node = $('weather'); if (!node) return;
    const cache = safeStore.get('nightshift-weather-v1');
    if (!force && cache?.at && Date.now() - cache.at < 20 * 60 * 1000) { node.textContent = cache.label; return; }
    try {
      const data = await fetchJson('https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul');
      const current = data?.current;
      if (typeof current?.temperature_2m !== 'number') throw new Error('weather payload');
      const label = `${Math.round(current.temperature_2m)}° / ${weatherNames[current.weather_code] || 'hava'}`;
      node.textContent = label; safeStore.set('nightshift-weather-v1', { at: Date.now(), label });
    } catch (_) { node.textContent = cache?.label || 'çevrimdışı'; }
  }
  loadWeather();

  // Public GitHub repository radar, with a short cache and graceful fallback.
  const repoList = $('repoList');
  function renderRepos(items) {
    if (!repoList) return;
    repoList.replaceChildren();
    if (!items.length) { repoList.innerHTML = '<p class="quiet-text">Depolar şu an yanıt vermiyor. Üstteki sabit bağlantılar çalışmaya devam ediyor.</p>'; return; }
    items.forEach((repo) => {
      const a = document.createElement('a'); a.className = 'repo-item'; a.href = repo.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const title = document.createElement('strong'); title.textContent = repo.name;
      const meta = document.createElement('span'); meta.textContent = `${repo.language || 'karışık'} · ${new Date(repo.updated).toLocaleDateString('tr-TR')}`;
      a.append(title, meta); repoList.append(a);
    });
  }
  async function loadRepos(force = false) {
    if (!repoList) return;
    const cache = safeStore.get('nightshift-repos-v1');
    if (!force && cache?.items && Date.now() - cache.at < 5 * 60 * 1000) { renderRepos(cache.items); return; }
    repoList.innerHTML = '<div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div>';
    try {
      const repos = await fetchJson('https://api.github.com/users/eerrgin/repos?sort=updated&per_page=30');
      if (!Array.isArray(repos)) throw new Error('repo payload');
      const items = repos.filter((r) => !r.fork && !r.archived).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 6).map((r) => ({ name: r.name, url: r.html_url, language: r.language, updated: r.updated_at }));
      safeStore.set('nightshift-repos-v1', { at: Date.now(), items }); renderRepos(items);
    } catch (_) {
      if (cache?.items) renderRepos(cache.items);
      else renderRepos([
        { name: 'VeilCheck', url: 'https://github.com/eerrgin/VeilCheck', language: 'Python', updated: new Date().toISOString() },
        { name: 'GreySignal', url: 'https://github.com/eerrgin/GreySignal', language: 'Python', updated: new Date().toISOString() },
        { name: 'local-sqli-lab', url: 'https://github.com/eerrgin/local-sqli-lab', language: 'SQLite', updated: new Date().toISOString() }
      ]);
    }
  }
  loadRepos(); $('refreshRepos')?.addEventListener('click', () => loadRepos(true));

  // Hacker News: obtain titles through its public Firebase API and link back to the source discussion.
  const headlineList = $('headlineList');
  async function loadNews() {
    if (!headlineList) return;
    headlineList.innerHTML = '<p class="quiet-text">Başlıklar taranıyor…</p>';
    try {
      const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!Array.isArray(ids)) throw new Error('stories payload');
      const selected = await Promise.all(ids.slice(0, 5).map(async (id) => {
        try { return await fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, 6000); } catch (_) { return null; }
      }));
      const stories = selected.filter((s) => s && s.title && s.url).slice(0, 5);
      if (!stories.length) throw new Error('empty stories');
      headlineList.replaceChildren();
      stories.forEach((story, index) => {
        const a = document.createElement('a'); a.className = 'headline-item'; a.href = story.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        const rank = document.createElement('span'); rank.className = 'headline-rank'; rank.textContent = String(index + 1).padStart(2, '0');
        const body = document.createElement('span');
        const title = document.createElement('span'); title.className = 'headline-title'; title.textContent = story.title;
        const meta = document.createElement('span'); meta.className = 'headline-meta'; meta.textContent = `${story.score || 0} puan · ${story.descendants || 0} yorum`;
        body.append(title, meta); a.append(rank, body); headlineList.append(a);
      });
    } catch (_) {
      headlineList.innerHTML = '<p class="quiet-text">Canlı sinyal şu an uzakta. Kaynak kapısı yine açık: <a href="https://news.ycombinator.com/" target="_blank" rel="noopener noreferrer">Hacker News ↗</a></p>';
    }
  }
  loadNews(); $('refreshNews')?.addEventListener('click', loadNews);

  // Random encyclopedia entry. Its full content stays at Wikipedia; the page shows only a short summary.
  async function loadWiki() {
    const card = $('wikiCard'); const state = $('wikiState'); if (!card || !state) return;
    state.textContent = 'SEARCHING';
    const oldButton = $('randomWiki'); if (oldButton) oldButton.disabled = true;
    try {
      const item = await fetchJson('https://tr.wikipedia.org/api/rest_v1/page/random/summary');
      const title = item?.title; const extract = item?.extract; const href = item?.content_urls?.desktop?.page;
      if (!title || !extract || !href) throw new Error('wiki payload');
      card.replaceChildren();
      const h = document.createElement('h4'); h.textContent = title;
      const p = document.createElement('p'); p.textContent = extract.length > 410 ? `${extract.slice(0, 407).trim()}…` : extract;
      const actions = document.createElement('div'); actions.className = 'wiki-actions';
      const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Maddeye git ↗';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'text-button'; btn.id = 'randomWiki'; btn.textContent = 'Yeni madde getir ↻'; btn.addEventListener('click', loadWiki);
      actions.append(link, btn); card.append(h, p, actions); state.textContent = 'READY';
    } catch (_) { state.textContent = 'OFFLINE'; toast('Ansiklopedi sinyali alınamadı.'); }
    const currentButton = $('randomWiki'); if (currentButton) currentButton.disabled = false;
  }
  $('randomWiki')?.addEventListener('click', loadWiki); loadWiki();

  // Rotating local writing fragments, not generated filler.
  const fragments = [
    { category: 'AĞ HAFIZASI', title: 'Bir bağlantının hayaleti', text: 'Bir sayfa silindiğinde yalnızca metin kaybolmaz. Ona giden yollar, cevaplar ve o sırada kim olduğumuz da biraz bulanıklaşır.' },
    { category: 'GECE NOTU', title: 'Saat 03:18', text: 'Şehir sustuğunda fanın sesi büyür. Ekranın ışığında yarım kalmış işler, olduğundan daha dürüst görünür.' },
    { category: 'KOD / KENAR DURUMU', title: 'Her şey yolundayken', text: 'Bir sistemin huyu, her şey normal olduğunda değil; kimsenin hesaba katmadığı şey kapıyı çaldığında belli olur.' },
    { category: 'ESKİ WEB', title: 'Kusurlu ama canlı', text: 'Eski internetin cazibesi kusursuz tasarımlar değildi. Birinin merak ettiği bir şeyi öğrenip gece bitmeden paylaşabilmesiydi.' },
    { category: 'YEREL HAFIZA', title: 'Dosyanın yanında', text: 'Bir şeyi saklamak, onu sonsuza dek korumak değildir. Dosyanın yanında onu açacak yolu da bırakmak gerekir.' },
    { category: 'SİNYAL', title: 'Parazitin içi', text: 'Bazen paraziti tamamen temizlersen sinyali de kaybedersin. Her kusur gürültü, her pürüz hata değildir.' },
    { category: 'DİJİTAL ARKEOLOJİ', title: 'Sahipsiz alan adı', text: 'Terk edilmiş siteler, sahibinin gitmesinden sonra da bir süre nefes alıyor gibi görünür. Sonra bağlantılar birer birer karanlığa düşer.' },
    { category: 'MAKİNE / İNSAN', title: 'Açıklanamayan küçük şey', text: 'Her şeyi ölçmek mümkün olabilir. Ama neye dikkat etmeye değer olduğunu söyleyen şey çoğu zaman ölçümün dışında kalır.' }
  ];
  let fragmentIndex = Math.floor(Math.random() * fragments.length);
  function nextFragment() {
    if (fragments.length > 1) { let next = fragmentIndex; while (next === fragmentIndex) next = Math.floor(Math.random() * fragments.length); fragmentIndex = next; }
    const f = fragments[fragmentIndex];
    $('fragmentNumber').textContent = `FRAG-${String(fragmentIndex + 1).padStart(3, '0')}`;
    $('fragmentCategory').textContent = f.category; $('fragmentTitle').textContent = f.title; $('fragmentText').textContent = f.text;
  }
  nextFragment(); $('nextFragment')?.addEventListener('click', nextFragment);
  const visuals = [
    { label: 'VISUAL MEMORY / 001', status: 'NO SIGNAL', scene: '' },
    { label: 'VISUAL MEMORY / 002', status: 'NIGHT TRAIN', scene: 'scene-train' },
    { label: 'VISUAL MEMORY / 003', status: 'LAST CABIN', scene: 'scene-fog' }
  ];
  let visualIndex = 0;
  $('changeVisual')?.addEventListener('click', () => {
    visualIndex = (visualIndex + 1) % visuals.length;
    const item = visuals[visualIndex]; const art = $('visualArt');
    art?.classList.remove('scene-train', 'scene-fog'); if (item.scene) art?.classList.add(item.scene);
    const caption = document.querySelector('.visual-caption span'); if (caption) caption.textContent = item.label;
    const status = document.querySelector('.visual-signal'); if (status) status.innerHTML = `${item.status}<br><b>STILL HERE</b>`;
  });
  const thoughtsA = ['Bir sistem, kurallarına uyduğu sürece çalışır.', 'Her ölçüm bir şeyi görünür kılar.', 'Daha hızlı olan, her zaman daha iyi değildir.', 'Bir kural, tekrarlandığı için doğru olmaz.'];
  const thoughtsB = ['Bazen arızanın gösterdiği şey, tasarımın gizlediğidir.', 'Görünür olan, önemli olanla aynı şey değil.', 'Bazen yavaşlık, düşünmeye yer açar.', 'Kimi kurallar yalnızca sorgulanmadıkları için yaşar.'];
  $('mixThoughts')?.addEventListener('click', () => {
    $('thoughtA').textContent = thoughtsA[Math.floor(Math.random() * thoughtsA.length)];
    $('thoughtB').textContent = thoughtsB[Math.floor(Math.random() * thoughtsB.length)];
  });

  // Local audio file. Object URL stays in this tab and is never uploaded.
  const localAudio = $('localAudio'); const player = $('localPlayer'); const playLocal = $('localAudioPlay'); const stopLocal = $('localAudioStop'); const tryArchiveAudio = $('tryArchiveAudio');
  let localObjectUrl = null;
  player?.addEventListener('canplay', () => {
    if (player.dataset.mode === 'archive') { $('localAudioStatus').textContent = 'Depodaki 7mix.mp3 hazır.'; playLocal.disabled = false; stopLocal.disabled = false; }
  });
  player?.addEventListener('error', () => {
    if (player.dataset.mode === 'archive') { $('localAudioStatus').textContent = '7mix.mp3 depoda bulunamadı. Kendi dosyanı seçebilirsin.'; playLocal.disabled = true; stopLocal.disabled = true; }
  });
  tryArchiveAudio?.addEventListener('click', () => {
    if (!player) return;
    if (localObjectUrl) { URL.revokeObjectURL(localObjectUrl); localObjectUrl = null; }
    player.dataset.mode = 'archive'; player.src = '7mix.mp3'; player.hidden = false;
    playLocal.disabled = true; stopLocal.disabled = true;
    $('localAudioName').textContent = '7mix.mp3'; $('localAudioStatus').textContent = 'Depoda arşiv dosyası aranıyor…';
    player.load();
  });
  localAudio?.addEventListener('change', () => {
    const file = localAudio.files?.[0]; if (!file || !player) return;
    if (!file.type.startsWith('audio/')) { toast('Bir ses dosyası seç.'); return; }
    if (localObjectUrl) URL.revokeObjectURL(localObjectUrl);
    localObjectUrl = URL.createObjectURL(file); player.dataset.mode = 'user'; player.src = localObjectUrl; player.hidden = false;
    $('localAudioName').textContent = file.name; $('localAudioStatus').textContent = 'Dosya bu tarayıcı oturumunda açıldı.';
    playLocal.disabled = false; stopLocal.disabled = false; toast('Yerel ses dosyası hazır.');
  });
  playLocal?.addEventListener('click', async () => {
    if (!player?.src) return;
    try { await player.play(); $('tapeReels')?.classList.add('tape-playing'); $('localAudioStatus').textContent = 'Şimdi çalıyor.'; } catch (_) { toast('Dosya tarayıcıda açılamadı.'); }
  });
  stopLocal?.addEventListener('click', () => { if (!player) return; player.pause(); player.currentTime = 0; $('tapeReels')?.classList.remove('tape-playing'); $('localAudioStatus').textContent = 'Durduruldu.'; });
  player?.addEventListener('pause', () => $('tapeReels')?.classList.remove('tape-playing'));
  player?.addEventListener('play', () => $('tapeReels')?.classList.add('tape-playing'));
  window.addEventListener('beforeunload', () => { if (localObjectUrl) URL.revokeObjectURL(localObjectUrl); });

  // Procedural sound design with the Web Audio API; no recorded music is embedded.
  const stationConfig = {
    night: { title: 'Gece Otobüsü', desc: 'uzak motor / yumuşak uğultu / seyrek ışıklar', frequency: '88.8 MHz', low: 62, high: 96, noise: 360, q: .55, osc: [55, 82.4, 110], wave: 'sine', noiseLevel: .12, oscLevel: .14, lfo: .075 },
    vhs: { title: 'VHS Rüyası', desc: 'bant hışırtısı / yavaş salınan ton / soluk anılar', frequency: '87.9 MHz', low: 174, high: 390, noise: 1250, q: 1.4, osc: [110, 164.8, 220], wave: 'triangle', noiseLevel: .09, oscLevel: .105, lfo: .22 },
    rust: { title: 'Paslı Neon', desc: 'elektrik uğultusu / bozuk ışık / uzak bir sokak', frequency: '91.3 MHz', low: 72, high: 640, noise: 830, q: 4.5, osc: [73.4, 146.8, 293.7], wave: 'sawtooth', noiseLevel: .045, oscLevel: .085, lfo: .16 }
  };
  let currentStation = 'night'; let audioContext = null; let masterGain = null; let analyser = null; let soundNodes = []; let playing = false; let spectrumFrame = 0;
  const spectrum = $('spectrum'); const canvasCtx = spectrum?.getContext('2d');
  function createNoiseBuffer(ctx) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .55;
    return buffer;
  }
  function buildSoundscape() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { toast('Bu tarayıcı Web Audio desteği sunmuyor.'); return false; }
      audioContext = new AudioCtx(); analyser = audioContext.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = .83;
      masterGain = audioContext.createGain(); masterGain.gain.value = Number($('radioVolume').value) / 100 * .25;
      masterGain.connect(analyser); analyser.connect(audioContext.destination);
    }
    soundNodes.forEach((node) => { try { node.stop?.(); } catch (_) {} try { node.disconnect?.(); } catch (_) {} }); soundNodes = [];
    const cfg = stationConfig[currentStation]; const ctx = audioContext;
    const noiseSource = ctx.createBufferSource(); noiseSource.buffer = createNoiseBuffer(ctx); noiseSource.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = cfg.noise; filter.Q.value = cfg.q;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = cfg.noiseLevel;
    const noiseLfo = ctx.createOscillator(); const noiseLfoGain = ctx.createGain(); noiseLfo.frequency.value = cfg.lfo; noiseLfoGain.gain.value = cfg.noise * .35;
    noiseLfo.connect(noiseLfoGain).connect(filter.frequency); noiseSource.connect(filter).connect(noiseGain).connect(masterGain); noiseSource.start(); noiseLfo.start();
    soundNodes.push(noiseSource, filter, noiseGain, noiseLfo, noiseLfoGain);
    cfg.osc.forEach((frequency, index) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = cfg.wave; osc.frequency.value = frequency; osc.detune.value = index % 2 ? -3.5 : 2.2;
      gain.gain.value = cfg.oscLevel / (index + 1.1);
      if (pan) { pan.pan.value = (index - 1) * .55; osc.connect(gain).connect(pan).connect(masterGain); soundNodes.push(pan); }
      else osc.connect(gain).connect(masterGain);
      osc.start(); soundNodes.push(osc, gain);
    });
    if (currentStation === 'vhs' || currentStation === 'rust') {
      const tone = ctx.createOscillator(); const toneGain = ctx.createGain(); const tremolo = ctx.createOscillator(); const tremoloGain = ctx.createGain();
      tone.type = 'sine'; tone.frequency.value = currentStation === 'vhs' ? 432 : 50; toneGain.gain.value = currentStation === 'vhs' ? .012 : .009;
      tremolo.frequency.value = currentStation === 'vhs' ? .12 : 3.4; tremoloGain.gain.value = .008;
      tremolo.connect(tremoloGain).connect(toneGain.gain); tone.connect(toneGain).connect(masterGain); tone.start(); tremolo.start(); soundNodes.push(tone, toneGain, tremolo, tremoloGain);
    }
    return true;
  }
  function paintSpectrum() {
    if (!canvasCtx || !spectrum) return;
    const w = spectrum.width; const h = spectrum.height; canvasCtx.clearRect(0, 0, w, h);
    canvasCtx.fillStyle = '#0c1419'; canvasCtx.fillRect(0, 0, w, h);
    canvasCtx.strokeStyle = '#223338'; canvasCtx.lineWidth = 1;
    for (let i = 1; i < 6; i++) { const y = h * i / 6; canvasCtx.beginPath(); canvasCtx.moveTo(0, y); canvasCtx.lineTo(w, y); canvasCtx.stroke(); }
    if (playing && analyser) {
      const values = new Uint8Array(analyser.frequencyBinCount); analyser.getByteFrequencyData(values);
      const gap = 4; const barWidth = (w - gap * (values.length - 1)) / values.length;
      values.forEach((v, i) => { const barH = Math.max(2, v / 255 * h * .8); canvasCtx.fillStyle = i > values.length * .64 ? '#c96e50' : (i > values.length * .4 ? '#e1aa6a' : '#83b4ac'); canvasCtx.globalAlpha = .35 + v / 255 * .65; canvasCtx.fillRect(i * (barWidth + gap), h - barH, barWidth, barH); }); canvasCtx.globalAlpha = 1;
      spectrumFrame = window.requestAnimationFrame(paintSpectrum);
    } else {
      const t = Date.now() / 900; canvasCtx.beginPath();
      for (let x = 0; x <= w; x += 4) { const y = h * .54 + Math.sin(x * .018 + t) * 7 + Math.sin(x * .051 - t * .6) * 3; if (x === 0) canvasCtx.moveTo(x, y); else canvasCtx.lineTo(x, y); }
      canvasCtx.strokeStyle = '#648a83'; canvasCtx.globalAlpha = .55; canvasCtx.stroke(); canvasCtx.globalAlpha = 1;
    }
  }
  function selectStation(key) {
    if (!stationConfig[key]) return; currentStation = key; const cfg = stationConfig[key];
    document.querySelectorAll('.station-button').forEach((button) => button.classList.toggle('active', button.dataset.station === key));
    $('stationTitle').textContent = cfg.title; $('stationDesc').textContent = cfg.desc; $('frequencyReadout').textContent = cfg.frequency;
    if (audioContext) { buildSoundscape(); if (playing) audioContext.resume(); }
    paintSpectrum();
  }
  document.querySelectorAll('.station-button').forEach((button) => button.addEventListener('click', () => selectStation(button.dataset.station)));
  $('radioVolume')?.addEventListener('input', (event) => {
    const value = Number(event.target.value); $('volumeOut').textContent = `${value}%`;
    if (masterGain && audioContext) masterGain.gain.setTargetAtTime(value / 100 * .25, audioContext.currentTime, .05);
  });
  $('radioToggle')?.addEventListener('click', async () => {
    if (!playing) {
      if (!audioContext && !buildSoundscape()) return;
      if (audioContext.state === 'suspended') await audioContext.resume();
      else if (soundNodes.length === 0 && !buildSoundscape()) return;
      playing = true; $('radioConsole').classList.add('is-playing'); $('radioLive').textContent = 'ON AIR'; $('onAir').innerHTML = '<i></i> YAYIN AÇIK'; $('radioToggleLabel').textContent = 'Yayını durdur'; $('radioToggleIcon').textContent = 'Ⅱ'; $('tapeReels')?.classList.remove('tape-playing');
      $('radioSeed').textContent = `SESSION / ${String(Math.floor(Math.random() * 8999) + 1000)}`; paintSpectrum();
    } else {
      playing = false; if (audioContext?.state === 'running') await audioContext.suspend();
      $('radioConsole').classList.remove('is-playing'); $('radioLive').textContent = 'STANDBY'; $('onAir').innerHTML = '<i></i> YAYIN BEKLEMEDE'; $('radioToggleLabel').textContent = 'Yayını başlat'; $('radioToggleIcon').textContent = '▶';
      window.cancelAnimationFrame(spectrumFrame); paintSpectrum();
    }
  });
  paintSpectrum();

  // Command palette: navigation only, not a real shell or terminal.
  const backdrop = $('commandBackdrop'); const commandInput = $('commandInput'); const commandResults = $('commandResults'); let activeCommandIndex = 0;
  const allCommands = Array.from(commandResults?.querySelectorAll('button') || []);
  function visibleCommands() { return Array.from(commandResults?.querySelectorAll('button:not([hidden])') || []); }
  function openCommands() { if (!backdrop) return; backdrop.hidden = false; commandInput.value = ''; filterCommands(''); activeCommandIndex = 0; requestAnimationFrame(() => commandInput.focus()); }
  function closeCommands() { if (!backdrop) return; backdrop.hidden = true; $('commandOpen')?.focus(); }
  function filterCommands(query) {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    allCommands.forEach((button) => { button.hidden = !button.textContent.toLocaleLowerCase('tr-TR').includes(q); });
    activeCommandIndex = 0; updateCommandSelection();
  }
  function updateCommandSelection() {
    const commands = visibleCommands(); commands.forEach((button, i) => { button.style.background = i === activeCommandIndex ? '#1e2d30' : ''; });
  }
  function runCommand(button) { if (!button) return; const target = button.dataset.target; closeCommands(); if (target) document.querySelector(target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  $('commandOpen')?.addEventListener('click', openCommands); $('commandClose')?.addEventListener('click', closeCommands);
  backdrop?.addEventListener('click', (event) => { if (event.target === backdrop) closeCommands(); });
  commandInput?.addEventListener('input', () => filterCommands(commandInput.value));
  commandResults?.addEventListener('click', (event) => { const button = event.target.closest('button[data-target]'); if (button) runCommand(button); });
  commandInput?.addEventListener('keydown', (event) => {
    const commands = visibleCommands();
    if (event.key === 'ArrowDown') { event.preventDefault(); activeCommandIndex = Math.min(commands.length - 1, activeCommandIndex + 1); updateCommandSelection(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); activeCommandIndex = Math.max(0, activeCommandIndex - 1); updateCommandSelection(); }
    else if (event.key === 'Enter') { event.preventDefault(); runCommand(commands[activeCommandIndex]); }
    else if (event.key === 'Escape') closeCommands();
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommands(); }
    else if (event.key === 'Escape' && backdrop && !backdrop.hidden) closeCommands();
  });
})();

import { haversine, wmoToTurkish, readCache, writeCache } from './utils.js';

const LAT = 41.015;
const LON = 28.979;
const NOTES_KEY = 'ergin-lab:field-notes:v1';
const WEATHER = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe%2FIstanbul&forecast_days=4`;
const AIR = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=european_aqi,pm2_5,pm10,uv_index&timezone=Europe%2FIstanbul`;
const QUAKE = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${LAT}&longitude=${LON}&maxradiuskm=450&limit=5&orderby=time`;
const ISS = 'https://api.wheretheiss.at/v1/satellites/25544';

const $ = (id) => document.getElementById(id);
let notesTimer = 0;

function text(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

function setAppStatus(message, state = 'ok') {
  const node = $('app-status');
  if (!node) return;
  node.textContent = message || '';
  node.hidden = !message;
  node.dataset.state = state;
}

function cachedValue(key) {
  try { return readCache(window.localStorage, `ergin-lab:${key}`); }
  catch (error) { return null; }
}

function saveCachedValue(key, data) {
  try { writeCache(window.localStorage, `ergin-lab:${key}`, data, 30 * 60 * 1000); }
  catch (error) {
    // Storage is optional: a privacy setting must never block live rendering.
  }
}

function clock(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
}

function cardinal(deg) {
  const dirs = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
  const value = ((Number(deg) % 360) + 360) % 360;
  return dirs[Math.round(value / 22.5) % 16];
}

function aqiLabel(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Ölçüm yok';
  if (n <= 20) return 'Çok iyi';
  if (n <= 40) return 'İyi';
  if (n <= 60) return 'Orta';
  if (n <= 80) return 'Kötü';
  if (n <= 100) return 'Çok kötü';
  return 'Tehlikeli';
}

function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const known = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - known) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const phase = age / synodic;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const names = ['Yeni ay', 'İnce hilal', 'İlk dördün', 'Şişkin ay', 'Dolunay', 'Şişkin ay', 'Son dördün', 'İnce hilal'];
  return { age, illumination, name: names[Math.round(phase * 8) % 8] };
}

function paintMoon(illumination) {
  const disk = $('moon-disk');
  if (!disk) return;
  const shade = Math.round((1 - illumination) * 28);
  disk.style.boxShadow = `inset ${shade}px 0 0 rgba(7,1,3,.72), 0 0 0 1px var(--line)`;
}

function lightWindow(now, sunriseIso, sunsetIso) {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);
  const morningEnd = sunrise.getTime() + 3600000;
  const eveningStart = sunset.getTime() - 3600000;
  const blueEnd = sunset.getTime() + 40 * 60000;
  const t = now.getTime();
  let active = 'Gece';
  if (t >= sunrise.getTime() && t <= morningEnd) active = 'Sabah altını';
  else if (t > morningEnd && t < eveningStart) active = 'Gündüz';
  else if (t >= eveningStart && t <= sunset.getTime()) active = 'Akşam altını';
  else if (t > sunset.getTime() && t <= blueEnd) active = 'Mavi saat';
  return { active, sunrise, sunset, morningEnd, eveningStart, blueEnd };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function renderWeather(data) {
  const current = data.current || {};
  const code = wmoToTurkish(current.weather_code);
  const label = code && code.aciklama ? code.aciklama : 'Değişken';
  text('temp', Math.round(current.temperature_2m));
  text('desc', label);
  text('feel', `Hissedilen ${Math.round(current.apparent_temperature)}°`);
  text('wind', `${Math.round(current.wind_speed_10m)} km/sa ${cardinal(current.wind_direction_10m)}`);
  text('humid', `%${Math.round(current.relative_humidity_2m)}`);
  text('press', `${Math.round(current.surface_pressure)} hPa`);
  text('app', `${Math.round(current.apparent_temperature)}°`);
  text('updated', `GÜNCEL · ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · OPEN-METEO`);

  const hours = $('hours');
  hours.replaceChildren();
  const times = data.hourly?.time || [];
  const nowHour = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).format(new Date()).replace(' ', 'T').slice(0, 13);
  let shown = 0;
  times.forEach((stamp, index) => {
    if (shown >= 8 || stamp.slice(0, 13) < nowHour) return;
    const chip = document.createElement('div');
    chip.className = 'chip';
    const name = wmoToTurkish(data.hourly.weather_code[index]);
    chip.innerHTML = `<strong>${clock(stamp)}</strong><span>${Math.round(data.hourly.temperature_2m[index])}°</span><span>${name.aciklama || ''}</span>`;
    hours.appendChild(chip);
    shown += 1;
  });

  const days = $('days');
  days.replaceChildren();
  (data.daily?.time || []).forEach((day, index) => {
    const name = wmoToTurkish(data.daily.weather_code[index]);
    const chip = document.createElement('div');
    chip.className = 'chip';
    const labelDay = new Date(day).toLocaleDateString('tr-TR', { weekday: 'short', timeZone: 'Europe/Istanbul' });
    chip.innerHTML = `<strong>${labelDay}</strong><span>${Math.round(data.daily.temperature_2m_min[index])}° / ${Math.round(data.daily.temperature_2m_max[index])}°</span><span>${name.aciklama || ''}</span>`;
    days.appendChild(chip);
  });

  const now = new Date();
  const sunrise = data.daily?.sunrise?.[0];
  const sunset = data.daily?.sunset?.[0];
  const list = $('light-list');
  if (sunrise && sunset) {
    const light = lightWindow(now, sunrise, sunset);
    text('light-state', light.active);
    text('light-copy', light.active === 'Gece'
      ? 'Şehir karanlıkta. Bir sonraki altın saat gün doğumundan sonraki ilk saat.'
      : 'Işık şu an bu pencerede. Fotoğraf ve saha kaydı için en duru aralık.');
    if (list) {
      list.replaceChildren();
      [
        ['Gün doğumu', clock(light.sunrise)],
        ['Sabah altını', `${clock(light.sunrise)} – ${clock(light.morningEnd)}`],
        ['Akşam altını', `${clock(light.eveningStart)} – ${clock(light.sunset)}`],
        ['Mavi saat', `${clock(light.sunset)} – ${clock(light.blueEnd)}`]
      ].forEach(([k, v]) => {
        const li = document.createElement('li');
        li.textContent = `${k} · ${v}`;
        list.appendChild(li);
      });
    }
  } else {
    text('light-state', 'Veri yok');
    text('light-copy', 'Gün doğumu ve gün batımı bilgisi şu an alınamadı.');
    list?.replaceChildren();
  }

  const hourlyP = data.hourly?.surface_pressure || [];
  const idx = times.findIndex((stamp) => stamp.slice(0, 13) >= nowHour);
  const prev = hourlyP[Math.max(0, idx - 3)];
  const cur = hourlyP[idx] ?? current.surface_pressure;
  if (Number.isFinite(cur) && Number.isFinite(prev)) {
    const delta = cur - prev;
    const dir = Math.abs(delta) < 0.4 ? 'Durgun' : delta > 0 ? 'Sıkışıyor' : 'Gevşiyor';
    text('breath', dir);
    text('breath-copy', `Üç saatte ${delta > 0 ? '+' : ''}${delta.toFixed(1)} hPa. ${dir === 'Sıkışıyor' ? 'Hava oturuyor, gökyüzü açılabilir.' : dir === 'Gevşiyor' ? 'Basınç düşüyor, hava hareketlenebilir.' : 'Şehir nefesini tutmuş gibi.'}`);
  }
}

function renderAir(data) {
  const current = data.current || {};
  const aqi = current.european_aqi;
  text('aqi', Number.isFinite(aqi) ? String(Math.round(aqi)) : '—');
  text('aqi-label', aqiLabel(aqi));
  const list = $('aqi-list');
  list.innerHTML = '';
  [
    ['PM2.5', current.pm2_5, 'µg/m³'],
    ['PM10', current.pm10, 'µg/m³'],
    ['UV', current.uv_index, '']
  ].forEach(([name, value, unit]) => {
    const li = document.createElement('li');
    li.textContent = `${name} · ${Number.isFinite(value) ? Math.round(value * 10) / 10 : '—'} ${unit}`;
    list.appendChild(li);
  });
}

function renderQuake(data) {
  const feature = data.features?.[0];
  const list = $('quake-list');
  list.innerHTML = '';
  if (!feature) {
    text('quake-mag', 'Sakin');
    text('quake-copy', 'Son sorguda İstanbul çevresinde kayıt yok.');
    return;
  }
  const mag = feature.properties.mag;
  const place = feature.properties.place || 'konum belirsiz';
  const when = new Date(feature.properties.time);
  const [lon, lat] = feature.geometry.coordinates;
  const km = haversine(LAT, LON, lat, lon) / 1000;
  text('quake-mag', `M ${Number(mag).toFixed(1)}`);
  text('quake-copy', place);
  [
    ['Zaman', when.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })],
    ['Uzaklık', `${Math.round(km)} km`],
    ['Derinlik', `${Math.round(feature.geometry.coordinates[2] || 0)} km`]
  ].forEach(([k, v]) => {
    const li = document.createElement('li');
    li.textContent = `${k} · ${v}`;
    list.appendChild(li);
  });
}

function renderIss(data) {
  const km = haversine(LAT, LON, data.latitude, data.longitude) / 1000;
  text('iss-dist', `${Math.round(km).toLocaleString('tr-TR')} km`);
  const alt = Math.round(data.altitude);
  text('iss-copy', km < 800
    ? `İstasyon şehre yakın bir yayda. İrtifa ${alt} km, hız ${Math.round(data.velocity)} km/s.`
    : `Şu an İstanbul’dan ${Math.round(km).toLocaleString('tr-TR')} km ötede. İrtifa ${alt} km.`);
}

function renderMoon() {
  const moon = moonPhase(new Date());
  text('moon-name', moon.name);
  text('moon-copy', `Aydınlanma %${Math.round(moon.illumination * 100)} · yaş ${moon.age.toFixed(1)} gün. Hesap bu cihazda, takvimden.`);
  paintMoon(moon.illumination);
}

let loadingPromise = null;

async function loadAll() {
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const banner = $('offline-banner');
    const online = navigator.onLine;
    const net = $('net');
    text('net', online ? 'Çevrimiçi' : 'Çevrimdışı');
    if (net) net.dataset.state = online ? 'on' : 'off';
    setAppStatus('VERİLER ALINIYOR…', 'loading');
    renderMoon();

    const tasks = [
      ['wx', WEATHER, renderWeather],
      ['air', AIR, renderAir],
      ['quake', QUAKE, renderQuake],
      ['iss', ISS, renderIss]
    ];

    const results = await Promise.all(tasks.map(async ([key, url, render]) => {
      try {
        const data = await fetchJson(url);
        render(data);
        saveCachedValue(key, data);
        return 'live';
      } catch (error) {
        const cached = cachedValue(key);
        if (cached) {
          try {
            render(cached);
            return 'cached';
          } catch (cacheError) {
            // Continue to the visible fallback below.
          }
        }

        if (key === 'wx') {
          text('desc', 'Hava verisi şu an alınamıyor.');
          text('updated', 'BAĞLANTI BEKLENİYOR');
          ['wind', 'humid', 'press', 'app'].forEach((id) => text(id, '—'));
        } else if (key === 'air') {
          text('aqi', '—');
          text('aqi-label', 'Ölçüm alınamadı');
          $('aqi-list')?.replaceChildren();
        } else if (key === 'quake') {
          text('quake-mag', '—');
          text('quake-copy', 'Deprem kaynağına şu an ulaşılamıyor.');
          $('quake-list')?.replaceChildren();
        } else if (key === 'iss') {
          text('iss-dist', '—');
          text('iss-copy', 'Yörünge verisi şu an alınamıyor.');
        }
        return 'unavailable';
      }
    }));

    const liveCount = results.filter((state) => state === 'live').length;
    const cachedCount = results.filter((state) => state === 'cached').length;
    if (liveCount === tasks.length) {
      setAppStatus('TÜM ALET VERİLERİ CANLI · SON OKUMA ŞİMDİ', 'ok');
    } else if (liveCount + cachedCount > 0) {
      setAppStatus(`CANLI ${liveCount}/4 · ÖNBELLEK ${cachedCount}/4 · BAZI KAYNAKLAR BEKLEMEDE`, 'warning');
    } else {
      setAppStatus('VERİ KAYNAKLARINA ULAŞILAMADI · BAĞLANTIYI KONTROL EDİP YENİLE', 'error');
    }
    if (banner) banner.hidden = online;
  })();

  try { return await loadingPromise; }
  finally { loadingPromise = null; }
}

function bindChrome() {
  $('theme')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('istanbul-cockpit-theme', next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#f4ece4' : '#070103');
  });
  $('refresh')?.addEventListener('click', () => { loadAll(); });
  window.addEventListener('online', loadAll);
  window.addEventListener('offline', loadAll);
}

function bindNotes() {
  const area = $('lab-notes');
  if (!area) return;
  const status = $('notes-status');
  const count = $('notes-count');
  const setCount = () => { count.textContent = `${area.value.length.toLocaleString('tr-TR')} / 6000`; };
  const save = () => {
    try {
      localStorage.setItem(NOTES_KEY, area.value);
      status.textContent = 'Bu cihazda kaydedildi';
    } catch (error) {
      status.textContent = 'Kayıt izni yok';
    }
  };
  try { area.value = localStorage.getItem(NOTES_KEY) || ''; } catch (error) {}
  setCount();
  area.addEventListener('input', () => {
    status.textContent = 'Kaydediliyor…';
    setCount();
    clearTimeout(notesTimer);
    notesTimer = setTimeout(save, 300);
  });
  $('notes-save')?.addEventListener('click', save);
  $('notes-clear')?.addEventListener('click', () => {
    if (!area.value || !confirm('Bu cihazdaki notlar silinsin mi?')) return;
    area.value = '';
    localStorage.removeItem(NOTES_KEY);
    status.textContent = 'Notlar temizlendi';
    setCount();
  });
  $('notes-export')?.addEventListener('click', () => {
    const blob = new Blob([area.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ergin-lab-saha-notu.txt';
    link.click();
    URL.revokeObjectURL(url);
  });
}

bindChrome();
bindNotes();
loadAll();
setInterval(() => { renderMoon(); }, 60000);
setInterval(loadAll, 10 * 60 * 1000);

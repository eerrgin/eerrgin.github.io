/*
 * Cat identity lab: browser-side zero-shot image classification.
 * The model and runtime are downloaded from public CDNs on first use. The selected image
 * is passed to the model inside this browser; no image upload endpoint is used.
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const photoInput = $('catPhoto');
  const uploadZone = $('uploadZone');
  const preview = $('catPreview');
  const previewWrap = $('previewWrap');
  const fileName = $('fileName');
  const analyzeButton = $('analyzeCat');
  const clearButton = $('clearCat');
  const photoPanel = $('photoPanel');
  const traitsPanel = $('traitsPanel');
  const photoTab = $('photoTab');
  const traitsTab = $('traitsTab');
  const progressPanel = $('modelProgress');
  const statusNode = $('modelStatus');
  const percentNode = $('modelPercent');
  const progressBar = $('modelProgressBar');
  const result = $('catResult');
  const traitsResult = $('traitsResult');
  if (!photoInput || !analyzeButton) return;

  const breeds = [
    'Turkish Angora cat', 'Turkish Van cat', 'Maine Coon cat', 'British Shorthair cat',
    'Persian cat', 'Siamese cat', 'Ragdoll cat', 'Bengal cat', 'Sphynx cat',
    'Scottish Fold cat', 'Norwegian Forest cat', 'Siberian cat', 'Russian Blue cat',
    'Abyssinian cat', 'American Shorthair cat', 'Domestic Shorthair cat',
    'Devon Rex cat', 'Birman cat', 'Oriental Shorthair cat', 'Exotic Shorthair cat'
  ];
  const turkishNames = {
    'Turkish Angora cat': 'Ankara kedisi', 'Turkish Van cat': 'Van kedisi', 'Maine Coon cat': 'Maine Coon',
    'British Shorthair cat': 'British Shorthair', 'Persian cat': 'İran kedisi (Persian)', 'Siamese cat': 'Siyam kedisi',
    'Ragdoll cat': 'Ragdoll', 'Bengal cat': 'Bengal kedisi', 'Sphynx cat': 'Sfenks kedisi',
    'Scottish Fold cat': 'Scottish Fold', 'Norwegian Forest cat': 'Norveç Orman kedisi',
    'Siberian cat': 'Sibirya kedisi', 'Russian Blue cat': 'Russian Blue', 'Abyssinian cat': 'Habeş kedisi',
    'American Shorthair cat': 'American Shorthair', 'Domestic Shorthair cat': 'Kısa tüylü ev kedisi',
    'Devon Rex cat': 'Devon Rex', 'Birman cat': 'Birman', 'Oriental Shorthair cat': 'Oriental Shorthair',
    'Exotic Shorthair cat': 'Exotic Shorthair'
  };
  let imageUrl = null;
  let imageFile = null;
  let classifierPromise = null;
  let classifier = null;
  let busy = false;

  function setStatus(message, percent = null) {
    progressPanel.hidden = false;
    statusNode.textContent = message;
    if (percent === null || !Number.isFinite(percent)) {
      percentNode.textContent = '…';
      progressBar.style.width = '12%';
    } else {
      const bounded = Math.max(0, Math.min(100, percent));
      percentNode.textContent = `${Math.round(bounded)}%`;
      progressBar.style.width = `${Math.max(3, bounded)}%`;
    }
  }
  function idleStatus() { progressPanel.hidden = true; progressBar.style.width = '0'; }
  function showMessage(message) {
    result.replaceChildren();
    const span = document.createElement('span'); span.className = 'result-placeholder'; span.textContent = message; result.append(span);
  }
  function setBusy(next) {
    busy = next; analyzeButton.disabled = !imageFile || busy;
    if (busy) analyzeButton.querySelector('span')?.replaceChildren(document.createTextNode('…'));
    else analyzeButton.innerHTML = 'Görüntüyü analiz et <span>↗</span>';
  }
  function activateMode(mode) {
    const photo = mode === 'photo';
    photoPanel.hidden = !photo; traitsPanel.hidden = photo;
    photoTab.classList.toggle('active', photo); traitsTab.classList.toggle('active', !photo);
    photoTab.setAttribute('aria-selected', String(photo)); traitsTab.setAttribute('aria-selected', String(!photo));
  }
  photoTab.addEventListener('click', () => activateMode('photo'));
  traitsTab.addEventListener('click', () => activateMode('traits'));

  function useFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showMessage('Bu dosya bir görüntü değil. JPG, PNG veya WEBP dene.'); return; }
    if (file.size > 15 * 1024 * 1024) { showMessage('Bu görüntü 15 MB sınırını aşıyor. Daha küçük bir fotoğraf seç.'); return; }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageFile = file; imageUrl = URL.createObjectURL(file);
    preview.src = imageUrl; previewWrap.hidden = false; fileName.textContent = file.name;
    uploadZone.classList.add('has-image'); analyzeButton.disabled = false; idleStatus();
    showMessage('Fotoğraf hazır. Analizi başlatınca model tarayıcıda çalışır.');
  }
  photoInput.addEventListener('change', () => useFile(photoInput.files?.[0]));
  uploadZone.addEventListener('dragover', (event) => { event.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (event) => { event.preventDefault(); uploadZone.classList.remove('drag-over'); useFile(event.dataTransfer?.files?.[0]); });
  clearButton.addEventListener('click', () => {
    if (busy) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = null; imageFile = null; photoInput.value = ''; preview.removeAttribute('src'); previewWrap.hidden = true;
    uploadZone.classList.remove('has-image'); analyzeButton.disabled = true; idleStatus(); showMessage('Görüntü geldiğinde tahminler burada belirecek.');
  });

  async function loadClassifier() {
    if (classifier) return classifier;
    if (classifierPromise) return classifierPromise;
    classifierPromise = (async () => {
      setStatus('Görsel model yükleniyor. İlk kullanımda dosyalar indirilecek…');
      // jsDelivr serves the browser-ready module build. Inference is performed locally with ONNX Runtime.
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2');
      env.allowLocalModels = false;
      env.allowRemoteModels = true;
      env.useBrowserCache = true;
      const created = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', {
        progress_callback: (event) => {
          if (!event || typeof event !== 'object') return;
          if (event.status === 'initiate') setStatus(`Dosya hazırlanıyor: ${event.file || 'model'}`);
          else if (event.status === 'download') setStatus(`Model indiriliyor: ${event.file || 'dosya'}`);
          else if (event.status === 'progress') setStatus(`Model indiriliyor: ${event.file || 'dosya'}`, event.progress);
          else if (event.status === 'done') setStatus('Bir dosya tamamlandı. Model hazırlanıyor…', 100);
          else if (event.status === 'ready') setStatus('Model hazır. Görüntü okunuyor…', 100);
        }
      });
      classifier = created;
      return classifier;
    })().catch((error) => {
      classifierPromise = null;
      throw error;
    });
    return classifierPromise;
  }

  function renderClassification(items, mode) {
    result.replaceChildren();
    const top = items.slice(0, 5);
    const best = top[0];
    const head = document.createElement('div'); head.className = 'result-head';
    const title = document.createElement('strong'); title.textContent = turkishNames[best.label] || best.label.replace(/ cat$/i, '');
    const tag = document.createElement('span'); tag.textContent = mode === 'vision' ? 'MODEL TAHMİNİ' : 'ÖZELLİK EŞLEŞMESİ';
    head.append(title, tag);
    const caption = document.createElement('p'); caption.className = 'result-caption';
    caption.textContent = mode === 'vision'
      ? 'Modelin görseli karşılaştırdığı tanımlardan en yakınları. Puanlar doğrulanmış olasılık veya veteriner teşhisi değildir.'
      : 'Seçtiğin özelliklere göre ağırlıklandırılmış eşleşme. Görsel model kullanılmadı; farklı ırklar benzer görünebilir.';
    const list = document.createElement('div'); list.className = 'breed-list';
    top.forEach((item) => {
      const row = document.createElement('div'); row.className = 'breed-row';
      const label = document.createElement('span'); label.textContent = turkishNames[item.label] || item.label;
      const bar = document.createElement('span'); bar.className = 'breed-bar'; const fill = document.createElement('i'); fill.style.width = `${Math.max(2, Math.min(100, item.score * 100))}%`; bar.append(fill);
      const score = document.createElement('span'); score.className = 'breed-score'; score.textContent = `${Math.round(item.score * 100)}%`;
      row.append(label, bar, score); list.append(row);
    });
    result.append(head, caption, list);
  }

  analyzeButton.addEventListener('click', async () => {
    if (!imageFile || busy) return;
    setBusy(true); showMessage('Model hazırlanıyor…');
    try {
      const model = await loadClassifier();
      setStatus('Fotoğraf karşılaştırılıyor…', 100);
      const output = await model(imageUrl, breeds.map((breed) => `a clear photograph of a ${breed}, full cat visible`));
      if (!Array.isArray(output) || !output.length) throw new Error('Model sonuç üretmedi.');
      const normalized = output.map((item) => ({ label: item.label, score: Number(item.score) || 0 })).sort((a, b) => b.score - a.score);
      renderClassification(normalized, 'vision'); setStatus('Analiz tamamlandı.', 100);
      setTimeout(() => { progressPanel.hidden = true; }, 1900);
    } catch (error) {
      console.error('Cat visual model error:', error);
      progressPanel.hidden = true;
      showMessage('Görsel model başlatılamadı. Bağlantı, tarayıcı belleği veya model indirmesi engel olmuş olabilir. “Özelliklerle” sekmesindeki yerel eşleştirme kullanılabilir.');
    } finally { setBusy(false); }
  });

  // Interpretable fallback: rules-based trait matching, clearly labelled as such.
  const traitProfiles = [
    { label: 'Turkish Angora cat', fur: ['long','medium'], face: ['pointed','long'], pattern: ['solid','bicolor'], build: ['slender','medium'], points: { fur: 2, face: 2, pattern: 1, build: 1 } },
    { label: 'Turkish Van cat', fur: ['medium','long'], face: ['pointed','long'], pattern: ['bicolor'], build: ['medium','large'], points: { fur: 1, face: 1, pattern: 3, build: 1 } },
    { label: 'Maine Coon cat', fur: ['long'], face: ['long'], pattern: ['tabby','bicolor','solid'], build: ['large'], points: { fur: 2, face: 1, pattern: 1, build: 3 } },
    { label: 'British Shorthair cat', fur: ['short'], face: ['round'], pattern: ['solid','tabby','bicolor'], build: ['compact','medium'], points: { fur: 2, face: 3, pattern: 1, build: 2 } },
    { label: 'Persian cat', fur: ['long'], face: ['flat'], pattern: ['solid','bicolor'], build: ['compact','medium'], points: { fur: 3, face: 3, pattern: 1, build: 1 } },
    { label: 'Siamese cat', fur: ['short'], face: ['pointed','long'], pattern: ['point'], build: ['slender'], points: { fur: 1, face: 2, pattern: 3, build: 2 } },
    { label: 'Ragdoll cat', fur: ['long','medium'], face: ['pointed'], pattern: ['point','bicolor'], build: ['large','medium'], points: { fur: 2, face: 2, pattern: 2, build: 2 } },
    { label: 'Bengal cat', fur: ['short'], face: ['long'], pattern: ['tabby'], build: ['medium','large'], points: { fur: 2, face: 1, pattern: 3, build: 1 } },
    { label: 'Sphynx cat', fur: ['hairless'], face: ['pointed','long'], pattern: ['solid','bicolor'], build: ['slender','medium'], points: { fur: 4, face: 1, pattern: 1, build: 1 } },
    { label: 'Scottish Fold cat', fur: ['short','medium'], face: ['round'], pattern: ['solid','tabby','bicolor'], build: ['compact','medium'], points: { fur: 1, face: 3, pattern: 1, build: 2 } },
    { label: 'Norwegian Forest cat', fur: ['long'], face: ['pointed','long'], pattern: ['tabby','bicolor','solid'], build: ['large'], points: { fur: 3, face: 1, pattern: 1, build: 2 } },
    { label: 'Siberian cat', fur: ['long','medium'], face: ['round','long'], pattern: ['tabby','solid','bicolor'], build: ['large'], points: { fur: 2, face: 1, pattern: 1, build: 2 } },
    { label: 'Russian Blue cat', fur: ['short'], face: ['pointed'], pattern: ['solid'], build: ['slender','medium'], points: { fur: 2, face: 1, pattern: 2, build: 1 } },
    { label: 'Abyssinian cat', fur: ['short'], face: ['pointed'], pattern: ['solid','tabby'], build: ['slender'], points: { fur: 2, face: 1, pattern: 1, build: 2 } },
    { label: 'Domestic Shorthair cat', fur: ['short'], face: ['round','pointed','long'], pattern: ['solid','tabby','bicolor','point'], build: ['slender','medium','large','compact'], points: { fur: 1, face: 1, pattern: 1, build: 1 } },
    { label: 'Exotic Shorthair cat', fur: ['short'], face: ['flat'], pattern: ['solid','bicolor'], build: ['compact'], points: { fur: 1, face: 3, pattern: 1, build: 2 } }
  ];
  $('traitsForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget); const keys = ['fur','face','pattern','build'];
    const chosen = Object.fromEntries(keys.map((key) => [key, String(form.get(key) || 'any')]));
    const scored = traitProfiles.map((profile) => {
      let score = 0; let possible = 0;
      keys.forEach((key) => { if (chosen[key] !== 'any') { possible += profile.points[key]; if (profile[key].includes(chosen[key])) score += profile.points[key]; } });
      return { label: profile.label, score: possible ? score / possible : 0.5 };
    }).sort((a, b) => b.score - a.score).slice(0, 5);
    if (keys.every((key) => chosen[key] === 'any')) scored.forEach((item, i) => { item.score = [0.5,0.46,0.42,0.38,0.34][i]; });
    renderClassification(scored, 'traits');
  });

  window.addEventListener('beforeunload', () => { if (imageUrl) URL.revokeObjectURL(imageUrl); });
})();

import os
import zipfile

# Define target project structure and full code content
files_content = {
    "index.html": """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ergin Teknik Atölye · Görev Defteri</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="background-globes">
        <div class="globe globe-1"></div>
        <div class="globe globe-2"></div>
    </div>

    <header class="app-header">
        <div class="logo">
            <span class="icon">⚡</span>
            <h1>Görev Defteri</h1>
        </div>
        <p class="subtitle">Ergin Teknik Atölye için yerel talimat ve görev düzenleme alanı</p>
    </header>

    <main class="container">
        <section class="card form-section">
            <h2>Yeni Talimat Ekle</h2>
            <form id="promptForm">
                <div class="input-group">
                    <label for="title">Başlık</label>
                    <input type="text" id="title" placeholder="Örn: Python kodunu düzenle" required>
                </div>
                <div class="input-group">
                    <label for="category">Kategori</label>
                    <select id="category">
                        <option value="Kodlama">Kodlama / Yazılım</option>
                        <option value="Metin Yazımı">Metin & İçerik</option>
                        <option value="Görsel / Tasarım">Görsel / Tasarım</option>
                        <option value="Analiz">Analiz & Mantık</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="promptText">Talimat İçeriği</label>
                    <textarea id="promptText" rows="4" placeholder="Görev veya üretim talimatını buraya yazın..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">+ Talimat Kaydet</button>
            </form>
        </section>

        <section class="card list-section">
            <div class="list-header">
                <h2>Kayıtlı Talimatlar</h2>
                <div class="filter-box">
                    <input type="text" id="searchInput" placeholder="Talimat ara...">
                </div>
            </div>
            <div id="promptList" class="prompt-grid">
                <!-- JavaScript ile doldurulacak -->
            </div>
        </section>
    </main>

    <footer>
        <p>Geliştirici: <strong>Ergin Kaplan</strong> | <a href="https://github.com/eerrgin" target="_blank">GitHub Profile</a></p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
""",
    "style.css": """* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
    background-color: #0b0f19;
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
}

.background-globes {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
}

.globe {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.25;
}

.globe-1 {
    width: 350px;
    height: 350px;
    background: #6366f1;
    top: -50px;
    left: -50px;
}

.globe-2 {
    width: 400px;
    height: 400px;
    background: #06b6d4;
    bottom: -100px;
    right: -100px;
}

.app-header {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.logo h1 {
    font-size: 2.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #a5b4fc, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: #94a3b8;
    font-size: 0.95rem;
    margin-top: 0.5rem;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1rem;
    width: 100%;
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 1.5rem;
    flex: 1;
}

@media (max-width: 850px) {
    .container {
        grid-template-columns: 1fr;
    }
}

.card {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.card h2 {
    font-size: 1.25rem;
    margin-bottom: 1.2rem;
    color: #f8fafc;
}

.input-group {
    margin-bottom: 1rem;
}

.input-group label {
    display: block;
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 0.4rem;
}

input, select, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #f8fafc;
    font-size: 0.9rem;
    transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.btn {
    width: 100%;
    padding: 0.8rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.1s, background-color 0.2s;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-1px);
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-box input {
    width: 200px;
    padding: 0.5rem 0.8rem;
}

.prompt-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.prompt-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 0.2s;
}

.prompt-card:hover {
    border-color: #6366f1;
}

.prompt-badge {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.prompt-card h3 {
    font-size: 1rem;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
}

.prompt-card p {
    font-size: 0.85rem;
    color: #cbd5e1;
    line-height: 1.4;
    margin-bottom: 1rem;
    white-space: pre-wrap;
    max-height: 120px;
    overflow-y: auto;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-sm {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    border: none;
}

.btn-copy {
    background: #0f172a;
    color: #38bdf8;
    border: 1px solid #0284c7;
    flex: 1;
}

.btn-copy:hover {
    background: #0284c7;
    color: white;
}

.btn-delete {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
    background: #ef4444;
    color: white;
}

footer {
    text-align: center;
    padding: 1.5rem;
    color: #64748b;
    font-size: 0.85rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 2rem;
}

footer a {
    color: #818cf8;
    text-decoration: none;
}
""",
    "script.js": """const defaultPrompts = [
    {
        id: 1,
        title: "Kodu Optimize Et & Refactor Yap",
        category: "Kodlama",
        text: "Lütfen aşağıdaki kodu temiz kod (Clean Code) ilkelerine uygun şekilde refactor et, performans optimizasyonlarını açıkla ve karmaşıklığı azalt:"
    },
    {
        id: 2,
        title: "Teknik Dokümantasyon Yazıcı",
        category: "Metin Yazımı",
        text: "Verilen JavaScript fonksiyonu veya sınıfı için JSDoc formatında anlaşılır, örnek kullanımlar içeren profesyonel bir dokümantasyon oluştur."
    }
];

let prompts = JSON.parse(localStorage.getItem('ergin_prompts')) || defaultPrompts;

const promptForm = document.getElementById('promptForm');
const promptList = document.getElementById('promptList');
const searchInput = document.getElementById('searchInput');

function renderPrompts(filterText = '') {
    promptList.innerHTML = '';
    
    const filtered = prompts.filter(p => 
        p.title.toLowerCase().includes(filterText.toLowerCase()) ||
        p.category.toLowerCase().includes(filterText.toLowerCase()) ||
        p.text.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        promptList.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Henüz kayıtlı talimat bulunamadı.</p>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <div>
                <span class="prompt-badge">${escapeHtml(p.category)}</span>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.text)}</p>
            </div>
            <div class="card-actions">
                <button class="btn-sm btn-copy" onclick="copyPrompt('${p.id}')">📋 Kopyala</button>
                <button class="btn-sm btn-delete" onclick="deletePrompt('${p.id}')">Sil</button>
            </div>
        `;
        promptList.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

promptForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const text = document.getElementById('promptText').value.trim();

    if (!title || !text) return;

    const newPrompt = {
        id: Date.now().toString(),
        title,
        category,
        text
    };

    prompts.unshift(newPrompt);
    saveAndRender();
    promptForm.reset();
});

function deletePrompt(id) {
    prompts = prompts.filter(p => p.id.toString() !== id.toString());
    saveAndRender();
}

function copyPrompt(id) {
    const prompt = prompts.find(p => p.id.toString() === id.toString());
    if (prompt) {
        navigator.clipboard.writeText(prompt.text).then(() => {
            alert('Talimat panoya kopyalandı!');
        });
    }
}

function saveAndRender() {
    localStorage.setItem('ergin_prompts', JSON.stringify(prompts));
    renderPrompts(searchInput.value);
}

searchInput.addEventListener('input', (e) => {
    renderPrompts(e.target.value);
});

// Sayfa yüklendiğinde çalıştır
renderPrompts();
""",
    "README.md": """# ERGİN TEKNİK ATÖLYE · GÖREV DEFTERİ

Ergin Teknik Atölye projelerinde kullanılabilecek talimatları ve görev metinlerini düzenlemek için hazırlanmış yerel bir panel.

## 🚀 Özellikler
- **Kategori Bazlı Düzen:** Kodlama, metin, tasarım ve analiz talimatlarını sınıflandırma.
- **Hızlı Kopyalama:** Seçili talimatı tek tıkla panoya alma.
- **Yerel Depolama (LocalStorage):** Veriler tamamen kullanıcının tarayıcısında saklanır, veri kaybı yaşanmaz.
- **Anlık Arama:** Başlık veya içerik üzerinden canlı filtreleme.
- **Modern UI/UX:** Dark-mode ve responsive tasarım.

## 💻 Teknolojiler
- HTML5 & CSS3 (Custom Variables, Flexbox, Grid)
- JavaScript (ES6+, LocalStorage API)

---
*Geliştirici: **Ergin Kaplan***
"""
}

# Create zip file
zip_filename = "ergin-teknik-atolye-gorev-defteri.zip"
with
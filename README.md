# eerrgin — Gece Vardiyası

Bu paket, `https://eerrgin.github.io/` için yenilenmiş ana sayfa ve kedi görsel modeli deneyini içerir. Tasarım; gece manzarası, retro donanım hissi, sıcak amber ışıklar, yerel ses üretimi ve küçük bir dijital arşiv etrafında kuruldu.

## Paket içeriği

- `index.html` — yeni ana sayfa, proje bağlantıları ve içerik bölümleri
- `style.css` — masaüstü, tablet ve mobil tasarım
- `script.js` — saat, hava, GitHub depo radarı, Hacker News başlıkları, Wikipedia maddesi, arşiv, komut menüsü, ses motoru ve yerel ses dosyası oynatıcı
- `cat-ai.js` — tarayıcıda çalışan görsel sınıflandırma deneyi ve açıklanabilir özellik eşleştirmesi

## Depoya yerleştirme

1. ZIP'i bilgisayarında aç.
2. Depodaki mevcut dosyaları silmeden, ZIP içindeki `index.html`, `style.css`, `script.js` ve `cat-ai.js` dosyalarını deponun kök dizinine kopyala.
3. GitHub'da bu dört dosyayı yükle veya var olanlarla değiştir ve commit et.
4. GitHub Pages güncellemesinin ardından `https://eerrgin.github.io/` adresini yenile. Önbellekte eski sürüm görünürse sert yenileme yap (`Ctrl+F5`).

**Önemli:** Bu ZIP tüm GitHub deponun aynası değildir; güncellenen ana sayfa dosyalarını ve yeni AI modülünü içerir. `message.html`, `oku.html`, `llms.txt`, `veil.sig`, ses/görsel arşivleri ve diğer destek dosyalarını depodan silme. Bunlar ayrı sayfalar veya arşiv için kullanılmaya devam edebilir.

## Kedi görsel modeli hakkında

Fotoğraf analizi, Hugging Face Transformers.js ve `Xenova/clip-vit-base-patch32` modeliyle tarayıcıda yapılır. İlk kullanımda kod ve model dosyaları CDN/Hugging Face üzerinden indirilir; bağlantı ve cihaza göre bir süre beklemek gerekebilir. Seçtiğin fotoğraf analiz API'sine gönderilmez; çıkarım tarayıcıda yapılır. Model yüklenemezse uygulama bunu bildirir. `Özelliklerle` modu ise görsel yapay zekâ değildir: seçilen tüy, yüz, desen ve vücut özelliklerini basit kurallarla karşılaştırır.

Bu deney ırkı kesin olarak belirlemez. Özellikle melez kedilerde ve benzer görünümlü ırklarda tahminler yanlış olabilir; ekrandaki puanlar kalibre edilmiş olasılık değildir.

## Çalışma notları

- Ses odası, Web Audio API ile anlık ses katmanları üretir. Otomatik çalma yoktur; ses kullanıcı düğmeye basınca başlar.
- Yerel ses dosyası yalnızca açık tarayıcı sekmesinde oynatılır; dosya yüklenmez.
- GitHub, Open-Meteo, Hacker News ve Wikipedia alanları ek ağ isteği yapar. Yanıt alamadıklarında sayfanın ana bölümleri ve sabit proje bağlantıları çalışmayı sürdürür.
- Site ziyaretçi takibi veya reklam kodu eklemez.

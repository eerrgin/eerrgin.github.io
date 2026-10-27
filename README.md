# ERGİN TEKNİK ATÖLYE — Gece Vardiyası

`https://eerrgin.github.io/` adresinde yayınlanan kişisel site. Düz HTML, CSS ve JavaScript; derleme adımı yok.

## Sayfada neler var

- **Hava durumu şeridi** — sayfanın en üstünde, İstanbul için anlık durum ve 3 günlük tahmin ([Open-Meteo](https://open-meteo.com/), anahtar gerekmez). Yanıt gelmezse şerit hata mesajı gösterir, sayfa çalışmaya devam eder.
- **İstanbul arşivi** — Galata Kulesi, Eminönü, Samatya, Ayasofya, Süleymaniye ve Kız Kulesi kartları. Ana sayfa şu anda görseller için `photos/*.jpg` dosyalarını kullanır; `assets/istanbul/` SVG'leri yardımcı/eski görsel varlıklarıdır.
- **Atölye, kedi laboratuvarı, Greyfield FM, arşiv** — projeler, tarayıcıda çalışan özellik karşılaştırma, Web Audio ile üretilen ses ve kısa notlar.
- **MycelForge** — `/mycelforge/` altında yayınlanan miselyum biyomalzeme formül/protokol tarama arayüzü. Kaynak kodu ayrı [MycelForge deposunda](https://github.com/eerrgin/mycelforge); siteye otomatik olarak derlenip kopyalanır.

## Dosya düzeni

| Yol | Görev |
| --- | --- |
| `index.html`, `style.css` | Ana sayfa yapısı ve görünüm |
| `fx.js`, `script.js`, `tigerk.js`, `hat.js` | Arka plan, hava durumu, etkileşimler, tarayıcı ağı ve HAT terminali |
| `photos/`, `fonts/`, `assets/` | Görseller, yazı tipleri, SVG'ler |
| `ergin-lab/` | Mini web deneyleri (ayrı alt sayfalar) |
| `404.html` | Bulunamayan adresler için sayfa |
| `scripts/check.mjs` | Yerel bağlantılar, çapalar, CSS varlıkları, JSON/JSONC, JavaScript ve ana sayfa kopyalarının kontrolü |
| `.github/workflows/ci.yml` | Her push ve pull request'te HTML/bağlantı/JSON/JavaScript kontrolü |
| `public/`, `src/`, `server/`, `vite.config.js` | Tarihsel/yardımcı uygulama dosyaları; ana sayfanın GitHub Pages yayını kök HTML dosyalarından yapılır |
| `cat-ai.js` | Ana sayfaya şu an bağlı değil (tarayıcıda görsel sınıflandırma denemesi) |

## Yerelde çalıştırma ve kontrol

```bash
node scripts/check.mjs      # ya da: npm run check
python3 -m http.server 8000 # http://localhost:8000
```

## Yayın

GitHub Pages ana site için `main` dalının kökünden yayınlanır. Her push ve pull request'te `.github/workflows/ci.yml` yerel dosya, HTML, çapa, JSON ve JavaScript kontrollerini çalıştırır. MycelForge sürümü `.github/workflows/mycelforge-publish.yml` ile ayrı depodan çekilir, test edilir ve `/mycelforge/` altına derlenir.

## Gizlilik

Analitik, reklam ve takip kodu yok. Hava durumu şeridi Open-Meteo'ya, kedi ve ses bölümleri yalnızca tarayıcıya yerel çalışır. Ayrıntı: `LEGAL-AND-DEPLOY.md`, `llms.txt`.

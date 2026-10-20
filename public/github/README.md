# eerrgin — Gece Vardiyası

`https://eerrgin.github.io/` adresinde yayınlanan kişisel site. Düz HTML, CSS ve JavaScript; derleme adımı yok.

## Sayfada neler var

- **Hava durumu şeridi** — sayfanın en üstünde, İstanbul için anlık durum ve 3 günlük tahmin ([Open-Meteo](https://open-meteo.com/), anahtar gerekmez). Yanıt gelmezse şerit hata mesajı gösterir, sayfa çalışmaya devam eder.
- **İstanbul arşivi** — Galata Kulesi, Eminönü, Samatya, Ayasofya, Süleymaniye ve Kız Kulesi. Kartlar `photos/` altındaki görselleri kullanır. `assets/istanbul/` siluetleri duruyor, silinmedi.
- **Atölye, kedi laboratuvarı, Greyfield FM, arşiv** — projeler, tarayıcıda çalışan özellik karşılaştırma, Web Audio ile üretilen ses ve kısa notlar.
- **KAVRA** — [Python deposundaki](https://github.com/eerrgin/KAVRA) nöron / katman / sigmoid / geri yayılım iskeletinin tarayıcı provası. Anahtar yok, istek yok. Ağırlık `localStorage` içinde kalır.
- **HAT** — gece sevk terminali. Sağ alttaki düğme ya da başlıktaki HAT. Komut ya da düz Türkçe cümle aynı yerel ağa gider.
- **Titreşim teması** — `gece`, `amber`, `kemik`, `sis`. Üst çizgi titrer. Telefon izin verirse kısa bir vuruş olur. Kapatmak: terminalde `titreşim kapa`.

## Dosya düzeni

| Yol | Görev |
| --- | --- |
| `index.html`, `style.css`, `script.js` | Ana sayfa |
| `kavra.js` | Yerel sinir ağı: sigmoid, MSE, geri yayılım |
| `hat.js` | HAT sevk terminali |
| `photos/`, `fonts/`, `assets/` | Görseller, yazı tipleri, SVG'ler |
| `ergin-lab/` | Mini web deneyleri (ayrı alt sayfalar) |
| `404.html` | Bulunamayan adresler için sayfa |
| `scripts/check.mjs` | Bağlantı, çapa, JSON/JS/SVG ve temel HTML kontrolü |
| `.github/workflows/ci.yml` | Her push ve pull request'te kontrolü çalıştırır |
| `public/`, `vite.config.js`, `package.json` | Eski Vite kalıntısı; yayın bunlara bağlı değil |
| `cat-ai.js` | Ana sayfaya şu an bağlı değil (tarayıcıda görsel sınıflandırma denemesi) |

## Yerelde çalıştırma ve kontrol

```bash
node scripts/check.mjs      # ya da: npm run check
python3 -m http.server 8000 # http://localhost:8000
```

## Yayın

GitHub Pages `main` dalının kökünden yayınlanır (Settings → Pages → Deploy from a branch → `main` / root). `main`'e gönderilen her değişiklik yayına çıkar; CI yalnızca hataları önceden yakalar.

## Gizlilik

Analitik, reklam ve takip kodu yok. Hava durumu şeridi Open-Meteo'ya, kedi ve ses bölümleri yalnızca tarayıcıya yerel çalışır. Ayrıntı: `LEGAL-AND-DEPLOY.md`, `llms.txt`.

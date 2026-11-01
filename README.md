# ERGİN TEKNİK ATÖLYE — Gece Vardiyası

`https://eerrgin.github.io/` adresinde yayınlanan kişisel site. Düz HTML, CSS ve JavaScript; derleme adımı yok.

## Sayfada neler var

- **İstanbul gece haritası** — yalnızca bu depo için oluşturulmuş, ölçeksiz yerel SVG şeması; hava, deprem veya konum servisi çağırmaz.
- **İstanbul arşivi** — Galata Kulesi, Eminönü, Samatya, Ayasofya, Süleymaniye ve Kız Kulesi kartları. Ana sayfa, `photos/` altındaki kişisel gece fotoğraf seçkisini ve `assets/illustrations/*.svg` altındaki özgün şemaları birlikte kullanır.
- **Atölye, kedi laboratuvarı, Greyfield FM, arşiv** — projeler, tarayıcıda çalışan özellik karşılaştırma, Web Audio ile üretilen ses ve kısa notlar.
- **MycelForge** — `/mycelforge/` altında yayınlanan miselyum biyomalzeme formül/protokol tarama arayüzü. Kaynak kodu ayrı [MycelForge deposundadır](https://github.com/eerrgin/mycelforge); bu sitedeki sayfa yalnızca kaynak depoya yönlendiren hafif bir bağlantıdır.


- **Performans Laboratuvarı** — `/performance-lab/` altında aynı veri üzerinde algoritma sürelerini ölçen, sonuçları doğrulayan ve mikro-benchmark sınırlarını açıklayan tarayıcı deneyi.
- **Samatya Topos yöntem notu** — `/samatya-sky/hesaplama-yontemi.html` altında Kepler hesabı, koordinat dönüşümü, veri kaynakları, belirsizlikler ve doğrulama planı.
- **Çalışma tepsisi** — ana sayfada astronomi, atmosfer, kuş arşivi, Ergin Lab, performans, dayanıklılık testleri, MycelForge ve güvenlik araçlarını tek bir mobil uyumlu dizinde toplar.

## Dosya düzeni

| Yol | Görev |
| --- | --- |
| `index.html`, `style.css` | Ana sayfa yapısı ve görünüm |
| `fx.js`, `script.js`, `tigerk.js`, `hat.js` | Atmosfer, yerel etkileşimler, tarayıcı ağı ve HAT terminali |
| `assets/illustrations/`, `assets/` | Özgün vektör çizimler ve SVG arayüz varlıkları |
| `ergin-lab/` | Mini web deneyleri (ayrı alt sayfalar) |
| `404.html` | Bulunamayan adresler için sayfa |
| `scripts/check.mjs` | Yerel bağlantılar, çapalar, CSS varlıkları, JSON/JSONC, JavaScript ve ana sayfa kopyalarının kontrolü |
| `.github/workflows/ci.yml` | Her push ve pull request'te HTML/bağlantı/JSON/JavaScript kontrolü |
| `public/`, `src/`, `server/`, `vite.config.js` | Tarihsel/yardımcı uygulama dosyaları; ana sayfanın GitHub Pages yayını kök HTML dosyalarından yapılır |
| `kedi-gorsel-modeli.js` | Ana sayfaya bağlı olmayan görsel sınıflandırma deneyi |

## Yerelde çalıştırma ve kontrol

```bash
node scripts/check.mjs      # ya da: npm run check
python3 -m http.server 8000 # http://localhost:8000
```

## Yayın

GitHub Pages ana site için `main` dalının kökünden yayınlanır. Her push ve pull request'te `.github/workflows/ci.yml` yerel dosya, HTML, çapa, JSON ve JavaScript kontrollerini çalıştırır. MycelForge sayfası `/mycelforge/` altında ayrı kaynak depoya yönlendiren statik bir bilgi sayfasıdır; otomatik paket yayımlayan iş akışı kaldırılmıştır.

## Gizlilik

Analitik, reklam, sosyal medya takip kodu veya canlı veri servisi yok. Radyo sesleri tarayıcıda üretilir; seçilen yerel ses dosyası sunucuya gönderilmez. Ayrıntı: `LEGAL-AND-DEPLOY.md`, `THIRD-PARTY-NOTICES.md`, `ATOLYE-REHBERI.txt`.

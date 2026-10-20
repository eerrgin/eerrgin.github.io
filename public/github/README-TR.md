# eerrgin — Gece Vardiyası

Ana belge için `README.md` dosyasına bak. Kısa özet:

- Site GitHub Pages ile `main` dalının **kök** dizininden yayınlanır; `index.html`, `style.css`, `script.js`, `kavra.js`, `hat.js`, `photos/`, `fonts/` ve `assets/` aynı seviyede kalmalı.
- Eski görünüm çoğu zaman tarayıcı önbelleğinden gelir: **Ctrl+Shift+R** (Mac: Cmd+Shift+R). `script.js` eski service worker kayıtlarını kendiliğinden temizler.
- Değişiklikten önce `node scripts/check.mjs` çalıştır; kırık bağlantı ve sözdizimi hatalarını yakalar.
- `ergin-lab/`, `kirpintilar/`, `message.html`, `oku.html` gibi eski sayfaları silme.
- HAT terminali ve Kavra ağı ana sayfadadır. İkisi de sunucusuz çalışır.

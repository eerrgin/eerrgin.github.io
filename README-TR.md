# eerrgin — Gece Vardiyası (düzeltme paketi)

Bu zip **depo köküne** açılır. Ara klasör yok.

## Mutlaka yap

1. Zip'i bilgisayarda aç.
2. Şunları `eerrgin.github.io` **köküne** kopyala (üzerine yaz):

```
index.html
style.css
script.js
sw.js
favicon.svg
photos/          (klasörün tamamı)
fonts/           (klasörün tamamı)
```

3. Eski bozuk görünüm çoğu zaman **service worker önbelleğinden** geliyor.
   - `sw.js` bu pakette var: eski cache'i silip kendini kaldırır.
   - Yükledikten sonra sitede **Ctrl+Shift+R** (Mac: Cmd+Shift+R) yap.
   - Hâlâ bozuksa tarayıcıda: Geliştirici araçları → Application → Service Workers → Unregister, Cache Storage → Delete.

4. `ergin-lab/`, `kirpintilar/`, `message.html`, `oku.html` gibi eski klasör/sayfaları **silme**.

5. `photos/` ve `fonts/` klasörleri index ile **aynı seviyede** olmalı:

```
eerrgin.github.io/
  index.html
  style.css
  script.js
  sw.js
  favicon.svg
  photos/
    gece-hatti.jpg
    ...
  fonts/
    instrument.woff2
    ...
  ergin-lab/   (eski, kalsın)
```

Yan klasöre (`public/`, `assets/` vb.) atma. GitHub Pages kök `index.html` dosyasını okur.

## Kontrol

Aç: https://eerrgin.github.io/  
Arka plan koyu siyah, kırmızı çizgi üstte, fotoğraflar yüklenmeli.

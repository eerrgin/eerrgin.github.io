# GREYFIELD FM — eerrgin kişisel site paketi

Bu paket, `eerrgin.github.io` deposunun mevcut görsel kimliğini (karanlık metal, pas kırmızısı, CRT/retro cihaz hissi, yerel kırıntılar, `0xB16B00B5_ACTIVE`) koruyup yeni etkileşimler eklemek için hazırlandı. Framework bağımlılığı yok; HTML, CSS ve vanilla JavaScript kullanır.

## Dosyalar

- `index.html` — ana sayfa ve semantik içerik
- `style.css` — masaüstü/mobil arayüz, etkileşimler ve erişilebilir hareket azaltma kuralları
- `script.js` — saat, hava durumu, GitHub/Hacker News/Wikipedia akışları, görsel galeri, komut paleti, özgün Web Audio radyo ve yerel teyp
- `assets/` — bu paket için oluşturulmuş SVG çizimler ve ikonlar
- `manifest.webmanifest`, `sw.js` — ana ekrana ekleme ve sınırlı uygulama-kabuğu çevrimdışı desteği
- `llms.txt` — site hakkında düz metin notları; gizli talimat veya yapay zekâyı kandırma iddiası değil
- `LEGAL-AND-DEPLOY.md` — yayın öncesi kontrol listesi

## Depoya kurulum

1. Önce GitHub deposunu bilgisayarına indir veya mevcut dosyalarını ayrı bir yedeğe al.
2. Bu paketteki `index.html`, `style.css`, `script.js`, `llms.txt`, `manifest.webmanifest`, `sw.js` dosyalarını deponun köküne kopyala ve eskilerinin üzerine yaz.
3. Bu paketteki `assets/` klasörünü depodaki `assets/` klasörüyle birleştir. Var olan dosyaları silme; isim çakışması varsa önce yedekle.
4. `README.md`, `package.json`, `pnpm-lock.yaml` ve `vite.config.js` dosyalarını otomatik olarak değiştirme. Bu paket derleme aracı istemeyen bir statik ana sayfadır; var olan Vite yapılandırman aynen kalabilir.
5. Vite build kullanıyorsan paket içindeki `public/` klasörünü mevcut deponun `public/` klasörüyle birleştir. Eski görsellerin ve yayınlama hakkın olan `7mix.mp3` dosyasının derleme sonucuna dahil olması için ilgili dosyaları `public/` içine de kopyala; bu ses dosyası pakete dahil değildir. Düz statik yayın yapıyorsan kökteki dosyalar yeterlidir.
6. GitHub Pages / Vercel tarafında yayımlama yolunun gerçekten kökteki `index.html` dosyasını kullandığını doğrula. Projen Vite build ile dağıtılıyorsa `pnpm build` sonucundaki `dist/` içeriğinin deploy edildiğinden emin ol.
7. Yayından sonra masaüstünde ve telefonda kontrol et. Service Worker nedeniyle eski CSS/JS görünürse tarayıcı önbelleğini temizle veya bir sonraki sürümde `sw.js` içindeki `CACHE_NAME` değerini artır.

## Kısayollar

- `Ctrl+K` / `⌘K`: komut paleti
- Komut paletinde `radyo`, `kırıntı`, `github`, `cep modu` gibi aramalar
- Mobil alttaki çubuk: frekans, kırıntı, cep modu, komut
- “Cep modu”: isteğe bağlı canlı haber panelini saklayıp daha sade bir görünüm sunar
- Radyo yalnızca düğmeye basınca başlar; ses tarayıcı içinde üretilir

## Hata toleransı

Hava durumu, GitHub, Hacker News veya Wikipedia bağlantısı çalışmasa da yerel sayfa, projeler, notlar, görsel yedekleri ve sentez radyo çalışmaya devam eder. Dinamik başlıklar farklı ağ koşullarında gecikebilir veya geçici olarak görünmeyebilir.

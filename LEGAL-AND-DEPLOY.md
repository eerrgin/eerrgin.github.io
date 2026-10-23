# Yayın öncesi yasal ve teknik kontrol

Bu dosya hukuki görüş değildir. Her dosyanın ve bağlantının izin durumunu sahibinin doğrulaması gerekir.

## Müzik / ses

- Greyfield FM içindeki üç kanal, sayfa çalışırken Web Audio API ile sentetik ses üretir. Üçüncü taraf şarkı veya internet radyosu stream'i pakete dahil edilmemiştir.
- Depoda mevcut `7mix.mp3` dosyası ZIP'e kopyalanmamıştır. Site, bu dosya deponun kökünde bulunuyorsa isteğe bağlı çalmayı dener; ayrıca ziyaretçinin kendi cihazından bir dosya seçmesine izin verir.
- `7mix.mp3` kaydını yayımlama/çalma hakkın yoksa depodan kaldır veya başka kişilerin telifsiz/izinli kullanımına açık bir kayıtla değiştir. Bir parçanın SoundCloud'da bulunması otomatik olarak başka bir sitede yeniden yayımlama izni anlamına gelmez.
- Önceki SoundCloud adresi yalnızca dış bağlantı olarak durur; ses gömülmez, indirilmez veya kopyalanmaz. Bağlantının hâlâ istediğin parça olduğuna kendin bak.
- Üçüncü taraf internet radyosu eklemeden önce istasyonun embed/stream kullanım şartlarını ayrıca oku. Bir radyo sitesinin herkese açık olması, yayını kendi sayfana gömebileceğin anlamına gelmez.

## Canlı veri kaynakları

- Open-Meteo: hava verisi yanıtı geldiğinde sıcaklık ve hava durumu gösterilir; altbilgide kaynağa bağlantı var. Open-Meteo ücretsiz API kullanımını ticari olmayan kullanım ve CC BY 4.0 şartlarına bağlar. Siteyi reklam, abonelik veya başka bir ticari etkinlik için kullanacaksan planını ve koşulları tekrar doğrula.
- Hacker News: resmi herkese açık Firebase API'sinden başlık, puan ve yorum sayısı okunur; haber yazıları kopyalanmaz, kaynak sayfasına bağlantı verilir.
- Wikipedia: rastgele sayfa özeti, makale bağlantısı ve katkı geçmişi bağlantısı gösterilir. Metin CC BY-SA yükümlülükleri kapsamında kaynak gösterilerek kullanılır; Wikipedia'nın kendi politika/atıf şartları zamanla değişebileceği için yeniden dağıtım veya kapsamlı alıntıda güncel koşulları kontrol et.
- GitHub: yalnızca `eerrgin` kullanıcısının herkese açık repo metaverisi çekilir. Depo API'si yanıt vermediğinde yerel projeler bölümü kalır.
- Tesla, xAI ve Elon Musk bağlantıları resmî kaynağa yönlendirir. Başlık veya gönderi kazıma, taklit içerik, logo dosyası ya da başka sitelerden haber metni kopyalama yapılmaz.

## Gizlilik ve ağ

- Analitik, reklam, sosyal medya takip kodu ve Google Fonts isteği yoktur.
- Canlı özellikler harici API'lere istek gönderir; bu kaynakların kendi sunucu logları/koşulları bu sitenin kontrolünde değildir.
- Web Audio yalnızca kullanıcı başlattığında çalar. Yerel dosya seçimi bir tarayıcı `blob:` adresi kullanır; dosya bu kod tarafından sunucuya yüklenmez.
- `sw.js` eski sürüm önbelleklerini silip kendini kayıttan çıkaran bir uyumluluk temizleyicisidir; çevrimdışı önbellek veya çevrimdışı çalışma vaadi vermez. `script.js` de eski service worker kayıtlarını ve önbellekleri temizler.

## MycelForge yayın yolu

- MycelForge'un kaynak kodu ayrı `eerrgin/mycelforge` deposunda tutulur. `.github/workflows/mycelforge-publish.yml`, bu kaynağı test edip `/mycelforge/` altına statik dosya olarak derler.
- `mycelforge/index.html` ve `mycelforge/assets/` oluşturulmuş çıktılardır; bunları elle düzenlemek yerine kaynak depoyu düzelt.
- `.github/workflows/ci.yml` HTML, dosya, çapa, JSON, SVG/XML ve JavaScript kontrollerini çalıştırır.

## Repoda temizlik

Şimdilik `message.html`, `oku.html`, `kirpintilar/`, `ergin-lab/`, `public/`, eski görseller, `.gitignore`, `.nojekyll`, `package.json`, `pnpm-lock.yaml` ve `vite.config.js` dosyalarını silme. Kullanımını tüm sayfalar ve dağıtım ayarları üzerinden doğrulamadan silmek eski bağlantıları ya da build'i bozabilir. Önce yeni siteyi bir dalda dene; eski dosyaları ancak bağımlı olmadıklarını kanıtlayınca temizle.

# Yayın öncesi lisans ve kaynak envanteri

Bu dosya hukuki görüş değildir; depodaki kullanılan varlıkları ve teknik kaynakları açıkça kaydeder.

## Medya ve yazı tipleri
- Kaynağı veya yeniden yayımlama hakkı doğrulanamayan raster fotoğraflar, ekran görüntüleri, profil görselleri, video, MP3 ve yerel font dosyaları depodan çıkarıldı.
- Bunların yerine `assets/illustrations/*.svg` altında bu depo için sıfırdan hazırlanmış vektör çizimler kullanılır. Çizimler tarihî fotoğraf, gerçek mekân fotoğrafı veya arşiv belgesi değildir.
- `7mix.mp3` ve eski kopyaları kaldırıldı. Radyo kanalları Web Audio ile tarayıcıda sentezlenir. Kullanıcının kendi ses dosyası seçimi yerel `blob:` URL kullanır; dosya sunucuya yüklenmez.
- BLOK3 bağlantısı yalnızca YouTube'a dış bağlantıdır. Video gömülmez, ses indirilmez, kopyalanmaz veya sitede yeniden yayımlanmaz.

## Harici çalışma zamanı
- Google Fonts ve harici font yüklemeleri kaldırıldı; sistem font yığınları kullanılır.
- Open-Meteo hava/hava kalitesi çağrıları, USGS ve ISS veri çağrıları ile OpenStreetMap karo görselleri kaldırıldı. İstanbul kokpiti artık yalnızca yerel, ölçeksiz SVG şemasıdır; canlı veri veya navigasyon iddiası yoktur.
- Samatya Topos, Three.js 0.170.0 modülünü jsDelivr üzerinden yüklemeyi sürdürür. Three.js MIT lisanslıdır; tam bildirim `THIRD-PARTY-NOTICES.md` dosyasındadır.
- Diğer dış URL'ler (Wikipedia, GitHub, YouTube ve tarihî kurumlar) içerik gömmek yerine kaynak/başvuru bağlantısı olarak kullanılır.

## Kod lisansı ve kapsam
- `LICENSE-CODE.txt`, bu depo için hazırlanan kodu ve özgün SVG varlıklarını MIT lisansı altında kapsar.
- Bu lisans, dış bağlantı verilen üçüncü taraf sitelerin içeriği, markaları veya ayrı depolardaki yazılımlar üzerinde hak vermez.
- `ergin-ustalik-rotasi/` kendi lisans ve NOTICE dosyalarını taşır.
- `mycelforge/` altında üçüncü taraf kütüphane içeren derlenmiş web paketi kaldırıldı; sayfa kaynak depoya yönlendiren sade bir bilgi kartıdır.

## Son kontrol
Bir dış servis, medya, veri kümesi veya kütüphane yeniden eklenirse kaynağı ve tam lisans metni kontrol edilmeli; gerekli atıf ve bildirim aynı commit içinde eklenmelidir. İzin durumu belirsiz öğe canlı yayına alınmamalıdır.

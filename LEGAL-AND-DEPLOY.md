# Yayın öncesi lisans ve kaynak envanteri

Bu dosya hukuki görüş değildir; depodaki kullanılan varlıkları ve teknik kaynakları açıkça kaydeder.

## Medya ve yazı tipleri
## Ana sayfa fotoğraf seçkisi
- Önceki ana sayfa konseptinde kullanılan 14 fotoğraf (photos/*.jpg) Git geçmişinden, depo sahibinin açık talebiyle geri getirildi.
- Depo sahibi seçkinin bir bölümünü kendi ürettiğini, bir bölümünü düzenlediğini belirtiyor. Her fotoğrafın ilk üreticisi ve üçüncü taraf hak zinciri bu depodan bağımsız olarak doğrulanmış değil.
- Fotoğrafın yaşı tek başına kamu malı statüsü veya telif hakkının sona erdiği anlamına gelmez. Bu geri yükleme, fotoğrafların anonim ya da kamu malı olduğu iddiasını içermez. Ticari/yeniden dağıtım kullanımlarında dosya bazında izin kanıtı saklanmalıdır.
- Ekran görüntüleri, profil ikonları, video, MP3, yerel font dosyaları, eski ZIP arşivleri ve üçüncü taraf derlenmiş paketler hâlâ depoda değildir.
- Ana sayfanın eski fotoğraf alanları bu yerel seçkiyle çalışır; harici fotoğraf API'si veya harita karosu eklenmedi.
- Yeni SVG çizimler (`assets/illustrations/*.svg`) fotoğraf olmayan, bu depo için hazırlanmış vektör illüstrasyonlardır.
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

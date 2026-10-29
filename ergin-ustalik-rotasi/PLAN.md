# Ergin Ustalık Rotası
**Ana Öğrenim ve Üretim Planı · EL-ROT-001 · Sürüm 0.1.0**

- **Atölye:** Ergin Atölye
- **Dönem:** 2 Kasım 2026 – 29 Ekim 2027
- **Ritim:** haftalık teslim, aylık uçtan uca ürün, her hafta teknik yazı
- **Kapsam:** Python, Java, HTML/CSS/JavaScript/TypeScript, üretken sistemler ve ajanlar, test/değerlendirme, yayınlama ve portföy.

> Bu plan patent, marka tescili veya hukuki inceleme yerine geçmez. Kod için Apache-2.0 lisansı seçildi. Patent lisansı yalnızca katkıda bulunan kişinin lisanslama yetkisi bulunan ve lisansın tarif ettiği istemleri kapsar. Proje adı için ayrıca benzerlik ve marka araştırması gerekir. Üçüncü taraf varlık veya kod eklenirse lisans doğrulanmalı ve NOTICE dosyasında belirtilmelidir.

## 1. Ölçülebilir teslim sistemi

Her haftanın cuma günü tarihli bir sürüm/etiket veya yayın engeli kaydı teslim edilir. İş ancak şu beş kanıt tamamlanınca “bitti” sayılır:

1. **Öğrenme:** 1–3 sayfalık kavram notu ve kaynak listesi.
2. **Uygulama:** çalıştırılabilir örnek, modül veya proje değişikliği.
3. **Test:** otomatik test çıktısı, sınır durumları ve bilinen kusurlar.
4. **Dokümantasyon:** kurulum/kullanım notu ve gerekiyorsa mimari karar kaydı.
5. **Yayın:** değişiklik günlüğü, sürüm izi, teknik yazı veya demo bağlantısı.

### Başarı eşikleri
- Testler: ilk çeyrek sonunda genel satır kapsamı en az %70, ikinci çeyrek %80, final çeyrekte %85 hedeflenir. Kapsam yüzdesi tek başına kalite kanıtı değildir.
- Performans: kritik yol için aynı ortamda en az 10 tekrar; medyan ve p95; önce/sonra karşılaştırması.
- Güvenlik: yayından önce statik analiz, bağımlılık taraması ve gizli anahtar taraması; açık kritik/yüksek bulgu sıfır veya yazılı risk kabulü.
- Erişilebilirlik: klavye ile tam kullanım, görünür odak, anlamlı etiketler, kontrast ve azaltılmış hareket kontrolü.
- Kaynaklı yanıt: kaynak eşleşmesi en az %95 hedef; test setinde desteklenmeyen kritik iddia sayısı 0 hedef.
- Yayın: sürüm notu, kurulum adımları, geri alma yöntemi ve değişiklik izi tamamlanmadan “kararlı” etiketi yok.

## 2. Yedi rota için dört seviye, ölçülebilir çıktı ve teslim tarihi

| Rota | Başlangıç | Orta | İleri | Uzman |
|---|---|---|---|---|
| Python / çalışma zamanı | 20.11.2026: 5 CLI aracı, 10 test | 25.12.2026: async görev örneği, 20 test, paketlenebilir modül | 05.03.2027: gözlemevi alfa, profil raporu, en az %75 kapsam | 04.06.2027: C/Cython deneyi, benchmark ve en az %85 kapsam |
| Java / işlem sistemleri | 01.01.2027: tipli domain uygulaması, 10 test | 19.02.2027: eşzamanlı iş kuyruğu, 25 test | 16.04.2027: servis sınırı, outbox/Saga kanıtı | 30.07.2027: denetim platformu, güvenlik entegrasyon testleri |
| Web / arayüz | 26.02.2027: semantik 3 sayfa ve klavye denetimi | 30.04.2027: TS modülleri, 20 test, erişilebilir form | 09.07.2027: PWA, performans bütçesi, istemci-sunucu tehdit notu | 10.09.2027: yönetim arayüzü ve CI erişilebilirlik/perf kapıları |
| Test ve değerlendirme | 13.11.2026: test matrisi ve kusur kaydı | 29.01.2027: regresyon paketi ve CI raporu | 07.05.2027: güvenlik/perf değerlendirme hattı | 15.10.2027: birleşik kalite panosu ve sürüm kapısı |
| Üretken sistemler / ajanlar | 26.03.2027: 20 soruluk kaynaklı yanıt seti | 28.05.2027: şema kontrollü araç prototipi ve 50 test | 13.08.2027: ajan durum makinesi, adversarial test ve insan onayı | 24.09.2027: regresyon, maliyet/gecikme ve güvenlik kapıları |
| Mimari / yayınlama | 13.11.2026: README, ADR ve yerel kurulum | 19.03.2027: CI, CHANGELOG ve sürümleme | 25.06.2027: tehdit modeli, gözlemlenebilirlik, rollback provası | 08.10.2027: tekrar üretilebilir yayın ve yayın sonrası inceleme |
| Portföy / anlatım | 06.11.2026: portföy iskeleti ve ilk not | 05.02.2027: ilk canlı ürün ve demo | 18.06.2027: 2 ürün, 2 ölçüm yazısı ve anlatım | 29.10.2027: 3 proje, 12 aylık arşiv, final demo ve pano |

## 3. Ayrıntılı konu kataloğu

### 3.1 Python

**Başlangıç:** sözdizimi, veri yapıları, fonksiyonlar, modüller, istisnalar, dosya işlemleri, sanal ortam, paket kurulumu, CLI, yapılandırma ayrımı ve temel test.

**Orta:**
- CPython iç işleyişi: bytecode, yorumlayıcı döngüsü, nesne başlığı ve referans semantiği.
- Bellek yönetimi: nesne ömrü, tahsis havuzları, küçük nesne davranışı ve bellek profilinin yorumu.
- Referans sayımı ve çöp toplama: döngüsel referanslar, zayıf referanslar, finalizer riski ve gc arayüzü.
- GIL ve eşzamanlılık: thread, process, I/O-bound ve CPU-bound iş yükleri.
- asyncio olay döngüsü: coroutine, task, Future, timeout, semaphore ve yapılandırılmış eşzamanlılık.
- Görev iptali ve geri basınç: cancellation yayılımı, kuyruk sınırı, producer/consumer dengesi ve kaynak kapatma.
- Hata ayıklama ve izleme: traceback, logging, debugger, yapılandırılmış olaylar ve tekrar üretilebilir hata örneği.

**İleri:**
- Profiling: cProfile, pstats, tracemalloc ve gerektiğinde örneklemeli profiler; ölçüm yanlılığının kaydı.
- İleri tip sistemi: Protocol, generics, TypedDict, Literal, overload, variance ve statik analiz.
- Üretim desenleri: dependency injection, adapter, strategy, repository, retry/backoff ve idempotency.
- Güvenlik açıkları: path traversal, command injection, unsafe deserialization, SSRF, secret sızıntısı ve bağımlılık riski.
- Test stratejisi: property-based, mutation, contract, integration, fuzzing ve flaky test analizi.
- Paketleme/dağıtım: wheel, sdist, sürümleme, lock dosyası, tekrar üretilebilir build.
- Performans ölçümü: sabit veri kümesi, ısınma, tekrar sayısı, medyan/p95 ve istatistiksel gürültü.

**Uzman:** C uzantıları ve Cython, Python/C bellek sahipliği, hata yayılımı ve ABI; CPU/bellek/görev/hata gözlemevi; profil raporu; performans regresyon eşiği; iptal ve kaynak sınırı arıza deneyleri.

### 3.2 Java

**Başlangıç:** dil temeli, koleksiyonlar, generics, istisnalar, Maven/Gradle, JUnit, HTTP sözleşmesi, doğrulama ve güvenli yapılandırma.

**Orta:**
- JVM iç işleyişi: bytecode, JIT, heap/stack, classpath/module path.
- Sınıf yükleme ve bellek modeli: class initialization, happens-before, volatile ve görünürlük.
- Çöp toplama: duraklama, allocation rate, heap basıncı ve GC günlükleri.
- Eşzamanlılık: executor, thread pool, synchronized, lock, atomics ve güvenli paylaşım.
- CompletableFuture ve asenkron akış: composition, exception path, timeout, cancellation ve backpressure.
- Yarış koşulları/deadlock: kilit sırası, thread dump, stress test ve deterministik test.

**İleri:**
- Mikroservis mimarisi, servis sınırları, veri sahipliği ve dağıtık arıza alanları.
- Saga orchestration/choreography, telafi eylemleri ve idempotent tüketici.
- Transactional outbox: atomik iş verisi ve olay kaydı, relay, tekrar teslim ve deduplication.
- Circuit breaker, timeout, bulkhead, retry ve sınırlı geri çekilme.
- API Gateway ve konfigürasyon yönetimi; gizli bilgi kasası.
- Clean Architecture ve CQRS: bağımlılık yönü, komut/sorgu ayrımı ve tutarlılık modeli.
- Güvenlik filtre zinciri, JWT, OAuth2/OIDC: issuer, audience, expiry, key rotation ve scope.

**Uzman:** çok kiracılı işlem ve denetim platformu, rol tabanlı erişim, OpenTelemetry türünde gözlemlenebilirlik, Testcontainers, sözleşme/entegrasyon/yük testi, hata enjeksiyonu ve toparlanma raporu.

### 3.3 HTML/CSS/JavaScript/TypeScript

**Başlangıç:** HTML semantik yapı, başlık hiyerarşisi, landmark, formlar ve etiketler; erişilebilirlik, klavye gezinme, odak, kontrast ve azaltılmış hareket; form doğrulama ve güvenli çıktı.

**Orta:** CSS Grid/Flexbox, container queries, stacking context; JavaScript modülleri; TypeScript strict mode, unions, generics ve async hata yolu; Web Components, Custom Elements, Shadow DOM; frontend mimarisi, durum yönetimi ve bileşen testleri.

**İleri:** tarayıcı performansı ve Core Web Vitals; ana iş parçacığı, kod bölme ve lazy loading; SSR, hydration ve istemci-sunucu güven sınırı; PWA, service worker ve cache invalidation; XSS, CSRF, CSP, clickjacking, açık yönlendirme ve tedarik zinciri güvenliği.

**Uzman:** üç projenin yönetim paneli; klavye, küçük ekran ve yavaş ağ testleri; erişilebilirlik/perf/güvenlik CI kapıları; sunucu durumuyla arayüz durumu ayrımı ve sürümlü API sözleşmesi.

### 3.4 Üretken sistemler, RAG ve ajanlar

- RAG: kaynak alma, parçalama, metadata, retrieval ölçümü, alıntı-parça eşlemesi ve kaynak güncelliği.
- Temellendirme/kaynak: iddia-kanit bağlantısı; kanıt yoksa belirsizliği açıkça bildirme.
- Araç çağıran ajan döngüsü: planla → izinli aracı doğrula → çalıştır → sonucu denetle → tamamla ya da insana devret.
- Ajan hafızası ve durum: görev kapsamı, yaşam süresi, hassas veri minimizasyonu, durum geçişi ve tekrar başlatma.
- İstem/çıktı şema doğrulama: JSON Schema veya eşdeğer doğrulama, bozuk biçim ve sınır uzunluğu.
- Halüsinasyon azaltma: kanıt eşiği, belirsizlik bildirimi, çelişki testi ve cevap vermeme politikası.
- Değerlendirme: doğruluk, temellendirme, şema, güvenlik, maliyet, gecikme ve araç başarı oranı.
- Veri seti: izinli kaynak, veri kökeni, etiketleme kılavuzu, ayrılmış değerlendirme seti ve kişisel veri ayıklama.
- Güvenlik/red team: prompt injection, kötü niyetli belge, araç yetkisi yükseltme, veri sızdırma ve çıkış doğrulama.
- Maliyet/gecikme: istek başı maliyet, çağrı sayısı, p50/p95, cache etkisi ve bütçe alarmı.
- CI/regresyon: sabit senaryo paketi, eşik değişikliği incelemesi ve yeni hata örnekleri.
- Gözlemlenebilirlik: korelasyon kimliği, araç izi, kaynak kimliği, hata sınıfı ve içerik gizliliği.
- İnsan denetimi: geri döndürülemez eylemden önce onay, iptal, gerekçe kaydı ve güvenli varsayılan.

### 3.5 Test ve değerlendirme tasarısı

- Senaryo standardı: kimlik, amaç, ön koşul, girdi, beklenen sonuç, risk, değerlendirici, eşik ve kanıt kaydı.
- Değerlendiriciler: kurala dayalı doğruluk, kaynak temellendirme, format/şema, güvenlik, maliyet/gecikme ve insan incelemesi.
- Başlangıç CI eşiği: tüm testler geçmeli, şema %100, açık kritik güvenlik kusuru 0, kaynak temellendirme en az %95 hedef.
- Regresyon/adversarial set: eski kusur, boş/uzun girdi, çelişkili kaynak, bozuk belge, injection, timeout ve araç kesintisi.
- İnsan incelemesi: örnekleme, uyuşmazlık notu, karar gerekçesi ve kontrollü veri seti güncellemesi.
- Rapor şablonu: sürüm, veri seti parmak izi, ortam, örnek sayısı, hata oranı, belirsizlik, maliyet, gecikme ve sınırlar.

### 3.6 “Code” için niyet ve ajan mühendisliği

- Niyet tasarımı: hedef, kapsam dışı işler, kabul kriterleri ve belirsizlik.
- Ajan mühendisliği: gözlem, plan, eylem, doğrulama ve durma koşulları.
- Döngü mühendisliği: maksimum adım, timeout, cancellation, retry bütçesi ve sonsuz döngü koruması.
- Çoklu ajan yönetimi: roller, iş bölümü, ortak bağlam, çakışma çözümü ve tek yayın sorumlusu.
- Ajan denetimi/kısıtlama: allowlist araçlar, en az yetki, sandbox, dosya/ağ izinleri ve insan onayı.
- Planla-yürüt-doğrula: plan kanıtı, eylem sonucu, test çıktısı ve başarısızlıkta güvenli duruş.
- İnsan-ajan iş bölümü: insan hedef ve risk kararlarını belirler; otomasyon geri alınabilir adımları yürütür; kritik değişiklikler onaya gider.

## 4. Üç ana projenin teslim sözleşmesi

### Proje A · Python Çalışma Zamanı Gözlemevi
**Amaç:** CPU, bellek, görev ve hata olaylarını ölçen, profiling girdisini raporlayan yerel araç.
- Bileşenler: collector arayüzü, örnek veri üreticisi, süreç ölçümü, asyncio görev gözlemi, hata sınıflandırma, JSON/Markdown raporu ve CLI.
- Güvenlik: varsayılan yerel ölçüm; sırları yakalamama; veri minimizasyonu; kullanıcı seçimi olmadan ağ iletimi yok.
- Ölçüm: örnek toplama maliyeti, bellek ek yükü, rapor üretim süresi ve kayıp olay oranı.
- Kabul: 3 iş yükü, en az 25 test, hata/sınır senaryosu, benchmark ve kurulum/mimari belgesi.
- Hata senaryoları: süreç kapanması, erişim reddi, yoğun olay akışı, görev iptali ve bozuk rapor.

### Proje B · Java İşlem ve Denetim Platformu
**Amaç:** çok kiracılı işlem kaydı, rol tabanlı erişim, token doğrulama, denetim izi ve dayanıklılık örneği.
- Bileşenler: tenant context, domain modeli, CQRS sınırı, transaction/outbox, idempotent event relay, Saga telafisi, gateway/config ve gözlemlenebilirlik.
- Güvenlik: gizli değerler ortam/kasa üzerinden; JWT imza/issuer/audience/expiry kontrolü; loglarda token yok.
- Ölçüm: istek p95, outbox gecikmesi, duplicate sayısı ve breaker iyileşme süresi.
- Kabul: en az 30 birim/entegrasyon testi, iki tenant izolasyon testi, kesinti senaryosu ve tehdit modeli.
- Hata senaryoları: duplicate olay, veri tabanı kesintisi, süresi geçmiş token, yanlış tenant ve başarısız telafi.

### Proje C · Kaynaklı Bilgi Atölyesi
**Amaç:** izinli belgelerden kaynaklı yanıt çıkaran, araçları sınırlandırılmış, değerlendirilebilir bilgi akışı.
- Bileşenler: izinli koleksiyon, temizleme, retrieval, alıntı bağlama, şema doğrulama, araç kaydı, ajan durum makinesi, insan onayı ve raporlayıcı.
- Güvenlik: belge içeriği talimat değil veri kabul edilir; araç allowlist; ağ/dosya sınırı; dış etki oluşturan eylemde onay.
- Ölçüm: kaynak eşleşmesi, kritik desteksiz iddia oranı, recall@k, gecikme, maliyet ve araç başarı oranı.
- Kabul: 50 sabit senaryo, 20 adversarial senaryo, kaynak izi, regresyon raporu ve insan incelemesi.
- Hata senaryoları: boş retrieval, çelişkili kaynak, bozuk JSON, kötü amaçlı belge, timeout ve araç reddi.

### Her proje için ortak dosyalar
README, Apache-2.0 LICENSE, NOTICE, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, mimari karar kayıtları, kurulum/kullanım, test planı, örnek yapılandırma/veri, hata senaryoları, performans bütçesi, tehdit modeli, gözlemlenebilirlik standardı, CI, sürüm notu, demo, ekran görüntüsü ve uygun olduğunda kapsam/perf/değerlendirme raporu.

## 5. 52 haftalık yürütme takvimi

Her satırda beş ayrı teslim vardır: **Öğren / Uygula / Test / Dokümante et / Yayınla.** Cuma tarihi teslim günüdür. Teknik yazı kısa olabilir ama kaynak, ölçüm ve sonuç içermelidir.

| Hafta / teslim | Öğren | Uygula | Test | Dokümante et | Yayınla |
|---|---|---|---|---|---|
| 01 · 06.11.2026 | Git, terminal ve sanal ortam | Portföy iskeleti ve Python mini CLI | 5 temel test | Kurulum + hedef/KPI | İlk teknik not ve başlangıç kaydı |
| 02 · 13.11.2026 | Python tipi, istisna ve test | Dosya dönüştürücü | 10 test, bozuk girdi | Test matrisi + ADR | v0.1.0 |
| 03 · 20.11.2026 | CPython bytecode/nesne modeli | Bytecode gözlem alıştırması | Sürüm karşılaştırması | Çalışma zamanı sözlüğü | Bytecode ölçüm notu |
| 04 · 27.11.2026 | Bellek ve referans sayımı | Bellek gözlem aracı | Döngüsel referans testi | Bellek modeli diyagramı | Bellek deney raporu |
| 05 · 04.12.2026 | Çöp toplama ve kaynak kapatma | Yaşam döngüsü örneği | Kapanış ve kaçak senaryosu | ADR ve sınırlar | Nesne ömrü yazısı |
| 06 · 11.12.2026 | GIL, thread/process | Aynı işi üç yolla ölç | Tutarlılık ve tekrar testi | Benchmark protokolü | Önce/sonra notu |
| 07 · 18.12.2026 | asyncio, task, timeout, iptal | Sınırlı eşzamanlı tüketici | İptal/timeout/kuyruk dolması | Görev diyagramı | Async deneyi |
| 08 · 25.12.2026 | Geri basınç, profiling, tip sistemi | CLI v0.2 ve profiler | 20 test ve profil raporu | Paketleme ve API notu | Python paketi v0.2 |
| 09 · 01.01.2027 | Java, JVM bytecode, build araçları | Tipli domain uygulaması | 10 JUnit testi | Kurulum rehberi | Java başlangıç yazısı |
| 10 · 08.01.2027 | Sınıf yükleme ve bellek modeli | Happens-before deneyi | Görünürlük testleri | JVM diyagramı | JVM gözlem notu |
| 11 · 15.01.2027 | Java GC ve heap gözlemi | GC log okuyucu | Tekrarlanabilir yük testi | GC seçim ölçütleri | GC karşılaştırması |
| 12 · 22.01.2027 | Executor, lock, atomics | Güvenli iş kuyruğu | Stress ve deadlock testi | Thread dump kılavuzu | Eşzamanlılık yazısı |
| 13 · 29.01.2027 | CompletableFuture ve akış | Asenkron servis akışı | Hata/iptal/backpressure | Akış diyagramı | Regresyon ve CI raporu |
| 14 · 05.02.2027 | Java test piramidi ve yayın | İlk uçtan uca ürün | Birim + entegrasyon | README, CHANGELOG, demo planı | Aylık ürün 01 |
| 15 · 12.02.2027 | Mikroservis, Saga, idempotency | İki servisli telafi senaryosu | Kesinti ve tekrar testi | Bağlam diyagramı | Saga tasarım notu |
| 16 · 19.02.2027 | Outbox, breaker, gateway | Outbox simülatörü | Duplicate, timeout, reset | Dayanıklılık ADR | İşlem ara sürümü |
| 17 · 26.02.2027 | Semantik HTML ve erişilebilirlik | Yönetim arayüzü iskeleti | Klavye ve form testi | A11y listesi | İlk arayüz notu |
| 18 · 05.03.2027 | CSS Grid/Flex ve responsive | 3 ekran kırılımı | Mobil/masaüstü kontrol | Tasarım tokenları | Gözlemevi alfa + demo |
| 19 · 12.03.2027 | JS modülleri ve TS strict | Tür güvenli modüller | Tip kontrolü + 15 test | Modül sözleşmesi | TypeScript yazısı |
| 20 · 19.03.2027 | Web Components ve durum yönetimi | Yeniden kullanılabilir veri tablosu | Boş/yükleniyor/hata halleri | Frontend ADR | CI ve sürümleme kılavuzu |
| 21 · 26.03.2027 | RAG ve retrieval ölçümü | 20 soruluk kaynaklı yanıt tabanı | Recall@k ve alıntı doğrulama | Veri kökeni rehberi | İlk bilgi prototipi |
| 22 · 02.04.2027 | Temellendirme ve şema | Kaynaklı yanıt/şema doğrulama | Boş kaynak ve bozuk JSON | Değerlendirme tanımı | Kaynak gösterme yazısı |
| 23 · 09.04.2027 | SSR, hydration, performans | İstemci/sunucu sınır deneyi | Serialization testleri | Perf bütçesi | Performans yazısı |
| 24 · 16.04.2027 | XSS, CSRF, CSP ve OAuth temeli | Güvenlik başlıkları/token doğrulama | Negatif yetki testi | Web tehdit modeli | Java ara sürümü |
| 25 · 23.04.2027 | Gateway ve sır yönetimi | Ortam bazlı yapılandırma | Eksik/yanlış ayar testi | Güvenli kurulum | Örnek config yayını |
| 26 · 30.04.2027 | PWA ve service worker | Çevrimdışı salt okunur demo | Cache/güncelleme testi | Offline davranış tablosu | PWA demosu |
| 27 · 07.05.2027 | Statik analiz/bağımlılık taraması | Ortak CI kalite işi | Kasıtlı hatada CI durmalı | CI akış şeması | Kalite kapısı raporu |
| 28 · 14.05.2027 | CQRS ve Clean Architecture | Komut/sorgu modelini ayır | Domain/sözleşme testleri | ADR ve veri akışı | Mimari karşılaştırma |
| 29 · 21.05.2027 | Outbox ve olay teslimi | Outbox relay ve dedupe | Duplicate/kesinti testi | Olay şeması | Outbox demo notu |
| 30 · 28.05.2027 | Ajan döngüsü ve insan denetimi | İzinli araç prototipi | 50 test, yetki reddi dahil | Durum makinesi/tehdit | Aylık ürün 02 |
| 31 · 04.06.2027 | C/Cython ve benchmark | Python darboğaz mikro deneyi | Python/C karşılaştırması | Performans raporu | Gözlemevi v1 adayı |
| 32 · 11.06.2027 | Log, metrik ve iz | Korelasyon kimlikli olay raporu | Hassas veri kontrolü | Gözlem standardı | Pano taslağı |
| 33 · 18.06.2027 | Vaka yazımı ve portföy | İki proje için önce/sonra sayfası | Komut/link tekrar testi | Yazı şablonu | İki demo ve ölçüm yazısı |
| 34 · 25.06.2027 | Tehdit modelleme ve arıza enjeksiyonu | Servis kesinti simülasyonu | Toparlanma/rollback testi | Güvenlik raporu | Dayanıklılık raporu |
| 35 · 02.07.2027 | TS sınırları ve tarayıcı ölçümü | Proje kontrol paneli v1 | Dar ekran/klavye/yük | Kullanım rehberi | Panel v1 |
| 36 · 09.07.2027 | P95 ve Web Vitals | Perf bütçesini CI'ye bağla | Kontrollü yavaşlama testi | Ölçüm protokolü | Önce/sonra yazısı |
| 37 · 16.07.2027 | Retrieval hataları ve veri kalitesi | 50 senaryoyu etiketle | Etiket tutarlılığı | Dataset card | Değerlendirme seti v1 |
| 38 · 23.07.2027 | OAuth2/OIDC ve tenant izolasyonu | Yetkili kullanıcı akışı | Yanlış tenant/expired token | Güvenlik rehberi | Java güvenlik demosu |
| 39 · 30.07.2027 | Saga telafisi ve breaker | İşlem platformu v1 | Arıza/duplicate/timeout | İşlem diyagramı + SLO | İşlem platformu v1.0 |
| 40 · 06.08.2027 | Maliyet ve gecikme | İstek maliyeti ölçeri | p50/p95/bütçe testi | Maliyet raporu | Maliyet/gecikme yazısı |
| 41 · 13.08.2027 | Injection ve adversarial test | 20 saldırgan senaryo | Yetki yükseltme/veri sızması | Red-team defteri | Güvenlik notu |
| 42 · 20.08.2027 | İnsan incelemesi ve değerlendiriciler | İnceleme kuyruğu/gerekçe | Değerlendirici uyuşmazlığı | İnceleme prosedürü | Değerlendirme raporu |
| 43 · 27.08.2027 | CI regresyon ve sürümlü veri | Kaynaklı sistem kalite kapısı | Eşik altında yayını durdur | CI kriterleri/rollback | Regresyon otomasyonu |
| 44 · 03.09.2027 | Çoklu ajan ve durma koşulu | Sınırlı çok-rol simülasyonu | Adım/timeout/çakışma | Sorumluluk matrisi | Ajan döngüsü yazısı |
| 45 · 10.09.2027 | Frontend mimari/erişilebilirlik | Yönetim arayüzü v2 | A11y/perf/security kapısı | Arayüz tehdit modeli | Arayüz v2 ve demo |
| 46 · 17.09.2027 | Kaynak doğruluğu ve çelişki | Kaynaklı yanıt denetleyici | %95 hedefi; kritik desteksiz iddia testi | Hata analizi | Kaynaklı sistem yazısı |
| 47 · 24.09.2027 | Birleşik değerlendirme eşikleri | 50 normal + 20 adversarial test | Şema %100, açık kritik kusur 0 | Rapor şablonu/sonuç | Bilgi Atölyesi v1 adayı |
| 48 · 01.10.2027 | Lisans ve tedarik zinciri | Bağımlılık/lisans envanteri | Lisans + secret taraması | Kaynak/lisans raporu | Yayın adayı/CHANGELOG |
| 49 · 08.10.2027 | Canary, rollback ve olay yönetimi | Yayın tatbikatı | Geri alma/temiz kurulum | Release runbook | Yayın uzmanlık kapısı |
| 50 · 15.10.2027 | Test kapsamı ve hata trendi | Tek kalite panosu | Tam CI ve hata turu | Kapsam/güvenlik/perf raporu | Final kalite raporu |
| 51 · 22.10.2027 | Teknik anlatım ve demo | 3 proje için 2–4 dakikalık anlatım | Temiz oturumda kurulum | Son kullanım rehberi | Üç demo + portföy önizleme |
| 52 · 29.10.2027 | Retrospektif ve yeni hedefler | Üç ürünü portföye bağla | Final regresyon/link/kurulum | Yıllık öğrenim raporu/arşiv | Portföy v1, teknik yazı, sonraki backlog |

## 6. Her haftanın sabit kontrol listesi
- [ ] Öğrenme hedefi, terimler, en az iki güvenilir kaynak ve kısa özet.
- [ ] Çalıştırılabilir çıktı, örnek yapılandırma ve hata yönetimi.
- [ ] Olumlu, olumsuz, sınır ve mümkünse eşzamanlılık/perf testi.
- [ ] README, kullanım, mimari karar, sınırlamalar ve CHANGELOG.
- [ ] CI sonucu, sürüm kaydı, teknik yazı ve gerekiyorsa demo.
- [ ] Retrospektif: planlanan/gerçekleşen, sorun, öğrenilenler, sonraki adım.

## 7. Mimari, güvenlik ve yayın standardı

### Mimari karar kaydı (ADR)
Başlık, durum, bağlam, seçenekler, karar, artılar/eksiler, güvenlik etkisi, performans etkisi ve yeniden değerlendirme koşulu bulunur.

### Test senaryosu standardı
Her senaryo: ID, amaç, risk, ön koşul, girdi, adımlar, beklenen sonuç, değerlendirici, eşik, kanıt yolu ve veri seti sürümünü taşır.

### Log / metrik / iz standardı
- Log: UTC zamanı, seviye, servis, sürüm, correlation ID, olay kodu ve maskelenmiş bağlam.
- Metrik: isim, birim, etiket sınırı, toplama yöntemi ve eşik.
- İz: parent/span ilişkisi, hata durumu ve hassas alanların ayıklanması.
- Token, parola, oturum çerezi, özel içerik ve gizli anahtarlar loglanmaz.

### Örnek yapılandırma
Sadece örnek değer kullanılır. Geliştirme/test/üretim ayarları ayrılır. Timeout, concurrency, retry bütçesi, log seviyesi ve güvenlik modu açıkça belgelenir. Kritik eylemler varsayılan kapalıdır.

### Yayın kapısı
1. Formatlama ve statik analiz.
2. Birim, entegrasyon, sözleşme ve regresyon testleri.
3. Bağımlılık, sır ve lisans kontrolü.
4. Güvenlik, erişilebilirlik ve performans kontrolü.
5. Paketleme, CHANGELOG, sürüm etiketi ve yayın notu.
6. Smoke test, gözlem süresi ve rollback provası.

## 8. Kaynak politikası
Her kaynak için sürüm ve erişim tarihi kaydedilir. Öncelik; Python belgeleri ve CPython kaynak kodu, Python Packaging User Guide, Java Language/JVM Specification, OpenJDK ve Java API belgeleri, WHATWG HTML, W3C WCAG, MDN, TypeScript Handbook, web.dev, OAuth2/OIDC spesifikasyonları, OWASP Cheat Sheet/ASVS, OpenTelemetry ve lisansların özgün metinleridir. Kaynakla desteklenmeyen iddia kesin gerçek olarak yayınlanmaz; deney sonucuysa ortam ve tekrar sayısı belirtilir. Atıf, tek başına üçüncü taraf kodu/medyası için kullanım hakkı vermez.

## 9. Haftalık gözden geçirme şablonu
**Hafta/tarih:**  
**Planlanan çıktı:**  
**Gerçekleşen çıktı ve bağlantı:**  
**Test komutu/sonuç:**  
**Ölçüm (önce → sonra):**  
**Öğrenilen üç şey:**  
**Açık risk/hata:**  
**Kaynak ve lisans notu:**  
**Sonraki haftanın ilk adımı:**  

## 10. İlk kesin teslim: 06.11.2026
Geliştirme ortamı ve sürümleri belgelenecek; ilk Python CLI örneği ve en az 5 test teslim edilecek; bir ADR yazılacak; ilk teknik yazı, kurulum adımları ve sürüm kaydı yayınlanacak. Ölçülmeyen iş “tamamlandı” sayılmayacak.

**Ergin Atölye · EL-ROT-001**  
Bu belge yaşayan bir plandır. Her cuma sonuç ve sapmalar kaydedilir; ay sonunda hedefler, ölçümler ve öncelikler yeniden değerlendirilir.

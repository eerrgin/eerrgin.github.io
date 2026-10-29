# Tehdit Modeli · EL-ROT-001

## Varlıklar
Kaynak kod, Git geçmişi, erişim tokenları, örnek belgeler, denetim olayları, kullanıcı ilerleme durumu ve yayın anahtarları.

## Güven sınırları
Tarayıcı/yerel depolama; istemci/servis; servis/veri tabanı; retrieval içeriği/talimat; araç döngüsü/dış eylem; CI/yayın kimlik bilgileri.

## Tehditler ve kontroller
- Gizli anahtar sızıntısı: secret scan, örnek değer, en az yetki.
- Zararlı belge veya injection: belgeyi talimat değil veri kabul et; allowlist ve şema doğrulaması.
- Tenant veri sızıntısı: her sorguda tenant kapsamı ve negatif entegrasyon testi.
- XSS/CSRF/açık yönlendirme: bağlama uygun çıktı kodlama, CSP ve güvenli redirect allowlist.
- Tedarik zinciri: bağımlılık sabitleme, lisans envanteri ve güncelleme incelemesi.
- Kaynak tüketimi: girdi boyutu, timeout, concurrency, retry ve kuyruk sınırları.
- Kaynaksız iddia: alıntı eşlemesi, belirsizlik, regresyon seti ve insan incelemesi.

## Yayın öncesi
Hangi varlık riskte? Girdi hangi sınırdan geliyor? Başarısızlıkta güvenli varsayılan ne? Loglar hassas mı? Hangi ölçüm yayını durdurur?

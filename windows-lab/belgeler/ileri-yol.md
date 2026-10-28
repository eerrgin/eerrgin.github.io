# Ergin Sistem Lab — Windows için ileri proje yol haritası

Bu dosyadaki fikirler geliştirme önerisidir; mevcut betiğin yaptığı işler olarak okunmamalıdır.

## 1. Event Ledger
- [ ] Olay kayıtlarını kaynak ve Event ID ile özetle
- [ ] Zaman aralığı, saat dilimi ve eksik kayıtları göster
- [ ] Kişi/makine yolları için redaksiyon seçeneği ekle
- [ ] Bozuk çıktı ve boş sonuç için test yaz

## 2. NTFS Permission Atlas
- [ ] Kullanıcı tarafından seçilen klasörde ACL'leri salt okunur oku
- [ ] Kalıtım, izin ve kimlikleri yapılandırılmış JSON/CSV'ye çevir
- [ ] SID'lerin çözümlenemediği durumları hata değil, ayrı durum olarak kaydet
- [ ] Gerçek izinleri değiştirme özelliği ekleme; yalnızca raporlama

## 3. Service Recovery Bench
- [ ] Windows VM içinde kendi örnek servisini gözlemle
- [ ] Başlangıç tipi, olay kaydı ve bağımlılıkları korele et
- [ ] Arıza senaryolarını dokümanda beklenen sonuçla tanımla
- [ ] Makineyi değiştirecek testlere otomatik geri alma adımı ekle

## 4. PowerShell Module Forge
- [ ] Girdi doğrulaması, parametreler ve hata sözleşmesi
- [ ] Pester testleri ve CI
- [ ] Çıktı için kararlı JSON şeması
- [ ] PowerShell 5.1/7 uyumluluk farklarını doğrula

## 5. Cross-OS Drift Map
- [ ] Windows ve Linux için ortak sistem envanteri şeması
- [ ] Her alanın kaynağını ve zamanını sakla
- [ ] “veri yok”, “komut yok”, “erişim reddedildi” ayrımı
- [ ] Sürümler ve lisans envanterini gözlem verisinden ayrı tut

## 6. Endpoint Supply Ledger
- [ ] Yüklü yazılım adı/sürümü/kaynak alanlarını topla
- [ ] Lisans bildirimi ile imza/provenance bilgisini farklı alanlara yaz
- [ ] Sonuçları yönetici tarafından doğrulanmadan “güvenli” ilan etme
- [ ] Dışa aktarımda makine adı ve kullanıcı bilgisini varsayılan olarak maskele

## Saha kuralları
- İlk deney salt-okunur ve düşük yetkiyle çalışmalı.
- Güvenlik duvarı, Defender, UAC veya hizmetleri kapatan demo hazırlama.
- Kurum cihazında değişiklik yapmadan önce yazılı yetki ve geri dönüş planı gerekir.
- “Tüm Windows sürümlerinde çalışır” gibi iddiaları gerçek sürüm matrisi olmadan yazma.

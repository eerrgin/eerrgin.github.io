# Mimari Başlangıç Notu · EL-ROT-001

## Amaç
Öğrenim rotasını tek web giriş sayfası, tarihli ana plan ve birbirinden bağımsız üç örnek üretim projesine bağlamak.

## Sınırlar
- Portföy sayfası statiktir; sunucu tarafı veri tabanı yoktur.
- İlerleme işaretleri yalnızca yerel tarayıcı depolamasında tutulur.
- Gerçek örnek projeler kendi çalışma zamanı, test ve yayın yapılandırmasına sahip olur.
- Üretken sistemlerde araç izinleri ve veri kaynakları açık allowlist ile sınırlandırılır.
- Kimlik doğrulama ve gizli anahtar yönetimi sabit örnek değerlerle taklit edilmez.

## Veri akışı
Kullanıcı → statik sayfa → yerel ilerleme durumu.
Konu → küçük deney → test sonucu → ölçüm → teknik not → sürümlü yayın.
Kaynak belge → temizleme → parçalama → retrieval → kaynaklı yanıt → şema/güvenlik değerlendirmesi → insan incelemesi.

## Kararlar
- Giriş sayfasında harici kütüphane yok.
- Her hafta çalışan çıktı ve test kanıtı olmadan tamamlanmış sayılmaz.
- Her proje sürüm, değişiklik günlüğü ve rollback prosedürü tutar.

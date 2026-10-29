# Test Planı · EL-ROT-001

## Portföy sayfası
- HTML kök öğesi, başlık, main, nav, section ve footer semantiği kontrol edilir.
- Klavye ile tüm bağlantı ve kutucuklara erişilir.
- Dar ekran, %200 yakınlaştırma ve azaltılmış hareket tercihi kontrol edilir.
- İlerleme kaydı yalnızca yerel depolamada kalır; depolama devre dışıyken arayüz kırılmaz.
- Bağlantılar ve zorunlu dosyalar her CI koşusunda doğrulanır.

## Python gözlemevi
- Normal, boş, bozuk ve çok büyük girdi; izin reddi; süreç kapanması; iptal; timeout; kuyruk sınırı ve kaynak kapanışı.
- CPU/bellek ölçüm ek yükü benchmark ile raporlanır.

## Java işlem platformu
- Tenant izolasyonu, authn/authz negatif testleri, duplicate event, outbox kesintisi ve Saga telafisi.
- Circuit breaker open/half-open/closed geçişleri, timeout ve retry bütçesi.
- Yarış koşulu ve deadlock üretme/tespit senaryoları.

## Kaynaklı bilgi atölyesi
- Boş retrieval, kaynak uyuşmazlığı, şema hatası, prompt injection ve araç reddi.
- Kaynak kimliği her yanıtta geri izlenebilir olmalıdır.
- Sabit regresyon seti her sürümde çalıştırılır.

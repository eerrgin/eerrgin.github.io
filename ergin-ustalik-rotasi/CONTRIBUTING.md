# Katkı Rehberi

- Değişiklik küçük, gerekçeli ve test edilebilir olsun.
- Çalıştırma komutları ve sonuçlar PR açıklamasında yer alsın.
- Başka projelerden alınan kod/örnek için kaynak ve lisans belirtilsin.
- Gizli anahtarlar, kişisel veri ve lisansı belirsiz varlık gönderilmesin.
- Güvenlik veya üretim değişiklikleri insan incelemesi olmadan otomatik onaylanmasın.

## Akış
1. Hedefi, kabul kriterini ve kapsam dışı işleri issue içinde yaz.
2. Küçük, açıklayıcı bir dal aç.
3. Testleri, statik kontrolleri ve güvenlik taramalarını çalıştır.
4. Dokümantasyon ve CHANGELOG'u güncelle.
5. PR içine önce/sonra ölçümünü, riskleri ve geri alma yöntemini ekle.
6. Güvenlik sınırlarını veya yayın eşiklerini gerekçesiz düşürme.

Commit önekleri: docs:, feat:, fix:, test:, perf:, security:, chore:. Sırlara veya kişisel veriye commit mesajı/çıktısı içinde yer verme.

Dosya başında kısa amaç/telif bildirimi kullan; her satıra isim eklemek yerine Git geçmişini ve CHANGELOG'u koru.

# Güvenlik Sınırları · İşlem ve Denetim Omurgası

Bu sürüm eğitim amaçlı bellek içi çekirdektir; üretim platformu değildir.

- Tenant kimliği istemciden gelen serbest bir değer olarak güvenilir kabul edilmemeli; doğrulanmış principal/claim üzerinden üretilmelidir.
- OAuth2/OIDC/JWT doğrulaması standart sağlayıcı ve olgun güvenlik kütüphanesiyle yapılmalıdır. İmza algoritması allowlist, issuer, audience, expiry, scope, key rotation ve clock skew politikaları doğrulanır.
- Transactional outbox, kalıcı veritabanında domain yazımıyla aynı transaction içinde tutulmalıdır. Bellek içi örnek outbox garantisi sağlamaz.
- Denetim kayıtlarının saklama süresi, erişim yetkisi, maskeleme ve bütünlük doğrulaması ayrıca belirlenmelidir.
- Circuit breaker örneği eğitim durum makinesidir. Üretim için concurrency, half-open probe limiti, metrik, yapılandırma ve zaman kaynağı test edilmelidir.
- Tenant sınırları için pozitif test kadar çapraz-tenant negatif test de zorunludur.

# Ergin İşlem ve Denetim Omurgası
EL-ROT-001 / Proje 02 / Eğitim amaçlı çekirdek prototip

JDK 17+ ile derlenen, dış bağımlılığı olmayan domain çekirdeği. Tenant kapsamlı kayıt, idempotent komut, denetim olayı ve circuit breaker durum makinesini gösterir.

## Derle ve doğrula
Bu klasörde: mkdir -p out; javac -d out $(find src/main/java src/test/java -name '*.java'); ardından java -ea -cp out tr.erginatolye.ledger.SelfTest.

## Güvenlik sınırı
Bu prototip gerçek OAuth2/OIDC veya JWT doğrulaması yapmaz ve üretimde kimlik doğrulama yerine kullanılamaz. Üretimde olgun güvenlik kütüphanesi kullanılmalı; imza, issuer, audience, expiry, scope, key rotation, tenant izolasyonu ve denetim testleri doğrulanmalıdır. Depolama bellek içidir, kalıcı veri tabanı değildir.

## Kabul hedefi
Tenant A kayıtları tenant B sorgularına dönmemeli; tekrar gönderilen commandId ikinci işlem üretmemeli; breaker açıkken çağrı engellenmelidir.

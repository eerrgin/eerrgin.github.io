# Ölçüm ve Gözlemlenebilirlik Standardı

Her rapor sürüm/commit, ortam, tarih, veri seti parmak izi, tekrar sayısı, medyan, p95, hata oranı ve bilinen sınırlamaları taşır.

## Metrikler
- Genel sistem: CPU, RSS/heap, olay sayısı, kuyruk derinliği, görev gecikmesi ve hata sınıfı.
- Java: heap, GC duraklaması, allocation rate, executor kuyruğu, outbox gecikmesi ve breaker durumu.
- Web: LCP, INP, CLS, JS boyutu, hata oranı ve erişilebilirlik kusurları.
- Kaynaklı sistem: recall@k, kaynak eşleşmesi, şema başarı oranı, araç başarı oranı, p50/p95 ve istek maliyeti.

## Log ve iz
Yapılandırılmış, maskelenmiş ve ilişkilendirilebilir olaylar kullan. Token, parola, çerez, özel içerik veya gizli anahtar loglama. Etiket kardinalitesini sınırla.

## İlk hedefler
- Kritik senaryoların beklenen sonucu: %100.
- Şema doğrulama: %100.
- Kaynak temellendirme: en az %95 hedef.
- Açık kritik/yüksek güvenlik kusuru: 0.
- Benchmark: en az 10 tekrar; aynı ortam; medyan ve p95.
- Rollback tatbikatı: sürüm adayı başına en az 1 başarılı deneme.

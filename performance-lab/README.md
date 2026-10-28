# Performans Laboratuvarı — Ergin Kaplan

Bu küçük, tarayıcıda çalışan laboratuvar; performans iyileştirmesinin iddiadan değil, ölçümden başlamasını göstermek için hazırlandı.

## Çalıştırma
GitHub Pages üzerinden `/performance-lab/` yolunu açabilir veya depo kökünden yerel HTTP sunucusu çalıştırabilirsin:

```bash
python3 -m http.server 8000
# http://localhost:8000/performance-lab/
```

## Deney
Aynı deterministik veri kümesi üzerinde benzersiz değerleri iki yöntemle bulur:
- Basit yaklaşım: `Array.prototype.indexOf` ile her öğeyi tekrar arar.
- Alternatif: `Set` ile tek geçişte benzersiz öğeleri toplar.

İki yöntem de ısınma çalıştırmasından sonra birden fazla kez ölçülür; medyan süre gösterilir. Sonuçların sayısı ve kontrol toplamı karşılaştırılarak doğruluk kontrol edilir. Veri tarayıcı içinde üretilir; gönderilmez veya kalıcı kaydedilmez.

## Öğrenme hedefleri
1. Aynı girdiyi iki uygulamaya vermek.
2. Ölçümden önce doğruluğu ve sonuçların gözlemlenebilirliğini sağlamak.
3. Tek ölçüm yerine tekrarlardan medyan almak.
4. Algoritmik karmaşıklığın büyük veri kümelerinde etkisini görmek.
5. Cihaz, tarayıcı, JIT, bellek ve arka plan yükünün sonucu etkilediğini kabul etmek.

## Sınırlar
Bu bir eğitim amaçlı mikro-benchmark'tır; üretim uygulamasının uçtan uca performansını ölçmez. Ağ, DOM, bellek tüketimi, sunucu yükü veya gerçek kullanıcı deneyimi burada ölçülmüyor. Küçük veri kümelerinde ölçüm gürültüsü anlamlı olabilir. Sonuçlar cihaz ve tarayıcıya göre değişir; hiçbir hız oranı tüm sistemler için garanti değildir.

## Güvenlik ve kişiselleştirme
İsim ve arayüzü kişiselleştirmek sahiplik veya güvenlik sağlamaz. Gizli anahtarları depoya koymamak, erişimi sınırlamak, bağımlılıkları denetlemek, yedek tutmak ve CI/inceleme kuralları kullanmak daha anlamlı korumalardır. Herkese açık depodaki kod kopyalanabilir; lisans kullanım haklarını belirler.

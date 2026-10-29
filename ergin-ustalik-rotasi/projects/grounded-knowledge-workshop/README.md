# Ergin Kaynaklı Bilgi Atölyesi
EL-ROT-001 / Proje 03 / Yerel retrieval prototipi

Bu demo yerel kaynak kümesinde sözcüksel arama yapar, ilgili pasajları gösterir, yanıtı yalnızca bulunan pasajlardan oluşturur ve sabit senaryolarla doğrulanır. Harici servis, takip veya üçüncü taraf kitaplık kullanmaz.

## Çalıştırma
Statik site içinde açılabilir. Yerelde çalıştırmak için depo kökünden python -m http.server 8000 başlatın; ardından /ergin-ustalik-rotasi/projects/grounded-knowledge-workshop/ adresini açın.

Testler için bu klasörde node --test komutunu çalıştırın.

## Sınırlar
Bu ilk prototip retrieval ve kaynak gösterme doğrulamasını sınar; üretici model servisi içermez. Kaynak getirme başarısı ile üretilen metnin doğruluğu aynı ölçüm değildir. Model bağlantısı sonraki aşamada ayrı bir adaptör, şema doğrulaması ve insan onayıyla tasarlanmalıdır.

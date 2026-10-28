# Sapma Defteri

Yerel bir hata inceleme ve mühendislik kayıt alanı. Belirti, kanıt, hipotez, deney, karar ve geri dönüş planını aynı dosyada tutar.

## Kullanım

GitHub Pages üzerinden açılabilir: `https://eerrgin.github.io/sapma-defteri/`

- Olay kartına sistemi, etkiyi, gözlenen ve beklenen davranışı yaz.
- Ham kanıtları tür ve güvenilirlik bilgisiyle kaydet.
- Birden fazla hipotez oluştur; hipotezleri kanıtlara bağla.
- Ayırt edici deneyler, beklenen/gerçekleşen sonuç ve geri alma planı ekle.
- İncelemeyi Markdown raporu veya JSON yedeği olarak indir; JSON içe aktararak devam et.

## Yerel çalışma ve sınırlar

- Harici JavaScript paketi, font servisi, analitik veya API isteği kullanılmaz.
- Kayıtlar aynı tarayıcının `localStorage` alanında tutulur. Farklı tarayıcıya/cihaza otomatik taşınmaz; taşımak için JSON yedeği indirip aktar.
- Sayfa, yazılan komutları çalıştırmaz. Komut alanı yalnızca inceleme notudur.
- Öncelik puanı kullanıcının kendi sıralamasıdır; otomatik olasılık veya kök neden hesabı değildir.
- Kayıtlar hassas veri için tasarlanmamıştır. Parola, erişim belirteci, özel anahtar veya kişisel veri ekleme.
- Tarayıcı verisini temizlemek kayıtları silebilir. Önemli incelemeleri düzenli olarak JSON olarak indir.

Dosya HTML, CSS ve JavaScript içeriklerini kendi içinde taşır; çalışmak için üçüncü taraf kitaplık gerektirmez.

# Samatya Topos

**Samatya Topos bir gezegen yörüngesi maketi değil; Samatya'nın koordinatlarından çalışan, gökyüzü yönlerini anlatan etkileşimli bir atlas.**

Gözlem noktası: **41.0028° K, 28.9404° D, yaklaşık 18 m**.

Canlı deneyim: https://eerrgin.github.io/samatya-sky/

## Ekranı nasıl okuyacaksın?

- **Küre ve çizgiler:** Gök kubbenin yönlerini temsil eder. Kırmızı büyük çember ufuktur; mavi yaylar 30° ve 60° yükseklik çizgileridir. K, D, G ve B pusula yönleridir.
- **Yükseklik:** 0° ufuktur. Pozitif değer ufkun üzerini, negatif değer altını gösterir. Hesapta basitleştirilmiş atmosferik kırılma kullanılır.
- **Azimut:** Kuzeyden saat yönünde ölçülür. Kuzey 0°, doğu 90°, güney 180°, batı 270°.
- **Işık yolu:** Modelde hesaplanan mesafenin ışık hızına bölünmesiyle tahmin edilir.
- **Sapma*:** Güneş kenarında yaklaşık 1,75 yay-saniyelik genel görelilik sapmasını referans alan, Güneş'e açısal uzaklığa göre basitleştirilmiş bir ölçek. Ölçülmüş değer veya ayrıntılı ışın izleme sonucu değildir.
- **Zaman kaydırma:** Canlı tarihten ±400 güne kaydırma yapar. Hazır bakış düğmeleri kuzey, doğu, güney veya zenit yönüne geçer; çizelgedeki bir cisme dokunmak onu görüş alanının ortasına getirir.

Gök cisimleri aynı kavramsal küreye yerleştirilir. Boyutları ve uzaklıkları **gerçek ölçekli değildir**; tasarım, cisimlerin Samatya'dan görünen yönlerini anlaşılır kılmak içindir. Ufuk altındaki cisimler, çizelgedeki negatif yükseklikle eşleşmesi için sahnede soluk işaretlenir; bu, onları o anda gözlenebilir yapmaz. Sahne gezegenlerin yörünge yollarını çizmez.

## Hesaplama yaklaşımı

Yerel yıldız zamanı Julian Date üzerinden Greenwich ortalama yıldız zamanına boylam eklenerek yaklaşır:

\[
\mathrm{LST} = \mathrm{GMST}(\mathrm{JD}) + \lambda
\]

Gezegenlerin yaklaşık heliosentrik konumları J2000 Kepler öğeleriyle hesaplanır. Kepler denklemi Newton–Raphson yöntemiyle çözülür. Dünya merkezli doğrultu, ekvator koordinatları ve Samatya ufkuna dönüştürülür. Işık zamanı gezegenler için birkaç iterasyonla hesaplanır; Ay hesabında basitleştirilmiş yörünge ve ufuk paralaksı kullanılır.

Bir yay-saniyelik açı, bir metrede yaklaşık **4,85 mikrometre** doğrusal aralığa karşılık gelir. Bu küçük açı dönüşümü yalnızca bir ölçek açıklamasıdır.

## Sınırlar

Hesaplar yaklaşık gezegen öğelerine dayanır; yıldız kataloğu seçilmiş parlak yıldızlardan oluşur. Atmosfer, ışık kirliliği ve kütleçekimsel sapma görselleri eğitim amacıyla basitleştirilmiştir. Deney hassas efemeris, profesyonel gözlem planı veya navigasyon aracı olarak kullanılmamalıdır. İlk açılışta Three.js modülü jsDelivr üzerinden yüklenir, bu nedenle ağ bağlantısı gerekir.

## Dosyalar

- `index.html` — görünüm seçimi, rehber ve gök çizelgesi
- `style.css` — masaüstü ve mobil arayüz
- `app.js` — yaklaşık astronomi hesabı, gök atlası ve etkileşim

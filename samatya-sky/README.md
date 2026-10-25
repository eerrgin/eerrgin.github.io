# Samatya Topos

İstanbul Samatya kıyısı, **41.0028° K, 28.9404° D, 18 m**, buradaki gökyüzünün merkezidir. Hazır efemeris kütüphanesi yok. Tarayıcı, Kepler denklemini ve ufuk dönüşümünü kendi çözer.

Canlı: https://eerrgin.github.io/samatya-sky/

## Ne hesaplanıyor

Yerel yıldız zamanı, JD üzerinden Greenwich ortalama yıldız zamanına boylam eklenerek bulunur:

\[
\mathrm{LST} = \mathrm{GMST}(\mathrm{JD}) + \lambda
\]

Gezegenler J2000 Kepler öğeleriyle (a, e, I, L, ϖ, Ω) ilerletilir. Orta anomali \(M = L - \varpi\). Kepler denklemi

\[
E - e\sin E = M
\]

Newton–Raphson ile çözülür. Helyosentrik tutulum konumu Dünya’dan çıkarılır. Işık gecikmesi üç kez yinelenir:

\[
\tau = \rho / c, \quad c \approx 173.14\,\mathrm{AU/gün}
\]

konum \(t-\tau\) anında tekrar hesaplanır. Sonuç ekvatora, sonra Samatya ufkuna iner:

\[
\sin h = \sin\delta\sin\phi + \cos\delta\cos\phi\cos H
\]

Azimut kuzeyden doğuya. Yüksekliğe Bennett kırılması eklenir. Ay’da ufuk paralaksı da düşülür. Yıldızlar rastgele değildir; parlak yıldızların RA/Dec değerleri aynı dönüşümden geçer. İstanbul ışık kirliliği, hava kütlesiyle kadiri söndürür.

Güneş kenarındaki Einstein sapması \(1.75''\), çarpma parametresi büyüdükçe \(R_\odot/b\) ile düşer. Alttaki kırmızı ızgara bu sapmanın görsel izidir, yerini Güneş’in azimutu belirler. “1 m kubbede 1″” satırı, açısal hassasiyeti milimetreye çevirir: \(1''\) yaklaşık **4.85 mm**.

## Dosyalar

- `index.html` — tuval ve HUD
- `style.css` — karanlık bilimsel arayüz
- `app.js` — zaman, yörünge, ufuk, Three.js sahnesi

Three.js yalnızca çizim içindir, gök mekaniği onun içinde değildir.

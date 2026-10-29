# Ergin Çalışma Zamanı Gözlemevi
EL-ROT-001 / Proje 01 / Başlangıç prototipi

Standart kütüphane kullanan yerel Python CLI: süreç CPU zamanı, Python izleme belleği, thread/task sayısı ve örnek iş yükünü JSON raporuna yazar; isteğe bağlı cProfile özeti oluşturur.

## Gereksinim
Python 3.11+. Harici çalışma zamanı bağımlılığı yok.

## Çalıştırma
- Sanal ortam oluşturup etkinleştir.
- Bu klasörde python -m pip install -e . komutunu çalıştır.
- ergin-observe --output reports/run.json --profile komutunu çalıştır.
- python -m unittest discover -s tests -v komutuyla testleri doğrula.

Kaynak ağacından kurmadan çalıştırmak için PYTHONPATH=src python -m ergin_observatory.cli --output reports/run.json --profile kullanılabilir.

## Ölçüm sınırı
Bellek alanları tracemalloc tarafından izlenen Python tahsisleridir; süreç RSS değeri değildir. CPU süresi mutlak süreç CPU zamanıdır, sistem genelindeki CPU yüzdesi değildir. Araç yereldir ve veri göndermez.

## Kabul
JSON rapor geçerli, hata durumları test edilmiş olmalı. Aynı iş yükünde en az 10 tekrarın medyanı raporlanmalı. Profiling ek yükü ayrıca belirtilmelidir.

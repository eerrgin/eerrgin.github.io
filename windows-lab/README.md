# Ergin Sistem Lab

Ergin Kaplan Atölyesi · Sistem mühendisliği / Windows ve PowerShell

Windows çalışma alanı, terminal temelleri, süreçler, servisler, olay kayıtları, ACL, ağ, otomasyon ve uç nokta gözlemi için bağımsız bir eğitim alanıdır. Linux kadar önemli görünmesinin nedeni işletim sistemi rekabeti değil; gerçek sistemlerin farklı işletim ortamları, yönetim araçları ve güvenlik sınırları arasında çalışmasıdır.

## Salt-okunur ilk deney

PowerShell açıp laboratuvar klasöründe:

```powershell
.\scripts\oku-sistem.ps1
```

Betik sistem sürümü, işlemci, disk, süreçler ve erişilebiliyorsa dinleyen TCP uçlarını özetler. Kurulum yapmaz, dosya silmez ve servis değiştirmez. Betik çıktısı makine/süreç ayrıntıları içerebilir; paylaşmadan önce gözden geçirin.

## Kapsam

- PowerShell pipeline ve nesne modeli
- süreç, servis ve Windows olay günlükleri
- kullanıcılar, UAC ve NTFS ACL
- DNS, TCP, TLS ve güvenlik duvarı kavramları
- test edilebilir betik/modül geliştirme
- olay zaman çizelgesi, cihaz envanteri ve sürüm/lisans kaydı

## Üst proje önerileri

Detayları [ileri yol haritasında](belgeler/ileri-yol.md) bulunur. Her deneyi öncelikle VM, Windows Sandbox veya test kullanıcısında çalıştırın; hangi ortamın mevcut olduğu Windows sürümü ve kurumsal ilkelere bağlıdır.

## Marka ve lisans sınırı

Ergin Sistem Lab, Microsoft tarafından desteklenen veya onaylanan resmî bir proje değildir. Windows ve PowerShell ilgili platformları tanımlamak için kullanılır. Resmî logo ve ürün varlıkları kopyalanmaz. Bu atölyenin özgün metni ve betikleri için [lisans ve marka notları](belgeler/lisans-ve-marka.md) ile [ana depodaki BELIRT.md](../BELIRT.md) birlikte okunmalıdır.

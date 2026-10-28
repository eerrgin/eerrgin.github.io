# Ergin Sistem Lab - salt-okunur sistem özeti
# Kurulum yapmaz, dosya yazmaz/silmez, servis veya güvenlik ayarını değiştirmez.
# Windows PowerShell 5.1+ hedeflenmiştir; bazı cmdlet'ler sürüme göre bulunmayabilir.
$ErrorActionPreference = 'Stop'

function Write-Section([string]$Title) {
    Write-Output ""
    Write-Output ("== {0} ==" -f $Title)
}

Write-Output "Ergin Sistem Lab / salt-okunur gözlem"
Write-Output "Çıktı makine ve süreç ayrıntısı içerebilir; paylaşmadan önce incele."

Write-Section "İşletim sistemi"
try {
    Get-CimInstance -ClassName Win32_OperatingSystem |
        Select-Object Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime |
        Format-List
} catch {
    Write-Output ("OS bilgisi alınamadı: {0}" -f $_.Exception.Message)
}

Write-Section "İşlemci"
try {
    Get-CimInstance -ClassName Win32_Processor |
        Select-Object Name, NumberOfCores, NumberOfLogicalProcessors |
        Format-Table -AutoSize
} catch {
    Write-Output ("İşlemci bilgisi alınamadı: {0}" -f $_.Exception.Message)
}

Write-Section "Yerel diskler"
try {
    Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3" |
        Select-Object DeviceID, FileSystem,
            @{Name='SizeGiB';Expression={ if ($_.Size) { [math]::Round($_.Size / 1GB, 2) } }},
            @{Name='FreeGiB';Expression={ if ($_.FreeSpace) { [math]::Round($_.FreeSpace / 1GB, 2) } }} |
        Format-Table -AutoSize
} catch {
    Write-Output ("Disk bilgisi alınamadı: {0}" -f $_.Exception.Message)
}

Write-Section "CPU alanına göre ilk süreçler"
try {
    Get-Process |
        Sort-Object -Property CPU -Descending |
        Select-Object -First 8 ProcessName, Id, CPU,
            @{Name='WorkingSetMiB';Expression={ [math]::Round($_.WorkingSet64 / 1MB, 1) }} |
        Format-Table -AutoSize
} catch {
    Write-Output ("Süreç bilgisi alınamadı: {0}" -f $_.Exception.Message)
}

Write-Section "Dinleyen TCP uçları (erişilebiliyorsa)"
try {
    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        Get-NetTCPConnection -State Listen -ErrorAction Stop |
            Select-Object -First 15 LocalAddress, LocalPort, OwningProcess |
            Format-Table -AutoSize
    } else {
        Write-Output "Get-NetTCPConnection bu ortamda bulunamadı; veri toplanmadı."
    }
} catch {
    Write-Output ("TCP uçları okunamadı veya erişim sınırlı: {0}" -f $_.Exception.Message)
}

Write-Section "Örnek çalışan servisler"
try {
    Get-Service |
        Where-Object Status -eq 'Running' |
        Sort-Object -Property DisplayName |
        Select-Object -First 10 Status, Name, DisplayName |
        Format-Table -AutoSize
} catch {
    Write-Output ("Servis bilgisi alınamadı: {0}" -f $_.Exception.Message)
}

Write-Output ""
Write-Output "Bitti. Hiçbir ayar değiştirilmedi."

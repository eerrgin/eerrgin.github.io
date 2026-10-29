# Mimari ve Veri Akışı Diyagramları

## Öğrenim rotası

    flowchart TD
      A[Öğrenme notu] --> B[Çalışan prototip]
      B --> C[Test ve sınır koşulları]
      C --> D[Ölçüm ve değerlendirme]
      D --> E[Dokümantasyon ve lisans kontrolü]
      E --> F[CI kalite kapısı]
      F --> G[Sürümlü yayın ve portföy]
      F -->|Başarısız| H[Kusur kaydı ve düzeltme]
      H --> B

## Kaynaklı bilgi akışı

    flowchart LR
      Q[Soru] --> N[Normalleştirme]
      N --> R[İzinli kaynaklarda arama]
      R --> E[Kanıt parçaları]
      E --> G[Kaynak eşlemesi]
      G --> V[Şema ve güvenlik kontrolü]
      V --> O[Yanıt ve kaynak izi]
      R -->|Kanıt yetersiz| U[Yeterli dayanak bulunamadı]

## İşlem akışı

    flowchart TD
      C[Komut] --> V[Doğrulama ve tenant kapsamı]
      V --> D[Domain işlemi]
      D --> A[Denetim olayı]
      D --> O[Outbox: sonraki aşama]
      O --> P[İdempotent yayınlayıcı]
      P --> R[Alıcı / okuma modeli]

Outbox diyagramı hedef mimariyi gösterir. İlk Java bellek içi prototipi kalıcı transactional outbox uygulamaz.

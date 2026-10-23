# eerrgin — Gece Vardiyası

Ana belge: [`README.md`](./README.md).

- Site, GitHub Pages ile `main` dalının kökünden yayınlanır. `index.html`, `style.css`, `script.js`, `fx.js`, `tigerk.js`, `hat.js`, `photos/` ve `fonts/` birbirine bağlıdır.
- MycelForge, [kaynak deposundan](https://github.com/eerrgin/mycelforge) test edilerek `/mycelforge/` dizinine yayımlanır. Oluşturulmuş `mycelforge/assets/` paketlerini elle düzenleme.
- `node scripts/check.mjs` yerel HTML, dosya, çapa, JSON, SVG/XML ve JavaScript kontrollerini çalıştırır. Kontrol GitHub Actions'ta da her push ve pull request için çalışır.
- Eski kopyalar `gh-pages/` ve `github-pages/` ayrı URL'ler olarak korunur; ana görünümle tutarlı tutulurlar.
- Tarayıcı eski görünümü tutuyorsa Ctrl+Shift+R (Mac: Cmd+Shift+R) ile yenile.
- `ergin-lab/`, `kirpintilar/`, `message.html` ve `oku.html` gibi bağlı deneyleri bağımlılıklarını kontrol etmeden silme.

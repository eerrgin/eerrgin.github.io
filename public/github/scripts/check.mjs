// Bağımlılıksız site kontrolü: kırık yerel bağlantılar, eksik #çapalar,
// JSON/XML/JS sözdizimi ve temel HTML hataları. Çalıştır: node scripts/check.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const skip = new Set([".git", "node_modules", "dist", ".github", "public"]);
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith(".html"));

for (const file of htmlFiles) {
  const rel = relative(root, file);
  const html = readFileSync(file, "utf8");
  if (!/<!doctype html>/i.test(html)) fail(rel, "<!doctype html> yok");
  if (!/<html[^>]*\blang=/i.test(html)) fail(rel, "<html lang> yok");
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) fail(rel, "viewport meta yok");
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(rel, "boş ya da eksik <title>");

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const seen = new Set();
  for (const id of [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])) {
    if (seen.has(id)) fail(rel, `yinelenen id: ${id}`);
    seen.add(id);
  }

  for (const m of html.matchAll(/\b(?:src|href)="([^"]*)"/g)) {
    const ref = m[1];
    if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    if (ref.startsWith("#")) {
      if (ref.length > 1 && !ids.has(ref.slice(1))) fail(rel, `çapa bulunamadı: ${ref}`);
      continue;
    }
    const clean = ref.split("#")[0].split("?")[0];
    const target = clean.startsWith("/") ? join(root, clean) : resolve(dirname(file), clean);
    if (!existsSync(target)) fail(rel, `kırık yerel bağlantı: ${ref}`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(m[0])) fail(rel, `alt metni olmayan görsel: ${m[0].slice(0, 70)}`);
  }
}

for (const file of files) {
  const rel = relative(root, file);
  try {
    if (file.endsWith(".json") || file.endsWith(".webmanifest")) JSON.parse(readFileSync(file, "utf8"));
    if (file.endsWith(".js") || file.endsWith(".mjs")) execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    if (file.endsWith(".svg") || file.endsWith(".xml")) {
      const text = readFileSync(file, "utf8");
      if (!/<(svg|urlset)\b/.test(text)) fail(rel, "geçerli kök öğe yok");
    }
  } catch (err) {
    fail(rel, `sözdizimi hatası: ${String(err.message).split("\n")[0]}`);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} sorun bulundu:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} HTML dosyası ve ${files.length} dosya kontrol edildi, sorun yok.`);

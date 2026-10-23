// Bağımlılıksız site kontrolü: kırık yerel bağlantılar, eksik #çapalar,
// JSON/XML/JS sözdizimi ve temel HTML hataları. Çalıştır: node scripts/check.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skip = new Set([".git", "node_modules", "dist", "dist-pages", ".github", "public"]);
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
const templateFiles = new Set(["scripts/install-page.html"]);

function stripJsonComments(input) {
  let output = "";
  let inString = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];

    if (lineComment) {
      if (ch === "\\n") {
        lineComment = false;
        output += "\\n";
      } else output += " ";
      continue;
    }
    if (blockComment) {
      if (ch === "*" && next === "/") {
        output += "  ";
        i += 1;
        blockComment = false;
      } else output += ch === "\\n" ? "\\n" : " ";
      continue;
    }
    if (inString) {
      output += ch;
      if (escaped) escaped = false;
      else if (ch === "\\\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      output += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      output += "  ";
      i += 1;
      lineComment = true;
      continue;
    }
    if (ch === "/" && next === "*") {
      output += "  ";
      i += 1;
      blockComment = true;
      continue;
    }
    output += ch;
  }
  return output;
}

function parseJsonc(input) {
  const clean = stripJsonComments(input);
  let output = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < clean.length; i += 1) {
    const ch = clean[i];
    if (inString) {
      output += ch;
      if (escaped) escaped = false;
      else if (ch === "\\\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      output += ch;
      continue;
    }
    if (ch === ",") {
      let j = i + 1;
      while (j < clean.length && /\\s/.test(clean[j])) j += 1;
      if (clean[j] === "}" || clean[j] === "]") continue;
    }
    output += ch;
  }
  return JSON.parse(output);
}

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
    if (templateFiles.has(rel) && (ref.startsWith("/__grok/") || ref.includes("{{"))) continue;
    if (ref.includes("{{")) continue;
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
    if (file.endsWith(".json") || file.endsWith(".webmanifest")) {
      const source = readFileSync(file, "utf8");
      if (file.endsWith("tsconfig.json") || file.endsWith("jsconfig.json")) parseJsonc(source);
      else JSON.parse(source);
    }
    if (file.endsWith(".js") || file.endsWith(".mjs")) execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    if (file.endsWith(".css")) {
      const css = readFileSync(file, "utf8");
      for (const m of css.matchAll(/url\\(\\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\\s*\\)/gi)) {
        const ref = (m[1] || m[2] || m[3] || "").trim();
        if (!ref || /^(data:|https?:|blob:|#|var\\()/i.test(ref) || ref.startsWith("//")) continue;
        const target = ref.startsWith("/")
          ? join(root, ref.replace(/^\\/+/, ""))
          : resolve(dirname(file), ref);
        if (!existsSync(target)) fail(relative(root, file), `kırık CSS varlığı: ${ref}`);
      }
    }
    if (file.endsWith(".svg") || file.endsWith(".xml")) {
      const text = readFileSync(file, "utf8");
      if (!/<(svg|urlset)\b/.test(text)) fail(rel, "geçerli kök öğe yok");
    }
  } catch (err) {
    fail(rel, `sözdizimi hatası: ${String(err.message).split("\n")[0]}`);
  }
}

// Ana sayfadaki kullanıcı girişleri etiketli olmalı.
const home = readFileSync(join(root, "index.html"), "utf8");
for (const match of home.matchAll(/<(input|textarea|select)\\b([^>]*)>/gi)) {
  const attributes = match[2];
  const type = (attributes.match(/\\btype=["']([^"']+)["']/i) || [])[1] || "";
  if (/^(hidden|submit|reset|button)$/i.test(type)) continue;
  const id = (attributes.match(/\\bid=["']([^"']+)["']/i) || [])[1];
  const hasAriaName = /\\baria-label\\s*=|aria-labelledby\\s*=/i.test(attributes);
  const hasLabel = id && new RegExp('<label\\\\b[^>]*\\\\bfor=["\\\\']' + id.replace(/[^a-zA-Z0-9_-]/g, "\\\\if (errors.length) {") + '["\\\\']', "i").test(home);
  if (!hasAriaName && !hasLabel) fail("index.html", `giriş alanında erişilebilir etiket eksik: ${id || match[1]}`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} sorun bulundu:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${htmlFiles.length} HTML dosyası ve ${files.length} dosya kontrol edildi, sorun yok.`);

#!/usr/bin/env node
// Static site checks: local assets, anchors, HTML metadata, JSON/JSONC and JS syntax.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skip = new Set([".git", "node_modules", "dist", "dist-pages", ".github", "public"]);
const templateFiles = new Set(["scripts/install-page.html"]);
const errors = [];
const fail = (file, message) => errors.push(file + ": " + message);

function walk(dir, output = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}

function parseJsonc(source) {
  // These config files intentionally allow comments. Project values do not use comment tokens in strings.
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/^\s*\/\/.*$/gm, "");
  const withoutTrailingCommas = withoutLineComments.replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(withoutTrailingCommas);
}

function checkJavaScript(file) {
  execFileSync(process.execPath, ["--check", file], { encoding: "utf8", stdio: "pipe" });
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const rel = relative(root, file);
  const html = readFileSync(file, "utf8");
  if (!/<!doctype html>/i.test(html)) fail(rel, "DOCTYPE is missing");
  if (!/<html[^>]*\blang=/i.test(html)) fail(rel, "html lang is missing");
  if (!/<meta[^>]*name=["']viewport["']/i.test(html)) fail(rel, "viewport meta is missing");
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(rel, "title is missing or empty");

  const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const ids = new Set(idMatches);
  const seen = new Set();
  for (const id of idMatches) {
    if (seen.has(id)) fail(rel, "duplicate id: " + id);
    seen.add(id);
  }

  for (const match of html.matchAll(/\b(?:src|href)="([^"]*)"/g)) {
    const ref = match[1].trim();
    if (!ref || /^(https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(ref) || ref.startsWith("//")) continue;
    if (ref.startsWith("#")) {
      if (ref.length > 1 && !ids.has(ref.slice(1))) fail(rel, "missing anchor: " + ref);
      continue;
    }
    // The Grok install document is a platform template, not a standalone page in this repository.
    if (templateFiles.has(rel) && (ref.startsWith("/__grok/") || ref.includes("{{"))) continue;
    if (ref.includes("{{")) continue;

    const clean = ref.split("#")[0].split("?")[0];
    let decoded = clean;
    try { decoded = decodeURIComponent(clean); } catch {}
    const target = decoded.startsWith("/")
      ? join(root, decoded.replace(/^\/+/, ""))
      : resolve(dirname(file), decoded);
    if (!existsSync(target)) fail(rel, "broken local reference: " + ref);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(match[0])) fail(rel, "image missing alt text");
  }

  if (rel === "index.html") {
    for (const scriptName of ["fx.js", "script.js", "tigerk.js", "hat.js"]) {
      if (!html.includes('src="' + scriptName + '"')) {
        fail(rel, "interaction script is not linked: " + scriptName);
      }
    }
    if (!html.includes("https://eerrgin.github.io/mycelforge/")) {
      fail(rel, "homepage is missing the MycelForge link");
    }

    for (const match of html.matchAll(/<(input|textarea|select)\b([^>]*)>/gi)) {
      const attrs = match[2];
      const type = (attrs.match(/\btype=["']([^"']+)["']/i) || [])[1] || "";
      if (/^(hidden|submit|reset|button)$/i.test(type)) continue;
      const id = (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1];
      const ariaLabel = /\baria-label\s*=|aria-labelledby\s*=/i.test(attrs);
      const hasLabel = id && (
        html.includes('for="' + id + '"') ||
        html.includes("for='" + id + "'")
      );
      if (!ariaLabel && !hasLabel) fail(rel, "form control has no accessible label: " + (id || match[1]));
    }
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

    if (file.endsWith(".js") || file.endsWith(".mjs")) checkJavaScript(file);

    if (file.endsWith(".css")) {
      const css = readFileSync(file, "utf8");
      for (const match of css.matchAll(/url\(([^)]*)\)/gi)) {
        const ref = match[1].trim().replace(/^["']|["']$/g, "");
        if (!ref || /^(data:|https?:|blob:|#|var\()/i.test(ref) || ref.startsWith("//")) continue;
        const target = ref.startsWith("/")
          ? join(root, ref.replace(/^\/+/, ""))
          : resolve(dirname(file), ref);
        if (!existsSync(target)) fail(rel, "broken CSS asset: " + ref);
      }
      if (rel === "style.css" && !/@media\s*\(max-width:\s*600px\)/i.test(css)) {
        fail(rel, "phone layout breakpoint is missing");
      }
      if (rel === "style.css" && !/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(css)) {
        fail(rel, "reduced-motion support is missing");
      }
    }

    if (file.endsWith(".svg") || file.endsWith(".xml")) {
      const source = readFileSync(file, "utf8");
      if (!/<(svg|urlset)\b/i.test(source)) fail(rel, "expected SVG/XML root element is missing");
    }
  } catch (error) {
    const detail = String(error?.stderr || error?.message || error).trim().split("\n")[0];
    fail(rel, "syntax/parse error: " + detail);
  }
}

const mirroredHomepageFiles = [
  "index.html",
  "style.css",
  "script.js",
  "fx.js",
  "tigerk.js",
  "hat.js",
  "manifest.webmanifest",
  "favicon.svg",
];
for (const directory of ["gh-pages", "github-pages"]) {
  for (const name of mirroredHomepageFiles) {
    const canonicalPath = join(root, name);
    const mirrorPath = join(root, directory, name);
    if (!existsSync(mirrorPath)) {
      fail(directory + "/" + name, "homepage mirror file is missing");
      continue;
    }
    if (readFileSync(canonicalPath, "utf8") !== readFileSync(mirrorPath, "utf8")) {
      fail(directory + "/" + name, "homepage mirror differs from the canonical root file");
    }
  }
}

if (errors.length) {
  console.error("✗ " + errors.length + " issue(s) found:\n" + errors.map((error) => "  - " + error).join("\n"));
  process.exit(1);
}
console.log("✓ " + htmlFiles.length + " HTML files and " + files.length + " files checked.");

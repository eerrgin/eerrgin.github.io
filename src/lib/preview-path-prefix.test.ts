import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { prefixRewrite, previewPathPrefix } from "./preview-path-prefix.ts";

const PORT = "/hds-up68yqz8egcm-6014-7b575";
const PATH_HOSTS = new Set([
  "preview.ergin-teknik-atolye.invalid",
  "preview-alt.ergin-teknik-atolye.invalid",
  "preview-gateway.ergin-teknik-atolye.invalid",
]);

describe("previewPathPrefix", () => {
  it("reads the port id segment only on explicitly configured path-based preview hosts", () => {
    assert.equal(previewPathPrefix("preview.ergin-teknik-atolye.invalid", `${PORT}/`, PATH_HOSTS), PORT);
    assert.equal(previewPathPrefix("PREVIEW-ALT.ERGIN-TEKNIK-ATOLYE.INVALID", `${PORT}/about`, PATH_HOSTS), PORT);
    assert.equal(previewPathPrefix("preview-gateway.ergin-teknik-atolye.invalid", PORT, PATH_HOSTS), PORT);
  });

  it("ignores unconfigured hosts and paths without a port id", () => {
    assert.equal(previewPathPrefix("abc.ergin-teknik-atolye.invalid", `${PORT}/`, PATH_HOSTS), undefined);
    assert.equal(previewPathPrefix("localhost", `${PORT}/`, PATH_HOSTS), undefined);
    assert.equal(previewPathPrefix("preview.ergin-teknik-atolye.invalid", "/about", PATH_HOSTS), undefined);
    assert.equal(previewPathPrefix("preview.ergin-teknik-atolye.invalid", "/hds-abc-web-x1/", PATH_HOSTS), undefined);
    assert.equal(previewPathPrefix("preview.ergin-teknik-atolye.invalid", `${PORT}.js`, PATH_HOSTS), undefined);
    assert.equal(previewPathPrefix("preview.ergin-teknik-atolye.invalid", `${PORT}/`), undefined);
  });
});

describe("prefixRewrite", () => {
  const rewrite = prefixRewrite(PORT);
  const run = (fn: typeof rewrite.input, href: string) =>
    String(fn?.({ url: new URL(href, "https://preview.ergin-teknik-atolye.invalid") }));

  it("strips the prefix on input", () => {
    assert.equal(run(rewrite.input, PORT), "https://preview.ergin-teknik-atolye.invalid/");
    assert.equal(run(rewrite.input, `${PORT}/a?b=1#c`), "https://preview.ergin-teknik-atolye.invalid/a?b=1#c");
    assert.equal(run(rewrite.input, "/other"), "https://preview.ergin-teknik-atolye.invalid/other");
  });

  it("adds the prefix on output", () => {
    assert.equal(run(rewrite.output, "/a?b=1"), `https://preview.ergin-teknik-atolye.invalid${PORT}/a?b=1`);
    assert.equal(run(rewrite.output, "/"), `https://preview.ergin-teknik-atolye.invalid${PORT}/`);
  });
});

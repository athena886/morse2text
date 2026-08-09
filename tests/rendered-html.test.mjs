import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const url = new URL("../dist/server/index.js", import.meta.url);
  url.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(url.href);

  return worker.fetch(
    new Request(`https://morse2text.com${path}`, {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Morse translator and SEO metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>Morse Code Translator &amp; Generator/);
  assert.match(html, /<meta name="description" content="Free online Morse Code Translator &amp; Generator/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /"@type":"WebApplication"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /Download WAV/);
  assert.match(html, /Morse code alphabet/);
  assert.doesNotMatch(html, /codex-preview/i);
});

test("renders all public routes", async () => {
  for (const path of ["/", "/morse-code-alphabet", "/learn-morse-code"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
  }
});

test("ships crawl controls and branded static assets", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
  ]);

  assert.match(robots, /https:\/\/morse2text\.com\/sitemap\.xml/);
  for (const url of [
    "https://morse2text.com/",
    "https://morse2text.com/morse-code-alphabet/",
    "https://morse2text.com/learn-morse-code/",
  ]) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
  }

  for (const file of ["og.png", "favicon.svg", "404.html"]) {
    await access(new URL(`../public/${file}`, import.meta.url));
  }
});

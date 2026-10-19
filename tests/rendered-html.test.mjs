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
  for (const path of ["/", "/morse-code-alphabet", "/learn-morse-code", "/morse-code-practice"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    const canonical = `https://morse2text.com${path === "/" ? "/" : `${path}/`}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`), path);
    assert.doesNotMatch(html, /<meta name="robots" content="noindex"/);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    if (path !== "/") {
      const breadcrumb = schemas.find(schema => schema["@type"] === "BreadcrumbList");
      assert.equal(breadcrumb.itemListElement.at(-1).item, canonical);
    }
  }
});

test("existing pages expose real task controls and accurate feature boundaries in HTML", async () => {
  const home = await (await render()).text();
  assert.match(home, /Translation mode/);
  assert.match(home, /Morse to text/);
  assert.match(home, /not audio recordings/);
  assert.match(home, /Copy A in Morse code/);
  const alphabet = await (await render("/morse-code-alphabet")).text();
  assert.match(alphabet, /Print chart/);
  assert.match(alphabet, /Download SVG chart/);
  for (const letter of ["A", "Z", "0", "9"]) {
    assert.match(alphabet, new RegExp(`Listen to ${letter}`));
    assert.match(alphabet, new RegExp(`Copy ${letter} in Morse code`));
  }
  const learn = await (await render("/learn-morse-code")).text();
  assert.match(learn, /id="listening-samples"/);
  assert.match(learn, /Listen to sample 1/);
  assert.match(learn, /not a scored quiz/);
  assert.doesNotMatch(learn, /without leaving the page/);
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
    "https://morse2text.com/morse-code-practice/",
  ]) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), url);
  }

  for (const file of ["og.png", "favicon.svg", "404.html"]) {
    await access(new URL(`../public/${file}`, import.meta.url));
  }
});

test("practice is pre-rendered with an honest quiz, metadata, schema, and no preselected answer", async () => {
  const html = await (await render("/morse-code-practice")).text();
  assert.match(html, /<title>Morse Code Practice — Listen, Answer &amp; Improve/);
  assert.match(html, /Start 10-question session/);
  for (const text of ["Character set", "Character speed", "Volume", "How to practice", "How your results work", "Speed and audio help", "Clear practice data"]) assert.ok(html.includes(text));
  assert.doesNotMatch(html, /class="answer-feedback/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const app = schemas.find(s => s["@type"] === "WebApplication");
  assert.equal(app.url, "https://morse2text.com/morse-code-practice/");
  assert.equal(app.applicationCategory, "EducationalApplication");
});
test("practice is linked from the homepage and learning guide and links back to the core tools", async () => {
  for (const path of ["/", "/learn-morse-code"]) assert.match(await (await render(path)).text(), /href="\/morse-code-practice\/"/);
  const html = await (await render("/morse-code-practice")).text();
  for (const href of ["/#translator", "/learn-morse-code/", "/morse-code-alphabet/"]) assert.ok(html.includes(`href="${href}"`));
});

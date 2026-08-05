# BaybayinTranslate.com

A static-first Baybayin translator and learning hub for English and Tagalog. Every route renders complete HTML for search engines; browser JavaScript is reserved for translation, exports, sharing, and the tattoo preview.

## Features

- Sound-based English and Tagalog to Baybayin conversion
- Per-character Latin guides and three display styles
- PNG and SVG export, transparent backgrounds, copy, and share links
- Baybayin tattoo generator with four visual treatments
- Interactive learning chart, article library, font guide, and regional script guides
- WebApplication, FAQPage, HowTo, and Article structured data
- Sitemap, robots policy, responsive layout, and generated social card

## Develop and validate

```bash
npm run dev
npm run build:pages
npm test
```

The static page export is written to `dist/client` for Cloudflare Pages-compatible hosting.

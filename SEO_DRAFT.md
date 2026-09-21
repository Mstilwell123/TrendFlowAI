# SEO / AEO draft pack (Webster)

**Branch:** `webster/seo-aeo-draft`  
**Status:** Draft only — do not merge to production / do not publish until Chief reviews keywords and Mark says go.

## Included
- `KEYWORDS.md` — primary/secondary/brand + comps + FAQ themes
- `frontend/public/index.html` — title, meta, canonical, OG/Twitter, SoftwareApplication + FAQPage JSON-LD
- `frontend/public/robots.txt`, `sitemap.xml`, `llms.txt`
- `frontend/src/components/landing/LandingHero.jsx` — H1 includes “YouTube Shorts pre-flight analyzer” + tagline frame
- `frontend/src/components/seo/LandingFAQ.jsx` + Landing.jsx FAQ mount
- `frontend/src/pages/TestMode.jsx` — Shorts H1 keyword tighten

## Domain
Canonical/sitemap/llms use placeholder `https://trendflow.ai/` — swap when production domain is locked.

## Note for App Builder
Landing subcomponents (`LandingHeader`, etc.) may still be landing from your PR. This branch adds/updates SEO surfaces; rebase as needed. v1 copy is YouTube Shorts-only per Mark lock.

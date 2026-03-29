# Slackline Hub — Project State
> Last updated: March 29, 2026 — end of session 3
> Update this file at the end of every work session.

---

## 🔴 Current status: IN DEVELOPMENT (URL private — not shared publicly)

---

## Infrastructure

| Service | URL / ID | Notes |
|---------|----------|-------|
| GitHub | github.com/cayanandante/slackline-hub | Main repo |
| Live site | slackline-hub.vercel.app | Vercel free tier, auto-deploys from main |
| Supabase project ID | qgcemdwsruveqdiddhjz | Free tier |
| Supabase URL | https://qgcemdwsruveqdiddhjz.supabase.co | |
| Supabase anon key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4 | Safe to store |
| Cloudflare Worker | https://slackline-hub-worker.cayandantas.workers.dev | Claude API proxy — LIVE |
| Claude API | via Cloudflare Worker | Key stored as Cloudflare secret |
| vercel.json | ✅ in repo root | Rewrites all routes to index.html (SPA routing fix) |

---

## Tech stack

- **Frontend**: React + TypeScript + Vite (local: ~/slackline-hub/)
- **Styling**: CSS-in-JS inline styles only — NO Tailwind, NO shadcn, NO external CSS libraries
- **Routing**: react-router-dom (vercel.json required for client-side routing to work)
- **Fonts**: Barlow Condensed (display/headings) + DM Sans (body) — loaded in index.html via Google Fonts
- **Database**: Supabase (Postgres + pgvector)
- **AI**: Claude API claude-sonnet-4-20250514 — via Cloudflare Worker ✅ LIVE
- **Deploy**: Vercel — auto-deploys from GitHub main in ~30 seconds

---

## Design system (NEW — session 3)

All pages now use a unified design system. NO old Fraunces/DM Mono/warm paper palette.

```
Colors:
  navy:   #0a1628   (backgrounds, headlines)
  blue:   #1a56db   (accent, CTAs, active states)
  white:  #ffffff   (card backgrounds)
  bg:     #f5f6f8   (page background)
  muted:  #6b7a99   (secondary text)
  border: #dde2ed   (card borders, dividers)
  text:   #0a1628   (body text)

Typography:
  FONT = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif"
  Body = "'DM Sans', sans-serif"

Layout pattern:
  - Navy header section with large uppercase headline
  - White/bg content area below
  - Blue accent on numbers, tags, active states
  - Chip/pill buttons: active = blue filled, inactive = white with border

Page header pattern (all inner pages):
  - Navy background
  - ← Slackline Hub back link (top left)
  - Category label (blue, uppercase, small)
  - Big uppercase headline (clamp 3rem to 6rem)
  - Stats row (top right, blue numbers)
```

---

## Workflow

```bash
git add .
git commit -m "describe what changed"
git push
# Vercel redeploys automatically in ~30 seconds
```

---

## Project file structure

```
slackline-hub/
├── vercel.json                     ← SPA routing fix (rewrites all to index.html)
├── index.html                      ← Google Fonts: Barlow Condensed + DM Sans
├── package.json
├── PROJECT_STATE.md                ← this file
└── src/
    ├── index.css                   ← minimal globals
    ├── main.tsx                    ← entry point
    ├── App.tsx                     ← all routes
    ├── data/
    │   ├── webbing_database.json   ← 241 webbings merged (SlackDB + ISA + BC)
    │   └── slack-db_webbing.json   ← original SlackDB export (can delete)
    └── pages/
        ├── Index.tsx               ← homepage (/)
        ├── PhysicsCalculator.tsx   ← /tools/physics
        ├── KnowledgeLibrary.tsx    ← /knowledge/resources
        ├── WebbingDatabase.tsx     ← /gear/webbing
        └── DoubleCheck.tsx         ← /tools/double-check (hidden from nav)
```

---

## Full site structure

```
Slackline Hub
│
├── /                    Home ✅ LIVE
│
├── /tools
│   ├── /physics         Forces Calculator ✅ LIVE
│   ├── /chat            AI Knowledge Chat ❌
│   ├── /knots           Knot Guide ❌
│   └── /double-check    AI Safety Check ✅ (built, hidden from nav)
│
├── /knowledge
│   ├── /resources       Resource Library ✅ LIVE
│   ├── /glossary        PT/EN Glossary ❌
│   └── /videos          Video Library ❌
│
├── /community
│   ├── /events          Events Calendar ❌
│   └── /incidents       Incidents Database ❌
│
├── /freestyle           Highline Freestyle ❌
│
├── /gear
│   └── /webbing         Webbing Database ✅ LIVE
│
└── /rigger              ISA Rigger Flashcards ❌
```

---

## What's built ✅

### Homepage (/) ✅ LIVE — redesigned session 3
- Navy hero with full-width big condensed headline
- Blue stats bar (241 webbings, 463 resources, 96 stretch curves, 3 languages)
- 3 live tool cards (Forces Calculator, Webbing Database, Resource Library)
- Coming soon grid (6 tools)
- About section: "Built by a slackliner, for slackliners"
- Minimal footer: SLACKLINE HUB / Built by Cayan Dantas / cayandantas@proton.me
- Language selector in nav (EN active, PT/ES coming soon)
- No yellow warning banners

### Physics Calculator (/tools/physics) ✅ LIVE — redesigned session 3
5 calculators, same engineering logic, updated shell to match new design system:
1. Line Tension & Anchor Load — exact + approximate (Balance Community model), safety factor
2. Anchor Angle & Elevation — 2/3/4 legs, flat + elevated
3. Backup Fall Simulator — Athanasiadis model, H>2(L+S)
4. Midline Safety Height Checker
5. Mechanical Advantage Calculator — 5 pulley systems

### Resource Library (/knowledge/resources) ✅ LIVE — redesigned session 3
- 463 resources from Supabase
- Navy header, big condensed headline
- Search + language filter (PT/EN) + type filter (video, article, document, etc.)
- Collapsible sections with +/− toggle, Expand all / Collapse all
- Card grid per section with type badge, language badge, author, year, domain link
- Stats: total, Portuguese, English counts

### Webbing Database (/gear/webbing) ✅ LIVE — built session 3
- 241 webbings merged from SlackDB + ISA SlackData + Balance Community
- Data file: `src/data/webbing_database.json` (177KB)
- 3 view tabs: Stretch Chart / Stretch Table / All Specs
- **Stretch Chart:**
  - SVG line chart, 0–12 kN fixed axis, 0–25% stretch
  - 10 distinct symbols per line (circle, square, triangle, diamond, etc.)
  - Sidebar legend (scrollable, click to toggle individual webbings)
  - Legend shows only filtered/active webbings
  - Hover highlights nearest single line with tooltip: name + % + kN + brand
  - All on / All off / Show filtered only controls
  - Dashed lines = discontinued
- **Stretch Table:** webbings as rows, 1–12 kN as columns, values interpolated
- **All Specs Table:** sortable by name, brand, MBS, weight, width
- Filters: search, status (All/Active/Discontinued), material (Polyester/Nylon/Dyneema/Hybrid), sort
- Status shown as full word "Active" / "Discontinued" (not "DC")

### AI Double-Check Assistant (/tools/double-check) ✅ BUILT (hidden from nav)
- Calls Claude API via Cloudflare Worker
- Returns structured safety checklist

### Cloudflare Worker ✅ LIVE
- URL: https://slackline-hub-worker.cayandantas.workers.dev
- Claude API proxy — CORS enabled

### Supabase ✅
- `resources` table — 463 rows seeded
- Other tables (teams, events, incidents, gear, glossary) — empty

### Data files ✅
- `webbing_database.json` — 241 webbings, merged from 3 sources
  - SlackDB: 204 total, 118 active (MBS, weight, width, type, material, URL)
  - ISA SlackData: 80 webbings (stretch curves, additional brands)
  - Balance Community: 22 webbings with precise 1–12 kN stretch data
  - Schema: id, name, brand, webbingType, material[], widthMm, weightGm, mbsKn, wllKn, depthMm, url, discontinued, stretchCurve[], stretchSource, sources[]

---

## What's NOT built yet ❌ (priority order)

1. **Tension Calculator update** — update to Balance Community exact+approximate dual model
2. **Knot Guide** — /tools/knots — custom SVG knots (10–12 highline rigging knots)
3. **AI Knowledge Chat** — /tools/chat — RAG chatbot over guide content
4. **Highline Freestyle** — /freestyle — Google Sheet API (262 tricks, 23 combos)
5. **Glossary** — /knowledge/glossary — from Glossário PDF
6. **Video Library** — /knowledge/videos — YouTube API
7. **Events Calendar** — /community/events — ISA data API
8. **Incidents Database** — /community/incidents
9. **Rigger Flashcards** — /rigger
10. **i18n** — PT/EN/ES via i18next (nav selector built as placeholder)
11. **Custom domain** — not yet purchased
12. **RAG pipeline** — pgvector embeddings for Knowledge Chat

Removed from roadmap:
- ~~World Team Map~~ — dropped (Cayan's decision)
- ~~Blog~~ — deprioritized

---

## External data sources

| Source | What | How to access |
|--------|------|---------------|
| ISA slackline-data | Countries, national teams | github.com/International-Slackline-Association/slackline-data |
| ISA SlackMap API | 7000+ spots worldwide | slackmap.slacklineinternational.org/api |
| ISA Events API | Events, competitions | data.slacklineinternational.org/events |
| ISA SlackData | Webbing specs + stretch curves | github.com/International-Slackline-Association/SlackData |
| SlackDB | 204 webbings (MBS, WLL, weight) | slackdb.com — fetched via F12/XHR |
| Balance Community | Precise stretch curves 1–12 kN for 22 webbings | balancecommunity.com/collections/stretch |
| Highline Freestyle | 262 tricks, 23 combos | Google Sheet (public CSV export) |
| YouTube API | Videos | YouTube Data API v3 (free) |
| AnimatedKnots | NOT usable — copyrighted, no API | Build own SVG knots |

---

## Files in Claude project knowledge

- `PROJECT_STATE.md` — this file (session source of truth)
- `guia_do_highline_latex.tex` — full LaTeX source of the guide
- `knowledge_base_full.json` — 463 resources (v2.2)
- `highline-freestyle_com3-29-2026.json` — Freestyle DB schema
- `webbing_database.json` — 241 merged webbings (session 3 output)
- `slack-db_webbing.json` — original SlackDB export
- `ISA_webbing.json` — ISA SlackData webbing export
- `App.tsx` — routes
- `Index.tsx` — homepage (session 3 design)
- `PhysicsCalculator.tsx` — physics calculator (session 3 shell)
- `WebbingDatabase.tsx` — webbing database (session 3)
- `KnowledgeLibrary.tsx` — resource library (session 3)
- `DoubleCheck.tsx` — AI safety check

---

## Safety principles (non-negotiable)

- All AI advice must include: "⚠️ Always verify with a certified ISA Rigger"
- Never hallucinate gear specs, MBS values, or safety thresholds
- Physics calculators: always show assumptions and limitations
- No yellow warning banners on UI (removed session 3) — safety note lives in AI responses only

---

## Contact

- **Owner**: Cayan Dantas — cayandantas@proton.me
- **Role**: ISA-certified Rigger, Mechanical Engineer, Brazil

# Slackline Hub — Project State
> Last updated: March 29, 2026 — end of session 2
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

---

## Tech stack

- **Frontend**: React + TypeScript + Vite (local: ~/slackline-hub/)
- **Styling**: CSS-in-JS inline styles + src/index.css (NO Tailwind, NO shadcn)
- **Routing**: react-router-dom
- **Fonts**: Fraunces (serif) + DM Mono (labels) + DM Sans (body) — loaded in index.html
- **Maps**: Leaflet.js (for team/spot/events maps)
- **Database**: Supabase (Postgres + pgvector)
- **AI**: Claude API claude-sonnet-4-20250514 — via Cloudflare Worker ✅ LIVE
- **Deploy**: Vercel — auto-deploys from GitHub main in ~30 seconds

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
├── src/
│   ├── index.css                   ← global styles + brand tokens
│   ├── main.tsx                    ← entry point
│   ├── App.tsx                     ← all routes
│   └── pages/
│       ├── Index.tsx               ← homepage (/)
│       ├── PhysicsCalculator.tsx   ← /tools/physics
│       ├── KnowledgeLibrary.tsx    ← /knowledge/resources
│       └── DoubleCheck.tsx         ← /tools/double-check (built, hidden from nav)
├── index.html                      ← Google Fonts loaded here
├── PROJECT_STATE.md                ← this file
└── package.json
```

---

## Full site structure (planned)

```
Slackline Hub
│
├── /                    Home ✅
│
├── /tools
│   ├── /physics         Forces Calculator ✅
│   ├── /chat            AI Knowledge Chat (next priority)
│   ├── /knots           Knot Guide — static visual, click to expand
│   └── /double-check    AI Safety Check ✅ (built, hidden from nav for now)
│
├── /knowledge
│   ├── /resources       Resource Library ✅ (463 links from Supabase)
│   ├── /glossary        PT/EN Glossary (from Glossário PDF)
│   └── /videos          Video Library (YouTube API)
│
├── /community
│   ├── /teams           World Team Map (ISA slackline-data + Leaflet)
│   ├── /events          Events Calendar + Map (ISA data API)
│   └── /incidents       Incidents Database (ISA SAIR + manual curation)
│
├── /freestyle           Highline Freestyle (Google Sheet API — 262 tricks, 23 combos)
│
├── /gear                Gear Database (SlackDB / ISA SlackData)
│
├── /rigger              ISA Rigger Flashcards
│
└── /blog                Blog (static markdown)
```

---

## What's built ✅

### Homepage (/) ✅ LIVE
Nav, hero ("Tools for Slackliners, by Slackliners"), safety banner, tools grid (5 categories, 12 cards — 1 live, 11 coming soon), knowledge base stats (463 resources), footer.

### Physics Calculator (/tools/physics) ✅ LIVE
5 calculators with real engineering formulas, metric/imperial toggle, live SVG diagrams:
1. Line Tension & Anchor Load — DAV formula + exact trig. Safety factor vs MBS.
2. Anchor Angle & Elevation — 2/3/4 symmetric legs (equally spaced), flat + elevated master point. Top-view + side-view diagrams.
3. Backup Fall Simulator — Athanasiadis model, H>2(L+S) clearance check, webbing selector.
4. Midline Safety Height Checker — H>2(L+S) formula, go/no-go display, visual gauge.
5. Mechanical Advantage Calculator — 5 pulley systems (2:1–6:1), friction loss model.

### Resource Library (/knowledge/resources) ✅ LIVE
- 463 resources loaded from Supabase
- Grouped by guide section (23 sections)
- Search + filter by type + filter by language (PT/EN)
- Collapsible sections

### AI Double-Check Assistant (/tools/double-check) ✅ BUILT (hidden from nav)
- Form: line geometry, anchors, webbing, backup, conditions
- Calls Claude API via Cloudflare Worker
- Returns structured safety checklist with ✅/⚠/❌ per item
- Recommendations + ISA citations

### Cloudflare Worker ✅ LIVE
- URL: https://slackline-hub-worker.cayandantas.workers.dev
- Claude API proxy — hides API key from frontend
- CORS enabled for slackline-hub.vercel.app
- API key stored as Cloudflare secret

### Supabase Schema ✅ (tables created and seeded)
- resources — 463 rows ✅ SEEDED
- teams, events, incidents, gear, glossary — empty, not yet seeded
- knowledge_chunks (pgvector) — empty, not yet seeded
- physics_logs, ai_chat_logs — empty

### Knowledge Base JSON ✅
- knowledge_base_full.json v2.2 — in project files and GitHub
- 463 unique resources, 87 PT, 376 EN, 397 named, 66 image links

---

## What's NOT built yet ❌ (priority order)

1. **Knot Guide** — /tools/knots — static visual, click to expand, custom SVG illustrations
2. **World Team Map** — /community/teams — ISA slackline-data API + Leaflet
3. **Events Calendar + Map** — /community/events — ISA data API + Leaflet
4. **AI Knowledge Chat** — /tools/chat — RAG chatbot over guide content
5. **Highline Freestyle** — /freestyle — Google Sheet API (262 tricks, 23 combos)
6. **Gear Database** — /gear — SlackDB + ISA SlackData
7. **Glossary** — /knowledge/glossary — parse Glossário PDF
8. **Video Library** — /knowledge/videos — YouTube API
9. **Rigger Flashcards** — /rigger — ISA certification study
10. **Incidents Database** — /community/incidents — ISA SAIR
11. **Blog** — /blog — static markdown
12. **i18n** — PT/EN/ES via i18next
13. **Custom domain** — not yet purchased
14. **vercel.json** — noindex headers (site URL not shared publicly)
15. **RAG pipeline** — embed guide content into Supabase pgvector for Knowledge Chat

---

## External data sources

| Source | What | How to access |
|--------|------|---------------|
| ISA slackline-data | Countries, national teams | github.com/International-Slackline-Association/slackline-data |
| ISA SlackMap API | 7000+ lines, 1700+ spots worldwide | slackmap.slacklineinternational.org/api |
| ISA Events API | Events, competitions, certifications | data.slacklineinternational.org/events |
| SlackDB | Gear database (MBS, WLL, weight) | slackdb.com — public endpoints |
| Highline Freestyle | 262 tricks, 23 combos | Google Sheet (public CSV export) |
| YouTube API | Videos, documentaries, tutorials | YouTube Data API v3 (free) |
| AnimatedKnots | NOT usable — copyrighted, no API | Build our own SVG knots instead |

---

## Files in Claude project knowledge

- PROJECT_STATE.md — this file
- main.tex — full LaTeX source of the guide
- Guia_do_Praticante_de_Highline_1.pdf — guide PDF
- Glossário_termos_em_ingles_highline.pdf — PT/EN glossary
- knowledge_base_full.json — 463 resources (v2.2)
- highline-freestyle.com3-29-2026.json — Freestyle DB export (schema only, data in Google Sheet)
- PhysicsCalculator.tsx — physics calculator
- Index.tsx — homepage
- App.tsx — routes
- index.css — global styles
- main.tsx — entry point

---

## Design tokens

```css
--ink:    #0d0f0e    --paper:  #f4f1eb    --paper2: #edeae2
--accent: #c8531a    --green:  #2d6a4f    --muted:  #7a7268
--serif: 'Fraunces', serif
--mono:  'DM Mono', monospace
--sans:  'DM Sans', sans-serif
```

---

## Safety principles (non-negotiable)

- All AI advice: "⚠️ Always verify with a certified ISA Rigger"
- Never hallucinate gear specs, MBS values, or safety thresholds
- Physics calculators: always show assumptions and limitations

---

## Contact

- **Owner**: Cayan Dantas — cayandantas@proton.me
- **Role**: ISA-certified Rigger, mechanical engineering MSc, Brazil

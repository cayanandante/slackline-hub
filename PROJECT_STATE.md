# Slackline Hub — Project State
> Last updated: March 28, 2026
> Update this file at the end of every work session.

---

## 🔴 Current status: IN DEVELOPMENT (not public)

---

## Infrastructure

| Service | URL / ID | Notes |
|---------|----------|-------|
| GitHub | github.com/cayanandante/slackline-hub | Main repo, public |
| Live site | slackline-hub.vercel.app | Vercel, auto-deploys from main |
| Supabase | qgcemdwsruveqdiddhjz.supabase.co | Free tier, EU region |
| Supabase anon key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4 | Public/safe to store here |
| Lovable project | lovable.dev/projects/1dd5750a-4e63-4710-af9c-6e1e1c8b3318 | ABANDONED — not using Lovable anymore |

---

## Tech stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Plain CSS-in-JS (inline styles) + `src/index.css` for globals
- **Routing**: react-router-dom
- **Fonts**: Fraunces (serif display) + DM Mono (labels/code) + DM Sans (body)
- **Brand colors**: ink `#0d0f0e`, paper `#f4f1eb`, accent `#c8531a`, green `#2d6a4f`
- **Database**: Supabase (Postgres + pgvector)
- **AI**: Claude API (claude-sonnet-4-20250514) — routed through Cloudflare Worker (not yet set up)
- **Deploy**: Vercel (auto-deploy from GitHub main branch)
- **No Lovable** — writing all code directly, pushing to GitHub

---

## Project structure

```
slackline-hub/
├── src/
│   ├── index.css              ← global styles + brand tokens
│   ├── main.tsx               ← entry point
│   ├── App.tsx                ← routes
│   └── pages/
│       ├── Index.tsx          ← homepage
│       └── PhysicsCalculator.tsx  ← /tools/physics
├── index.html                 ← fonts loaded here
├── vercel.json                ← (not yet created)
├── package.json
└── PROJECT_STATE.md           ← this file
```

---

## What's built ✅

### Homepage (`/`)
- Nav with logo, links, language switcher (PT/EN/ES — not yet wired)
- Hero section: headline, subtitle, CTA buttons, stats
- Safety warning banner
- Tools grid: 5 categories, 12 tool cards (1 live, 11 "coming soon")
- About/knowledge base section with stats
- Footer with credits

### Physics Calculator (`/tools/physics`) ✅ LIVE
5 full calculators with real engineering formulas:
1. **Line Tension & Anchor Load** — DAV formula + exact trigonometric. Live SVG diagram. Safety factor check against user-input MBS.
2. **Anchor Angle & Elevation** — 2/3/4 symmetric legs. Flat spread mode + elevated master point (A-frame/cavalete) mode. Two diagrams: top-view (plan view) + side-view elevation. Formulas: flat: `F=F/(2·cos(α/2))`, `F/(3·cos(α/3))`, `F/(4·cos(α/2))`; elevated: `F=F/(n·sin(β))`.
3. **Backup Fall Simulator** — Athanasiadis model. Clearance check: `H > 2(L+S)`. Webbing type selector. Cross-section diagram.
4. **Midline Safety Height Checker** — ISA formula `H > 2(L+S)`. Big green/red go/no-go. Visual gauge + side diagram.
5. **Mechanical Advantage Calculator** — 5 pulley systems (2:1 to 6:1). Friction loss model. Reference table.

All calculators: metric/imperial toggle, source citations, safety disclaimer.

### Supabase schema ✅
10 tables created:
- `resources` — 144 curated links (not yet seeded)
- `teams` — 28 Brazilian teams (not yet seeded)
- `events` — festivals/championships/meetups (not yet seeded)
- `incidents` — highline incident reports (not yet seeded)
- `gear` — equipment database
- `glossary` — terms from the Glossário
- `knowledge_chunks` — RAG pipeline chunks (pgvector)
- `physics_logs` — anonymous calculator usage
- `ai_chat_logs` — AI tool logs
- `spots` — ISA SlackMap data

Semantic search function: `search_knowledge(query_embedding, threshold, count)`
RLS enabled on all tables. Public read-only via anon key.

---

## What's NOT built yet ❌

In priority order:

1. **Seed database** — run seed script to load 144 resources + 28 teams + events into Supabase
2. **Resource Library page** — `/knowledge` — searchable grid of all 144 resources
3. **AI Double-Check Assistant** — `/tools/double-check` — safety checklist via Claude API
4. **Cloudflare Worker** — proxy for Claude API (hide key from frontend)
5. **Knowledge Chat** — `/tools/chat` — RAG chatbot over guide content
6. **Brazilian Team Finder** — `/community/teams` — Leaflet map + Supabase
7. **Event Calendar** — `/community/events`
8. **n8n automation** — Google Drive sync, RAG embedding pipeline
9. **i18n** — PT/EN/ES — i18next setup (strings are all in English for now)
10. **Equipment Selector** — `/tools/equipment`
11. **Knot Guide** — `/tools/knots`
12. **Global Spot Map** — `/community/spots` — ISA SlackMap data
13. **ISA Rigger Study App** — `/tools/rigger`
14. **Highline Setup Planner** — `/tools/planner`
15. **PWA optimization**
16. **Custom domain** — slacklinehub.com (not yet purchased)

---

## Key data files

- **Knowledge base JSON**: `highline_hub_knowledge_base.json` — 144 resources, 12 sections, all URLs from the guide
- **Database schema**: `slackline_hub_schema.sql` — full Supabase schema
- **Guide source**: `main.tex` — LaTeX source of the Guia do Praticante de Highline (in Claude project knowledge)
- **Glossário source**: `Glossário_termos_em_ingles_highline.pdf` (in Claude project knowledge)

---

## Workflow

```bash
# Every time Claude gives new code:
git add .
git commit -m "describe what changed"
git push
# Vercel auto-deploys in ~30 seconds
```

---

## Design tokens

```css
--ink:    #0d0f0e   /* deep black */
--paper:  #f4f1eb   /* warm off-white background */
--paper2: #edeae2   /* slightly darker paper */
--accent: #c8531a   /* rust/terracotta — primary accent */
--green:  #2d6a4f   /* forest green — safety */
--muted:  #7a7268   /* warm gray — secondary text */
--serif:  'Fraunces', serif
--mono:   'DM Mono', monospace
--sans:   'DM Sans', sans-serif
```

---

## Safety principles (non-negotiable)

- All AI rigging/safety advice must include: "⚠️ Always verify with a certified ISA Rigger"
- Never hallucinate gear specs, MBS values, or safety thresholds
- All calculators show assumptions and limitations
- Incident database: treat all reports with seriousness, never sensationalize

---

## Contact

- **Project owner**: Cayan Dantas
- **Email**: cayanmecanica@gmail.com
- **ISA Rigger**: certified
- **Location**: Brazil

# Slackline Hub — Project State
> Last updated: March 28, 2026
> Update this file at the end of every work session.

---

## 🔴 Current status: IN DEVELOPMENT (not public)

Site is live at slackline-hub.vercel.app but URL is kept private. Not indexed by search engines yet.

---

## Infrastructure

| Service | URL / ID | Status |
|---------|----------|--------|
| GitHub | github.com/cayanandante/slackline-hub | ✅ Live |
| Live site | slackline-hub.vercel.app | ✅ Live, private |
| Supabase project ID | qgcemdwsruveqdiddhjz | ✅ Schema ready |
| Supabase URL | https://qgcemdwsruveqdiddhjz.supabase.co | ✅ |
| Supabase anon key | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2VtZHdzcnV2ZXFkaWRkaGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjU5NDQsImV4cCI6MjA5MDMwMTk0NH0.oWvKBSFmKheu0_eUd5e9WuOa9LqVpMDXJA71WXC26Y4 | ✅ |
| Lovable | ABANDONED | ❌ Not using |

---

## Tech stack

- **Frontend**: React + TypeScript + Vite (local: ~/slackline-hub/)
- **Styling**: CSS-in-JS inline styles + src/index.css (NO Tailwind, NO shadcn)
- **Routing**: react-router-dom
- **Fonts**: Fraunces + DM Mono + DM Sans (loaded in index.html)
- **Database**: Supabase (Postgres + pgvector)
- **AI**: Claude API claude-sonnet-4-20250514
- **Deploy**: Vercel auto-deploy from GitHub main
- **No Lovable** — all code written in Claude, pushed to GitHub

## Workflow

```bash
git add .
git commit -m "describe what changed"
git push
# Vercel redeploys in ~30 seconds
```

---

## Project file structure

```
slackline-hub/
├── src/
│   ├── index.css                  ← global styles + brand tokens
│   ├── main.tsx                   ← entry point
│   ├── App.tsx                    ← routes
│   └── pages/
│       ├── Index.tsx              ← homepage (/)
│       └── PhysicsCalculator.tsx  ← /tools/physics
├── index.html                     ← Google Fonts loaded here
├── PROJECT_STATE.md               ← this file
└── package.json
```

---

## What's built ✅

### Homepage (/) ✅ LIVE
- Sticky nav with logo and links
- Hero: headline, subtitle, CTA buttons, stats (200+, 28, 12, 3)
- Safety warning banner
- Tools grid: 5 categories, 12 cards (1 live, 11 coming soon)
- Knowledge base stats section
- Footer with credits (Cayan Dantas, ISA)

### Physics Calculator (/tools/physics) ✅ LIVE
5 calculators with real engineering formulas, metric/imperial toggle, live SVG diagrams:
1. **Line Tension & Anchor Load** — DAV formula + exact trig. Safety factor vs MBS.
2. **Anchor Angle & Elevation** — 2/3/4 symmetric legs (equally spaced fan), flat + elevated master point (A-frame). Two diagrams: top-view plan + side-view with beta arc. Formulas: flat: F/(2·cos(a/2)), F/(3·cos(a/3)), F/(4·cos(a/2)); elevated: F/(n·sin(b)).
3. **Backup Fall Simulator** — Athanasiadis model, H>2(L+S) clearance check, webbing selector.
4. **Midline Safety Height Checker** — H>2(L+S) formula, go/no-go display, visual gauge.
5. **Mechanical Advantage Calculator** — 5 pulley systems (2:1-6:1), friction loss model, reference table.

### Supabase Schema ✅ (not yet seeded)
10 tables: resources, teams, events, incidents, gear, glossary, knowledge_chunks (pgvector), physics_logs, ai_chat_logs, spots.
RLS enabled, public read via anon key.

### Knowledge Base ✅ (knowledge_base_full.json v2.2)
- 463 unique resources extracted from the Guia do Praticante de Highline
- 497 total hrefs in LaTeX, 34 duplicates removed
- 87 Portuguese resources (red links in guide)
- 376 English resources (blue links in guide)
- Fields: url, title_pt, author, year, type, source, section, subsection, language
- Types: video (178), document (86), article (67), instagram (48), community (30), shop (27), book (9), tool (4), podcast (3), database (1), app (1)

---

## What's NOT built yet ❌ (in priority order)

1. **Seed database** — insert all 463 resources + teams + events into Supabase
2. **Resource Library page** — /knowledge — searchable filterable grid
3. **AI Double-Check Assistant** — /tools/double-check — Claude API safety checklist
4. **Cloudflare Worker** — Claude API proxy
5. **Knowledge Chat** — /tools/chat — RAG chatbot
6. **Brazilian Team Finder** — /community/teams — Leaflet map
7. **Event Calendar** — /community/events
8. **n8n pipeline** — RAG embedding pipeline
9. **i18n** — PT/EN/ES via i18next
10. **Equipment Selector, Knot Guide, Global Spot Map, Rigger Study App, Setup Planner**
11. **Custom domain** (not yet purchased)
12. **vercel.json with noindex**

---

## Key files in Claude project knowledge

| File | Description |
|------|-------------|
| main.tex | LaTeX source of the Guia do Praticante de Highline |
| Guia_do_Praticante_de_Highline_1.pdf | PDF of the guide |
| Glossario_termos_em_ingles_highline.pdf | PT/EN terminology glossary |
| knowledge_base_full.json | 463 resources (v2.2) |
| PROJECT_STATE.md | This file |
| PhysicsCalculator.tsx | Physics calculator component |
| Index.tsx | Homepage component |
| App.tsx | Routes |
| index.css | Global styles |
| main.tsx | Entry point |

---

## Brand tokens

--ink: #0d0f0e / --paper: #f4f1eb / --paper2: #edeae2
--accent: #c8531a / --green: #2d6a4f / --muted: #7a7268
--serif: Fraunces / --mono: DM Mono / --sans: DM Sans

---

## Contact

- Project owner: Cayan Dantas
- Email: cayandantas@proton.me
- Role: ISA-certified Rigger, mechanical engineering MSc student, Brazil

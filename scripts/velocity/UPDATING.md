# Refreshing the field-velocity dashboard (agent runbook)

The `/impact` page (impact dashboard) reads **field velocity** through six
instruments per focus area, plus inflection points. This is the master runbook
for keeping all of it current: what each piece is, where it lives, how to refresh
it, and what needs a human. Hand this file to an agent ("follow
`scripts/velocity/UPDATING.md` and refresh what's stale").

## Ground rules (do not break these)

- **Real data only.** Never invent, interpolate, or backfill a value, date, or
  series. If the data does not exist, ship an honest `unwired` record (a named
  `candidateMetric` + a real `blocker`) or `not_applicable` (a `reason`). This is
  enforced at build time by `assertInstrumentRecords()`.
- **Prose matches code.** The "Our methodology" section is a public description
  of how the instruments actually work. Any change to how a reading is computed,
  sourced, dated, or displayed requires the matching prose change in the same PR
  (`VELOCITY_INSTRUMENTS[].description`, `INFLECTION_EXPLAINER`, and the
  methodology copy in the page + `MeasuringQuestionsV2.tsx`). If you change the
  number of instruments, fix every "five/six instruments" mention.
- **Data lands in its own PR.** Generated CSVs (OpenAlex, PWC) go in a separate
  PR from code, so the data diff is reviewable on its own.
- **Never commit a credential** (OpenAlex key, GitHub token) to a file, log,
  commit, or PR. All are read from the environment.
- **Verify every change:** `npx tsc --noEmit`, `npm test` (node --test), and
  `npm run build` (runs the assertion). Then eyeball `/impact-preview-eb61fba1b98e/`.

## Staleness cadence

`STALE_AFTER_MONTHS = 12` (`src/lib/velocity-instruments.ts`). Any reading whose
`measuredAt` is older than that renders a "stale" marker and its trend arrow is
withheld. **So every live reading below should be refreshed at least once a year.**
Idea vintage is the one exemption (its data is structurally ~2 years lagged).

---

## 1. Idea vintage + revealed commitments (OpenAlex CSVs)

- **Files:** `src/data/velocity/{slug}.csv` (four). **Ingestion:** `src/lib/velocity-openalex.ts`.
- **Refresh:** re-run the generator per focus area. **Full step-by-step (frozen
  queries + checks) is in [`REGENERATE.md`](./REGENERATE.md).** Needs
  `OPENALEX_EMAIL` (+ optional `OPENALEX_API_KEY`) in the env. Land the four CSVs
  in their own data PR.
- **Cadence:** yearly (the reliable window advances one year at a time).

## 2. Latency compression — curated corpora (DHR, Neurotech)

- **Files:** `src/data/velocity/corpora/dhr-latency-crypto.json` (crypto
  standard → first OpenSSL release) and `neuro-latency-modalities.json` (BCI
  modality preclinical → first-in-human). **Ingestion:** `src/lib/velocity-latency.ts`.
- **Refresh / extend:** edit the JSON by hand. Every entry needs a source URL for
  **both** dates. Each corpus's `meta` carries its own date keys (`fromKey`/`toKey`)
  and reading copy, so the loader is generic. Add entries to densify; do not
  scrape at build time. Bump `meta.generated`.
- **Cadence:** when a notable new primitive ships (DHR) or a new BCI modality
  reaches first-in-human (Neuro).

## 3. Latency compression — AI & Robotics (Papers With Code)

- **Generator:** `scripts/velocity/latency_pwc.py` → `src/data/velocity/latency/ai-robotics.csv`.
- **Refresh:** obtain the archived CC-BY-SA Papers With Code `links-between-papers-and-code`
  file, then run with `--links <file>` and `GITHUB_TOKEN` in the env (see the
  script header + `src/data/velocity/latency/README.md`). Until run, the AI
  latency record stays `unwired` — that is correct.

## 4. Static readings (hand-maintained in `velocity-instruments.ts`)

These are sourced readings typed directly into `INSTRUMENT_RECORDS`. Refresh by
editing the record and **bumping `measuredAt`** (and adding series points):

- **AI & Robotics · performance curves** — METR time-horizon doubling. TODO:
  transcribe the METR points as a `series` so the arrow can render.
- **Neurotech · performance curves** — simultaneously-recorded neurons (Stevenson
  dataset). TODO: add post-2014 frontier points if sourceable.
- **DHR · revealed commitments** — Electric Capital developer count. Refresh from
  the next annual report; update `value`, `trend`, `measuredAt`.

## 5. Markets (`src/lib/market-signals.ts`)

- **Live at build** (Polymarket / Kalshi / Metaculus). Nothing to regenerate.
- **To add/adjust a market:** edit `MARKET_MAPPINGS` (key must equal the inflection
  point's `title`). Every rendered market must resolve to a question, a venue, a
  **resolution date**, and a URL (`isRenderableMarket`); the fetchers pull the
  probability, volume, and resolution date. `METACULUS_API_TOKEN` (env) enables
  live Metaculus numbers.

## 6. Live outputs (Simocracy / GainForest / Glow)

- Fetched at build in `src/app/impact-*/page.tsx` via `@/lib/{simocracy,gainforest,glow}`.
  Live; nothing to refresh. They degrade gracefully if the endpoints are down.

## 7. Inflection points + interventions (`src/lib/inflection-points.ts`)

- **Interventions ("Our hand"):** each point lists tagged example interventions.
  When PL runs a new convening / grant / roadmap, add it as an intervention with
  an `href` (e.g. PL Neuro events from https://www.plneuro.xyz/events/), or as
  `liveEvidence`. Keep a Legibility entry linking that focus area's insights.
- **Resolving a marker:** set `outcome` (`reached`/`missed`/`retired`), `mattered`
  (+ required `matteredEvidence`), `predictedBy`/`falsifiesIf`, and `asOf`. Until
  then it reads "pending". The label is derived in `inflectionLabel()`.

## 8. Patents — technology cycle time (`technology_cycle_time`)

- Sixth instrument. `unwired` for AI & Robotics and Neurotech (needs a USPTO
  PatentsView ingestion + a frozen CPC/keyword cohort), `not_applicable` for DHR
  and Economies & Governance (open-source / public-goods native). To wire: build
  a PatentsView generator that emits median prior-art age per year, read with the
  same changepoint logic as idea vintage (`scripts/velocity/vintage-direction.mjs`),
  carrying the ~18-month publication-lag caveat.

## 9. Direction math (`scripts/velocity/vintage-direction.mjs`)

- The changepoint direction used by idea vintage (and, when built, patents). Covered
  by `vintage-direction.test.mjs`; run `npm test`. If you touch the math, add a case.

---

## Quick "what's live vs pending" check

```bash
# idea-vintage direction per field, from the current CSVs:
node -e "import('./scripts/velocity/vintage-direction.mjs').then(async m=>{const fs=await import('fs');for(const a of['digital-human-rights','economies-governance','ai-robotics','neurotech']){const L=fs.readFileSync('src/data/velocity/'+a+'.csv','utf8').split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));const h=L.shift().split(',');const iy=h.indexOf('year'),im=h.indexOf('idea_vintage_median_years'),ir=h.indexOf('reliable');const p=[];for(const l of L){const c=l.split(',');if(c[im]==='')continue;if((c[ir]||'').trim()==='1')p.push({x:+c[iy],y:+c[im]})}console.log(a,m.ideaVintageDirection(p))}})"
```

Where things render: the field-velocity box + its modal show the six instruments
per focus area; the inflection cards show markers + interventions; the
methodology section explains all of it. Keep the two in sync.

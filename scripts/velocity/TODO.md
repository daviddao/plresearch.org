# Field-velocity dashboard — remaining work (punch list)

What's **not yet done** on the `/impact` field-velocity dashboard, so it can be
picked up later. For *how* to refresh anything already wired, see
[`UPDATING.md`](./UPDATING.md). Ground rule stays: **real data only** — an honest
`unwired` / `not_applicable` beats a fabricated number.

Legend: 🔑 needs a credential · 🧠 needs a decision/fact from Lukas · 🛠️ code I can do

---

## Needs a credential (blocked on access)

- [ ] **Patent vintage → live (AI & Robotics + Neurotech).** 🔑🛠️
  - Get a free **PatentsView API key** (`search.patentsview.org`), set `PATENTSVIEW_API_KEY`.
  - Confirm/adjust the frozen **CPC cohorts** (drafts):
    - AI & Robotics: `G06N`, `G06N3/*`, `G06N20/*`, `G06V`, `B25J`, `G05D1` + kw *neural network, machine learning, reinforcement learning, robot*.
    - Neurotech: `A61N1/36`, `A61B5/24`, `A61B5/369–388`, `G06F3/015`, `A61F2/72` + kw *brain-computer interface, neural implant, electrode array, neurostimulation*.
  - Build `scripts/velocity/patents_patentsview.py` (median prior-art age/yr, cluster-bootstrap CI, neuro assignee-country split), populate the `patentVintage` reading in `patentVintageFor()`. Land CSV as its own data PR.
- [ ] **AI & Robotics latency → live.** 🔑 Generator (`latency_pwc.py`) is built; needs the archived Papers-With-Code links file on disk + `GITHUB_TOKEN`, then run + commit CSV (separate PR).
- [ ] **Markets (Neuro + DHR) show live numbers.** 🔑 Set `METACULUS_API_TOKEN` in env — no code needed; the questions are already mapped.

## Needs a decision / fact from Lukas

- [ ] **Sanity-check the two curated corpora.** 🧠 `corpora/dhr-latency-crypto.json` (11 crypto standard→OpenSSL dates) and `corpora/neuro-latency-modalities.json` (4 BCI modality dates). Flag anything wrong.
- [ ] **Confirm the DHR/E&G patent `not_applicable` framing** (open-source native → patents measure enclosure, not velocity). Currently marked `TODO(lukas)` in `patentVintageFor()`.
- [ ] **Neuron performance curve** — add post-2014 Stevenson frontier points, or bless it ending at 2014.
- [ ] **Extend the neuro latency corpus** — add ECoG and a clean Paradromics preclinical date if sourceable.
- [ ] **Phase 1.2 — per-card intervention evidence.** 🧠 "Our hand" cards still fall back to generic descriptions; give each `(marker × intervention)` a specific grant/convening/year. (Neuro already links real PL Neuro events as a template.)

## Code I can do (no blocker)

- [ ] **First-time authors (talent entry), all fields.** 🛠️ Implement `first_time_authors` in `field_velocity_openalex.py` (full author set per year, mark first field-matching appearance) → lights up the OpenAlex talent-entry chart the merge already expects.
- [ ] **Cross-field: unique monthly contributors** to a committed set of core repos (deduped, normalized vs total GitHub activity — not stars). Repo set must be a reviewable file with a rationale per entry.
- [ ] **E&G revealed commitments** — aggregate on-chain allocation (RetroPGF rounds, hypercerts, GainForest) into one series; the obstacle is aggregation, not availability.
- [ ] **Neuro implant count → refreshing series** — add a ClinicalTrials.gov pull so the (now static, peer-reviewed) 67-participant reading refreshes monthly.
- [ ] **METR performance curve arrow** — transcribe the METR time-horizon points as a `series` so the chip can render.

## Deliberately staying `unwired` / `not_applicable` (correct as-is)

- E&G latency (no dated pilot-stage transitions in the team directory).
- 2.5 neuro connectome-cost (cost-per-mm³ series is not published).
- DHR / AI performance curves (no clean gating-unit series).
- Patent vintage for DHR + E&G (open-source native).

---

## Done (for reference)

Phase 0 correctness (cluster bootstrap, changepoint direction, staleness,
markets require question+venue+date+URL, copy). CSVs regenerated. Idea vintage
(all 4 FAs). Latency compression: DHR (crypto→OpenSSL) + Neuro (preclinical→human).
Neuro revealed commitments (peer-reviewed implant count vs 10k-by-2030). Patents
folded into idea vintage as the patent-vintage twin. Neuro inflection points link
real PL Neuro convenings as intervention evidence. Runbook (`UPDATING.md`).

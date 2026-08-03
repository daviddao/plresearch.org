// ── Impact Dashboard — the field-velocity data model ──────────────────────────
//
// The page has one job: name the interventions we run, then show whether the
// fields we back are speeding up as a result. It imports focus-area metadata,
// inflection points, and the two-axis colors from `@/lib/inflection-points` as
// the single source of truth.
//
// The model, in one line:
//   Our hand         = a fixed toolkit of interventions we push on, per field.
//   Field velocity   = the rate the field is moving: talent entering, capital
//                      forming, tool costs falling, output shipping. Inflection
//                      points are one of the markers we read.
//
// Draft copy and a draft reading: directions and evidence below are curated,
// not final. Where we do not yet have a number, the signal renders in an honest
// "curating" state rather than an invented value.

import {
  INFLECTION_POINTS,
  FOCUS_AREAS,
  FIELD_COLOR,
  FIELD_INK,
  FIELD_TRACK,
  HAND_COLOR,
  LIVE_COLOR,
  type FocusAreaKey,
  type InflectionPoint,
} from '@/lib/inflection-points'

// Re-export the shared color + two-axis primitives so components import from one
// place and the theme-aware dark-mode handling is reused verbatim.
export { FIELD_COLOR, FIELD_INK, FIELD_TRACK, HAND_COLOR, LIVE_COLOR }
export { FOCUS_AREAS, INFLECTION_POINTS }
export type { FocusAreaKey, InflectionPoint }

// ── Field velocity — the basket ───────────────────────────────────────────────
// A field is moving faster when the things that make fields go faster are
// themselves speeding up. We track four of them per focus area; the live signal
// (crowd forecasts) renders alongside from market-signals.ts.

export type VelocityKind = 'talent' | 'capital' | 'tools' | 'cadence'
export type VelocityDirection = 'accelerating' | 'flat' | 'decelerating' | 'unknown'

export type VelocitySignal = {
  id: string
  label: string
  kind: VelocityKind
  direction: VelocityDirection
  evidence: string
  source?: string
  asOf: string
}

export const VELOCITY_KIND_META: Record<VelocityKind, { label: string; blurb: string }> = {
  talent: { label: 'Talent inflow', blurb: 'New teams and researchers entering the field.' },
  capital: { label: 'External capital', blurb: 'Non-PL money forming around the field.' },
  tools: { label: 'Tool-cost trend', blurb: "The field's rate-limiting instrument, and whether it is getting cheaper." },
  cadence: { label: 'Output cadence', blurb: 'Demos, deployments, and the preprint-to-product lag.' },
}

export const DIRECTION_META: Record<
  VelocityDirection,
  { label: string; glyph: string; tone: 'up' | 'flat' | 'down' | 'unknown' }
> = {
  accelerating: { label: 'Accelerating', glyph: '↗', tone: 'up' },
  flat: { label: 'Flat', glyph: '→', tone: 'flat' },
  decelerating: { label: 'Decelerating', glyph: '↘', tone: 'down' },
  unknown: { label: 'Curating', glyph: '•', tone: 'unknown' },
}

// asOf date for the curated seed. Bump when a signal is re-read.
const ASOF = '2026-07'

export const FIELD_VELOCITY: Record<FocusAreaKey, VelocitySignal[]> = {
  'digital-human-rights': [
    {
      id: 'dhr-talent',
      label: 'Teams entering resilient comms, identity & provenance',
      kind: 'talent',
      direction: 'unknown',
      evidence:
        'PL-backed teams are active across resilient comms, identity, and provenance (Fluence, Huddle01, SpruceID, Privy, EQTY Lab). We have not yet counted net new non-PL entrants per year.',
      asOf: ASOF,
    },
    {
      id: 'dhr-capital',
      label: 'External capital into decentralized identity & provenance',
      kind: 'capital',
      direction: 'unknown',
      evidence:
        'Identity and personhood raised at scale (World, Privy), but non-PL capital formation for this field is not yet isolated.',
      asOf: ASOF,
    },
    {
      id: 'dhr-tools',
      label: 'Cost of running open, permissionless comms & storage',
      kind: 'tools',
      direction: 'unknown',
      evidence:
        'IPFS, Filecoin, and libp2p lower the cost of content-addressed distribution. We have not yet chosen a single tracked cost per unit for the rate-limiting instrument here.',
      asOf: ASOF,
    },
    {
      id: 'dhr-cadence',
      label: 'Real-world provenance & censorship-resistant deployments',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'Content-authenticity displays now ship in newsrooms (Reuters, AP) backed by content-addressed archives, and Wikipedia stayed reachable over IPFS through a state block. Shipped deployments are rising, though the per-quarter count is not yet pinned.',
      source: 'https://dispatch.starlinglab.org/p/verify-authenticity-displays',
      asOf: ASOF,
    },
  ],
  'economies-governance': [
    {
      id: 'eg-talent',
      label: 'Teams entering programmable capital & DPI',
      kind: 'talent',
      direction: 'unknown',
      evidence:
        'A visible lineage exists (Hypercerts, Funding the Commons, GainForest, Glow, WeatherXM, Molecule), but net new entrants per year are not yet tracked.',
      asOf: ASOF,
    },
    {
      id: 'eg-capital',
      label: 'External capital into public-goods funding & ReFi',
      kind: 'capital',
      direction: 'unknown',
      evidence:
        'The category is not yet a durable capital market, which is the bet itself. Non-PL inflows are not yet isolated.',
      asOf: ASOF,
    },
    {
      id: 'eg-tools',
      label: 'Cost of deploying programmable allocation rails',
      kind: 'tools',
      direction: 'unknown',
      evidence:
        'Open allocation primitives lower the cost of running a mechanism, but no single tracked cost per deployment exists yet.',
      asOf: ASOF,
    },
    {
      id: 'eg-cadence',
      label: 'Live mechanism & verification activity',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'PL-backed mechanisms report live output: Simocracy participation, GainForest species observations, Glow active solar farms, surfaced on the FA2 live dashboard. Cadence is rising, though not yet a single trend line.',
      source: '/areas/economies-governance/impact/live-dashboard/',
      asOf: ASOF,
    },
  ],
  neurotech: [
    {
      id: 'nt-talent',
      label: 'NeuroAI & comp-neuro talent flow',
      kind: 'talent',
      direction: 'accelerating',
      evidence:
        'NeuroAI is pulling ML talent toward neuroscience, and BCI programs are expanding. The magnitude is not yet counted.',
      asOf: ASOF,
    },
    {
      id: 'nt-capital',
      label: 'External capital into BCI & neurotech',
      kind: 'capital',
      direction: 'accelerating',
      evidence:
        'Large private rounds and new entrants across invasive and non-invasive BCI point to a warming market. The annual non-PL figure is not yet isolated.',
      asOf: ASOF,
    },
    {
      id: 'nt-tools',
      label: 'Neural recording cost — $ per channel',
      kind: 'tools',
      direction: 'accelerating',
      evidence:
        "Simultaneously recorded neurons double roughly every 7 years (Stevenson & Kording, the field's Moore's law), and cost per recording channel has trended down with it. A falling curve is acceleration; the current figure is tracked in PL Neuro plans.",
      asOf: ASOF,
    },
    {
      id: 'nt-cadence',
      label: 'Implants, connectome throughput & demos',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'Human implant counts, connectome data volume, and NeuroAI demos are all rising year over year. Exact throughput toward the 2030 milestones is tracked in PL Neuro plans.',
      asOf: ASOF,
    },
  ],
  'ai-robotics': [
    // FA3 is deliberately forthcoming — its bets are still being defined, so its
    // velocity basket is honestly empty rather than fabricated.
    {
      id: 'air-forthcoming',
      label: 'Velocity basket forthcoming',
      kind: 'talent',
      direction: 'unknown',
      evidence:
        'AI & Robotics is still finalizing its bets. Its velocity signals will be seeded once they are set.',
      asOf: ASOF,
    },
  ],
}

// ── Our hand — interventions we push on, per field ────────────────────────────
// tool → what we did → observed movement (the movement we saw in the field,
// not a list of tasks).

export type ToolId =
  | 'legibility'
  | 'connection'
  | 'funding'
  | 'policy'
  | 'infrastructure'
  | 'translation'
  | 'culture'

export type ContributionV2 = {
  tool: ToolId
  whatWeDid: string
  observedMovement: string
  evidence?: string
}

export const CONTRIBUTIONS_V2: Record<FocusAreaKey, ContributionV2[]> = {
  'digital-human-rights': [
    {
      tool: 'infrastructure',
      whatWeDid:
        'Built and maintained the open libp2p / IPFS / Filecoin substrate that resilient-comms and provenance teams build on.',
      observedMovement:
        'Content-addressed distribution is now cheap enough that newsrooms and archives adopt it, and it carries a record of who published what and when.',
      evidence: 'https://dispatch.starlinglab.org/p/verify-authenticity-displays',
    },
    {
      tool: 'funding',
      whatWeDid:
        'Seeded and funded comms, messaging, identity and provenance teams (Fluence, Huddle01, SpruceID, Privy, EQTY Lab).',
      observedMovement:
        'Pre-commercial teams reached shipping products. Whether this closed the field-level capital gap is not yet measured.',
    },
    {
      tool: 'connection',
      whatWeDid:
        'Convened identity-protocol teams with builders working on portable credentials.',
      observedMovement:
        'Collaboration formed around shared credential formats. The concrete collaborations are still being named.',
    },
  ],
  'economies-governance': [
    {
      tool: 'infrastructure',
      whatWeDid:
        'Originated Hypercerts, a content-addressed primitive that timestamps who produced which public-goods outcome.',
      observedMovement:
        'Allocation experiments can now cite verifiable outcome records where none existed before.',
    },
    {
      tool: 'translation',
      whatWeDid:
        'Routed validated allocation and MRV work toward pilots and ventures (Funding the Commons lineage, Molecule).',
      observedMovement:
        'Deployment paths opened for several teams. Pilots converted to production are still being tracked.',
    },
    {
      tool: 'legibility',
      whatWeDid:
        'Built evidence, benchmarks and standards for outcome verification (GainForest, Glow, WeatherXM).',
      observedMovement:
        'A shared vocabulary for verified-outcome funding is forming. Whether working allocators have adopted it is not yet measured.',
      evidence: '/areas/economies-governance/impact/live-dashboard/',
    },
  ],
  neurotech: [
    {
      tool: 'legibility',
      whatWeDid:
        'Defined benchmarks and milestones for NeuroAI, connectomics throughput, and a whole-brain-emulation reference demo.',
      observedMovement:
        'The field now has a shared scoreboard for efficiency and emulation targets. Adoption by outside labs is not yet measured.',
    },
    {
      tool: 'connection',
      whatWeDid:
        'Bridged AI-lab and comp-neuro talent through the PL Neuro network.',
      observedMovement:
        'Talent is flowing toward NeuroAI. Our attributable share is not yet measured.',
    },
    {
      tool: 'policy',
      whatWeDid:
        'Engaged regulators, device makers and developers toward a standardized BCI software and API layer.',
      observedMovement:
        'The standardized layer has not cleared yet, so adoption paths for third-party BCI apps stay closed for now.',
    },
  ],
  'ai-robotics': [],
}

// ── The toolkit ───────────────────────────────────────────────────────────────
// Seven interventions we run to move a field. The short entry (title, subtitle,
// oneLiner) renders in the methodology grid; the full description renders in the
// modal.

export type ToolkitEntry = {
  id: ToolId
  title: string
  subtitle: string
  proposed?: boolean
  /** One-line description for the scannable methodology grid. */
  oneLiner: string
  /** Fuller, published-style description shown in the modal. */
  description: string
}

export const TOOLKIT_V2: ToolkitEntry[] = [
  {
    id: 'legibility',
    title: 'Legibility',
    subtitle: 'field-building communications',
    oneLiner:
      'Maps, roadmaps, benchmarks, and builder-grade tutorials that make a field navigable for researchers and working builders.',
    description:
      'Many early fields are blocked by illegibility, to both internal and external audiences. The progress is real, but the map is missing. Researchers cannot easily find adjacent teams. Founders cannot tell which problems are ready for company formation. Funders cannot distinguish noise from signal. Policymakers cannot see which interventions would help rather than slow progress. Written artifacts like a field map, taxonomy, roadmap, whitepaper, benchmark, policy brief, or public research agenda can turn a loose collection of teams, researchers, and funders into a field with sustained momentum. Legibility also has a second audience: working builders. A field is fully legible only when a competent outsider can build in it, so tutorials, reference builds, teardowns, and partnerships with hands-on educators count as field-building communications alongside the papers.',
  },
  {
    id: 'connection',
    title: 'Connection',
    subtitle: 'convenings & sustained cohorts',
    oneLiner:
      'Rooms that keep the right people in contact over time: retreats, residencies, advisory networks, apprenticeship-style pairings.',
    description:
      'Some bottlenecks are social instead of technical. The right talent may already exist to unlock a breakthrough, but the field has not yet connected them. PL R&D runs and supports convenings, retreats, workshops, residencies, hackathons, and advisory networks that bring high-context people together around specific bottlenecks. Two design rules do most of the work. Mix kinds, not just seniority: the productive rooms pair researchers with builders and operators, because that pairing is where research turns into working systems. And sustain the contact: innovation spreads person to person, so recurring cohorts, alumni networks, and apprenticeship-style pairings matter more than one-off events. The goal is not to host events, but to forge new collaborations, companies, grants, pilots, and enable shared roadmaps to emerge.',
  },
  {
    id: 'funding',
    title: 'Funding',
    subtitle: 'grants, prizes & fellowships',
    oneLiner:
      'Early money where small amounts unlock disproportionate downstream effort; prizes that define what "first" means for a field; fellowships and residencies that give outsiders hands-on entry.',
    description:
      'Many important ideas are too early for venture capital and too applied for traditional academic funding. Some need small grants to test whether a primitive works. Others need prizes, RFPs, fellowships, or retroactive funding to pull effort into an underbuilt area. A well-designed prize does more than pay out: it defines what counts as "first" in a field and sets the ambition bar for everyone watching. Where breakthrough variance is the goal, we prefer funding people over projects, with longer horizons and tolerance for early failure. Some of the highest-return grants buy entry rather than output: fellowships, residencies with equipment access, and support for the educators who give newcomers their first hands-on contact with a field. PL R&D deploys and helps coordinate early funding where a field-level bottleneck is clear and where small early funding can unlock much larger downstream effort.',
  },
  {
    id: 'policy',
    title: 'Policy',
    subtitle: 'standards & experimentation rights',
    oneLiner:
      'Clearing adoption paths for working technology, and legal room for garage-scale experimentation.',
    description:
      'Frontier technologies often reach a point where the rules do not yet recognize what is possible. That can block adoption even when the technology works. In those cases, progress may require standards bodies, regulatory sandboxes, procurement pathways, model frameworks, or partnerships with public institutions. Adoption is half the job. Fields also need legal room to experiment at small scale: sandbox access for individuals and not only companies, hardware that may be repaired and modified, and workable pathways for citizen science in regulated domains. Many of the people a field will depend on in 10 years are amateurs today, and rules written only for incumbents quietly price them out. PL R&D engages in research, thought leadership, and participation in policy and standards-setting discussions with the goal of creating better rules, which, in turn, help responsible technologies reach users faster.',
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    subtitle: 'primitives, rails & cheap tools',
    oneLiner:
      'Open protocols, shared facilities, and reference designs that collapse the cost of trying things; content-addressed registries that timestamp who built what, when.',
    description:
      'Sometimes the missing piece is open protocols, public-good infrastructure, or neutral rails that no single company has sufficient incentive to build alone. When a missing primitive or shared infrastructure layer is blocking a field, PL R&D may help build it directly, support the teams building it, or coordinate an ecosystem capable of maintaining it over time. Two kinds of rails get special attention. Tool-cost infrastructure: open reference designs, shared facilities, and instrument cost-down programs that collapse the price of trying things, especially in hardware fields where a single experiment can cost a career. And attribution infrastructure: content-addressed, timestamped records of who built what, and when, so that priority and credit work for protocols, designs, datasets, and negative results the way they already work for papers.',
  },
  {
    id: 'translation',
    title: 'Translation',
    subtitle: 'venture conversion & visibility',
    oneLiner:
      'Routing validated work to pilots, production, and capital, including surfacing independent inventors the world cannot yet see.',
    description:
      'Some work reaches the point where the bottleneck is no longer research but translation into pilot, production, and scale. PL R&D connects projects within the broader Protocol Labs network, including venture, capital, platform, and ecosystem support, to help promising work find the right deployment path, talent, and resources to succeed. Translation also has a scouting side: much of the most promising invention happens outside institutions and stays invisible until someone surfaces it. Part of this tool is finding independent builders before the market can see them and lending them the network\u2019s visibility, alongside converting the projects we already know.',
  },
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'celebrating the improving mentality',
    proposed: true,
    oneLiner:
      '(Proposed — our wildcard.) Deliberately open-ended creative bets: a film, a book, a photography prize that rewards human ingenuity, worldbuilding competitions. Whatever recruits people into the conviction that things can be improved, and that they can be the ones to improve them.',
    description:
      'Every sustained acceleration of invention has run on a culture that treats improvement as a personal calling, spread from person to person. That culture is the hardest condition to engineer, so we treat this tool as our wildcard: deliberately open-ended creative bets that recruit people into building. That might mean backing a film or a book, a photography prize that rewards human ingenuity, or a worldbuilding competition that makes a field\u2019s future concrete enough to want. Ask inventors where they started and they often name an artifact: a book, a film, a kit. Most of these bets will miss. The hits compound for decades, and we will track them on the same scoreboard as everything else we fund.',
  },
]

// ── How we measure field velocity ─────────────────────────────────────────────
// The explainer under the toolkit: the interventions are the input, field
// velocity is what we watch, and these are the instruments we read it with.

export type VelocityMeasure = {
  id: string
  title: string
  body: string
}

export const VELOCITY_MEASURES: VelocityMeasure[] = [
  {
    id: 'performance-curves',
    title: 'Performance curves',
    body:
      '$/genome, $/watt of solar, $/kWh of battery, transistors per chip. These are true derivatives with units, and the learning-curve literature (Wright\u2019s law; Farmer and Lafond on curve predictability) shows they are the most forecastable structures in technology history. The first job per field is finding its "$/genome": the unit whose cost gates everything downstream. Neurotech already has one, since simultaneously recorded neurons have a documented doubling time of about 7 years (Stevenson and Kording, the "Moore\u2019s law of BCI"), alongside $/channel and $/mm\u00b3 of connectome. AI agents have METR\u2019s task-horizon metric (the length of task a model can complete, doubling roughly every 7 months). Digital Human Rights has $/TB verifiably stored. Economies and Governance is the hard one: perhaps cost per verified attestation, or per binding decision.',
  },
  {
    id: 'latency-compression',
    title: 'Latency compression',
    body:
      'Juan\u2019s "accelerate the pipeline" framing read literally: measure the lags between stages and watch them shrink. Preprint-to-replication, paper-to-patent citation lag (Marx and Fuegi built this), arXiv-to-open-source-implementation (in ML this collapsed from years to days, and that collapse was the acceleration, measurably), demo-to-production. This is the purest pipeline-velocity measure because it tracks the pipe, not the volume flowing through it.',
  },
  {
    id: 'idea-vintage',
    title: 'Idea vintage',
    body:
      'Packalen and Bhattacharya\u2019s method: measure the age of the concepts new work builds on. Fast-moving fields cite young ideas; stagnant fields recombine old ones. LLM extraction makes it cheap to compute now, and it runs on text we already have.',
  },
  {
    id: 'revealed-commitments',
    title: 'Revealed commitments',
    body:
      'Talent entry rate (top students switching in is the leading indicator with the best track record; watch physicists moving into ML from 2015 to 2020), external capital formation, and job postings that mention the technology (Bloom and Hassan\u2019s text-mining approach). Money and career bets are commitments; attention metrics are noise.',
  },
  {
    id: 'markets',
    title: 'Markets',
    body:
      'The sophisticated use is not a single probability, it is the term structure: ask the same milestone at three horizons, back out the implied median arrival date, and track how that date moves. Pulling in means expected acceleration, like a yield curve for a field. Metaculus date-range questions do this natively. Three honest caveats: thin liquidity, resolution ambiguity, and the one that bites PL specifically, reflexivity. If our job is making a field legible and exciting, market moves partly measure our own marketing. That contamination is why markets cannot be the primary instrument for an org whose main channel is attention.',
  },
]

// ── One-line reading contract for the "How to read this" affordance ────────────
export const HOW_TO_READ_V2 =
  'On the left is our hand: the interventions we are pushing on in this field. On the right is field velocity, the rate the field is moving, read from talent, capital, tool costs, output cadence, and the live crowd forecasts. Our hand is the input; field velocity is the result we watch.'

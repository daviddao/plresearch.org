// ── Impact Dashboard v2 — the acceleration-centered data model ────────────────
//
// This module is v2-only. It imports inflection points from
// `@/lib/inflection-points` as the single source of truth (titles, areas,
// opportunity spaces) and layers the v2 reframe on top WITHOUT editing any v1
// file. Nothing here changes v1 behaviour; /impact keeps rendering from the v1
// modules exactly as in PR #29.
//
// The reframe, in one line:
//   Y (the target)  = field acceleration itself — is the field moving faster?
//                      measured by a per-focus-area basket of velocity signals.
//   Inflection pts   = pre-registered SENSORS — dated, falsifiable markers we
//                      expect acceleration to produce. They grade our MODEL of
//                      the field, not the field and not us. Misses are kept.
//   X (our hand)     = pushing on named conditions/bottlenecks via the toolkit,
//                      with observable condition-movement (not a list of tasks).
//
// This is DRAFT-FOR-REVIEW copy and a DRAFT ledger — statuses, dates, and
// velocity readings below are proposed, not ratified. Real numbers we do not
// yet have are left as explicit `// TODO(lukas)` placeholders and render as an
// honest "curating" state — we never invent values.

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

// Re-export the shared color + two-axis primitives so v2 components import from
// one place and the theme-aware dark-mode handling is reused verbatim.
export { FIELD_COLOR, FIELD_INK, FIELD_TRACK, HAND_COLOR, LIVE_COLOR }
export { FOCUS_AREAS, INFLECTION_POINTS }
export type { FocusAreaKey, InflectionPoint }

// ── Y — the field-velocity basket ────────────────────────────────────────────
// A field is "accelerating" when the things that make fields go faster are
// themselves speeding up. We track five kinds per focus area.

export type VelocityKind = 'talent' | 'capital' | 'tools' | 'cadence' | 'crowd'
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
  tools: { label: 'Tool-cost trend', blurb: "The field's rate-limiting instrument — is it getting cheaper?" },
  cadence: { label: 'Output cadence', blurb: 'Demos, deployments, and the preprint-to-product lag.' },
  crowd: { label: 'Crowd read', blurb: 'Movement in the mapped forecast markets.' },
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
        'PL-backed teams are active across the axis (Fluence, Huddle01, SpruceID, Privy, EQTY Lab), but we have not yet counted net new non-PL entrants per year. // TODO(lukas): new-team / new-researcher inflow rate.',
      asOf: ASOF,
    },
    {
      id: 'dhr-capital',
      label: 'External capital into decentralized identity & provenance',
      kind: 'capital',
      direction: 'unknown',
      evidence:
        'Identity/personhood raised at scale (World, Privy), but we have not isolated non-PL capital formation for this field. // TODO(lukas): annual external $ into the field.',
      asOf: ASOF,
    },
    {
      id: 'dhr-tools',
      label: 'Cost of running open, permissionless comms & storage',
      kind: 'tools',
      direction: 'unknown',
      evidence:
        'IPFS/Filecoin and libp2p lower the cost of content-addressed distribution, but we lack a single tracked $/unit for the rate-limiting instrument here. // TODO(lukas): pick and track the cost metric.',
      asOf: ASOF,
    },
    {
      id: 'dhr-cadence',
      label: 'Real-world provenance & censorship-resistant deployments',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'Content-authenticity displays now ship in newsrooms (Reuters, AP) backed by content-addressed archives, and Wikipedia stayed reachable over IPFS through a state block — the cadence of shipped deployments is rising even if unmeasured. // TODO(lukas): deployments-per-quarter count.',
      source: 'https://dispatch.starlinglab.org/p/verify-authenticity-displays',
      asOf: ASOF,
    },
    {
      id: 'dhr-crowd',
      label: 'Movement in the mapped identity / AI-regulation markets',
      kind: 'crowd',
      direction: 'unknown',
      evidence:
        'Reuses market-signals.ts (World Network verification; AI-regulation-into-law). The live probability renders on each sensor; the quarter-over-quarter delta is not yet stored. // TODO(lukas): persist market history to compute the delta.',
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
        'A visible lineage exists (Hypercerts, Funding the Commons, GainForest, Glow, WeatherXM, Molecule), but net new entrants per year are not yet tracked. // TODO(lukas): entrant inflow rate.',
      asOf: ASOF,
    },
    {
      id: 'eg-capital',
      label: 'External capital into public-goods funding & ReFi',
      kind: 'capital',
      direction: 'unknown',
      evidence:
        'The category is not yet a durable capital market — the inflection point itself. We have not isolated non-PL inflows. // TODO(lukas): annual external $ into programmable allocation.',
      asOf: ASOF,
    },
    {
      id: 'eg-tools',
      label: 'Cost of deploying programmable allocation rails',
      kind: 'tools',
      direction: 'unknown',
      evidence:
        'Open allocation primitives lower the cost of running a mechanism, but no single tracked $/deployment exists. // TODO(lukas): choose the rate-limiting cost metric.',
      asOf: ASOF,
    },
    {
      id: 'eg-cadence',
      label: 'Live mechanism & verification activity',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'PL-backed mechanisms report live output — Simocracy participation, GainForest species observations, Glow active solar farms — surfaced on the FA2 live dashboard. Cadence is real and rising; the trend line is not yet a single figure. // TODO(lukas): deployments-per-quarter.',
      source: '/areas/economies-governance/impact/live-dashboard/',
      asOf: ASOF,
    },
    {
      id: 'eg-crowd',
      label: 'Movement in the mapped allocation / DPI markets',
      kind: 'crowd',
      direction: 'unknown',
      evidence:
        'Reuses market-signals.ts — mostly white space here (no liquid market prices $1B/yr through programmable allocation), which is itself a Y-signal that the bet is early. // TODO(lukas): revisit as markets appear.',
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
        'NeuroAI is pulling ML talent toward neuroscience and BCI programs are expanding — the flow the "neural distillation" sensor predicts. The magnitude is not yet counted. // TODO(lukas): net talent flow into the field.',
      asOf: ASOF,
    },
    {
      id: 'nt-capital',
      label: 'External capital into BCI & neurotech',
      kind: 'capital',
      direction: 'accelerating',
      evidence:
        'Large private rounds and new entrants across invasive and non-invasive BCI signal a warming market. We have not isolated the annual non-PL figure. // TODO(lukas): external $ into the field per year.',
      asOf: ASOF,
    },
    {
      id: 'nt-tools',
      label: 'Neural recording cost — $ per channel',
      kind: 'tools',
      direction: 'accelerating',
      evidence:
        'Cost per recording channel is the field\u2019s rate-limiting instrument and has trended down for years; a falling curve is acceleration. The current figure and slope are not pinned here. // TODO(lukas): $/channel and trend.',
      asOf: ASOF,
    },
    {
      id: 'nt-cadence',
      label: 'Implants, connectome throughput & demos',
      kind: 'cadence',
      direction: 'accelerating',
      evidence:
        'Human implant counts, connectome data volume, and NeuroAI demos are all rising year over year. Exact throughput toward the 2030 milestones is tracked in PL Neuro plans, not yet here. // TODO(lukas): implants / connectome throughput.',
      asOf: ASOF,
    },
    {
      id: 'nt-crowd',
      label: 'Movement in the mapped BCI / WBE forecasts',
      kind: 'crowd',
      direction: 'unknown',
      evidence:
        'Reuses market-signals.ts — Neuralink implant-count (Kalshi), brain-emulation-first-AI and WBE-date (Metaculus). Live readings render per sensor; the delta over time is not yet stored. // TODO(lukas): persist forecast history.',
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
        'AI & Robotics is still finalizing its inflection points; its velocity basket will be seeded once the bets are set. // TODO(lukas): define the basket with the FA lead.',
      asOf: ASOF,
    },
  ],
}

// ── Inflection points as pre-registered SENSORS ───────────────────────────────
// Sensor semantics are keyed by the point's title (the single source of truth
// stays in inflection-points.ts). Being wrong is a logged learning event, not a
// failure verdict — a missed marker stays on the board with a post-mortem.

export type SensorStatus = 'pending' | 'hit' | 'missed' | 'retired'

export type SensorSemantics = {
  /** The date by which we expect the marker to resolve. */
  predictedBy: string
  /** 0..1 subjective confidence at time of pre-registration. Optional. */
  confidence?: number
  /** What observation would falsify the marker — states the yes/no crisply. */
  falsificationCondition: string
  status: SensorStatus
  /** Logged reasoning for a hit / miss / retirement. Surfaces in the modal. */
  postMortem?: string
  /** The honesty case: we were wrong about the marker, the field accelerated anyway. */
  fieldMovedAnyway?: boolean
}

export const SENSOR_STATUS_MICROCOPY: Record<SensorStatus, string> = {
  pending: 'not yet resolved',
  hit: 'resolved as predicted',
  missed: 'did not resolve as predicted',
  retired: 'superseded; rationale logged',
}
/** Distinct microcopy for a missed marker where the field accelerated anyway. */
export const MISSED_FIELD_MOVED_MICROCOPY = 'missed — the field accelerated via another path'

export const SENSOR_STATUS_META: Record<
  SensorStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Pending', color: '#6b6d79', bg: 'color-mix(in srgb, #6b6d79 12%, transparent)' },
  hit: { label: 'Hit', color: '#12bfdf', bg: 'color-mix(in srgb, #12bfdf 14%, transparent)' },
  missed: { label: 'Missed', color: '#d0894b', bg: 'color-mix(in srgb, #d0894b 14%, transparent)' },
  retired: { label: 'Retired', color: '#9ca3af', bg: 'color-mix(in srgb, #9ca3af 14%, transparent)' },
}

// DRAFT ledger. All real markers were pre-registered "as of 2026" and none have
// resolved true, so their honest baseline is `pending`. To let the team review
// the full ledger mechanic side by side, a small number of markers below are
// seeded with the other states as clearly-labelled DRAFT assessments (see the
// "Illustrative draft ledger" caption in the UI). Confidence numbers we have not
// set are left as TODO(lukas) and simply omitted rather than invented.
export const SENSOR_SEMANTICS: Record<string, SensorSemantics> = {
  'Communication that cannot be switched off': {
    predictedBy: '2030',
    // confidence: // TODO(lukas)
    falsificationCondition:
      'By 2030, no consumer-scale connectivity provider operates without state licensing/identity gating AND no metadata-resistant messenger crosses tens of millions of users.',
    status: 'pending',
  },
  'Personhood without the state in the loop': {
    predictedBy: '2028',
    falsificationCondition:
      'By 2028, no service verifies >100M unique humans for everyday use without a nation-state ID or KYC.',
    status: 'pending',
  },
  'Provenance becomes the default for truth': {
    predictedBy: '2028',
    falsificationCondition:
      'Two consecutive frontier-model generations ship WITHOUT attested provenance by default, and no major platform/archive adopts content-addressed provenance as default.',
    status: 'pending',
  },
  'Agents run on open rails': {
    predictedBy: '2030',
    falsificationCondition:
      'By 2030, no frontier-scale model is trained across independent decentralized hardware AND agent-to-agent economic activity does not meaningfully settle on open permissionless rails.',
    status: 'pending',
  },
  'Programmable government in production': {
    predictedBy: '2029',
    falsificationCondition:
      'By 2029, no sovereign moves >$1B/yr of public funds through programmable, real-time-auditable rails.',
    status: 'pending',
  },
  'A binding decision at scale': {
    predictedBy: '2028',
    falsificationCondition:
      'By 2028, no city/government makes a consequential binding decision through a computational mechanism with tens of thousands participating.',
    // Illustrative DRAFT status to exercise the "retired" mechanic for review.
    status: 'retired',
    postMortem:
      'DRAFT (illustrative): candidate for retirement — "binding decision" conflates two markers (a real government adopting a mechanism vs. turnout at scale). Proposed split into an adoption marker and a scale marker; rationale logged rather than the marker silently deleted.',
  },
  'Public goods become a financeable category': {
    predictedBy: '2029',
    falsificationCondition:
      'By 2029, <$1B/yr flows through programmable allocation and no mainstream allocator treats it as infrastructure.',
    status: 'pending',
  },
  'Capital that pays on verified outcomes': {
    predictedBy: '2029',
    falsificationCondition:
      'By 2029, no $1B+ climate/public-goods fund disburses against independently verified real-world outcomes faster and cheaper than a legacy audit.',
    status: 'pending',
  },
  'The BCI app store': {
    predictedBy: '2027',
    falsificationCondition:
      'By 2027, no regulator clears a standardized software/API layer for a commercial BCI, or no third-party app launches and is adopted.',
    // Illustrative DRAFT status to exercise the "missed + field moved anyway" mechanic.
    status: 'missed',
    fieldMovedAnyway: true,
    postMortem:
      'DRAFT (illustrative): the standardized third-party app layer did not clear on our timeline — so the marker, as written, is a miss. But the field accelerated via another path: first-party BCI capability and implant counts advanced faster than expected. The marker stays on the board; the lesson is that ecosystem-opening may trail single-vendor scaling, so we are re-dating rather than deleting.',
  },
  'Neural distillation': {
    predictedBy: '2030',
    falsificationCondition:
      'By 2030, no major lab matches frontier reasoning by training on human neural data at a fraction of the parameters/energy, and no venture surge into consumer EEG for cognitive data occurs.',
    status: 'pending',
  },
  'The neuromorphic energy pivot': {
    predictedBy: '2031',
    falsificationCondition:
      'By 2031, no brain-inspired model matches SOTA at 3+ orders of magnitude better energy efficiency.',
    status: 'pending',
  },
  'Memory retrieval in simulation': {
    predictedBy: '2032',
    falsificationCondition:
      'By 2032, no reconstructed mouse connectome simulated in silico reproduces a specific learned behavior of the biological mouse.',
    status: 'pending',
  },
}

/** Convenience: sensor semantics for one point, defaulting to a pending stub. */
export function sensorFor(point: InflectionPoint): SensorSemantics {
  return (
    SENSOR_SEMANTICS[point.title] ?? {
      predictedBy: 'TODO(lukas)',
      falsificationCondition: point.signal,
      status: 'pending',
    }
  )
}

// ── X — our hand: conditions we push on via the toolkit ───────────────────────
// Restructured from v1's inputs/activities/outputs into tool → targeted
// condition → what we did → observed movement (the X-side outcome, distinct
// from the Y-side field acceleration).

export type ToolId =
  | 'legibility'
  | 'connection'
  | 'funding'
  | 'policy'
  | 'infrastructure'
  | 'translation'
  | 'culture'

/** The conditions checklist (1–7) plus the legacy bottleneck types. */
export type TargetedCondition =
  | 'evangelizing-culture' // 1
  | 'savant-fabricant-bridges' // 2
  | 'knowledge-diffusion' // 3
  | 'cheap-tools' // 4
  | 'priority-attribution' // 5
  | 'amateur-experimentation' // 6
  | 'hands-on-formation' // 7
  | 'coordination'
  | 'capital'
  | 'legibility'

export const CONDITION_LABEL: Record<TargetedCondition, string> = {
  'evangelizing-culture': 'Evangelizing improving culture (1)',
  'savant-fabricant-bridges': 'Savant–fabricant bridges (2)',
  'knowledge-diffusion': 'Knowledge diffusion to builders (3)',
  'cheap-tools': 'Cheap, accessible tools (4)',
  'priority-attribution': 'Priority & attribution norms (5)',
  'amateur-experimentation': 'Permissive amateur experimentation (6)',
  'hands-on-formation': 'Hands-on formation (7)',
  coordination: 'Coordination bottleneck',
  capital: 'Capital bottleneck',
  legibility: 'Legibility bottleneck',
}

export type ContributionV2 = {
  tool: ToolId
  targetedCondition: TargetedCondition
  whatWeDid: string
  observedMovement: string
  evidence?: string
}

export const CONTRIBUTIONS_V2: Record<FocusAreaKey, ContributionV2[]> = {
  'digital-human-rights': [
    {
      tool: 'infrastructure',
      targetedCondition: 'cheap-tools',
      whatWeDid:
        'Built and maintained the open libp2p / IPFS / Filecoin substrate that resilient-comms and provenance teams build on.',
      observedMovement:
        'Content-addressed distribution is now cheap enough that newsrooms and archives adopt it — the condition moved. Attribution rails (who published what, when) came with it.',
      evidence: 'https://dispatch.starlinglab.org/p/verify-authenticity-displays',
    },
    {
      tool: 'funding',
      targetedCondition: 'capital',
      whatWeDid:
        'Seeded and funded comms, messaging, identity and provenance teams (Fluence, Huddle01, SpruceID, Privy, EQTY Lab).',
      observedMovement:
        'Pre-commercial teams reached shipping products; whether this closed the field-level capital gap is // TODO(lukas): track follow-on funding.',
    },
    {
      tool: 'connection',
      targetedCondition: 'savant-fabricant-bridges',
      whatWeDid:
        'Convened identity-protocol teams with builders working on portable credentials.',
      observedMovement:
        'Cross-team collaboration formed around shared credential formats. // TODO(lukas): name the concrete collaborations that resulted.',
    },
  ],
  'economies-governance': [
    {
      tool: 'infrastructure',
      targetedCondition: 'priority-attribution',
      whatWeDid:
        'Originated Hypercerts — a content-addressed primitive that timestamps who produced which public-goods outcome.',
      observedMovement:
        'Allocation experiments can now cite verifiable outcome records; the priority/attribution condition moved from absent to usable.',
    },
    {
      tool: 'translation',
      targetedCondition: 'coordination',
      whatWeDid:
        'Routed validated allocation and MRV work toward pilots and ventures (Funding the Commons lineage, Molecule).',
      observedMovement:
        'Deployment paths opened for several teams. // TODO(lukas): track pilots converted to production.',
    },
    {
      tool: 'legibility',
      targetedCondition: 'knowledge-diffusion',
      whatWeDid:
        'Built evidence, benchmarks and standards for outcome verification (GainForest, Glow, WeatherXM).',
      observedMovement:
        'A shared vocabulary for verified-outcome funding is emerging; whether it reached working allocators is // TODO(lukas).',
      evidence: '/areas/economies-governance/impact/live-dashboard/',
    },
  ],
  neurotech: [
    {
      tool: 'legibility',
      targetedCondition: 'legibility',
      whatWeDid:
        'Defined benchmarks and milestones for NeuroAI, connectomics throughput, and a WBE reference demo.',
      observedMovement:
        'The efficiency / WBE targets give the field a shared scoreboard where none existed. Adoption by outside labs is // TODO(lukas).',
    },
    {
      tool: 'connection',
      targetedCondition: 'savant-fabricant-bridges',
      whatWeDid:
        'Bridged AI-lab and comp-neuro talent through the PL Neuro network.',
      observedMovement:
        'Talent is flowing toward NeuroAI — the field-side signal is accelerating; our attributable share is // TODO(lukas).',
    },
    {
      tool: 'policy',
      targetedCondition: 'amateur-experimentation',
      whatWeDid:
        'Engaged regulators, device makers and developers toward a standardized BCI software/API layer.',
      observedMovement:
        'DRAFT: the standardized app layer has not cleared (see the "BCI app store" sensor). The condition has not yet moved on our timeline; re-dating rather than dropping.',
    },
  ],
  'ai-robotics': [],
}

// ── The toolkit, checked against history ──────────────────────────────────────
// Seven tools designed to cover the seven conditions historians of invention
// (Howes, Mokyr, Jacob) identify in every sustained acceleration. The short
// entry (oneLiner + releases tags) renders in the methodology section; the rich
// description / what-changed / co-funder gap render in the toolkit modal.

export type ReleaseTag = { label: string; conditions: number[] }

export type CoFunderGap = {
  gap: string
  why: string
  /** name + whether they are already a PL co-funder (marked ✳ in the UI). */
  partners: { name: string; current?: boolean }[]
}

export type ToolkitEntry = {
  id: ToolId
  title: string
  subtitle: string
  proposed?: boolean
  /** One-line description used in the scannable methodology list (verbatim). */
  oneLiner: string
  releases: ReleaseTag[]
  /** Fuller, published-style description (Lukas's revised bullets). */
  description: string
  whatChanged?: { insertion: string; conditionClosed: string }
  coFunderGap?: CoFunderGap
}

/** Framing sentence for the toolkit block (verbatim). */
export const TOOLKIT_FRAMING =
  'Our toolkit is checked against the seven conditions that historians of invention — Anton Howes, Joel Mokyr, Margaret Jacob — identify in every sustained acceleration: an evangelizing improving culture, bridges between theorists and builders, knowledge diffusion that reaches working people, cheap accessible tools, priority and attribution norms, permissive room for amateur experimentation, and hands-on formation. We designed the toolkit to cover all seven, so a field diagnosis can never land on a bottleneck we have no way to address.'

export const TOOLKIT_V2: ToolkitEntry[] = [
  {
    id: 'legibility',
    title: 'Legibility',
    subtitle: 'field-building communications',
    oneLiner:
      'Maps, roadmaps, benchmarks, and builder-grade tutorials that make a field navigable for researchers and working builders.',
    releases: [{ label: 'knowledge diffusion', conditions: [3] }],
    description:
      'Many early fields are blocked by illegibility, to both internal and external audiences. The progress is real, but the map is missing. Researchers cannot easily find adjacent teams. Founders cannot tell which problems are ready for company formation. Funders cannot distinguish noise from signal. Policymakers cannot see which interventions would help rather than slow progress. Written artifacts like a field map, taxonomy, roadmap, whitepaper, benchmark, policy brief, or public research agenda can turn a loose collection of teams, researchers, and funders into a field with sustained momentum. Legibility also has a second audience: working builders. A field is fully legible only when a competent outsider can build in it, so tutorials, reference builds, teardowns, and partnerships with hands-on educators count as field-building communications alongside the papers.',
    whatChanged: {
      insertion: 'builder-grade artifacts, hands-on educator partnerships',
      conditionClosed:
        '3 — knowledge diffusion to working people (Jacob\u2019s lecturers taught mechanics, not readers)',
    },
  },
  {
    id: 'connection',
    title: 'Connection',
    subtitle: 'convenings & sustained cohorts',
    oneLiner:
      'Rooms that mix theorists with builders and keep them in contact over time — retreats, residencies, advisory networks, apprenticeship-style pairings.',
    releases: [
      { label: 'theorist–builder bridges', conditions: [2] },
      { label: 'sustained contact that spreads the improving mentality', conditions: [1] },
    ],
    description:
      'Some bottlenecks are social instead of technical. The right talent may already exist to unlock a breakthrough, but the field has not yet connected them. PL R&D runs and supports convenings, retreats, workshops, residencies, hackathons, and advisory networks that bring high-context people together around specific bottlenecks. Two design rules do most of the work. Mix kinds, not just seniority: the productive rooms pair theorists with builders and operators, because that pairing is where research turns into working systems. And sustain the contact: innovation spreads person to person, so recurring cohorts, alumni networks, and apprenticeship-style pairings matter more than one-off events. The goal is not to host events, but to forge new collaborations, companies, grants, pilots, and enable shared roadmaps to emerge.',
    whatChanged: {
      insertion: 'mix kinds not seniority; sustained cohorts, apprenticeship-style pairings',
      conditionClosed:
        '2 — savant–fabricant bridges (Mokyr); 1 partially — Howes: 80% of innovators knew an innovator personally first',
    },
  },
  {
    id: 'funding',
    title: 'Funding',
    subtitle: 'grants, prizes & fellowships',
    oneLiner:
      'Early money where small amounts unlock disproportionate downstream effort; prizes that define what "first" means for a field; fellowships and residencies that give outsiders hands-on entry.',
    releases: [
      { label: 'capital gaps', conditions: [] },
      { label: 'priority norms', conditions: [5] },
      { label: 'hands-on formation', conditions: [7] },
    ],
    description:
      'Many important ideas are too early for venture capital and too applied for traditional academic funding. Some need small grants to test whether a primitive works. Others need prizes, RFPs, fellowships, or retroactive funding to pull effort into an underbuilt area. A well-designed prize does more than pay out: it defines what counts as "first" in a field and sets the ambition bar for everyone watching. Where breakthrough variance is the goal, we prefer funding people over projects, with longer horizons and tolerance for early failure. Some of the highest-return grants buy entry rather than output: fellowships, residencies with equipment access, and support for the educators who give newcomers their first hands-on contact with a field. PL R&D deploys and helps coordinate early funding where a field-level bottleneck is clear and where small early funding can unlock much larger downstream effort.',
    whatChanged: {
      insertion: 'prizes define "first"; people over projects; entry-buying grants (fellowships, residencies, educator support)',
      conditionClosed: '5 — priority norms; 7 — hands-on formation',
    },
    coFunderGap: {
      gap: 'School-age hands-on formation (deep end of 7)',
      why: 'Education-system scale; PL can fund fellowships and kits, not curricula reform.',
      partners: [
        { name: 'Fab Foundation (Gershenfeld)' },
        { name: 'Raspberry Pi Foundation' },
        { name: 'FIRST' },
        { name: 'Siegel Family Endowment' },
        { name: 'Schmidt Futures', current: true },
        { name: 'Gates', current: true },
      ],
    },
  },
  {
    id: 'policy',
    title: 'Policy',
    subtitle: 'standards & experimentation rights',
    oneLiner:
      'Clearing adoption paths for working technology, and legal room for garage-scale experimentation.',
    releases: [{ label: 'permissive amateur experimentation', conditions: [6] }],
    description:
      'Frontier technologies often reach a point where the rules do not yet recognize what is possible. That can block adoption even when the technology works. In those cases, progress may require standards bodies, regulatory sandboxes, procurement pathways, model frameworks, or partnerships with public institutions. Adoption is half the job. Fields also need legal room to experiment at small scale: sandbox access for individuals and not only companies, hardware that may be repaired and modified, and workable pathways for citizen science in regulated domains. Many of the people a field will depend on in 10 years are amateurs today, and rules written only for incumbents quietly price them out. PL R&D engages in research, thought leadership, and participation in policy and standards-setting discussions with the goal of creating better rules, which, in turn, help responsible technologies reach users faster.',
    whatChanged: {
      insertion: 'experimentation rights for individuals, repairable hardware, citizen-science pathways',
      conditionClosed: '6 — permissive amateur experimentation',
    },
    coFunderGap: {
      gap: 'Amateur experimentation rights (6)',
      why: 'Agency-scale regulatory fights (FDA, FAA, spectrum, repair) are outside our policy weight class.',
      partners: [
        { name: 'Institute for Progress' },
        { name: 'EFF (adjacent via Digital Human Rights)' },
        { name: 'Repair Association / iFixit' },
        { name: 'Mercatus (permissionless-innovation lineage)' },
        { name: 'ARIA (sandbox design)', current: true },
      ],
    },
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    subtitle: 'primitives, rails & cheap tools',
    oneLiner:
      'Open protocols, shared facilities, and reference designs that collapse the cost of trying things; content-addressed registries that timestamp who built what, when.',
    releases: [
      { label: 'cheap accessible tools', conditions: [4] },
      { label: 'priority & attribution norms', conditions: [5] },
    ],
    description:
      'Sometimes the missing piece is open protocols, public-good infrastructure, or neutral rails that no single company has sufficient incentive to build alone. When a missing primitive or shared infrastructure layer is blocking a field, PL R&D may help build it directly, support the teams building it, or coordinate an ecosystem capable of maintaining it over time. Two kinds of rails get special attention. Tool-cost infrastructure: open reference designs, shared facilities, and instrument cost-down programs that collapse the price of trying things, especially in hardware fields where a single experiment can cost a career. And attribution infrastructure: content-addressed, timestamped records of who built what, and when, so that priority and credit work for protocols, designs, datasets, and negative results the way they already work for papers.',
    whatChanged: {
      insertion: 'tool-cost rails (atoms); content-addressed attribution rails',
      conditionClosed: '4 — cheap accessible tools; 5 — priority & attribution',
    },
    coFunderGap: {
      gap: 'Atoms tool-cost collapse (4)',
      why: 'Instrument programs are capex- and engineering-heavy; FRO territory.',
      partners: [
        { name: 'Convergent Research' },
        { name: 'Astera', current: true },
        { name: 'ARIA', current: true },
        { name: 'CZI (imaging & bio tools)' },
        { name: 'Amaranth Foundation (neuro)' },
        { name: 'Wellcome', current: true },
      ],
    },
  },
  {
    id: 'translation',
    title: 'Translation',
    subtitle: 'venture conversion & visibility',
    oneLiner:
      'Routing validated work to pilots, production, and capital — including surfacing independent inventors the world cannot yet see.',
    releases: [
      { label: 'deployment gaps', conditions: [] },
      { label: 'inventor visibility', conditions: [] },
    ],
    description:
      'Some work reaches the point where the bottleneck is no longer research but translation into pilot, production, and scale. PL R&D connects projects within the broader Protocol Labs network, including venture, capital, platform, and ecosystem support, to help promising work find the right deployment path, talent, and resources to succeed. Translation also has a scouting side: much of the most promising invention happens outside institutions and stays invisible until someone surfaces it. Part of this tool is finding independent builders before the market can see them and lending them the network\u2019s visibility, alongside converting the projects we already know.',
    whatChanged: {
      insertion: 'scouting invisible independent builders',
      conditionClosed:
        'Hintz\u2019s visibility failure (independents didn\u2019t vanish, they stopped being seen)',
    },
  },
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'celebrating the improving mentality',
    proposed: true,
    oneLiner:
      '(Proposed — our wildcard.) Deliberately open-ended creative bets: a film, a book, a photography prize that rewards human ingenuity, worldbuilding competitions — whatever recruits people into the conviction that things can be improved, and that they can be the ones to improve them.',
    releases: [
      {
        label: 'the evangelizing improving culture',
        conditions: [1],
      },
    ],
    description:
      'Every sustained acceleration of invention has run on a culture that treats improvement as a personal calling, spread from person to person. That culture is the hardest condition to engineer, so we treat this tool as our wildcard: deliberately open-ended creative bets that recruit people into building. That might mean backing a film or a book, a photography prize that rewards human ingenuity, or a worldbuilding competition that makes a field\u2019s future concrete enough to want. Ask inventors where they started and they often name an artifact: a book, a film, a kit. Most of these bets will miss. The hits compound for decades, and we will track them on the same scoreboard as everything else we fund.',
    whatChanged: {
      insertion: 'the wildcard: creative bets on the improving mentality',
      conditionClosed: '1 — evangelizing improving culture, the condition Howes ranks upstream of everything',
    },
    coFunderGap: {
      gap: 'Culture at scale (1)',
      why: 'Media production and distribution is its own industry.',
      partners: [
        { name: 'Sloan (science-film program is the proven model)' },
        { name: 'Foresight Institute (worldbuilding, prizes)' },
        { name: 'XPRIZE (prize mechanics)' },
        { name: 'Emergent Ventures (talent bets)' },
      ],
    },
  },
]

/** The four co-funder gaps, for the "Where we need co-funders" summary panel. */
export const CO_FUNDER_GAPS: (CoFunderGap & { tool: ToolId })[] = TOOLKIT_V2.filter(
  (t) => t.coFunderGap,
).map((t) => ({ tool: t.id, ...(t.coFunderGap as CoFunderGap) }))

// ── Verbatim copy blocks ──────────────────────────────────────────────────────

/** The three success questions (verbatim). */
export const THREE_QUESTIONS: { q: string; gloss: string; axis: 'field' | 'hand' | 'attribution' }[] = [
  {
    q: 'Is the field accelerating?',
    gloss: 'about the world — measured by the velocity basket',
    axis: 'field',
  },
  {
    q: 'Did we move the conditions we targeted?',
    gloss: 'about our hand — the X side',
    axis: 'hand',
  },
  {
    q: "Did our push contribute to the field's acceleration?",
    gloss: 'attribution — the hard one',
    axis: 'attribution',
  },
]

/** The methodology paragraph (verbatim). */
export const METHODOLOGY_PARAGRAPH =
  'Inflection points are our pre-registered sensors: specific, dated, falsifiable markers we expect field acceleration to produce. They grade our model of the field — not the field, and not us. The field is graded by its velocity: talent entering, capital forming, tool costs falling, output cadence rising. We are graded by attribution: whether the conditions we pushed on moved, and whether that push traceably contributed to the field\u2019s acceleration. We can be wrong about a marker and still be right about the field; when that happens, the marker stays on the board with a post-mortem. Every prediction we make is dated, every miss is kept, and every retired marker carries its reasons.'

/** The one-line v2 contract, written to the X→Y logic model. */
export const HOW_TO_READ_V2 =
  'The target (Y) is field acceleration itself — is the field moving faster — read from a basket of velocity signals. Inflection points are demoted to pre-registered sensors: dated, falsifiable markers that grade our model of the field, not the field and not us. Our hand (X) is the conditions we push on with the toolkit, judged by whether those conditions actually moved. We can be wrong about a marker and still be right about the field — misses stay on the board with a post-mortem.'

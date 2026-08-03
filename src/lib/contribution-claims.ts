// ── Contribution claims — graded attribution, folded into the OUR HAND block ──
//
// A description of what we do, sitting next to a moving field, reads as an
// unearned causal claim. So OUR HAND makes a *claim* whose evidence strength is
// visible: what we did, the counterfactual we believe (or its absence), the
// links we can actually trace, and a tier that grades how strong that evidence
// is. Testimony against us is first-class and never hidden.
//
// Seeding is honest and mechanical (see `seedClaims`): we do not invent
// counterfactuals, testimony, or tiers. Everything here derives from content
// already in the repo (the inflection points' contribution copy + TEAM_LINKS).

import {
  INFLECTION_POINTS,
  TEAM_LINKS,
  type FocusAreaKey,
  type PLRole,
} from '@/lib/inflection-points'
import type { ToolId } from '@/lib/field-velocity'

export type EvidenceTier = 1 | 2 | 3 | 4 | 5
export type Confidence = 'low' | 'moderate' | 'high'
export type ClaimStatus = 'open' | 'supported' | 'not_supported' | 'withdrawn'

export type TracedLink = { link: string; evidenceUrl?: string }

export type Testimony = {
  source: string
  role: string // grantee, collaborator, funder…
  quote: string
  url?: string
  /** Recorded and rendered even (especially) when true — never filtered out. */
  wouldHaveHappenedAnyway: boolean
}

export type ContributionClaim = {
  id: string
  focusArea: FocusAreaKey
  inflectionPoint?: string // omit for claims not tied to a named marker
  intervention: ToolId

  whatWeDid: string // factual, no causal verbs
  counterfactualClaim: string | null // what would not have happened without us, and why
  distalBet?: string // how this is meant to lead to field acceleration — always a bet

  tracedLinks: TracedLink[]
  tier: EvidenceTier
  confidence: Confidence

  testimony?: Testimony[]

  status: ClaimStatus
  statusReason?: string // required for 'not_supported' and 'withdrawn'
  retrospective: boolean // true when written after the outcome was known
  registeredAt: string // ISO date the claim was first written
  asOf: string // ISO date of last review
}

// ── Tier labels (short names shown on the badge) ──────────────────────────────
export const TIER_META: Record<EvidenceTier, { short: string }> = {
  1: { short: 'Coincidence' },
  2: { short: 'Traced chain' },
  3: { short: 'Counterparty testimony' },
  4: { short: 'Comparison group' },
  5: { short: 'Randomized' },
}

// The five tier definitions, verbatim (Task 5). Rendered in the methodology
// block "How we grade our own evidence".
export const TIER_DEFINITIONS: { tier: EvidenceTier; name: string; body: string }[] = [
  {
    tier: 1,
    name: 'Coincidence',
    body: 'we acted and the field moved, with no traceable link. Worth nothing on its own, and labelled as such.',
  },
  {
    tier: 2,
    name: 'Traced chain',
    body: 'named, checkable links from our action to a specific outcome, each one independently verifiable.',
  },
  {
    tier: 3,
    name: 'Counterparty testimony',
    body: 'a traced chain plus on-the-record statements from the people involved about what they would have done otherwise, collected including the answers that go against us.',
  },
  {
    tier: 4,
    name: 'Comparison group',
    body: 'outcomes for a comparable set we did not fund, such as near-miss applicants to the same programme.',
  },
  {
    tier: 5,
    name: 'Randomized or staggered',
    body: 'allocation randomized at the margin, or intervention timing staggered across comparable subfields.',
  },
]

/** Map an inflection point's primary PL role to a toolkit intervention id. */
const ROLE_TO_TOOL: Record<PLRole, ToolId> = {
  infrastructure: 'infrastructure',
  legibility: 'legibility',
  connection: 'connection',
  capital: 'funding',
  translation: 'translation',
  permission: 'policy',
}

/** Longest-name-first so multi-word team names win over substrings. */
const TEAM_NAMES = Object.keys(TEAM_LINKS).sort((a, b) => b.length - a.length)

/** Pull the named, linkable projects out of a piece of contribution copy. */
function tracedLinksFromText(text: string): TracedLink[] {
  const found: TracedLink[] = []
  const seen = new Set<string>()
  for (const name of TEAM_NAMES) {
    if (seen.has(name)) continue
    // word-ish boundary so "Lava" doesn't match inside another token
    const re = new RegExp(`(^|[^A-Za-z0-9])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`)
    if (re.test(text)) {
      seen.add(name)
      found.push({ link: name, evidenceUrl: TEAM_LINKS[name] })
    }
  }
  return found
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Honest seed (Task 6) ──────────────────────────────────────────────────────
// One claim per inflection point, derived only from existing repo content:
//   whatWeDid          ← the marker's "in practice" activities text
//   tracedLinks        ← named projects already linked in its outputs text
//   tier               ← 2 when a checkable project link exists, else 1
//   counterfactualClaim← null (Lukas + FA leads write these)
//   testimony          ← omitted (not yet collected)
//   confidence         ← low
//   retrospective      ← true (these describe work already done)
//   registered/asOf    ← today
// The resulting strip reads mostly tier 1–2, zero counterfactuals tested, zero
// withdrawn. That is the correct starting state; it is not padded.
export function seedClaims(today: string): ContributionClaim[] {
  return INFLECTION_POINTS.map((p) => {
    const links = tracedLinksFromText(p.contribution.outputs)
    const tier: EvidenceTier = links.length > 0 ? 2 : 1
    const primaryRole = p.roles[0]
    return {
      id: `claim-${p.area}-${slug(p.title)}`,
      focusArea: p.area,
      inflectionPoint: p.title,
      intervention: ROLE_TO_TOOL[primaryRole],
      whatWeDid: p.contribution.activities,
      counterfactualClaim: null,
      tracedLinks: links,
      tier,
      confidence: 'low',
      status: 'open',
      retrospective: true,
      registeredAt: today,
      asOf: today,
    }
  })
}

const TODAY = new Date().toISOString().slice(0, 10)

/** The seeded claim set. Deterministic per build. */
export const CONTRIBUTION_CLAIMS: ContributionClaim[] = seedClaims(TODAY)

export function claimsForArea(area: FocusAreaKey): ContributionClaim[] {
  return CONTRIBUTION_CLAIMS.filter((c) => c.focusArea === area)
}

export function claimsForPoint(area: FocusAreaKey, title: string): ContributionClaim[] {
  return CONTRIBUTION_CLAIMS.filter((c) => c.focusArea === area && c.inflectionPoint === title)
}

export function unmarkeredClaims(area: FocusAreaKey): ContributionClaim[] {
  return CONTRIBUTION_CLAIMS.filter((c) => c.focusArea === area && !c.inflectionPoint)
}

// ── Rendering-side invariants (kept next to the data so the UI can't drift) ────

/**
 * Testimony to render for a claim. This is the ONLY selector the UI uses, and
 * it deliberately never filters, so an entry with wouldHaveHappenedAnyway=true
 * always renders, visually equal to the rest. Do not add a filter here.
 */
export function visibleTestimony(claim: ContributionClaim): Testimony[] {
  return claim.testimony ?? []
}

/** Claims are never hidden by status — not_supported and withdrawn stay visible. */
export function isClaimRendered(_claim: ContributionClaim): boolean {
  return true
}

// ── Aggregate counts for the strip (Task 3) ───────────────────────────────────
export type ClaimTally = {
  n: number
  tier1: number
  tier2: number
  tier3plus: number
  counterfactualsTested: number
  withdrawnOrNotSupported: number
}

export function tallyClaims(claims: ContributionClaim[]): ClaimTally {
  return {
    n: claims.length,
    tier1: claims.filter((c) => c.tier === 1).length,
    tier2: claims.filter((c) => c.tier === 2).length,
    tier3plus: claims.filter((c) => c.tier >= 3).length,
    counterfactualsTested: claims.filter((c) => c.counterfactualClaim !== null).length,
    withdrawnOrNotSupported: claims.filter(
      (c) => c.status === 'withdrawn' || c.status === 'not_supported',
    ).length,
  }
}

// ── Build-time assertion (mirrors the instrument-records pattern) ─────────────
// Enforced at import during `next build`; a bad claim fails the build. The same
// rules are covered by unit tests in scripts/velocity/claims-validate.test.mjs.
export function validateClaim(c: ContributionClaim): string[] {
  const errs: string[] = []
  const where = c.id
  const testimony = c.testimony ?? []

  if (c.tier >= 3 && testimony.length < 1) {
    errs.push(`${where}: tier ${c.tier} requires at least one testimony entry`)
  }
  if (testimony.length > 0 && testimony.every((t) => t.wouldHaveHappenedAnyway) && c.confidence === 'high') {
    errs.push(`${where}: all testimony says it would have happened anyway; confidence may not be 'high'`)
  }
  if ((c.status === 'not_supported' || c.status === 'withdrawn') && !c.statusReason) {
    errs.push(`${where}: status '${c.status}' requires a statusReason`)
  }
  if (c.registeredAt > c.asOf) {
    errs.push(`${where}: registeredAt (${c.registeredAt}) must be <= asOf (${c.asOf})`)
  }
  return errs
}

export function assertContributionClaims(): void {
  const seen = new Set<string>()
  for (const c of CONTRIBUTION_CLAIMS) {
    if (seen.has(c.id)) throw new Error(`contribution-claims: duplicate id ${c.id}`)
    seen.add(c.id)
    const errs = validateClaim(c)
    if (errs.length) throw new Error(`contribution-claims: ${errs.join('; ')}`)
  }
}

assertContributionClaims()

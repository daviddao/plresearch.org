import type { IPConfig, TooltipEntry } from '../DependencyGraph'

export const sovereignDpiConfig: IPConfig = {
  id: 'ip1',
  label: 'Sovereign Digital Public Infrastructure',
  sub: 'Nation-state runs core systems on crypto-rails with measurable advantage',
  color: '#B07D10',
  num: '01',
  bottlenecks: [
    { id: 'b1a', label: 'Can open infra outperform centralized on sovereign metrics? (UPI succeeded because centralized)' },
    { id: 'b1b', label: "'Sovereign-grade' undefined — uptime, security, accessibility, disaster recovery specs unknown" },
    { id: 'b1c', label: 'Political champion fragility — Bhutan interest may not survive government changes' },
    { id: 'b1d', label: 'Pilot-to-production gap — dozens of Digital Public Infrastructure pilots went nowhere [Shared Blocker]' },
  ],
  gates: [
    { id: 'g1q2', label: 'At least 1 team achieves 100+ users on a working prototype', quarter: 'Q2' },
    { id: 'g1q3', label: 'Formal MoU signed with at least 1 sovereign entity for pilot deployment', quarter: 'Q3' },
    { id: 'g1', label: '1,000+ real users on open infrastructure for 30+ continuous days with performance parity', quarter: 'Q4' },
    { id: 'g1q1next', label: 'Cost parity with centralized alternative demonstrated; second sovereign engagement initiated', quarter: 'Q1 2026' },
  ],
  strands: [
    { id: 's1a', label: 'Prize 1: Sovereign Stack', sub: '3–5 competing teams with proving grounds' },
    { id: 's1b', label: 'Bhutan Deep Engagement', sub: 'Map infra, identify pilot, formal agreement' },
    { id: 's1c', label: 'Edge City Sovereign Prototype', sub: 'Villages run identity, payments, registries' },
  ],
  interventions: [
    { id: 'i1', label: 'ARIA-Style Grants', sub: '8–12 seeds, $5–50K, Q2 kill switches', strands: ['s1a'] },
    { id: 'i2', label: 'PL Breakthrough Prize', sub: 'Prize 1: Sovereign Services Challenge', strands: ['s1a', 's1c'] },
    { id: 'i3', label: 'Proving Ground Network', sub: 'Bhutan, Crecimiento, Edge City', strands: ['s1b', 's1c'] },
    { id: 'i5', label: 'Fellowship Cohort', sub: 'Sovereign ministers — proving ground access', strands: ['s1b'] },
    { id: 'i8', label: 'Co-Funding Partners', sub: 'Edge City execution infrastructure', strands: ['s1b'] },
  ],
  feedbackLoops: [
    { id: 'fl1a', from: 's1c', to: 'b1b', label: 'Edge City prototypes surface sovereign-grade requirements → refine specs' },
    { id: 'fl1b', from: 'i5', to: 's1b', label: 'Fellowship sovereign ministers → open new pilot jurisdictions → more proving grounds' },
    { id: 'fl1c', from: 'i4', to: 'i8', label: 'Evidence Engine publications → demonstrate traction → attract co-funding partners' },
  ],
}

export const sovereignDpiTooltips: Record<string, TooltipEntry> = {
  g1q2: {
    title: 'Q2 Gate: Prototype Traction',
    body: 'Can any Sovereign Stack team attract 100+ genuine users to a working prototype? This filters teams with real product-market signal from pure R&D.',
    context: 'Kill criterion: if zero teams reach 100 users by Q2, reassess whether the challenge framing attracts viable teams.',
  },
  g1q3: {
    title: 'Q3 Gate: Sovereign Commitment',
    body: 'Has any sovereign entity formalized interest beyond meetings? An MoU signals institutional willingness to risk political capital on open infrastructure.',
    context: 'Bhutan MoU target. Fallback: Uruguay or Estonia sub-national agreement. The bar is written commitment, not verbal interest.',
  },
  g1q1next: {
    title: 'Q1 2026 Gate: Cost & Scale',
    body: 'Can the production system demonstrate total cost of ownership at or below centralized alternatives? A second sovereign engagement validates generalizability.',
    context: 'Cost parity is the unlock for institutional adoption beyond early-adopter nations. Without it, open infra remains a values proposition, not an economic one.',
  },
}

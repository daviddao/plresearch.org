import type { IPConfig, TooltipEntry } from '../DependencyGraph'

export const publicGoodsFundingConfig: IPConfig = {
  id: 'ip2',
  label: 'Public Goods Funding',
  sub: 'AI/crypto-native PGF allocates capital at billion-dollar scale',
  color: '#7C52C9',
  num: '02',
  bottlenecks: [
    { id: 'b2a', label: "AI lacks causal reasoning — summarizes & classifies, but can't evaluate real impact" },
    { id: 'b2b', label: 'Institutions may want control & brand, not the transparency crypto provides' },
    { id: 'b2c', label: 'Mechanism attack surface at $100M+ — collusion, sybil, strategic manipulation' },
    { id: 'b2d', label: 'Perpetual grant dependency — new mechanisms may not fix underlying unit economics' },
  ],
  gates: [
    { id: 'g2q2', label: 'AI4PG benchmark complete — correlation scores published for AI vs. human on 10 historical rounds', quarter: 'Q2' },
    { id: 'g2q3', label: 'First live AI-augmented funding round at $1M+ executed on-chain with full auditability', quarter: 'Q3' },
    { id: 'g2', label: 'AI evaluation outperforms human committees on 12-month project outcomes', quarter: 'Q4' },
    { id: 'g2q1next', label: 'Institutional partner commits $10M+ to an AI-allocated public goods pool', quarter: 'Q1 2026' },
  ],
  strands: [
    { id: 's2a', label: 'AI4PG Research Coalition', sub: 'Benchmark AI vs. human on 10 historical rounds' },
    { id: 's2b', label: 'Funding Experiments', sub: 'Live experimentation at PL ecosystem events' },
    { id: 's2c', label: 'Prize 2: AI Capital Allocation', sub: 'Compete to produce better outcomes' },
  ],
  interventions: [
    { id: 'i1', label: 'ARIA-Style Grants', sub: 'Seeds for evaluation & mechanism teams', strands: ['s2a'] },
    { id: 'i2', label: 'PL Breakthrough Prize', sub: 'Prize 2: AI Capital Allocation Challenge', strands: ['s2c'] },
    { id: 'i4', label: 'Evidence Engine', sub: 'AI4PG benchmark papers & reports', strands: ['s2a'] },
    { id: 'i6', label: 'Hypercerts + ATProto', sub: 'Impact certificates & social data layer', strands: ['s2a', 's2b'] },
    { id: 'i7', label: 'Event Laboratories', sub: 'FtC, Edge City, PL events', strands: ['s2b'] },
    { id: 'i8', label: 'Co-Funding Partners', sub: 'EF research + Octant capital', strands: ['s2a'] },
    { id: 'i5', label: 'Fellowship Cohort', sub: 'Policy professors — academic validation', strands: ['s2a'] },
  ],
  feedbackLoops: [
    { id: 'fl2a', from: 's2b', to: 'b2a', label: 'Funding experiments generate outcome data → AI learns to evaluate real impact' },
    { id: 'fl2b', from: 's2a', to: 'b2c', label: 'Mechanism stress-testing addresses whether PGF scales beyond $10M' },
    { id: 'fl2c', from: 's2b', to: 'b2b', label: 'Transparent on-chain experiments demonstrate institutional value of openness' },
  ],
}

export const publicGoodsFundingTooltips: Record<string, TooltipEntry> = {
  g2q2: {
    title: 'Q2 Gate: Benchmark Publication',
    body: 'Does AI retrospective analysis of 10 historical PGF rounds correlate with actual outcomes better than human evaluations? This is the foundational evidence.',
    context: 'If correlation is weak, pivot from AI-replaces-humans to AI-augments-humans. The benchmark methodology itself becomes a public good.',
  },
  g2q3: {
    title: 'Q3 Gate: Live Capital Deployment',
    body: 'Can we move from retrospective analysis to real-time allocation? A $1M+ round tests operational readiness: smart contract security, evaluation latency, dispute resolution.',
    context: 'FtC or Edge City event as execution venue. Must be real capital with real stakes — not testnet or play money.',
  },
  g2q1next: {
    title: 'Q1 2026 Gate: Institutional Scale',
    body: 'Has any institutional funder committed real capital to an AI-managed allocation pool? This validates that the mechanism has crossed the trust threshold.',
    context: 'The gap between $1M community rounds and $10M+ institutional commitments is where legitimacy is tested. Academic publications from Evidence Engine are the bridge.',
  },
}

import type { IPConfig, TooltipEntry } from '../DependencyGraph'

export const governanceDemocracyConfig: IPConfig = {
  id: 'ip3',
  label: 'Governance & Democracy',
  sub: 'Crypto governance adopted as institutional necessity',
  color: '#1982F4',
  num: '03',
  bottlenecks: [
    { id: 'b3a', label: "No agreed definition of 'better governance' — different stakeholders want different things" },
    { id: 'b3b', label: 'Pop-up to permanent city gap — self-selected tech residents differ from diverse populations' },
    { id: 'b3c', label: 'Crypto component unproven — Pol.is & QV work without blockchain' },
    { id: 'b3d', label: 'No sovereign-grade identity infrastructure exists [Shared Blocker]' },
  ],
  gates: [
    { id: 'g3q2', label: '3+ Edge City villages instrumented with pre-registered governance metrics and baseline data collected', quarter: 'Q2' },
    { id: 'g3q3', label: 'At least 1 non-tech community pilot launched — cooperative, mutual aid, or neighborhood association', quarter: 'Q3' },
    { id: 'g3', label: '50%+ participation in a 500+ person community for a real decision with real stakes', quarter: 'Q4' },
    { id: 'g3q1next', label: 'City government adopts at least 1 crypto-native governance tool for real budget allocation', quarter: 'Q1 2026' },
  ],
  strands: [
    { id: 's3a', label: 'Governance Observatory', sub: 'Pre-registered metrics, cross-mechanism comparison' },
    { id: 's3b', label: 'Governance Tooling Grants', sub: 'Deliberation-first, offline-capable, accessible' },
    { id: 's3c', label: 'Deliberative + Crypto Research', sub: 'Pol.is integration with crypto execution' },
  ],
  interventions: [
    { id: 'i1', label: 'ARIA-Style Grants', sub: 'Seeds for tooling teams', strands: ['s3b'] },
    { id: 'i2', label: 'PL Breakthrough Prize', sub: 'Observatory data feeds prize evaluation', strands: ['s3a'] },
    { id: 'i3', label: 'Proving Ground Network', sub: 'Edge City villages as governance labs', strands: ['s3a'] },
    { id: 'i4', label: 'Evidence Engine', sub: 'Governance outcome publications', strands: ['s3a'] },
    { id: 'i5', label: 'Fellowship Cohort', sub: 'Civic tech leaders — tooling expertise', strands: ['s3c'] },
  ],
  feedbackLoops: [
    { id: 'fl3a', from: 's3a', to: 's3b', label: 'Observatory data reveals UX gaps → tooling grants target specific failures' },
    { id: 'fl3b', from: 's3c', to: 's3a', label: 'Deliberative research produces reusable protocols → Observatory adopts for next village' },
    { id: 'fl3c', from: 'i3', to: 'b3b', label: 'Proving ground diversity → test pop-up-to-permanent transfer → reduce gap' },
    { id: 'fl3d', from: 'i4', to: 'i5', label: 'Published governance outcomes → attract civic tech fellowship applicants' },
  ],
}

export const governanceDemocracyTooltips: Record<string, TooltipEntry> = {
  g3q2: {
    title: 'Q2 Gate: Observatory Baseline',
    body: 'Are Edge City villages producing rigorous, pre-registered governance data? Without baseline measurements, we cannot evaluate whether any intervention improves outcomes.',
    context: 'The Governance Observatory must instrument villages BEFORE governance experiments begin. Retroactive measurement is scientifically worthless for causal claims.',
  },
  g3q3: {
    title: 'Q3 Gate: Beyond Tech Bubble',
    body: 'Can governance tooling work for people who are not self-selected crypto-native residents? This is the transfer test from pop-up to permanent.',
    context: 'Risk Register R10 flag. Target: cooperative (500+ members), mutual aid network, or neighborhood association. If tooling requires crypto literacy, it fails this gate.',
  },
  g3q1next: {
    title: 'Q1 2026 Gate: Institutional Adoption',
    body: 'Has any city or municipal government used crypto-native governance tooling for a real budget decision? This is the ultimate proof that the tools have crossed from experiment to institution.',
    context: 'Edge City provides the proof-of-concept, but institutional adoption requires navigating procurement, legal frameworks, and political risk that pop-up cities never face.',
  },
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// --- Color palette adapted to site design language ---
const COLORS = {
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#131316',
  textMuted: '#737680',
  textDim: '#7F818B',
  edgeDefault: '#131316',
  edgeHL: '#131316',
  ip1: '#B07D10',
  ip2: '#7C52C9',
  ip3: '#1982F4',
  ip4: '#2D8A50',
  cross: '#9B4D5E',
  gate: '#C03A2A',
  bn: '#8B6340',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E5E7EB',
  tooltipShadow: 'rgba(0,0,0,0.08)',
  feedback: '#0D9488',
}

// --- Types ---
export type TooltipEntry = {
  title: string
  body: string
  context: string
}

export type BottleneckConfig = {
  id: string
  label: string
}

export type GateConfig = {
  id: string
  label: string
  quarter: string
}

export type StrandConfig = {
  id: string
  label: string
  sub: string
}

export type InterventionConfig = {
  id: string
  label: string
  sub: string
  strands: string[]
}

export type FeedbackLoop = {
  id: string
  from: string   // node id (strand or intervention)
  to: string     // node id (bottleneck, gate, or strand)
  label: string  // short label like 'Evidence compounds'
}

export type IPConfig = {
  id: string
  label: string
  sub: string
  color: string
  num: string
  bottlenecks: BottleneckConfig[]
  gates: GateConfig[]
  strands: StrandConfig[]
  interventions: InterventionConfig[]
  feedbackLoops?: FeedbackLoop[]
}

type NodePosition = {
  x: number
  y: number
  w: number
  h: number
}

type BottleneckNode = BottleneckConfig & NodePosition
type GateNode = GateConfig & NodePosition
type StrandNode = StrandConfig & NodePosition
type InterventionNode = InterventionConfig & NodePosition
type FeedbackNode = FeedbackLoop & NodePosition

type Edge = {
  key: string
  d: string
  from: string
  to: string
}

type TooltipState = {
  data: TooltipEntry
  x: number
  y: number
  color: string
} | null

// --- Tooltip content ---
const tooltipData: Record<string, TooltipEntry> = {
  ip1: { title: 'Inflection Point 1: Sovereign Digital Public Infrastructure', body: 'A nation-state successfully runs core digital systems — identity, payments, registries — on open, verifiable crypto-rails and gains measurable advantages over centralized incumbents.', context: 'Proving grounds: Bhutan (780K pop.), Argentina/Crecimiento (10K+ builders), Edge City villages. Multilaterals have moved from skepticism to active engagement.' },
  ip2: { title: 'Inflection Point 2: Public Goods Funding', body: 'AI and crypto-native funding mechanisms allocate capital at billion-dollar scale with institutional legitimacy — shifting public goods from discretionary philanthropy to durable markets.', context: 'QF, retroactive funding, and hypercerts have PMF at $1–10M. The AI4PG coalition (EF + Octant + Hypercerts) is assembling.' },
  ip3: { title: 'Inflection Point 3: Governance & Democracy', body: 'Crypto-native governance adopted because existing institutions can no longer credibly claim authority without it. Cities allocate budgets via crypto; governance tooling enters reform.', context: 'Edge City: 4 villages, 11K+ residents. Deliberative tools proven in civic contexts. Democratic institutions face global legitimacy crisis.' },
  ip4: { title: 'Inflection Point 4: Climate Infrastructure', body: 'A network of DePIN-enabled climate projects collectively demonstrates coordination at scale, attracting institutional capital through verified climate assets on-chain.', context: 'Glow (120+ solar farms), GainForest (200K+ audiominutes, 50+ communities), Devonian (mobile biochar). Voluntary carbon market ($2B/yr) widely recognized as broken.' },
  b1a: { title: 'Centralized Infra May Win', body: "Can decentralized infrastructure actually outperform centralized alternatives on metrics sovereigns care about? India's UPI and Brazil's PIX succeeded precisely because they were centralized enough for governments to mandate adoption.", context: 'This is the core testable hypothesis. The Sovereign Stack Challenge (3–5 competing teams) is designed to produce evidence by Q4. If open infra can\'t match centralized on uptime, throughput, and cost — the thesis needs revision, not abandonment.' },
  b1b: { title: "'Sovereign-Grade' Undefined", body: "What does 'sovereign-grade' actually require? Uptime guarantees, security standards, accessibility requirements, disaster recovery — these specifications might be significantly harder than the crypto community appreciates.", context: 'The gap between a working demo and sovereign-grade production may be a chasm, not a step. Edge City prototypes help surface these requirements empirically rather than theoretically.' },
  b1c: { title: 'Political Champion Fragility', body: "Is Bhutan's interest durable beyond individual champions? Sovereign engagement that depends on one minister or one monarch is fragile. Government changes could derail years of engagement overnight.", context: 'Risk Register R12: Maintain 2–3 parallel sovereign conversations (Uruguay, Estonia, Argentina sub-national). Fellowship cohort diversifies institutional access. Never concentrate in one jurisdiction.' },
  b1d: { title: 'Pilot-to-Production Gap', body: 'Can pilots convert to production? The field has produced dozens of promising Digital Public Infrastructure pilots that went nowhere. We do not know whether this is a technology problem, a political problem, or a market problem.', context: 'Shared Blocker across all 4 IPs. The Q4 decision gate (1,000+ real users, 30+ continuous days) is deliberately set to test production viability, not just pilot feasibility.' },
  b2a: { title: "AI Can't Yet Evaluate Impact", body: 'Can AI evaluate impact better than human committees? Current AI can summarize, classify, and pattern-match — but evaluating whether a public good created real value requires causal reasoning, counterfactual thinking, and domain expertise.', context: "The AI4PG benchmark study (AI retrospectively evaluates 10 historical PGF rounds vs. human evaluations vs. actual outcomes) is the foundational experiment. If AI doesn't correlate better — pivot to AI-augments-humans." },
  b2b: { title: 'Institutions Want Control, Not Transparency', body: 'Does transparency actually attract institutional capital? Institutional funders say they want transparency and measurement. What they might actually want is control and brand association.', context: "The path to $B-scale PGF requires institutional capital. If institutions don't actually value what crypto-native mechanisms provide, the scaling thesis collapses regardless of mechanism quality." },
  b2c: { title: 'Mechanisms Break at Scale', body: 'At what scale do PGF mechanisms break? QF works at $1–10M. At $100M+, the attack surface grows dramatically — collusion, sybil attacks, strategic manipulation. Do mechanisms scale gracefully or degrade?', context: "The AI4PG coalition's mechanism stress-testing strand addresses this directly. This is a formal mechanism design question requiring rigorous analysis, not optimistic extrapolation." },
  b2d: { title: 'Perpetual Grant Dependency', body: 'Is the sustainability crisis solvable? Most public goods projects remain perpetually grant-dependent. New funding mechanisms might simply replace one form of dependency with another.', context: "Even a perfect allocation mechanism can't fix projects whose unit economics require perpetual subsidy. The structural economics of public goods production may be the real bottleneck." },
  b3a: { title: "No Definition of 'Better Governance'", body: "Does 'better governance' have a clear definition? Faster decisions? More representative? More efficient allocation? Higher satisfaction? Different stakeholders want different things.", context: "The Governance Observatory addresses this by pre-registering metrics before each experiment — forcing explicit definition of what 'better' means in each context before measuring." },
  b3b: { title: 'Pop-up to Permanent City Gap', body: 'Do pop-up city innovations transfer to permanent cities? A month-long village with self-selected tech-savvy residents is radically different from a permanent city with diverse, unselected populations and entrenched interests.', context: 'Risk Register R10: Deliberately test in non-tech communities (cooperatives, mutual aid groups, neighborhood associations). If transfer fails, critical to know early.' },
  b3c: { title: 'Crypto Component May Add Nothing', body: "Is 'deliberative + crypto' actually better than 'deliberative alone'? Pol.is works without blockchain. Quadratic voting works without crypto. What specifically does the crypto component add beyond tamper-proof records?", context: 'The Deliberative + Crypto research strand (2–3 teams) tests this directly. The crypto component needs to earn its place through demonstrated advantage, not assumed superiority.' },
  b3d: { title: 'Identity Infrastructure Gap', body: "Identity remains the blocker. Most governance innovations require identity infrastructure that doesn't exist at sovereign grade. Solving this through usage-based reputation is a hypothesis, not a proven approach.", context: 'Shared Blocker across all 4 IPs. Progress on identity for any IP accelerates all others. This is the highest-leverage cross-cutting challenge.' },
  b4a: { title: 'Coordination Overhead vs. Advantage', body: 'Can decentralized coordination outperform centralized alternatives for physical infrastructure? Building solar farms and operating biochar furnaces are physical, operational challenges. Decentralization adds consensus and governance overhead.', context: 'The coordination advantage (global scale, community ownership, permissionless entry) is real but so is the coordination cost. Needs rigorous comparison against centralized operators, not assumption.' },
  b4b: { title: "Projects Don't Actually Compose", body: "Do these projects actually compose? The 'network-of-networks' vision assumes solar + biodiversity + carbon data is more valuable together. But the markets are different — energy buyers, carbon buyers, and biodiversity buyers barely exist as unified demand.", context: 'Network Coordination strand and regional proving grounds test whether composed data commands a premium. If composition value is zero, the network thesis collapses to individual project support.' },
  b4c: { title: 'AI Verification Does Not Equal Institutional Trust', body: "Is AI verification trustworthy enough for institutional capital? Institutional climate funds operate under fiduciary duty. 'An AI model says this solar farm generated X kWh' might not meet the evidentiary standard required.", context: "Prize 3 produces a benchmark, but institutional acceptance requires more than accuracy — it requires auditability, liability frameworks, and regulatory recognition that don't yet exist." },
  b4d: { title: 'Registry Regulatory Moats', body: 'Can the carbon market be disrupted from outside existing registries? Verra and Gold Standard have regulatory relationships and institutional moats. Crypto-native verification might be technically superior but institutionally irrelevant.', context: 'Risk Register R11: Dual strategy — issue through legacy AND crypto channels simultaneously. Test whether crypto-verified credits trade at premium. If not, understand why before scaling.' },
  g1: { title: 'Q4 Gate: Sovereign Services', body: 'Can any team demonstrate a core government service running on open infrastructure, serving 1,000+ real users, with performance parity vs. the status quo?', context: 'If YES — double down, seek formal sovereign pilot. If NO — diagnose bottleneck: technology, UX, political will, or market fit.' },
  g2: { title: 'Q4 Gate: AI vs. Human Allocation', body: 'Does AI evaluation correlate with actual project outcomes better than human committee evaluations? Tested on 10 historical PGF rounds.', context: 'If YES — proceed with Prize 2 allocation. If NO — pivot: AI augments humans. Bottleneck may be data quality.' },
  g3: { title: 'Q4 Gate: Governance Participation', body: 'Can any tooling achieve 50%+ participation in a community of 500+ people for a real decision with real stakes?', context: 'If YES — double down, begin city engagement. If NO — diagnose: UX? Incentives? Do people not want to participate?' },
  g4: { title: 'Q4 Gate: Climate Verification', body: 'Does any verification approach outperform legacy MRV on accuracy at lower cost? Tested via open challenge with 20+ projects and independent ground truth.', context: 'If YES — award Prize 3, begin capital pathways. If NO — reassess whether centralized auditors are good enough.' },
  s1a: { title: 'Prize 1: Sovereign Stack Challenge', body: 'Fund 3–5 competing teams to build open, verifiable public infrastructure for a municipality or small state. Each gets a proving ground.', context: 'Kill criteria: no team at 100 users by Q2 — reassess.' },
  s1b: { title: 'Bhutan Deep Engagement', body: 'Most promising sovereign proving ground — 780K population, institutional openness via Edge City Bhutan. Sustained relationship, not a single event.', context: "Fallback: Uruguay, Estonia, Argentina sub-national. Don't concentrate in one jurisdiction." },
  s1c: { title: 'Edge City Sovereign Prototype', body: 'Every village operates as micro-state: real identity, governance, payments, registries. 4 villages, 11K+ residents — larger than some nations.', context: 'Rigorous post-mortems published after each village. Public artifacts more compelling than playbooks.' },
  s2a: { title: 'AI4PG Research Coalition', body: 'EF + Octant + Hypercerts produce foundational evidence: benchmark AI vs. human on historical rounds, stress-test mechanisms at $100M+, open evaluation infra.', context: "PL R&D role: convener, not sole funder. If AI doesn't beat humans, thesis needs revision." },
  s2b: { title: 'Funding Experiments', body: 'Real capital pools at PL ecosystem events — FtC, Edge City, and other convenings. Projects present live, AI + human evaluate real-time, funding allocated before the event ends. All on-chain, auditable.', context: 'DARPA challenge model. Each event uses a different mechanism or refinement. Designed to incentivize live, focused experimentation across the PL event network.' },
  s2c: { title: 'Prize 2: AI Capital Allocation', body: 'First system that allocates capital to public goods and produces better 12-month outcomes than matched human committee.', context: "'Better outcomes' defined BEFORE competition. Outcomes at M18–24." },
  s3a: { title: 'Governance Observatory', body: 'Instrument every Edge City village with rigorous measurement. Pre-register metrics. Record every decision, vote, allocation. Publish everything.', context: 'Cross-mechanism comparison: QF in Village A, conviction voting in B, liquid democracy in C.' },
  s3b: { title: 'Governance Tooling Grants', body: '3–5 teams building accessible, deliberation-first, offline-capable governance tooling. Each tests in a real community.', context: 'Current DAO tooling is DAO-native, not community-native. Gap: Pol.is + broad listening integration.' },
  s3c: { title: 'Deliberative + Crypto Research', body: '2–3 teams integrating Pol.is-style deliberation with crypto execution. Hypothesis: deliberation leads to better preferences, crypto leads to better transparency.', context: 'Key question: is deliberative + crypto better than deliberative alone?' },
  s4a: { title: 'Climate MRV Grants', body: '3–5 teams: IoT + cryptographic attestation, satellite + AI, audio + ML, community-based + reputation, hybrid. Open Verification Challenge.', context: 'Benchmark: verify 20+ real projects vs. ground truth. Dataset becomes public good.' },
  s4b: { title: 'Network Coordination', body: 'Climate projects operate in parallel, not concert. Summits, regional coordination, quarterly assessments make the network visible to itself.', context: 'Identify regions where projects overlap (solar + forest + biochar). Composed impact > individual.' },
  s4c: { title: 'Prize 3: Climate Verification', body: 'Most accurate, cost-effective verification across 20+ real-world climate projects vs. independent ground truth.', context: 'Awards: Grand Prize (accuracy), novel methodology, open-source toolkit, cross-domain composition.' },
  i1: { title: 'ARIA-Style Grants', body: '8–12 seeds at $5–50K. Kill switches at Q2. Promotes Hypercerts/ATProto for reporting. Survivors feed prize pipeline.', context: 'ARIA model: compete, evaluate, kill underperformers, double down on winners.' },
  i2: { title: 'PL Breakthrough Prize', body: 'Three milestone-based challenges at Q2: Sovereign Services, AI Capital Allocation, Climate Verification. Edge City as execution partner.', context: 'Prizes outperform grants when outcomes are definable but approaches are uncertain.' },
  i3: { title: 'Proving Ground Network', body: 'Real-world environments: Bhutan, Crecimiento, Edge City, climate communities. Each serves multiple IPs simultaneously.', context: 'Compounding: Edge City Bhutan — sovereign (IP.1) + governance (IP.3) + climate (IP.4).' },
  i4: { title: 'Evidence Engine', body: "Quarterly reports, academic papers, 'Undeniable Traction' portfolio. Rigorous, honest, published openly.", context: "When institutions ask 'what have you demonstrated?' — the answer is this portfolio." },
  i5: { title: 'Fellowship Cohort', body: '15–18 fellows: sovereign ministers, policy professors, crypto/tech execs. UNGA-linked assembly.', context: 'Kill: if <5/18 produce concrete engagement in 12 months, restructure.' },
  i6: { title: 'Hypercerts + ATProto', body: 'Leading hypothesis for coordination substrate. Validate fitness for climate sensor data, governance patterns, identity accumulation.', context: 'Hypothesis, not mandate. Prizes stack-agnostic. Monitor alternatives.' },
  i7: { title: 'Event Laboratories', body: '957+ practitioners across FtC, Edge City, and PL ecosystem events. Every event generates data, tests mechanisms, produces artifacts — not networking.', context: 'Each convening must produce: (1) brief, (2) pipeline, (3) owner. Designed to incentivize live, focused experimentation.' },
  i8: { title: 'Co-Funding Partners', body: 'EF, Octant, Edge City, Ma Earth. Target: $1.50–2x per FA2 dollar.', context: 'If co-funding fails — concentrate on 2 IPs (Climate + PGF). Secure BEFORE deploying grants.' },
}

export const ipConfigs: IPConfig[] = [
  {
    id: 'ip1', label: 'Sovereign Digital Public Infrastructure', sub: 'Nation-state runs core systems on crypto-rails with measurable advantage', color: COLORS.ip1, num: '01',
    bottlenecks: [
      { id: 'b1a', label: 'Can open infra outperform centralized on sovereign metrics? (UPI succeeded because centralized)' },
      { id: 'b1b', label: "'Sovereign-grade' undefined — uptime, security, accessibility, disaster recovery specs unknown" },
      { id: 'b1c', label: 'Political champion fragility — Bhutan interest may not survive government changes' },
      { id: 'b1d', label: 'Pilot-to-production gap — dozens of Digital Public Infrastructure pilots went nowhere [Shared Blocker]' },
    ],
    gates: [{ id: 'g1', label: '1,000+ real users on open infrastructure for 30+ continuous days', quarter: 'Q4' }],
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
  },
  {
    id: 'ip2', label: 'Public Goods Funding', sub: 'AI/crypto-native PGF allocates capital at billion-dollar scale', color: COLORS.ip2, num: '02',
    bottlenecks: [
      { id: 'b2a', label: "AI lacks causal reasoning — summarizes & classifies, but can't evaluate real impact" },
      { id: 'b2b', label: 'Institutions may want control & brand, not the transparency crypto provides' },
      { id: 'b2c', label: 'Mechanism attack surface at $100M+ — collusion, sybil, strategic manipulation' },
      { id: 'b2d', label: 'Perpetual grant dependency — new mechanisms may not fix underlying unit economics' },
    ],
    gates: [{ id: 'g2', label: 'AI evaluation outperforms human committees on 12-month outcomes', quarter: 'Q4' }],
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
  },
  {
    id: 'ip3', label: 'Governance & Democracy', sub: 'Crypto governance adopted as institutional necessity', color: COLORS.ip3, num: '03',
    bottlenecks: [
      { id: 'b3a', label: "No agreed definition of 'better governance' — different stakeholders want different things" },
      { id: 'b3b', label: 'Pop-up to permanent city gap — self-selected tech residents differ from diverse populations' },
      { id: 'b3c', label: 'Crypto component unproven — Pol.is & QV work without blockchain' },
      { id: 'b3d', label: 'No sovereign-grade identity infrastructure exists [Shared Blocker]' },
    ],
    gates: [{ id: 'g3', label: '50%+ participation in a 500+ person community for a real decision', quarter: 'Q4' }],
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
  },
  {
    id: 'ip4', label: 'Climate Infrastructure', sub: 'DePIN climate projects coordinate at planetary scale', color: COLORS.ip4, num: '04',
    bottlenecks: [
      { id: 'b4a', label: 'Decentralized coordination adds overhead — consensus & governance cost for physical ops' },
      { id: 'b4b', label: 'Composition value unproven — different markets, no unified buyer demand exists' },
      { id: 'b4c', label: 'AI verification may not meet institutional fiduciary evidentiary standards' },
      { id: 'b4d', label: 'Verra / Gold Standard have regulatory moats & institutional lock-in' },
    ],
    gates: [{ id: 'g4', label: 'Verification outperforms legacy MRV on accuracy at lower cost', quarter: 'Q4' }],
    strands: [
      { id: 's4a', label: 'Climate MRV Grants', sub: 'IoT, satellite, audio, community, hybrid' },
      { id: 's4b', label: 'Network Coordination', sub: 'DePIN Summit, regional proving grounds' },
      { id: 's4c', label: 'Prize 3: Climate Verification', sub: 'Grand challenge vs. ground truth benchmark' },
    ],
    interventions: [
      { id: 'i1', label: 'ARIA-Style Grants', sub: '3–5 competing verification teams', strands: ['s4a'] },
      { id: 'i2', label: 'PL Breakthrough Prize', sub: 'Prize 3: Climate Verification Grand Challenge', strands: ['s4c'] },
      { id: 'i3', label: 'Proving Ground Network', sub: 'GainForest, Glow, Devonian as test sites', strands: ['s4b'] },
      { id: 'i4', label: 'Evidence Engine', sub: 'Verification benchmark publications', strands: ['s4a'] },
      { id: 'i6', label: 'Hypercerts + ATProto', sub: 'Climate sensor data fitness validation', strands: ['s4a'] },
      { id: 'i7', label: 'Event Laboratories', sub: 'Climate DePIN Summit co-location', strands: ['s4b'] },
    ],
  },
]

// --- Tooltip component ---
function Tooltip({ data: td, x, y, color, containerRef }: {
  data: TooltipEntry
  x: number
  y: number
  color: string
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!ref.current || !containerRef.current) return
    const tt = ref.current.getBoundingClientRect()
    const ct = containerRef.current.getBoundingClientRect()
    let nx = x - ct.left + 14
    let ny = y - ct.top - tt.height - 14
    if (nx + tt.width > ct.width - 16) nx = ct.width - tt.width - 16
    if (nx < 16) nx = 16
    if (ny < 16) ny = y - ct.top + 28
    setPos({ x: nx, y: ny })
  }, [x, y, containerRef])

  return (
    <div ref={ref} className="dep-graph-tooltip" style={{
      position: 'absolute', left: pos.x, top: pos.y, width: 320, zIndex: 100, pointerEvents: 'none',
      background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBorder}`,
      boxShadow: `0 8px 32px ${COLORS.tooltipShadow}, 0 2px 8px ${COLORS.tooltipShadow}`,
      borderRadius: 8, padding: '18px 20px',
    }}>
      <div style={{ width: 24, height: 2, background: color, opacity: 0.5, marginBottom: 10, borderRadius: 1 }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, lineHeight: 1.25, marginBottom: 8 }}>{td.title}</div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.55, marginBottom: 12 }}>{td.body}</div>
      <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: COLORS.textDim, marginBottom: 5 }}>Context</div>
        <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.45, fontStyle: 'italic' }}>{td.context}</div>
      </div>
    </div>
  )
}

// --- Single IP Figure ---
export function IPFigure({ config }: { config: IPConfig }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [feedbackTooltip, setFeedbackTooltip] = useState<{ label: string; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTooltip = useCallback((id: string | null, cx: number, cy: number, color: string) => {
    if (!id) { setTooltip(null); return }
    const td = tooltipData[id]
    if (td) setTooltip({ data: td, x: cx, y: cy, color })
  }, [])

  const PAD = { left: 52, right: 40, top: 36, bottom: 40 }
  const GAP = 52
  const NW = { ip: 200, bn: 250, gate: 230, strand: 240, int: 210, fb: 240 }
  const NH = { ip: 74, bn: 54, gate: 46, strand: 52, int: 48, fb: 52 }

  const COL = {
    ip: PAD.left,
    bn: PAD.left + NW.ip + GAP,
    gate: PAD.left + NW.ip + GAP + NW.bn + GAP,
    strand: PAD.left + NW.ip + GAP + NW.bn + GAP + NW.gate + GAP,
    int: PAD.left + NW.ip + GAP + NW.bn + GAP + NW.gate + GAP + NW.strand + GAP,
    fb: PAD.left + NW.ip + GAP + NW.bn + GAP + NW.gate + GAP + NW.strand + GAP + NW.int + GAP,
  }
  const hasFeedback = !!(config.feedbackLoops && config.feedbackLoops.length > 0)
  const W = hasFeedback ? COL.fb + NW.fb + PAD.right : COL.int + NW.int + PAD.right

  const bnCount = config.bottlenecks.length
  const strandCount = config.strands.length
  const intCount = config.interventions.length
  const gateCount = config.gates.length
  const BN_GAP = 64
  const STRAND_GAP = 60
  const INT_GAP = 56
  const GATE_GAP = 64

  const gateColH = gateCount * NH.gate + (gateCount - 1) * (GATE_GAP - NH.gate)

  const fbCount = config.feedbackLoops?.length ?? 0
  const FB_GAP = 60

  const contentH = Math.max(
    NH.ip,
    bnCount * BN_GAP - (BN_GAP - NH.bn),
    gateColH,
    strandCount * STRAND_GAP - (STRAND_GAP - NH.strand),
    intCount * INT_GAP - (INT_GAP - NH.int),
    fbCount > 0 ? fbCount * FB_GAP - (FB_GAP - NH.fb) : 0,
  )
  const H = PAD.top + contentH + PAD.bottom
  const midY = PAD.top + contentH / 2

  const ipNode: NodePosition = { x: COL.ip, y: midY - NH.ip / 2, w: NW.ip, h: NH.ip }

  const bnNodes: BottleneckNode[] = config.bottlenecks.map((b, i) => {
    const totalH = bnCount * BN_GAP - (BN_GAP - NH.bn)
    const startY = midY - totalH / 2
    return { ...b, x: COL.bn, y: startY + i * BN_GAP, w: NW.bn, h: NH.bn }
  })

  // Multi-gate: stack vertically centered at midY
  const gateNodes: GateNode[] = config.gates.map((g, i) => {
    const totalH = gateColH
    const startY = midY - totalH / 2
    return { ...g, x: COL.gate, y: startY + i * GATE_GAP, w: NW.gate, h: NH.gate }
  })

  const strandNodes: StrandNode[] = config.strands.map((s, i) => {
    const totalH = strandCount * STRAND_GAP - (STRAND_GAP - NH.strand)
    const startY = midY - totalH / 2
    return { ...s, x: COL.strand, y: startY + i * STRAND_GAP, w: NW.strand, h: NH.strand }
  })

  const intNodes: InterventionNode[] = config.interventions.map((item, i) => {
    const totalH = intCount * INT_GAP - (INT_GAP - NH.int)
    const startY = midY - totalH / 2
    return { ...item, x: COL.int, y: startY + i * INT_GAP, w: NW.int, h: NH.int }
  })

  const fbNodes: FeedbackNode[] = (config.feedbackLoops ?? []).map((fl, i) => {
    const totalH = fbCount * FB_GAP - (FB_GAP - NH.fb)
    const startY = midY - totalH / 2
    return { ...fl, x: COL.fb, y: startY + i * FB_GAP, w: NW.fb, h: NH.fb }
  })

  // Build a lookup map for all node positions (for feedback loops)
  const nodePositionMap: Record<string, NodePosition> = {}
  nodePositionMap[config.id] = ipNode
  bnNodes.forEach(n => { nodePositionMap[n.id] = n })
  gateNodes.forEach(n => { nodePositionMap[n.id] = n })
  strandNodes.forEach(n => { nodePositionMap[n.id] = n })
  intNodes.forEach(n => { nodePositionMap[n.id] = n })
  fbNodes.forEach(n => { nodePositionMap[n.id] = n })

  // Highlight logic
  const allGateIds = config.gates.map(g => g.id)
  const getRelatedIds = (id: string | null): Set<string> | null => {
    if (!id) return null
    const s = new Set([id])
    s.add(config.id)
    allGateIds.forEach(gid => s.add(gid))
    config.bottlenecks.forEach(b => s.add(b.id))
    if (id === config.id || allGateIds.includes(id) || config.bottlenecks.find(b => b.id === id)) {
      config.strands.forEach(st => s.add(st.id))
      config.interventions.forEach(iv => s.add(iv.id))
      return s
    }
    const strand = config.strands.find(st => st.id === id)
    if (strand) {
      config.interventions.forEach(iv => { if (iv.strands.includes(id)) s.add(iv.id) })
      return s
    }
    const inv = config.interventions.find(iv => iv.id === id)
    if (inv) {
      inv.strands.forEach(sid => s.add(sid))
      return s
    }
    // Feedback node: highlight itself + from + to nodes
    const fb = (config.feedbackLoops ?? []).find(fl => fl.id === id)
    if (fb) {
      s.add(fb.from)
      s.add(fb.to)
      return s
    }
    return s
  }

  const relatedIds = getRelatedIds(hovered)
  const isHL = (id: string): boolean | null => relatedIds ? relatedIds.has(id) : null
  const edgeActive = (fromId: string, toId: string): boolean => relatedIds ? relatedIds.has(fromId) && relatedIds.has(toId) : false

  const curve = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1
    return `M${x1},${y1} C${x1 + dx * 0.42},${y1} ${x2 - dx * 0.42},${y2} ${x2},${y2}`
  }

  const backwardCurve = (fromX: number, fromY: number, toX: number, toY: number): string => {
    // Arc below the graph content area
    const arcY = Math.max(fromY, toY) + 80
    return `M${fromX},${fromY} C${fromX - 40},${arcY} ${toX + 40},${arcY} ${toX},${toY}`
  }

  const edges: Edge[] = []

  // IP → bottlenecks
  bnNodes.forEach(b => {
    edges.push({ key: `ip-${b.id}`, d: curve(ipNode.x + ipNode.w, ipNode.y + ipNode.h / 2, b.x, b.y + b.h / 2), from: config.id, to: b.id })
  })

  // Bottlenecks → ALL gates (fan)
  bnNodes.forEach(b => {
    gateNodes.forEach(g => {
      edges.push({ key: `${b.id}-${g.id}`, d: curve(b.x + b.w, b.y + b.h / 2, g.x, g.y + g.h / 2), from: b.id, to: g.id })
    })
  })

  // Last gate → all strands
  const lastGate = gateNodes[gateNodes.length - 1]
  strandNodes.forEach(s => {
    edges.push({ key: `gate-${s.id}`, d: curve(lastGate.x + lastGate.w, lastGate.y + lastGate.h / 2, s.x, s.y + s.h / 2), from: lastGate.id, to: s.id })
  })

  // Strands → interventions
  intNodes.forEach(item => {
    item.strands.forEach(sid => {
      const s = strandNodes.find(sn => sn.id === sid)
      if (s) edges.push({ key: `${s.id}-${item.id}`, d: curve(s.x + s.w, s.y + s.h / 2, item.x, item.y + item.h / 2), from: s.id, to: item.id })
    })
  })

  const renderCard = (node: NodePosition, type: string, id: string, label: string, sub: string | null, cardColor: string, quarterLabel?: string) => {
    const hl = isHL(id)
    const op = hl === null ? 1 : hl ? 1 : 0.08
    const isGate = type === 'gate'
    const isIp = type === 'ip'
    const isInt = type === 'int'
    const isBn = type === 'bn'
    const isFb = type === 'fb'
    const leftPad = isGate ? 26 : isBn ? 24 : isInt ? 24 : isIp ? 14 : isFb ? 12 : 12
    const displayColor = cardColor || config.color

    return (
      <g key={id + type} style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }} opacity={op}
        onMouseEnter={(e) => {
          setHovered(id)
          if (!isFb) handleTooltip(id, e.clientX, e.clientY, displayColor)
          else setFeedbackTooltip({ label, x: e.clientX, y: e.clientY })
        }}
        onMouseMove={(e) => {
          if (!isFb) handleTooltip(id, e.clientX, e.clientY, displayColor)
          else setFeedbackTooltip({ label, x: e.clientX, y: e.clientY })
        }}
        onMouseLeave={() => {
          setHovered(null)
          if (!isFb) setTooltip(null)
          else setFeedbackTooltip(null)
        }}>
        <rect x={node.x + 1} y={node.y + 1.5} width={node.w} height={node.h} rx={isBn ? 3 : isGate ? 3 : 5} fill="rgba(0,0,0,0.02)" />
        <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={isBn ? 3 : isGate ? 3 : 5}
          fill={isBn ? `${COLORS.bn}06` : isFb ? `${COLORS.feedback}06` : '#FFFFFF'}
          stroke={isBn ? `${COLORS.bn}30` : isGate ? `${COLORS.gate}28` : isFb ? `${COLORS.feedback}40` : '#E5E7EB'}
          strokeWidth={0.8}
          strokeDasharray={isGate ? '5,4' : isBn ? '3,3' : isFb ? '5,4' : 'none'} />
        {isIp && <rect x={node.x} y={node.y} width={3.5} height={node.h} rx={1.75} fill={config.color} opacity={0.6} />}
        {isFb && <rect x={node.x} y={node.y} width={3} height={node.h} rx={1.5} fill={COLORS.feedback} opacity={0.6} />}
        {isGate && (
          <g opacity={0.45}>
            <line x1={node.x + 11} y1={node.y + node.h / 2 - 4} x2={node.x + 17} y2={node.y + node.h / 2} stroke={COLORS.gate} strokeWidth={1.2} />
            <line x1={node.x + 11} y1={node.y + node.h / 2 + 4} x2={node.x + 17} y2={node.y + node.h / 2} stroke={COLORS.gate} strokeWidth={1.2} />
          </g>
        )}
        {isBn && (
          <g opacity={0.35}>
            <line x1={node.x + 10} y1={node.y + node.h / 2 - 4} x2={node.x + 18} y2={node.y + node.h / 2 - 4} stroke={COLORS.bn} strokeWidth={1} />
            <line x1={node.x + 10} y1={node.y + node.h / 2} x2={node.x + 18} y2={node.y + node.h / 2} stroke={COLORS.bn} strokeWidth={1} />
            <line x1={node.x + 10} y1={node.y + node.h / 2 + 4} x2={node.x + 18} y2={node.y + node.h / 2 + 4} stroke={COLORS.bn} strokeWidth={1} />
          </g>
        )}
        {isInt && <circle cx={node.x + 13} cy={node.y + node.h / 2} r={3} fill={COLORS.cross} opacity={0.2} stroke={COLORS.cross} strokeWidth={0.8} />}
        {/* Quarter superscript for gate nodes */}
        {isGate && quarterLabel && (
          <text
            x={node.x + node.w - 6}
            y={node.y + 9}
            textAnchor="end"
            fontSize={8}
            fontWeight={600}
            fill={COLORS.gate}
            opacity={0.6}
            letterSpacing={0.5}
          >{quarterLabel}</text>
        )}
        <foreignObject x={node.x + leftPad} y={node.y} width={node.w - leftPad - (isGate && quarterLabel ? 28 : 8)} height={node.h}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3px 0' }}>
            <div style={{
              fontSize: isIp ? 14.5 : isBn ? 10.5 : isGate ? 11 : isInt ? 12 : isFb ? 10.5 : 12.5,
              fontWeight: isIp ? 600 : isBn ? 500 : isGate ? 500 : isFb ? 500 : 600,
              color: isBn ? COLORS.bn : isGate ? COLORS.gate : isIp ? config.color : isInt ? COLORS.cross : isFb ? COLORS.feedback : COLORS.text,
              lineHeight: isBn ? 1.35 : isFb ? 1.35 : 1.2,
              fontStyle: isGate ? 'italic' : isFb ? 'italic' : 'normal',
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: isBn ? 3 : isFb ? 3 : 2, WebkitBoxOrient: 'vertical',
            }}>{label}</div>
            {sub && !isBn && !isFb && (
              <div style={{
                fontSize: isIp ? 11 : 10,
                color: COLORS.textMuted, lineHeight: 1.3, marginTop: 2,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{sub}</div>
            )}
          </div>
        </foreignObject>
      </g>
    )
  }

  return (
    <div style={{ marginBottom: 48 }}>
      <div className="flex items-baseline gap-3.5 mb-3.5">
        <span style={{
          fontSize: 44, fontWeight: 700,
          color: config.color, opacity: 0.15, lineHeight: 1, letterSpacing: -2,
        }}>{config.num}</span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: COLORS.text, lineHeight: 1.15 }}>
            {config.label}
          </h2>
          <p className="text-sm text-gray-500 mt-1" style={{ fontWeight: 300 }}>
            {config.sub}
          </p>
        </div>
      </div>

      {/* Sized wrapper ensures headers, graph border, and legend all match SVG width */}
      <div style={{ width: W }}>
        <div className="flex" style={{ width: W, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          {[
            { label: 'Inflection Point', w: NW.ip + GAP },
            { label: 'Bottlenecks', w: NW.bn + GAP },
            { label: gateCount > 1 ? 'Gates' : 'Q4 Gate', w: NW.gate + GAP },
            { label: 'Program Strands', w: NW.strand + GAP },
            { label: 'Interventions', w: hasFeedback ? NW.int + GAP : NW.int },
            ...(hasFeedback ? [{ label: 'Reinforcing Loops', w: NW.fb }] : []),
          ].map((col, i) => (
            <div key={i} style={{ width: col.w, flexShrink: 0, paddingLeft: i === 0 ? PAD.left : 0, textAlign: i === 0 ? 'left' : 'center' }}>
              <div style={{
                fontSize: 10, fontWeight: 500,
                letterSpacing: 2, textTransform: 'uppercase',
                color: col.label === 'Bottlenecks' ? COLORS.bn : col.label === 'Reinforcing Loops' ? COLORS.feedback : COLORS.textDim,
                opacity: col.label === 'Bottlenecks' ? 0.7 : col.label === 'Reinforcing Loops' ? 0.7 : 1,
              }}>{col.label}</div>
            </div>
          ))}
        </div>

        <div ref={containerRef} style={{
          width: W, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: 'none',
          overflow: 'visible', position: 'relative', borderRadius: '0 0 8px 8px',
        }}>
          <svg width={W} height={H} style={{ display: 'block' }}>
            {/* Arrowhead marker for feedback loops */}
            <defs>
              <marker id={`feedback-arrow-${config.id}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill={COLORS.feedback} opacity={0.5} />
              </marker>
            </defs>

            {edges.map(e => {
              const hl = edgeActive(e.from, e.to)
              const isBnEdge = config.bottlenecks.some(b => b.id === e.from || b.id === e.to)
              return (
                <path key={e.key} d={e.d} fill="none"
                  stroke={hl ? COLORS.edgeHL : COLORS.edgeDefault}
                  strokeWidth={hl ? 1.6 : 0.6}
                  opacity={hovered ? (hl ? 0.4 : 0.04) : 0.1}
                  strokeDasharray={isBnEdge ? '4,3' : 'none'}
                  style={{ transition: 'all 0.3s ease' }} />
              )
            })}

            {/* Feedback loop edges: forward (from → fb card) and backward (fb card → to) */}
            {hasFeedback && fbNodes.map(fbNode => {
              const fromNode = nodePositionMap[fbNode.from]
              const toNode = nodePositionMap[fbNode.to]
              if (!fromNode || !toNode) return null
              const fwdD = curve(fromNode.x + fromNode.w, fromNode.y + fromNode.h / 2, fbNode.x, fbNode.y + fbNode.h / 2)
              const bwdD = backwardCurve(fbNode.x, fbNode.y + fbNode.h / 2, toNode.x + toNode.w, toNode.y + toNode.h / 2)
              return (
                <g key={`fl-edges-${fbNode.id}`}>
                  <path
                    d={fwdD}
                    fill="none"
                    stroke={COLORS.feedback}
                    strokeWidth={1.2}
                    strokeDasharray="5,4"
                    opacity={0.25}
                  />
                  <path
                    d={bwdD}
                    fill="none"
                    stroke={COLORS.feedback}
                    strokeWidth={1.2}
                    strokeDasharray="5,4"
                    opacity={0.25}
                    markerEnd={`url(#feedback-arrow-${config.id})`}
                  />
                </g>
              )
            })}

            {renderCard(ipNode, 'ip', config.id, config.label, config.sub, config.color)}
            {bnNodes.map(b => renderCard(b, 'bn', b.id, b.label, null, COLORS.bn))}
            {gateNodes.map(g => renderCard(g, 'gate', g.id, g.label, null, COLORS.gate, g.quarter))}
            {strandNodes.map(s => renderCard(s, 'strand', s.id, s.label, s.sub, config.color))}
            {intNodes.map(item => renderCard(item, 'int', item.id, item.label, item.sub, COLORS.cross))}
            {fbNodes.map(fbNode => renderCard(fbNode, 'fb', fbNode.id, fbNode.label, null, COLORS.feedback))}
          </svg>

          {/* Feedback loop tooltip */}
          {feedbackTooltip && containerRef.current && (() => {
            const ct = containerRef.current!.getBoundingClientRect()
            const tx = feedbackTooltip.x - ct.left + 14
            const ty = feedbackTooltip.y - ct.top - 36
            return (
              <div style={{
                position: 'absolute', left: Math.min(tx, W - 200), top: Math.max(ty, 8),
                background: COLORS.tooltipBg, border: `1px solid ${COLORS.tooltipBorder}`,
                boxShadow: `0 4px 16px ${COLORS.tooltipShadow}`,
                borderRadius: 6, padding: '6px 10px', zIndex: 101, pointerEvents: 'none',
                fontSize: 11, color: COLORS.feedback, fontStyle: 'italic', whiteSpace: 'nowrap',
              }}>
                {feedbackTooltip.label}
              </div>
            )
          })()}

          {tooltip && tooltip.data && (
            <Tooltip data={tooltip.data} x={tooltip.x} y={tooltip.y} color={tooltip.color} containerRef={containerRef} />
          )}
        </div>

        <div className="flex items-center gap-5 mt-2.5 justify-end flex-wrap" style={{ width: W }}>
          {[
            { color: config.color, label: config.label, dash: false },
            { color: COLORS.bn, label: 'Bottleneck', dash: true },
            { color: COLORS.gate, label: 'Go/No-Go', dash: true },
            { color: COLORS.cross, label: 'Cross-cutting', dash: false },
            ...(hasFeedback ? [{ color: COLORS.feedback, label: 'Feedback loop', dash: true }] : []),
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div style={{
                width: 16, height: l.dash ? 0 : 1.5, background: l.dash ? 'none' : l.color, opacity: 0.5,
                borderTop: l.dash ? `1.5px dashed ${l.color}` : 'none',
              }} />
              <span className="text-[10px] text-gray-500">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <svg width={36} height={8} style={{ opacity: 0.2 }}>
              <line x1={0} y1={4} x2={28} y2={4} stroke={COLORS.edgeDefault} strokeWidth={1} />
              <polygon points="28,1 34,4 28,7" fill={COLORS.edgeDefault} />
            </svg>
            <span className="text-[10px] text-gray-500 italic">read left to right</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Main exported component ---
export default function DependencyGraph() {
  return (
    <div>
      <style>{`
        .dep-graph-tooltip {
          animation: depGraphTtFade 0.2s ease;
        }
        @keyframes depGraphTtFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="space-y-2">
        {ipConfigs.map(config => (
          <IPFigure key={config.id} config={config} />
        ))}
      </div>
    </div>
  )
}

import type { IPConfig, TooltipEntry } from '../DependencyGraph'

export const climateInfrastructureConfig: IPConfig = {
  id: 'ip4',
  label: 'Climate Infrastructure',
  sub: 'DePIN climate projects coordinate at planetary scale',
  color: '#2D8A50',
  num: '04',
  bottlenecks: [
    { id: 'b4a', label: 'Decentralized coordination adds overhead — consensus & governance cost for physical ops' },
    { id: 'b4b', label: 'Composition value unproven — different markets, no unified buyer demand exists' },
    { id: 'b4c', label: 'AI verification may not meet institutional fiduciary evidentiary standards' },
    { id: 'b4d', label: 'Verra / Gold Standard have regulatory moats & institutional lock-in' },
  ],
  gates: [
    { id: 'g4q2', label: 'Open Verification Challenge launched with 20+ real projects enrolled and ground truth dataset published', quarter: 'Q2' },
    { id: 'g4q3', label: 'At least 3 verification approaches produce comparable accuracy benchmarks on shared dataset', quarter: 'Q3' },
    { id: 'g4', label: 'Best verification approach outperforms legacy MRV on accuracy at lower cost across 20+ projects', quarter: 'Q4' },
    { id: 'g4q1next', label: 'First institutional climate fund accepts crypto-verified credits for portfolio allocation', quarter: 'Q1 2026' },
  ],
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
  feedbackLoops: [
    { id: 'fl4a', from: 's4b', to: 's4a', label: 'Network coordination reveals data gaps → MRV grants target underserved verification domains' },
    { id: 'fl4b', from: 's4c', to: 's4b', label: 'Prize benchmark dataset → projects self-assess against it → network visibility improves' },
    { id: 'fl4c', from: 'i3', to: 'b4b', label: "Regional proving grounds demonstrate composition value → counter \"projects don't compose\" bottleneck" },
    { id: 'fl4d', from: 'i4', to: 'b4c', label: 'Published verification benchmarks → build institutional evidence base → reduce trust gap' },
  ],
}

export const climateInfrastructureTooltips: Record<string, TooltipEntry> = {
  g4q2: {
    title: 'Q2 Gate: Challenge Enrollment',
    body: 'Is there sufficient market interest to make the verification challenge meaningful? 20+ real projects with independent ground truth creates a robust benchmark.',
    context: 'The ground truth dataset is the key deliverable — it becomes a permanent public good regardless of which verification approach wins. If enrollment is below 10 projects, the benchmark lacks statistical power.',
  },
  g4q3: {
    title: 'Q3 Gate: Competitive Verification',
    body: 'Are multiple approaches producing comparable results? If only 1 approach works, the field is too fragile. If 3+ converge, the methodology class is validated.',
    context: 'Diversity of approaches (IoT+crypto, satellite+AI, audio+ML, community+reputation, hybrid) tests whether verification is method-dependent or method-agnostic. Method-agnostic is far more valuable.',
  },
  g4q1next: {
    title: 'Q1 2026 Gate: Institutional Capital Pathway',
    body: 'Has any institutional climate fund — sovereign wealth, pension, endowment — accepted crypto-verified credits? This is the market validation that makes the technology economically self-sustaining.',
    context: 'The voluntary carbon market is $2B/yr. Institutional allocation requires not just accuracy but auditability, liability frameworks, and regulatory recognition. Prize 3 winners need institutional translation support.',
  },
}

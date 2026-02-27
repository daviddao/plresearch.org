---
id: ip2
label: "Public Goods Funding"
sub: "AI/crypto-native PGF allocates capital at billion-dollar scale"
color: "#7C52C9"
num: "02"

tooltip:
  title: "Inflection Point 2: Public Goods Funding"
  body: "AI and crypto-native funding mechanisms allocate capital at billion-dollar scale with institutional legitimacy — shifting public goods from discretionary philanthropy to durable markets."
  context: "QF, retroactive funding, and hypercerts have PMF at $1–10M. The AI4PG coalition (EF + Octant + Hypercerts) is assembling."

bottlenecks:
  - id: b2a
    label: "AI lacks causal reasoning — summarizes & classifies, but can't evaluate real impact"
    tooltip:
      title: "AI Can't Yet Evaluate Impact"
      body: "Can AI evaluate impact better than human committees? Current AI can summarize, classify, and pattern-match — but evaluating whether a public good created real value requires causal reasoning, counterfactual thinking, and domain expertise."
      context: "The AI4PG benchmark study (AI retrospectively evaluates 10 historical PGF rounds vs. human evaluations vs. actual outcomes) is the foundational experiment. If AI doesn't correlate better — pivot to AI-augments-humans."
  - id: b2b
    label: "Institutions may want control & brand, not the transparency crypto provides"
    tooltip:
      title: "Institutions Want Control, Not Transparency"
      body: "Does transparency actually attract institutional capital? Institutional funders say they want transparency and measurement. What they might actually want is control and brand association."
      context: "The path to $B-scale PGF requires institutional capital. If institutions don't actually value what crypto-native mechanisms provide, the scaling thesis collapses regardless of mechanism quality."
  - id: b2c
    label: "Mechanism attack surface at $100M+ — collusion, sybil, strategic manipulation"
    tooltip:
      title: "Mechanisms Break at Scale"
      body: "At what scale do PGF mechanisms break? QF works at $1–10M. At $100M+, the attack surface grows dramatically — collusion, sybil attacks, strategic manipulation. Do mechanisms scale gracefully or degrade?"
      context: "The AI4PG coalition's mechanism stress-testing strand addresses this directly. This is a formal mechanism design question requiring rigorous analysis, not optimistic extrapolation."
  - id: b2d
    label: "Perpetual grant dependency — new mechanisms may not fix underlying unit economics"
    tooltip:
      title: "Perpetual Grant Dependency"
      body: "Is the sustainability crisis solvable? Most public goods projects remain perpetually grant-dependent. New funding mechanisms might simply replace one form of dependency with another."
      context: "Even a perfect allocation mechanism can't fix projects whose unit economics require perpetual subsidy. The structural economics of public goods production may be the real bottleneck."

gates:
  - id: g2q2
    label: "AI4PG benchmark complete — correlation scores published for AI vs. human on 10 historical rounds"
    quarter: Q2
    tooltip:
      title: "Q2 Gate: Benchmark Publication"
      body: "Does AI retrospective analysis of 10 historical PGF rounds correlate with actual outcomes better than human evaluations? This is the foundational evidence."
      context: "If correlation is weak, pivot from AI-replaces-humans to AI-augments-humans. The benchmark methodology itself becomes a public good."
  - id: g2q3
    label: "First live AI-augmented funding round at $1M+ executed on-chain with full auditability"
    quarter: Q3
    tooltip:
      title: "Q3 Gate: Live Capital Deployment"
      body: "Can we move from retrospective analysis to real-time allocation? A $1M+ round tests operational readiness: smart contract security, evaluation latency, dispute resolution."
      context: "FtC or Edge City event as execution venue. Must be real capital with real stakes — not testnet or play money."
  - id: g2
    label: "AI evaluation outperforms human committees on 12-month project outcomes"
    quarter: Q4
    tooltip:
      title: "Q4 Gate: AI vs. Human Allocation"
      body: "Does AI evaluation correlate with actual project outcomes better than human committee evaluations? Tested on 10 historical PGF rounds."
      context: "If YES — proceed with Prize 2 allocation. If NO — pivot: AI augments humans. Bottleneck may be data quality."
  - id: g2q1next
    label: "Institutional partner commits $10M+ to an AI-allocated public goods pool"
    quarter: "Q1 2026"
    tooltip:
      title: "Q1 2026 Gate: Institutional Scale"
      body: "Has any institutional funder committed real capital to an AI-managed allocation pool? This validates that the mechanism has crossed the trust threshold."
      context: "The gap between $1M community rounds and $10M+ institutional commitments is where legitimacy is tested. Academic publications from Evidence Engine are the bridge."

strands:
  - id: s2a
    label: "AI4PG Research Coalition"
    sub: "Benchmark AI vs. human on 10 historical rounds"
    tooltip:
      title: "AI4PG Research Coalition"
      body: "EF + Octant + Hypercerts produce foundational evidence: benchmark AI vs. human on historical rounds, stress-test mechanisms at $100M+, open evaluation infra."
      context: "PL R&D role: convener, not sole funder. If AI doesn't beat humans, thesis needs revision."
  - id: s2b
    label: "Funding Experiments"
    sub: "Live experimentation at PL ecosystem events"
    tooltip:
      title: "Funding Experiments"
      body: "Real capital pools at PL ecosystem events — FtC, Edge City, and other convenings. Projects present live, AI + human evaluate real-time, funding allocated before the event ends. All on-chain, auditable."
      context: "DARPA challenge model. Each event uses a different mechanism or refinement. Designed to incentivize live, focused experimentation across the PL event network."
  - id: s2c
    label: "Prize 2: AI Capital Allocation"
    sub: "Compete to produce better outcomes"
    tooltip:
      title: "Prize 2: AI Capital Allocation"
      body: "First system that allocates capital to public goods and produces better 12-month outcomes than matched human committee."
      context: "'Better outcomes' defined BEFORE competition. Outcomes at M18–24."

interventions:
  - id: i1
    label: "ARIA-Style Grants"
    sub: "Seeds for evaluation & mechanism teams"
    strands: [s2a]
    tooltip:
      title: "ARIA-Style Grants"
      body: "8–12 seeds at $5–50K. Kill switches at Q2. Promotes Hypercerts/ATProto for reporting. Survivors feed prize pipeline."
      context: "ARIA model: compete, evaluate, kill underperformers, double down on winners."
  - id: i2
    label: "PL Breakthrough Prize"
    sub: "Prize 2: AI Capital Allocation Challenge"
    strands: [s2c]
    tooltip:
      title: "PL Breakthrough Prize"
      body: "Three milestone-based challenges at Q2: Sovereign Services, AI Capital Allocation, Climate Verification. Edge City as execution partner."
      context: "Prizes outperform grants when outcomes are definable but approaches are uncertain."
  - id: i4
    label: "Evidence Engine"
    sub: "AI4PG benchmark papers & reports"
    strands: [s2a]
    tooltip:
      title: "Evidence Engine"
      body: "Quarterly reports, academic papers, 'Undeniable Traction' portfolio. Rigorous, honest, published openly."
      context: "When institutions ask 'what have you demonstrated?' — the answer is this portfolio."
  - id: i6
    label: "Hypercerts + ATProto"
    sub: "Impact certificates & social data layer"
    strands: [s2a, s2b]
    tooltip:
      title: "Hypercerts + ATProto"
      body: "Leading hypothesis for coordination substrate. Validate fitness for climate sensor data, governance patterns, identity accumulation."
      context: "Hypothesis, not mandate. Prizes stack-agnostic. Monitor alternatives."
  - id: i7
    label: "Event Laboratories"
    sub: "FtC, Edge City, PL events"
    strands: [s2b]
    tooltip:
      title: "Event Laboratories"
      body: "957+ practitioners across FtC, Edge City, and PL ecosystem events. Every event generates data, tests mechanisms, produces artifacts — not networking."
      context: "Each convening must produce: (1) brief, (2) pipeline, (3) owner. Designed to incentivize live, focused experimentation."
  - id: i8
    label: "Co-Funding Partners"
    sub: "EF research + Octant capital"
    strands: [s2a]
    tooltip:
      title: "Co-Funding Partners"
      body: "EF, Octant, Edge City, Ma Earth. Target: $1.50–2x per FA2 dollar."
      context: "If co-funding fails — concentrate on 2 IPs (Climate + PGF). Secure BEFORE deploying grants."
  - id: i5
    label: "Fellowship Cohort"
    sub: "Policy professors — academic validation"
    strands: [s2a]
    tooltip:
      title: "Fellowship Cohort"
      body: "15–18 fellows: sovereign ministers, policy professors, crypto/tech execs. UNGA-linked assembly."
      context: "Kill: if <5/18 produce concrete engagement in 12 months, restructure."

feedbackLoops:
  - id: fl2a
    from: s2b
    to: b2a
    label: "Funding experiments generate outcome data → AI learns to evaluate real impact"
  - id: fl2b
    from: s2a
    to: b2c
    label: "Mechanism stress-testing addresses whether PGF scales beyond $10M"
  - id: fl2c
    from: s2b
    to: b2b
    label: "Transparent on-chain experiments demonstrate institutional value of openness"
---

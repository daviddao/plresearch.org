---
id: ip4
label: "Climate Infrastructure"
sub: "DePIN climate projects coordinate at planetary scale"
color: "#2D8A50"
num: "04"

tooltip:
  title: "Inflection Point 4: Climate Infrastructure"
  body: "A network of DePIN-enabled climate projects collectively demonstrates coordination at scale, attracting institutional capital through verified climate assets on-chain."
  context: "Glow (120+ solar farms), GainForest (200K+ audiominutes, 50+ communities), Devonian (mobile biochar). Voluntary carbon market ($2B/yr) widely recognized as broken."

bottlenecks:
  - id: b4a
    label: "Decentralized coordination adds overhead — consensus & governance cost for physical ops"
    tooltip:
      title: "Coordination Overhead vs. Advantage"
      body: "Can decentralized coordination outperform centralized alternatives for physical infrastructure? Building solar farms and operating biochar furnaces are physical, operational challenges. Decentralization adds consensus and governance overhead."
      context: "The coordination advantage (global scale, community ownership, permissionless entry) is real but so is the coordination cost. Needs rigorous comparison against centralized operators, not assumption."
  - id: b4b
    label: "Composition value unproven — different markets, no unified buyer demand exists"
    tooltip:
      title: "Projects Don't Actually Compose"
      body: "Do these projects actually compose? The 'network-of-networks' vision assumes solar + biodiversity + carbon data is more valuable together. But the markets are different — energy buyers, carbon buyers, and biodiversity buyers barely exist as unified demand."
      context: "Network Coordination strand and regional proving grounds test whether composed data commands a premium. If composition value is zero, the network thesis collapses to individual project support."
  - id: b4c
    label: "AI verification may not meet institutional fiduciary evidentiary standards"
    tooltip:
      title: "AI Verification Does Not Equal Institutional Trust"
      body: "Is AI verification trustworthy enough for institutional capital? Institutional climate funds operate under fiduciary duty. 'An AI model says this solar farm generated X kWh' might not meet the evidentiary standard required."
      context: "Prize 3 produces a benchmark, but institutional acceptance requires more than accuracy — it requires auditability, liability frameworks, and regulatory recognition that don't yet exist."
  - id: b4d
    label: "Verra / Gold Standard have regulatory moats & institutional lock-in"
    tooltip:
      title: "Registry Regulatory Moats"
      body: "Can the carbon market be disrupted from outside existing registries? Verra and Gold Standard have regulatory relationships and institutional moats. Crypto-native verification might be technically superior but institutionally irrelevant."
      context: "Risk Register R11: Dual strategy — issue through legacy AND crypto channels simultaneously. Test whether crypto-verified credits trade at premium. If not, understand why before scaling."

gates:
  - id: g4q2
    label: "Open Verification Challenge launched with 20+ real projects enrolled and ground truth dataset published"
    quarter: Q2
    tooltip:
      title: "Q2 Gate: Challenge Enrollment"
      body: "Is there sufficient market interest to make the verification challenge meaningful? 20+ real projects with independent ground truth creates a robust benchmark."
      context: "The ground truth dataset is the key deliverable — it becomes a permanent public good regardless of which verification approach wins. If enrollment is below 10 projects, the benchmark lacks statistical power."
  - id: g4q3
    label: "At least 3 verification approaches produce comparable accuracy benchmarks on shared dataset"
    quarter: Q3
    tooltip:
      title: "Q3 Gate: Competitive Verification"
      body: "Are multiple approaches producing comparable results? If only 1 approach works, the field is too fragile. If 3+ converge, the methodology class is validated."
      context: "Diversity of approaches (IoT+crypto, satellite+AI, audio+ML, community+reputation, hybrid) tests whether verification is method-dependent or method-agnostic. Method-agnostic is far more valuable."
  - id: g4
    label: "Best verification approach outperforms legacy MRV on accuracy at lower cost across 20+ projects"
    quarter: Q4
    tooltip:
      title: "Q4 Gate: Climate Verification"
      body: "Does any verification approach outperform legacy MRV on accuracy at lower cost? Tested via open challenge with 20+ projects and independent ground truth."
      context: "If YES — award Prize 3, begin capital pathways. If NO — reassess whether centralized auditors are good enough."
  - id: g4q1next
    label: "First institutional climate fund accepts crypto-verified credits for portfolio allocation"
    quarter: "Q1 2026"
    tooltip:
      title: "Q1 2026 Gate: Institutional Capital Pathway"
      body: "Has any institutional climate fund — sovereign wealth, pension, endowment — accepted crypto-verified credits? This is the market validation that makes the technology economically self-sustaining."
      context: "The voluntary carbon market is $2B/yr. Institutional allocation requires not just accuracy but auditability, liability frameworks, and regulatory recognition. Prize 3 winners need institutional translation support."

strands:
  - id: s4a
    label: "Climate MRV Grants"
    sub: "IoT, satellite, audio, community, hybrid"
    tooltip:
      title: "Climate MRV Grants"
      body: "3–5 teams: IoT + cryptographic attestation, satellite + AI, audio + ML, community-based + reputation, hybrid. Open Verification Challenge."
      context: "Benchmark: verify 20+ real projects vs. ground truth. Dataset becomes public good."
  - id: s4b
    label: "Network Coordination"
    sub: "DePIN Summit, regional proving grounds"
    tooltip:
      title: "Network Coordination"
      body: "Climate projects operate in parallel, not concert. Summits, regional coordination, quarterly assessments make the network visible to itself."
      context: "Identify regions where projects overlap (solar + forest + biochar). Composed impact > individual."
  - id: s4c
    label: "Prize 3: Climate Verification"
    sub: "Grand challenge vs. ground truth benchmark"
    tooltip:
      title: "Prize 3: Climate Verification"
      body: "Most accurate, cost-effective verification across 20+ real-world climate projects vs. independent ground truth."
      context: "Awards: Grand Prize (accuracy), novel methodology, open-source toolkit, cross-domain composition."

interventions:
  - id: i1
    label: "ARIA-Style Grants"
    sub: "3–5 competing verification teams"
    strands: [s4a]
    tooltip:
      title: "ARIA-Style Grants"
      body: "8–12 seeds at $5–50K. Kill switches at Q2. Promotes Hypercerts/ATProto for reporting. Survivors feed prize pipeline."
      context: "ARIA model: compete, evaluate, kill underperformers, double down on winners."
  - id: i2
    label: "PL Breakthrough Prize"
    sub: "Prize 3: Climate Verification Grand Challenge"
    strands: [s4c]
    tooltip:
      title: "PL Breakthrough Prize"
      body: "Three milestone-based challenges at Q2: Sovereign Services, AI Capital Allocation, Climate Verification. Edge City as execution partner."
      context: "Prizes outperform grants when outcomes are definable but approaches are uncertain."
  - id: i3
    label: "Proving Ground Network"
    sub: "GainForest, Glow, Devonian as test sites"
    strands: [s4b]
    tooltip:
      title: "Proving Ground Network"
      body: "Real-world environments: Bhutan, Crecimiento, Edge City, climate communities. Each serves multiple IPs simultaneously."
      context: "Compounding: Edge City Bhutan — sovereign (IP.1) + governance (IP.3) + climate (IP.4)."
  - id: i4
    label: "Evidence Engine"
    sub: "Verification benchmark publications"
    strands: [s4a]
    tooltip:
      title: "Evidence Engine"
      body: "Quarterly reports, academic papers, 'Undeniable Traction' portfolio. Rigorous, honest, published openly."
      context: "When institutions ask 'what have you demonstrated?' — the answer is this portfolio."
  - id: i6
    label: "Hypercerts + ATProto"
    sub: "Climate sensor data fitness validation"
    strands: [s4a]
    tooltip:
      title: "Hypercerts + ATProto"
      body: "Leading hypothesis for coordination substrate. Validate fitness for climate sensor data, governance patterns, identity accumulation."
      context: "Hypothesis, not mandate. Prizes stack-agnostic. Monitor alternatives."
  - id: i7
    label: "Event Laboratories"
    sub: "Climate DePIN Summit co-location"
    strands: [s4b]
    tooltip:
      title: "Event Laboratories"
      body: "957+ practitioners across FtC, Edge City, and PL ecosystem events. Every event generates data, tests mechanisms, produces artifacts — not networking."
      context: "Each convening must produce: (1) brief, (2) pipeline, (3) owner. Designed to incentivize live, focused experimentation."

feedbackLoops:
  - id: fl4a
    from: s4b
    to: b4b
    label: "Network coordination tests whether composed data commands a premium"
  - id: fl4b
    from: s4c
    to: b4a
    label: "Verification standards reduce coordination overhead via benchmarks"
  - id: fl4c
    from: s4a
    to: b4c
    label: "MRV grant results build institutional evidence for AI verification"
  - id: fl4d
    from: s4b
    to: b4d
    label: "Network demonstrates viable alternative to legacy registries"
---

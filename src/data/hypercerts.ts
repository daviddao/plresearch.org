// Hypercerts of the Research Retreat editions, modeled on the
// `org.hypercerts.claim.activity` ATProto lexicon (hypercerts.org).
//
// The claims are PUBLISHED on the network under the plrd.org account
// (see scripts/publish-hypercerts.mjs). At request time the impact
// page re-hydrates the canonical claim fields from the hypercerts
// indexer (src/lib/hypercerts.ts); the entries below serve as the
// presentation overlay (photos, stats, curated evidence, funding
// economics) and as the offline fallback.
//
// See https://github.com/hypercerts-org/skills and
// https://www.hyperscan.dev/agents/guides/create-hypercert for the
// record shape these claims follow.

export type HypercertContributor = {
  name: string;
  role: string;
};

export type EvidenceKind =
  | "milestone"
  | "session"
  | "publication"
  | "artifact"
  | "release"
  | "other";

export type EvidenceEntry = {
  date: string; // ISO date
  dateLabel: string;
  kind: EvidenceKind;
  title: string;
  description: string;
  badge?: string;
  /**
   * Estimated Shapley influence of this evidence on the documented
   * social return: share of the total and the resized RoI it carries.
   */
  influence?: { share: number; amountUsd: number };
};

export type HypercertStatus = "past" | "live" | "upcoming";

/** One slice of the Shapley decomposition of the social return. */
export type RoiAttribution = {
  label: string;
  /** Shapley share of the documented social return (0–1). */
  share: number;
  amountUsd: number;
  /** Enabling retreat chain vs. documented community outcomes. */
  group: "retreat" | "community";
};

export type Hypercert = {
  /** Record key used as a stable identifier / anchor. */
  rkey: string;
  /** Lexicon collection this claim conforms to. */
  collection: "org.hypercerts.claim.activity";
  /** Where this edition sits in time — drives the carousel ribbon. */
  status: HypercertStatus;
  /**
   * Canonical https URI for this claim. Community evidence
   * (org.hypercerts.context.attachment) and comments
   * (org.impactindexer.review.comment) written to users' PDSs link this
   * URI, and the Constellation backlink index lets the static site
   * discover them without running a server.
   */
  subjectUri: string;
  /**
   * Optional published on-network claim record. Once the
   * org.hypercerts.claim.activity record exists on a PDS, fill this in
   * so evidence attachments can carry a proper strongRef subject.
   */
  claim?: { uri: string; cid: string };
  /**
   * True once the claim has been confirmed on the network via the
   * hypercerts indexer (set by src/lib/hypercerts.ts at request time).
   */
  published?: boolean;
  /**
   * ATProto account that published the claim record (plrd.org),
   * resolved from the claim DID via the public Bluesky AppView.
   */
  creator?: {
    did: string;
    handle: string | null;
    displayName: string | null;
    avatar: string | null;
  };
  /** Funding economics shown on the detail page (optional). */
  funding?: {
    costUsd: number;
    costLabel: string;
    roiLabel: string;
    roiNote: string;
    /**
     * Shapley attribution of the documented social return across the
     * evidence timeline (see the methodology note in the detail UI).
     * Shares sum to ~1 and map to the documented downstream value.
     */
    attribution?: RoiAttribution[];
  };
  // ── Claim record fields ─────────────────────────────────────
  title: string;
  shortDescription: string;
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  workScope: string[]; // free-form scope-of-work tags
  impactScope: string[]; // what the work is claimed to affect
  contributors: HypercertContributor[];
  rights: string;
  location: string;
  // ── Presentation ────────────────────────────────────────────
  image: string;
  imageAlt: string;
  imageCredit: string;
  dateLabel: string; // human-readable timeframe
  stats: { label: string; value: string }[];
  evidence: EvidenceEntry[]; // verifiable trail behind the claim
  /**
   * Shapley influence for live community evidence, matched by
   * case-insensitive substring against the entry title (first match
   * wins — order specific patterns before generic ones).
   */
  liveInfluence?: Array<{ match: string; share: number; amountUsd: number }>;
  href: string; // retreat detail page
};

export const HYPERCERTS: Hypercert[] = [
  {
    rkey: "ierr-2025",
    collection: "org.hypercerts.claim.activity",
    status: "past",
    subjectUri: "https://researchretreat.org/impact/ierr-2025",
    claim: {
      uri: "at://did:plc:pgwr6hkosgznfl5nz7egajei/org.hypercerts.claim.activity/ierr-2025",
      cid: "bafyreieiwf3qal3lqmlntbfvztqsegmicu6m6fzbyi6msjar5fn4oksnxy",
    },
    funding: {
      costUsd: 140_000,
      costLabel: "$140k",
      roiLabel: "20×",
      roiNote:
        "The Iceland edition cost 140,000 USD to run. It seeded the Hypercerts v2 redesign that raised about 2.2M USD from 12,000 donors, helped close the GG24 Deep Funding (400K matching pool) and AI4PG (150K) rounds, and launched Simocracy, which now governs more than 50K of funding. Roughly a 20× social return on investment so far, documented as attachment records in the timeline below.",
      // Exact Shapley values over a counterfactual model with
      // outcome-specific causal channels: every documented outcome is
      // causally downstream of the retreat. The 22 works are the
      // thinking pieces the GG24 forum used (and the IERR artifact by
      // Sharfy & the ATProto cohort that pushed the Hypercerts v2
      // deploy, reinforced by the Berlin redesign workshop that
      // resulted from Iceland). Execution evidence is discounted —
      // documentation is not causation, and the Hypercerts v2 work
      // predates the retreat. Shares sum to the documented ~$2.8M.
      attribution: [
        { label: "Cohort convened in Reykjavík", share: 0.315, amountUsd: 883_000, group: "retreat" },
        { label: "12 days of working sessions", share: 0.147, amountUsd: 413_000, group: "retreat" },
        { label: "22 works — thinking pieces & IERR artifact", share: 0.203, amountUsd: 569_000, group: "retreat" },
        { label: "Open-access proceedings", share: 0.07, amountUsd: 195_000, group: "retreat" },
        { label: "Continued collabs incl. Berlin redesign workshop", share: 0.156, amountUsd: 436_000, group: "retreat" },
        { label: "Hypercerts v2 deploy & raise (≈$2.2M)", share: 0.082, amountUsd: 231_000, group: "community" },
        { label: "GG24 Deep Funding ($400k pool)", share: 0.016, amountUsd: 45_000, group: "community" },
        { label: "AI4PG launch ($150k)", share: 0.006, amountUsd: 18_000, group: "community" },
        { label: "Simocracy launch (>$50k)", share: 0.004, amountUsd: 10_000, group: "community" },
      ],
    },
    title: "IERR 2025 · Impact Evaluator Research Retreat",
    shortDescription:
      "Two-week research retreat in Reykjavík, Iceland producing 22 published works on impact evaluators, evaluation mechanisms, and public goods funding.",
    description:
      "A two-week intensive residency in Reykjavík, Iceland exploring the Impact Evaluator framework. 23 researchers developed design principles and robustness metrics for IEs, documented implementations in the wild, and prototyped new scopes, measurement, evaluation, and reward functions. They published 22 open-access works into the retreat proceedings.",
    startDate: "2025-07-26",
    endDate: "2025-08-10",
    workScope: [
      "impact evaluation",
      "mechanism design",
      "public goods funding",
      "decentralized science",
    ],
    impactScope: ["open research", "IE framework", "retreat proceedings"],
    contributors: [
      { name: "Juan Benet", role: "Founder, Protocol Labs" },
      { name: "Molly MacKinley", role: "CEO, FilOz" },
      { name: "David Dao", role: "Chief Scientist, GainForest.Earth" },
      { name: "Sejal Rekhan", role: "Innovation Catalyst, Allo.Capital" },
      { name: "Nidhi Harihar", role: "Co-Founder, VoiceDeck" },
      { name: "Devansh Mehta", role: "AI & Governance Lead, Ethereum Foundation" },
      { name: "23 retreat researchers", role: "Authors of the proceedings" },
    ],
    rights: "Public display · open-access proceedings",
    location: "Reykjavík, Iceland",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Reykjavik_skyline_%284046575309%29.jpg/1920px-Reykjavik_skyline_%284046575309%29.jpg",
    imageAlt: "Reykjavík and the Esja mountain range, venue of IERR 2025",
    imageCredit: "Reykjavík, Iceland",
    dateLabel: "Jul 26 – Aug 10, 2025",
    stats: [
      { label: "Social RoI", value: "20×" },
      { label: "Invested", value: "$140k" },
      { label: "Published works", value: "22" },
      { label: "Researchers", value: "23" },
    ],
    evidence: [
      {
        date: "2025-07-26",
        dateLabel: "Jul 26, 2025",
        kind: "milestone",
        title: "Cohort convened in Reykjavík",
        influence: { share: 0.315, amountUsd: 883_000 },
        description:
          "23 researchers and practitioners arrived in Reykjavík to open the two-week Impact Evaluator Research Retreat, setting the agenda across IE design, measurement, and reward functions.",
        badge: "23 researchers",
      },
      {
        date: "2025-07-28",
        dateLabel: "Jul 28 – Aug 8, 2025",
        kind: "session",
        title: "Daily working sessions on the IE framework",
        influence: { share: 0.147, amountUsd: 413_000 },
        description:
          "Structured sessions and breakout tracks drafted design principles and robustness metrics for impact evaluators, and documented implementations observed in the wild.",
        badge: "12 days",
      },
      {
        date: "2025-08-09",
        dateLabel: "Aug 9, 2025",
        kind: "publication",
        title: "22 works submitted to the proceedings",
        influence: { share: 0.203, amountUsd: 569_000 },
        description:
          "Participants finalized 22 papers, write-ups, and open-source implementations spanning impact evaluation, mechanism design, and public goods funding.",
        badge: "22 works",
      },
      {
        date: "2025-08-10",
        dateLabel: "Aug 10, 2025",
        kind: "release",
        title: "Open-access proceedings released",
        influence: { share: 0.07, amountUsd: 195_000 },
        description:
          "The full retreat proceedings were published open-access, closing IERR 2025 and seeding the next round of impact-evaluation research.",
        badge: "open access",
      },
      {
        date: "2025-08-10",
        dateLabel: "Aug 2025",
        kind: "milestone",
        title: "Participants report an outstanding experience",
        influence: { share: 0.156, amountUsd: 436_000 },
        description:
          "Post-retreat feedback from the cohort was overwhelmingly positive. Researchers described the retreat as one of the most productive research environments they had worked in, and many kept collaborating after leaving Iceland.",
        badge: "cohort feedback",
      },
    ],
    liveInfluence: [
      { match: "AI4PG", share: 0.006, amountUsd: 18_000 },
      { match: "GG24", share: 0.016, amountUsd: 45_000 },
      { match: "Hypercerts v2", share: 0.082, amountUsd: 231_000 },
      { match: "Simocracy", share: 0.004, amountUsd: 10_000 },
    ],
    href: "https://www.researchretreat.org/ierr-2025/",
  },
  {
    rkey: "dacc-2025",
    collection: "org.hypercerts.claim.activity",
    status: "past",
    subjectUri: "https://researchretreat.org/impact/dacc-2025",
    claim: {
      uri: "at://did:plc:pgwr6hkosgznfl5nz7egajei/org.hypercerts.claim.activity/dacc-2025",
      cid: "bafyreibp66d4r7o4vz76nlxsz3fuz3cjxslw6pj2wvdfhfkdcrguajhcva",
    },
    title: "d/acc Residency · Edge City Patagonia",
    shortDescription:
      "Four-week residency in San Martín de los Andes prototyping d/acc projects across AI, governance, cybersecurity, and resource allocation inside Edge City's popup village.",
    description:
      "A 4-week residency hosted by Protocol Labs in which residents prototyped projects across AI, robotics, governance systems, self-sovereign tools, cybersecurity, resource allocation, and information integrity, testing d/acc ideas directly inside Edge City's popup village in Patagonia. 6 artifacts were published to the proceedings.",
    startDate: "2025-10-18",
    endDate: "2025-11-15",
    workScope: [
      "d/acc",
      "AI & governance",
      "cybersecurity",
      "self-sovereign tools",
      "resource allocation",
    ],
    impactScope: ["defensive acceleration", "open prototypes", "residency artifacts"],
    contributors: [
      { name: "Protocol Labs", role: "Host" },
      { name: "Edge City", role: "Popup village venue" },
      { name: "7 residency builders", role: "Authors of the artifacts" },
    ],
    rights: "Public display · open-source artifacts",
    location: "San Martín de los Andes, Argentina",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Sunlit Andean mountain valley in Patagonia, Argentina",
    imageCredit: "Patagonia, Argentina",
    dateLabel: "Oct 18 – Nov 15, 2025",
    stats: [
      { label: "Artifacts", value: "6" },
      { label: "Builders", value: "7" },
      { label: "Weeks", value: "4" },
    ],
    evidence: [
      {
        date: "2025-10-18",
        dateLabel: "Oct 18, 2025",
        kind: "milestone",
        title: "Residency opens inside Edge City Patagonia",
        description:
          "Builders joined the Edge City popup village in San Martín de los Andes to begin a four-week d/acc residency hosted by Protocol Labs.",
        badge: "7 builders",
      },
      {
        date: "2025-10-20",
        dateLabel: "Oct 20 – Nov 12, 2025",
        kind: "session",
        title: "Prototyping sprints across d/acc tracks",
        description:
          "Residents prototyped across AI, robotics, governance, self-sovereign tools, cybersecurity, resource allocation, and information integrity, testing d/acc ideas in the field.",
        badge: "7 tracks",
      },
      {
        date: "2025-11-13",
        dateLabel: "Nov 13, 2025",
        kind: "artifact",
        title: "6 artifacts shipped",
        description:
          "The cohort shipped six open prototypes and write-ups documenting their d/acc experiments during the residency.",
        badge: "6 artifacts",
      },
      {
        date: "2025-11-15",
        dateLabel: "Nov 15, 2025",
        kind: "release",
        title: "Demo day & artifact handoff",
        description:
          "Residents presented their work and released their artifacts open-source, closing the d/acc residency at Edge City Patagonia.",
        badge: "open source",
      },
    ],
    href: "https://www.researchretreat.org/dacc-residency/",
  },
  {
    rkey: "rr-2026",
    collection: "org.hypercerts.claim.activity",
    status: "upcoming",
    subjectUri: "https://researchretreat.org/impact/rr-2026",
    claim: {
      uri: "at://did:plc:pgwr6hkosgznfl5nz7egajei/org.hypercerts.claim.activity/rr-2026",
      cid: "bafyreiadvrwfuptavjurzrauqawbxnj3r4szoy7yz6q6c6idf43ws2ndjm",
    },
    title: "Research Retreat 2026 · Next Edition",
    shortDescription:
      "The next Research Retreat edition, now in planning. Same research agenda, new cohort, new venue, open proceedings.",
    description:
      "The 2026 edition of the Research Retreat is in planning. Building on IERR 2025 and the d/acc residency, the next retreat will convene a new cohort of researchers and builders for another intensive residency. Venue and dates will be announced. Its hypercert will be claimed here once the retreat concludes, and the evidence timeline will fill in as the edition takes shape.",
    startDate: "2026-07-01",
    endDate: "2026-08-31",
    workScope: [
      "impact evaluation",
      "mechanism design",
      "public goods funding",
    ],
    impactScope: ["open research", "next cohort", "future proceedings"],
    contributors: [
      { name: "Research Retreat", role: "Organizer" },
      { name: "Cohort TBA", role: "Researchers & builders" },
    ],
    rights: "Public display · to be claimed",
    location: "Venue TBA",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Mountain ridge at dawn, venue of the next Research Retreat to be announced",
    imageCredit: "Next edition · venue TBA",
    dateLabel: "2026 · TBA",
    stats: [
      { label: "Edition", value: "2026" },
      { label: "Cohort", value: "TBA" },
    ],
    evidence: [
      {
        date: "2026-01-01",
        dateLabel: "2026",
        kind: "milestone",
        title: "Planning underway",
        description:
          "The next Research Retreat edition is being scoped. Venue, dates, and cohort will be announced here. Sign in with ATProto to leave suggestions and evidence as the edition takes shape.",
        badge: "in planning",
      },
    ],
    href: "https://www.researchretreat.org/",
  },
];

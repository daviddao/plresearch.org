// One-off: publish the Research Retreat hypercerts as
// org.hypercerts.claim.activity records under the plrd.org account,
// so the /areas/economies-governance/impact/hypercerts page can read
// them from the hypercerts indexer instead of hardcoded data.
//
// Record shape follows https://www.hyperscan.dev/agents/guides/create-hypercert
// Rkeys are stable (ierr-2025, dacc-2025, rr-2026) so presentation
// extras (photos, stats, curated evidence) can join by rkey.
//
// Usage: node scripts/publish-hypercerts.mjs [--delete]

import { AtpAgent } from '@atproto/api'
import fs from 'node:fs'

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)

// Note: the PDS accepts "plrd.org" as the login identifier (the
// .env's "plresearch.org" alias is rejected by createSession).
const HANDLE = 'plrd.org'
const PASSWORD = env.ATPROTO_PASSWORD
if (!HANDLE || !PASSWORD) {
  console.error('ATPROTO_HANDLE / ATPROTO_PASSWORD missing from .env')
  process.exit(1)
}

const CLAIMS = [
  {
    rkey: 'ierr-2025',
    record: {
      $type: 'org.hypercerts.claim.activity',
      title: 'IERR 2025 · Impact Evaluator Research Retreat',
      shortDescription:
        'Two-week research retreat in Reykjavík, Iceland producing 22 published works on impact evaluators, evaluation mechanisms, and public goods funding.',
      description:
        'A two-week intensive residency in Reykjavík, Iceland exploring the Impact Evaluator framework. 23 researchers developed design principles and robustness metrics for IEs, documented implementations in the wild, and prototyped new scopes, measurement, evaluation, and reward functions. They published 22 open-access works into the retreat proceedings.',
      startDate: '2025-07-26T00:00:00.000Z',
      endDate: '2025-08-10T00:00:00.000Z',
      workScope:
        'impact evaluation, mechanism design, public goods funding, decentralized science',
      contributors: [
        { contributorIdentity: 'Juan Benet', contributionDetails: 'Founder, Protocol Labs' },
        { contributorIdentity: 'Molly MacKinley', contributionDetails: 'CEO, FilOz' },
        { contributorIdentity: 'David Dao', contributionDetails: 'Chief Scientist, GainForest.Earth' },
        { contributorIdentity: 'Sejal Rekhan', contributionDetails: 'Innovation Catalyst, Allo.Capital' },
        { contributorIdentity: 'Nidhi Harihar', contributionDetails: 'Co-Founder, VoiceDeck' },
        { contributorIdentity: 'Devansh Mehta', contributionDetails: 'AI & Governance Lead, Ethereum Foundation' },
        { contributorIdentity: '23 retreat researchers', contributionDetails: 'Authors of the proceedings' },
      ],
      image: {
        uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Reykjavik_skyline_%284046575309%29.jpg/1920px-Reykjavik_skyline_%284046575309%29.jpg',
      },
      createdAt: new Date().toISOString(),
    },
  },
  {
    rkey: 'dacc-2025',
    record: {
      $type: 'org.hypercerts.claim.activity',
      title: 'd/acc Residency · Edge City Patagonia',
      shortDescription:
        "Four-week residency in San Martín de los Andes prototyping d/acc projects across AI, governance, cybersecurity, and resource allocation inside Edge City's popup village.",
      description:
        "A 4-week residency hosted by Protocol Labs in which residents prototyped projects across AI, robotics, governance systems, self-sovereign tools, cybersecurity, resource allocation, and information integrity, testing d/acc ideas directly inside Edge City's popup village in Patagonia. 6 artifacts were published to the proceedings.",
      startDate: '2025-10-18T00:00:00.000Z',
      endDate: '2025-11-15T00:00:00.000Z',
      workScope:
        'd/acc, AI & governance, cybersecurity, self-sovereign tools, resource allocation',
      contributors: [
        { contributorIdentity: 'Protocol Labs', contributionDetails: 'Host' },
        { contributorIdentity: 'Edge City', contributionDetails: 'Popup village venue' },
        { contributorIdentity: '7 residency builders', contributionDetails: 'Authors of the artifacts' },
      ],
      image: {
        uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
      },
      createdAt: new Date().toISOString(),
    },
  },
  {
    rkey: 'rr-2026',
    record: {
      $type: 'org.hypercerts.claim.activity',
      title: 'Research Retreat 2026 · Next Edition',
      shortDescription:
        'The next Research Retreat edition, now in planning. Same research agenda, new cohort, new venue, open proceedings.',
      description:
        'The 2026 edition of the Research Retreat is in planning. Building on IERR 2025 and the d/acc residency, the next retreat will convene a new cohort of researchers and builders for another intensive residency. Venue and dates will be announced. Its hypercert will be claimed here once the retreat concludes, and the evidence timeline will fill in as the edition takes shape.',
      startDate: '2026-07-01T00:00:00.000Z',
      endDate: '2026-08-31T00:00:00.000Z',
      workScope: 'impact evaluation, mechanism design, public goods funding',
      contributors: [
        { contributorIdentity: 'Research Retreat', contributionDetails: 'Organizer' },
        { contributorIdentity: 'Cohort TBA', contributionDetails: 'Researchers & builders' },
      ],
      image: {
        uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
      },
      createdAt: new Date().toISOString(),
    },
  },
]

async function main() {
  // Resolve the account's PDS from its DID doc so we log in at the
  // right service.
  const { did } = await (
    await fetch(
      `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${HANDLE}`,
    )
  ).json()
  const doc = await (await fetch(`https://plc.directory/${did}`)).json()
  const pds = doc.service.find((s) => s.id === '#atproto_pds').serviceEndpoint
  console.log(`Account ${HANDLE} (${did}) on ${pds}`)

  const agent = new AtpAgent({ service: pds })
  await agent.login({ identifier: HANDLE, password: PASSWORD })

  if (process.argv.includes('--delete')) {
    for (const { rkey } of CLAIMS) {
      await agent.com.atproto.repo
        .deleteRecord({ repo: did, collection: 'org.hypercerts.claim.activity', rkey })
        .then(() => console.log('deleted', rkey))
        .catch((e) => console.log('delete skipped', rkey, e.message))
    }
    return
  }

  for (const { rkey, record } of CLAIMS) {
    const res = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: 'org.hypercerts.claim.activity',
      rkey,
      record,
    })
    console.log('created', res.data.uri, res.data.cid)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

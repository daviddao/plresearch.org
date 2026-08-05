import "server-only"

// Published Research Retreat hypercerts, read from the hypercerts
// indexer (same Hyperindex family as the Simocracy indexer used by
// lib/simocracy.ts — it ingests `org.hypercerts.claim.activity`
// records from the whole ATProto network).
//
// The claims live on the plrd.org PDS (published by
// scripts/publish-hypercerts.mjs with stable rkeys). The indexer is
// the source of truth for the canonical claim fields; the local
// entries in src/data/hypercerts.ts contribute presentation extras
// (photos, stats, curated evidence, funding economics) and act as the
// fallback when the indexer is unreachable.

import { HYPERCERTS, type Hypercert } from "@/data/hypercerts"

const PLRD_DID = "did:plc:pgwr6hkosgznfl5nz7egajei"

function graphqlEndpoint(url: string) {
  const trimmed = url.replace(/\/+$/, "")
  return trimmed.endsWith("/graphql") ? trimmed : `${trimmed}/graphql`
}

const HYPERCERTS_INDEXER_URL = graphqlEndpoint(
  process.env.HYPERCERTS_INDEXER_URL ??
    process.env.SIMOCRACY_INDEXER_URL ??
    "https://simocracy-indexer-production.up.railway.app",
)

type IndexedClaim = {
  uri: string
  cid: string | null
  title: string | null
  shortDescription: string | null
  description: { value?: string | null } | null
  startDate: string | null
  endDate: string | null
  workScope: { scope?: string | null } | null
  contributors: Array<{
    contributorIdentity: string | null
    contributionDetails: string | null
  }> | null
  image: { uri?: string | null } | null
}

const CLAIMS_QUERY = /* GraphQL */ `
  query ResearchRetreatClaims($did: String!) {
    orgHypercertsClaimActivity(where: { did: { eq: $did } }, first: 50) {
      edges {
        node {
          uri
          cid
          title
          shortDescription
          description {
            ... on OrgHypercertsDefsDescriptionString {
              value
            }
          }
          startDate
          endDate
          workScope {
            ... on OrgHypercertsClaimActivityWorkScopeString {
              scope
            }
          }
          contributors {
            contributorIdentity
            contributionDetails
          }
          image {
            ... on OrgHypercertsDefsUri {
              uri
            }
          }
        }
      }
    }
  }
`

async function fetchIndexedClaims(): Promise<Map<string, IndexedClaim>> {
  const out = new Map<string, IndexedClaim>()
  try {
    const res = await fetch(HYPERCERTS_INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: CLAIMS_QUERY, variables: { did: PLRD_DID } }),
      next: { revalidate: 300, tags: ["hypercerts"] },
    })
    if (!res.ok) return out
    const json = (await res.json()) as {
      data?: {
        orgHypercertsClaimActivity?: { edges?: Array<{ node: IndexedClaim }> }
      }
      errors?: unknown
    }
    if (json.errors) {
      console.error("[hypercerts] indexer errors:", json.errors)
    }
    for (const edge of json.data?.orgHypercertsClaimActivity?.edges ?? []) {
      const rkey = edge.node.uri.split("/").pop()
      if (rkey) out.set(rkey, edge.node)
    }
  } catch (err) {
    console.error("[hypercerts] indexer fetch failed:", err)
  }
  return out
}

/** ISO datetime → plain ISO date (what the UI renders). */
function isoDate(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  const m = value.match(/^\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : fallback
}

/**
 * The Research Retreat hypercerts: canonical claim fields from the
 * indexer, layered over the local presentation entries. Falls back to
 * the local data wholesale when the indexer has nothing for a claim.
 */
export async function fetchResearchRetreatHypercerts(): Promise<Hypercert[]> {
  const indexed = await fetchIndexedClaims()
  return HYPERCERTS.map((cert) => {
    const claim = indexed.get(cert.rkey)
    if (!claim) return cert
    const workScope = claim.workScope?.scope
      ? claim.workScope.scope.split(",").map((s) => s.trim()).filter(Boolean)
      : cert.workScope
    const contributors = claim.contributors?.length
      ? claim.contributors.map((c, i) => ({
          name:
            typeof c.contributorIdentity === "string" && c.contributorIdentity
              ? c.contributorIdentity
              : cert.contributors[i]?.name ?? "Contributor",
          role: c.contributionDetails ?? cert.contributors[i]?.role ?? "",
        }))
      : cert.contributors
    return {
      ...cert,
      title: claim.title ?? cert.title,
      shortDescription: claim.shortDescription ?? cert.shortDescription,
      description: claim.description?.value ?? cert.description,
      startDate: isoDate(claim.startDate, cert.startDate),
      endDate: isoDate(claim.endDate, cert.endDate),
      workScope,
      contributors,
      image: claim.image?.uri ?? cert.image,
      claim: {
        uri: claim.uri,
        cid: claim.cid ?? cert.claim?.cid ?? "",
      },
      /** Live from the network — flips the provenance copy in the UI. */
      published: true,
    }
  })
}

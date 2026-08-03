// Pure validation + rendering-invariant helpers for contribution claims.
// Mirrors src/lib/contribution-claims.ts so the same rules can be unit-tested
// with `node --test` (the repo's test runner) without a TS toolchain.

export const TIER_SHORT = {
  1: 'Coincidence',
  2: 'Traced chain',
  3: 'Counterparty testimony',
  4: 'Comparison group',
  5: 'Randomized',
}

export function tierLabel(tier) {
  return TIER_SHORT[tier]
}

/**
 * The only testimony selector the UI uses. It never filters, so an adverse
 * entry (wouldHaveHappenedAnyway=true) always renders alongside the rest.
 */
export function visibleTestimony(claim) {
  return claim.testimony ?? []
}

/** Claims are never hidden by status. */
export function isClaimRendered() {
  return true
}

/** A retrospective claim must show a visible marker; never pre-registered. */
export function retrospectiveMarker(claim) {
  return claim.retrospective === true
}

/** Returns an array of validation errors (empty = valid). */
export function validateClaim(c) {
  const errs = []
  const where = c.id ?? '(unnamed claim)'
  const testimony = c.testimony ?? []

  if (c.tier >= 3 && testimony.length < 1) {
    errs.push(`${where}: tier ${c.tier} requires at least one testimony entry`)
  }
  if (testimony.length > 0 && testimony.every((t) => t.wouldHaveHappenedAnyway) && c.confidence === 'high') {
    errs.push(`${where}: all testimony says it would have happened anyway; confidence may not be 'high'`)
  }
  if ((c.status === 'not_supported' || c.status === 'withdrawn') && !c.statusReason) {
    errs.push(`${where}: status '${c.status}' requires a statusReason`)
  }
  if (c.registeredAt > c.asOf) {
    errs.push(`${where}: registeredAt (${c.registeredAt}) must be <= asOf (${c.asOf})`)
  }
  return errs
}

export function tallyClaims(claims) {
  return {
    n: claims.length,
    tier1: claims.filter((c) => c.tier === 1).length,
    tier2: claims.filter((c) => c.tier === 2).length,
    tier3plus: claims.filter((c) => c.tier >= 3).length,
    counterfactualsTested: claims.filter((c) => c.counterfactualClaim != null).length,
    withdrawnOrNotSupported: claims.filter(
      (c) => c.status === 'withdrawn' || c.status === 'not_supported',
    ).length,
  }
}

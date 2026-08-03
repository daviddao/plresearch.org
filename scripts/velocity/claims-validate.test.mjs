// Unit tests for the contribution-claim rules. Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateClaim,
  visibleTestimony,
  isClaimRendered,
  retrospectiveMarker,
  tallyClaims,
  tierLabel,
} from './claims-validate.mjs'

const base = {
  id: 'claim-x',
  tier: 2,
  confidence: 'low',
  status: 'open',
  counterfactualClaim: null,
  retrospective: true,
  registeredAt: '2026-08-03',
  asOf: '2026-08-03',
}

test('a seeded tier-2 claim with no testimony is valid', () => {
  assert.deepEqual(validateClaim(base), [])
})

test('tier >= 3 requires at least one testimony entry', () => {
  const errs = validateClaim({ ...base, tier: 3 })
  assert.equal(errs.length, 1)
  assert.match(errs[0], /requires at least one testimony/)
  // With testimony present, the tier-3 rule passes.
  assert.deepEqual(
    validateClaim({
      ...base,
      tier: 3,
      confidence: 'moderate',
      testimony: [{ source: 'A', role: 'grantee', quote: 'q', wouldHaveHappenedAnyway: false }],
    }),
    [],
  )
})

test('adverse testimony (wouldHaveHappenedAnyway) always renders, equal to the rest', () => {
  const claim = {
    ...base,
    testimony: [
      { source: 'A', role: 'grantee', quote: 'helped', wouldHaveHappenedAnyway: false },
      { source: 'B', role: 'funder', quote: 'we would have anyway', wouldHaveHappenedAnyway: true },
    ],
  }
  const shown = visibleTestimony(claim)
  assert.equal(shown.length, 2, 'both testimony entries render')
  assert.ok(
    shown.some((t) => t.wouldHaveHappenedAnyway === true),
    'the adverse entry is not filtered out',
  )
})

test('if every testimony says it would have happened anyway, confidence may not be high', () => {
  const claim = {
    ...base,
    tier: 3,
    confidence: 'high',
    testimony: [
      { source: 'A', role: 'grantee', quote: 'anyway', wouldHaveHappenedAnyway: true },
      { source: 'B', role: 'funder', quote: 'anyway', wouldHaveHappenedAnyway: true },
    ],
  }
  const errs = validateClaim(claim)
  assert.ok(errs.some((e) => /confidence may not be 'high'/.test(e)))
  // moderate is allowed
  assert.deepEqual(validateClaim({ ...claim, confidence: 'moderate' }), [])
})

test("not_supported and withdrawn require a statusReason, and stay rendered", () => {
  for (const status of ['not_supported', 'withdrawn']) {
    const missing = validateClaim({ ...base, status })
    assert.ok(missing.some((e) => /requires a statusReason/.test(e)), `${status} needs a reason`)
    const ok = validateClaim({ ...base, status, statusReason: 'field moved another way' })
    assert.deepEqual(ok, [])
    // never hidden
    assert.equal(isClaimRendered({ ...base, status }), true)
  }
})

test('registeredAt must be <= asOf', () => {
  const errs = validateClaim({ ...base, registeredAt: '2026-08-04', asOf: '2026-08-03' })
  assert.ok(errs.some((e) => /must be <= asOf/.test(e)))
})

test('retrospective claims carry a visible marker', () => {
  assert.equal(retrospectiveMarker({ ...base, retrospective: true }), true)
  assert.equal(retrospectiveMarker({ ...base, retrospective: false }), false)
})

test('tally counts tiers, counterfactuals tested, and withdrawn/not-supported', () => {
  const claims = [
    { ...base, tier: 1 },
    { ...base, tier: 2 },
    { ...base, tier: 2 },
    { ...base, tier: 4, testimony: [{ source: 'A', role: 'r', quote: 'q', wouldHaveHappenedAnyway: false }] },
    { ...base, tier: 1, counterfactualClaim: 'would not have shipped without our rail' },
    { ...base, tier: 1, status: 'withdrawn', statusReason: 'superseded' },
  ]
  const t = tallyClaims(claims)
  assert.equal(t.n, 6)
  assert.equal(t.tier1, 3)
  assert.equal(t.tier2, 2)
  assert.equal(t.tier3plus, 1)
  assert.equal(t.counterfactualsTested, 1)
  assert.equal(t.withdrawnOrNotSupported, 1)
})

test('tier labels match the badge copy', () => {
  assert.equal(tierLabel(1), 'Coincidence')
  assert.equal(tierLabel(2), 'Traced chain')
  assert.equal(tierLabel(3), 'Counterparty testimony')
  assert.equal(tierLabel(4), 'Comparison group')
  assert.equal(tierLabel(5), 'Randomized')
})

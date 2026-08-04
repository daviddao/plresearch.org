// Unit tests for the idea-vintage direction + changepoint math. `node --test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ideaVintageDirection,
  ideaVintageChangepoint,
  windowMeans,
} from './vintage-direction.mjs'

// Build a monotone (perfectly linear) reliable series of length n.
function line(startYear, n, y0, slope) {
  return Array.from({ length: n }, (_, i) => ({ x: startYear + i, y: y0 + i * slope }))
}

test('a long, clearly falling median reference age reads as accelerating (inverted sign)', () => {
  // 12 reliable years, falling ~0.4y per year: well outside the noise band.
  const pts = line(2011, 12, 12, -0.4)
  assert.equal(ideaVintageDirection(pts), 'accelerating')
})

test('a long, clearly rising median reference age reads as decelerating', () => {
  const pts = line(2011, 12, 6, 0.4)
  assert.equal(ideaVintageDirection(pts), 'decelerating')
})

test('a monotone flat series reads as flat, not a spurious direction', () => {
  const pts = line(2011, 12, 8, 0) // dead level
  assert.equal(ideaVintageDirection(pts), 'flat')
})

test('a pure-noise series returns unclear (cannot distinguish slope from zero)', () => {
  // Deterministic pseudo-noise around 8y, no trend: wide slope CI straddling 0.
  const noise = [1, -2, 2, -1, 3, -3, 1, -1, 2, -2, 0, 1, -1, 2, -2]
  const pts = noise.map((d, i) => ({ x: 2008 + i, y: 8 + d }))
  assert.equal(ideaVintageDirection(pts), 'unclear')
})

test('fewer than ten reliable points is unclear regardless of shape', () => {
  const pts = line(2016, 8, 12, -0.5) // strong signal but too short
  assert.equal(ideaVintageDirection(pts), 'unclear')
})

test('changepoint detects a real break and reads the recent segment', () => {
  // Rising for eight years, then falling for eight: recent segment falls.
  const up = line(2004, 8, 5, 0.5)
  const down = line(2012, 8, up[up.length - 1].y, -0.5)
  const pts = [...up, ...down]
  const cp = ideaVintageChangepoint(pts)
  assert.ok(cp, 'expected a changepoint object')
  assert.equal(cp.improved, true)
  assert.ok(cp.slopeBefore > 0 && cp.slopeAfter < 0, 'segments should have opposite signs')
  // Direction reads the recent (falling) segment → accelerating.
  assert.equal(ideaVintageDirection(pts), 'accelerating')
})

test('no changepoint on a single straight line', () => {
  const cp = ideaVintageChangepoint(line(2005, 16, 10, -0.2))
  assert.equal(cp.improved, false)
})

test('windowMeans still averages the first and last w points (kept for other call sites)', () => {
  const m = windowMeans(
    [
      { x: 2005, y: 6 },
      { x: 2006, y: 6 },
      { x: 2007, y: 6 },
      { x: 2021, y: 9 },
      { x: 2022, y: 9 },
      { x: 2023, y: 9 },
    ],
    3,
  )
  assert.equal(m.early, 6)
  assert.equal(m.late, 9)
  assert.deepEqual(m.earlyRange, [2005, 2007])
  assert.deepEqual(m.lateRange, [2021, 2023])
})

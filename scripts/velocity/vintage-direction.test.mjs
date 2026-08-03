// Unit test for the inverted idea-vintage direction. Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ideaVintageDirection, windowMeans } from './vintage-direction.mjs'

test('a clearly falling median reference age reads as accelerating (sign is inverted)', () => {
  const pts = [
    { x: 2016, y: 12 },
    { x: 2017, y: 11 },
    { x: 2018, y: 10 },
    { x: 2019, y: 9 },
    { x: 2020, y: 8 },
  ]
  assert.equal(ideaVintageDirection(pts), 'accelerating')
})

test('a clearly rising median reference age reads as decelerating', () => {
  const pts = [
    { x: 2016, y: 8 },
    { x: 2017, y: 9 },
    { x: 2018, y: 10 },
    { x: 2019, y: 11 },
    { x: 2020, y: 12 },
  ]
  assert.equal(ideaVintageDirection(pts), 'decelerating')
})

test('a small, in-noise change reads as flat (this was the E&G bug: 6y->7y is not "accelerating")', () => {
  // Mimics the noisy E&G series: bounces 5-8y, early mean ~ late mean.
  const pts = [
    { x: 2005, y: 6 },
    { x: 2006, y: 5 },
    { x: 2007, y: 7 },
    { x: 2019, y: 8 },
    { x: 2020, y: 5 },
    { x: 2021, y: 7 },
    { x: 2022, y: 6 },
    { x: 2023, y: 7 },
  ]
  assert.equal(ideaVintageDirection(pts), 'flat')
})

test('fewer than two points is unclear', () => {
  assert.equal(ideaVintageDirection([{ x: 2022, y: 10 }]), 'unclear')
})

test('windowMeans averages the first and last w points', () => {
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

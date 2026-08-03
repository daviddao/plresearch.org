// Unit test for the inverted idea-vintage direction. Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ideaVintageDirection, trailingSlope } from './vintage-direction.mjs'

test('falling median reference age reads as accelerating (sign is inverted)', () => {
  const pts = [
    { x: 2018, y: 12 },
    { x: 2019, y: 11 },
    { x: 2020, y: 10 },
    { x: 2021, y: 9 },
    { x: 2022, y: 8 },
  ]
  assert.ok(trailingSlope(pts) < 0, 'raw slope is negative for a falling series')
  assert.equal(ideaVintageDirection(pts), 'accelerating')
})

test('rising median reference age reads as decelerating', () => {
  const pts = [
    { x: 2018, y: 8 },
    { x: 2019, y: 9 },
    { x: 2020, y: 10 },
    { x: 2021, y: 11 },
    { x: 2022, y: 12 },
  ]
  assert.equal(ideaVintageDirection(pts), 'decelerating')
})

test('a flat median reads as flat', () => {
  const pts = [
    { x: 2018, y: 10 },
    { x: 2019, y: 10.01 },
    { x: 2020, y: 9.99 },
    { x: 2021, y: 10 },
    { x: 2022, y: 10.0 },
  ]
  assert.equal(ideaVintageDirection(pts), 'flat')
})

test('fewer than two points is unclear', () => {
  assert.equal(ideaVintageDirection([{ x: 2022, y: 10 }]), 'unclear')
})

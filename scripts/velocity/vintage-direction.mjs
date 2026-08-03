// Direction math for the idea-vintage instrument.
//
// The sign is INVERTED for this instrument: a FALLING median reference age means
// new work is building on fresher ideas, i.e. the field is ACCELERATING.
//
// The series is a noisy sampled estimate, so we do NOT read a single-year slope
// or two raw endpoints (those contradict each other and over-claim). Instead we
// compare the MEAN of the earliest few reliable years against the MEAN of the
// most recent few, and only call a direction when the shift clears a flat band
// (roughly the size of the sampling scatter). The dashboard's comparison text
// and the direction chip are both derived from this one calculation, so they can
// never disagree.
//
// Pure ES module (no TypeScript, no deps) so it can be imported by both the
// Next build (via the TS ingestion lib) and `node --test`.

/** Least-squares slope (y per unit x), used for rising-is-good count series. */
export function trailingSlope(points, window = 5) {
  const pts = points.slice(-window)
  const n = pts.length
  if (n < 2) return null
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const p of pts) {
    sx += p.x
    sy += p.y
    sxx += p.x * p.x
    sxy += p.x * p.y
  }
  const denom = n * sxx - sx * sx
  if (denom === 0) return null
  return (n * sxy - sx * sy) / denom
}

/** Mean of the earliest and most recent `w` reliable points (sorted ascending). */
export function windowMeans(points, w = 3) {
  if (!points.length) return null
  const k = Math.min(w, points.length)
  const mean = (arr) => arr.reduce((s, p) => s + p.y, 0) / arr.length
  const early = points.slice(0, k)
  const late = points.slice(-k)
  return {
    early: mean(early),
    late: mean(late),
    earlyRange: [early[0].x, early[early.length - 1].x],
    lateRange: [late[0].x, late[late.length - 1].x],
  }
}

/**
 * Direction of the idea-vintage instrument from reliable points only.
 * `flat` is the band (in median-years) within which we call it flat rather than
 * claim a trend. Returns 'accelerating' | 'flat' | 'decelerating' | 'unclear'.
 */
export function ideaVintageDirection(reliablePoints, { w = 3, flat = 0.75 } = {}) {
  if (!reliablePoints || reliablePoints.length < 2) return 'unclear'
  const m = windowMeans(reliablePoints, w)
  if (!m) return 'unclear'
  const delta = m.late - m.early // rising reference age = older ideas
  if (Math.abs(delta) <= flat) return 'flat'
  return delta < 0 ? 'accelerating' : 'decelerating' // falling age (inverted) = accelerating
}

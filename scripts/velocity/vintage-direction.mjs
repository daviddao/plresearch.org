// Direction math for the idea-vintage instrument.
//
// The sign is INVERTED for this instrument: a FALLING median reference age means
// new work is building on fresher ideas, which is the field ACCELERATING. Do not
// route this through a generic "up = good" helper — getting it backwards silently
// reverses the page's claim, which is why it is covered by a unit test.
//
// Pure ES module (no TypeScript, no deps) so it can be imported by both the
// Next build (via the TS ingestion lib) and `node --test`.

/** Least-squares slope (y per unit x) over the trailing `window` reliable points. */
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

/**
 * Direction of the idea-vintage instrument from reliable points only.
 * Returns 'accelerating' | 'flat' | 'decelerating' | 'unclear'.
 * `eps` is the flat band in median-years per year.
 */
export function ideaVintageDirection(reliablePoints, { window = 5, eps = 0.05 } = {}) {
  const slope = trailingSlope(reliablePoints, window)
  if (slope == null) return 'unclear'
  const inverted = -slope // falling median (negative slope) => accelerating
  if (inverted > eps) return 'accelerating'
  if (inverted < -eps) return 'decelerating'
  return 'flat'
}

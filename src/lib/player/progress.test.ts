import { describe, expect, it } from 'vitest'
import { capEstimated } from './progress'

describe('capEstimated', () => {
  it('caps the estimated progress just below 90% of the duration', () => {
    expect(capEstimated(3500, 3600)).toBe(3239)
    expect(capEstimated(100, 3600)).toBe(100)
  })

  it('estimated progress at the cap never counts as watched', () => {
    for (const duration of [7200, 2700]) {
      expect(capEstimated(duration, duration) / duration).toBeLessThan(0.9)
    }
  })
})

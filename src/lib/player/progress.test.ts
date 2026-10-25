import { describe, expect, it } from 'vitest'
import { capEstimated } from './progress'

describe('capEstimated', () => {
  it('caps the estimated progress at 90% of the duration', () => {
    expect(capEstimated(3500, 3600)).toBe(3240)
    expect(capEstimated(100, 3600)).toBe(100)
  })
})

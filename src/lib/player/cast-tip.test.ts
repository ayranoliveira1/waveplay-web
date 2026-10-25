import { describe, expect, it } from 'vitest'
import { castPlatformFor } from './cast-tip'

const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const LINUX =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

describe('castPlatformFor', () => {
  it('Chrome on Android is android', () => {
    expect(castPlatformFor(CHROME_ANDROID, 5)).toBe('android')
  })

  it('iPhone is ios', () => {
    expect(castPlatformFor(IPHONE, 5)).toBe('ios')
  })

  it('iPad reporting a Mac user agent with touch is ios', () => {
    expect(castPlatformFor(MAC, 5)).toBe('ios')
  })

  it('Mac without touch is desktop', () => {
    expect(castPlatformFor(MAC, 0)).toBe('desktop')
  })

  it('Windows is desktop', () => {
    expect(castPlatformFor(WINDOWS, 0)).toBe('desktop')
  })

  it('Linux is desktop', () => {
    expect(castPlatformFor(LINUX, 0)).toBe('desktop')
  })
})

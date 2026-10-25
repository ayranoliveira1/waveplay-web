export type CastPlatform = 'desktop' | 'android' | 'ios'

// O iPad se apresenta como Mac; só o toque o denuncia.
export function castPlatformFor(userAgent: string, maxTouchPoints: number): CastPlatform {
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios'
  return 'desktop'
}

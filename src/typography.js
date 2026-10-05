const APPLE_DEVICE = /iPhone|iPad|iPod|Macintosh/.test(typeof navigator === 'undefined' ? '' : navigator.userAgent)
export const hasAppleTypography = APPLE_DEVICE
export const screenshotFont = APPLE_DEVICE ? '-apple-system, BlinkMacSystemFont, sans-serif' : '"Studio Inter", sans-serif'
let fontReady
export function prepareTypography() {
  if (!fontReady) fontReady = Promise.all([400,500,600,700].map(weight => document.fonts.load(`${weight} 17px ${screenshotFont}`, 'Tiếng Việt Ắ ệ 09:41')))
  return fontReady
}
export function font(size, weight = 400) { return `${weight} ${size}px ${screenshotFont}` }

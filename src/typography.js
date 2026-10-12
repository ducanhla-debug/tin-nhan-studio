const APPLE_DEVICE = /iPhone|iPad|iPod|Macintosh/.test(typeof navigator === 'undefined' ? '' : navigator.userAgent)
export const hasAppleTypography = APPLE_DEVICE
// Ask WebKit for Apple's system face; never redistribute SF Pro files.
export let screenshotFont = APPLE_DEVICE ? 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' : '"Studio Inter", sans-serif'
export let hasLocalTypography = false
export let keyboardFont = screenshotFont
// Private dev-server assets only: never included in a production build.
if (import.meta.env?.DEV && typeof document !== 'undefined') {
  try {
    const manifest = await fetch('/__local-fonts/manifest').then(response => response.json())
    if (['text', 'display'].every(family => ['400', '500', '600', '700'].every(weight => manifest[family]?.includes(weight)))) {
      const faces = await Promise.all(['text', 'display'].flatMap(family => manifest[family].map(weight => new FontFace(`Studio Local SF Pro ${family}`, `url("/__local-fonts/${family}/${weight}.otf")`, { weight }).load())))
      faces.forEach(face => document.fonts.add(face))
      screenshotFont = '"Studio Local SF Pro text", "Studio Inter", sans-serif'
      keyboardFont = '"Studio Local SF Pro display", "Studio Inter", sans-serif'
      hasLocalTypography = true
    }
  } catch (error) {
    console.warn('Không nạp được font cục bộ; tiếp tục dùng font thay thế.', error)
  }
}
export const typographyProfiles = Object.freeze({
  messenger: { label: 'Messenger iOS', target: 'SF Pro · hệ thống iOS', evidence: 'inferred' },
  zalo: { label: 'Zalo iOS', target: 'SF Pro · hệ thống iOS', evidence: 'inferred' },
  imessage: { label: 'Tin nhắn iPhone', target: 'SF Pro · hệ thống iOS', evidence: 'apple-system' },
})
export function typographyNote(platform) {
  const profile = typographyProfiles[platform] || typographyProfiles.imessage
  const rendering = hasLocalTypography
    ? 'Đã nạp SF Pro Text cho bản xem trước; bàn phím giữ SF Pro Display. Font cục bộ hoạt động trên Windows.'
    : hasAppleTypography
    ? 'Dùng font hệ thống Apple trên máy này.'
    : 'Máy này dùng Inter thay thế, không phải SF Pro. Mở trên iPhone để dùng font hệ thống iOS.'
  return `${profile.label} · ${profile.target}. ${rendering}${profile.evidence === 'inferred' ? ' Chưa có xác nhận font chat từ nhà phát hành.' : ''}`
}
let fontReady
export function prepareTypography() {
  if (!fontReady) fontReady = Promise.all([400,500,600,700].map(weight => document.fonts.load(font(15.5, weight), 'Tiếng Việt Ắ ệ 09:41')))
  return fontReady
}
export function font(size, weight = 400, role = 'ui') { return `${weight} ${size}px ${role === 'keyboard' ? keyboardFont : screenshotFont}` }

// Measurements normalized from the supplied 589 × 1280 screenshots to 393pt.
export const chatTypography = Object.freeze({
  messenger: { size: 15.5, lineHeight: 19, tracking: '0px', padding: 10, maxWidth: 336 },
  zalo: { size: 15.5, lineHeight: 19, tracking: '0px', padding: 10, maxWidth: 299 },
  imessage: { size: 15.5, lineHeight: 22, tracking: '0px', padding: 13, maxWidth: 276 },
})

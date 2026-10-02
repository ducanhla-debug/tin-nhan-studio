const WIDTH = 1080
const HEIGHT = 1920
const imageCache = new Map()

export const canvasSize = { width: WIDTH, height: HEIGHT }

const palettes = {
  messenger: { accent: '#0a7cff', incoming: '#eef0f3', canvas: '#ffffff', composer: '#f1f2f6' },
  zalo: { accent: '#0b8ff7', incoming: '#ffffff', canvas: '#e8f1fb', composer: '#ffffff' },
  imessage: { accent: '#20a33a', incoming: '#e9e9eb', canvas: '#ffffff', composer: '#f7f7f8' },
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
}

function fillRound(ctx, x, y, w, h, r, fill, stroke = null, lineWidth = 1) {
  ctx.save()
  roundedRect(ctx, x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
  ctx.restore()
}

function drawText(ctx, text, x, y, { font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color = '#111827', align = 'left', baseline = 'alphabetic' } = {}) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, x, y)
}

export function wrapLines(ctx, text, maxWidth) {
  const paragraphs = String(text || '').split('\n')
  const lines = []
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }
    let line = words.shift()
    for (const word of words) {
      const candidate = `${line} ${word}`
      if (ctx.measureText(candidate).width <= maxWidth) line = candidate
      else {
        lines.push(line)
        line = word
      }
    }
    lines.push(line)
  }
  return lines
}

function loadImage(src) {
  if (!src) return Promise.resolve(null)
  if (imageCache.has(src)) return imageCache.get(src)
  const promise = new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
  imageCache.set(src, promise)
  return promise
}

async function drawAvatar(ctx, src, name, x, y, size, accent) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()
  const image = await loadImage(src)
  if (image) {
    const scale = Math.max(size / image.width, size / image.height)
    const w = image.width * scale
    const h = image.height * scale
    ctx.drawImage(image, x + (size - w) / 2, y + (size - h) / 2, w, h)
  } else {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size)
    gradient.addColorStop(0, accent)
    gradient.addColorStop(1, '#6d5dfc')
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, size, size)
    drawText(ctx, (name || '?').trim().slice(0, 1).toUpperCase(), x + size / 2, y + size / 2 + 2, {
      font: `700 ${Math.round(size * 0.42)}px -apple-system, sans-serif`,
      color: '#ffffff',
      align: 'center',
      baseline: 'middle',
    })
  }
  ctx.restore()
}

function drawSignal(ctx, x, y, level, color) {
  for (let i = 0; i < 4; i += 1) {
    const h = 12 + i * 9
    fillRound(ctx, x + i * 14, y + 42 - h, 9, h, 4, i < level ? color : `${color}35`)
  }
}

function drawWifi(ctx, x, y, color) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 7
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath()
    ctx.arc(x, y + 10, 34 - i * 11, Math.PI * 1.18, Math.PI * 1.82)
    ctx.stroke()
  }
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y + 12, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBattery(ctx, x, y, value, color) {
  fillRound(ctx, x, y, 60, 31, 9, 'transparent', color, 4)
  fillRound(ctx, x + 62, y + 9, 5, 13, 2, color)
  const width = Math.max(5, Math.round((50 * Math.min(100, Math.max(0, value))) / 100))
  fillRound(ctx, x + 5, y + 5, width, 21, 5, value <= 20 ? '#ff3b30' : color)
}

function drawStatusBar(ctx, state, dark) {
  const fg = dark ? '#f8fafc' : '#08090b'
  drawText(ctx, state.time || '09:41', 72, 68, { font: '650 38px -apple-system, sans-serif', color: fg, baseline: 'middle' })
  fillRound(ctx, 390, 25, 300, 82, 42, '#000000')
  drawSignal(ctx, 808, 38, Number(state.signal) || 1, fg)
  if (state.wifi) drawWifi(ctx, 885, 54, fg)
  else drawText(ctx, state.carrier || '5G', 890, 69, { font: '650 31px -apple-system, sans-serif', color: fg, align: 'center' })
  drawBattery(ctx, 970, 43, Number(state.battery), fg)
}

function drawHeaderIcons(ctx, platform, accent, y) {
  ctx.save()
  ctx.strokeStyle = accent
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(90, y + 20)
  ctx.lineTo(62, y + 48)
  ctx.lineTo(90, y + 76)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(868, y + 46, 25, 0.25, 2.9)
  ctx.stroke()
  ctx.beginPath()
  ctx.roundRect(948, y + 22, 56, 48, 10)
  ctx.stroke()
  if (platform !== 'imessage') {
    ctx.beginPath()
    ctx.moveTo(1004, y + 34)
    ctx.lineTo(1025, y + 22)
    ctx.lineTo(1025, y + 70)
    ctx.lineTo(1004, y + 58)
    ctx.stroke()
  }
  ctx.restore()
}

async function drawHeader(ctx, state, palette, dark) {
  const fg = dark ? '#f8fafc' : '#111827'
  const sub = dark ? '#a6adba' : '#7b8495'
  const y = 120
  drawHeaderIcons(ctx, state.platform, palette.accent, y)
  await drawAvatar(ctx, state.avatar, state.name, 132, y + 2, 92, palette.accent)
  drawText(ctx, state.name || 'Người dùng', 244, y + 43, { font: '700 40px -apple-system, sans-serif', color: fg })
  drawText(ctx, state.activity || '', 244, y + 82, { font: '29px -apple-system, sans-serif', color: sub })
  ctx.strokeStyle = dark ? '#2f3540' : '#e5e7eb'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 236)
  ctx.lineTo(WIDTH, 236)
  ctx.stroke()
}

function getBubbleStyle(state, palette, sender, dark) {
  if (sender === 'me') return { fill: palette.accent, color: '#ffffff' }
  if (dark) return { fill: state.platform === 'zalo' ? '#283241' : '#2c2c2e', color: '#ffffff' }
  return { fill: palette.incoming, color: '#111318' }
}

async function drawMessageImage(ctx, src, x, y, w, h) {
  const image = await loadImage(src)
  if (!image) return
  ctx.save()
  roundedRect(ctx, x, y, w, h, 30)
  ctx.clip()
  const scale = Math.max(w / image.width, h / image.height)
  const iw = image.width * scale
  const ih = image.height * scale
  ctx.drawImage(image, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
  ctx.restore()
}

async function calculateMessageLayout(ctx, state, top, bottom) {
  ctx.font = '38px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  const layouts = []
  let totalHeight = 0
  for (const message of state.messages) {
    const isImage = message.type === 'image' && message.image
    const lines = isImage ? [] : wrapLines(ctx, message.text, 610)
    const textWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)
    const w = isImage ? 540 : Math.max(150, Math.min(690, textWidth + 58))
    const h = isImage ? 410 : Math.max(76, lines.length * 49 + 34)
    const block = h + 66
    layouts.push({ message, lines, w, h, block })
    totalHeight += block
  }
  const available = bottom - top
  let visible = layouts
  while (visible.length > 1 && visible.reduce((sum, item) => sum + item.block, 0) > available) visible = visible.slice(1)
  const visibleHeight = visible.reduce((sum, item) => sum + item.block, 0)
  let y = Math.max(top, bottom - visibleHeight)
  return visible.map((item) => {
    const x = item.message.sender === 'me' ? WIDTH - 54 - item.w : 130
    const result = { ...item, x, y }
    y += item.block
    return result
  })
}

async function drawMessages(ctx, state, palette, dark, boundsOnly = false) {
  const top = 285
  const bottom = state.keyboard ? 1260 : 1660
  const layouts = await calculateMessageLayout(ctx, state, top, bottom)
  if (boundsOnly) return layouts
  for (const item of layouts) {
    const { message, x, y, w, h, lines } = item
    const bubble = getBubbleStyle(state, palette, message.sender, dark)
    if (message.sender === 'them') await drawAvatar(ctx, state.avatar, state.name, 42, y + h - 66, 58, palette.accent)
    fillRound(ctx, x, y, w, h, 34, bubble.fill, state.platform === 'zalo' && message.sender === 'them' ? '#d6dde7' : null, 2)
    if (message.type === 'image' && message.image) await drawMessageImage(ctx, message.image, x, y, w, h)
    else {
      lines.forEach((line, index) => {
        drawText(ctx, line, x + 29, y + 48 + index * 49, { font: '38px -apple-system, sans-serif', color: bubble.color })
      })
    }
    drawText(ctx, message.time || '', message.sender === 'me' ? x + w : x, y + h + 34, {
      font: '25px -apple-system, sans-serif',
      color: dark ? '#969ca8' : '#8991a0',
      align: message.sender === 'me' ? 'right' : 'left',
    })
    if (message.reaction) {
      fillRound(ctx, x + w - 48, y + h - 23, 57, 44, 22, dark ? '#3a3a3c' : '#ffffff', dark ? '#4d4d50' : '#d9dde5', 2)
      drawText(ctx, message.reaction, x + w - 19, y + h - 1, { font: '27px "Segoe UI Emoji", sans-serif', color: '#111', align: 'center', baseline: 'middle' })
    }
  }
  return layouts
}

function drawComposer(ctx, state, palette, dark) {
  const y = state.keyboard ? 1276 : 1700
  const bg = dark ? '#15161a' : palette.composer
  ctx.fillStyle = dark ? '#111214' : state.platform === 'zalo' ? '#ffffff' : '#ffffff'
  ctx.fillRect(0, y - 20, WIDTH, HEIGHT - y + 20)
  ctx.strokeStyle = dark ? '#2e3035' : '#e1e4e9'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, y - 20)
  ctx.lineTo(WIDTH, y - 20)
  ctx.stroke()
  fillRound(ctx, 182, y + 20, 680, 86, 43, bg, dark ? '#3a3d44' : '#d8dde5', 2)
  drawText(ctx, 'Aa', 225, y + 74, { font: '34px -apple-system, sans-serif', color: dark ? '#9ca3af' : '#8a93a3' })
  drawText(ctx, '+', 70, y + 64, { font: '500 55px -apple-system, sans-serif', color: palette.accent, align: 'center' })
  drawText(ctx, '☺', 818, y + 67, { font: '42px -apple-system, sans-serif', color: palette.accent, align: 'center' })
  drawText(ctx, state.platform === 'messenger' ? '👍' : '↑', 982, y + 66, { font: '46px "Segoe UI Emoji", sans-serif', color: palette.accent, align: 'center' })
  if (state.keyboard) drawKeyboard(ctx, dark)
  else fillRound(ctx, 405, 1885, 270, 13, 8, dark ? '#f7f7f8' : '#101114')
}

function drawKeyboard(ctx, dark) {
  const y = 1425
  ctx.fillStyle = dark ? '#24262b' : '#d4d7dd'
  ctx.fillRect(0, y, WIDTH, HEIGHT - y)
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']
  rows.forEach((row, ri) => {
    const keyW = ri === 0 ? 92 : 96
    const gap = 10
    const total = row.length * keyW + (row.length - 1) * gap
    const start = (WIDTH - total) / 2
    ;[...row].forEach((letter, index) => {
      const x = start + index * (keyW + gap)
      const ky = y + 42 + ri * 105
      fillRound(ctx, x, ky, keyW, 88, 12, dark ? '#4a4d54' : '#ffffff', dark ? '#50545c' : '#c8cbd1', 1)
      drawText(ctx, letter, x + keyW / 2, ky + 47, { font: '38px -apple-system, sans-serif', color: dark ? '#fff' : '#111', align: 'center', baseline: 'middle' })
    })
  })
  fillRound(ctx, 280, 1770, 520, 90, 13, dark ? '#4a4d54' : '#ffffff')
  drawText(ctx, 'dấu cách', 540, 1817, { font: '34px -apple-system, sans-serif', color: dark ? '#fff' : '#111', align: 'center', baseline: 'middle' })
  fillRound(ctx, 405, 1885, 270, 13, 8, dark ? '#f7f7f8' : '#101114')
}

async function renderFull(ctx, state, { skipStatus = false } = {}) {
  const palette = palettes[state.platform] || palettes.messenger
  const dark = state.appearance === 'dark'
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = dark ? '#090a0c' : palette.canvas
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  if (!skipStatus) drawStatusBar(ctx, state, dark)
  await drawHeader(ctx, state, palette, dark)
  const layouts = await drawMessages(ctx, state, palette, dark)
  drawComposer(ctx, state, palette, dark)
  return layouts
}

function drawReactionBar(ctx, layout) {
  const width = 600
  const x = Math.max(36, Math.min(WIDTH - width - 36, layout.x + layout.w - width))
  const y = Math.max(135, layout.y - 115)
  fillRound(ctx, x, y, width, 88, 44, '#29292b', null)
  const emojis = ['❤️', '😆', '😮', '😢', '😡', '👍']
  emojis.forEach((emoji, index) => drawText(ctx, emoji, x + 53 + index * 87, y + 46, { font: '43px "Segoe UI Emoji", sans-serif', color: '#fff', align: 'center', baseline: 'middle' }))
  drawText(ctx, '+', x + width - 38, y + 45, { font: '42px -apple-system, sans-serif', color: '#fff', align: 'center', baseline: 'middle' })
}

function drawActionMenu(ctx, layout) {
  const width = 500
  const x = Math.max(36, Math.min(WIDTH - width - 36, layout.x))
  const y = Math.min(HEIGHT - 420, layout.y + layout.h + 76)
  const actions = ['Trả lời', 'Sao chép', 'Chuyển tiếp', 'Khác']
  fillRound(ctx, x, y, width, 330, 28, '#29292bee')
  actions.forEach((action, index) => {
    if (index) {
      ctx.strokeStyle = '#56565a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y + index * 82)
      ctx.lineTo(x + width, y + index * 82)
      ctx.stroke()
    }
    drawText(ctx, action, x + 32, y + index * 82 + 50, { font: '34px -apple-system, sans-serif', color: '#fff' })
  })
}

async function renderFocus(ctx, state) {
  const base = document.createElement('canvas')
  base.width = WIDTH
  base.height = HEIGHT
  const baseCtx = base.getContext('2d')
  const layouts = await renderFull(baseCtx, state)
  const selected = layouts.find((item) => item.message.id === state.selectedId) || layouts.at(-1)
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.save()
  ctx.filter = 'blur(18px) brightness(0.48)'
  ctx.drawImage(base, -25, -25, WIDTH + 50, HEIGHT + 50)
  ctx.restore()
  if (!selected) return
  const pad = 18
  ctx.drawImage(base, selected.x - pad, selected.y - pad, selected.w + pad * 2, selected.h + pad * 2 + 48, selected.x - pad, selected.y - pad, selected.w + pad * 2, selected.h + pad * 2 + 48)
  drawReactionBar(ctx, selected)
  drawActionMenu(ctx, selected)
}

async function renderPreview(ctx, state) {
  const base = document.createElement('canvas')
  base.width = WIDTH
  base.height = HEIGHT
  const baseCtx = base.getContext('2d')
  await renderFull(baseCtx, state)
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.save()
  ctx.filter = 'blur(22px) brightness(0.42)'
  ctx.drawImage(base, -30, -30, WIDTH + 60, HEIGHT + 60)
  ctx.restore()
  ctx.fillStyle = '#00000022'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.save()
  ctx.shadowColor = '#00000066'
  ctx.shadowBlur = 34
  fillRound(ctx, 62, 150, 956, 1230, 42, '#ffffff')
  ctx.restore()
  ctx.save()
  roundedRect(ctx, 62, 150, 956, 1230, 42)
  ctx.clip()
  ctx.drawImage(base, 0, 120, WIDTH, 1390, 62, 150, 956, 1230)
  ctx.restore()
  const actions = ['Đánh dấu chưa đọc', 'Tắt thông báo', 'Lưu trữ']
  const y = 1425
  fillRound(ctx, 112, y, 856, 282, 38, '#2b2b2dee')
  actions.forEach((action, index) => {
    if (index) {
      ctx.strokeStyle = '#5c5c60'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(112, y + index * 94)
      ctx.lineTo(968, y + index * 94)
      ctx.stroke()
    }
    drawText(ctx, action, 160, y + index * 94 + 58, { font: '36px -apple-system, sans-serif', color: '#fff' })
    drawText(ctx, index === 0 ? '✉' : index === 1 ? '⌁' : '▣', 900, y + index * 94 + 57, { font: '38px -apple-system, sans-serif', color: '#fff', align: 'center' })
  })
  fillRound(ctx, 405, 1885, 270, 13, 8, '#f7f7f8')
}

export async function renderToCanvas(canvas, state) {
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (state.mode === 'focus') await renderFocus(ctx, state)
  else if (state.mode === 'preview') await renderPreview(ctx, state)
  else await renderFull(ctx, state)
  return canvas
}

export async function canvasToBlob(canvas, format = 'png') {
  const type = format === 'jpg' ? 'image/jpeg' : 'image/png'
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Không thể tạo ảnh.'))), type, format === 'jpg' ? 0.94 : undefined)
  })
}

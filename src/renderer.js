const WIDTH = 1080
const HEIGHT = 1920
const imageCache = new Map()

export const canvasSize = { width: WIDTH, height: HEIGHT }

const palettes = {
  messenger: { accent: '#0084ff', incoming: '#f0f0f0', canvas: '#ffffff', composer: '#f2f2f2' },
  zalo: { accent: '#0088ff', incoming: '#ffffff', canvas: '#e2e9f1', composer: '#ffffff' },
  imessage: { accent: '#007aff', incoming: '#e9e9eb', canvas: '#ffffff', composer: '#f7f7f8' },
}

// Outlined controls in a 24-point coordinate system, scaled to screenshot pixels.
const iconPaths = {
  back: 'M15 18l-6-6 6-6',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z',
  video: 'M16 8l6-4v16l-6-4M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  menu: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  plus: 'M12 5v14M5 12h14',
  camera: 'M14 4l2 3h4a2 2 0 0 1 2 2v11H2V9a2 2 0 0 1 2-2h4l2-3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  image: 'M3 3h18v18H3zM3 16l5-5 5 5 3-3 5 5M9 7h.01',
  mic: 'M9 3a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
  smile: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M8 9h.01M16 9h.01M8 14s1 3 4 3 4-3 4-3',
  thumb: 'M7 10v12H2V10zM7 10l5-8a3 3 0 0 1 2 3l-1 5h7a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7',
  dots: 'M4 12h.01M12 12h.01M20 12h.01',
  reply: 'M9 5l-7 7 7 7M2 12h10a9 9 0 0 1 9 9',
  copy: 'M9 9h13v13H9zM5 15H2V2h13v3',
  forward: 'M15 5l7 7-7 7M22 12H10a8 8 0 0 0-8 8',
  unread: 'M2 4h20v16H2zM2 4l10 8L22 4',
  archive: 'M2 3h20v5H2zM4 8v13h16V8M9 12h6',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  translate: 'M2 4h12M8 2v2M5 4s0 7 8 10M11 4s0 7-9 11M13 22l5-12 5 12M15 18h6',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M3 3l18 18',
}

function drawIcon(ctx, name, x, y, size, color, filled = false) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = name === 'dots' ? 4 : 1.65
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const path = new Path2D(iconPaths[name] || iconPaths.dots)
  if (filled) ctx.fill(path)
  ctx.stroke(path)
  ctx.restore()
}

function ellipsis(ctx, text, width) {
  let value = String(text || '')
  if (ctx.measureText(value).width <= width) return value
  while (value.length && ctx.measureText(`${value}…`).width > width) value = value.slice(0, -1)
  return `${value}…`
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
  drawText(ctx,String(Math.min(100,Math.max(0,value))),x+30,y+23,{font:'700 22px -apple-system, sans-serif',color:color==='#ffffff'?'#111':'#fff',align:'center'})
}

function drawStatusBar(ctx, state, dark) {
  const fg = dark || state.platform === 'zalo' ? '#ffffff' : '#08090b'
  drawText(ctx, state.time || '09:41', 72, 68, { font: '650 38px -apple-system, sans-serif', color: fg, baseline: 'middle' })
  fillRound(ctx, 390, 25, 300, 82, 42, '#000000')
  drawSignal(ctx, 808, 38, Number(state.signal) || 1, fg)
  if (state.wifi) drawWifi(ctx, 885, 54, fg)
  else drawText(ctx, state.carrier || '5G', 890, 69, { font: '650 31px -apple-system, sans-serif', color: fg, align: 'center' })
  drawBattery(ctx, 970, 43, Number(state.battery), fg)
}

async function drawHeader(ctx, state, palette, dark) {
  const fg = dark ? '#ffffff' : '#111111'
  const sub = dark ? '#a6adba' : '#7b8495'
  const activity = state.activity === 'Không hiển thị' ? '' : state.activity
  if (state.platform === 'imessage') {
    // iOS 26 contact avatar floats above the compact name control.
    fillRound(ctx, 34, 132, 98, 98, 49, dark ? '#242426' : '#f1f1f3', dark ? '#454548' : '#dedee1', 1)
    drawIcon(ctx, 'back', 49, 149, 64, palette.accent)
    await drawAvatar(ctx, state.avatar, state.name, 492, 128, 96, '#999aa0')
    ctx.font = '600 34px -apple-system, sans-serif'
    const name = ellipsis(ctx, state.name || 'Người dùng', 460)
    const nameWidth = ctx.measureText(name).width + 74
    fillRound(ctx,(WIDTH-nameWidth)/2,231,nameWidth,58,29,dark?'#242426ee':'#f4f4f5ee')
    drawText(ctx,name,WIDTH/2-13,270,{font:'600 34px -apple-system, sans-serif',color:fg,align:'center'})
    drawText(ctx,'›',(WIDTH+nameWidth)/2-24,270,{font:'32px sans-serif',color:sub,align:'center'})
    return
  }
  const zalo = state.platform === 'zalo'
  const color = zalo ? '#ffffff' : palette.accent
  drawIcon(ctx, 'back', 34, 142, 64, color)
  if (!zalo) await drawAvatar(ctx, state.avatar, state.name, 116, 132, 92, palette.accent)
  const nameX = zalo ? 130 : 232
  ctx.font = '600 40px -apple-system, sans-serif'
  drawText(ctx, ellipsis(ctx, state.name || 'Người dùng', zalo ? 550 : 570), nameX, activity ? 169 : 187, { font: '600 40px -apple-system, sans-serif', color: zalo ? '#fff' : fg })
  if (activity) drawText(ctx, activity, nameX, 210, { font: '28px -apple-system, sans-serif', color: zalo ? '#e4f3ff' : sub })
  drawIcon(ctx, 'phone', zalo ? 760 : 844, 149, 55, color)
  drawIcon(ctx, 'video', zalo ? 866 : 966, 151, 57, color)
  if (zalo) drawIcon(ctx, 'menu', 981, 151, 55, color)
}

function getBubbleStyle(state, palette, sender, dark) {
  if (sender === 'me') {
    if (state.platform === 'zalo') return {fill: dark ? '#193f63' : '#d3eaff', color: dark ? '#fff' : '#111318'}
    return { fill: state.platform === 'imessage' && state.messageService === 'sms' ? '#34c759' : palette.accent, color: '#ffffff' }
  }
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
  ctx.font = '42px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  const layouts = []
  const apple = state.platform === 'imessage'
  const zalo = state.platform === 'zalo'
  for (const [index, message] of state.messages.entries()) {
    const previous = state.messages[index - 1]
    const next = state.messages[index + 1]
    const groupEnd = !next || next.sender !== message.sender
    const minutes = value => /^\d{1,2}:\d{2}$/.test(value || '') ? Number(value.split(':')[0])*60+Number(value.split(':')[1]) : null
    const currentTime = minutes(message.time)
    const previousTime = minutes(previous?.time)
    const timestamp = message.time && (!previous || currentTime === null || previousTime === null || Math.abs(currentTime-previousTime)>5)
    const timeHeight = timestamp && !zalo ? 65 : 0
    const isImage = message.type === 'image' && message.image
    const lines = isImage ? [] : wrapLines(ctx, message.text, apple ? 735 : 690)
    const textWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0)
    const w = isImage ? 600 : Math.max(zalo ? 180 : 120, textWidth + 58)
    const h = isImage ? 450 : Math.max(88, lines.length * 53 + 34 + (zalo ? 34 : 0))
    const block = h + timeHeight + (groupEnd ? 30 : 8) + (message.reaction ? 28 : 0)
    layouts.push({ message, lines, w, h, block, groupEnd, timeHeight })
  }
  const available = bottom - top
  let visible = layouts
  // A selected message must stay visible in focus mode, including older messages.
  const selectedIndex = layouts.findIndex(item => item.message.id === state.selectedId)
  if (state.mode === 'focus' && selectedIndex >= 0) visible = layouts.slice(0, selectedIndex + 1)
  while (visible.length > 1 && visible.reduce((sum, item) => sum + item.block, 0) > available) visible = visible.slice(1)
  const visibleHeight = visible.reduce((sum, item) => sum + item.block, 0)
  let y = Math.max(top, bottom - visibleHeight)
  return visible.map((item) => {
    const x = item.message.sender === 'me' ? WIDTH - 36 - item.w : apple ? 36 : 116
    const result = { ...item, x, y: y + item.timeHeight }
    y += item.block
    return result
  })
}

async function drawBubble(ctx, state, palette, dark, item) {
  const {message, x, y, w, h, lines, groupEnd} = item
  const bubble = getBubbleStyle(state, palette, message.sender, dark)
  const apple = state.platform === 'imessage'
  const zalo = state.platform === 'zalo'
  fillRound(ctx, x, y, w, h, zalo ? 24 : 46, bubble.fill, zalo && !dark ? '#cfd7e0' : null, 1.5)
  if (apple && groupEnd && message.type !== 'image') {
    ctx.fillStyle = bubble.fill
    ctx.beginPath()
    if (message.sender === 'me') {
      ctx.moveTo(x+w-30,y+h-30);ctx.quadraticCurveTo(x+w+2,y+h+2,x+w+15,y+h);ctx.quadraticCurveTo(x+w-20,y+h+7,x+w-45,y+h-7)
    } else {
      ctx.moveTo(x+30,y+h-30);ctx.quadraticCurveTo(x-2,y+h+2,x-15,y+h);ctx.quadraticCurveTo(x+20,y+h+7,x+45,y+h-7)
    }
    ctx.fill()
  }
  if (message.type === 'image' && message.image) await drawMessageImage(ctx,message.image,x,y,w,h)
  else lines.forEach((line,index)=>drawText(ctx,line,x+29,y+53+index*53,{font:'42px -apple-system, sans-serif',color:bubble.color}))
  if (zalo && message.time) drawText(ctx,message.time,x+w-20,y+h-15,{font:'24px -apple-system, sans-serif',color:dark?'#a3b3c4':'#7d8790',align:'right'})
  if (message.reaction) {
    const ry = apple ? y-17 : y+h-17
    fillRound(ctx,x+w-60,ry,75,51,26,dark?'#3a3a3c':'#ffffff',dark?'#090a0c':'#e4e4e7',3)
    drawText(ctx,message.reaction,x+w-23,ry+27,{font:'32px "Segoe UI Emoji", sans-serif',align:'center',baseline:'middle'})
  }
}

async function drawMessages(ctx, state, palette, dark, boundsOnly = false, bottomOverride) {
  const top = state.platform === 'imessage' ? 330 : 285
  const bottom = bottomOverride ?? (state.keyboard ? 1260 : 1700)
  const layouts = await calculateMessageLayout(ctx, state, top, bottom)
  if (boundsOnly) return layouts
  for (const item of layouts) {
    const {message,x,y,h,groupEnd,timeHeight} = item
    if (timeHeight) drawText(ctx,message.time,WIDTH/2,y-26,{font:'500 27px -apple-system, sans-serif',color:dark?'#99999e':'#8e8e93',align:'center'})
    if (message.sender === 'them' && state.platform !== 'imessage' && groupEnd) await drawAvatar(ctx,state.avatar,state.name,30,y+h-68,62,palette.accent)
    await drawBubble(ctx,state,palette,dark,item)
  }
  return layouts
}

function drawComposer(ctx, state, palette, dark) {
  const y = state.keyboard ? 1276 : 1740
  const bg = dark ? '#15161a' : palette.composer
  ctx.fillStyle = dark ? '#111214' : state.platform === 'zalo' ? '#ffffff' : '#ffffff'
  ctx.fillRect(0, y - 20, WIDTH, HEIGHT - y + 20)
  ctx.strokeStyle = dark ? '#2e3035' : '#e1e4e9'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, y - 20)
  ctx.lineTo(WIDTH, y - 20)
  ctx.stroke()
  const muted = dark ? '#a1a1a6' : '#8e8e93'
  if (state.platform === 'imessage') {
    fillRound(ctx,32,y+16,90,90,45,dark?'#303033':'#e9e9eb')
    drawIcon(ctx,'plus',51,y+35,52,muted)
    fillRound(ctx,149,y+16,891,90,45,bg,dark?'#48484a':'#c6c6c8',2)
    drawText(ctx,state.messageService==='sms'?'Tin nhắn văn bản':'iMessage',181,y+76,{font:'39px -apple-system, sans-serif',color:muted})
    drawIcon(ctx,'mic',969,y+37,47,muted)
  } else if (state.platform === 'zalo') {
    drawIcon(ctx,'smile',30,y+35,59,muted)
    drawText(ctx,'Tin nhắn',119,y+78,{font:'42px -apple-system, sans-serif',color:muted})
    drawIcon(ctx,'dots',728,y+36,56,muted)
    drawIcon(ctx,'mic',844,y+31,61,muted)
    drawIcon(ctx,'image',963,y+34,59,muted)
  } else {
    drawIcon(ctx,'plus',29,y+39,51,palette.accent)
    drawIcon(ctx,'camera',105,y+39,51,palette.accent)
    drawIcon(ctx,'image',184,y+39,51,palette.accent)
    drawIcon(ctx,'mic',262,y+39,49,palette.accent)
    fillRound(ctx,338,y+19,590,88,44,bg)
    drawText(ctx,'Aa',373,y+77,{font:'39px -apple-system, sans-serif',color:muted})
    drawIcon(ctx,'smile',847,y+39,50,palette.accent)
    drawIcon(ctx,'thumb',973,y+39,54,palette.accent,true)
  }
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
  if (state.platform === 'zalo') {
    const gradient = ctx.createLinearGradient(0,0,WIDTH,236)
    gradient.addColorStop(0,'#0086ff');gradient.addColorStop(1,'#00b6ef')
    ctx.fillStyle = gradient
    ctx.fillRect(0,0,WIDTH,246)
  }
  if (!skipStatus) drawStatusBar(ctx, state, dark)
  await drawHeader(ctx, state, palette, dark)
  const layouts = await drawMessages(ctx, state, palette, dark)
  drawComposer(ctx, state, palette, dark)
  return layouts
}

function drawReactionBar(ctx, layout, state) {
  const width = 600
  const x = Math.max(36, Math.min(WIDTH - width - 36, layout.x + layout.w - width))
  const y = Math.max(135, layout.y - 115)
  const dark = state.appearance === 'dark'
  fillRound(ctx, x, y, width, 88, 44, dark ? '#333335' : '#f4f4f5')
  const emojis = state.platform === 'imessage' ? ['❤️', '👍', '👎', '😂', '‼️', '❓'] : ['❤️', '😆', '😮', '😢', '😡', '👍']
  emojis.forEach((emoji, index) => drawText(ctx, emoji, x + 53 + index * 87, y + 46, { font: '43px "Segoe UI Emoji", sans-serif', color: '#fff', align: 'center', baseline: 'middle' }))
  drawText(ctx, '+', x + width - 38, y + 45, { font: '42px -apple-system, sans-serif', color: dark ? '#fff' : '#444', align: 'center', baseline: 'middle' })
}

function drawActionMenu(ctx, layout, state) {
  const width = 500
  const x = Math.max(36, Math.min(WIDTH - width - 36, layout.x))
  const y = layout.y + layout.h + 36
  const dark = state.appearance === 'dark'
  const actions = state.platform === 'imessage' ? ['Trả lời', 'Sao chép', 'Dịch', 'Khác'] : ['Trả lời', 'Sao chép', 'Chuyển tiếp', 'Khác']
  const icons = ['reply','copy',state.platform === 'imessage' ? 'translate' : 'forward','dots']
  fillRound(ctx, x, y, width, 330, 28, dark ? '#29292bf5' : '#f4f4f5f5')
  actions.forEach((action, index) => {
    if (index) {
      ctx.strokeStyle = dark ? '#56565a' : '#d3d3d6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y + index * 82)
      ctx.lineTo(x + width, y + index * 82)
      ctx.stroke()
    }
    const color = dark ? '#fff' : '#19191b'
    drawText(ctx, action, x + 32, y + index * 82 + 50, { font: '34px -apple-system, sans-serif', color })
    drawIcon(ctx,icons[index],x+width-72,y+index*82+23,40,color)
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
  const scale = Math.min(1,1100/selected.h)
  const focused = {...selected,y:Math.max(310,Math.min(HEIGHT-460-selected.h*scale,selected.y))}
  ctx.save()
  ctx.translate(focused.x,focused.y)
  ctx.scale(scale,scale)
  await drawBubble(ctx,state,palettes[state.platform] || palettes.messenger,state.appearance==='dark',{...focused,x:0,y:0})
  ctx.restore()
  focused.w *= scale
  focused.h *= scale
  drawReactionBar(ctx, focused, state)
  drawActionMenu(ctx, focused, state)
}

async function renderPreview(ctx, state) {
  const base = document.createElement('canvas')
  base.width = WIDTH
  base.height = HEIGHT
  const baseCtx = base.getContext('2d')
  await renderFull(baseCtx, state)
  // Reflow into the preview card's available height, so the latest bubbles survive.
  const palette = palettes[state.platform] || palettes.messenger
  const previewDark = state.appearance === 'dark'
  baseCtx.fillStyle = previewDark ? '#090a0c' : palette.canvas
  const headerBottom = state.platform === 'imessage' ? 300 : 246
  baseCtx.fillRect(0,headerBottom,WIDTH,HEIGHT-headerBottom)
  await drawMessages(baseCtx,{...state,keyboard:false},palette,previewDark,false,1480)
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
  const actions = state.platform === 'imessage' ? ['Đánh dấu chưa đọc', 'Ẩn cảnh báo', 'Xóa'] : state.platform === 'zalo' ? ['Đánh dấu chưa đọc', 'Tắt thông báo', 'Ẩn trò chuyện'] : ['Đánh dấu chưa đọc', 'Tắt thông báo', 'Lưu trữ']
  const y = 1425
  const dark = state.appearance === 'dark'
  fillRound(ctx, 112, y, 856, 282, 38, dark ? '#2b2b2dee' : '#f4f4f5ee')
  actions.forEach((action, index) => {
    if (index) {
      ctx.strokeStyle = dark ? '#5c5c60' : '#c9c9cb'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(112, y + index * 94)
      ctx.lineTo(968, y + index * 94)
      ctx.stroke()
    }
    const color = state.platform === 'imessage' && index === 2 ? '#ff453a' : dark ? '#fff' : '#111'
    drawText(ctx, action, 160, y + index * 94 + 58, { font: '36px -apple-system, sans-serif', color })
    drawIcon(ctx,['unread','bell',state.platform === 'imessage' ? 'trash' : 'archive'][index],875,y+index*94+27,48,color)
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

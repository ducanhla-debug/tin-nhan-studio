import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, MonitorSmartphone } from 'lucide-react'
import { AppHeader, SetupPanel, StatusPanel } from './components.jsx'
import { createMessage, initialState } from './defaults.js'
import { canvasToBlob, renderToCanvas, commitRenderedCanvas, logicalSize, messageAtPoint } from './renderer.js'

const STORAGE_KEY = 'tin-nhan-studio-v1'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved && Array.isArray(saved.messages) ? { ...initialState, ...saved } : initialState
  } catch {
    return initialState
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Preview({ state, setState, canvasRef, rendering, saved }) {
  const gesture = useRef(null)
  useEffect(() => () => window.clearTimeout(gesture.current?.timer), [])
  const begin = (event) => {
    if (rendering) return
    const canvas = canvasRef.current
    const bounds = canvas.getBoundingClientRect()
    const id = messageAtPoint(canvas, (event.clientX-bounds.left)/bounds.width*logicalSize.width, (event.clientY-bounds.top)/bounds.height*logicalSize.height)
    const current = { id, x: event.clientX, y: event.clientY, held: false }
    if (id && state.mode==='full') current.timer = window.setTimeout(() => {
      current.held = true
      setState(s=>({...s,selectedId:id,mode:'focus'}))
    },450)
    gesture.current = current
  }
  const cancel = () => { window.clearTimeout(gesture.current?.timer); gesture.current = null }
  const end = () => {
    const current = gesture.current
    if(!current) return
    window.clearTimeout(current.timer)
    if(!current.held) {
      if(current.id) setState(s=>({...s,selectedId:current.id}))
      else if(state.mode!=='full') setState(s=>({...s,mode:'full'}))
    }
    gesture.current=null
  }
  return (
    <main className="preview-stage">
      <div className="preview-toolbar">
        <span><MonitorSmartphone size={17} /> Xem trước trực tiếp</span>
        <span className="autosave"><CheckCircle2 size={15} /> {saved ? 'Đã lưu trên trình duyệt' : 'Chưa lưu được'}</span>
      </div>
      <div className="phone-shell">
        <div className="phone-buttons left one" /><div className="phone-buttons left two" /><div className="phone-buttons right" />
        <canvas ref={canvasRef} aria-label="Bản xem trước ảnh tin nhắn" onPointerDown={begin} onPointerUp={end} onPointerCancel={cancel} onPointerLeave={cancel} onPointerMove={(e)=>{const current=gesture.current;if(current&&Math.hypot(e.clientX-current.x,e.clientY-current.y)>8)cancel()}} onContextMenu={(e)=>{e.preventDefault();const current=gesture.current;if(current?.id){window.clearTimeout(current.timer);setState(s=>({...s,selectedId:current.id,mode:'focus'}));gesture.current=null}}} />
        {rendering ? <div className="rendering">Đang cập nhật…</div> : null}
      </div>
      <p className="preview-hint">Chạm để chọn tin · Nhấn giữ để làm nổi bật</p>
    </main>
  )
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [rendering, setRendering] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')
  const [saved, setSaved] = useState(true)
  const canvasRef = useRef(null)
  const renderToken = useRef(0)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setSaved(true) } catch { setSaved(false) }
    const token = ++renderToken.current
    setRendering(true)
    const timer = window.setTimeout(async () => {
      try {
        const buffer = document.createElement('canvas')
        await renderToCanvas(buffer, state)
        if (token === renderToken.current && canvasRef.current) commitRenderedCanvas(buffer,canvasRef.current)
      } catch (error) { if(token===renderToken.current)setToast(error.message || 'Không thể cập nhật bản xem trước') }
      finally { if (token === renderToken.current) setRendering(false) }
    }, 70)
    return () => window.clearTimeout(timer)
  }, [state])

  const selectedIndex = useMemo(() => state.messages.findIndex((message) => message.id === state.selectedId), [state.messages, state.selectedId])

  const addMessage = () => {
    const message = createMessage(state.messages.at(-1)?.sender === 'me' ? 'them' : 'me')
    setState((s) => ({ ...s, messages: [...s.messages, message], selectedId: message.id, captureEndId: '' }))
  }

  const deleteMessage = () => {
    setState((s) => {
      const next = s.messages.filter((message) => message.id !== s.selectedId)
      const nextSelected = next[Math.min(selectedIndex, next.length - 1)]?.id || ''
      return { ...s, messages: next, selectedId: nextSelected, captureEndId: s.captureEndId === s.selectedId ? '' : s.captureEndId }
    })
  }

  const moveMessage = (direction) => {
    setState((s) => {
      const index = s.messages.findIndex((message) => message.id === s.selectedId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= s.messages.length) return s
      const messages = [...s.messages]
      ;[messages[index], messages[nextIndex]] = [messages[nextIndex], messages[index]]
      return { ...s, messages }
    })
  }

  const updateFile = async (event, target) => {
    const file = event.target.files?.[0]
    if (!file) return
    const data = await readFile(file)
    if (target === 'avatar') setState((s) => ({ ...s, avatar: data }))
    else setState((s) => ({ ...s, messages: s.messages.map((message) => message.id === s.selectedId ? { ...message, image: data, type: 'image' } : message) }))
    event.target.value = ''
  }

  const makeBlob = async () => {
    const exportCanvas = document.createElement('canvas')
    await renderToCanvas(exportCanvas, state)
    return canvasToBlob(exportCanvas, state.format)
  }

  const download = async () => {
    setExporting(true)
    try {
      const blob = await makeBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `tin-nhan-${state.platform}-${Date.now()}.${state.format}`
      anchor.click()
      URL.revokeObjectURL(url)
      setToast('Đã tạo ảnh 736 × 1600')
    } catch (error) {
      setToast(error.message || 'Không thể tạo ảnh')
    } finally {
      setExporting(false)
    }
  }

  const copyImage = async () => {
    try {
      const blob = await makeBlob()
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Trình duyệt này chưa hỗ trợ sao chép ảnh.')
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      setToast('Đã sao chép ảnh')
    } catch (error) {
      setToast(error.message || 'Không thể sao chép ảnh')
    }
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <div className="app-shell">
      <AppHeader onReset={() => { try { localStorage.removeItem(STORAGE_KEY) } catch {} setState(initialState) }} onDownload={download} exporting={exporting} format={state.format} />
      <div className="workspace">
        <SetupPanel state={state} setState={setState} onAvatar={(event) => updateFile(event, 'avatar')} onAddMessage={addMessage} />
        <Preview state={state} setState={setState} canvasRef={canvasRef} rendering={rendering} saved={saved} />
        <StatusPanel
          state={state}
          setState={setState}
          onMessageImage={(event) => updateFile(event, 'message')}
          onDelete={deleteMessage}
          onMove={moveMessage}
          onDownload={download}
          onCopy={copyImage}
          exporting={exporting}
        />
      </div>
      {toast ? <div className="toast" role="status"><CheckCircle2 size={18} /> {toast}</div> : null}
    </div>
  )
}

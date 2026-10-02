import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, MonitorSmartphone } from 'lucide-react'
import { AppHeader, SetupPanel, StatusPanel } from './components.jsx'
import { createMessage, initialState } from './defaults.js'
import { canvasToBlob, renderToCanvas } from './renderer.js'

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

function Preview({ state, canvasRef, rendering }) {
  return (
    <main className="preview-stage">
      <div className="preview-toolbar">
        <span><MonitorSmartphone size={17} /> Xem trước trực tiếp</span>
        <span className="autosave"><CheckCircle2 size={15} /> Đã lưu trên trình duyệt</span>
      </div>
      <div className="phone-shell">
        <div className="phone-buttons left one" /><div className="phone-buttons left two" /><div className="phone-buttons right" />
        <canvas ref={canvasRef} aria-label="Bản xem trước ảnh tin nhắn" />
        {rendering ? <div className="rendering">Đang cập nhật…</div> : null}
      </div>
    </main>
  )
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [rendering, setRendering] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')
  const canvasRef = useRef(null)
  const renderToken = useRef(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    const token = ++renderToken.current
    setRendering(true)
    const timer = window.setTimeout(async () => {
      if (canvasRef.current) await renderToCanvas(canvasRef.current, state)
      if (token === renderToken.current) setRendering(false)
    }, 70)
    return () => window.clearTimeout(timer)
  }, [state])

  const selectedIndex = useMemo(() => state.messages.findIndex((message) => message.id === state.selectedId), [state.messages, state.selectedId])

  const addMessage = () => {
    const message = createMessage(state.messages.at(-1)?.sender === 'me' ? 'them' : 'me')
    setState((s) => ({ ...s, messages: [...s.messages, message], selectedId: message.id }))
  }

  const deleteMessage = () => {
    setState((s) => {
      const next = s.messages.filter((message) => message.id !== s.selectedId)
      const nextSelected = next[Math.min(selectedIndex, next.length - 1)]?.id || ''
      return { ...s, messages: next, selectedId: nextSelected }
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
      setToast('Đã tạo ảnh 1080 × 1920')
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
      <AppHeader onReset={() => { localStorage.removeItem(STORAGE_KEY); setState(initialState) }} onDownload={download} exporting={exporting} />
      <div className="workspace">
        <SetupPanel state={state} setState={setState} onAvatar={(event) => updateFile(event, 'avatar')} onAddMessage={addMessage} />
        <Preview state={state} canvasRef={canvasRef} rendering={rendering} />
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

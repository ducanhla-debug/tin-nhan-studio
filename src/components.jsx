import React from 'react'
import {
  ArrowDown,
  ArrowUp,
  BatteryMedium,
  ChevronDown,
  CirclePlus,
  Copy,
  Download,
  GripVertical,
  ImagePlus,
  MessageCircle,
  Moon,
  RotateCcw,
  Signal,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wifi,
} from 'lucide-react'
import { modeLabels, platformLabels, statusPresets } from './defaults.js'

export function IconButton({ label, children, className = '', ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  )
}

export function Segmented({ value, items, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="group" aria-label={ariaLabel}>
      {items.map(({ value: itemValue, label, icon: Icon }) => (
        <button
          type="button"
          key={itemValue}
          className={value === itemValue ? 'is-active' : ''}
          onClick={() => onChange(itemValue)}
          aria-pressed={value === itemValue}
        >
          {Icon ? <Icon size={17} strokeWidth={2.2} /> : null}
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export function PanelSection({ title, action, children, className = '' }) {
  return (
    <section className={`panel-section ${className}`}>
      <div className="section-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function AppHeader({ onReset, onDownload, exporting }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark"><MessageCircle size={23} fill="currentColor" /></span>
        <strong>Tin Nhắn Studio</strong>
      </div>
      <div className="device-label"><Smartphone size={17} /> iPhone 14 Pro · 1080 × 1920</div>
      <div className="header-actions">
        <button className="button ghost" type="button" onClick={onReset}><RotateCcw size={17} /> Đặt lại</button>
        <button className="button primary" type="button" onClick={onDownload} disabled={exporting}>
          <Download size={18} /> {exporting ? 'Đang tạo ảnh…' : 'Tải ảnh PNG'}
        </button>
      </div>
    </header>
  )
}

export function SetupPanel({ state, setState, onAvatar, onAddMessage }) {
  const platformItems = Object.entries(platformLabels).map(([value, label]) => ({ value, label }))
  const modeItems = [
    { value: 'full', label: modeLabels.full, icon: Smartphone },
    { value: 'focus', label: modeLabels.focus, icon: Sparkles },
    { value: 'preview', label: modeLabels.preview, icon: Copy },
  ]
  return (
    <aside className="panel setup-panel">
      <PanelSection title="Nền tảng">
        <Segmented value={state.platform} items={platformItems} onChange={(platform) => setState((s) => ({ ...s, platform }))} ariaLabel="Nền tảng tin nhắn" />
        <div className="subheading">Chế độ chụp</div>
        <Segmented value={state.mode} items={modeItems} onChange={(mode) => setState((s) => ({ ...s, mode }))} ariaLabel="Chế độ chụp" />
      </PanelSection>

      <PanelSection title="Cuộc trò chuyện">
        <Field label="Tên hiển thị">
          <input value={state.name} maxLength={50} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} />
        </Field>
        <Field label="Trạng thái hoạt động">
          <div className="select-wrap">
            <select value={state.activity} onChange={(e) => setState((s) => ({ ...s, activity: e.target.value }))}>
              <option>Đang hoạt động</option>
              <option>Đang nhập…</option>
              <option>Hoạt động 5 phút trước</option>
              <option>Không hiển thị</option>
            </select><ChevronDown size={16} />
          </div>
        </Field>
        <div className="avatar-row">
          <div className="avatar-preview">{state.avatar ? <img src={state.avatar} alt="Ảnh đại diện" /> : state.name.slice(0, 1).toUpperCase()}</div>
          <label className="button secondary file-button"><Upload size={16} /> Chọn ảnh<input type="file" accept="image/*" onChange={onAvatar} /></label>
          {state.avatar ? <button className="button text-danger" type="button" onClick={() => setState((s) => ({ ...s, avatar: '' }))}>Xóa</button> : null}
        </div>
      </PanelSection>

      <PanelSection title="Tin nhắn" action={<button className="button primary compact" type="button" onClick={onAddMessage}><CirclePlus size={17} /> Thêm</button>} className="messages-section">
        <div className="message-list">
          {state.messages.map((message, index) => (
            <button
              className={`message-row ${message.id === state.selectedId ? 'is-selected' : ''}`}
              type="button"
              key={message.id}
              onClick={() => setState((s) => ({ ...s, selectedId: message.id }))}
            >
              <GripVertical size={15} className="drag-icon" />
              <span className="message-number">{index + 1}</span>
              <span className={`mini-bubble ${message.sender}`}>{message.type === 'image' ? 'Ảnh' : message.text || 'Tin nhắn trống'}</span>
              <time>{message.time}</time>
            </button>
          ))}
        </div>
      </PanelSection>
    </aside>
  )
}

export function StatusPanel({ state, setState, onMessageImage, onDelete, onMove, onDownload, onCopy, exporting }) {
  const selected = state.messages.find((message) => message.id === state.selectedId) || state.messages[0]
  const patchSelected = (patch) => setState((s) => ({ ...s, messages: s.messages.map((message) => message.id === s.selectedId ? { ...message, ...patch } : message) }))
  return (
    <aside className="panel status-panel">
      <PanelSection title="Thanh trạng thái">
        <div className="preset-grid">
          {statusPresets.map((preset) => (
            <button type="button" key={preset.label} onClick={() => setState((s) => ({ ...s, ...preset }))}>{preset.label}</button>
          ))}
        </div>
        <div className="field-grid two">
          <Field label="Thời gian"><input value={state.time} onChange={(e) => setState((s) => ({ ...s, time: e.target.value }))} /></Field>
          <Field label="Pin"><input type="number" min="1" max="100" value={state.battery} onChange={(e) => setState((s) => ({ ...s, battery: e.target.value }))} /></Field>
        </div>
        <div className="quick-controls">
          <button className={state.signal === 4 ? 'is-on' : ''} type="button" onClick={() => setState((s) => ({ ...s, signal: s.signal === 4 ? 1 : s.signal + 1 }))}><Signal size={17} /> {state.signal} vạch</button>
          <button className={state.wifi ? 'is-on' : ''} type="button" onClick={() => setState((s) => ({ ...s, wifi: !s.wifi }))}><Wifi size={17} /> Wi‑Fi</button>
          <button type="button" onClick={() => setState((s) => ({ ...s, carrier: s.carrier === '5G' ? '4G' : '5G' }))}><Smartphone size={17} /> {state.carrier}</button>
          <button type="button" onClick={() => setState((s) => ({ ...s, appearance: s.appearance === 'light' ? 'dark' : 'light' }))}>{state.appearance === 'light' ? <Sun size={17} /> : <Moon size={17} />} {state.appearance === 'light' ? 'Sáng' : 'Tối'}</button>
        </div>
      </PanelSection>

      <PanelSection title="Tin nhắn đang chỉnh sửa" className="editor-section">
        {selected ? (
          <>
            <Segmented value={selected.sender} items={[{ value: 'them', label: 'Người kia' }, { value: 'me', label: 'Bạn' }]} onChange={(sender) => patchSelected({ sender })} ariaLabel="Người gửi" />
            <Field label="Loại tin nhắn">
              <Segmented value={selected.type || 'text'} items={[{ value: 'text', label: 'Văn bản' }, { value: 'image', label: 'Hình ảnh' }]} onChange={(type) => patchSelected({ type })} ariaLabel="Loại tin nhắn" />
            </Field>
            {selected.type === 'image' ? (
              <label className="image-drop"><ImagePlus size={24} /><span>{selected.image ? 'Thay hình ảnh' : 'Chọn hình ảnh'}</span><input type="file" accept="image/*" onChange={onMessageImage} /></label>
            ) : (
              <Field label="Nội dung"><textarea rows="4" maxLength={1000} value={selected.text} onChange={(e) => patchSelected({ text: e.target.value })} /></Field>
            )}
            <div className="field-grid two">
              <Field label="Thời gian"><input value={selected.time} onChange={(e) => patchSelected({ time: e.target.value })} /></Field>
              <Field label="Cảm xúc"><input placeholder="❤️ 👍 😆" value={selected.reaction || ''} onChange={(e) => patchSelected({ reaction: e.target.value.slice(0, 3) })} /></Field>
            </div>
            <div className="editor-actions">
              <button className="button danger" type="button" onClick={onDelete}><Trash2 size={16} /> Xóa</button>
              <span />
              <IconButton label="Đưa lên" onClick={() => onMove(-1)}><ArrowUp size={18} /></IconButton>
              <IconButton label="Đưa xuống" onClick={() => onMove(1)}><ArrowDown size={18} /></IconButton>
            </div>
          </>
        ) : <p className="empty-copy">Hãy thêm một tin nhắn để bắt đầu.</p>}
      </PanelSection>

      <PanelSection title="Xuất ảnh" className="export-section">
        <div className="export-meta"><span><BatteryMedium size={17} /> 1080 × 1920</span><span>Không watermark</span></div>
        <label className="toggle-row"><input type="checkbox" checked={state.keyboard} onChange={(e) => setState((s) => ({ ...s, keyboard: e.target.checked }))} /><span>Hiện bàn phím iPhone</span></label>
        <div className="format-row">
          <select value={state.format} onChange={(e) => setState((s) => ({ ...s, format: e.target.value }))}><option value="png">PNG chất lượng cao</option><option value="jpg">JPG nhẹ hơn</option></select>
          <button className="button secondary square" type="button" onClick={onCopy} title="Sao chép ảnh"><Copy size={18} /></button>
        </div>
        <button className="button primary download-wide" type="button" onClick={onDownload} disabled={exporting}><Download size={18} /> {exporting ? 'Đang tạo ảnh…' : `Tải ảnh ${state.format.toUpperCase()}`}</button>
      </PanelSection>
    </aside>
  )
}

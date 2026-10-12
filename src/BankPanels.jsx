import React from 'react'
import {Field,PanelSection} from './components.jsx'
import {bankStyles,normalizeBank,initialBank} from './bankModel.js'
import {statusPresets} from './defaults.js'

export function BankSetup({state,setState}){
  const b=normalizeBank(state.bank)
  const patch=values=>setState(s=>({...s,bank:normalizeBank({...s.bank,...values})}))
  return <aside className="panel setup-panel">
    <PanelSection title="Mẫu chuyển khoản">
      <p className="bank-notice">Dùng để minh họa. Không tạo giao dịch thật và không có giá trị chứng từ.</p>
      <Field label="Phong cách tham khảo"><select aria-label="Phong cách tham khảo" value={b.style} onChange={e=>patch({style:e.target.value})}>{Object.entries(bankStyles).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></Field>
      <p className="font-note">Bố cục lấy cảm hứng từ ảnh mẫu, không phải ứng dụng ngân hàng chính thức.</p>
    </PanelSection>
    <PanelSection title="Thông tin minh họa">
      <Field label="Số tiền (VND)"><input inputMode="numeric" maxLength={15} value={b.amount} onChange={e=>patch({amount:e.target.value})}/></Field>
      {[['recipient','Người nhận'],['account','Số tài khoản'],['recipientBank','Ngân hàng nhận'],['reference','Mã giao dịch mẫu']].map(([key,label])=><Field key={key} label={label}><input maxLength={80} value={b[key]} onChange={e=>patch({[key]:e.target.value})}/></Field>)}
      <Field label="Nội dung chuyển khoản"><textarea maxLength={160} rows={3} value={b.note} onChange={e=>patch({note:e.target.value})}/></Field>
      <div className="field-grid two"><Field label="Ngày giao dịch"><input type="date" value={b.date} onChange={e=>patch({date:e.target.value})}/></Field><Field label="Giờ giao dịch"><input type="time" value={b.time} onChange={e=>patch({time:e.target.value})}/></Field></div>
      <button className="button secondary" onClick={()=>setState(s=>({...s,bank:{...initialBank}}))}>Đặt lại mẫu chuyển khoản</button>
    </PanelSection>
  </aside>
}
export function BankOptions({state,setState,onDownload,onCopy,exporting}){
  const b=normalizeBank(state.bank)
  const patch=values=>setState(s=>({...s,bank:normalizeBank({...s.bank,...values})}))
  return <aside className="panel status-panel">
    <PanelSection title="Nhãn mô phỏng · Luôn hiển thị">
      <p className="bank-notice">MÔ PHỎNG – KHÔNG CÓ GIÁ TRỊ GIAO DỊCH</p>
      <p className="font-note">Kéo trực tiếp nhãn trên ảnh. Có thể đặt ở bất kỳ vị trí nào trong khung, không giới hạn ở các góc.</p>
      <Field label={`Kích thước nhãn: ${b.labelSize} pt`}><input aria-label="Kích thước nhãn" type="range" min={14} max={22} step={1} value={b.labelSize} onChange={e=>patch({labelSize:e.target.value})}/></Field>
      <Field label={`Vị trí ngang: ${Math.round(b.labelX)}%`}><input aria-label="Vị trí ngang" type="range" min={0} max={100} value={b.labelX} onChange={e=>patch({labelX:e.target.value})}/></Field>
      <Field label={`Vị trí dọc: ${Math.round(b.labelY)}%`}><input aria-label="Vị trí dọc" type="range" min={0} max={100} value={b.labelY} onChange={e=>patch({labelY:e.target.value})}/></Field>
      <button className="button secondary" onClick={()=>patch({labelX:50,labelY:79,labelSize:16})}>Đặt lại vị trí nhãn</button>
      <p className="font-note">Nhãn có nền tương phản, tối thiểu 14 pt và luôn nằm trọn trong ảnh. Không có tùy chọn tắt hoặc làm mờ nhãn.</p>
    </PanelSection>
    <PanelSection title="Thanh trạng thái iPhone">
      <div className="preset-grid">{statusPresets.map(p=><button key={p.label} onClick={()=>setState(s=>({...s,...p}))}>{p.label}</button>)}</div>
      <div className="field-grid two"><Field label="Giờ trên điện thoại"><input value={state.time} maxLength={5} onChange={e=>setState(s=>({...s,time:e.target.value}))}/></Field><Field label="Pin"><input type="number" min={0} max={100} value={state.battery} onChange={e=>setState(s=>({...s,battery:e.target.value}))}/></Field></div>
      <Field label="Số vạch sóng"><select value={state.signal} onChange={e=>setState(s=>({...s,signal:Number(e.target.value)}))}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n} vạch</option>)}</select></Field>
      <label className="toggle-row"><input type="checkbox" checked={state.wifi} onChange={e=>setState(s=>({...s,wifi:e.target.checked}))}/>Wi-Fi</label>
      {!state.wifi?<Field label="Mạng di động"><select value={state.carrier==='4G'?'4G':'5G'} onChange={e=>setState(s=>({...s,carrier:e.target.value}))}><option>4G</option><option>5G</option></select></Field>:null}
    </PanelSection>
    <PanelSection title="Xuất ảnh minh họa">
      <div className="export-meta"><span>736 × 1600 px</span><span>Có nhãn mô phỏng</span></div>
      <Field label="Định dạng ảnh"><select aria-label="Định dạng ảnh" value={state.format} onChange={e=>setState(s=>({...s,format:e.target.value}))}><option value="png">PNG chất lượng cao</option><option value="jpg">JPG nhẹ hơn</option></select></Field>
      <button className="button primary download-wide" disabled={exporting} onClick={onDownload}>{exporting?'Đang tạo ảnh…':`Tải ảnh ${state.format.toUpperCase()}`}</button>
      <button className="button secondary download-wide" onClick={onCopy}>Sao chép ảnh có nhãn</button>
    </PanelSection>
  </aside>
}

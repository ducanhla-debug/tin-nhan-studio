export const bankStyles = { vcb:'Vietcombank · Xanh lá', vietin:'VietinBank · Xanh trời', tcb:'Techcombank · Tối giản', mb:'MB · Vàng đồng' }
export const initialBank = {
  style:'vcb', amount:'1300000', recipient:'NGUYEN VAN A', account:'0000 0000 0000',
  recipientBank:'Ngân hàng minh họa', note:'Nội dung chuyển khoản mẫu',
  date:'2026-10-12', time:'14:35', reference:'DEMO-20261012-001',
  labelX:50, labelY:79, labelSize:16,
}
const number=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value))
export function normalizeBank(value={}) {
  const b={...initialBank,...value}
  b.style=Object.hasOwn(bankStyles,b.style)?b.style:'vcb'
  for(const key of ['recipient','account','recipientBank','note','reference','date','time'])b[key]=String(b[key]??'').slice(0,key==='note'?160:80)
  b.amount=String(b.amount??'').replace(/[^0-9]/g,'').slice(0,15)
  b.labelX=clamp(number(b.labelX,50),0,100);b.labelY=clamp(number(b.labelY,79),0,100)
  b.labelSize=clamp(number(b.labelSize,16),14,22)
  return b
}
export function labelGeometry(value,width=393,height=393*1600/736) {
  const b=normalizeBank(value),w=Math.min(width-20,b.labelSize*16.4+24),h=b.labelSize*2.5+14
  return {x:10+(width-w-20)*b.labelX/100,y:10+(height-h-20)*b.labelY/100,w,h,size:b.labelSize}
}
export function moveLabel(value,x,y,width=393,height=393*1600/736) {
  const g=labelGeometry(value,width,height)
  return normalizeBank({...value,labelX:(x-10)/Math.max(1,width-g.w-20)*100,labelY:(y-10)/Math.max(1,height-g.h-20)*100})
}
export function amountText(value){return (normalizeBank({amount:value}).amount||'0').replace(/\B(?=(\d{3})+(?!\d))/g,',')}

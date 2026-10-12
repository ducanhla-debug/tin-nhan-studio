import {font} from './typography.js'
import {normalizeBank,labelGeometry,amountText} from './bankModel.js'

function box(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=.8;ctx.strokeStyle=stroke;ctx.stroke()}}
function write(ctx,value,x,y,size,color,weight=400,align='left',max=350){
  ctx.font=font(size,weight);ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.letterSpacing='0px'
  let s=String(value);while(s.length&&ctx.measureText(s).width>max)s=s.slice(0,-1)
  if(s!==String(value))s=s.slice(0,-1)+'…'
  ctx.fillText(s,x,y)
}
function lines(ctx,value,width,size){ctx.font=font(size);const result=[];let row='';for(const ch of Array.from(String(value))){if(ctx.measureText(row+ch).width>width){result.push(row);row=''}row+=ch}if(row)result.push(row);return result}
function check(ctx,x,y,size,color){ctx.strokeStyle=color;ctx.lineWidth=size*.085;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(x+size*.25,y+size*.52);ctx.lineTo(x+size*.43,y+size*.69);ctx.lineTo(x+size*.76,y+size*.32);ctx.stroke()}
function dateText(b){const parts=b.date.split('-');return `${parts.length===3?parts.reverse().join('/'):b.date}  ${b.time}`}
export function renderSimulationLabel(ctx,value,W,H){
  const g=labelGeometry(value,W,H)
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.shadowColor='#00000030';ctx.shadowBlur=6
  box(ctx,g.x,g.y,g.w,g.h,8,'#fff3bd','#895400');ctx.shadowBlur=0
  write(ctx,'MÔ PHỎNG',g.x+g.w/2,g.y+g.size+9,g.size,'#452b00',800,'center',g.w-14)
  write(ctx,'KHÔNG CÓ GIÁ TRỊ GIAO DỊCH',g.x+g.w/2,g.y+g.h-11,g.size*.7,'#452b00',700,'center',g.w-14)
  ctx.restore();return g
}
export function renderBank(ctx,state,W,H,drawStatus){
  const b=normalizeBank(state.bank),dark=b.style==='vcb',gold=b.style==='mb',simple=b.style==='tcb'
  const fg=dark?'#fff':simple?'#171717':gold?'#54371d':'#102c43'
  const muted=dark?'#b6c5d0':gold?'#766655':'#647582'
  const accent=dark?'#c5f569':simple?'#d71920':gold?'#9e6930':'#0878b1'
  const bg=ctx.createLinearGradient(0,0,W,H)
  if(dark){bg.addColorStop(0,'#13564d');bg.addColorStop(.5,'#071526');bg.addColorStop(1,'#070f22')}
  else if(gold){bg.addColorStop(0,'#efc18a');bg.addColorStop(.4,'#e8d59c');bg.addColorStop(1,'#774d3b')}
  else {bg.addColorStop(0,simple?'#fcf8ed':'#def3fc');bg.addColorStop(.3,simple?'#fffdf6':'#fafaff');bg.addColorStop(1,simple?'#fff':'#f8f8ff')}
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
  if(gold){const halo=ctx.createRadialGradient(W/2,330,10,W/2,330,300);halo.addColorStop(0,'#fff6ceba');halo.addColorStop(1,'#fff6ce00');ctx.fillStyle=halo;ctx.fillRect(0,100,W,520)}
  drawStatus(ctx,{...state,platform:'imessage'},{fg,dark})
  const brands={vcb:'VCB Digibank',vietin:'VietinBank',tcb:'TECHCOMBANK',mb:'MB'}
  write(ctx,brands[b.style],simple?28:W/2,88,simple?21:25,accent,800,simple?'left':'center')
  write(ctx,'MẪU THIẾT KẾ • KHÔNG KẾT NỐI NGÂN HÀNG',W/2,109,8.5,muted,500,'center')
  const cy=simple?167:173
  box(ctx,simple?28:W/2-31,cy-30,62,62,31,dark?'#c8ee6d':simple?'#34c759':gold?'#fff4cb':'#b1f1cf')
  check(ctx,simple?28:W/2-31,cy-30,62,dark?'#30591f':simple?'#fff':gold?'#916621':'#07864c')
  const align=simple?'left':'center',cx=simple?28:W/2
  write(ctx,'Chuyển tiền thành công',cx,240,simple?24:20,fg,600,align)
  const amount=`${amountText(b.amount)} VND`
  let amountSize=28
  while(amountSize>16){ctx.font=font(amountSize,700);if(ctx.measureText(amount).width<=W-50)break;amountSize--}
  write(ctx,amount,cx,278,amountSize,dark?'#c5f569':fg,700,align,W-50)
  write(ctx,dateText(b),cx,306,12,muted,400,align)
  if(simple){
    const details=[['Tài khoản nhận',b.recipientBank],['Người nhận',b.recipient],['Số tài khoản',b.account],['Lời nhắn',b.note],['Mã giao dịch mẫu',b.reference]]
    let y=352
    for(const [title,value] of details){write(ctx,title,28,y,13,muted,500);const rows=lines(ctx,value,W-56,17).slice(0,3);rows.forEach((row,i)=>write(ctx,row,28,y+26+i*23,17,fg,600));y+=42+rows.length*23}
  } else if(dark){
    box(ctx,16,336,W-32,286,14,'#ffffff0d','#ffffff15')
    const details=[['Tài khoản nhận',b.account],['Tên người nhận',b.recipient],['Ngân hàng nhận',b.recipientBank],['Nội dung',b.note],['Phí chuyển tiền','Miễn phí'],['Mã giao dịch mẫu',b.reference]]
    details.forEach(([title,value],i)=>{const y=366+i*45;write(ctx,title,28,y,11,muted);write(ctx,value,W-28,y,13,fg,600,'right',210);if(i<5){ctx.fillStyle='#ffffff18';ctx.fillRect(28,y+15,W-56,.6)}})
  } else {
    box(ctx,16,336,W-32,286,14,dark?'#ffffff0d':'#ffffffec',dark?'#ffffff15':'#d5e0e6')
    write(ctx,b.recipient,W/2,372,18,fg,700,'center')
    write(ctx,b.recipientBank,W/2,400,14,muted,400,'center')
    write(ctx,b.account,W/2,427,16,fg,500,'center')
    ctx.fillStyle=dark?'#ffffff22':'#dce3e8';ctx.fillRect(30,446,W-60,.7)
    write(ctx,'Nội dung',30,473,12,muted)
    lines(ctx,b.note,W-60,15).slice(0,3).forEach((row,i)=>write(ctx,row,30,499+i*20,15,fg))
    write(ctx,'Mã giao dịch mẫu',30,578,11,muted)
    write(ctx,b.reference,W-30,603,13,fg,500,'right',W-60)
  }
  const buttonsY=H-134
  if(!simple){for(const [i,label] of ['Chia sẻ','Lưu ảnh','Lưu mẫu'].entries()){const x=W*(i+1)/4;box(ctx,x-19,buttonsY-35,38,38,19,dark?'#ffffff12':'#ffffffbb');write(ctx,['↗','↓','≡'][i],x,buttonsY-9,24,accent,500,'center');write(ctx,label,x,buttonsY+22,12,dark?'#fff':fg,500,'center')}}
  box(ctx,20,H-66,W-40,42,21,simple?'#202020':accent)
  write(ctx,simple?'Hoàn thành':'Thực hiện giao dịch khác',W/2,H-39,16,dark?'#142200':'#fff',600,'center')
  box(ctx,(W-134)/2,H-13,134,5,3,fg)
  // Mandatory final layer, independent of saved visibility/text/opacity flags.
  renderSimulationLabel(ctx,b,W,H)
}

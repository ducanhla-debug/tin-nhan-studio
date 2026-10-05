import { font, prepareTypography } from './typography.js'
import { icon } from './icons.js'

export const canvasSize = { width: 1080, height: 1920 }
export const logicalSize = { width: 393, height: 393 * 16 / 9 }
const W = logicalSize.width
const H = logicalSize.height
const SCALE = canvasSize.width / W
const images = new Map()
const hitRegions = new WeakMap()
const themes = {
  messenger: {accent:'#0084ff',bg:'#ffffff',incoming:'#f0f0f0',outgoing:'#0084ff'},
  zalo: {accent:'#0088ff',bg:'#e2e9f1',incoming:'#ffffff',outgoing:'#d3eaff'},
  imessage: {accent:'#007aff',bg:'#ffffff',incoming:'#e9e9eb',outgoing:'#007aff'},
}
function theme(state) {
  const t = {...(themes[state.platform] || themes.messenger),dark:state.appearance==='dark'}
  t.fg=t.dark?'#ffffff':'#000000';t.muted=t.dark?'#98989f':'#8e8e93';t.panel=t.dark?'#1c1c1e':'#ffffff'
  if(t.dark){t.bg=state.platform==='zalo'?'#111820':'#000000';t.incoming=state.platform==='zalo'?'#273240':'#262629';if(state.platform==='zalo')t.outgoing='#193e60'}
  if(state.platform==='imessage'&&state.messageService==='sms')t.outgoing='#34c759'
  return t
}
function rect(ctx,x,y,w,h,r,color,stroke) {
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill()
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.5;ctx.stroke()}
}
function text(ctx,value,x,y,size=17,color='#000',weight=400,align='left') {
  ctx.font=font(size,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic'
  ctx.letterSpacing=size>=15?'-0.3px':'0px';ctx.fillText(String(value),x,y)
}
function truncated(ctx,value,width,size,weight=400) {
  ctx.font=font(size,weight);ctx.letterSpacing=size>=15?'-0.3px':'0px'
  let result=String(value || '')
  if(ctx.measureText(result).width<=width)return result
  while(result.length&&ctx.measureText(`${result}…`).width>width)result=result.slice(0,-1)
  return `${result}…`
}
const graphemes = typeof Intl.Segmenter==='function' ? new Intl.Segmenter('vi',{granularity:'grapheme'}) : null
export function wrapLines(ctx,value,maxWidth) {
  const lines=[]
  for(const paragraph of String(value||'').split('\n')) {
    if(!paragraph.trim()){lines.push('');continue}
    let line=''
    for(const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate=line?`${line} ${word}`:word
      if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue}
      if(line){lines.push(line);line=''}
      if(ctx.measureText(word).width<=maxWidth){line=word;continue}
      // URL/unbroken text must never grow a bubble beyond the safe margins.
      const chars=graphemes?Array.from(graphemes.segment(word),part=>part.segment):Array.from(word)
      for(const char of chars){if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line=''}line+=char}
    }
    if(line)lines.push(line)
  }
  return lines
}
function imageFor(src) {
  if(!src)return Promise.resolve(null)
  if(!images.has(src))images.set(src,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src}))
  return images.get(src)
}
function photo(ctx,img,x,y,w,h,r=14) {
  if(!img)return
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.clip()
  const scale=Math.max(w/img.width,h/img.height)
  ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);ctx.restore()
}
async function avatar(ctx,state,x,y,size,t) {
  const img=await imageFor(state.avatar)
  if(img){photo(ctx,img,x,y,size,size,size/2);return}
  rect(ctx,x,y,size,size,size/2,t.dark?'#5d5d63':'#d4d4d9')
  ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#fff'
  ctx.beginPath();ctx.arc(x+size/2,y+size*.38,size*.17,0,Math.PI*2);ctx.fill()
  ctx.beginPath();ctx.ellipse(x+size/2,y+size*.9,size*.34,size*.32,0,0,Math.PI*2);ctx.fill();ctx.restore()
}
function glass(ctx,x,y,w,h,r,t) {
  ctx.save();ctx.shadowColor=t.dark?'#00000050':'#00000012';ctx.shadowBlur=5*SCALE;ctx.shadowOffsetY=1*SCALE
  rect(ctx,x,y,w,h,r,t.dark?'#29292bdc':'#fafafadd',t.dark?'#ffffff25':'#ffffffee');ctx.restore()
}
function status(ctx,state,t) {
  const fg=state.platform==='zalo'?'#fff':t.fg
  text(ctx,state.time || '09:41',56,35,17,fg,600,'center')
  rect(ctx,(W-126)/2,11,126,37,19,'#000')
  for(let i=0;i<4;i++)rect(ctx,294+i*5,35-(4+i*3),3.4,4+i*3,1,i<Number(state.signal)?fg:`${fg}40`)
  if(state.wifi){
    ctx.save();ctx.translate(324,29);ctx.strokeStyle=fg;ctx.lineWidth=2.1;ctx.lineCap='round'
    for(const r of [8,5]){ctx.beginPath();ctx.arc(0,4,r,Math.PI*1.21,Math.PI*1.79);ctx.stroke()}
    ctx.beginPath();ctx.arc(0,2,1.3,0,Math.PI*2);ctx.fillStyle=fg;ctx.fill();ctx.restore()
  } else text(ctx,state.carrier || '5G',325,34,13,fg,600,'center')
  const charge=Math.max(0,Math.min(100,Number(state.battery)||0))
  const batteryColor=charge<=20?'#ff453a':fg
  rect(ctx,342,24,27,12.5,3,'transparent',`${fg}70`);rect(ctx,370,28,1.6,4.4,1,`${fg}70`)
  // Percentage remains readable against both charged and empty portions.
  rect(ctx,343.5,25.5,24,9.5,2,`${fg}25`);rect(ctx,343.5,25.5,Math.max(1,24*charge/100),9.5,2,batteryColor)
  text(ctx,charge,355.5,33.1,9,t.dark||state.platform==='zalo'?'#111':'#fff',700,'center')
}
async function header(ctx,state,t) {
  if(state.platform==='imessage') {
    glass(ctx,16,64,36,36,18,t);icon(ctx,'back',22,70,24,t.fg)
    await avatar(ctx,state,(W-36)/2,60,36,t)
    const name=truncated(ctx,state.name||'Người dùng',210,13,600)
    ctx.font=font(13,600);const width=ctx.measureText(name).width+24
    glass(ctx,(W-width)/2,101,width,25,13,t)
    text(ctx,name,W/2-5,118,13,t.fg,600,'center');icon(ctx,'chevron',(W+width)/2-15,109,10,t.muted)
    return 134
  }
  const zalo=state.platform==='zalo'
  const fg=zalo?'#fff':t.fg
  const activity=state.activity==='Không hiển thị'?'':state.activity
  icon(ctx,'back',10,69,24,zalo?'#fff':t.accent)
  if(!zalo){await avatar(ctx,state,42,63,34,t);if(activity==='Đang hoạt động')rect(ctx,65,88,10,10,5,'#31c450',t.panel)}
  const x=zalo?48:85
  const max=zalo?185:195
  text(ctx,truncated(ctx,state.name||'Người dùng',max,17,600),x,activity?77:87,17,fg,600)
  if(activity)text(ctx,truncated(ctx,activity,max,12),x,94,12,zalo?'#e1f2ff':t.muted)
  icon(ctx,'phone',zalo?277:304,71,21,zalo?'#fff':t.accent)
  icon(ctx,'video',zalo?317:351,70,23,zalo?'#fff':t.accent)
  if(zalo)icon(ctx,'menu',361,71,22,'#fff')
  return 104
}
function timeMinutes(value) {return /^\d{1,2}:\d{2}$/.test(value||'')?Number(value.split(':')[0])*60+Number(value.split(':')[1]):null}
export function layoutMessages(ctx,state,top,bottom) {
  const apple=state.platform==='imessage',zalo=state.platform==='zalo'
  const size=17,lineHeight=22,padding=apple?12:11,maxWidth=apple?291:287
  ctx.font=font(size);ctx.letterSpacing='-0.3px'
  const lastIndex=state.messages.findIndex(m=>m.id===state.captureEndId)
  const messages=lastIndex>=0?state.messages.slice(0,lastIndex+1):state.messages
  let cursor=0
  const layouts=messages.map((message,i)=>{
    const previous=messages[i-1],next=messages[i+1]
    const currentTime=timeMinutes(message.time),previousTime=timeMinutes(previous?.time)
    const timestamp=Boolean(message.time&&(!previous||currentTime===null||previousTime===null||Math.abs(currentTime-previousTime)>5))
    const groupStart=!previous||previous.sender!==message.sender||timestamp
    const groupEnd=!next||next.sender!==message.sender||(timeMinutes(next.time)!==null&&currentTime!==null&&Math.abs(timeMinutes(next.time)-currentTime)>5)
    const isImage=message.type==='image'&&message.image
    const lines=isImage?[]:wrapLines(ctx,message.text,maxWidth-padding*2)
    const width=isImage?244:Math.max(apple?43:52,...lines.map(line=>ctx.measureText(line).width+padding*2))
    const height=isImage?183:Math.max(36,lines.length*lineHeight+14+(zalo?17:0))
    const timeHeight=timestamp?30:0
    const gap=groupStart?8:2
    cursor+=timeHeight+gap
    const item={message,lines,w:width,h:height,x:message.sender==='me'?W-12-width:apple?12:44,y:cursor,groupStart,groupEnd,timeHeight,padding,size,lineHeight}
    cursor+=height+(message.reaction?13:0)
    return item
  })
  // Keep complete messages and clip a long first bubble as an actual viewport does.
  if(messages.at(-1)?.sender==='me'&&state.deliveryState&&state.deliveryState!=='none')cursor+=20
  let shift=bottom-cursor-8
  if(state.mode==='focus'){
    const selected=layouts.find(item=>item.message.id===state.selectedId)
    if(selected&&(selected.y+shift<top+10||selected.y+selected.h+shift>bottom-8))shift=bottom-selected.y-selected.h-8
  }
  return layouts.map(item=>({...item,y:item.y+shift})).filter(item=>item.y+item.h>=top&&item.y-item.timeHeight<=bottom)
}
function bubbleShape(ctx,item,state,color) {
  const {x,y,w,h,groupStart,groupEnd,message}=item
  const apple=state.platform==='imessage',zalo=state.platform==='zalo',out=message.sender==='me'
  const r=apple?18:zalo?10:18
  const radii=out?[r,groupStart?r:5,groupEnd?r:5,r]:[groupStart?r:5,r,r,groupEnd?r:5]
  rect(ctx,x,y,w,h,radii,color,zalo?state.appearance==='dark'?'#394350':'#cfd6df':null)
  if(apple&&groupEnd&&message.type!=='image'){
    ctx.fillStyle=color;ctx.beginPath()
    if(out){ctx.moveTo(x+w-13,y+h-14);ctx.bezierCurveTo(x+w-2,y+h-9,x+w-4,y+h-2,x+w+6,y+h);ctx.bezierCurveTo(x+w-4,y+h+2,x+w-12,y+h-1,x+w-20,y+h-5)}
    else{ctx.moveTo(x+13,y+h-14);ctx.bezierCurveTo(x+2,y+h-9,x+4,y+h-2,x-6,y+h);ctx.bezierCurveTo(x+4,y+h+2,x+12,y+h-1,x+20,y+h-5)}
    ctx.fill()
  }
}
async function bubble(ctx,item,state,t,hideReaction=false) {
  const {message,x,y,w,h,lines,padding,lineHeight,size}=item
  const out=message.sender==='me',apple=state.platform==='imessage',zalo=state.platform==='zalo'
  bubbleShape(ctx,item,state,out?t.outgoing:t.incoming)
  if(message.type==='image'&&message.image)photo(ctx,await imageFor(message.image),x,y,w,h,14)
  else lines.forEach((line,i)=>text(ctx,line,x+padding,y+24+i*lineHeight,size,out&&!zalo?'#fff':t.fg))
  if(zalo&&message.time)text(ctx,message.time,x+w-9,y+h-8,10,t.muted,400,'right')
  if(message.reaction&&!hideReaction){
    const rx=x+w-18,ry=apple?y-8:y+h-6
    rect(ctx,rx,ry,28,21,11,t.dark?'#38383b':'#fff',t.dark?'#000':'#e5e5e9')
    text(ctx,message.reaction,rx+14,ry+16,15,t.fg,400,'center')
  }
}
async function messages(ctx,state,t,top,bottom) {
  const layouts=layoutMessages(ctx,state,top,bottom)
  ctx.save();ctx.beginPath();ctx.rect(0,top,W,bottom-top);ctx.clip()
  for(const item of layouts){
    if(item.timeHeight)text(ctx,state.platform==='imessage'?`Hôm nay ${item.message.time}`:item.message.time,W/2,item.y-12,11,t.muted,500,'center')
    if(item.message.sender==='them'&&state.platform!=='imessage'&&item.groupEnd)await avatar(ctx,state,8,item.y+item.h-29,28,t)
    await bubble(ctx,item,state,t)
  }
  const last=layouts.at(-1)
  if(last?.message.sender==='me'&&state.deliveryState&&state.deliveryState!=='none'){
    const y=last.y+last.h+(last.message.reaction?31:17)
    if(state.platform==='messenger'&&state.deliveryState==='seen')await avatar(ctx,state,W-22,y-10,12,t)
    else if(state.platform==='messenger'){rect(ctx,W-22,y-10,12,12,6,t.muted);icon(ctx,'check',W-20,y-8,8,t.panel)}
    else text(ctx,state.deliveryState==='seen'?state.platform==='imessage'?'Đã đọc':'Đã xem':state.platform==='imessage'?'Đã phát':'Đã nhận',W-12,y,11,t.muted,500,'right')
  }
  ctx.restore();return layouts
}
export function composerTop(state) {return state.keyboard?H-291:H-86}
function home(ctx,t) {rect(ctx,(W-134)/2,H-13,134,5,3,t.fg)}
function composer(ctx,state,t) {
  const y=composerTop(state)
  ctx.fillStyle=t.panel;ctx.fillRect(0,y,W,H-y)
  const muted=t.muted
  if(state.platform==='imessage'){
    glass(ctx,12,y+8,36,36,18,t);icon(ctx,'plus',19,y+15,22,t.fg)
    glass(ctx,57,y+8,W-69,36,18,t)
    text(ctx,state.messageService==='sms'?'Tin nhắn văn bản • SMS':'iMessage',70,y+32,17,muted)
    icon(ctx,'mic',W-39,y+17,18,muted)
  } else if(state.platform==='zalo'){
    icon(ctx,'smile',10,y+16,24,t.fg);text(ctx,'Tin nhắn',47,y+36,18,muted)
    icon(ctx,'dots',W-123,y+17,24,t.muted);icon(ctx,'mic',W-80,y+15,25,t.fg);icon(ctx,'image',W-35,y+16,24,t.fg)
  } else {
    icon(ctx,'chevron',8,y+20,22,t.accent);icon(ctx,'camera',38,y+20,21,t.accent);icon(ctx,'image',69,y+20,21,t.accent);icon(ctx,'mic',100,y+20,21,t.accent)
    rect(ctx,132,y+12,W-173,36,18,t.dark?'#262629':'#f0f0f0')
    text(ctx,'Aa',145,y+37,17,muted);icon(ctx,'smile',W-69,y+21,20,t.accent);icon(ctx,'thumb',W-29,y+21,21,t.accent,true)
  }
  if(state.keyboard)keyboard(ctx,t);else home(ctx,t)
}
function keyboard(ctx,t) {
  const y=H-233
  ctx.fillStyle=t.dark?'#242426':'#d1d3d9';ctx.fillRect(0,y,W,233)
  const key=t.dark?'#626267':'#fff',fg=t.fg
  text(ctx,'Em',W/6,y+24,17,fg,400,'center');text(ctx,'Có',W/2,y+24,17,fg,400,'center');text(ctx,'Anh',W*5/6,y+24,17,fg,400,'center')
  for(const [row,index] of ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((row,i)=>[row,i])){
    const width=32,gap=6,total=row.length*width+(row.length-1)*gap,start=(W-total)/2,ky=y+36+index*43
    for(const [i,letter] of [...row].entries()){rect(ctx,start+i*(width+gap),ky,width,36,5,key);text(ctx,letter,start+i*(width+gap)+width/2,ky+26,22,fg,400,'center')}
  }
  rect(ctx,4,y+122,39,36,5,t.dark?'#404044':'#aeb3bd');icon(ctx,'shift',13,y+130,21,fg,true)
  rect(ctx,W-43,y+122,39,36,5,t.dark?'#404044':'#aeb3bd');icon(ctx,'erase',W-36,y+130,25,fg)
  rect(ctx,4,y+165,44,36,5,t.dark?'#404044':'#aeb3bd');text(ctx,'123',26,y+189,16,fg,400,'center')
  rect(ctx,54,y+165,38,36,5,key);text(ctx,'☺',73,y+190,21,fg,400,'center')
  rect(ctx,98,y+165,195,36,5,key);text(ctx,'dấu cách',195.5,y+189,17,fg,400,'center')
  rect(ctx,299,y+165,90,36,5,t.dark?'#404044':'#aeb3bd');text(ctx,'Nhập',344,y+189,17,fg,400,'center')
  icon(ctx,'globe',25,H-25,20,fg);icon(ctx,'mic',W-44,H-25,19,fg);home(ctx,t)
}
async function full(ctx,state,{bottom,skipComposer=false,skipStatus=false}={}) {
  const t=theme(state)
  ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H)
  if(state.platform==='zalo'){
    const gradient=ctx.createLinearGradient(0,0,W,104);gradient.addColorStop(0,'#0084ff');gradient.addColorStop(1,'#00b5ee')
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,104)
  }
  if(!skipStatus)status(ctx,state,t)
  const top=await header(ctx,state,t)
  const layouts=await messages(ctx,state,t,top,bottom??composerTop(state)-8)
  if(!skipComposer)composer(ctx,state,t)
  return layouts
}
function surface() {
  const c=document.createElement('canvas');c.width=canvasSize.width;c.height=canvasSize.height
  const ctx=c.getContext('2d');ctx.scale(SCALE,SCALE);return {canvas:c,ctx}
}
function backdrop(ctx,c,t) {
  ctx.save();ctx.filter=`blur(${8*SCALE}px)`;ctx.drawImage(c,-4,-4,W+8,H+8);ctx.restore()
  ctx.fillStyle=t.dark?'#00000070':'#00000035';ctx.fillRect(0,0,W,H)
}
function menu(ctx,actions,x,y,width,t) {
  glass(ctx,x,y,width,actions.length*44,14,t)
  actions.forEach(([label,symbol,color],i)=>{
    if(i){ctx.fillStyle=t.dark?'#ffffff25':'#00000020';ctx.fillRect(x,y+i*44,width,.5)}
    text(ctx,label,x+16,y+i*44+28,17,color||t.fg)
    icon(ctx,symbol,x+width-38,y+i*44+13,20,color||t.fg)
  })
}
async function focus(ctx,state) {
  const t=theme(state),base=surface()
  const layouts=await full(base.ctx,state)
  const selected=layouts.find(item=>item.message.id===state.selectedId)||layouts.at(-1)
  backdrop(ctx,base.canvas,t)
  if(!selected)return []
  const scale=Math.min(1,(H-320)/selected.h)
  const h=selected.h*scale,w=selected.w*scale
  const y=Math.max(137,Math.min(H-238-h,selected.y)),x=selected.message.sender==='me'?W-16-w:16
  const item={...selected,x,y,w,h}
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);await bubble(ctx,{...selected,x:0,y:0},state,t,true);ctx.restore()
  const apple=state.platform==='imessage',zalo=state.platform==='zalo'
  const reactions=apple?['❤️','👍','👎','😂','‼️','❓']:zalo?['❤️','👍','😆','😮','😢','😡']:['❤️','😆','😮','😢','😡','👍']
  const barW=apple?304:318,barX=Math.max(12,Math.min(W-barW-12,x+w-barW))
  glass(ctx,barX,y-60,barW,48,24,t)
  reactions.forEach((reaction,i)=>text(ctx,reaction,barX+25+i*43,y-27,25,t.fg,400,'center'))
  icon(ctx,'plus',barX+barW-31,y-45,20,t.muted)
  const actions=apple?[['Trả lời','reply'],['Sao chép','copy'],['Dịch','translate'],['Khác','dots']]:zalo?[['Trả lời','reply'],['Chuyển tiếp','forward'],['Sao chép','copy'],['Thu hồi','trash']]:[['Trả lời','reply'],['Sao chép','copy'],['Chuyển tiếp','forward'],['Khác','dots']]
  menu(ctx,actions,Math.max(12,Math.min(W-262,x)),y+h+14,250,t)
  return [item]
}
async function preview(ctx,state) {
  const t=theme(state),base=surface();await full(base.ctx,{...state,mode:'full'})
  backdrop(ctx,base.canvas,t)
  const card=surface(),cardHeight=H-245
  await full(card.ctx,{...state,keyboard:false,mode:'full'},{bottom:59+cardHeight-12,skipComposer:true,skipStatus:true})
  ctx.save();ctx.shadowColor='#00000035';ctx.shadowBlur=14*SCALE;rect(ctx,16,64,W-32,cardHeight,22,t.bg);ctx.restore()
  ctx.save();ctx.beginPath();ctx.roundRect(16,64,W-32,cardHeight,22);ctx.clip()
  const scale=(W-32)/W
  // Uniform scaling only: no stretched text, icons or photo proportions.
  ctx.drawImage(card.canvas,0,59*SCALE,canvasSize.width,cardHeight/scale*SCALE,16,64,W-32,cardHeight);ctx.restore()
  const actions=state.platform==='imessage'?[['Đánh dấu chưa đọc','unread'],['Ẩn cảnh báo','bell'],['Xóa','trash','#ff453a']]:state.platform==='zalo'?[['Đánh dấu chưa đọc','unread'],['Tắt thông báo','bell'],['Ẩn trò chuyện','archive']]:[['Đánh dấu chưa đọc','unread'],['Tắt thông báo','bell'],['Lưu trữ','archive']]
  menu(ctx,actions,24,64+cardHeight+14,Math.min(300,W-48),t);home(ctx,t);return []
}
export async function renderToCanvas(canvas,state) {
  await prepareTypography()
  await Promise.all([imageFor(state.avatar),...state.messages.filter(m=>m.image).map(m=>imageFor(m.image))])
  const drawing=surface()
  const layouts=state.mode==='focus'?await focus(drawing.ctx,state):state.mode==='preview'?await preview(drawing.ctx,state):await full(drawing.ctx,state)
  canvas.width=canvasSize.width;canvas.height=canvasSize.height
  canvas.getContext('2d').drawImage(drawing.canvas,0,0)
  hitRegions.set(canvas,layouts)
  return canvas
}
export function messageAtPoint(canvas,x,y) {
  return (hitRegions.get(canvas)||[]).findLast(item=>x>=item.x&&x<=item.x+item.w&&y>=item.y&&y<=item.y+item.h)?.message.id || null
}
export function commitRenderedCanvas(source,target) {
  target.width=source.width;target.height=source.height
  target.getContext('2d').drawImage(source,0,0)
  hitRegions.set(target,hitRegions.get(source)||[])
}
export async function canvasToBlob(canvas,format='png') {
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Không thể tạo ảnh.')),format==='jpg'?'image/jpeg':'image/png',format==='jpg'?.94:undefined))
}

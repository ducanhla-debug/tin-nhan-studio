import { font, prepareTypography, chatTypography } from './typography.js'
import { icon } from './icons.js'

export const canvasSize = { width: 736, height: 1600 }
export const logicalSize = { width: 393, height: 393 * canvasSize.height / canvasSize.width }
const W = logicalSize.width
const H = logicalSize.height
const SCALE = canvasSize.width / W
const images = new Map()
const hitRegions = new WeakMap()
const keyboardContexts = new WeakSet()
const themes = {
  messenger: {accent:'#2864ef',bg:'#ffffff',incoming:'#f2f2f6',outgoing:'#2864ef'},
  zalo: {accent:'#0088ff',bg:'#e2e9f1',incoming:'#ffffff',outgoing:'#cff0fb'},
  imessage: {accent:'#007aff',bg:'#ffffff',incoming:'#e9e9eb',outgoing:'#38b4f5'},
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
function text(ctx,value,x,y,size=17,color='#000',weight=400,align='left',tracking,role='ui') {
  if(keyboardContexts.has(ctx)){role='keyboard';tracking=size>=15?'-0.3px':'0px'}
  ctx.font=font(size,weight,role);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic'
  ctx.letterSpacing=tracking ?? (size>=15?'-0.2px':'0px');ctx.fillText(String(value),x,y)
}
function truncated(ctx,value,width,size,weight=400) {
  ctx.font=font(size,weight);ctx.letterSpacing=size>=15?'-0.2px':'0px'
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
  let background=t.dark?'#5d5d63':'#d4d4d9'
  if(state.platform==='imessage'&&!t.dark){background=ctx.createLinearGradient(x,y,x,y+size);background.addColorStop(0,'#afc7e3');background.addColorStop(1,'#808bc6')}
  rect(ctx,x,y,size,size,size/2,background)
  ctx.save();ctx.beginPath();ctx.arc(x+size/2,y+size/2,size/2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#fff'
  ctx.beginPath();ctx.arc(x+size/2,y+size*.38,size*.17,0,Math.PI*2);ctx.fill()
  ctx.beginPath();ctx.ellipse(x+size/2,y+size*.79,size*.34,size*.15,0,0,Math.PI*2);ctx.fill();ctx.restore()
}
function glass(ctx,x,y,w,h,r,t) {
  ctx.save();ctx.shadowColor=t.dark?'#00000050':'#00000012';ctx.shadowBlur=5*SCALE;ctx.shadowOffsetY=1*SCALE
  rect(ctx,x,y,w,h,r,t.dark?'#29292bdc':'#fafafadd',t.dark?'#ffffff25':'#ffffffee');ctx.restore()
}
export function statusValues(state) {
  const battery=Number(state.battery),signal=Number(state.signal)
  return {battery:Number.isFinite(battery)?Math.max(0,Math.min(100,Math.round(battery))):100,signal:Number.isFinite(signal)?Math.max(0,Math.min(4,Math.round(signal))):4}
}
function status(ctx,state,t) {
  const fg=state.platform==='zalo'?'#fff':t.fg
  text(ctx,state.time || '09:41',45,35,16,fg,600)
  icon(ctx,'statusGlobe',91,23,12,fg)
  rect(ctx,(W-112)/2,13,112,32,16,'#000')
  const values=statusValues(state)
  // Solid stepped bars, aligned to the Wi-Fi/battery baseline.
  for(let i=0;i<4;i++)rect(ctx,280+i*5.2,35-(5+i*2.6),3.5,5+i*2.6,.9,i<values.signal?fg:`${fg}35`)
  if(state.wifi){
    ctx.save();ctx.translate(306,22);ctx.fillStyle=fg
    // Three filled, tapered bands rather than generic thin outline arcs.
    ctx.fill(new Path2D('M0 4.8C5-0.7 13-0.7 18 4.8L15.8 7C12 3.1 6 3.1 2.2 7Z M4 8.5C6.8 5.5 11.2 5.5 14 8.5L11.8 10.7C10.2 9.1 7.8 9.1 6.2 10.7Z M7.2 12C8.2 10.9 9.8 10.9 10.8 12L9 13.8Z'))
    ctx.restore()
  } else text(ctx,state.carrier || '5G',315,34.5,12,fg,600,'center')
  const charge=values.battery
  const batteryColor=charge<=20?'#ff453a':fg
  const bx=332,by=22.5,bw=27,bh=13.5
  rect(ctx,bx,by,bw,bh,4,`${fg}35`)
  ctx.save();ctx.beginPath();ctx.roundRect(bx,by,bw,bh,4);ctx.clip()
  ctx.fillStyle=batteryColor;ctx.fillRect(bx,by,bw*charge/100,bh);ctx.restore()
  // The terminal is separate from the rounded body, as in the reference.
  ctx.fillStyle=`${fg}50`;ctx.beginPath();ctx.ellipse(bx+bw+1.5,by+bh/2,1.1,2.2,0,-Math.PI/2,Math.PI/2);ctx.fill()
  const digitsColor=charge<=20?'#fff':t.dark||state.platform==='zalo'?'#111':'#fff'
  text(ctx,charge,bx+bw/2,by+10.7,11.5,digitsColor,700,'center')
}
export function conversationTop(state) {
  // Reserve space below the service/encryption labels before the first date row.
  return state.platform==='imessage' ? state.messageService==='sms'?158:170 : state.platform==='zalo'?90:95
}
async function header(ctx,state,t) {
  if(state.platform==='imessage') {
    const count=Math.max(0,Math.min(9999,Number(state.inboxCount)||0))
    glass(ctx,18,56,count?82:44,39,20,t);icon(ctx,'back',25,63,24,t.fg)
    if(count){rect(ctx,49,67,36,17,9,t.fg);text(ctx,count,67,79.5,10,t.panel,500,'center')}
    await avatar(ctx,state,(W-54)/2,55,54,t)
    const name=truncated(ctx,state.name||'Người dùng',240,16,700)
    ctx.font=font(16,700);const width=ctx.measureText(name).width+31
    glass(ctx,(W-width)/2,106,width,30,16,t)
    text(ctx,name,W/2-5,127,16,t.fg,700,'center');icon(ctx,'chevron',(W+width)/2-17,115,11,t.muted)
    if(state.messageService!=='sms'){glass(ctx,W-57,56,39,39,20,t);icon(ctx,'video',W-50,63,25,t.fg)}
    text(ctx,state.messageService==='sms'?'Tin nhắn văn bản · SMS':'iMessage',W/2,164,10,t.muted,400,'center')
    if(state.messageService!=='sms'){icon(ctx,'lock',W/2-30,169,7,t.muted,true);text(ctx,'Đã mã hóa',W/2+4,176,9,t.muted,400,'center')}
    return conversationTop(state)
  }
  const zalo=state.platform==='zalo'
  const fg=zalo?'#fff':t.fg
  const activity=state.activity==='Không hiển thị'?'':state.activity
  icon(ctx,'back',10,59,24,zalo?'#fff':t.accent)
  if(!zalo){await avatar(ctx,state,44,56,32,t);if(activity==='Đang hoạt động')rect(ctx,66,79,9,9,5,'#31c450',t.panel)}
  const x=zalo?48:85
  const max=zalo?185:220
  text(ctx,truncated(ctx,state.name||'Người dùng',max,16,600),x,activity?69:77,16,fg,600)
  if(activity)text(ctx,truncated(ctx,activity,max,11),x,85,11,zalo?'#e1f2ff':t.muted)
  icon(ctx,zalo?'zaloPhone':'phone',zalo?273:318,61,21,zalo?'#fff':t.accent,!zalo)
  icon(ctx,zalo?'zaloVideo':'video',zalo?313:355,60,23,zalo?'#fff':t.accent,!zalo)
  if(zalo)icon(ctx,'zaloMenu',355,61,22,'#fff')
  return conversationTop(state)
}
function timeMinutes(value) {return /^\d{1,2}:\d{2}$/.test(value||'')?Number(value.split(':')[0])*60+Number(value.split(':')[1]):null}
export function layoutMessages(ctx,state,top,bottom) {
  const apple=state.platform==='imessage',zalo=state.platform==='zalo'
  const {size,lineHeight,padding,maxWidth,tracking}=chatTypography[state.platform]||chatTypography.messenger
  ctx.font=font(size);ctx.letterSpacing=tracking
  const lastIndex=state.messages.findIndex(m=>m.id===state.captureEndId)
  const messages=lastIndex>=0?state.messages.slice(0,lastIndex+1):state.messages
  const lastSent=messages.findLastIndex(message=>message.sender==='me')
  let cursor=0
  const layouts=messages.map((message,i)=>{
    const previous=messages[i-1],next=messages[i+1]
    const currentTime=timeMinutes(message.time),previousTime=timeMinutes(previous?.time)
    const timestamp=Boolean(message.time&&(!previous||currentTime===null||previousTime===null||Math.abs(currentTime-previousTime)>5))
    const groupStart=!previous||previous.sender!==message.sender||timestamp||Boolean(message.dateSeparator)
    const groupEnd=!next||next.sender!==message.sender||Boolean(next.dateSeparator)||(timeMinutes(next.time)!==null&&currentTime!==null&&Math.abs(timeMinutes(next.time)-currentTime)>5)
    const isImage=message.type==='image'&&message.image
    const bubbleMax=state.platform==='messenger'&&message.sender==='them'?264:maxWidth
    const lines=isImage?[]:wrapLines(ctx,message.text,bubbleMax-padding*2)
    const width=isImage?244:Math.max(apple?43:34,...lines.map(line=>ctx.measureText(line).width+padding*2))
    const showTime=zalo&&groupEnd&&Boolean(message.time)
    const height=isImage?183:Math.max(34,lines.length*lineHeight+16+(showTime?18:0))
    const timeHeight=message.dateSeparator?38:!zalo&&timestamp?30:0
    const gap=groupStart?10:zalo?4:2
    cursor+=timeHeight+gap
    const item={message,lines,w:width,h:height,x:message.sender==='me'?W-(apple?18:zalo?12:7)-width:apple?18:zalo?38:50,y:cursor,groupStart,groupEnd,timeHeight,showTime,padding,size,lineHeight,tracking}
    if(state.platform==='messenger'&&message.replyText){item.replyWidth=Math.min(264,ctx.measureText(message.replyText).width+22);item.replyHeight=54;item.y+=54;cursor+=54}
    item.showDelivery=Boolean(i===lastSent&&state.deliveryState&&state.deliveryState!=='none')
    cursor+=height+(message.reaction?13:0)
    if(item.showDelivery)cursor+=20
    return item
  })
  // Keep complete messages and clip a long first bubble as an actual viewport does.
  let shift=apple&&cursor<bottom-top?top:bottom-cursor-8
  if(state.mode==='focus'){
    const selected=layouts.find(item=>item.message.id===state.selectedId)
    if(selected&&(selected.y+shift<top+10||selected.y+selected.h+shift>bottom-8))shift=bottom-selected.y-selected.h-8
  }
  return layouts.map(item=>({...item,y:item.y+shift})).filter(item=>item.y+item.h>=top&&item.y-item.timeHeight<=bottom)
}
function bubbleShape(ctx,item,state,color) {
  const {x,y,w,h,groupStart,groupEnd,message}=item
  const apple=state.platform==='imessage',zalo=state.platform==='zalo',out=message.sender==='me'
  const r=apple?20:zalo?10:18
  const radii=apple?[r,r,r,r]:zalo?[9,9,9,9]:out?[r,groupStart?r:2,groupEnd?r:2,r]:[groupStart?r:2,r,r,groupEnd?r:2]
  rect(ctx,x,y,w,h,radii,color,zalo?state.appearance==='dark'?'#394350':'#cfd6df':null)
  if(apple&&groupEnd&&message.type!=='image'){
    ctx.fillStyle=color;ctx.beginPath()
    if(out){ctx.moveTo(x+w-15,y+h-16);ctx.bezierCurveTo(x+w-10,y+h-8,x+w-15,y+h-1,x+w-6,y+h+6);ctx.bezierCurveTo(x+w-20,y+h+3,x+w-24,y+h-4,x+w-24,y+h-10)}
    else{ctx.moveTo(x+15,y+h-16);ctx.bezierCurveTo(x+10,y+h-8,x+15,y+h-1,x+6,y+h+6);ctx.bezierCurveTo(x+20,y+h+3,x+24,y+h-4,x+24,y+h-10)}
    ctx.fill()
  }
}
async function bubble(ctx,item,state,t,hideReaction=false) {
  const {message,x,y,w,h,lines,padding,lineHeight,size}=item
  const out=message.sender==='me',apple=state.platform==='imessage',zalo=state.platform==='zalo'
  let color=out?t.outgoing:t.incoming
  if(out&&state.platform==='messenger'){
    color=ctx.createLinearGradient(0,95,0,composerTop(state));color.addColorStop(0,'#1674ff');color.addColorStop(.65,'#0753f5');color.addColorStop(1,'#1216cc')
  }
  bubbleShape(ctx,item,state,color)
  if(message.type==='image'&&message.image)photo(ctx,await imageFor(message.image),x,y,w,h,14)
  else lines.forEach((line,i)=>text(ctx,line,x+padding,y+(apple?25:24)+i*lineHeight,size,out&&!zalo?'#fff':t.fg,400,'left',item.tracking))
  if(item.showTime)text(ctx,message.time,x+padding,y+h-8,10,t.muted)
  if(message.reaction&&!hideReaction){
    if(apple){
      const rx=Math.min(W-29,x+w-4),ry=y-10
      rect(ctx,rx-14,ry-14,29,29,15,'#008aff')
      if(['❤️','💗','❤','💖'].includes(message.reaction))icon(ctx,'pinkHeart',rx-10,ry-9,20,'#ff6abb',true)
      else text(ctx,message.reaction,rx,ry+8,20,'#fff',400,'center')
      rect(ctx,rx+10,ry+12,6,6,3,'#008aff');rect(ctx,rx+17,ry+19,4,4,2,'#008aff');return
    }
    const rx=x+w-(zalo?66:18),ry=apple?y-8:y+h-6
    rect(ctx,rx,ry,zalo?32:28,21,11,t.dark?'#38383b':'#fff',t.dark?'#000':'#e5e5e9')
    text(ctx,message.reaction,rx+(zalo?12:14),ry+16,15,t.fg,400,'center')
    if(zalo){text(ctx,message.reactionCount||1,rx+25,ry+15,10,t.fg);rect(ctx,x+w-27,ry-7,26,26,13,t.dark?'#38383b':'#f8f9fc','#c4cbd4');text(ctx,message.reaction,x+w-14,ry+12,16,t.fg,400,'center')}
  }
}
async function messages(ctx,state,t,top,bottom) {
  const layouts=layoutMessages(ctx,state,top,bottom)
  ctx.save();ctx.beginPath();ctx.rect(0,top,W,bottom-top);ctx.clip()
  for(const item of layouts){
    if(item.timeHeight){
      const label=item.message.dateSeparator||(state.platform==='imessage'?`Hôm nay ${item.message.time}`:item.message.time)
      if(state.platform==='zalo'){ctx.font=font(11);const width=ctx.measureText(label).width+20;rect(ctx,(W-width)/2,item.y-31,width,20,10,t.dark?'#56616c':'#b4bbc3');text(ctx,label,W/2,item.y-17,11,'#fff',400,'center')}
      else text(ctx,label,W/2,item.y-(item.replyHeight||0)-12,11,t.muted,500,'center')
    }
    if(item.replyHeight){
      const label=`Bạn đã trả lời ${item.message.replyName||state.name}`
      ctx.font=font(10);const labelWidth=ctx.measureText(label).width
      icon(ctx,'reply',W-16-labelWidth-13,item.y-48,10,t.muted,true)
      text(ctx,label,W-12,item.y-40,10,t.muted,400,'right')
      const replyX=item.message.sender==='me'?W-7-item.replyWidth:item.x
      rect(ctx,replyX,item.y-33,item.replyWidth,37,18,t.dark?'#202024':'#fafafa')
      text(ctx,truncated(ctx,item.message.replyText,item.replyWidth-22,14),replyX+11,item.y-12,14,t.muted)
    }
    if(item.message.sender==='them'&&state.platform!=='imessage'&&(state.platform==='zalo'?item.groupStart:item.groupEnd))await avatar(ctx,state,state.platform==='zalo'?10:14,state.platform==='zalo'?item.y:item.y+item.h-25,23,t)
    await bubble(ctx,item,state,t)
    if(item.showDelivery){
    const y=item.y+item.h+(item.message.reaction?30:15)
    if(state.platform==='messenger'&&state.deliveryState==='seen')await avatar(ctx,state,W-22,y-10,12,t)
    else if(state.platform==='messenger'){rect(ctx,W-22,y-10,12,12,6,t.muted);icon(ctx,'check',W-20,y-8,8,t.panel)}
    else if(state.platform==='zalo'){
      rect(ctx,W-67,y-12,55,14,7,t.dark?'#53616e':'#b6c0c8')
      icon(ctx,'check',W-64,y-9,9,'#fff');icon(ctx,'check',W-60,y-9,9,'#fff')
      text(ctx,state.deliveryState==='seen'?'Đã xem':'Đã nhận',W-15,y-2,8.5,'#fff',400,'right')
    }
    else text(ctx,state.deliveryState==='seen'?'Đã đọc':'Đã gửi',W-18,y,10,t.muted,500,'right')
    }
  }
  ctx.restore();return layouts
}
export function composerTop(state) {return state.keyboard?H-352:H-73}
function home(ctx,t) {rect(ctx,(W-134)/2,H-13,134,5,3,t.fg)}
function composer(ctx,state,t) {
  const y=composerTop(state)
  ctx.fillStyle=t.panel;ctx.fillRect(0,y,W,H-y)
  const muted=t.muted
  if(state.platform==='imessage'){
    glass(ctx,25,y+8,36,36,18,t);icon(ctx,'plus',32,y+15,22,t.fg)
    glass(ctx,71,y+8,W-96,36,18,t)
    text(ctx,state.messageService==='sms'?'Tin nhắn văn bản · SMS':'iMessage',85,y+32,15,t.dark?'#777':'#bfc0c3')
    icon(ctx,'mic',W-53,y+17,18,t.dark?'#777':'#bfc0c3')
  } else if(state.platform==='zalo'){
    const controls=t.dark?'#aaa':'#666'
    icon(ctx,'zaloSticker',10,y+10,23,controls);text(ctx,'Tin nhắn',43,y+27,15,muted)
    icon(ctx,'more',W-126,y+12,24,controls);icon(ctx,'zaloMic',W-80,y+10,24,controls);icon(ctx,'image',W-35,y+10,24,state.keyboard?'#ff963c':controls,state.keyboard)
  } else {
    const accent='#1518bf'
    rect(ctx,13,y+9,20,20,10,accent);icon(ctx,'plus',14,y+10,18,'#fff')
    icon(ctx,'camera',51,y+9,22,accent,true);icon(ctx,'image',91,y+9,22,accent,true);icon(ctx,'mic',132,y+8,22,accent,true)
    rect(ctx,168,y+2,W-218,36,18,t.dark?'#262629':'#f2f2f6')
    text(ctx,'Aa',183,y+27,15,muted);icon(ctx,'smile',W-79,y+10,20,accent,true);icon(ctx,'thumb',W-34,y+10,21,accent,true)
  }
  if(state.keyboard)keyboard(ctx,t);else home(ctx,t)
}
function keyboard(ctx,t) {
  keyboardContexts.add(ctx)
  const y=H-309
  ctx.fillStyle=t.dark?'#242426':'#d1d3d9';ctx.fillRect(0,y,W,309)
  const key=t.dark?'#626267':'#fff',fg=t.fg
  text(ctx,'Em',W/6,y+29,15,fg,400,'center');text(ctx,'Tôi',W/2,y+29,15,fg,400,'center');text(ctx,'Anh',W*5/6,y+29,15,fg,400,'center')
  ctx.fillStyle=t.dark?'#ffffff15':'#00000008';for(const x of [W/3,W*2/3])ctx.fillRect(x,y+12,1,23)
  for(const [row,index] of ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((row,i)=>[row,i])){
    const width=34,gap=5,total=row.length*width+(row.length-1)*gap,start=(W-total)/2,ky=y+47+index*50
    for(const [i,letter] of [...row].entries()){rect(ctx,start+i*(width+gap),ky+1,width,40,5,t.dark?'#111':'#9c9fa5');rect(ctx,start+i*(width+gap),ky,width,40,5,key);text(ctx,letter,start+i*(width+gap)+width/2,ky+28,22,fg,400,'center')}
  }
  rect(ctx,4,y+147,45,40,5,key);icon(ctx,'shift',15,y+155,23,fg,true)
  rect(ctx,W-49,y+147,45,40,5,t.dark?'#404044':'#aeb3bd');icon(ctx,'erase',W-40,y+156,25,fg)
  rect(ctx,4,y+197,44,40,5,t.dark?'#404044':'#aeb3bd');text(ctx,'123',26,y+222,15,fg,400,'center')
  rect(ctx,53,y+197,44,40,5,t.dark?'#404044':'#aeb3bd');icon(ctx,'smile',65,y+207,23,fg)
  rect(ctx,102,y+197,190,40,5,key);text(ctx,'dấu cách',197,y+222,15,fg,400,'center')
  rect(ctx,297,y+197,92,40,5,t.dark?'#404044':'#aeb3bd');text(ctx,'Nhập',343,y+222,15,fg,400,'center')
  icon(ctx,'globe',25,H-49,25,fg);icon(ctx,'mic',W-50,H-50,25,fg);home(ctx,t)
  keyboardContexts.delete(ctx)
}
async function full(ctx,state,{bottom,skipComposer=false,skipStatus=false}={}) {
  const t=theme(state)
  ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H)
  if(state.platform==='messenger'&&!t.dark){const g=ctx.createLinearGradient(0,0,W,95);g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#ffffff');g.addColorStop(1,'#9bcfff');ctx.fillStyle=g;ctx.fillRect(0,0,W,95)}
  if(state.platform==='zalo'){
    const gradient=ctx.createLinearGradient(0,0,W,90);gradient.addColorStop(0,'#0084ff');gradient.addColorStop(1,'#00b5ee')
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,90)
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
function menu(ctx,actions,x,y,width,t,{leading=false,rowHeight=40}={}) {
  glass(ctx,x,y,width,actions.length*rowHeight,leading?28:14,t)
  actions.forEach(([label,symbol,color],i)=>{
    if(i&&!leading){ctx.fillStyle=t.dark?'#ffffff25':'#00000020';ctx.fillRect(x,y+i*rowHeight,width,.5)}
    text(ctx,label,x+(leading?57:15),y+i*rowHeight+27,14.5,color||t.fg)
    icon(ctx,symbol,leading?x+25:x+width-34,y+i*rowHeight+12,18,color||t.fg)
  })
}
async function focus(ctx,state) {
  const t=theme(state),base=surface()
  const layouts=await full(base.ctx,state)
  const selected=layouts.find(item=>item.message.id===state.selectedId)||layouts.at(-1)
  backdrop(ctx,base.canvas,t)
  if(!selected)return []
  const scale=Math.min(1,(H-390)/selected.h)
  const h=selected.h*scale,w=selected.w*scale
  const y=Math.max(150,Math.min(H-220-h,Math.min(selected.y,H*.41))),x=selected.message.sender==='me'?W-16-w:16
  const item={...selected,x,y,w,h}
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);await bubble(ctx,{...selected,x:0,y:0,groupStart:true,groupEnd:true},state,t,true);ctx.restore()
  const apple=state.platform==='imessage',zalo=state.platform==='zalo'
  const reactions=apple?['❤️','👍','👎','😂','‼️','❓']:zalo?['❤️','👍','😆','😮','😢','😡']:['❤️','😆','😮','😢','😡','👍']
  const messenger=state.platform==='messenger'
  const barW=messenger?361:apple?304:318,barX=Math.max(12,Math.min(W-barW-12,x+w-barW))
  glass(ctx,barX,y-64,barW,53,27,t)
  reactions.forEach((reaction,i)=>text(ctx,reaction,barX+29+i*(messenger?42:43),y-26,messenger?28:25,t.fg,400,'center'))
  if(messenger){rect(ctx,barX+271,y-54,33,33,17,'#0866ff');icon(ctx,'camera',barX+277,y-48,21,'#fff');rect(ctx,barX+314,y-54,33,33,17,t.dark?'#444':'#e8e8ec')}
  icon(ctx,'plus',barX+barW-34,y-47,20,t.fg)
  const actions=apple?[['Trả lời','reply'],['Sao chép','copy'],['Dịch','translate'],['Khác','dots']]:zalo?[['Trả lời','reply'],['Chuyển tiếp','forward'],['Sao chép','copy'],['Thu hồi','trash']]:[['Trả lời','reply'],['Sao chép','copy'],['Dịch','translate']]
  const menuX=Math.max(12,Math.min(W-235,x))
  menu(ctx,actions,menuX,y+h+10,messenger?223:223,t)
  if(messenger)menu(ctx,[['Khác','dots']],menuX,y+h+140,223,t)
  return [item]
}
async function preview(ctx,state) {
  const t=theme(state),base=surface()
  base.ctx.fillStyle=t.panel;base.ctx.fillRect(0,0,W,H)
  status(base.ctx,state,t)
  text(base.ctx,state.platform==='messenger'?'messenger':state.platform==='zalo'?'Zalo':'Tin nhắn',14,82,25,t.accent,700)
  // Conversation-list backdrop uses editor data only; reference contacts remain private.
  for(let i=0;i<10;i++){const y=105+i*68;await avatar(base.ctx,state,18,y,40,t);text(base.ctx,i===0?state.name:'Cuộc trò chuyện',70,y+17,16,t.fg,600);text(base.ctx,state.messages[i%Math.max(1,state.messages.length)]?.text.slice(0,32)||'Tin nhắn',70,y+37,14,t.muted);}
  backdrop(ctx,base.canvas,t)
  const card=surface(),messenger=state.platform==='messenger',apple=state.platform==='imessage',cardY=apple?89:73,cardX=18,cardWidth=W-36,cardHeight=messenger?H-345:apple?H-345:H-245
  const scale=cardWidth/W,sourceY=apple?140:state.platform==='zalo'?90:95
  await full(card.ctx,{...state,keyboard:false,mode:'full'},{bottom:sourceY+cardHeight/scale-10,skipComposer:true,skipStatus:true})
  ctx.save();ctx.shadowColor='#00000035';ctx.shadowBlur=14*SCALE;rect(ctx,cardX,cardY,cardWidth,cardHeight,27,t.bg);ctx.restore()
  ctx.save();ctx.beginPath();ctx.roundRect(cardX,cardY,cardWidth,cardHeight,27);ctx.clip()
  // Uniform scaling only: no stretched text, icons or photo proportions.
  ctx.drawImage(card.canvas,0,sourceY*SCALE,canvasSize.width,cardHeight/scale*SCALE,cardX,cardY,cardWidth,cardHeight);ctx.restore()
  const actions=apple?[['Ghim','pin'],['Đánh dấu chưa đọc','unread'],['Ẩn cảnh báo','bell'],['Xóa','trash','#ff453a']]:state.platform==='zalo'?[['Đánh dấu chưa đọc','unread'],['Tắt thông báo','bell'],['Ẩn trò chuyện','archive']]:[['Đánh dấu chưa đọc','unread'],['Ghim','pin'],['Tắt thông báo','bell'],['Lưu trữ','archive'],['Xóa','trash','#ff453a'],['Chặn','block','#ff453a']]
  menu(ctx,actions,18,cardY+cardHeight+18,messenger||apple?223:300,t,{leading:messenger||apple,rowHeight:messenger?38:apple?43:40});home(ctx,t);return []
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

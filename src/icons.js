const paths = {
  lock:'M6 10h12v12H6zM8 10V6a4 4 0 0 1 8 0v4',
  sticker:'M5 3Q2 3 2 7v10q0 5 5 5h7q8 0 8-8V7q0-4-4-4zM7 9h.01M16 8h.01M7 14q4 5 9 0',
  pin:'M8 2h8l-1 7 4 4H5l4-4zM12 13v9', block:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M6 12h12',
  back:'M15 18l-6-6 6-6', chevron:'M9 6l6 6-6 6', plus:'M12 5v14M5 12h14',
  phone:'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z',
  video:'M16 8l6-4v16l-6-4M3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  menu:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  camera:'M14 4l2 3h4a2 2 0 0 1 2 2v11H2V9a2 2 0 0 1 2-2h4l2-3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  image:'M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM2 16l5-5 6 6 3-3 6 5M9 7h.01',
  mic:'M9 3a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
  smile:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M8 9h.01M16 9h.01M8 14s1 3 4 3 4-3 4-3',
  thumb:'M7 10v12H2V10zM7 10l5-8a3 3 0 0 1 2 3l-1 5h7a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7',
  dots:'M4 12h.01M12 12h.01M20 12h.01', reply:'M9 5l-7 7 7 7M2 12h10a9 9 0 0 1 9 9', copy:'M9 9h13v13H9zM5 15H2V2h13v3',
  forward:'M15 5l7 7-7 7M22 12H10a8 8 0 0 0-8 8', unread:'M2 4h20v16H2zM2 4l10 8L22 4', archive:'M2 3h20v5H2zM4 8v13h16V8M9 12h6',
  trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7', translate:'M2 4h12M8 2v2M5 4s0 7 8 10M11 4s0 7-9 11M13 22l5-12 5 12M15 18h6',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M3 3l18 18', shift:'M12 3l10 10h-6v8H8v-8H2z',
  erase:'M8 4h14v16H8L2 12zM12 8l6 8M18 8l-6 8', globe:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c-6 5-6 15 0 20 6-5 6-15 0-20',
  send:'M12 20V4M5 11l7-7 7 7', check:'M4 12l5 5L20 6',
}
// Filled app controls need silhouettes/cut-outs, not fills of outline paths.
const solidPaths = {
  phone: 'M5 2Q3 2 3 5c0 8 8 16 16 16q3 0 3-3v-3l-5-2-3 3q-5-2-7-7l3-3-2-4z',
  video: 'M4 4h11q3 0 3 3v10q0 3-3 3H4q-3 0-3-3V7q0-3 3-3M20 9l4-3v12l-4-3z',
  camera: 'M4 6h3l2-3h6l2 3h3q3 0 3 3v10q0 3-3 3H4q-3 0-3-3V9q0-3 3-3M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
  mic: 'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0z',
  thumb: 'M2 10h4v12H2zM8 10l4-5V2q4 0 4 4l-1 4h5q3 0 3 3l-2 7q-1 2-3 2H8z',
}
export function icon(ctx,name,x,y,size,color,filled=false) {
  ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24)
  const zalo=name.startsWith('zalo')
  if(zalo)name=name.slice(4).toLowerCase()
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=zalo?1.2:name==='dots'?3.8:1.7;ctx.lineCap='round';ctx.lineJoin='round'
  if(name==='more'){
    for(const cx of [4,12,20]){ctx.beginPath();ctx.arc(cx,12,2.5,0,Math.PI*2);ctx.stroke()}
    ctx.restore();return
  }
  if(name==='statusGlobe'){
    ctx.beginPath();ctx.arc(12,12,11,0,Math.PI*2);ctx.fill();ctx.fillStyle=color==='#fff'?'#009eff':'#fff'
    ctx.fill(new Path2D('M8 2l5 2-3 4 3 3-2 4-4-2-1-5zM17 8l5 2-2 5-4 5-1-5 2-2z'));ctx.restore();return
  }
  if(name==='pinkHeart'){
    const gradient=ctx.createLinearGradient(0,3,0,22);gradient.addColorStop(0,'#ffa0d5');gradient.addColorStop(.5,'#ff65bc');gradient.addColorStop(1,'#f53397');ctx.fillStyle=gradient
    ctx.fill(new Path2D('M12 22C10 20 1 14 1 8C1 1 9 0 12 6C15 0 23 1 23 8C23 14 14 20 12 22Z'));ctx.restore();return
  }
  if(filled&&solidPaths[name]){
    ctx.fill(new Path2D(solidPaths[name]),'evenodd')
    if(name==='mic'){ctx.lineWidth=2.6;ctx.stroke(new Path2D('M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8'))}
    ctx.restore();return
  }
  if(filled&&name==='smile'){
    ctx.beginPath();ctx.arc(12,12,11,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='#fff';for(const x of [8,16]){ctx.beginPath();ctx.ellipse(x,9,1.3,2,0,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(12,12,5,.2*Math.PI,.8*Math.PI);ctx.stroke();ctx.restore();return
  }
  if(filled&&name==='image'){
    ctx.beginPath();ctx.roundRect(2,2,20,20,3);ctx.fill();ctx.fillStyle='#fff'
    ctx.beginPath();ctx.arc(8,8,2,0,Math.PI*2);ctx.fill()
    ctx.beginPath();ctx.moveTo(4,18);ctx.lineTo(10,12);ctx.lineTo(14,16);ctx.lineTo(17,13);ctx.lineTo(20,17);ctx.lineTo(20,20);ctx.lineTo(4,20);ctx.closePath();ctx.fill();ctx.restore();return
  }
  const path=new Path2D(paths[name] || paths.dots)
  if(filled)ctx.fill(path,'evenodd')
  ctx.stroke(path);ctx.restore()
}

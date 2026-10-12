import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasSize, wrapLines, layoutMessages, logicalSize, statusValues, composerTop, conversationTop } from '../src/renderer.js'
import { initialState } from '../src/defaults.js'

test('kích thước ảnh xuất khớp hai screenshot 736 × 1600', () => {
  assert.deepEqual(canvasSize, { width: 736, height: 1600 })
  assert.equal(canvasSize.width / canvasSize.height, 736 / 1600)
  assert.equal(logicalSize.height / logicalSize.width, canvasSize.height / canvasSize.width)
})

test('pin và sóng được làm tròn, giới hạn và xử lý giá trị không hợp lệ', () => {
  assert.deepEqual(statusValues({battery:76,signal:4}),{battery:76,signal:4})
  assert.deepEqual(statusValues({battery:-10,signal:12}),{battery:0,signal:4})
  assert.deepEqual(statusValues({battery:'abc',signal:NaN}),{battery:100,signal:4})
  assert.deepEqual(statusValues({battery:99.6,signal:1.4}),{battery:100,signal:1})
})

test('nội dung dài được ngắt thành nhiều dòng', () => {
  const ctx = { measureText: (text) => ({ width: text.length * 10 }) }
  const lines = wrapLines(ctx, 'Một đoạn tin nhắn khá dài cần được xuống dòng', 100)
  assert.ok(lines.length > 2)
  assert.equal(lines.join(' '), 'Một đoạn tin nhắn khá dài cần được xuống dòng')
})

test('xuống dòng thủ công được giữ lại', () => {
  const ctx = { measureText: (text) => ({ width: text.length * 8 }) }
  assert.deepEqual(wrapLines(ctx, 'Dòng một\nDòng hai', 300), ['Dòng một', 'Dòng hai'])
})

test('chuỗi dài không có dấu cách không vượt chiều rộng cho phép', () => {
  const ctx = { measureText: text => ({width:Array.from(text).length*8}) }
  const value='https://example.com/'+'x'.repeat(80)
  const lines=wrapLines(ctx,value,160)
  assert.equal(lines.join(''),value)
  assert.ok(lines.every(line=>ctx.measureText(line).width<=160))
})

test('Messenger giữ lề và chỉ đặt avatar cuối nhóm', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const state={...initialState,platform:'messenger',messages:[
    {id:'a',sender:'them',text:'Tin đầu',time:'10:00'},
    {id:'b',sender:'them',text:'Tin tiếp',time:'10:01'},
    {id:'c',sender:'me',text:'x'.repeat(90),time:'10:02'},
  ]}
  const layouts=layoutMessages(ctx,state,104,600)
  assert.equal(layouts[0].size,15.5)
  assert.equal(layouts[0].groupEnd,false)
  assert.equal(layouts[1].groupEnd,true)
  assert.equal(layouts[1].timeHeight,0)
  assert.ok(layouts.every(item=>item.x>=12&&item.x+item.w<=logicalSize.width-7))
  assert.equal(layouts[0].x,50)
  assert.equal(layouts[2].x+layouts[2].w,logicalSize.width-7)
})

test('Zalo đặt giờ trong tin cuối nhóm, mốc ngày tách nhóm và lề avatar đầu nhóm', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const state={...initialState,platform:'zalo',messages:[
    {id:'a',sender:'them',text:'Tin đầu',time:'10:00'},
    {id:'b',sender:'them',text:'Tin tiếp',time:'10:01'},
    {id:'c',sender:'them',text:'Ngày mới',time:'10:02',dateSeparator:'10:02 05/10/2026'},
  ]}
  const items=layoutMessages(ctx,state,104,600)
  assert.equal(items[0].showTime,false)
  assert.equal(items[0].timeHeight,0)
  assert.equal(items[0].x,38)
  assert.equal(items[1].showTime,true)
  assert.equal(items[2].groupStart,true)
  assert.equal(items[2].timeHeight,38)
})

test('Messenger dành khoảng riêng cho trích dẫn trả lời', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const items=layoutMessages(ctx,{...initialState,messages:[{id:'r',sender:'me',text:'Trả lời',time:'10:00',replyText:'Tin được trích dẫn'}]},104,600)
  assert.equal(items[0].replyHeight,54)
  assert.ok(items[0].y-54>=104)
})

test('chọn vùng chụp và focus giữ đúng tin cũ', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const messages=Array.from({length:20},(_,i)=>({id:String(i),sender:'them',text:'Tin nhắn '+i,time:'10:00'}))
  const cropped=layoutMessages(ctx,{...initialState,messages,captureEndId:'5'},104,600)
  assert.equal(cropped.at(-1).message.id,'5')
  const focused=layoutMessages(ctx,{...initialState,messages,mode:'focus',selectedId:'1'},104,600)
  const target=focused.find(item=>item.message.id==='1')
  assert.ok(target&&target.y>=104&&target.y+target.h<=600)
})

test('mốc giờ đầu SMS và iMessage nằm dưới nhãn dịch vụ, không chồng chữ', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  for(const messageService of ['sms','imessage']) {
    const state={...initialState,platform:'imessage',messageService,mode:'full',messages:[
      {id:'first',sender:'me',text:'Bạn ơi mình xin review app',time:'23:59'},
    ]}
    const item=layoutMessages(ctx,state,conversationTop(state),760)[0]
    const serviceBaseline=messageService==='sms'?164:176
    const timestampBaseline=item.y-12
    assert.ok(timestampBaseline-11>=serviceBaseline+6, `${messageService}: nhãn dịch vụ và mốc giờ chồng nhau`)
  }
})

test('SMS và iMessage ngắn bắt đầu phía trên, hội thoại dài vẫn giữ tin mới nhất', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const messages=[{id:'a',sender:'me',text:'Xin chào',time:'10:00'},{id:'b',sender:'them',text:'Chào bạn',time:'10:01'}]
  for(const messageService of ['sms','imessage']) {
    const state={...initialState,platform:'imessage',messageService,messages}
    const short=layoutMessages(ctx,state,190,760)
    assert.ok(short[0].y<250)
    const long=layoutMessages(ctx,{...state,messages:Array.from({length:40},(_,i)=>({...messages[i%2],id:String(i)}))},190,760)
    assert.equal(long.at(-1).message.id,'39')
    assert.ok(long.at(-1).y+long.at(-1).h<=760)
  }
})

test('bàn phím dành đủ chiều cao, không che vùng tin nhắn', () => {
  assert.ok(logicalSize.height-composerTop({...initialState,keyboard:true})>=350)
  const ctx={measureText:text=>({width:text.length*8})}
  for(const platform of ['messenger','zalo','imessage']){
    const state={...initialState,platform,keyboard:true}
    const bottom=composerTop(state)-8
    const items=layoutMessages(ctx,state,190,bottom)
    assert.ok(items.every(item=>item.y+item.h<=bottom))
  }
})

test('Messages dành chỗ cho nhãn giao ở nhóm gửi cuối dù có tin nhận phía sau', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const state={...initialState,platform:'imessage',deliveryState:'delivered',messages:[
    {id:'sent',sender:'me',text:'Hẹn bạn ngày mai nhé.',time:'10:00'},
    {id:'received',sender:'them',text:'Được nhé',time:'10:01'},
  ]}
  const items=layoutMessages(ctx,state,170,770)
  assert.equal(items[0].showDelivery,true)
  assert.equal(items[1].showDelivery,false)
  assert.ok(items[1].y-(items[0].y+items[0].h)>=28)
})

test('Messenger giới hạn tin nhận và giữ đủ chiều rộng trích dẫn độc lập câu trả lời ngắn', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const items=layoutMessages(ctx,{...initialState,messages:[
    {id:'a',sender:'them',text:'một câu khá dài '.repeat(10),time:''},
    {id:'b',sender:'me',text:'Ok',time:'',replyText:'một câu trích dẫn dài hơn'},
  ]},95,770)
  assert.ok(items[0].w<=264)
  assert.ok(items[0].lines.length>1)
  assert.ok(items[1].replyWidth>items[1].w)
})

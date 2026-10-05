import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasSize, wrapLines, layoutMessages, logicalSize, statusValues } from '../src/renderer.js'
import { initialState } from '../src/defaults.js'

test('kích thước ảnh xuất đúng tỷ lệ 9:16', () => {
  assert.deepEqual(canvasSize, { width: 1080, height: 1920 })
  assert.equal(canvasSize.width / canvasSize.height, 9 / 16)
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

test('bố cục iPhone dùng chữ 17pt, giữ lề và chỉ đặt avatar cuối nhóm', () => {
  const ctx={measureText:text=>({width:text.length*8})}
  const state={...initialState,platform:'messenger',messages:[
    {id:'a',sender:'them',text:'Tin đầu',time:'10:00'},
    {id:'b',sender:'them',text:'Tin tiếp',time:'10:01'},
    {id:'c',sender:'me',text:'x'.repeat(90),time:'10:02'},
  ]}
  const layouts=layoutMessages(ctx,state,104,600)
  assert.equal(layouts[0].size,17)
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

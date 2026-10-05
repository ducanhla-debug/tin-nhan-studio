import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasSize, wrapLines, layoutMessages, logicalSize } from '../src/renderer.js'
import { initialState } from '../src/defaults.js'

test('kích thước ảnh xuất đúng tỷ lệ 9:16', () => {
  assert.deepEqual(canvasSize, { width: 1080, height: 1920 })
  assert.equal(canvasSize.width / canvasSize.height, 9 / 16)
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
  assert.ok(layouts.every(item=>item.x>=12&&item.x+item.w<=logicalSize.width-12))
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

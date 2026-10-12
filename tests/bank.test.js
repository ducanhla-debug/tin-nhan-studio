import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeBank,labelGeometry,moveLabel,amountText,bankStyles} from '../src/bankModel.js'
import {renderSimulationLabel} from '../src/bankRenderer.js'
test('renderer luôn vẽ nhãn cố định dù state cố tắt hoặc đổi chữ',()=>{
  const labels=[]
  const ctx={save(){},restore(){},beginPath(){},roundRect(){},fill(){},stroke(){},measureText:text=>({width:text.length*6}),fillText:text=>labels.push(text)}
  renderSimulationLabel(ctx,{showLabel:false,labelText:'',opacity:0,labelSize:0},393,393*1600/736)
  assert.deepEqual(labels,['MÔ PHỎNG','KHÔNG CÓ GIÁ TRỊ GIAO DỊCH'])
  assert.equal(ctx.globalAlpha,1)
})
test('bốn phong cách và số tiền được chuẩn hóa',()=>{
  assert.equal(Object.keys(bankStyles).length,4)
  assert.equal(normalizeBank({style:'unknown'}).style,'vcb')
  assert.equal(amountText('1,300,000'),'1,300,000')
  assert.equal(amountText(''),'0')
  assert.equal(normalizeBank({amount:'9'.repeat(100)}).amount.length,15)
})
test('nhãn luôn có cỡ tối thiểu và nằm trọn ảnh kể cả state cũ/hỏng',()=>{
  for(const value of [{labelSize:0,labelX:-99,labelY:999},{labelSize:1000,labelX:NaN,labelY:Infinity},{labelSize:22,labelX:100,labelY:100}]){
    const b=normalizeBank(value),g=labelGeometry(b)
    assert.ok(b.labelSize>=14&&b.labelSize<=22)
    assert.ok(g.x>=10&&g.y>=10&&g.x+g.w<=393-10+.001&&g.y+g.h<=393*1600/736-10+.001)
  }
})
test('kéo tự do vào giữa ảnh và clamp các mép',()=>{
  const b=moveLabel({},70,350),g=labelGeometry(b)
  assert.ok(Math.abs(g.x-70)<.001);assert.ok(Math.abs(g.y-350)<.001)
  assert.equal(moveLabel({},-100,-100).labelX,0)
  assert.equal(moveLabel({},9999,9999).labelY,100)
})

import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {readFile,mkdir,mkdtemp,copyFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {labelGeometry} from '../src/bankModel.js'
const target=process.argv[2]||'http://127.0.0.1:5173/'
const output=process.env.QA_OUTPUT_DIR||await mkdtemp(join(tmpdir(),'tin-nhan-qa-'))
await mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,...(process.env.QA_BROWSER_PATH?{executablePath:process.env.QA_BROWSER_PATH}:{})})
const page=await browser.newPage({viewport:{width:1536,height:1024},acceptDownloads:true})
const errors=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
const settle=async()=>{await page.waitForTimeout(150);await page.locator('.rendering').waitFor({state:'hidden'})}
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tin-nhan-studio-v1')))
async function exportFile(format,bank=false){
  const waiting=page.waitForEvent('download');await page.getByRole('button',{name:`Tải ảnh ${format.toUpperCase()}`,exact:true}).last().click()
  const download=await waiting,bytes=await readFile(await download.path())
  const g=bank?labelGeometry((await state()).bank):null
  const result=await page.evaluate(async ({base64,g})=>{const bitmap=await createImageBitmap(new Blob([Uint8Array.from(atob(base64),ch=>ch.charCodeAt(0))]));const dims={width:bitmap.width,height:bitmap.height};let pixel=null;if(g){const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);pixel=Array.from(ctx.getImageData(Math.round((g.x+12)*736/393),Math.round((g.y+6)*736/393),1,1).data)}bitmap.close();return {dims,pixel}},{base64:bytes.toString('base64'),g})
  assert.deepEqual(result.dims,{width:736,height:1600})
  if(bank)for(const [i,value] of [255,243,189].entries())assert.ok(Math.abs(result.pixel[i]-value)<22,'File tải phải chứa nền nhãn mô phỏng')
  if(bank)assert.ok(download.suggestedFilename().startsWith('mau-mo-phong-'))
  if(bank&&format==='png')await copyFile(await download.path(),join(output,`export-${(await state()).bank.style}.png`))
}
try{
  await page.goto(target,{waitUntil:'networkidle'});assert.equal(await page.title(),'Tin Nhắn Studio')
  await page.getByRole('button',{name:'Đặt lại',exact:true}).click();await settle()
  assert.ok(await page.locator('canvas').isVisible());assert.equal(await page.locator('vite-error-overlay').count(),0)
  let combinations=0,exports=0
  for(const label of ['Messenger','Zalo','Tin nhắn']){
    await page.locator('.setup-panel').getByRole('button',{name:label,exact:true}).click()
    for(const appearance of ['Mặc định','Đêm khuya']){
      await page.getByRole('button',{name:appearance,exact:true}).click()
      for(const mode of ['Toàn bộ','Làm nổi bật','Xem trước']){
        await page.getByRole('button',{name:mode,exact:true}).click();await settle()
        assert.equal(await page.locator('canvas').getAttribute('width'),'736');assert.equal(await page.locator('canvas').getAttribute('height'),'1600');combinations++
      }
    }
    await page.getByRole('button',{name:'Toàn bộ',exact:true}).click();await settle()
    const formatSelect=page.locator('.format-row select')
    for(const format of ['png','jpg']){await formatSelect.selectOption(format);await settle();await exportFile(format);exports++}
  }
  await page.getByRole('button',{name:'Mẫu chuyển khoản',exact:true}).click();await settle()
  await page.getByLabel('Người nhận',{exact:true}).fill('NGUYEN VAN A')
  await page.getByLabel('Số tiền (VND)',{exact:true}).fill('2500000')
  for(const style of ['vcb','vietin','tcb','mb']){
    await page.getByLabel('Phong cách tham khảo',{exact:true}).selectOption(style);await settle()
    await page.locator('.phone-shell').screenshot({path:join(output,`bank-${style}.png`)})
    for(const format of ['png','jpg']){await page.getByLabel('Định dạng ảnh',{exact:true}).selectOption(format);await settle();await exportFile(format,true);exports++}
  }
  await page.getByLabel('Kích thước nhãn',{exact:true}).fill('22');await settle()
  assert.equal((await state()).bank.labelSize,22)
  await page.getByLabel('Vị trí ngang',{exact:true}).fill('0');await page.getByLabel('Vị trí dọc',{exact:true}).fill('0');await settle()
  const bounds=await page.locator('canvas').boundingBox(),scale=bounds.width/393
  const before=(await state()).bank
  await page.mouse.move(bounds.x+25*scale,bounds.y+25*scale);await page.mouse.down()
  await page.mouse.move(bounds.x+65*scale,bounds.y+300*scale,{steps:12});await page.mouse.up();await settle()
  const moved=(await state()).bank;assert.ok(moved.labelY>before.labelY)
  await page.locator('canvas').focus();await page.keyboard.press('ArrowDown');await settle();assert.ok((await state()).bank.labelY>moved.labelY)
  await page.getByLabel('Vị trí ngang',{exact:true}).fill('100');await page.getByLabel('Vị trí dọc',{exact:true}).fill('100');await settle()
  await page.reload({waitUntil:'networkidle'});await settle();assert.equal((await state()).bank.labelY,100);assert.equal((await state()).bank.recipient,'NGUYEN VAN A')
  await page.locator('.phone-shell').screenshot({path:join(output,'bank-label-edge.png')})
  await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});await settle()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  await page.screenshot({path:join(output,'mobile.png')})
  await page.getByRole('navigation',{name:'Loại ảnh'}).getByRole('button',{name:'Tin nhắn',exact:true}).click();await settle()
  assert.ok(await page.locator('.message-list').isVisible())
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({target,title:await page.title(),combinations,exports,labelDrag:true,labelKeyboard:true,persistence:true,mobileOverflow:false,chatPreserved:true,errors,output},null,2))
}finally{await browser.close()}

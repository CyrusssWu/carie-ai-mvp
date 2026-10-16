// Fresh isolated production-preview origin. No probe, fault injection or storage mocking.
export async function productionSmoke(tab, base='http://localhost:4180') {
  const button=name=>tab.playwright.getByRole('button',{name,exact:true})
  const assert=(value,message)=>{if(!value)throw Error(message)}
  await tab.goto(base+'/')
  await button('資料與私隱說明').click();await button('知道了').click()
  await button('開始探索').click();await tab.playwright.getByLabel('我們可以怎樣稱呼你？',{exact:true}).fill('Demo Alex')
  await button('完全不知道自己想做什麼').click();await button('繼續').click()
  await button('設計與創意').click();await button('科技與數碼').click();await button('下一步').click()
  for(let i=0;i<5;i++){await tab.playwright.locator('button[aria-pressed]').nth(i%3).click();await button(i===4?'看看值得探索的方向':'下一題').click()}
  assert(await tab.playwright.locator('h2').count()===3,'Missing ideas')
  await tab.playwright.getByRole('button',{name:'試試這個職業',exact:true}).nth(0).click();await button('進入故事').click()
  const choices=[]
  for(let i=0;i<5;i++){
    assert(await tab.playwright.getByRole('progressbar').getAttribute('aria-valuenow')===String(i+1),'Wrong progress')
    await tab.playwright.locator('.story-option').nth((i+1)%3).click()
    choices.push(await tab.playwright.locator('.story-choice.is-selected .story-choice-title').innerText())
    await button('確認這個選擇').click();await button('看看發生什麼').click();await tab.reload()
    await button(i===4?'完成故事':'繼續').click()
  }
  await tab.playwright.locator('[data-recap-choice]').nth(4).waitFor({state:'visible'})
  assert(JSON.stringify(await tab.playwright.locator('[data-recap-choice]').allTextContents({}))===JSON.stringify(choices),'Production recap mismatch')
  await button('想想你的感受').click();await button('略過未填問題，繼續').click()
  await tab.playwright.getByLabel('觀察一個常用 App',{exact:true}).check()
  await button('存入 Career Passport').click();await tab.reload()
  await button('導出我的資料（JSON）').click()
  const exported=JSON.parse(await tab.playwright.locator('#data-export-json').evaluate(e=>e.value))
  assert(exported.experience.passport.length===1&&exported.experience.passport[0].decisions.length===5,'Production export mismatch')
  await tab.playwright.locator('summary').click();await button('預覽分享這次體驗').click()
  await tab.playwright.getByLabel('Next Steps',{exact:true}).waitFor({state:'visible'})
  assert(JSON.stringify(exported.profile.suggestedCareers)===JSON.stringify(['ux-designer','logistics-coordinator','community-programme-coordinator']),'Stale career ideas in profile')
  const toggles=await tab.playwright.locator('fieldset input').evaluateAll(els=>els.map(e=>e.checked))
  assert(JSON.stringify(toggles)==='[true,true,false,false]','Production privacy defaults changed')
  await button('建立分享摘要').click()
  assert(await tab.playwright.locator('#final-share-text').isVisible(),'Production final summary missing')
  const layout=await tab.playwright.evaluate(()=>({width:document.defaultView.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))
  assert(layout.width===390&&!layout.overflow,'Production mobile viewport/overflow')
  return {status:'passed',choices,entries:1,layout,defaultShareSettings:toggles}
}

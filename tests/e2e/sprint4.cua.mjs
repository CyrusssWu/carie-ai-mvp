// Executed through Codex's documented cua_repl browser API, not a second browser driver.
// Start: npm run dev -- --config tests/e2e/vite.config.ts
// Pass an isolated tab at localhost:5177, plus an optional screenshot callback.
export function sprint4Suite(tab, screenshot = async () => {}) {
  const base = 'http://localhost:5177'
  const results = []
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const button = name => tab.playwright.getByRole('button', { name, exact: true })
  const probe = async () => JSON.parse(await tab.playwright.locator('#s4-probe').textContent())
  const pass = (name, details = {}) => { results.push({name, status:'passed', ...details}); return results.at(-1) }
  const layout = async name => {
    const state = await tab.playwright.evaluate(() => {
      const visible = [...document.querySelectorAll('button, summary, select, textarea')].filter(e => e.getClientRects().length && e.getBoundingClientRect().height > 0)
      return { width:document.defaultView.innerWidth, overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth,
        small:visible.filter(e => e.getBoundingClientRect().height < 43.5).map(e => e.textContent),
        outside:visible.filter(e => e.getBoundingClientRect().left < -1 || e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).map(e => e.textContent) }
    })
    assert(state.width === 390 && !state.overflow && !state.small.length && !state.outside.length, name + ': layout/target issue ' + JSON.stringify(state))
    pass('Mobile '+name, state)
  }
  const finishStory = async (path, withPause = false) => {
    const choices = []
    for (let i=0;i<5;i++) {
      assert(await tab.playwright.getByRole('progressbar').getAttribute('aria-valuenow') === String(i+1), 'Wrong decision number')
      await tab.playwright.locator('.story-option').nth((path[i]+1)%3).click()
      await button('確認這個選擇').click()
      await button('返回更改').click()
      await tab.playwright.locator('.story-option').nth(path[i]).click()
      choices.push(await tab.playwright.locator('.story-choice.is-selected .story-choice-title').innerText())
      await button('確認這個選擇').click()
      await tab.reload()
      if (withPause && i === 1) {
        await button('暫停 / 離開').click(); await button('儲存並離開').click()
        await button('繼續體驗').click(); await button('繼續故事').click()
      }
      assert((await tab.playwright.locator('h1').innerText()).includes(choices[i]), 'Lost draft')
      await button('看看發生什麼').click(); await tab.reload()
      assert((await probe()).state.storyProgress.evidence.length === i+1, 'Duplicated evidence')
      await button(i === 4 ? '完成故事' : '繼續').click()
    }
    assert((await tab.url()).endsWith('/recap'), 'Missing recap')
    assert(JSON.stringify(await tab.playwright.locator('[data-recap-choice]').allTextContents({})) === JSON.stringify(choices), 'Recap did not match choices')
    return choices
  }
  return {
    results, probe,
    async regression() {
      await tab.goto(base+'/tests/e2e/fixtures.html'); await button('Reset test data').click()
      await tab.goto(base+'/')
      await button('開始探索').click(); await tab.playwright.getByLabel('我們可以怎樣稱呼你？',{exact:true}).fill('Alex')
      await button('完全不知道自己想做什麼').click(); await button('繼續').click()
      await button('設計與創意').click(); await button('科技與數碼').click(); await button('下一步').click()
      for(let i=0;i<5;i++) { await tab.playwright.locator('button[aria-pressed]').nth(i%3).click(); await button(i===4?'看看值得探索的方向':'下一題').click() }
      assert(await tab.playwright.locator('h2').count()===3,'Expected three exploration ideas')
      await tab.playwright.getByRole('button',{name:'試試這個職業',exact:true}).nth(0).click(); await button('進入故事').click()
      const choices = await finishStory([2,1,0,2,1], true)
      await layout('V09')
      return pass('Test 12: V01–V09 regression, five true choices, pause/resume', {choices})
    },
    async firstSave() {
      await button('想想你的感受').click(); await layout('V10')
      await button('理解別人的需要').click(); await button('分析問題').click()
      await tab.playwright.getByLabel('其他感受（可選）',{exact:true}).fill('S4_FIRST_OTHER')
      await tab.playwright.getByLabel('如果重新體驗這份工作，你會想更深入嘗試什麼？',{exact:true}).fill('S4_FIRST_FURTHER')
      await button('暫時不想').click()
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('S4_PRIVATE_FIRST')
      await tab.reload()
      assert((await probe()).state.reflection.additionalNotes==='S4_PRIVATE_FIRST','Reflection lost on reload')
      await screenshot('reflection-390')
      await button('看看下一步').click(); await button('返回修改反思').click()
      await tab.playwright.getByLabel('如果重新體驗這份工作，你會想更深入嘗試什麼？',{exact:true}).fill('S4_FIRST_CHANGED')
      await button('略過未填問題，繼續').click()
      assert((await probe()).state.reflection.furtherExploration==='S4_FIRST_CHANGED','Skip erased existing answers')
      await tab.playwright.getByLabel('觀察一個常用 App',{exact:true}).check()
      await tab.playwright.getByLabel('了解 User Research',{exact:true}).check()
      await tab.playwright.getByLabel('觀察一個常用 App：預計完成日期',{exact:true}).fill('2026-11-01')
      await tab.playwright.getByLabel('觀察一個常用 App：已完成',{exact:true}).check()
      await tab.reload(); await layout('V11'); await screenshot('next-steps-390')
      // Saving navigates immediately; replay the save after returning below.
      // A browser dblclick can lose its target between the first and second click.
      await button('存入 Career Passport').click()
      await tab.reload(); await layout('V12')
      let state=(await probe()).state
      assert(state.passport.length===1 && state.passport[0].decisions.length===5,'Passport save failed')
      assert(state.passport[0].nextSteps[0].completed===true && state.passport[0].nextSteps[0].targetDate==='2026-11-01','Action state lost')
      const originalId=state.passport[0].id
      await tab.goto(base+'/story/ux-community-signup/next'); await button('存入 Career Passport').click()
      state=(await probe()).state
      assert(state.passport.length===1 && state.passport[0].id===originalId,'Repeated save duplicated entry')
      pass('Test 01: fill, skip and modify Reflection')
      pass('Tests 02/03/05/06: save, idempotency, persistence and actual evidence')
      return state.passport[0]
    },
    async secondSave() {
      const previous=(await probe()).state.passport[0]
      await button('開始另一次職業體驗').click(); await button('進入故事').click()
      assert((await probe()).state.storyProgress.storyRunId!==previous.storyRunId,'Reused run ID')
      await finishStory([0,2,2,1,0])
      await button('想想你的感受').click()
      assert(Object.keys((await probe()).state.reflection).length===0,'Reflection leaked from previous run')
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('Temporary draft')
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('')
      await tab.reload()
      assert(Object.keys((await probe()).state.reflection).length===0 && (await probe()).recovery===null,'Cleared optional answer reported as damaged data')
      await button('略過未填問題，繼續').click(); await button('存入 Career Passport').click(); await tab.reload()
      const state=(await probe()).state
      assert(state.passport.length===2,'Missing second experience')
      assert(state.passport[1].reflection.additionalNotes==='S4_PRIVATE_FIRST','First reflection overwritten')
      assert(Object.keys(state.passport[0].reflection).length===0,'Skipped reflection not empty')
      return pass('Test 04: independent repeated experience and skipped reflection')
    },
    async editing() {
      await tab.playwright.locator('summary').nth(0).click(); await button('修改反思').click()
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('S4_PRIVATE_SECOND')
      await button('完成反思修改').click(); await tab.playwright.locator('summary').nth(0).click()
      await tab.playwright.locator('summary').nth(1).click(); await button('修改反思').click()
      await button('清除這條記錄的反思').click()
      let state=(await probe()).state
      assert(Object.keys(state.passport[1].reflection).length===0 && state.passport[0].reflection.additionalNotes==='S4_PRIVATE_SECOND','Clear affected another entry')
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('S4_PRIVATE_FIRST_EDITED')
      await button('完成反思修改').click()
      await tab.playwright.getByLabel('觀察一個常用 App：已完成',{exact:true}).uncheck()
      await tab.reload(); state=(await probe()).state
      assert(state.passport[1].nextSteps[0].completed===false && !state.passport[1].nextSteps[0].completedAt,'Uncompleted state did not persist')
      assert(state.passport[0].reflection.additionalNotes==='S4_PRIVATE_SECOND' && state.passport[1].reflection.additionalNotes==='S4_PRIVATE_FIRST_EDITED','Entry edit isolation failed')
      await tab.playwright.locator('summary').nth(1).click(); await layout('V12 expanded'); await screenshot('passport-390')
      await button('預覽分享這次體驗').click()
      return pass('Test 07: edit/clear one entry and track actions without affecting another')
    },
    async sharing() {
      const state=(await probe()).state
      assert(await tab.playwright.getByLabel('選擇要分享的體驗',{exact:true}).getAttribute('id')==='share-entry','Entry picker missing')
      const names=['Career Experience','Behaviour Evidence','Reflection','Next Steps']
      const defaults=await tab.playwright.locator('fieldset input[type=checkbox]').evaluateAll(els=>els.map(e=>e.checked))
      assert(JSON.stringify(defaults)==='[true,true,false,false]','Wrong share defaults')
      for(let mask=0;mask<16;mask++) {
        for(let i=0;i<4;i++) await tab.playwright.getByLabel(names[i],{exact:true}).setChecked(Boolean(mask & (1<<i)))
        const text=await tab.playwright.locator('[data-share-preview]').innerText()
        assert(text.includes('S4_PRIVATE_FIRST_EDITED')===Boolean(mask&4),'Reflection privacy failure')
        assert(!text.includes('S4_PRIVATE_SECOND'),'Wrong selected entry')
        assert(text.includes('觀察一個常用 App')===Boolean(mask&8),'Next steps privacy failure')
        assert((await button('建立分享摘要').isEnabled())===(mask!==0),'Empty sharing should be disabled')
      }
      await tab.playwright.getByLabel('選擇要分享的體驗',{exact:true}).selectOption(state.passport[0].id)
      assert(!((await tab.playwright.locator('[data-share-preview]').innerText()).includes('S4_PRIVATE')),'Entry switch retained reflection consent')
      await tab.playwright.getByLabel('Reflection',{exact:true}).check()
      assert((await tab.playwright.locator('[data-share-preview]').innerText()).includes('S4_PRIVATE_SECOND'),'Selected second entry missing')
      await button('建立分享摘要').click()
      assert((await probe()).counters.clipboard===0,'Clipboard used automatically')
      await button('複製摘要').click()
      assert(await tab.playwright.getByText('無法自動複製。請選取下方文字，使用裝置的複製功能。',{exact:true}).isVisible(),'Missing manual copy fallback')
      await tab.playwright.getByLabel('Reflection',{exact:true}).uncheck()
      assert(await tab.playwright.locator('#final-share-text').count()===0,'Stale generated summary retained private data')
      await button('建立分享摘要').click(); await layout('V13'); await screenshot('share-390')
      const counts=(await probe()).counters
      assert(counts.network===0 && counts.share===0 && counts.clipboard===1,'Unexpected transmission or clipboard use '+JSON.stringify(counts))
      pass('Test 08: all 16 sharing combinations, entry switching and stale-card privacy')
      return pass('Test 09: no network/share/automatic clipboard; explicit-copy fallback', counts)
    },
    async faults() {
      await tab.goto(base+'/tests/e2e/fixtures.html'); await button('Corrupt test storage').click()
      await tab.goto(base+'/passport')
      assert(await tab.playwright.getByText('你的 Passport 還是空的。',{exact:true}).isVisible(),'Corrupt data did not recover')
      assert(await tab.playwright.getByText('部分本地資料不完整，已恢復可讀取的記錄。請檢查你的 Passport。',{exact:true}).isVisible(),'Missing corruption feedback')
      assert((await probe()).recovery==='{broken sprint4 test','Original damaged data not preserved')
      await tab.goto(base+'/tests/e2e/fixtures.html'); await button('Block test storage writes').click()
      await tab.goto(base+'/onboarding/about-you')
      await tab.playwright.getByLabel('我們可以怎樣稱呼你？',{exact:true}).fill('Unsaved test nickname')
      assert(await tab.playwright.getByRole('alert').isVisible(),'Missing write failure feedback')
      await tab.goto(base+'/tests/e2e/fixtures.html'); await button('Allow test storage writes').click()
      await tab.goto(base+'/passport')
      await tab.goto(base+'/share?entry=missing')
      assert(await tab.playwright.getByText('找不到這條體驗記錄，請返回 Passport 重新選擇。',{exact:true}).isVisible(),'Invalid selected entry silently replaced')
      await tab.goto(base+'/not-a-route')
      assert(await button('開始探索').isVisible(),'Unknown route did not recover')
      await tab.goto(base+'/tests/e2e/fixtures.html'); await button('Restore test data').click()
      await tab.goto(base+'/passport')
      assert((await probe()).state.passport.length===2,'Synthetic test data did not restore')
      return pass('Test 11: corrupt/missing storage, write failure and invalid entry/route recovery')
    },
  }
}

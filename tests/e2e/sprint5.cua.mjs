// Run after Sprint 4 regression has created two synthetic experiences.
export function sprint5Suite(tab, screenshot = async () => {}) {
  const base='http://localhost:5177', results=[]
  const button=name=>tab.playwright.getByRole('button',{name,exact:true})
  const assert=(value,message)=>{if(!value)throw Error(message)}
  const probe=async()=>JSON.parse(await tab.playwright.locator('#s4-probe').textContent())
  const pass=name=>{results.push({name,status:'passed'});return results.at(-1)}
  const layout=async()=>{
    const value=await tab.playwright.evaluate(()=>({width:document.defaultView.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      outside:[...document.querySelectorAll('button,textarea,a[download],dialog[open]')].filter(e=>e.getClientRects().length).filter(e=>e.getBoundingClientRect().left<0||e.getBoundingClientRect().right>document.documentElement.clientWidth+1).map(e=>e.textContent)}))
    assert(!value.overflow&&!value.outside.length,'Mobile overflow '+JSON.stringify(value));return value
  }
  return {results,probe,layout,
    async privacyExport(){
      await tab.goto(base+'/passport')
      await button('資料與私隱說明').press('Enter')
      assert(await tab.playwright.getByRole('dialog',{name:'資料與私隱說明',exact:true}).isVisible(),'Privacy dialog missing')
      await layout();await screenshot('privacy-390')
      await button('知道了').click()
      await button('導出我的資料（JSON）').click()
      const json=JSON.parse(await tab.playwright.locator('#data-export-json').evaluate(e=>e.value))
      const data=(await probe()).document
      assert(json.schemaVersion===3&&json.profile.nickname==='Alex','Wrong export header/profile')
      assert(JSON.stringify(json.experience)===JSON.stringify(data.experience),'Export differs from saved document')
      assert(json.experience.passport.length===2,'Missing exported entries')
      assert(json.experience.passport.every(e=>e.decisions.length===5&&e.behaviourEvidence.length===5),'Missing actual choices/evidence')
      const link=tab.playwright.getByRole('link',{name:'下載 JSON 檔案',exact:true})
      assert((await link.getAttribute('href')).startsWith('blob:'),'Export is not a local file')
      assert(await link.getAttribute('download')==='carie-exploration-records.json','Download filename missing')
      await layout();await screenshot('export-390')
      pass('Privacy information, keyboard access and exact JSON export')
      return json
    },
    async migration(){
      const before=(await probe()).state
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Convert test data to v2').click()
      await tab.goto(base+'/passport')
      assert(await tab.playwright.getByText('已讀取舊版本地資料並升級保存格式。舊副本會保留至你主動刪除資料。',{exact:true}).isVisible(),'Missing migration notice')
      assert(JSON.stringify((await probe()).state)===JSON.stringify(before),'Migration changed valid data')
      await tab.reload();assert((await probe()).state.passport.length===2,'Migration unstable after reload')
      return pass('v2 migration preserves both entries and gives feedback')
    },
    async failedSave(){
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Block test storage writes').click()
      await tab.goto(base+'/story/ux-community-signup/next');await button('存入 Career Passport').click()
      assert((await tab.url()).endsWith('/next'),'Failed save navigated as success')
      assert(await tab.playwright.getByRole('alert').isVisible(),'Missing write error')
      assert((await probe()).state.passport.length===2,'Failed save damaged entries')
      await screenshot('save-error-390')
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Allow test storage writes').click()
      await tab.goto(base+'/story/ux-community-signup/next');await button('存入 Career Passport').click()
      assert((await tab.url()).endsWith('/passport'),'Saving did not recover')
      return pass('Write failure stays on form; retry after unblocking succeeds')
    },
    async deleteOne(){
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Add disposable legacy copies').click()
      await tab.goto(base+'/passport');const before=(await probe()).state
      await tab.playwright.locator('summary').nth(1).click()
      await button('刪除這次體驗').click();await button('取消').click()
      assert((await probe()).state.passport.length===2,'Cancel deleted data')
      await button('刪除這次體驗').click();await layout();await screenshot('delete-confirm-390')
      await button('確認刪除這次體驗').click()
      await tab.reload();const after=await probe()
      assert(after.state.passport.length===1&&after.state.passport[0].id===before.passport[0].id,'Wrong record removed')
      assert(JSON.stringify(after.state.passport[0])===JSON.stringify(before.passport[0]),'Other entry changed')
      assert(!after.keys.includes('carie_reflection_v1')&&!after.keys.some(k=>k.includes('_recovery')),'Private legacy/recovery copies remain')
      assert(after.keys.includes('unrelated-test-key'),'Unrelated data removed')
      await tab.goto(base+'/share?entry='+encodeURIComponent(before.passport[1].id))
      assert(await tab.playwright.getByText('找不到這條體驗記錄，請返回 Passport 重新選擇。',{exact:true}).isVisible(),'Deleted entry still shareable')
      await tab.goto(base+'/passport')
      return pass('Delete confirmation/cancel, one-entry isolation, backup purge, deleted share link')
    },
    async clearAll(){
      await button('清除全部本地探索資料').click();await button('保留資料，返回').click()
      assert((await probe()).state.passport.length===1,'Cancel clear-all changed records')
      await button('清除全部本地探索資料').click();await screenshot('clear-confirm-390')
      await button('確認清除全部資料').click()
      assert((await tab.url())===base+'/','Clear-all did not return home')
      await tab.reload();const after=await probe()
      assert(after.document.profile.nickname===''&&after.state.passport.length===0,'Personal data survived clear-all')
      assert(Object.keys(after.state.reflection).length===0&&Object.keys(after.state.storyProgress.choices).length===0,'Active draft survived clear-all')
      assert(JSON.stringify(after.keys.filter(k=>k.startsWith('carie_')))==='["carie_student_data_v3"]','Legacy data may resurrect')
      await tab.goto(base+'/passport');assert(await tab.playwright.getByText('你的 Passport 還是空的。',{exact:true}).isVisible(),'Missing empty state')
      await layout();await screenshot('empty-passport-390')
      return pass('Clear-all confirmation/cancel, full cleanup, refresh and empty state')
    },
    async errorBoundary(){
      const before=JSON.stringify((await probe()).state)
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Trigger test render failure').click()
      await tab.goto(base+'/passport')
      assert(await tab.playwright.getByText('頁面暫時無法顯示',{exact:true}).isVisible(),'Render boundary missing')
      assert(JSON.stringify((await probe()).state)===before,'Render error changed persisted data')
      await screenshot('error-boundary-390')
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Allow test rendering').click()
      await tab.goto(base+'/passport')
      assert(await button('資料與私隱說明').isVisible(),'App did not recover after render error')
      return pass('Render error boundary preserves stored data and recovers')
    },
  }
}

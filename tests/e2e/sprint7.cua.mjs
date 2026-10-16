// Run through the documented CUA browser API after sprint6Suite completes three careers.
// Uses only synthetic localhost:5177 data. It does not access the user's preview ports.
export function sprint7Suite(tab, screenshot=async()=>{}) {
  const base='http://localhost:5177',results=[]
  const button=name=>tab.playwright.getByRole('button',{name,exact:true})
  const label=name=>tab.playwright.getByLabel(name,{exact:true})
  const assert=(condition,message)=>{if(!condition)throw Error(message)}
  const probe=async()=>JSON.parse(await tab.playwright.locator('#s4-probe').textContent())
  const pass=name=>{const result={name,status:'passed'};results.push(result);return result}
  const layout=async()=>{const value=await tab.playwright.evaluate(()=>({width:document.defaultView.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,small:[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length && e.getBoundingClientRect().height>0 && e.getBoundingClientRect().height<43.5).map(e=>e.textContent)}));assert(value.width===390&&!value.overflow&&!value.small.length,'Mobile layout '+JSON.stringify(value));return value}
  const open=async career=>{
    await tab.goto(base+'/passport');await tab.playwright.locator('[data-entry-id]').first().waitFor({state:'visible'})
    const entry=(await probe()).state.passport.find(e=>e.careerId===career)
    assert(entry,'Missing test experience '+career)
    const card=tab.playwright.locator(`[data-entry-id="${entry.id}"]`)
    await card.locator('summary').click();await card.getByRole('button',{name:'探索升學路線',exact:true}).click()
    await tab.playwright.getByRole('heading',{name:'探索我的升學路線',exact:true}).waitFor({state:'visible'})
    assert((await tab.url()).includes('/pathways/'+career+'?entry='),'Wrong explorer URL')
    assert((await tab.playwright.locator('main').innerText()).includes(entry.behaviourEvidence[0].evidence),'Wrong experience evidence')
    return entry
  }
  return {results,probe,layout,open,
    async careerRoutes(){
      for(const career of ['ux-designer','logistics-coordinator','community-programme-coordinator']) {
        await open(career);assert(await tab.playwright.getByText('了解這條路線',{exact:true}).count()===5,'Five route types missing')
        for(let i=0;i<5;i++){await tab.playwright.getByText('了解這條路線',{exact:true}).nth(i).click();await layout()}
        if(career==='ux-designer'){
          await button('查看課程要求').click();const text=await tab.playwright.getByRole('dialog').innerText()
          for(const expected of ['JS3569','2027/28','一般入學要求','課程特定要求','符合最低入學要求不代表保證獲取錄','最後核對日期'])assert(text.includes(expected),'Missing programme field '+expected)
          await layout();await screenshot('programme-390');await button('關閉').click()
        }else assert((await tab.playwright.locator('main').innerText()).includes('目前沒有已核實的當屆具體課程'),'Unverified course gap not disclosed')
        const links=await tab.playwright.locator('main a[href^="https:"]').evaluateAll(es=>es.map(e=>({href:e.href,rel:e.rel,target:e.target})))
        assert(links.length>0&&links.every(l=>l.rel.includes('noreferrer')&&l.target==='_blank'),'External link privacy')
        await screenshot(career+'-pathways-390')
      }
      return pass('Three Passport entries open five routes; real evidence, programme year/source fields, empty course disclosure, safe external links and 390px layout')
    },
    async plan(){
      const entry=await open('ux-designer')
      assert(!(await probe()).document.profile.academicStartingPoint,'Academic input was not skipped')
      await button('將行動存入 Passport').click();await button('將行動存入 Passport').click()
      const saved=()=>probe().then(p=>p.state.passport.find(e=>e.id===entry.id))
      assert((await saved()).nextSteps.filter(s=>s.relatedPathwayId).length===1,'Duplicate plan action')
      await label('行動名稱').fill('比較官方設計課程要求');await label('行動說明').fill('核實學年及作品集資料，再向老師提問。');await button('儲存行動修改').click()
      await label('行動狀態').selectOption('in_progress');await tab.reload();await label('行動狀態').waitFor({state:'visible'})
      assert(await label('行動狀態').evaluate(e=>e.value)==='in_progress','In-progress lost on refresh')
      assert((await saved()).nextSteps.find(s=>s.relatedPathwayId).title==='比較官方設計課程要求','Action edit lost')
      await label('行動狀態').selectOption('completed');assert((await saved()).nextSteps.find(s=>s.relatedPathwayId).completedAt,'Completion date missing')
      await tab.playwright.getByRole('link',{name:'返回 Career Passport',exact:true}).click()
      const card=tab.playwright.locator(`[data-entry-id="${entry.id}"]`);await card.locator('summary').click()
      const completed=card.getByLabel('比較官方設計課程要求：已完成',{exact:true});assert(await completed.evaluate(e=>e.checked),'Passport missed completion');await completed.uncheck()
      await card.getByRole('button',{name:'探索升學路線',exact:true}).click();await label('行動狀態').waitFor({state:'visible'})
      assert(await label('行動狀態').evaluate(e=>e.value)==='not_started','Legacy toggle retained stale plan status')
      const others=(await probe()).state.passport.filter(e=>e.id!==entry.id);assert(others.every(e=>e.nextSteps.every(s=>!s.relatedPathwayId)),'Action leaked to other experience')
      await label('我的下一步').selectOption('compare');await button('將行動存入 Passport').click();await button('移除此行動').nth(1).click();await button('移除此行動').nth(1).waitFor({state:'hidden'})
      assert((await saved()).nextSteps.filter(s=>s.relatedPathwayId).length===1,'Remove action failed')
      await layout();await screenshot('plan-390')
      return pass('Skip academic; create/deduplicate/edit/reload/complete/uncomplete/delete plan, linked only to selected Passport entry')
    },
    async academicAndMentor(){
      await tab.playwright.getByText('我的學業起點（可跳過）',{exact:true}).click()
      await label('目前階段').selectOption('S5');await label('數學').check();await label('英文').check();await label('科學').check()
      assert(!await label('中文').isEnabled(),'More than three subjects allowed')
      await label('什麼最能幫助我？').selectOption('改善某一科的學習方法');await tab.reload()
      await tab.playwright.getByText('我的學業起點（可跳過）',{exact:true}).click();assert(await label('數學').evaluate(e=>e.checked),'Subject did not persist')
      await layout();await screenshot('academic-390');await button('和老師或導師討論').click()
      const dialog=tab.playwright.getByRole('dialog'), preview=tab.playwright.locator('[data-mentor-preview]')
      assert(!await button('確認摘要內容').isEnabled(),'Empty summary can be confirmed')
      assert(!(await preview.innerText()).includes('數學'),'Academic defaults leaked')
      assert((await dialog.locator('input').evaluateAll(es=>es.map(e=>e.checked))).every(v=>!v),'Mentor defaults not private')
      await label('探索計劃及討論問題').check();await label('職業體驗').check()
      assert(!(await preview.innerText()).includes('數學'),'Plan implicitly exposed academic')
      await label('選填學業起點').check();assert((await preview.innerText()).includes('數學'),'Opt-in academic missing')
      assert(!(await preview.innerText()).includes('PRIVATE_S6_0'),'Reflection leaked by default')
      await label('反思（預設不包含）').check();assert((await preview.innerText()).includes('PRIVATE_S6_0'),'Reflection toggle failed');await label('反思（預設不包含）').uncheck()
      await button('確認摘要內容').click();await label('可手動複製的已確認摘要').waitFor({state:'visible'});await layout();await screenshot('mentor-preview-390')
      await label('選填學業起點').uncheck();assert(!await button('複製已確認摘要').isVisible(),'Old confirmation survived changed contents')
      await button('確認摘要內容').click();assert(!(await label('可手動複製的已確認摘要').evaluate(e=>e.value)).includes('數學'),'Confirmed summary retained unchecked data')
      const counters=(await probe()).counters;assert(counters.network===0&&counters.share===0&&counters.clipboard===0,'Automatic transmission '+JSON.stringify(counters))
      await button('複製已確認摘要').click();assert((await probe()).counters.clipboard===1,'Explicit copy not attempted')
      await button('關閉').click();await button('和老師或導師討論').click();assert(!await button('確認摘要內容').isEnabled(),'Consent persisted when reopened');await button('關閉').click()
      await button('刪除學業起點資料').click();await tab.reload();assert(!(await probe()).document.profile.academicStartingPoint,'Deleted academic restored')
      return pass('Optional subjects and cap persist, deletion persists; mentor opt-ins, confirmation invalidation, explicit copy only, reflection private, no automatic transmission')
    },
    async invalidRoutes(){
      for(const path of ['/pathways/missing','/pathways/ux-designer?entry=missing']) {await tab.goto(base+path);await tab.playwright.getByRole('heading',{name:'找不到對應的體驗或升學路線'}).waitFor({state:'visible'});await layout()}
      await tab.goto(base+'/pathways/ux-designer');await tab.playwright.getByRole('heading',{name:'選擇一條 UX Designer 體驗'}).waitFor({state:'visible'})
      return pass('Unknown career, deleted entry and missing entry have safe recovery/selection states')
    },
  }
}

// Production continuation: no probe, no storage overrides, no fixture.
export async function productionPathways(tab, expectedChoices, screenshot=async()=>{}) {
  const button=name=>tab.playwright.getByRole('button',{name,exact:true})
  const assert=(v,m)=>{if(!v)throw Error(m)}
  const base=new URL(await tab.url()).origin
  await button('導出我的資料（JSON）').click()
  let data=JSON.parse(await tab.playwright.locator('#data-export-json').evaluate(e=>e.value))
  assert(data.experience.passport.length===1,'Production save missing')
  assert(JSON.stringify(data.experience.passport[0].decisions.map(d=>d.selectedLabel))===JSON.stringify(expectedChoices),'Production choices mismatch')
  await tab.goto(base+'/passport');await tab.playwright.locator('summary').first().click();await button('探索升學路線').click()
  await tab.playwright.getByRole('heading',{name:'探索我的升學路線'}).waitFor({state:'visible'})
  const explorer=await tab.url()
  await tab.playwright.getByText('了解這條路線',{exact:true}).first().click();await button('查看課程要求').click()
  assert((await tab.playwright.getByRole('dialog').innerText()).includes('已核對官方來源（摘要）'),'Current HK review date wrongly unverified')
  await screenshot('production-programme-390');await button('關閉').click()
  await button('將行動存入 Passport').click();await tab.playwright.getByLabel('行動狀態',{exact:true}).selectOption('in_progress')
  await tab.reload();await tab.playwright.getByLabel('行動狀態',{exact:true}).waitFor({state:'visible'})
  assert(await tab.playwright.getByLabel('行動狀態',{exact:true}).evaluate(e=>e.value)==='in_progress','Production plan refresh lost')
  await screenshot('production-pathways-390')
  await button('和老師或導師討論').click();await tab.playwright.getByLabel('探索計劃及討論問題',{exact:true}).check();await button('確認摘要內容').click()
  assert((await tab.playwright.getByLabel('可手動複製的已確認摘要',{exact:true}).evaluate(e=>e.value)).includes('進行中'),'Production mentor plan missing')
  await button('關閉').click();await tab.goto(base+'/passport');await button('導出我的資料（JSON）').click()
  data=JSON.parse(await tab.playwright.locator('#data-export-json').evaluate(e=>e.value))
  const step=data.experience.passport[0].nextSteps.find(s=>s.relatedPathwayId)
  assert(step?.status==='in_progress'&&step.relatedCareerId==='ux-designer','Production export missing plan')
  assert(!data.profile.academicStartingPoint,'Production skip created academic data')
  await tab.goto(base+'/passport');await tab.playwright.locator('summary').first().click();await button('預覽分享這次體驗').click()
  await tab.playwright.getByLabel('Next Steps',{exact:true}).check();await button('建立分享摘要').click()
  assert((await tab.playwright.locator('[data-share-preview]').innerText()).includes('進行中'),'Existing share lost three-state plan')
  assert(await tab.playwright.getByLabel('Reflection',{exact:true}).evaluate(e=>!e.checked),'Reflection not private')
  const mobile=await tab.playwright.evaluate(()=>({width:document.defaultView.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))
  assert(mobile.width===390&&!mobile.overflow,'Production mobile overflow')
  await tab.goto(explorer)
  return {status:'passed',expectedChoices,checks:['actual saved five choices','programme verified on Hong Kong date','optional academic skipped','plan persistence and export','mentor confirmation','existing Share Preview progress label','390px'],mobile,explorer}
}

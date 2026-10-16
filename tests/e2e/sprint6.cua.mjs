// CUA real-browser tests, isolated localhost:5177 fixture only.
export function sprint6Suite(tab, screenshot = async () => {}) {
  const base='http://localhost:5177', results=[]
  const careers=['ux-designer','logistics-coordinator','community-programme-coordinator']
  const ids=['ux-community-signup','logistics-delivery-dilemma','community-event-challenge']
  const titles=['UX Designer','Logistics Coordinator','Community Programme Coordinator']
  const actions=['觀察一個常用 App','畫一份模擬配送安排','草擬一個小組活動']
  const button=name=>tab.playwright.getByRole('button',{name,exact:true})
  const assert=(v,m)=>{if(!v)throw Error(m)}
  const probe=async()=>JSON.parse(await tab.playwright.locator('#s4-probe').textContent())
  const pass=(name,details={})=>{results.push({name,status:'passed',...details});return results.at(-1)}
  const layout=async name=>{
    const v=await tab.playwright.evaluate(()=>({width:document.defaultView.innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      invalid:[...document.querySelectorAll('button,input,select,textarea,summary')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height>0).filter(e=>e.getBoundingClientRect().left < -1 || e.getBoundingClientRect().right > document.documentElement.clientWidth+1 || (e.tagName==='BUTTON'&&e.getBoundingClientRect().height<43.5)).map(e=>e.textContent)}))
    assert(v.width===390&&!v.overflow&&!v.invalid.length,name+JSON.stringify(v));return v
  }
  const enter=async (i,label)=>{await tab.goto(base+'/ideas');await button('試試這個職業').nth(i).click();await button(label).click();assert((await tab.url())===base+'/story/'+ids[i],'Wrong story route')}
  return {results,probe,layout,
    async draftAll(){
      await tab.goto(base+'/tests/e2e/fixtures.html');await button('Reset test data').click()
      for(let i=0;i<3;i++){
        await enter(i,'進入故事');await layout(titles[i]+' decision')
        await tab.playwright.getByRole('button',{name:/詞彙幫助/}).click()
        assert(await tab.playwright.getByRole('dialog').isVisible(),'Vocabulary missing');await layout('vocabulary')
        await button('明白了，返回我的決定').click()
        await screenshot(careers[i]+'-decision-390')
        await tab.playwright.locator('.story-option').nth(i).click();await button('確認這個選擇').click();await tab.reload()
        await button('暫停 / 離開').click();await layout('pause');await button('儲存並離開').click()
      }
      const p=await probe();assert(p.state.suspendedRuns.length===2,'Switching lost a story draft')
      return pass('Three independent drafts survive career switching and refresh')
    },
    async completeCareer(i){
      await enter(i,'繼續故事');assert((await probe()).state.storyProgress.stage==='confirm','Resume lost confirmation')
      assert((await probe()).state.storyProgress.selectedOptionId===['a','b','c'][i],'Resume loaded wrong option')
      const choices=[]
      for(let d=0;d<5;d++){
        assert(await tab.playwright.getByRole('progressbar').getAttribute('aria-valuenow')===String(d+1),'Progress mismatch')
        if(d===0)await button('返回更改').click()
        await tab.playwright.locator('.story-option').nth((i+d)%3).click();await button('確認這個選擇').click();await button('返回更改').click()
        const chosenIndex=(i+d+1)%3
        choices.push(await tab.playwright.locator('.story-option .story-choice-title').nth(chosenIndex).innerText())
        await tab.playwright.locator('.story-option').nth(chosenIndex).click()
        await button('確認這個選擇').click();await tab.reload();await layout('confirmation')
        if(d===1){await button('暫停 / 離開').click();await button('儲存並離開').click();await button('繼續體驗').click();await button('繼續故事').click()}
        await button('看看發生什麼').click();await tab.reload();await layout('consequence')
        const p=(await probe()).state.storyProgress
        assert(p.choices['d'+(d+1)]===['a','b','c'][chosenIndex],'Choice was not committed');assert(p.evidence.length===d+1,'Duplicate evidence');assert(p.evidence.every(e=>p.choices[e.sourceDecisionId]===e.sourceOptionId),'Wrong evidence source')
        if(d===0)await screenshot(careers[i]+'-consequence-390')
        await button(d===4?'完成故事':'繼續').click()
      }
      assert((await tab.url()).endsWith('/'+ids[i]+'/recap'),'Wrong recap route')
      await tab.playwright.locator('[data-recap-choice]').nth(4).waitFor({state:'visible'})
      const actual=await tab.playwright.locator('[data-recap-choice]').allTextContents({})
      assert(JSON.stringify(actual)===JSON.stringify(choices),'Recap choices wrong: '+JSON.stringify({actual,choices}))
      assert((await tab.playwright.locator('body').innerText()).includes(titles[i]),'Wrong career title')
      await button('想想你的感受').click()
      await tab.playwright.getByLabel('還有什麼想記下來的嗎？',{exact:true}).fill('PRIVATE_S6_'+i)
      await button('略過未填問題，繼續').click();await tab.playwright.getByLabel(actions[i],{exact:true}).check()
      await button('存入 Career Passport').click();await tab.reload()
      const p=(await probe()).state, entry=p.passport[0]
      assert(entry.careerId===careers[i]&&entry.storyVersion==='1.0.0','Wrong saved career/version')
      assert(entry.reflection.additionalNotes==='PRIVATE_S6_'+i,'Reflection lost')
      assert(JSON.stringify(entry.decisions.map(d=>d.selectedLabel))===JSON.stringify(choices),'Saved choices changed')
      await tab.goto(base+'/story/'+ids[i]+'/next');await button('存入 Career Passport').click()
      assert((await probe()).state.passport.length===i+1,'Repeated save duplicated entry')
      await tab.playwright.locator('summary').nth(0).click();await button('預覽分享這次體驗').click()
      return this.verifyShare(i,choices)
    },
    async verifyShare(i, choices) {
      await tab.playwright.getByLabel('Next Steps',{exact:true}).waitFor({state:'visible'})
      const labels=['Career Experience','Behaviour Evidence','Reflection','Next Steps']
      assert(JSON.stringify(await tab.playwright.locator('fieldset input').evaluateAll(es=>es.map(e=>e.checked)))==='[true,true,false,false]','Share defaults')
      for(let mask=0;mask<16;mask++){
        for(let j=0;j<4;j++)await tab.playwright.getByLabel(labels[j],{exact:true}).setChecked(Boolean(mask&(1<<j)))
        const text=await tab.playwright.locator('[data-share-preview]').innerText()
        assert(text.includes('PRIVATE_S6_'+i)===Boolean(mask&4),'Reflection consent mismatch')
        assert(text.includes(actions[i])===Boolean(mask&8),'Action consent mismatch')
        assert((await button('建立分享摘要').isEnabled())===(mask!==0),'Empty share state')
      }
      await tab.playwright.getByLabel('Reflection',{exact:true}).uncheck();await button('建立分享摘要').click();await layout('share')
      const counters=(await probe()).counters
      assert(counters.network===0&&counters.share===0&&counters.clipboard===0,'Automatic transmission')
      await screenshot(careers[i]+'-share-390')
      return pass(titles[i]+': full flow, actual recap, reflection, repeated save and 16 sharing combinations',{choices,counters})
    },
    async integration(){
      await tab.goto(base+'/passport');await layout('passport')
      const before=(await probe()).state.passport
      assert(before.length===3&&new Set(before.map(e=>e.careerId)).size===3,'Missing coexistence')
      await screenshot('three-career-passport-390')
      await tab.goto(base+'/story/unknown-story');assert(await tab.playwright.getByRole('heading',{name:'找不到這個職業故事',exact:true}).isVisible(),'Missing invalid story page')
      await tab.goto(base+'/story/setup/unknown-career');assert(await tab.playwright.getByRole('heading',{name:'找不到這個職業故事',exact:true}).isVisible(),'Missing invalid career page')
      await tab.goto(base+'/story/ux-community-signup/recap');assert((await tab.url()).includes('/setup/ux-designer'),'Cross-story recap exposed wrong run')
      await tab.goto(base+'/home');assert(await tab.playwright.getByText('Coming Soon · 故事即將推出',{exact:true}).isVisible(),'Missing coming-soon state')
      await tab.goto(base+'/passport');await tab.playwright.locator('summary').nth(1).click();await button('再次體驗這個故事').click();await button('進入故事').click()
      const p=(await probe()).state.storyProgress;assert(p.storyId===ids[1]&&p.storyRunId!==before[1].storyRunId,'Replay reused run')
      for(let d=0;d<5;d++){await tab.playwright.locator('.story-option').nth(0).click();await button('確認這個選擇').click();await button('看看發生什麼').click();await button(d===4?'完成故事':'繼續').click()}
      await button('想想你的感受').click();await button('略過未填問題，繼續').click();await button('存入 Career Passport').click();await tab.reload()
      const after=(await probe()).state.passport
      assert(after.length===4&&JSON.stringify(after.slice(1))===JSON.stringify(before),'Replay changed previous records')
      return pass('Three careers coexist, invalid routes, coming-soon and independent logistics replay')
    },
  }
}

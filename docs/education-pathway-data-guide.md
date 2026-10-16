# Education Pathway Data Guide — Sprint 7

本模块只帮助学生查资料、比较路线和准备问题。相关学习方向不是职业适配判断，也不是就业或入学保证。界面用繁体中文，内容资料独立于 React。

## 文件与职责

| 文件 | 内容 |
| --- | --- |
| `src/types/education.ts` | Pathway、Programme、Source、Relationship、AcademicStartingPoint、PlanStatus 类型 |
| `src/data/education/sources.ts` | 官方来源登记、网址、查阅日期、适用学年、访问结果和核对说明 |
| `src/data/education/programmes.ts` | 手工整理的真实课程、学年、三组要求、来源和复核期限 |
| `src/data/education/pathways.ts` | 五类路径、职业查询方向、路径与课程及职业关联 |
| `src/data/education/registry.ts` | 查询函数、逐项核实状态、动态过期判断、官方链接白名单 |
| `src/data/education/planning.ts` | 可选学业资料规范化、NextStep 扩展、讨论问题模板和明确勾选的摘要 |
| `src/data/education/validate.ts` | 发布前资料图检查 |
| `src/views/PathwayExplorer.tsx` | `/pathways/:careerId?entry=...` 页面及课程 bottom sheet |

## Schema

EducationPathway 使用稳定 ID（例如 `hk-higher_diploma`），包含英文／中文标题、pathwayType、描述、progressionOptions、relatedCareerIds、relatedProgrammeIds、sourceIds。支持 bachelor、associate、higher_diploma、vocational、other。

EducationProgramme 的 ID 包含院校、官方代码和入学周期，例如 `polyu-js3569-2027`。字段包括 programmeName、institution、qualificationLevel、applicationChannel、admissionYear、officialProgrammeCode、officialUrl、sourceIds、lastVerifiedAt、reviewBy、verificationStatus。三组要求分别为 generalEntranceRequirements、programmeSpecificRequirements、otherConditions；每组独立保存 `text | null`、admissionYear、sourceIds、verificationStatus。

EducationSource 保存机构、页面标题、精确 URL、accessedAt、可选 applicableYear、verificationNotes 及 `read | unavailable`。成功读取不等于核实整所院校，也不能把目录页面当成所有课程的入学要求。

CareerPathwayRelationship 保存 careerId、pathwayId、explanation、sourceIds、fields 和 `editorial_study_connection`。所有职业领域映射明确是根据故事工作内容整理的查询方向，不标为院校认可的就业路径。`programmeCareers` 进一步限制具体课程显示范围，不能因为一条路径被三个职业共用，就把 UX 设计课程显示成物流课程。

## 找资料与录入

1. 从教育局生涯规划索引找到 JUPAS、iPASS、E-APP、e导航或院校入口。优先直接读取院校的当届招生页面；搜索摘要只能作为找资料的线索。
2. 核对官方课程名称、代码、颁授资格、授课模式、申请对象、申请渠道和明确入学周期。例如 2027 年 9 月入学对应 2027/28，不把某页面的 2026 统计或旧 PDF 当作 2027 要求。
3. 同时查看课程特定页及它链接的一般要求页；分别记录来源，不能把一所大学的要求推广到全部课程。
4. 区分本地 HKDSE／联招、非联招、非本地、全日制及兼读制。当前数据只摘要理大 JS3569 的联招途径，不采用同页的非联招截止日期。
5. 一般要求不等于录取保证；作品集、面试、Band A 或替代资格等条件须有来源。没有核对过的条件用 null + needs_review；不得推测“无其他要求”。
6. 不确定招生周期时，不录入带有 DSE 门槛的课程。可只提供已经核对的路线类别和官方查询入口。不得为了让三个职业都有具体课程而虚构院校或代码。
7. 新增 Source 后新增 Programme，接入 Pathway 的 relatedProgrammeIds，并在 programmeCareers 中明确相关职业。新院校无需新增 UI。
8. 路径的说明和课程中文摘要由编辑整理，应注明“编辑摘要／非院校正式译本”；只有能逐项对照官方文字的事实才能使用 verified。AI 生成的学习方向、衔接推测不能因此变成官方事实。

## 初始资料集（2026-10-16）

- 五类路径、三个职业、15 条编辑关系。
- 1 个真实课程：香港理工大学 JS3569，Bachelor of Arts (Honours) Scheme in Design，2027/28；两条直接课程／一般要求来源支持摘要。
- 9 条官方来源登记，其中 6 个页面成功读取；VTC 入学主页、iPASS、E-APP 本次读取失败，记录 unavailable 并显示限制。
- 物流与社区职业没有录入当前已核实的具体课程。它们展示五类路线和学习查询方向，不显示未经核对的 DSE 要求。
- e导航网站继续服务；其流动应用程式已停运。不要把停运 app 当成可使用工具。
- 没有录取分数线、概率、排名推荐、真实活动日期或自动资格审核。官方 DSE 最低要求中的等级只是课程事实，不是给学生计算的技能分数。

## 更新模板

复制以下结构到对应数据文件，替换所有占位内容后才可发布。新学年应新建周期 ID，不静默覆盖旧周期为“最新”。

```ts
const source = {
  id: 'institution-programme-year', organisation: '官方机构', title: '官方页标题',
  url: 'https://official.example/verified-page', accessedAt: 'YYYY-MM-DD',
  applicableYear: 'YYYY/YY', accessStatus: 'unavailable',
  verificationNotes: '逐字段核对位置、渠道、例外、访问失败及不确定之处',
}
const requirement = {
  text: null, admissionYear: 'YYYY/YY', sourceIds: [source.id],
  verificationStatus: 'needs_review',
}
// Programme: 使用 EducationProgramme 全部字段；分别替换三组 requirement。
// lastVerifiedAt 只在实际核对后填写；reviewBy 不超过 90 天，招生期建议 30 天。
```

## 学生数据与兼容

继续使用 `carie_student_data_v3` / schemaVersion 3、Experience schemaVersion 2。本 Sprint 是可选字段的增量扩展：旧资料无需人为补填，旧故事及快照不重写。

- `profile.academicStartingPoint?` 只有年级、0–3 个支持科目、希望获得的帮助；白名单规范化，不保存成绩或学校名。删除时通过现有 repository 清理恢复副本；清理失败显示错误并允许重试。
- 探索行动复用 `PassportEntry.nextSteps[]`：原有 id/title/description/completed/targetDate/completedAt 保留，扩展 relatedCareerId、relatedPathwayId、status、createdAt、officialSourceUrl。status 与 completed 同步；旧界面完成／取消完成按钮也能正确更新。
- 相同体验＋路线＋行动模板使用稳定 ID，重复保存不会重复添加；新体验有独立 NextSteps。修改通过已有 updateEntry 同步相同 storyRunId 的当前或暂停草稿。
- 计划编辑不会因官方课程条目过期而丢失学生自己的行动；查看要求时仍重新计算过期标签。
- 现有 Share Preview 不自动加入学业资料。导师摘要五个选项默认全部关闭；反思必须明确勾选。修改内容或选项会使旧确认失效，重新打开不沿用授权。复制只写本地剪贴板，不调用分享 API 或网络；失败时保留可手动复制文本。
- 完整 JSON 导出包含已保存选填学业资料和计划；已导出的文件与剪贴板不由浏览器删除功能追回。

## 检查与重测

```sh
npm run validate:education
npm run typecheck
npm test
npm run build
npm run dev -- --config tests/e2e/vite.config.ts
```

此 Windows 工作区通过 `node .tools/node_modules/npm/bin/npm-cli.js` 执行同一组 npm scripts。浏览器测试由 CUA 调用 `tests/e2e/sprint7.cua.mjs`，先运行 Sprint 6 的三职业完成流程以生成隔离样本。不能直接 `node sprint7.cua.mjs` 就声称完成浏览器测试，也不能只看返回 HTTP 200 就声称内容已核实。

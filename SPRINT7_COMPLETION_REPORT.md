# Carie AI Sprint 7 Completion Report

日期：2026-10-16（香港时间）

已在原 React/TypeScript 项目实现升学探索、可选学业起点、Passport 行动计划及学生控制的导师讨论摘要。构建与本地功能验收通过；**外部网站可访问性仍有缺口，不将所有外链测试报告为通过**。没有新增后端、认证、录取预测、职业适配判断、隐藏积分或自动分享。

## 1. 实际完成的功能

- 三个职业的每条已保存体验均可进入 `/pathways/:careerId?entry=...`，引用该体验的真实故事与行为证据。
- 五类路径及可展开信息，具体课程复用 bottom sheet，无额外课程路由；原 V08 路由及状态机保持不变。
- 课程显示适用学年、一般要求、课程特定要求、其他条件、来源、核对日期及复核期限。
- 数据缺失、过期、访问失败、未保存体验及无效链接有明确反馈；懒加载提供加载状态，使用已有错误边界。
- 学业起点完全可跳过，最多三个支持科目，可修改和删除。
- 探索行动保存、去重、修改、删除、三状态进度，与同一体验的 Next Steps 同步。
- 导师摘要明确选项、预览、确认、手动复制后才可用于交流；复制失败保留文字框。

## 2. 新增或修改文件

新增：

```text
src/types/education.ts
src/data/education/sources.ts
src/data/education/programmes.ts
src/data/education/pathways.ts
src/data/education/registry.ts
src/data/education/planning.ts
src/data/education/validate.ts
src/views/PathwayExplorer.tsx
src/components/AcademicStartingPoint.tsx
src/components/MentorDiscussion.tsx
scripts/validate-education.mjs
tests/education.test.mjs
tests/e2e/sprint7.cua.mjs
docs/education-pathway-data-guide.md
docs/education-source-review-policy.md
SPRINT7_COMPLETION_REPORT.md
verification/sprint7/（实测日志、结果和截图）
```

修改：

```text
src/types/index.ts
src/context/storage.ts
src/context/AppContext.tsx
src/App.tsx
src/views/Passport.tsx
src/components/NextStepsEditor.tsx
src/components/PrivacyInformation.tsx
src/data/share.ts
package.json
README.md
tests/e2e/monitor.js
tests/e2e/fixtures.html
```

没有新增依赖，没有改动三个职业故事内容。此目录没有 Git 元数据，无法提供 Git diff 或 commit；保留既有文件并直接修改所需模块。临时编辑脚本已清理。

## 3. Education Pathway Schema

`EducationPathway`、`EducationProgramme`、`EducationSource`、`CareerPathwayRelationship` 四种独立类型，以稳定 ID 关联。每组招生要求均独立带学年、来源和核实状态，避免整条课程的标签掩盖未核实字段。路线支持 bachelor、associate、higher_diploma、vocational、other。

学生资料仍使用 schemaVersion 3；Experience 仍为 2。新增内容均为可选字段，兼容原有迁移与修复逻辑，不补造旧体验的选择或证据。

## 4. Official Source Registry

来源记录保存机构、标题、精确 URL、查阅日期、适用学年（如适用）、核对备注及访问结果。访问状态与课程事实核实分开。实际读取来源支持 verified 摘要；目录只证明查询入口，不证明所有课程要求。

`programmeStatus()` 在运行时检查完整性、日期及周期。日期以香港日历日期比较，避免凌晨误判；reviewBy 最多为核对日期之后 90 天，当前课程用 30 天。超期或已到所属入学周期显示“請查看最新官方要求”。

## 5. 三个职业对应路径

| 职业 | 学习查询方向 | 路线 |
| --- | --- | --- |
| UX Designer | 设计、数码产品／互动设计、资讯科技 | 学士、副学士、高级文凭、职专教育、其他进修 |
| Logistics Coordinator | 物流／供应链、营运、商业 | 同上五类；具体当届课程待补核 |
| Community Programme Coordinator | 社会科学、社区发展／教育、活动／项目管理 | 同上五类；具体当届课程待补核 |

领域关联属于编辑整理的探索方向，不是官方就业保证。具体设计课程只关联 UX，不会因为路径类别共享就显示在其他职业中。

## 6. 已核实课程和来源数量

**1 个真实课程、9 条来源登记、6 个来源页面成功读取、3 个入口本次未能读取。**

课程：香港理工大学 JS3569 — Bachelor of Arts (Honours) Scheme in Design，2027/28 入学；来源为 [2027 课程页](https://www.polyu.edu.hk/study/ug/jupas/2027/js3569) 及其链接的 [一般入学要求](https://www.polyu.edu.hk/study/ug/admissions/jupas/jupas-general-entrance-requirements)。记录的是经对照的简短摘要，不是院校正式中文译本或完整招生章程。

其余登记来自 [教育局官方索引](https://lifeplanning.edb.gov.hk/tc/about-us/useful-links/)、[本地升学说明](https://lifeplanning.edb.gov.hk/tc/study/local-further-study/websites-for-further-studies.html)、[JUPAS](https://www.jupas.edu.hk/en/programmes-offered/)、[e导航网站](https://enavigator.edb.hkedcity.net/main/index.php)，以及本次无法完整读取的 VTC、iPASS、E-APP。

## 7. 未核实／缺失资料

- VTC 入学主页读取失败、iPASS 逾时、E-APP 返回 502；页面标示限制，并提供教育局索引。
- 物流与社区尚无当前已核实的具体课程要求；不以搜索摘要补造门槛或招生周期。
- 理大一般要求页本身未独立标注 2027/28，是由 2027 课程页链接进入；人工试点复核须确认适用性及特殊资格。
- 理大课程页面通过资料检索成功读取，但本轮内置浏览器直接导航超时。因此“所有官方来源链接均能正常打开”是部分受阻项，未宣称全部通过。

## 8. 学业准备和隐私

可选年级 S4/S5/S6／不透露，0–3 个想获得支持的科目，以及希望获得的帮助。没有成绩、学校、收入字段，没有自动资格审核或因数学需要帮助而排除某条路线。

资料保存在现有本地 repository。删除学业起点同时启动旧副本清理；失败会显示未完成提示并支持重试。完整 JSON 导出说明包含这些选填资料；已有导出文件及剪贴板不由浏览器删除操作追回。

导师摘要的体验、证据、计划、学业起点及反思默认全部关闭。确认只对当前选项和文字有效，内容改变后必须重新确认，关闭后不保存授权。没有真实导师连接或自动传送。

## 9. Pathway Plan 与 Passport

复用 `PassportEntry.nextSteps[]`，增量加入 relatedCareerId、relatedPathwayId、status、createdAt、officialSourceUrl。保留 completed 与完成时间以兼容旧 UI，完成／取消完成不会留下过时状态。

同一体验中相同路线和模板稳定去重。修改通过现有 updateEntry 同步当前／暂停的同一 storyRunId；其他体验不受影响。原 Share Preview 的 Next Steps 能正确显示“進行中”，不会自动包含学业资料。

## 10. 实际测试结果

| 检查 | 结果 |
| --- | --- |
| `npm run typecheck` | 通过，零 TypeScript 错误 |
| `npm test` | 55/55 通过（原 47 项 + 新 8 项） |
| `npm run build` | 通过，包含故事与升学资料验证及生产打包 |
| 三职业单元状态机 | 每职业 243 条选择路径，共 729 条组合继续通过 |
| Sprint 4 CUA | 新学生探索、五次真实选择、暂停恢复、Reflection、重复保存、编辑、16 种分享组合及错误恢复通过 |
| Sprint 5 CUA | 隐私说明、JSON 导出、迁移、保存失败、单条删除、清空及错误边界通过 |
| Sprint 6 CUA | 三职业分别完成五次决策，真实 Recap、证据去重、独立草稿、48 种分享组合、重玩隔离与无效路由通过 |
| Sprint 7 CUA | 三职业五类路径、课程来源和学年、跳过／填写／删除学业资料、计划编辑与进度、摘要隐私和无效路由通过 |
| 分享监测 | 干净测试窗口内 network=0、share=0；明确点击复制前 clipboard=0，点击后为 1，并验证手动复制回退 |
| 390px | 路径展开、课程面板、表单、计划、导师摘要及生产 Share Preview 无横向溢出 |
| 1440px | 生产页面宽 1440，主内容 448，无横向溢出 |
| 生产应用控制台 | 捕获的 error/warn 数量为 0 |
| 官方外链普遍可达性 | 部分受阻；不报告全部通过 |

本机实际命令使用 `node .tools/node_modules/npm/bin/npm-cli.js` 执行上述 npm scripts。开发测试服务器命令：`run dev -- --config tests/e2e/vite.config.ts`；生产预览：`run preview -- --host 127.0.0.1 --port 4182 --strictPort`。

CUA 浏览器方法实际调用：Sprint4 的 regression/firstSave/secondSave/editing/sharing/faults，Sprint5 的 privacyExport/migration/failedSave/deleteOne/clearAll/errorBoundary，Sprint6 的 draftAll/completeCareer(0..2)/integration，Sprint7 的 careerRoutes/plan/academicAndMentor/invalidRoutes，以及 productionPathways。

生产 smoke 原脚本在 Decision 4 consequence 因浏览器工具点击失败中断；检查当前可见状态后继续完成 Decision 5、Recap、保存，再通过独立 productionPathways 检查真实导出选择、课程标签、计划刷新保留、导师确认与 Share Preview。没有把中断的原脚本报告为一次无中断通过。生产数据为独立端口的 Demo Alex，未重置用户既有 4180/4181 数据。

实测修复：补充表单的明确可访问名称；同步旧完成按钮与新计划状态；香港午夜日期边界；删除学业起点时清理恢复副本。测试期间的旧网络计数曾使一次断言失败，随后增加请求明细、清空隔离计数并重新运行，新的完整隐私窗口无请求。工具自身出现的 Statsig 连接日志不属于 Carie 页面控制台。

结果见 `verification/sprint7/` 的 build.txt、unit-tests.txt、browser-sprint4/5/6-regression.json、browser-sprint7.json、production-pathways.json、production-console-layout.json 及截图。

## 11. 当前数据可靠性限制

只做小型人工维护资料集，不构成全面升学数据库。网站在复核期限内也可能更改；应用不会后台抓取变化。日期保护依赖设备时钟。浏览器访问限制不代表网站永久失效。未进行真实学校／NGO 试点，不把本地技术验收等同于教育内容专业认证。

## 12. 正式上线前人工核查

由具香港升学经验的人员逐项复核学年、课程代码、申请对象／渠道、一般与课程特定要求、特殊资格、作品集及面试例外；直接访问九条来源并解决不可达入口；补核物流与社区课程后再发布具体条件。检查中文摘要忠实度、路径关联解释、学生／教师实际可理解性，以及学校真实网络和设备上的私隐／删除操作。

## 13. Sprint 8 建议（本轮未实施）

优先增加人工复核记录与更新责任流程、小规模课程覆盖及教师／学生试用反馈，再决定是否需要管理界面。不要先加入录取概率、自动排名、聊天机器人或跨机构学生资料传送。

## 今后大学或 VTC 更新要求时

修改 **`src/data/education/programmes.ts`** 的对应课程与分组要求，并在 **`sources.ts`** 更新官方 URL、实际核对日期及说明。先降级 needs_review，再逐项打开当届官方页面核对；全部核实后才恢复 verified、设置 lastVerifiedAt 和 reviewBy。新学年新增周期 ID，并更新 **`pathways.ts`** 的课程关联。

运行 validate:education、typecheck、test、build，浏览器复核后重新部署。运行时会在复核超期或入学周期开始后自动显示过期标签，不能只改年份或复核日期延长旧资料的可信度。完整操作步骤与模板见 `docs/education-pathway-data-guide.md` 和 `docs/education-source-review-policy.md`。

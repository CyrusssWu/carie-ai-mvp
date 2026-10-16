# Carie AI — Sprint 4 Completion Report

验证日期：2026-10-15。直接修改现有 React/TypeScript 项目，无新项目、后端或依赖。项目目录没有 `.git`，因此没有可用的 Git diff；未重置、删除或替换既有项目。V08 的五次决策及单一路由保持不变。

## 1. 实现的功能

| 页面 | 已实现 |
| --- | --- |
| V10 Reflection | 指定标题及说明；投入/困难感受多选、其他感受、深入探索文字、继续探索意愿、补充笔记；全部可选；返回修改、清空、跳过未填问题；按本次体验自动保存。 |
| V11 Next Steps | 三类人工设计建议；可选零项或多项；已完成/未完成、预计完成日期及完成时间；保存后进入 Passport。 |
| V12 Career Passport | 同一故事可保存多次独立体验；同一次体验重复保存不增条目；展开真实五个选择、后果及来源明确的证据；单条反思编辑/清除、行动编辑/跟踪；空状态、再次体验入口和本地保存反馈。 |
| V13 Share Preview | 选择具体体验；四个独立开关；Experience/Evidence 默认开、Reflection/Next Steps 默认关；实时摘要；主动建立最终卡片；主动复制及手动复制回退。 |

切换体验会重置分享开关和最终卡片。关闭一个字段会立即移除最终卡片，避免旧摘要继续包含已撤回的内容。全关闭时无法生成摘要。

没有添加数值能力评分、隐藏积分、职业适配判断、人格标签、外部 AI、自动分享或传送功能。Passport 的行动完成数量仅表示任务状态。

## 2. 修改的文件

以下为本次 Sprint 的源文件清单，路径均相对于本报告所在项目目录。

| 类型 | 文件 | 用途 |
| --- | --- | --- |
| 修改 | `src/types/index.ts` | StoryRun、完整 Passport 快照、反思及行动类型。 |
| 修改 | `src/context/storage.ts` | run ID、完成时间、字段恢复、旧版兼容、去重。 |
| 新增 | `src/context/experience.ts` | 统一体验状态、幂等保存、分记录编辑、迁移/损坏恢复。 |
| 修改 | `src/context/AppContext.tsx` | 复用现有 Context，将关联数据一次性写入本地存储。 |
| 修改 | `src/App.tsx` | 显示存储恢复提示，保留现有路由与保护逻辑。 |
| 新增 | `src/components/ReflectionForm.tsx` | V10 和 Passport 共用的反思表单。 |
| 新增 | `src/components/NextStepsEditor.tsx` | V11 和 Passport 共用的行动编辑器。 |
| 修改 | `src/components/ReflectionSummary.tsx` | 可选反思摘要与空状态。 |
| 新增 | `src/data/reflection.ts` | 反思选项及纯文本整理函数。 |
| 新增 | `src/data/nextSteps.ts` | 独立于 UI 的人工建议内容。 |
| 新增 | `src/data/share.ts` | 默认隐私选项和按勾选字段构造摘要的纯函数。 |
| 修改 | `src/views/Reflection.tsx`、`NextSteps.tsx`、`Passport.tsx`、`SharePreview.tsx` | V10–V13 功能及交互。 |
| 修改 | `tests/storage.test.mjs` | 保留既有故事回归测试，更新旧版结构兼容断言。 |
| 新增 | `tests/sprint4.test.mjs`、`tests/helpers/loadTs.mjs` | Sprint 4 单元测试及现有 TypeScript 模块加载辅助。 |
| 新增 | `tests/e2e/sprint4.cua.mjs` | 可重复运行的真实浏览器验收脚本。 |
| 新增 | `tests/e2e/vite.config.ts`、`monitor.js`、`fixtures.html` | 仅隔离测试地址启用的调用计数、故障注入及测试数据恢复。 |
| 文档/证据 | `README.md`、本报告、`verification/sprint4/` | 运行说明、执行结果、截图。 |

复用了现有 Page、Card、Button、Tag、AppHeader、React Context 和设计样式。没有新增 View 路由或改写 V08 页面布局。

## 3. 数据流说明

1. 新体验创建稳定的 `storyRunId`，决策状态机继续保存真实 option ID。只有揭示后果后，选择才成为已提交记录。
2. Recap 继续根据五个已提交选择读取故事内容。Reflection 与 Next Steps 绑定当前 run；开始另一体验时只清空新体验草稿。
3. 保存时从故事数据和真实选择生成五条决定/后果快照及带 `sourceDecisionId` 的证据，不信任旧的累计证据数组。完成时间保持稳定。
4. Passport 按 run ID 去重。同一 run 更新同一 entry；新 run 创建新 entry。编辑旧条目只更新该条目；编辑当前 run 的已存条目时同步当前草稿，避免再次保存复活旧答案。
5. Share Preview 只读取所选 entry，并只输出勾选的分类。最终摘要仅由按钮生成；复制也必须单独点击。

关联状态存于 `carie_experiences_v2` 的一个本地 JSON 数据包；昵称等既有个人资料仍使用原 profile key。迁移保留旧 keys。旧版未保存的逐项选择无法恢复，会明确显示记录不完整，不补造决定。损坏 v2 数据先备份至 recovery key；如果备份/读取失败，阻止覆盖原数据并提示。

## 4. 测试报告

### 实际执行的命令

本环境使用已存在的本地 npm，等价于以下常规命令：

```text
node .tools/node_modules/npm/bin/npm-cli.js test
node .tools/node_modules/npm/bin/npm-cli.js run build
node .tools/node_modules/npm/bin/npm-cli.js run dev -- --config tests/e2e/vite.config.ts
```

- `npm test`：**24/24 通过，0 失败、0 跳过**。包含原有全部 243 种故事选择路径和状态机回归。
- `npm run build`：**通过**。TypeScript 无错误；Vite 构建 69 个模块。
- 浏览器：通过 CUA 执行已保存的 E2E 脚本；项目没有配置独立的 Playwright Test runner，没有把未运行的 Playwright 命令报告为通过。

### 12 项验收

| 测试 | 结果 | 已执行的证据 |
| --- | --- | --- |
| 01 Reflection | 通过 | 填写、返回修改、清空可选字段、刷新、部分跳过和全部跳过。 |
| 02 Passport Saving | 通过 | 完整故事后保存，条目包含五条真实选择、证据、反思和行动。 |
| 03 Idempotent Saving | 通过 | 重复保存函数及刷新后返回保存页面再次点击，保持同一 entry；早轮双击也未增加条目。 |
| 04 Multiple Experiences | 通过 | 完成两个不同选择路径，run ID 不同，保留两条独立记录。 |
| 05 Persistence | 通过 | 决策确认/后果、反思、Passport、行动日期和完成/取消完成均跨刷新保留。 |
| 06 Correct Evidence | 通过 | 单元测试逐项对照真实 option；浏览器完成两轮、核对 Recap 五个选择及证据数量，无重复累积。 |
| 07 Reflection Editing | 通过 | 编辑和清空旧条目，不改新条目；再保存不恢复已清空内容。 |
| 08 Share Privacy | 通过 | 浏览器遍历 16 种开关组合；默认隐私、切换 entry、关闭字段后移除旧最终摘要。单元测试验证每一类字段排除。 |
| 09 No Automatic Sharing | 通过 | 应用调用监测中 network=0、share=0；主动点击复制前 clipboard=0，点击后=1；手动复制回退正常。源代码无上传/寄送调用。 |
| 10 Mobile Layout | 通过 | V10–V13 在 390×844 视口无横向溢出；主要按钮/选择器/文本框至少 44px；展开 Passport 已检查；真实截图人工复核。 |
| 11 Missing/Corrupted Data | 通过 | 缺失/损坏/部分无效数据、保留恢复副本、写入失败、备份失败保护、无效 entry、未知路由。 |
| 12 Regression | 通过 | Alex → 两个方向 → 五道探索问题 → 三个想法 → UX → 五个决策 → Recap；每题改选/刷新，第二题暂停保存离开→Home→恢复。 |

补充验证：1280×900 桌面四页无横向溢出；可见表单控件均有标签；Enter 展开 Passport 和进入编辑、Space 切换反思选项有效；控制台 **0 error / 0 warning**。

### 本轮发现并修复

- 日期输入在实际测试浏览器中显示正确但未触发原保存事件：补充输入事件处理，日期刷新后保留。
- 清空反思会留下空字符串/空数组，刷新时误报数据损坏：在更新草稿时统一规范化。
- 恢复备份失败后可能覆盖原始损坏数据：启动时阻止自动写回并提示。
- 旧证据来源不完整时可能显示 `Decision 0`：只有存在对应选择时显示来源编号。
- 原有单次体验模型、固定下一步、最新条目分享及隐私默认值已按本 Sprint 要求修正。

自动化调试中，双击保存的第二次点击偶尔因第一次点击已跳转而找不到按钮；最终可重复脚本改为返回保存页再次点击，仍核对条目 ID 和数量。未更改应用导航来迎合测试。

### 测试证据

- [浏览器断言结果](verification/sprint4/browser-results.json)
- [桌面、键盘及控制台检查](verification/sprint4/additional-checks.json)
- [合成测试数据快照](verification/sprint4/test-state.json)
- [V10 手机截图](verification/sprint4/reflection-390.jpg)
- [V11 手机截图](verification/sprint4/next-steps-390.jpg)
- [V12 展开记录截图](verification/sprint4/passport-390.jpg)
- [V13 手机最终预览截图](verification/sprint4/share-390.jpg)
- [V13 桌面截图](verification/sprint4/share-desktop.jpg)

全部为合成测试资料，测试 origin 为 `localhost:5177`；没有清空用户原有 `localhost:5175` 数据。测试监控仅用于隔离服务器，不进入生产构建。

## 5. 仍存在的问题与未运行项目

- 仍为浏览器本地 MVP，无跨设备同步或账户保护。使用同一浏览器的人可访问资料；清除网站数据会丢失记录。本地数据没有加密。
- 旧版本身未存储的五项选择无法还原。旧 keys 和 recovery 副本为防数据丢失而保留；清除一条反思不等于清除旧副本，目前没有完整的本地数据管理界面。
- 当前支持一个活动中的 story run 和多条已完成体验；没有实现多个标签页同时编辑的冲突合并，建议单标签编辑。
- 本次验证真实内置浏览器及手机尺寸模拟，**未运行实体 iOS/Android 设备、屏幕阅读器全面审计或所有浏览器矩阵**。
- **未验证操作系统剪贴板写入成功分支**；已验证只在主动点击时调用，以及失败时可手动选择复制。没有向第三方实际发送数据。
- E2E 依赖 Codex CUA，会与纯 Node 单元测试分开执行；尚未接入无界面 CI 浏览器流水线。

## 6. 下一阶段建议（仅建议，未实施）

1. 增加学生可控的本地导出、导入和彻底清除功能，并明确处理迁移与恢复副本。
2. 用真实学生和导师开展可用性、无障碍及实体手机验证，重点观察反思负担和分享授权理解。
3. 为职业内容增加版本管理和人工审核流程，并把现有浏览器回归接入持续验证，防止内容更新破坏历史记录。

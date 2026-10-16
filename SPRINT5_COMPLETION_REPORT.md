# Carie AI — Sprint 5 Completion Report

日期：2026-10-15（Asia/Shanghai）。本次直接修改既有项目，没有新建项目或重新设计既有故事界面。

**结论：Internal Demo Ready（使用虚构数据的内部演示准备完成）。Real Student Pilot Ready 尚未成立。** 没有公开部署、真实学生招募、付费服务、登录、云端同步或个人资料上传。

## 1. 当前架构与本次变化

原有 React + TypeScript + React Router + Tailwind、13 个 View、Context 和五次决策状态机保留。V08 继续在 `/story/:storyId` 内切换 Decision / Confirmation / Consequence，原有 Vocabulary、Pause 交互保持。

原架构由 Context 分别写 profile 和 experience。现在为：

```text
Views / shared forms
  → AppContext（当前显示状态、未保存草稿、错误反馈）
  → 纯领域函数（故事状态机、反思/行动更新、幂等保存）
  → StudentDataRepository
  → LocalStudentDataRepository
  → localStorage: carie_student_data_v3
```

- 将 profile 与 experience 放入一次原子 localStorage 写入，避免两次写入只成功一半。
- 文档具有 schemaVersion、匿名本地 profile ID 和写入 revision。旧版体验类型复用为嵌套 v2 结构，没有第二套相互竞争的体验模型。
- 增加故事目录查询；数据层按 story ID 和实际决策数量工作。没有增加新职业故事；界面仍只启用现有 UX 故事。
- 时间戳统一为 ISO 8601 UTC；预计日期使用有效的 `YYYY-MM-DD`，拒绝不存在的日期。
- 增加渲染 Error Boundary。读写失败、迁移恢复、备份失败、旧页面写入冲突均有反馈。
- 保存按钮只有在真正写入成功后导航并显示成功。存储受限时保留当前未保存草稿，允许重试或明确重新读取。

工作目录没有 `.git`，无法提供 Git diff 或提交；已保留既有文件和先前 Sprint 内容，没有执行重置。

## 2. 实际修改的文件

以下路径相对于项目根目录：

| 类别 | 文件 |
| --- | --- |
| 数据模型/内容目录 | `src/types/index.ts`、`src/data/share.ts`、新增 `src/data/stories/catalog.ts` |
| 持久化接口 | 新增 `src/repositories/StudentDataRepository.ts`、`LocalStudentDataRepository.ts` |
| 状态及数据操作 | `src/context/AppContext.tsx`、`experience.ts`、`storage.ts` |
| 应用可靠性 | `src/App.tsx`、`src/main.tsx`、新增 `src/components/AppErrorBoundary.tsx` |
| 数据管理/隐私 | 新增 `src/components/DataManagement.tsx`、`PrivacyInformation.tsx` |
| 既有页面接入 | `src/views/Passport.tsx`、`NextSteps.tsx`、`Welcome.tsx` |
| 单元测试 | 新增 `tests/repository.test.mjs`；调整 `tests/storage.test.mjs`、`tests/sprint4.test.mjs` 的加载方式和规范化时间断言，保留原有覆盖 |
| 浏览器测试 | 新增 `tests/e2e/sprint5.cua.mjs`、`production-smoke.cua.mjs`；更新 `sprint4.cua.mjs`、`monitor.js`、`fixtures.html`、`vite.config.ts` 以验证新存储文档和异常注入 |
| 工程配置 | `package.json` 增加 typecheck；新增 `.github/workflows/validate.yml`；`.gitignore` 排除生成的演示压缩包 |
| 文档 | `README.md`、`docs/sprint5-plan.md`、`docs/privacy-and-data-flow.md`、`docs/deployment.md`、本报告 |
| 构建/证据 | `dist/`、`verification/sprint5/`、`artifacts/carie-ai-sprint5-internal-demo.zip` |

没有增加依赖；现有 lockfile 和测试框架保留。

## 3. 数据读取、保存及关联

Student Profile → Exploration Answers → Career Story Run → Decisions → Behaviour Evidence → Reflection → Next Steps → Passport Entry → Share Selection。

- 本地 profile ID 标识这个浏览器档案，不是学校学号或真实身份。
- run 使用唯一 `storyRunId`，选择使用 `decisionId + optionId`；Passport 通过 run ID 幂等保存。
- 证据来源引用对应决定；反思和行动包含在同一 run 或 entry 中。证据/行动 ID 在各条体验内使用，不误作为跨体验唯一身份。
- 保存保留五个真实选择和当时的文字快照。重复保存更新原 entry；再体验建立新 run。
- 修改 entry 时只改目标记录；如它是当前 run 的已保存记录，同步当前草稿，防止旧答案再次覆盖。
- 分享选择仅存在当前页面，包含 entry ID 和四个独立字段选择，不持久化授权。

读取优先 v3，否则迁移 v2/v1。恢复时保留原副本并提示；无法还原的历史选择明确标为不完整，不补造。未知文档版本不自动覆盖；备份失败时阻止写回。

已知旧页面写入会被拒绝；没有未保存修改的其他标签页会读取最新状态。localStorage 不提供跨进程事务锁，不能把这些保护描述为任意并发场景下的数据库事务保证。

## 4. 新增数据管理与隐私能力

- **导出**：主动生成已成功保存资料的 JSON 预览，再主动下载；实际下载文件已核对。包括反思，界面明确提醒保管，不会当作导师摘要自动发送。没有导入功能。
- **删除单条体验**：确认/取消；移除该条选择、证据、反思和行动。删除当前 run 的已存记录时同时清空关联草稿，避免刷新或再次保存复活。
- **清除全部**：明确说明不可恢复风险；清除 profile、探索、run、Passport、旧版和恢复副本。保留一个不含原探索资料的空 v3 文档作为迁移屏障，不删除同 origin 的无关 keys。
- **删除异常**：先更新主记录再清理旧副本。清理未完成时保留标记并报告未完成，能够重试；不假报全部删除成功。
- **隐私说明**：欢迎页和 Passport 都能打开；明确本地存储、没有加密/云备份、同浏览器访问风险、删除限制和不自动分享。
- **分享默认值不变**：Experience / Evidence 开；Reflection / Next Steps 关。切换体验重置选择，关闭字段使旧最终卡片失效。

删除浏览器资料不删除用户已下载文件、剪贴板、系统备份或截图。恢复副本可能包含无法读入当前模型的资料，删除确认界面提示先导出及清理副本的范围。

## 5. 测试与构建结果

实际运行环境 Node v24.19.0；使用已有本地 npm：

```text
node .tools/node_modules/npm/bin/npm-cli.js run typecheck
node .tools/node_modules/npm/bin/npm-cli.js test
node .tools/node_modules/npm/bin/npm-cli.js run build
node .tools/node_modules/npm/bin/npm-cli.js run dev -- --config tests/e2e/vite.config.ts
node .tools/node_modules/npm/bin/npm-cli.js run preview -- --host 127.0.0.1 --port 4180 --strictPort
```

| 检查 | 结果 |
| --- | --- |
| 类型检查 | 通过，无 TypeScript 错误 |
| 自动测试 | **38/38 通过，0 失败、0 跳过**；包含原有 243 种故事路径 |
| 正式构建 | 通过，74 个模块；JS 约 347 KB，gzip 约 111 KB |
| 重复构建 | 同一环境连续构建全部输出 SHA256 相同，记录在 `build-hashes.json` |
| 实际 JSON 下载 | 通过；下载文件与 UI 导出和存储内容完全一致，包含两次合成体验 |
| 正常流程控制台 | 无 error / warning |
| 故障注入控制台 | 一条预期的 `Synthetic Sprint 5 render failure`；错误边界显示可理解提示，记录未改变，移除故障后恢复 |
| 基本产物检查 | 未发现测试探针、测试私密占位文本、异常注入代码或常见秘密密钥格式；没有 `.env` 文件。这不替代完整安全审计 |
| CI | 工作流已添加，**未在 GitHub 远端运行**；没有 Git remote，没有公开部署 |
| 全新机器 `npm ci` | **未验证**；部署步骤与 CI 已使用 lockfile 安装，当前环境构建与测试已实际执行 |

### 指定的 12 项验收

| 项目 | 状态 | 执行内容 |
| --- | --- | --- |
| 1 完整职业探索 | 通过 | 新学生 Alex、两个方向、五题、三个想法、UX 五次决策至分享；正式构建又用 Demo Alex 完成一轮 |
| 2 Story Run 保存 | 通过 | 每个确认/后果阶段刷新，暂停→离开→Home→恢复，真实五项选择一致 |
| 3 Reflection 关联 | 通过 | 两个 run 的反思独立；填写、跳过、编辑和清空正常 |
| 4 Passport 不重复 | 通过 | 返回保存页再次保存及单元重复事件，不增加 entry |
| 5 同职业再次体验 | 通过 | 不同 run ID、两条记录，原条目保留 |
| 6 Data Export | 通过 | JSON 预览、实际本地下载、完整内容对照；不含未保存修改 |
| 7 删除单条隔离 | 通过 | 取消不删；确认删除旧记录后，另一条完整内容不变；旧分享链接与另一个已打开页面失效 |
| 8 清除全部 | 通过 | 取消保留；确认回 Welcome；刷新、Passport 空态、profile/草稿/副本清理及无关 key 保留 |
| 9 损坏存储恢复 | 通过 | 浏览器损坏数据/写入阻断；单元覆盖部分损坏、quota、备份失败、未知版本和不完整删除重试 |
| 10 分享反思关闭 | 通过 | 浏览器全部 16 种组合，默认值、切换体验、旧卡片失效；没有自动复制或传送 |
| 11 390px 手机 UI | 通过 | V10–V13、数据管理、导出和确认弹层；截图复核，无横向溢出；表单标签/键盘操作验证 |
| 12 Sprint 1–4 回归 | 通过 | 原有 13 个 View 的完整路径、状态机及可选反思/行动/Passport/分享已跑；生产预览另行完整冒烟 |

另检查 1280×900 下 Welcome、Reflection、Next Steps、Passport、Share：无横向溢出，所有可见表单有标签。

真实浏览器测试使用 Codex CUA，项目没有安装独立 Playwright Test runner。保留了可重跑的 CUA 脚本，没有将浏览器测试冒充为 npm test 或 CI 自动执行。测试数据为虚构资料；原用户页面数据未被清空。

主要证据在 `verification/sprint5/`：`regression-results.json`、`management-results.json`、`production-smoke.json`、`desktop-layout.json`、`console.json`、`export-verified.json`、`build-hashes.json` 及页面截图。

## 6. 仍存在的技术风险

- localStorage 无账户隔离、加密或云备份；共享设备、恶意同源脚本和浏览器扩展仍可能读取数据。
- 旧副本为防丢失而保留至主动删除，可能占用容量；删除后也不能清除系统或导出文件中的复制件。
- 同时多页编辑的极端竞争未通过事务锁解决；内部演示建议单页编辑。一个档案同时只有一个活动 story run。
- 未运行实体 iOS/Android、完整屏幕阅读器审计、各浏览器矩阵、压力/渗透测试。剪贴板成功写入分支未测；主动调用和失败回退已测。
- 生产构建已在本地 preview 验证，但目标托管环境的 HTTPS、访问限制、安全头、日志保留及 direct-route fallback 需要部署者再验证。
- 没有 JSON 导入、云端恢复、真实身份管理或合作机构授权流程。
- 基本秘密检查不是安全认证；正式依赖安全审查和供应链审查仍需上线流程执行。

## 7. 上线前仍需完成

1. 确认机构授权、数据责任与访问范围、试点对象和支持流程。
2. 由适当人员审查香港适用隐私要求、未成年人/监护人告知与同意安排、保留删除政策；本项目未声称已经满足全部法律要求。
3. 完成威胁模型、托管访问控制、依赖/安全审查、事件响应及恢复演练。
4. 在目标实体设备和辅助技术上验收，让学生实际理解导出、删除与分享选择。
5. 在目标环境执行 lockfile 干净安装、CI、路由和构建产物检查，再由负责人明确批准受控试点。

运行及部署细节见 `docs/deployment.md`；只发布 `dist/`，不要发布源码根目录或测试证据目录。没有自动部署流程。

## 8. Sprint 6 建议范围（未实施）

1. 以机构和隐私负责人批准的范围完成试点治理、告知、权限与保留政策；在这些决定前不启用云端学生数据。
2. 完善真实设备/无障碍验收和可持续运行的浏览器 CI，并加强跨页冲突与异常恢复测试。
3. 设计带版本校验、预览和冲突处理的 JSON 导入/恢复能力，使学生主动导出的记录可安全迁移。

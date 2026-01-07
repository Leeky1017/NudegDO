# NudgeDO（ND）商业化可用性审计报告

- 审计日期：2026-01-07
- Issue：#24
- 分支：`task/24-audit-commercial-readiness`
- 审计基线：见 `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/env.txt`

## 0. 结论摘要（给决策者）

### 0.1 当前结论
ND 目前处于「可运行的前端原型（Prototype）」阶段：核心的任务 CRUD 与单轮 Nudge 问答链路基本可用（本地测试/构建通过），但距离「可对外商用」仍有**关键阻塞项**，尤其是 **LLM Key 暴露与缺少服务端隔离**、**隐私合规/数据治理缺失**、以及 **规格（OpenSpec）与实现不一致导致的不可审计性**。

### 0.2 风险概览（按严重度）
| 严重度 | 定义（建议） | 结论 |
|---|---|---|
| Critical | 任何对外测试/付费前必须解决，否则会出现安全/账单/数据泄露级风险 | **存在**（LLM Key 暴露、无服务端） |
| High | 会显著影响可用性、可信度或扩展性，建议在 Beta 前解决 | **存在**（规格偏离、对话历史不落盘、缺少设置/轮次） |
| Medium | 不会立刻阻断，但会引发维护成本或体验下降，应纳入近期迭代 | **存在**（依赖漏洞、无 lint、可观测性不足等） |
| Low | 建议优化项 | **存在** |

### 0.3 Top 5 阻塞项（建议优先级）
1) **（Critical）LLM API Key 在前端暴露**：`src/main.tsx` 使用 `import.meta.env.VITE_NVIDIA_API_KEY`，会被打包进浏览器产物，导致 Key 泄露与被盗刷。
2) **（Critical）缺少服务端隔离层**：无法做鉴权、配额/计费、滥用防护、审计日志、可观测性与合规落点。
3) **（High）OpenSpec 与实现偏离**：LLM provider/模型、技术栈（Tailwind/Framer Motion）、Nudge 轮次与设置、对话历史持久化等与当前实现不一致，破坏“可审计、可复现”前提。
4) **（High）Nudge 对话历史未持久化**：当前用内存 `Map` 保存，刷新即丢；与愿景“永久存储上下文”与 `task-crud` spec 不一致。
5) **（High）隐私与合规缺口**：缺少隐私政策/数据处理说明/用户同意；对用户输入直接发往第三方模型服务缺少告知与治理策略。

## 1. 审计范围与方法

### 1.1 范围（In Scope）
- 前端应用（`src/`）：任务流、Nudge 逻辑、LLM 客户端、存储与 UI
- OpenSpec 规格（`openspec/specs/**`）与变更提案（`openspec/changes/**`）
- 交付与门禁（`.github/workflows/**`、`scripts/**`、`openspec/_ops/task_runs/**`）
- 依赖与供应链：`package.json` / `package-lock.json`、`npm audit`

### 1.2 不在范围（Out of Scope）
- 真实生产后端（当前仓库未实现）
- 真实支付/订阅/通知推送系统（当前仓库未实现）
- 客服、风控、法务文本的最终合规审查（本报告仅给出“需要什么/怎么落地”的工程视角建议）

### 1.3 方法与证据
本次审计采用“代码审查 + 规格对照 + 本地可复现命令”的方式。关键命令输出已落盘：
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-typecheck.txt`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-test.txt`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-build.txt`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-audit.txt`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-audit.json`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-ls-depth0.txt`
- `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/secret-scan.txt`

Run log：`openspec/_ops/task_runs/ISSUE-24.md`

## 2. 当前实现盘点（Inventory）

### 2.1 已实现（从代码与测试可验证）
- 任务 CRUD：创建/完成切换/删除（`src/services/taskService.ts` + tests）
- 本地持久化：tasks/settings 的序列化、容错解析、导入导出 API（`src/storage/localStorage.ts` + tests）
- Nudge 单轮体验：生成 2-3 个问题 → 用户一次作答 → 解析为结构化任务（`src/services/nudgeService.ts` + tests）
- 双人格 Prompt：Coach/Buddy（`src/llm/prompts.ts`、`src/personas/*`）
- LLM Client：封装 timeout、429/401、非 2xx 错误与内容清洗（`src/llm/client.ts` + tests）
- CI 门禁：OpenSpec validate + typecheck + tests + build（`.github/workflows/ci.yml`）
- PR 门禁：run log、分支命名、commit message 规则（`.github/workflows/openspec-log-guard.yml`）

### 2.2 部分实现/实现方式与愿景不一致
- 追问轮次（vision/spec 有 1-2 轮与 settings）：当前仅单轮一次问答（`nudge-round` spec 未落地）
- 对话历史“永久存储”：数据层支持，但 UI 层未把 chat history 写入 task 再持久化
- LLM provider：OpenSpec 描述 OpenRouter；当前默认走 NVIDIA endpoint，且 key 由前端 env 注入

### 2.3 未实现（商业化产品通常必需）
- 用户体系：注册/登录/会话、跨端同步
- 计费与配额：免费/Pro、每日次数、滥用防护
- 通知推送：提醒、定时任务、陪伴模式
- 数据分析：完成率、时间校准、个性化建议
- 合规：隐私政策、数据删除、数据导出入口、第三方处理披露
- 可观测性：错误上报、日志、指标、审计链路

## 3. 规格（OpenSpec）与愿景对照（Gap Analysis）

### 3.1 与产品愿景（`docs/01_product_vision.md`）的差距要点
- 追问轮次与深度模式：当前仅单轮；未实现 2 轮/粒度/提醒强度/时间校准/“卡住了”按钮等
- 抽屉式任务详情：UI 有抽屉组件，但对话历史不落盘，刷新后不可用
- 推送提醒与执行陪伴：未实现
- 商业模式：未实现免费次数限制/订阅付费/计费逻辑

### 3.2 与 OpenSpec 的偏离要点（举例）
- `openspec/specs/llm-client/spec.md`：要求 OpenRouter + `OPENROUTER_API_KEY`；当前默认 NVIDIA provider（`src/llm/client.ts`、`src/main.tsx`）
- `openspec/specs/task-crud/spec.md`：要求 Nudge task “store chat history”；当前仅内存 Map（`src/components/App.tsx`）
- `openspec/specs/nudge-round/spec.md`：要求 maxRounds 可配置；当前 settings 未接入 NudgeService（`src/types.ts` / `src/storage/localStorage.ts`）
- `openspec/changes/mvp-core/design.md`：提及 Tailwind/Framer Motion；当前依赖与实现为纯 CSS（`src/styles/app.css`、`package.json`）

> 结论：偏离并非“坏”，但需要**明确决策**：要么更新 spec，要么补齐实现；否则后续协作会失去“可审计的共同语言”。

## 4. 发现清单（Findings）

### 4.1 严重度定义
- **Critical**：对外可用/商用前必须解决（安全/账单/数据合规级风险）
- **High**：Beta 前建议解决（可用性/一致性/可信度）
- **Medium**：近期迭代（维护成本/体验/工程质量）
- **Low**：优化项

### 4.2 汇总表
| ID | 严重度 | 标题 | 领域 |
|---|---|---|---|
| ND-AUDIT-F001 | Critical | LLM API Key 在前端暴露（可被盗刷） | Security/Cost |
| ND-AUDIT-F002 | Critical | 缺少服务端隔离层（鉴权/配额/审计/风控无法落地） | Architecture |
| ND-AUDIT-F003 | High | 隐私合规缺口：第三方 LLM 数据处理缺少告知与治理 | Privacy/Compliance |
| ND-AUDIT-F004 | High | OpenSpec 与实现偏离，破坏可审计性 | Delivery/Governance |
| ND-AUDIT-F005 | High | Nudge 对话历史不持久化，与 spec/愿景不一致 | Product/UX |
| ND-AUDIT-F006 | High | 缺少“无 Key/不可用”下的降级 UI（启动即崩） | Reliability |
| ND-AUDIT-F007 | Medium | `npm audit` 提示 vite/esbuild 漏洞（dev server 风险） | Supply Chain |
| ND-AUDIT-F008 | Medium | 缺少 lint/格式化与风格不一致（维护成本） | Maintainability |
| ND-AUDIT-F009 | Medium | 类型重复/漂移（`src/types.ts` vs `src/types/task.ts`） | Maintainability |
| ND-AUDIT-F010 | Medium | Drawer/交互可访问性不足（键盘/焦点/aria） | Accessibility |
| ND-AUDIT-F011 | Medium | 缺少可观测性：错误仅 console，无法线上定位 | Observability |
| ND-AUDIT-F012 | Medium | Roadmap execution plan 为空，依赖门禁无法发挥作用 | Delivery |
| ND-AUDIT-F013 | Low | Chat 过滤规则基于“包含 JSON”过于脆弱 | UX |
| ND-AUDIT-F014 | Low | demo/ 与未使用导出增加认知负担 | Repo Hygiene |
| ND-AUDIT-F015 | Low | 缺少 LICENSE/Legal 文档占位 | Compliance |

---

## 5. 详细发现与建议（逐条）

### ND-AUDIT-F001（Critical）：LLM API Key 在前端暴露（可被盗刷）
- 证据：
  - `src/main.tsx`：`new LLMClient({ apiKey: import.meta.env.VITE_NVIDIA_API_KEY })`
- 影响：
  - 任何访问网页的用户都可以从构建产物/DevTools 中提取 Key，导致被盗刷、额度耗尽、账单不可控。
  - 无法做用户级计费、配额与滥用防护。
- 建议：
  - **必须引入服务端**：由服务端持有供应商 Key，前端只拿到短期 token 或直接调用自家 API。
  - 若短期仍要纯前端 Demo：仅支持“用户自带 Key”（本地存储）并明确提示风险，且默认不提供平台 Key。
- 验收标准（示例）：
  - 构建产物中不包含任何平台级供应商 Key（搜索不到 `VITE_*_API_KEY` 实值）
  - 所有 LLM 请求走自家 `/api/llm/*`，服务端注入 Key

### ND-AUDIT-F002（Critical）：缺少服务端隔离层（鉴权/配额/审计/风控无法落地）
- 证据：
  - 当前为纯 Vite 前端项目（无 backend 目录、无 API 层），LLM 由前端直连第三方 endpoint（`src/llm/client.ts`）。
- 影响：
  - 无法做：登录/订阅、每日次数限制、风控封禁、请求审计、模型路由、缓存、统一降级、A/B、成本控制。
  - 安全边界弱：CORS/CSRF/速率限制无法在前端可靠落地。
- 建议：
  - 设计并实现最小后端（BFF）：Auth + LLM Proxy + Task Sync（可分阶段）。
  - 优先把“LLM 调用”迁移到服务端；任务同步可后置。
- 验收标准（示例）：
  - 具备服务端接口与部署方式，前端不再直连供应商
  - 服务端具备按 user 的速率限制、配额与日志

### ND-AUDIT-F003（High）：隐私合规缺口（第三方 LLM 数据处理缺少告知与治理）
- 证据：
  - 用户输入（任务/回答）被发送到第三方模型服务（`src/services/nudgeService.ts` → `LLMClient.chatCompletion`）。
  - 仓库未提供隐私政策、数据处理说明、用户同意 UI（未找到对应文档/页面）。
- 影响：
  - 对外商用存在合规风险：未告知第三方处理、数据保留、跨境传输、删除请求等。
  - 用户信任风险：敏感任务内容可能被发送到外部。
- 建议：
  - 增加最小合规组件：隐私政策/条款占位、首次使用同意、数据最小化与脱敏策略。
  - 服务端代理后可以：统一脱敏、日志采样、数据保留策略、供应商选择与 DPA。
- 验收标准（示例）：
  - App 内可访问隐私政策；首次使用弹窗同意并可撤回
  - 文档声明：发送哪些数据、用于什么、保留多久、如何删除

### ND-AUDIT-F004（High）：OpenSpec 与实现偏离，破坏可审计性
- 证据（示例）：
  - `openspec/specs/llm-client/spec.md` 要求 OpenRouter/`OPENROUTER_API_KEY`；实现默认 NVIDIA provider（`src/llm/client.ts`、`src/main.tsx`）。
  - `openspec/changes/mvp-core/design.md` 描述 Tailwind/Framer Motion；依赖未包含，样式为 `src/styles/app.css`。
- 影响：
  - “Spec-first”无法发挥作用：读 spec 无法推导实现，PR 审计失真。
  - 新贡献者/多 agent 并行容易做错方向，增加返工。
- 建议：
  - 对每一处偏离做决策：**更新 spec** 或 **补齐实现**（建议先更新 spec，使其反映真实现状，再规划补齐）。
  - 增加“spec ↔ code 对照”章节（可放入报告附录或新增 spec delta）。
- 验收标准（示例）：
  - spec 中列出的 provider/model 与实际默认一致
  - spec 中声明的关键 UX（轮次、对话持久化）与实现一致，或明确标注 out-of-scope

### ND-AUDIT-F005（High）：Nudge 对话历史不持久化，与 spec/愿景不一致
- 证据：
  - `src/components/App.tsx`：使用模块级 `Map` 保存 `taskChatHistory`，未写入 task，也未持久化。
  - `openspec/specs/task-crud/spec.md`：要求 “store chat history”。
  - `docs/01_product_vision.md`：强调“追问细节永久存储，不丢失上下文”。
- 影响：
  - 刷新即丢失对话；用户无法回溯决策上下文，降低产品价值。
  - Nudge 任务的“可解释性”不足，难以做后续 AI 跟进。
- 建议：
  - 将对话历史写入 `Task`（建议用 `ChatMessage[]` 而非 `LLM Message[]`），由 `TaskService.updateTask` 持久化到 localStorage。
  - UI 展示层做轻量过滤（隐藏 system prompt），不要用字符串包含 “JSON” 的规则。
- 验收标准（示例）：
  - 创建 Nudge task 后刷新页面，对话历史仍可打开查看
  - 导出数据包含对话历史；导入后可恢复

### ND-AUDIT-F006（High）：缺少“无 Key/不可用”下的降级 UI（启动即崩）
- 证据：
  - `LLMClient` 构造时缺少 key 会 throw（`src/llm/client.ts`）。
  - `src/main.tsx` 直接构造 `llmClient`，无 try/catch，无 UI 提示。
- 影响：
  - 未配置 env 的部署会白屏；对用户不可解释。
- 建议：
  - 在 UI 层提供配置/提示：未配置时禁用 Nudge 或引导用户填入自带 Key（仅作为临时方案）。
  - 增加 ErrorBoundary，捕获初始化错误并展示可恢复界面。
- 验收标准（示例）：
  - 不提供 Key 也能进入 OnMe 模式使用；Nudge 入口提示原因

### ND-AUDIT-F007（Medium）：`npm audit` 提示 vite/esbuild 漏洞（dev server 风险）
- 证据：
  - `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/npm-audit.txt`：`5 moderate severity vulnerabilities`，核心为 `esbuild <=0.24.2` 与 `vite` 受影响范围。
- 影响：
  - 主要影响开发服务器场景（被恶意网站诱导请求并读响应）；若 dev server 暴露在公网会有风险。
- 建议：
  - 规划升级 `vite`/`vitest` 到修复版本（可能涉及 breaking change），并在升级后跑全量测试/构建。
  - CI 可增加 `npm audit --omit=dev`（或按策略允许 dev-only 中低危）并明确门禁规则。

### ND-AUDIT-F008（Medium）：缺少 lint/格式化与风格不一致（维护成本）
- 证据：
  - `package.json` 未包含 eslint/prettier；`src/types/task.ts` 与其他文件风格明显不同。
- 影响：
  - 多人协作时 diff 噪声大；错误更难早发现（例如未使用变量、潜在可访问性问题）。
- 建议：
  - 引入 ESLint + Prettier（或 biome），并在 CI 中执行。

### ND-AUDIT-F009（Medium）：类型重复/漂移（`src/types.ts` vs `src/types/task.ts`）
- 证据：
  - `src/types.ts` 定义 `Task`（createdAt:number 等），而 `src/types/task.ts` 定义 `Task`（createdAt:Date 等），语义冲突。
- 影响：
  - 易引发错误与误用，未来接入后端时会放大成本。
- 建议：
  - 收敛为单一领域模型：Domain（Date）↔ DTO（number/string）分层明确命名。

### ND-AUDIT-F010（Medium）：Drawer/交互可访问性不足（键盘/焦点/aria）
- 证据：
  - `src/components/TaskDrawer.tsx`：close button 无 `aria-label`；未做 focus trap；Esc 关闭未实现。
- 影响：
  - 键盘用户与读屏体验较差；商业化产品建议达成基本 a11y。
- 建议：
  - 为关键按钮补齐 aria；Drawer 打开时聚焦到标题或关闭按钮；支持 Esc 关闭；必要时加入 focus trap。

### ND-AUDIT-F011（Medium）：缺少可观测性（错误仅 console，无法线上定位）
- 证据：
  - 存储错误/解析错误用 `console.error`（`src/storage/localStorage.ts`）；LLM error 被吞掉后无用户反馈（`src/services/nudgeService.ts`）。
- 影响：
  - 线上无法定位问题、无法评估模型失败率与用户影响。
- 建议：
  - 引入错误上报（Sentry 等）或自建日志管道；对 LLM fallback 提供 UI 提示与埋点。

### ND-AUDIT-F012（Medium）：Roadmap execution plan 为空，依赖门禁无法发挥作用
- 证据：
  - `openspec/specs/nudgedo-roadmap/execution_plan.md` 仍为 `(fill)`。
- 影响：
  - `scripts/agent_pr_preflight.sh` 无法提示硬依赖，容易并发冲突。
- 建议：
  - 补齐近期 10-20 个 Issue 的硬依赖关系，哪怕很粗粒度。

### ND-AUDIT-F013（Low）：Chat 过滤规则基于“包含 JSON”过于脆弱
- 证据：
  - `src/components/TaskDrawer.tsx`：`!msg.content.includes("JSON")`
- 影响：
  - 用户或模型输出包含“JSON”字样会被误过滤。
- 建议：
  - 改为基于 role（system/tool）或显式标记“internal prompt”的元数据。

### ND-AUDIT-F014（Low）：demo/ 与未使用导出增加认知负担
- 证据：
  - `demo/`（独立 HTML/JS 版本）与 React 版本并存；`src/services/taskService.ts` 额外导出 `taskService` 单例但 `main.tsx` 另建实例。
- 影响：
  - 新人容易误用；维护成本上升。
- 建议：
  - 明确 demo 的定位（归档/删除/迁移到 docs）；统一 service 注入方式。

### ND-AUDIT-F015（Low）：缺少 LICENSE/Legal 文档占位
- 证据：
  - 仓库根目录未发现 `LICENSE`、隐私政策/条款文件。
- 影响：
  - 商业化/开源边界不清；外部贡献与依赖引入存在风险。
- 建议：
  - 增加 LICENSE（若不开源也可声明 Proprietary），并增加隐私政策/条款占位（即使是草案）。

## 6. 建议整改优先级（行动清单）

### P0（上线前必须做，1-2 周内）
- 服务端落地（最小 BFF）：LLM Proxy + Key 管理 + 速率限制 + 基础日志
- 前端移除平台 Key：改为调用自家 API 或用户自带 Key（仅限 demo）
- 合规最小闭环：隐私政策/同意弹窗/数据处理说明
- 关键体验一致性：对话历史持久化；无 Key 降级 UI

### P1（Beta 前，2-4 周）
- 规格对齐：更新 OpenSpec 或补齐实现（轮次/设置/LLM provider）
- 可观测性：错误上报 + LLM fallback 指标 + 基础埋点
- 工程化：lint/format、基础 a11y、e2e（至少 smoke）

### P2（生产化，4-8+ 周）
- 用户体系与跨端同步
- 通知/定时任务/陪伴模式
- 订阅计费与风控
- 数据分析与个性化策略

## 7. 附录

### 7.1 可复现命令（摘要）
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm audit`

完整输出见 `rulebook/tasks/issue-24-audit-commercial-readiness/evidence/` 与 `openspec/_ops/task_runs/ISSUE-24.md`。


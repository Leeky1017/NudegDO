---
name: openspec-rulebook-github-delivery
description: 三体系端到端交付主流程（OpenSpec + Rulebook + GitHub）。GitHub 是并发与交付的唯一入口（Issue/Branch/PR/Checks/Auto-merge）。
---

# OpenSpec + Rulebook + GitHub 三体系交付（主 Skill）

## 0) 硬门禁（GitHub 层，必须全部满足）

- Issue（允许自建）：以 Issue 号 `N` 作为任务唯一 ID
- Branch：只允许 `task/<N>-<slug>`
- Commit：每个 commit message 必须包含 `(#N)`
- PR：必须包含 `Closes #N`；必须新增/更新 `openspec/_ops/task_runs/ISSUE-N.md`
- Checks：`ci` 必须全绿
- Auto-merge：推荐启用

## 1) 交付原则（OpenSpec + Rulebook 层，硬门禁）

- 强制 spec-first：先建 task + 写 spec，再写代码
- 测试红就修到绿：最终必须全绿
- 禁止 silent failure：异常必须写日志或返回明确错误码/错误信息
- 结构化证据：每个阶段输出落到 `rulebook/tasks/<task-id>/evidence/`

## 2) 前置条件

- 安装并登录 `gh`：`gh auth status`
- 本地仓库已配置 `origin`：`git remote -v`

## 3) 标准工作流（按顺序执行）

### 3.1 创建/选定 Issue（得到 N）

```bash
TITLE="<任务标题>"
ISSUE_URL=$(gh issue create -t "$TITLE" -b "<context + acceptance>")
N=${ISSUE_URL##*/}
SLUG="<short-slug>"
```

### 3.2 创建 Rulebook task + 写 OpenSpec（spec-first）

- 生成 Rulebook `task-id`：`issue-<N>-<slug>`（kebab-case）
- 创建目录结构：
  ```
  rulebook/tasks/issue-<N>-<slug>/
  ├── .metadata.json
  ├── proposal.md
  ├── tasks.md
  ├── evidence/
  └── specs/<spec-name>/spec.md
  ```

### 3.3 创建分支

```bash
git checkout -b "task/${N}-${SLUG}"
```

### 3.4 落盘 task run log

- 新增文件：`openspec/_ops/task_runs/ISSUE-${N}.md`

### 3.5 实现 + 提交

- 每个 commit message 必须含 `(#N)`：
  ```bash
  git commit -m "feat: <summary> (#${N})"
  ```

### 3.6 创建 PR 并启用 auto-merge

```bash
git push -u origin HEAD
gh pr create --fill --title "<title> (#${N})" --body "Closes #${N}"
gh pr merge --auto --squash
```

### 3.7 等待 checks 全绿

```bash
gh pr checks --watch
```

### 3.8 合并后同步本地

```bash
git checkout main
git pull origin main
```

## 4) 网络超时处理

- 任何 `gh` 命令超时：最多重试 3 次，每次间隔 10 秒
- 3 次失败后，记录到 `ISSUE-N.md` 并升级问题

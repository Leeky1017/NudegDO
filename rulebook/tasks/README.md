# Rulebook Tasks

本目录存放所有任务执行记录。

## 目录结构

每个任务文件夹命名格式：`issue-<N>-<slug>`

```
rulebook/tasks/issue-<N>-<slug>/
├── .metadata.json    # 任务元数据
├── proposal.md       # 变更摘要（ADDED/MODIFIED/REMOVED）
├── tasks.md          # 可勾选的任务拆解
├── evidence/         # 执行证据
│   ├── pytest.txt
│   ├── lint.txt
│   └── ...
└── specs/            # 相关规格
    └── <spec-name>/
        └── spec.md
```

## 任务生命周期

1. **Created**: 任务创建
2. **In Progress**: 执行中
3. **Completed**: 已完成
4. **Archived**: 已归档

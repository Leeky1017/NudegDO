# INFRA-003: 本地存储

## 概述
使用浏览器本地存储持久化任务和设置数据。

## 需求

### 功能需求
- [ ] R1: 任务列表持久化
- [ ] R2: 用户设置持久化
- [ ] R3: 支持数据导出/导入
- [ ] R4: 存储容量检测
- [ ] R5: 数据迁移支持（版本升级）

### 存储方案
- 主存储：localStorage（简单、同步）
- 大数据：IndexedDB（可选，Phase 2）

### 接口定义

```typescript
interface StorageService {
  // 任务
  getTasks(): Task[];
  saveTasks(tasks: Task[]): void;
  
  // 设置
  getSettings(): UserSettings;
  saveSettings(settings: UserSettings): void;
  
  // 导出/导入
  exportData(): string;  // JSON
  importData(json: string): void;
  
  // 清理
  clear(): void;
}

// 存储 Key
const STORAGE_KEYS = {
  TASKS: 'nudgedo_tasks',
  SETTINGS: 'nudgedo_settings',
  VERSION: 'nudgedo_version'
};
```

### 数据版本
```typescript
interface StorageData {
  version: string;  // '1.0'
  tasks: Task[];
  settings: UserSettings;
}
```

## 验收标准
1. 刷新页面后数据保留
2. 导出/导入功能正常
3. 存储异常有错误处理

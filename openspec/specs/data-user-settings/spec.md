# DATA-003: 用户设置数据结构

## 概述
定义用户偏好设置的数据结构。

## 数据结构

```typescript
interface UserSettings {
  // Nudge 设置
  defaultPersona: PersonaType;      // 默认人格
  maxRounds: 1 | 2;                 // 最大追问轮数
  questionsPerRound: 2 | 3;         // 每轮问题数
  granularity: 'coarse' | 'medium' | 'fine';  // 拆解粒度
  
  // 提醒设置
  reminderEnabled: boolean;         // 是否开启提醒
  reminderOffset: number;           // 提前几分钟提醒
  reminderSound: boolean;           // 是否有声音
  
  // 时间校准
  timeCalibration: number;          // 时间预估修正系数 0.8-2.0
  
  // 深度追问模式（Phase 2）
  deepNudgeEnabled: boolean;        // 是否开启深度追问
  
  // 界面设置
  theme: 'light' | 'dark' | 'auto';
}

const defaultSettings: UserSettings = {
  defaultPersona: 'buddy',
  maxRounds: 1,
  questionsPerRound: 3,
  granularity: 'medium',
  reminderEnabled: true,
  reminderOffset: 5,
  reminderSound: true,
  timeCalibration: 1.0,
  deepNudgeEnabled: false,
  theme: 'light'
};
```

## 验收标准
1. 设置可持久化
2. 有合理默认值

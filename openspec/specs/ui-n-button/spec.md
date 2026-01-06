# UI-002: N 按钮组件

## 概述
N 按钮是 Nudge 模式的触发器，具有呼吸动画效果，是产品的视觉记忆点。

## 需求

### 功能需求
- [ ] R1: 点击切换 Nudge 模式开/关
- [ ] R2: 激活状态下显示呼吸动画
- [ ] R3: hover 状态显示渐变背景
- [ ] R4: 支持 title 提示文案

### 视觉需求
- [ ] V1: 尺寸 52x52px，圆角 16px
- [ ] V2: 默认态：奶油色渐变背景，灰色文字
- [ ] V3: hover 态：珊瑚色渐变背景，白色文字
- [ ] V4: 激活态：珊瑚色背景 + 呼吸动画（scale + shadow）
- [ ] V5: 字体：ZCOOL KuaiLe，1.4rem
- [ ] V6: 呼吸动画周期：3s ease-in-out infinite

### 动画定义
```css
@keyframes breathe {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 4px 16px rgba(255, 107, 91, 0.3); 
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 6px 24px rgba(255, 107, 91, 0.3); 
  }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 91, 0.3); }
  50% { box-shadow: 0 4px 32px rgba(255, 107, 91, 0.5); }
}
```

## 接口定义

```typescript
interface NButtonProps {
  isActive: boolean;
  onClick: () => void;
  title?: string;
}
```

## 验收标准
1. 点击可切换激活状态
2. 激活状态下呼吸动画持续播放
3. hover 时背景色平滑过渡
4. 动画不卡顿，GPU 加速

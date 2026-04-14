# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指导。

## 项目概述

贪吃蛇（Snake）网页游戏。当前为单文件 `index.html` 原型，所有 CSS/JS 内联。计划迁移至 Vue 3 + Vite + TypeScript（详见路线图部分）。

## 当前状态

直接在浏览器中打开 `index.html` 即可运行，无需构建工具或依赖。

所有逻辑写在一个 `<script>` 块中：

- **游戏状态**：`snake`（蛇身数组）、`food`（食物坐标）、`direction`/`nextDirection`（方向）、`score`（得分）、`speed`（速度）
- **游戏循环**：基于 `setInterval`（`gameStep` → `update` + `draw`），初始间隔 120ms，每吃一个食物减少 2ms，最低 50ms
- **渲染**：Canvas 400×400，网格大小 20px（20×20 格子）
- **输入**：键盘事件监听，支持方向键、WASD 和空格键

| 变量 | 用途 |
|---|---|
| `gridSize` (20) | 每格像素大小 |
| `tileCount` (20) | 网格维度（canvas / gridSize） |
| `speed` | `setInterval` 间隔（毫秒） |
| `nextDirection` | 输入缓冲——下一帧才生效，防止 180° 掉头 |

## 路线图：Vue 3 框架迁移

目标技术栈：**Vue 3 + Vite + TypeScript**

### 目录结构

```
src/
├── main.ts                   # 应用入口
├── App.vue                   # 根组件——组合 GameBoard + ScoreBoard
├── components/
│   ├── GameBoard.vue         # Canvas 渲染层（只负责绘制）
│   └── ScoreBoard.vue        # 得分显示 + 开始/暂停按钮
├── composable/
│   └── useSnakeGame.ts       # 游戏核心逻辑（状态、循环、碰撞、输入）
└── types/
    └── game.ts               # TypeScript 类型定义（Point, Direction, GameState）
```

### 模块职责

- **`useSnakeGame.ts`** — 迁移当前 `<script>` 中的所有游戏逻辑：`init`、`update`、`placeFood`、`startGame`、`pauseGame`、`gameOver`。对外暴露响应式状态（`snake`、`food`、`score`、`gameState`）和方法（`start`、`pause`、`resume`、`restart`、`setDirection`）。
- **`GameBoard.vue`** — 持有 `<canvas>` 元素，接收游戏状态作为 props，执行 `draw()`。监听键盘事件，emit 方向变更。
- **`ScoreBoard.vue`** — UI 控件区：得分展示、开始/重新开始按钮、暂停/继续按钮、操作提示。

## 代码规范

### Vue 组件

- 使用 Composition API + `<script setup>` 语法，不使用 Options API
- Props 使用 TypeScript 类型声明（`defineProps<{ ... }>()`），不使用运行时校验
- 组件名使用 PascalCase，文件名与组件名一致

### TypeScript

- 所有游戏核心数据（坐标、方向、状态）定义在 `types/game.ts`，组件间共享类型，不重复定义
- 避免使用 `any`，无法确定类型时用 `unknown` 并做类型收窄
- Canvas 上下文类型用 `CanvasRenderingContext2D`，不做 `as` 断言以外的类型转换

### 命名约定

- Composable 函数以 `use` 开头（如 `useSnakeGame`）
- 事件名使用 camelCase（如 `directionChange`）
- CSS class 使用 kebab-case

### 样式

- 组件内样式使用 `<style scoped>`，不使用全局样式
- 颜色值统一用 CSS 变量管理（定义在 `App.vue` 的 `:root` 中），不硬编码在组件内

## 注意事项

- **不要引入状态管理库**（Pinia 等）——游戏状态集中在 `useSnakeGame` composable 中管理即可
- **不要引入 CSS 框架**（Tailwind 等）——游戏 UI 简单，scoped CSS 足够
- **Canvas 渲染和游戏逻辑分离**——`GameBoard.vue` 只负责绘制，不包含任何游戏规则逻辑
- **游戏循环用 `setInterval`，不用 `requestAnimationFrame`**——当前原型已验证可行，迁移时保持一致
- **方向输入缓冲**——`nextDirection` 在下一帧才生效，防止蛇瞬间 180° 掉头撞死自己，这是核心机制，迁移时必须保留
- **食物生成必须避开蛇身**——`placeFood` 使用循环随机直到找到空位，不要简化为无校验的随机

## 测试规范

### 测试框架

使用 **Vitest**，它原生支持 Vite + TypeScript，无需额外配置。

### 测试命令

```bash
npm run test          # 运行全部测试
npm run test:watch    # 监听模式
npm run test:coverage # 生成覆盖率报告
```

### 测试目录

```
tests/
├── unit/
│   ├── useSnakeGame.test.ts    # 游戏逻辑核心测试
│   └── types.test.ts           # 类型相关工具函数测试
└── components/
    ├── GameBoard.test.ts       # 组件渲染测试
    └── ScoreBoard.test.ts      # 组件交互测试
```

### 测试重点

**`useSnakeGame` 是测试核心，必须覆盖以下场景：**

- 蛇移动方向变更（上下左右）
- 吃到食物后蛇身增长、得分增加
- 撞墙判定（四面边界）
- 撞自身判定
- 180° 掉头被拒绝（`nextDirection` 缓冲机制）
- 食物生成位置不与蛇身重叠
- 速度随得分递增（`speed` 递减）
- 游戏状态切换：`idle` → `running` → `paused` → `running` → `gameover`
- `restart()` 重置所有状态

**组件测试用 jsdom 环境，重点验证：**

- 得分数字随状态变化正确显示
- 按钮文案随状态切换（开始/重新开始、暂停/继续）
- `keydown` 事件触发正确的方向变更

### 不需要测试的内容

- Canvas 像素级渲染结果——难以稳定断言，靠手动验证
- 第三方库（Vite、Vue 本身）的正确性

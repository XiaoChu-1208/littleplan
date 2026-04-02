# Little Plan - 悬浮甘特计划工具

A sleek floating desktop Gantt planner that lives on your screen. Drag to plan, paint to color, long-press to complete. Annual & monthly views, todo list, multi-theme with light/dark mode. Built with Electron + React.

一款常驻桌面的悬浮甘特计划工具。拖拽规划时间线，调色桶自由上色，长按标记完成。支持年度/月度视图、待办清单、多主题色与亮暗模式。基于 Electron + React 构建。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式（热更新）

```bash
npm run electron:dev
```

会启动 Vite 开发服务器和 Electron 窗口，支持热更新。

### 3. 构建并运行

```bash
npm run start
```

### 4. 打包

```bash
# macOS
npm run electron:build

# Windows
npm run electron:build:win
```

打包完成后，在 `dist-app/` 目录下会生成 `Little Plan-1.0.0-arm64.dmg`。

## 功能

- **年度甘特图**：全年时间线，拖拽调整任务区间，长按 2 秒标记完成
- **月度甘特图**：按月精细规划，支持任务分组
- **待办清单**：按日期管理 Todo，支持快捷键操作
- **自由上色**：调色桶工具可分别设置 Bar 底色和进度色
- **多主题色**：黄/蓝/粉/绿/紫/天蓝，支持亮色/暗色模式
- **窗口固定**：置顶悬浮在桌面，或固定为透明桌面挂件

## 技术栈

- React 18 + Vite
- Tailwind CSS
- Electron 33
- Framer Motion
- lucide-react

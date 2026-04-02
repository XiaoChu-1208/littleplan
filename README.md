# Little Plan - 悬浮甘特计划工具

A sleek floating desktop Gantt planner that lives on your screen. Drag to plan, paint to color, long-press to complete. Annual & monthly views, todo list, multi-theme with light/dark mode. Built with Electron + React.

一款常驻桌面的悬浮甘特计划工具。拖拽规划时间线，调色桶自由上色，长按标记完成。支持年度/月度视图、待办清单、多主题色与亮暗模式。基于 Electron + React 构建。

---

## 下载安装

前往 [Releases 页面](https://github.com/XiaoChu-1208/littleplan/releases) 下载最新版本：

- **macOS**：下载 `Little Plan-x.x.x-arm64.dmg`，双击打开，将 Little Plan 拖入「应用程序」文件夹即可
- **Windows**：下载 `Little Plan Setup x.x.x.exe`，双击运行安装程序

> macOS 首次打开时如提示「无法验证开发者」，前往「系统设置 → 隐私与安全性」点击「仍要打开」即可。

---

## 使用说明

### 指针工具

| 操作 | 方式 |
|------|------|
| 平移时间轴 | 左右拖拽月份/年份区域 |
| 移动任务 | 拖拽 Bar 中间 |
| 调整开始/结束 | 拖拽 Bar 首尾边缘 |
| 编辑名称 | 点击 Bar 上的文字 |
| 完成任务 | 长按甘特 Bar 2 秒，出现旗帜标记 |
| 取消完成 | 将已完成的 Bar 向右拖动 |
| 删除任务 | 选中后按 `Del` |
| 撤销操作 | `⌘Z`（Mac）/ `Ctrl+Z`（Win）|

### 切割工具

选中切割工具后，点击任务条的任意位置，将其一分为二。

### 填充颜色（调色桶）

选中调色桶并选好颜色后：
- 点击 Bar 的**主体区域** → 改变 Bar 底色
- 点击 Bar 的**已完成部分（左侧进度色）** → 单独改变进度填充色

### 视图切换

右下角三个按钮切换视图：

- **年** — 年度甘特图，全年时间线一览
- **月** — 月度甘特图，精细到每一天
- **待办** — 按日期管理的 Todo 清单

可同时开启多个视图叠加显示。

### 显示密度

点击时间轴左侧的 `0.5x` / `1x` / `2x` 切换行高密度，适配不同信息量。

### 任务排序

点击排序图标，在**时间顺序**和**创建顺序**之间切换。

### 待办事项快捷键

| 操作 | 快捷键 |
|------|--------|
| 新建下一条 | `↵` |
| 完成 Todo | `⇧↵` |
| 移到明天 | `Tab` |
| 移到昨天 | `⇧Tab` |
| 删除空行 | `⌫` |

### 全局主题

点击右下角调色板图标，展开主题面板：
- 选择主题色（黄 / 蓝 / 粉 / 绿 / 紫 / 天蓝），界面底色随之变化
- 切换**亮色 / 暗色**模式

### 界面透明度

点击透明度图标，拖动滑块调节整体透明度。超过 100% 时单独增强面板实心度，适合叠加在桌面上使用。

### 定住窗口（桌面挂件模式）

按 `⌘⇧T`（Mac）/ `Ctrl+Shift+T`（Win）将窗口固定为透明挂件，点击穿透、不可交互，仅展示计划内容。再次按键恢复交互。

### 系统设置

点击右下角齿轮图标，展开设置面板：
- **导出数据** — 将所有任务导出为 JSON 文件备份
- **导入数据** — 从 JSON 文件恢复数据
- **显示开关** — 控制字段名、状态文字、备注等各项显示

---

## 数据恢复（从旧版本迁移）

如果你使用过早期版本（v1.0.0），升级后发现数据丢失，这是因为应用内部名称从 `great-plan` 更新为 `little-plan`，导致数据目录路径发生了变化。数据仍然保存在本地，可以一键恢复：

**Windows 用户：**

下载仓库中的 [`restore-plan-data.bat`](restore-plan-data.bat) 文件，双击运行，重启 Little Plan 即可找回数据。

**macOS 用户：**

在终端执行以下命令：

```bash
cp ~/Library/Application\ Support/great-plan/plan-data.json \
   ~/Library/Application\ Support/little-plan/plan-data.json
```

重启 Little Plan 即可。

---

## 开发者：本地运行

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

---

## 技术栈

- React 18 + Vite
- Tailwind CSS
- Electron 33
- Framer Motion
- lucide-react

---

## 联系作者

chizhu1208@163.com

# GreatPlan - 甘特图桌面悬浮应用

一个可固定在桌面上的甘特图应用，基于 Electron + React 构建，支持置顶悬浮、拖拽任务、切割、涂色等功能。

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

### 3. 构建并运行（独立窗口）

```bash
npm run start
```

先构建前端，再以 Electron 窗口形式运行。

### 4. 打包成 .app（可拖到桌面）

```bash
npm run electron:build
```

打包完成后，在 `dist-app/` 目录下会生成：
- `GreatPlan.app` - 可直接双击运行
- `GreatPlan-1.0.0.dmg` - 安装包

将 `GreatPlan.app` 拖到桌面或「应用程序」文件夹即可。

## 功能说明

- **置顶悬浮**：窗口默认始终置顶，可像小组件一样浮在桌面上
- **切换置顶**：菜单栏 → GreatPlan → 切换置顶，或按 `Cmd+T` / `Ctrl+T`
- **甘特图操作**：拖拽任务条、切割、涂色、添加备注等

## 技术栈

- React 18 + Vite
- Tailwind CSS
- Electron 33
- lucide-react 图标

const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, screen, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let pinnedHideHandler = null;
let tray = null;
let isPinnedState = false;
let shortcutConfigState = { togglePin: 'CmdOrCtrl+Shift+T' };

const DESKTOP_LEVEL = -2147483623;

function getDataPath() {
  return path.join(app.getPath('userData'), 'plan-data.json');
}

function loadSavedData() {
  try {
    const raw = fs.readFileSync(getDataPath(), 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function getShortcutConfig(data) {
  const shortcut = data?.shortcutConfig?.togglePin;
  return { togglePin: shortcut || 'CmdOrCtrl+Shift+T' };
}

// --------------- Tray ---------------

function buildTrayMenu() {
  const pinLabel = isPinnedState ? '解除定住' : '定住窗口';
  const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
  const toggleWindowLabel = isVisible ? '隐藏窗口' : '显示窗口';
  return Menu.buildFromTemplate([
    {
      label: pinLabel,
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (isPinnedState) {
          handleUnpin();
        } else {
          handlePin();
        }
      },
    },
    { type: 'separator' },
    {
      label: toggleWindowLabel,
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: '联系作者',
      click: () => {
        shell.openExternal('mailto:chizhu1208@163.com');
      },
    },
    {
      label: '关于 Little Plan',
      click: () => {
        dialog.showMessageBox({
          type: 'info',
          title: '关于 Little Plan',
          message: `Little Plan v${app.getVersion()}`,
          detail: `数据文件：${getDataPath()}\n\n作者联系：chizhu1208@163.com`,
          buttons: ['好'],
        });
      },
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icons/tray-iconTemplate.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Little Plan');
  tray.setContextMenu(buildTrayMenu());

  // macOS：左键点击弹出菜单（dock 隐藏后 contextMenu 不会自动弹出）
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      tray.popUpContextMenu(buildTrayMenu());
    });
  }

  // Windows：右键弹出实时菜单（确保状态最新）
  if (process.platform === 'win32') {
    tray.on('right-click', () => {
      tray.popUpContextMenu(buildTrayMenu());
    });
    tray.on('double-click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
  }
}

function refreshAppMenu() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const togglePinItem = {
    label: isPinnedState ? '解除定住' : '定住窗口',
    click: () => {
      if (isPinnedState) {
        handleUnpin();
      } else {
        handlePin();
      }
    },
  };
  if (shortcutConfigState.togglePin && shortcutConfigState.togglePin !== 'Off') {
    togglePinItem.accelerator = shortcutConfigState.togglePin;
  }
  const template = [
    {
      label: 'Little Plan',
      submenu: [
        togglePinItem,
        { type: 'separator' },
        { role: 'close', label: '关闭窗口' },
        { role: 'minimize', label: '最小化' },
        { type: 'separator' },
        { role: 'quit', label: '退出' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function refreshTrayMenu() {
  if (tray) tray.setContextMenu(buildTrayMenu());
}

// --------------- Pin / Unpin Logic ---------------

function handlePin() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  isPinnedState = true;
  refreshTrayMenu();

  mainWindow.setMovable(false);
  mainWindow.setResizable(false);
  mainWindow.setAlwaysOnTop(true, 'normal', DESKTOP_LEVEL);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (process.platform === 'darwin') app.dock.hide();

  pinnedHideHandler = () => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.showInactive();
  };
  mainWindow.on('hide', pinnedHideHandler);
  mainWindow.on('minimize', pinnedHideHandler);

  mainWindow.webContents.send('force-pin');
}

function handleUnpin() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  isPinnedState = false;
  refreshTrayMenu();

  if (pinnedHideHandler) {
    mainWindow.removeListener('hide', pinnedHideHandler);
    mainWindow.removeListener('minimize', pinnedHideHandler);
    pinnedHideHandler = null;
  }
  if (process.platform === 'darwin') app.dock.show();
  mainWindow.setAlwaysOnTop(true, 'normal', 0);
  mainWindow.setAlwaysOnTop(false);
  mainWindow.setVisibleOnAllWorkspaces(false);
  mainWindow.setMovable(true);
  mainWindow.setResizable(true);
  mainWindow.focus();
  mainWindow.webContents.send('force-unpin');
}

ipcMain.on('set-window-pinned', (event, isPinned) => {
  if (!mainWindow) return;
  if (isPinned && !isPinnedState) {
    handlePin();
  } else if (!isPinned && isPinnedState) {
    handleUnpin();
  }
});

// --------------- Window Resize / Opacity ---------------

ipcMain.on('resize-window', (event, w, h) => {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  const nextBounds = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  if (typeof w === 'number' && Number.isFinite(w)) nextBounds.width = w;
  if (typeof h === 'number' && Number.isFinite(h)) nextBounds.height = h;
  mainWindow.setBounds(nextBounds, false);
});

ipcMain.handle('get-window-bounds', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return null;
  return mainWindow.getBounds();
});

ipcMain.on('set-window-bounds', (event, { x, y, width, height }) => {
  if (!mainWindow) return;
  const bounds = {};
  if (typeof x === 'number') bounds.x = x;
  if (typeof y === 'number') bounds.y = y;
  if (typeof width === 'number') bounds.width = width;
  if (typeof height === 'number') bounds.height = height;
  if (Object.keys(bounds).length > 0) {
    const current = mainWindow.getBounds();
    mainWindow.setBounds({ ...current, ...bounds }, false);
  }
});

ipcMain.on('set-window-opacity', (event, value) => {
  if (!mainWindow) return;
  mainWindow.setOpacity(value);
});

// --------------- Data Persistence ---------------

ipcMain.on('save-plan-data', (event, data) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      data.windowBounds = mainWindow.getBounds();
    }
    fs.writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) { /* ignore */ }
});

ipcMain.handle('load-plan-data', () => {
  return loadSavedData();
});

ipcMain.handle('export-plan-data', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出 Little Plan 数据',
    defaultPath: path.join(app.getPath('documents'), 'Little Plan-backup.json'),
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
});

ipcMain.handle('import-plan-data', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '导入 Little Plan 数据',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths?.length) return null;
  return JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));
});

ipcMain.handle('get-app-meta', () => ({
  version: app.getVersion(),
  dataPath: getDataPath(),
  platform: process.platform,
}));

ipcMain.handle('get-login-item-settings', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('set-login-item', (event, enable) => {
  app.setLoginItemSettings({ openAtLogin: !!enable });
});

ipcMain.on('set-shortcut-config', (event, config) => {
  shortcutConfigState = { ...shortcutConfigState, ...(config || {}) };
  refreshAppMenu();
});

ipcMain.handle('open-external', (_, url) => {
  shell.openExternal(url);
});

// --------------- Update Check ---------------

async function checkForUpdates() {
  try {
    const res = await fetch('https://api.github.com/repos/XiaoChu-1208/littleplan/releases/latest', {
      headers: { 'User-Agent': 'LittlePlan-App' }
    });
    if (!res.ok) return;
    const data = await res.json();
    const latestTag = data.tag_name; // e.g. "v1.1.0"
    if (!latestTag) return;
    const currentVersion = `v${app.getVersion()}`;
    const normalize = (v) => v.replace(/^v/, '').split('.').map(Number);
    const [lMaj, lMin, lPat] = normalize(latestTag);
    const [cMaj, cMin, cPat] = normalize(currentVersion);
    const isNewer = lMaj > cMaj || (lMaj === cMaj && lMin > cMin) || (lMaj === cMaj && lMin === cMin && lPat > cPat);
    if (isNewer) {
      mainWindow?.webContents.send('update-available', { version: latestTag, url: data.html_url });
    }
  } catch (_) { /* ignore network errors */ }
}

// --------------- Window Creation ---------------

const isDev = process.env.ELECTRON_DEV === 'true';

function createWindow() {
  const saved = loadSavedData();
  shortcutConfigState = getShortcutConfig(saved);
  let x, y, w = 960, h = 500;

  if (saved?.windowBounds && (saved.rememberWindowPosition !== false || saved.rememberWindowSize !== false)) {
    if (saved.rememberWindowPosition !== false) {
      x = saved.windowBounds.x;
      y = saved.windowBounds.y;
    }
    if (saved.rememberWindowSize !== false) {
      w = saved.windowBounds.width || w;
      h = saved.windowBounds.height || h;
    }
  } else {
    const display = screen.getPrimaryDisplay();
    const wa = display.workArea;
    x = wa.x + 20;
    y = wa.y + wa.height - h - 20;
  }

  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    width: w,
    height: h,
    x,
    y,
    minWidth: 800,
    minHeight: 200,
    title: 'Little Plan - 甘特图',
    alwaysOnTop: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    acceptFirstMouse: true,
    frame: process.platform === 'win32' ? false : true,
    titleBarStyle: process.platform === 'darwin' ? 'customButtonsOnHover' : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
    app.dock.setIcon(path.join(__dirname, '../assets/icons/icon.png'));
  }

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(checkForUpdates, 3000);
  });

  refreshAppMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --------------- App Lifecycle ---------------

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

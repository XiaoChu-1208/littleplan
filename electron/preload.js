const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onAlwaysOnTopChanged: (callback) => {
    ipcRenderer.on('always-on-top-changed', (_, value) => callback(value));
  },
  onForceUnpin: (callback) => {
    ipcRenderer.on('force-unpin', () => callback());
  },
  onForcePin: (callback) => {
    ipcRenderer.on('force-pin', () => callback());
  },
  setWindowPinned: (isPinned) => ipcRenderer.send('set-window-pinned', isPinned),
  resizeWindow: (w, h) => ipcRenderer.send('resize-window', w, h),
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  setWindowBounds: (bounds) => ipcRenderer.send('set-window-bounds', bounds),
  setWindowOpacity: (v) => ipcRenderer.send('set-window-opacity', v),
  setShortcutConfig: (config) => ipcRenderer.send('set-shortcut-config', config),
  savePlanData: (data) => ipcRenderer.send('save-plan-data', data),
  loadPlanData: () => ipcRenderer.invoke('load-plan-data'),
  exportPlanData: (data) => ipcRenderer.invoke('export-plan-data', data),
  importPlanData: () => ipcRenderer.invoke('import-plan-data'),
  getAppMeta: () => ipcRenderer.invoke('get-app-meta'),
  getLoginItemSettings: () => ipcRenderer.invoke('get-login-item-settings'),
  setLoginItem: (enable) => ipcRenderer.send('set-login-item', enable),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});

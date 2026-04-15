const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getScreenshot: () => ipcRenderer.invoke('get-screenshot'),
  getDisplayInfo: () => ipcRenderer.invoke('get-display-info')
});

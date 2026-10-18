const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('evergreenSetup', { submit: input => ipcRenderer.invoke('evergreen:setup', input) });

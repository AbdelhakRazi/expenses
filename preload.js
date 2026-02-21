const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('expensesApi', {
  loadEntries: () => ipcRenderer.invoke('entries:load'),
  saveEntries: (entries) => ipcRenderer.invoke('entries:save', entries)
});

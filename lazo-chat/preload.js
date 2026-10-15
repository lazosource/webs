const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lazo', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: patch => ipcRenderer.invoke('save-config', patch),
  doneEditing: () => ipcRenderer.send('done-editing'),
  quit: () => ipcRenderer.send('quit'),
  onEditMode: fn => ipcRenderer.on('edit-mode', (_e, on) => fn(on)),
});

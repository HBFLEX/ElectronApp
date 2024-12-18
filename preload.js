const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  addTodo: (data) => ipcRenderer.invoke('add-todo', data),
  addTodoRemote: (data) => ipcRenderer.invoke('add-todo-remote', data),
  getTodos: () => ipcRenderer.invoke('get-todos'),
  getTodosRemote: () => ipcRenderer.invoke('get-todos-remote'),
  syncRemoteDB: () => ipcRenderer.invoke('sync-todos'),
});

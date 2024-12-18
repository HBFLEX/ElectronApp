const { app, BrowserWindow, ipcMain } = require('electron');
const Database = require('better-sqlite3');
const url = require('node:url');
const path = require('node:path');

// initialise the db
const db = new Database('todos.db', { verbose: console.log });
const dbHosted = new Database('todos_hosted.db', { verbose: console.log });

const syncRemoteDB = () => {
  try{
    // first of all, fetch the unsynced records from local db
    const unsynced_todos = db.prepare(`SELECT * FROM todos WHERE is_synced = 0`).all();

    if (unsynced_todos.length === 0) {
      console.log("No records to sync.");
      return;
    }

    console.log(`Found ${unsynced_todos.length} unsynced records`);

    // then we insert or update records in remote db
    const insertOrUpdate = dbHosted.prepare(`
      INSERT INTO todos (id, name, is_completed, updated_at, is_synced) VALUES (@id, @name, @is_completed, @updated_at, 1)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, is_completed = excluded.name,
        updated_at = excluded.updated_at, is_synced = excluded.is_synced
    `);

    // run the query on every unsynced todo
    for(const todo of unsynced_todos){
      insertOrUpdate.run(todo);
    }

    // mark local records as synced
    const markAsSynced = db.prepare(`UPDATE todos SET is_synced = 1 WHERE id = ?`);

    for(const todo of unsynced_todos){
      markAsSynced.run(todo.id);
    }

    console.log('Sync completed');
  }catch(e){
    console.log(`Sync Failed: ${e.message}`);
  }
}

const createTable = () => {
  // create a table
  // language=SQL format=false
  const stmt = db.prepare(`
    CREATE TABLE IF NOT EXISTS todos(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return stmt.run();
}

const createTodo = (name) => {
  const stmt = db.prepare(`INSERT INTO todos(name) VALUES (?)`);
  return stmt.run(name);
}

const createTodoRemote = (name) => {
  const stmt = dbHosted.prepare(`INSERT INTO todos(name) VALUES (?)`);
  return stmt.run(name);
}

const getAllTodos = () => {
  const stmt = db.prepare(`SELECT * FROM todos`);
  return stmt.all();
}

const getAllTodosRemote = () => {
  const stmt = dbHosted.prepare(`SELECT * FROM todos`);
  return stmt.all();
}


const createAppWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/electron-app/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  ).then(() => console.log('App Loaded Successfully'));

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createAppWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
      createAppWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// handle IPC-Calls from renderer
ipcMain.handle('add-todo', async(event, data) => createTodo(data));
ipcMain.handle('add-todo-remote', async (event, data) => createTodoRemote(data));
ipcMain.handle('get-todos', async() => getAllTodos());
ipcMain.handle('get-todos-remote', async() => getAllTodosRemote());
ipcMain.handle('sync-todos', async() => {
  try{
    syncRemoteDB();
    return { success: true, message: 'Sync completed successfully!' };
  }catch(e){
    return { success: false, message: e.message };
  }
});


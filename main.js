const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

function getDataFilePath() {
  return path.join(app.getPath('userData'), 'expenses-data.json');
}

async function readEntries() {
  const dataFilePath = getDataFilePath();
  try {
    const file = await fs.readFile(dataFilePath, 'utf-8');
    const parsed = JSON.parse(file);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function saveEntries(entries) {
  const dataFilePath = getDataFilePath();
  await fs.writeFile(dataFilePath, JSON.stringify(entries, null, 2), 'utf-8');
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('entries:load', async () => readEntries());

ipcMain.handle('entries:save', async (_event, entries) => {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid entries payload');
  }

  await saveEntries(entries);
  return { ok: true };
});

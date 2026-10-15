// LAZO Chat — a see-through Twitch chat window that stays on top of your game.
// Ctrl+Shift+L  edit mode (move, resize, change channel)
// Ctrl+Shift+H  hide / show
// Ctrl+Shift+Q  quit
const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const fs = require('fs');
const path = require('path');

const configPath = () => path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(configPath(), 'utf8')); } catch { return {}; }
}

function saveConfig(patch) {
  const cfg = { ...loadConfig(), ...patch };
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
  return cfg;
}

let win, tray;
let editing = false;

function setEditing(on) {
  editing = on;
  win.setIgnoreMouseEvents(!on, { forward: true });
  win.setFocusable(on);
  if (on) { win.show(); win.focus(); }
  win.webContents.send('edit-mode', on);
}

function toggleHidden() {
  if (win.isVisible()) win.hide(); else win.showInactive();
}

function createWindow() {
  const cfg = loadConfig();
  const area = screen.getPrimaryDisplay().workArea;
  const bounds = cfg.bounds || { width: 420, height: 520, x: area.x + 20, y: area.y + area.height - 560 };

  win = new BrowserWindow({
    ...bounds,
    minWidth: 240,
    minHeight: 160,
    transparent: true,
    frame: false,
    resizable: true,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile('index.html');

  const remember = () => saveConfig({ bounds: win.getBounds() });
  win.on('moved', remember);
  win.on('resized', remember);

  // First run has no channel yet, so open in edit mode to ask for it.
  win.webContents.on('did-finish-load', () => setEditing(!cfg.channel));
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png')).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('LAZO Chat');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Edit / move  (Ctrl+Shift+L)', click: () => setEditing(!editing) },
    { label: 'Hide / show  (Ctrl+Shift+H)', click: toggleHidden },
    { type: 'separator' },
    { label: 'Quit  (Ctrl+Shift+Q)', click: () => app.quit() },
  ]));
  tray.on('click', () => setEditing(!editing));
}

ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_e, patch) => saveConfig(patch));
ipcMain.on('done-editing', () => setEditing(false));
ipcMain.on('quit', () => app.quit());

if (!app.requestSingleInstanceLock()) app.quit();

app.whenReady().then(() => {
  createWindow();
  createTray();
  globalShortcut.register('CommandOrControl+Shift+L', () => setEditing(!editing));
  globalShortcut.register('CommandOrControl+Shift+H', toggleHidden);
  globalShortcut.register('CommandOrControl+Shift+Q', () => app.quit());
});

app.on('will-quit', () => globalShortcut.unregisterAll());

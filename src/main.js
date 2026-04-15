const { app, BrowserWindow, desktopCapturer, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

async function captureDesktop() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const scaleFactor = primaryDisplay.scaleFactor;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.round(width * scaleFactor),
      height: Math.round(height * scaleFactor)
    }
  });

  if (sources.length > 0) {
    return sources[0].thumbnail.toDataURL();
  }
  return null;
}

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  // Capture desktop BEFORE creating the window
  const screenshotDataUrl = await captureDesktop();

  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenuBarVisibility(false);

  ipcMain.handle('get-screenshot', () => screenshotDataUrl);
  ipcMain.handle('get-display-info', () => ({
    width,
    height,
    scaleFactor: primaryDisplay.scaleFactor
  }));

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open devtools in development for debugging
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'super.ico'), 
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Carga un archivo HTML local
  win.loadFile(path.join(__dirname, 'vanillaJSESModule/admin.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

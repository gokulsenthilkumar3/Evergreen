const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'Ever Green Yarn Management System',
        icon: path.join(__dirname, 'assets/icon.png') // We can add this later
    });

    // Force load from local file primarily for reliability
    // Only use dev server if explicit env var set or file missing
    const isDev = process.env.ELECTRON_IS_DEV === 'true';
    const localFile = path.join(__dirname, '../web/dist/index.html');

    // HIDE THE MENU BAR (User Request)
    mainWindow.setMenuBarVisibility(false);
    // Alternatively, to remove it completely: mainWindow.removeMenu();

    if (isDev) {
        console.log('Running in DEV mode, loading localhost:3000');
        mainWindow.loadURL('http://localhost:3000');
    } else {
        console.log(`Attempting to load local file: ${localFile}`);
        // Use loadURL with file protocol to better handle paths outside app root
        mainWindow.loadURL(`file://${localFile}`).catch((e) => {
            console.error('Local file failed to load:', e);
            console.log('Falling back to dev server: http://localhost:3000');
            mainWindow.loadURL('http://localhost:3000');
        });
    }

    // Custom Menu (Commented out to hide it as requested)
    /*
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { role: 'close' }
            ]
        }
    ];
    
    const menu = Menu.buildFromTemplate(template);
        */

    // Remove the menu completely
    mainWindow.removeMenu();

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

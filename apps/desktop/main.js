const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let mainWindow;
let apiProcess;

// Force load from local file primarily for reliability
// Only use dev server if explicit env var set or file missing
const isDev = process.env.ELECTRON_IS_DEV === 'true';

// Helper to get resources path in both dev and prod
const getResourcesPath = () => {
    return isDev ? path.join(__dirname, '..') : process.resourcesPath;
};

// Start the NestJS API server
function startApiServer() {
    if (isDev) {
        console.log('Running in DEV mode, skipping API spawn (run npm run start:dev manually)');
        return;
    }

    const apiPath = path.join(getResourcesPath(), 'backend/dist/main.js');
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');
    const initialDbPath = path.join(getResourcesPath(), 'backend/prisma/dev.db'); // Source DB to copy initially

    // Copy initial DB if not exists
    if (!fs.existsSync(dbPath)) {
        try {
            if (fs.existsSync(initialDbPath)) {
                fs.copyFileSync(initialDbPath, dbPath);
                console.log('Database initialized from template.');
            } else {
                console.warn('Initial database template not found. The API might fail if migrations are not run.');
            }
        } catch (e) {
            console.error('Failed to initialize database:', e);
        }
    }

    console.log(`Starting API server from: ${apiPath}`);
    console.log(`Database URL: file:${dbPath}`);

    const env = {
        ...process.env,
        PORT: 3001,
        DATABASE_URL: `file:${dbPath}`,
        NODE_ENV: 'production',
        // Fix for Prisma engine not found often
        // PRISMA_QUERY_ENGINE_LIBRARY: path.join(getResourcesPath(), 'backend/node_modules/.prisma/client/query_engine-windows.dll.node') 
    };

    apiProcess = fork(apiPath, [], {
        env,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    apiProcess.stdout.on('data', (data) => {
        console.log(`API: ${data}`);
    });

    apiProcess.stderr.on('data', (data) => {
        console.error(`API Error: ${data}`);
    });

    apiProcess.on('close', (code) => {
        console.log(`API server exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: 'Ever Green Yarn Management System',
        icon: path.join(__dirname, 'assets/icon.png')
    });

    const localFile = path.join(__dirname, 'web-dist/index.html');

    // Enable the menu bar
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
    Menu.setApplicationMenu(menu);

    if (isDev) {
        console.log('Running in DEV mode, loading localhost:3000');
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        console.log(`Attempting to load local file: ${localFile}`);
        // Use loadURL with file protocol
        mainWindow.loadURL(`file://${localFile}`).catch((e) => {
            console.error('Local file failed to load:', e);
            console.log('Falling back to dev server: http://localhost:3000');
            mainWindow.loadURL('http://localhost:3000');
        });
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });

    // Check if API is ready (simple check)
    if (!isDev) {
        // We can implement a retry mechanism or loading screen here
        // For now, allow retry on connection refused
        mainWindow.webContents.on('did-fail-load', () => {
            console.log('Failed to load. Retrying in 2 seconds...');
            setTimeout(() => mainWindow.loadURL(`file://${localFile}`), 2000);
        });
    }
}

app.whenReady().then(() => {
    startApiServer();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    if (apiProcess) {
        console.log('Killing API process...');
        apiProcess.kill();
    }
});

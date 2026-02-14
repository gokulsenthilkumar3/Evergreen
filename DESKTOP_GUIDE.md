# Desktop Version Guide (Electron)

This project now includes an Electron-based desktop version which wraps the web application in a native window.

## Architecture
- **Main Process (`apps/desktop/main.js`)**: Manages the native window and system menus.
- **Preload Script (`apps/desktop/preload.js`)**: Bridges the Gap between the web app and Electron's native features safely.
- **Renderer Process**: The existing React application (`apps/web`).

## How to Run

### 1. Development Mode
To run the desktop app while developing (with hot-reload for the web app):

```bash
# Terminal 1: Start API and Web (Required)
npm run dev

# Terminal 2: Start Desktop App
npm run desktop
```

### 3. Packaging into `.exe` (EXE)
To create a standalone installer for Windows:

1. **Build the Web App**:
   ```bash
   npm run build -w apps/web
   ```
2. **Package the Desktop App**:
   ```bash
   npm run dist:desktop
   ```
   The installer will be generated in `apps/desktop/dist/EverGreen Setup 1.0.0.exe`.

## Why Desktop?
- **Native Experience**: Window controls, system menus, and desktop notifications.
- **Performance**: Dedicated window process.
- **Offline Capability**: The built `.exe` loads local files, so it works even if your dev server isn't running.

## Future Enhancements
- [x] **Packaging**: Use `electron-builder` to create a standalone `.exe` installer.
- [ ] **Native File Access**: Integrate with local system for exporting Excel/PDF reports directly.
- [ ] **Auto-Launch**: Option to start with Windows.
- [ ] **Tray Icon**: Minimize to system tray for background monitoring.

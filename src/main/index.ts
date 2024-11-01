import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import electronUpdater, { type AppUpdater, AppImageUpdater, autoUpdater } from 'electron-updater'
import isDev from 'electron-is-dev'
import log from 'electron-log/renderer'

// const AppUpdater = new AppImageUpdater({})
// const getAutoUpdater = (): AppUpdater => {
//   // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
//   // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
//   const { autoUpdater } = electronUpdater
//   return autoUpdater
// }
// const autoUpdater = new AppImageUpdater({
//   provider: 'github',
//   repo: 'https://github.com/unAmic0/auto-update-check'
// })
// if (isDev) {
//   // Useful for some dev/debugging tasks, but download can
//   // not be validated becuase dev app is not signed
//   autoUpdater.updateConfigPath = join(__dirname, 'dev-app-update.yml')
// }

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.updateConfigPath = join(__dirname, 'dev-app-update.yml')
    }
    autoUpdater.checkForUpdatesAndNotify()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
autoUpdater.on('update-available', () => {
  // log.info('here')
  console.log('update-available')
  // autoUpdater.quitAndInstall()
})
autoUpdater.on('update-not-available', () => {
  console.log('update-un-available')
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

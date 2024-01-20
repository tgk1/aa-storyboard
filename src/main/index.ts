import { app, shell, BrowserWindow, ipcMain, autoUpdater, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import ElectronStore from 'electron-store';
import path from 'path';

import { AppConfig } from '@config/AppConfig';
import { AppActivity } from '@/data/model/AppActivity';
import { LocalDBClient } from '@/data/LocalDBClient';
import { KomaUtil } from '@/data/model/KomaUtil';
import { KomaPart } from '@/data/model/Koma';
import { defaultAAListTxt } from '@/data/etc/DefaultAAListTxt';
import { appConfigIPC } from '@/preload/AppConfigIPC';
import { markDBClientIPC } from '@/preload/MarkDBClientIPC';
import { localMLTClientIPC } from '@/preload/LocalMLTClientIPC';
import { localDBClientIPC } from '@/preload/LocalDBClientIPC';
import { MenuBuilder } from '@/menu/MenuBuilder';
import { enableMenu } from '@/menu/enableMenu';

process.env.ELECTRON_ENABLE_LOGGING = is.dev.toString();
process.env.ROOT = path.join(__dirname, '..');
process.env.DIST = path.join(process.env.ROOT, 'dist-electron');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, 'public')
  : path.join(process.env.ROOT, '.output/public');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const preload = path.join(__dirname, '../preload/index.js');

let mainWindow: BrowserWindow; // main index window
let aaCanvasWindow: BrowserWindow;
let mltSelectorWindow: BrowserWindow;
let textEditorWindow: BrowserWindow;

//
// 起動
//
appInit();
app.whenReady().then(bootstrap);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('browser-window-created', (_, window) => {
  optimizer.watchWindowShortcuts(window);
});

// https://electron-vite.org 使用
function bootstrap() {
  mainWindow = createWindow(mainWindow, AppActivity.MainIndex, 'index.html');

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(mainWindow, AppActivity.MainIndex, 'index.html');
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  enableMenu(AppActivity.MainIndex);

  createAACanvasWindow();
  createTextEditorWindow();
  createMLTSelectorWindow();
}

//
// window 作成
//
function createWindow(
  winVar: BrowserWindow | null,
  appActivity: string,
  renderHtml: string,
  childOption: object = {}
): BrowserWindow {
  const bounds = AppConfig.get().Window;
  const modal = appActivity == AppActivity.MLTSelector;
  const option = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    minWidth: 1000,
    minHeight: 800,
    backgroundColor: '#fff',
    show: false,
    modal: modal,
    webPreferences: {
      preload,
      sandbox: false
      //nodeIntegrationInWorker: true,
      //nodeIntegration: true,
      //contextIsolation: false
      //webSecurity: false
    }
  };

  winVar = new BrowserWindow(Object.assign(option, childOption));

  if (is.dev && process.env['ELECTRON_RENDERER_URL'] + '/' + renderHtml) {
    winVar.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/' + renderHtml);
  } else {
    winVar.loadFile(join(__dirname, '../renderer/' + renderHtml));
  }

  winVar.on('resize', () => {
    saveWindow(winVar);
  });
  winVar.on('move', () => {
    saveWindow(winVar);
  });
  winVar.on('closed', () => {
    winVar = null;
  });

  return winVar;
}

function createMLTSelectorWindow() {
  if (!mltSelectorWindow || mltSelectorWindow.isDestroyed()) {
    mltSelectorWindow = createWindow(mltSelectorWindow, AppActivity.MLTSelector, 'mlt-selector.html', {
      show: false,
      modal: true,
      parent: aaCanvasWindow
  });
  }
}

function createAACanvasWindow() {
  if (!aaCanvasWindow || aaCanvasWindow.isDestroyed()) {
    aaCanvasWindow = createWindow(aaCanvasWindow, AppActivity.AACanvas, 'aa-canvas.html', {
      show: false,
      modal: false,
      parent: mainWindow
    });
    aaCanvasWindow.setBounds(mainWindow.getBounds());
  }
}

function createTextEditorWindow() {
  if (!textEditorWindow || textEditorWindow.isDestroyed()) {
    textEditorWindow = createWindow(textEditorWindow, AppActivity.TextEditor, 'text-editor.html', {
      show: false,
      modal: false,
      parent: mainWindow
    });
    textEditorWindow.setBounds(mainWindow.getBounds());
  }
}

function saveWindow(winVar: BrowserWindow | null) {
  if (winVar != null) {
    const cnf = AppConfig.get();
    cnf.Window = winVar.getBounds();
    AppConfig.set(cnf);
  }
}

function appInit() {
  ElectronStore.initRenderer();
  AppConfig.initData();
  MenuBuilder.build(app);
  AppConfig.applyTheme(AppConfig.get().Theme);

  appConfigIPC();
  markDBClientIPC();
  localMLTClientIPC();
  localDBClientIPC();

  defaultAAListTxt();
}

//
// IPC 関連
//
ipcMain.on('openAACanvasSTEP1_appWindowAPI', async (_event, arg) => {
  const ldb = new LocalDBClient(arg['path']);
  const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
  const komaParts: KomaPart[] = ldb.getKomaParts(koma.id);

  const sPath = arg['path'];
  const sKoma = arg['strKoma'];
  const sKomaParts = JSON.stringify(komaParts);
  const dic = { path: sPath, strKoma: sKoma, strKomaParts: sKomaParts };

  createAACanvasWindow();
  aaCanvasWindow.on('ready-to-show', () => {
    aaCanvasWindow.webContents.send('openAACanvasSTEP2_appWindowAPI', dic);
  });
  aaCanvasWindow.on('show', () => {
    aaCanvasWindow.webContents.send('openAACanvasSTEP2_appWindowAPI', dic);
  });
  aaCanvasWindow.show();

  enableMenu(AppActivity.AACanvas);
});

ipcMain.on('closeAACanvasSTEP1_appWindowAPI', async (_event, arg) => {
  const sPath = arg['path'];
  const sKoma = arg['strKoma'];
  const dic = { path: sPath, strKoma: sKoma };

  mainWindow.webContents.send('closeAACanvasSTEP2_appWindowAPI', dic);
  aaCanvasWindow.close();

  // aaCanvasは終了ごとに破棄し、backgroundで準備しておく
  new Promise(() => {
    setTimeout(() => {
      createAACanvasWindow();
    }, 1000);
  });

  enableMenu(AppActivity.MainIndex);
});

ipcMain.on('openMLTSelector_appWindowAPI', async () => {
  createMLTSelectorWindow();
  mltSelectorWindow.show();

  enableMenu(AppActivity.MLTSelector);
});

ipcMain.on('closeMLTSelectorSTEP1_appWindowAPI', async (_event, aa_data) => {
  aaCanvasWindow.webContents.send('closeMLTSelectorSTEP2_appWindowAPI', aa_data);
  mltSelectorWindow.hide();

  enableMenu(AppActivity.AACanvas);
});

ipcMain.on('openTextEditorSTEP1_appWindowAPI', async (_event, arg) => {
  createTextEditorWindow();
  textEditorWindow.on('ready-to-show', () => {
    textEditorWindow.webContents.send('openTextEditorSTEP2_appWindowAPI', arg);
  });
  textEditorWindow.on('show', () => {
    textEditorWindow.webContents.send('openTextEditorSTEP2_appWindowAPI', arg);
  });
  textEditorWindow.show();

  enableMenu(AppActivity.TextEditor);
});

ipcMain.on('saveTextEditorSTEP1_appWindowAPI', async (_event, arg) => {
  aaCanvasWindow.webContents.send('saveTextEditorSTEP2_appWindowAPI', arg);
});

ipcMain.on('closeTextEditorSTEP1_appWindowAPI', async () => {
  aaCanvasWindow.webContents.send('closeTextEditorSTEP2_appWindowAPI');
  textEditorWindow.hide();
  enableMenu(AppActivity.AACanvas);
});

ipcMain.on('quit_appWindowAPI', async () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// auto updater
electronApp.setAppUserModelId('net.r401.aa-storyboard');
autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  });
});
autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application');
  console.error(message);
});
autoUpdater.checkForUpdates();

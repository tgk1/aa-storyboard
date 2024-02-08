/* eslint-disable @typescript-eslint/no-unused-vars */

import { ipcRenderer, ipcMain, IpcMainInvokeEvent, dialog, app } from 'electron';
import { AppConfig, AppConfigParam } from '@config/AppConfig';
import { AppActivity, Theme } from '@/data/model';
import { str2theme } from '@/data/model/Theme';

// window.ipc.* の宣言(なくても動くがTypeScriptで警告がでる対策)
export interface AppConfigAPI {
  get: () => Promise<AppConfigParam>;
  set: (cnf: AppConfigParam) => Promise<void>;

  isDarkTheme: () => boolean;
  applyTheme: (theme: Theme) => void;

  folder: (arg: string) => string[];
  getReplicaFolder: () => string;
  setCurrentFile: (file: string) => void;
  mkAppDir: () => void;
  getLocale: () => string;

  setExportMenu: (dic: { act: AppActivity; file: string }) => void;
}

declare global {
  interface Window {
    appConfig: AppConfigAPI;
  }
}

//prettier-ignore
export const appConfigAPI = {
  get:()                    => ipcRenderer.invoke('get_AppConfig'),
  set:(dic: AppConfigParam) => ipcRenderer.invoke('set_AppConfig', [dic]),


  isDarkTheme:()            => ipcRenderer.sendSync('isDarkTheme_AppConfig'),
  applyTheme:(theme: Theme) => ipcRenderer.invoke('applyTheme_AppConfig', theme),

  folder:(arg:string)       => ipcRenderer.sendSync('folder', arg),
  getReplicaFolder:()       => ipcRenderer.sendSync('getReplicaFolder_AppConfig'),
  setCurrentFile:(file: string) => ipcRenderer.send('setCurrentFile_AppConfig', file),
  mkAppDir:() => ipcRenderer.send('mkAppDir_AppConfig'),
  getLocale:() => ipcRenderer.sendSync('getLocale_AppConfig'),

  setExportMenu:(dic: { act: AppActivity, file: string }) => ipcRenderer.invoke('setExportMenu_AppConfig', dic)
};

export function appConfigIPC() {
  ipcMain.handle('get_AppConfig', async (_event: IpcMainInvokeEvent, _arg: AppConfigParam[]) => {
    return AppConfig.get();
  });

  ipcMain.handle('set_AppConfig', async (_event: IpcMainInvokeEvent, arg: AppConfigParam[]) => {
    const val = arg[0] as AppConfigParam;
    AppConfig.set(val);
  });

  ipcMain.handle('applyTheme_AppConfig', async (_event: IpcMainInvokeEvent, arg: AppConfigParam[]) => {
    const theme = str2theme(arg as unknown as string);
    AppConfig.applyTheme(theme);
  });
  ipcMain.on('isDarkTheme_AppConfig', (event) => {
    event.returnValue = AppConfig.isDarkTheme();
  });

  ipcMain.on('setCurrentFile_AppConfig', async (_event: IpcMainInvokeEvent, file: string) => {
    AppConfig.setCurrentFile(file);
  });

  ipcMain.on('mkAppDir_AppConfig', async (_event: IpcMainInvokeEvent) => {
    AppConfig.mkAppDir();
  });

  ipcMain.on('folder', (event, arg) => {
    event.returnValue = dialog.showOpenDialogSync({ defaultPath: arg, properties: ['openDirectory'] });
  });

  ipcMain.on('getReplicaFolder_AppConfig', (event, _arg) => {
    event.returnValue = AppConfig.getReplicaFolder();
  });

  ipcMain.on('getLocale_AppConfig', (event) => {
    event.returnValue = app.getLocale();
  });

  ipcMain.handle('setExportMenu_AppConfig', async (_event: IpcMainInvokeEvent, arg) => {
    const act = arg['act'] as unknown as AppActivity;
    const file = arg['file'] as unknown as string;
    AppConfig.setExportMenu(act, file);
  });
}

import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { appConfigAPI } from '@/preload/AppConfigIPC';
import { appWindowAPI } from '@/preload/AppWindowIPC';
import { markDBClientAPI } from '@/preload/MarkDBClientIPC';
import { localDBClientAPI } from '@/preload/LocalDBClientIPC';
import { localMLTClientAPI } from '@/preload/LocalMLTClientIPC';
import { menuAPI } from '@/preload/MenuIPC';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('appConfig', appConfigAPI);
    contextBridge.exposeInMainWorld('appWindow', appWindowAPI);
    contextBridge.exposeInMainWorld('menu', menuAPI);
    contextBridge.exposeInMainWorld('markDB', markDBClientAPI);
    contextBridge.exposeInMainWorld('localDB', localDBClientAPI);
    contextBridge.exposeInMainWorld('localMLT', localMLTClientAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.appConfig = appConfigAPI;
  // @ts-ignore (define in dts)
  window.appWindow = appWindowAPI;
  // @ts-ignore (define in dts)
  window.menu = menuAPI;
  // @ts-ignore (define in dts)
  window.markDB = markDBClientAPI;
  // @ts-ignore (define in dts)
  window.localDB = localDBClientAPI;
  // @ts-ignore (define in dts)
  window.localMLT = localMLTClientAPI;
  // @ts-ignore (define in dts)
}

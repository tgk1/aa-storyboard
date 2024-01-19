import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    api: unknown;
    electron: ElectronAPI;
    appWindow: AppWindowAPI;
    menu: MenuAPI;
    markDB: MarkDBClientAPI;
    localDB: LocalDBClientAPI;
    localMLT: LocalMLTClientAPI;
  }
}

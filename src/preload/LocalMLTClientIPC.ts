/*
  使い方

  レンダラープロセスで、
  const list = window.localMLT.get(item1); // itemで指定したディレクトリの一覧を取得
  const mlt = window.localMLT.mlt(item2); // itemで指定したMLTファイルを取得
  具体的にはレンダラープロセスで使用するListManager.tsで使用している。

*/

import { ipcRenderer, ipcMain, IpcMainInvokeEvent } from 'electron';

import { ItemList } from '@model/Item';
import { KomaList } from '@model/Koma';
import { ItemUtil } from '@model/ItemUtil';
import { AAListTxt } from '@model/AAListTxt';
import { LocalMLTClient } from '../data/LocalMLTClient';

export interface LocalMLTClientAPI {
  get: (strItem: string) => Promise<ItemList>;
  mlt: (strItem: string) => Promise<KomaList>;
  aalist: () => Promise<AAListTxt>;
  parent: (strStem: string) => string;
}

declare global {
  interface Window {
    localMLT: LocalMLTClientAPI;
  }
}

export const localMLTClientAPI = {
  get: (strItem: string) => ipcRenderer.invoke('get_localMLT', strItem),
  mlt: (strItem: string) => ipcRenderer.invoke('mlt_localMLT', strItem),
  aalist: () => ipcRenderer.invoke('aalist_localMLT'),
  parent: (strItem: string) => ipcRenderer.sendSync('parent_localMLT', strItem)
};

export function localMLTClientIPC() {
  ipcMain.handle('get_localMLT', async (_event: IpcMainInvokeEvent, arg: string) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    const client = new LocalMLTClient();
    return client.get(item);
  });

  ipcMain.handle('mlt_localMLT', async (_event: IpcMainInvokeEvent, arg: string) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    const client = new LocalMLTClient();
    return client.mlt(item);
  });

  ipcMain.handle('aalist_localMLT', async () => {
    const client = new LocalMLTClient();
    return client.aalisttxt();
  });

  ipcMain.on('parent_localMLT', (event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    const client = new LocalMLTClient();
    const stritem = JSON.stringify(client.getParent(item));
    event.returnValue = stritem;
  });
}

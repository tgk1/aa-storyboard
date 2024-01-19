/* eslint-disable prettier/prettier */
/*
  使い方

  レンダラープロセスで、
  const list = window.markDB.getMarks(item1); // item1で指定したお気に入りの一覧を取得
  具体的にはレンダラープロセスで使用するListManager.tsで使用している。 FlieList.vue

*/

import { ipcRenderer, ipcMain, IpcMainInvokeEvent } from 'electron';

import { Item, ItemList, ItemUtil } from '@model/index';
import { MarkDBClient } from '@/data/MarkDBClient';

export interface MarkDBClientAPI {
  setItem:         (strItem: string)   => void;
  setReplica:      (strItem: string)   => void;
  setReplicaName:  (dic: { strItem: string; name: string })   => void;
  deleteRecent:    (strItem: string)   => void;
  deleteReplica:   (strItem: string)   => void;
  deleteRecentAll: ()                  => void;
  deleteUseDateAll:()                  => void;

  getMarks:       (strItems: string)   => Promise<Item[]>;
  getMarkList:    (strItem: string)    => Promise<ItemList>;
  getRecentList:  (strItem: string)    => Promise<ItemList>;
  getReplicaList: (strItem: string)    => Promise<ItemList>;

  getReplicaName: (strItem: string)    => string;
  getReplicaFile: (strItem: string)    => string;
}

declare global {
  interface Window {
    markDB: MarkDBClientAPI;
  }
}

export const markDBClientAPI = {
  setItem:         (strItem: string) => ipcRenderer.send('setItem_MarkDB',          strItem),
  setReplica:      (strItem: string) => ipcRenderer.send('setReplica_MarkDB',       strItem),
  setReplicaName:  (dic: { strItem: string, name: string }) => ipcRenderer.send('setReplicaName_MarkDB', dic),
  deleteRecent:    (strItem: string) => ipcRenderer.send('deleteRecent_MarkDB',     strItem),
  deleteReplica:   (strItem: string) => ipcRenderer.send('deleteReplica_MarkDB',    strItem),
  deleteRecentAll: ()                => ipcRenderer.send('deleteRecentAll_MarkDB'),
  deleteUseDateAll:()                => ipcRenderer.send('deleteUseDateAll_MarkDB'),

  getMarks:       (strItems: string) => ipcRenderer.invoke('getMarks_MarkDB',         strItems),
  getMarkList:    (strItem: string)  => ipcRenderer.invoke('getMarkList_MarkDB',      strItem),
  getRecentList:  (strItem: string)  => ipcRenderer.invoke('getRecentList_MarkDB',    strItem),
  getReplicaList: (strItem: string)  => ipcRenderer.invoke('getReplicaList_MarkDB',   strItem),

  getReplicaName: (strItem: string)  => ipcRenderer.sendSync('getReplicaName_MarkDB', strItem),
  getReplicaFile: (strItem: string)  => ipcRenderer.sendSync('getReplicaFile_MarkDB', strItem)
};

export function markDBClientIPC() {
  const markdb = new MarkDBClient();
  markdb.init();

  ipcMain.on('setItem_MarkDB', (_event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    markdb.setItem(item);
  });

  ipcMain.on('setReplica_MarkDB', (_event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    markdb.setReplica(item);
  });

  ipcMain.on('setReplicaName_MarkDB', (_event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg['strItem']));
    const name = arg['name'];
    markdb.setReplicaName(item, name);
  });

  ipcMain.on('deleteRecent_MarkDB', (_event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    markdb.deleteRecent(item);
  });

  ipcMain.on('deleteReplica_MarkDB', (_event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    markdb.deleteReplica(item);
  });

  ipcMain.on('deleteRecentAll_MarkDB', () => {
    markdb.deleteRecentAll();
  });

  ipcMain.on('deleteUseDateAll_MarkDB', () => {
    markdb.deleteUseDateAll();
  });

  ipcMain.handle('getMarks_MarkDB', async (_event: IpcMainInvokeEvent, arg: string) => {
    const objs: Item[] = JSON.parse(arg);
    const items: Item[] = [];
    for (const obj of objs) {
      items.push(ItemUtil.obj2item(obj));
    }
    return markdb.getMarks(items);
  });

  ipcMain.handle('getMarkList_MarkDB', async (_event: IpcMainInvokeEvent, arg: string) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    return markdb.getMarkList(item);
  });

  ipcMain.handle('getRecentList_MarkDB', async (_event: IpcMainInvokeEvent, arg: string) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    return markdb.getRecentList(item);
  });

  ipcMain.handle('getReplicaList_MarkDB', async (_event: IpcMainInvokeEvent, arg: string) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    return markdb.getReplicaList(item);
  });

  ipcMain.on('getReplicaName_MarkDB', (event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    event.returnValue = markdb.getReplicaName(item);
  });

  ipcMain.on('getReplicaFile_MarkDB', (event, arg) => {
    const item = ItemUtil.obj2item(JSON.parse(arg));
    event.returnValue = markdb.getReplicaFile(item);
  });
}

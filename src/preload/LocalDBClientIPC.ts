/* eslint-disable prettier/prettier */
/*
  使い方

  レンダラープロセスで、
  const res = window.localDB.get(item);

  レンダラープロセスで使用するListManager.tsで使用している。
*/

import { ipcRenderer, ipcMain } from 'electron';

import { Koma, KomaList, KomaPart } from '@model/Koma';
import { LocalDBClient } from '../data/LocalDBClient';
import { KomaUtil } from '../data/model/KomaUtil';

export interface LocalDBClientAPI {
  addKoma:                 (dic: { path: string; strKoma: string })                    => number;
  insertKoma:              (dic: { path: string; orderNum: number; strKoma: string })  => number;
  trashKoma:               (dic: { path: string; komaID: number })                     => void;
  pasteKoma:               (dic: { path: string; orderNum: number; strKoma: string; strKomaParts: string }) => number;
  sortKomas:               (dic: { path: string; komaID: number; oldOrderNum: number; newOrderNum: number }) => void;
  setKoma:                 (dic: { path: string; strKoma: string })                    => void;
  getKoma:                 (dic: { path: string; komaID: number })                     => Promise<Koma>;
  getKomaList:             (dic: { path: string })                                     => Promise<KomaList>;
  undoTrashKoma:           (dic: { path: string })                                     => number;
  hasTrashedKomas:         (dic: { path: string })                                     => boolean;
  deleteTrashedKomas:      (dic: { path: string })                                     => void;

  addKomaPart:             (dic: { path: string; strKomaPart: string }) => number;
  insertKomaPart:          (dic: { path: string; strKomaPart: string }) => number;
  duplicateKomaPart:       (dic: { path: string; strKomaPart: string }) => number;
  addNewKomaPart:          (dic: { path: string; komaID: number })      => number;
  setKomaPart:             (dic: { path: string; strKomaPart: string }) => void;
  getKomaPart:             (dic: { path: string; komaID: number })      => Promise<KomaPart>;
  getKomaParts:            (dic: { path: string; komaID: number })      => Promise<KomaPart[]>;
  hasMergedKomaParts:      (dic: { path: string; komaID: number })      => boolean;
  hasTrashedKomaParts:     (dic: { path: string; komaID: number })      => boolean;
  undoMergeKomaParts:      (dic: { path: string; komaID: number })      => void;
  undoTrashKomaPart:       (dic: { path: string; komaID: number })      => void;
  mergeKomaParts:          (dic: { path: string; strKoma: string; strKomaPart: string }) => void;
  trashKomaPart:           (dic: { path: string; strKomaPart: string }) => void;

  sortKomaParts:           (dic: { path: string; komaID: number; komaPartID: number; oldOrderNum: number; newOrderNum: number }) => void;
  setKomaAndKomaParts:     (dic: { path: string; strKoma: string; strKomaParts: string }) => void;//

  replicaKoma:             (dic: { path: string; strKoma: string; strKomaParts: string }) => void;
  createFile:              (dic: { dirName: string; fileName: string }) => string;

  replaceString:           (dic: { path: string; komaID: number, keyword: string, replace: string }) => void;
  replaceAllString:        (dic: { path: string; keyword: string, replace: string }) => void;
}
declare global {
  interface Window {
    localDB: LocalDBClientAPI;
  }
}

export const localDBClientAPI = {
  addKoma:              (dic: { path: string; strKoma: string })      => ipcRenderer.sendSync('addKoma_LocalDB', dic),
  insertKoma:           (dic: { path: string; orderNum: number; strKoma: string }) => ipcRenderer.sendSync('insertKoma_LocalDB', dic),
  pasteKoma:            (dic: { path: string; orderNum: number; strKoma: string; strKomaParts: string }) => ipcRenderer.sendSync('pasteKoma_LocalDB', dic),
  sortKomas:            (dic: { path: string; komaID: number, oldOrderNum: number, newOrderNum: number }) => ipcRenderer.send('sortKomas_LocalDB', dic),
  setKoma:              (dic: { path: string; strKoma: string })      => ipcRenderer.send('setKoma_LocalDB', dic),
  getKoma:              (dic: { path: string; komaID: number })       => ipcRenderer.invoke('getKoma_LocalDB', dic),
  getKomaList:          (dic: { path: string })                       => ipcRenderer.invoke('getKomaList_LocalDB', dic),
  trashKoma:            (dic: { path: string, komaID: number })       => ipcRenderer.send('trashKoma_LocalDB', dic),
  undoTrashKoma:        (dic: { path: string })                       => ipcRenderer.sendSync('undoTrashKoma_LocalDB', dic),
  hasTrashedKomas:      (dic: { path: string })                       => ipcRenderer.sendSync('hasTrashedKomas_LocalDB', dic),
  deleteTrashedKomas:   (dic: { path: string })                       => ipcRenderer.send('deleteTrashedKomas_LocalDB', dic),

  addKomaPart:          (dic: { path: string; strKomaPart: string })  => ipcRenderer.sendSync('addKomaPart_LocalDB', dic),
  insertKomaPart:       (dic: { path: string; strKomaPart: string })  => ipcRenderer.sendSync('insertKomaPart_LocalDB', dic),
  duplicateKomaPart:    (dic: { path: string; strKomaPart: string })  => ipcRenderer.sendSync('duplicateKomaPart_LocalDB', dic),
  addNewKomaPart:       (dic: { path: string; komaID: number })       => ipcRenderer.sendSync('addNewKomaPart_LocalDB', dic),
  setKomaPart:          (dic: { path: string; strKomaPart: string })  => ipcRenderer.send('setKomaPart_LocalDB', dic),
  getKomaPart:          (dic: { path: string; komaPartID: number })   => ipcRenderer.invoke('getKomaPart_LocalDB', dic),
  getKomaParts:         (dic: { path: string; komaID: number })       => ipcRenderer.invoke('getKomaParts_LocalDB', dic),
  hasMergedKomaParts:   (dic: { path: string; komaID: number })       => ipcRenderer.sendSync('hasMergedKomaParts_LocalDB', dic),
  hasTrashedKomaParts:  (dic: { path: string; komaID: number })       => ipcRenderer.sendSync('hasTrashedKomaParts_LocalDB', dic),
  undoMergeKomaParts:   (dic: { path: string; komaID: number })       => ipcRenderer.send('undoMergeKomaParts_LocalDB', dic),
  undoTrashKomaPart:    (dic: { path: string; komaID: number })       => ipcRenderer.send('undoTrashKomaPart_LocalDB', dic),
  mergeKomaParts:       (dic: { path: string; strKoma: string, strKomaPart: string }) => ipcRenderer.send('mergeKomaParts_LocalDB', dic),
  trashKomaPart:        (dic: { path: string; strKomaPart: string })  => ipcRenderer.send('trashKomaPart_LocalDB', dic),
  sortKomaParts:        (dic: { path: string; komaID: number, komaPartID: number, oldOrderNum: number, newOrderNum: number }) => ipcRenderer.send('sortKomaParts_LocalDB', dic),

  setKomaAndKomaParts:  (dic: { path: string; strKoma: string, strKomaParts: string }) => ipcRenderer.send('setKomaAndKomaParts_LocalDB', dic),

  replicaKoma:          (dic: { path: string; strKoma: string; strKomaParts: string }) => ipcRenderer.send('replicaKoma_LocalDB', dic),
  createFile:           (dic: { dirName: string; fileName: string })  => ipcRenderer.sendSync('createFile_LocalDB', dic),

  replaceString:        (dic: { path: string; komaID: number; keyword: string; replace: string })  => ipcRenderer.sendSync('replaceString_LocalDB', dic),
  replaceAllString:     (dic: { path: string; keyword: string; replace: string })  => ipcRenderer.sendSync('replaceAllString_LocalDB', dic)
};

export function localDBClientIPC() {
  //
  //
  ipcMain.on('setKoma_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    ldb.setKoma(koma);
  });

  ipcMain.on('trashKoma_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    ldb.trashKoma(id);
  });

  ipcMain.on('deleteTrashedKomas_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    ldb.deleteTrashedKomas();
  });

  ipcMain.on('replicaKoma_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    const komaParts = arg['strKomaParts'] ? KomaUtil.obj2komaParts(JSON.parse(arg['strKomaParts'])) : [];
    ldb.replicaKoma(koma, komaParts);
  });

  ipcMain.on('setKomaPart_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    ldb.setKomaPart(komaPart);
  });

  ipcMain.on('undoMergeKomaParts_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    ldb.undoMergeKomaParts(id);
  });

  ipcMain.on('undoTrashKomaPart_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    ldb.undoTrashKomaPart(id);
  });

  ipcMain.on('trashKomaPart_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    ldb.trashKomaPart(komaPart);
  });

  ipcMain.on('mergeKomaParts_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    ldb.mergeKomaParts(koma, komaPart);
  });

  ipcMain.on('sortKomas_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    const oldOrderNum = arg['oldOrderNum'];
    const newOrderNum = arg['newOrderNum'];
    ldb.sortKomas(id, oldOrderNum, newOrderNum);
  });

  ipcMain.on('sortKomaParts_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaID = arg['komaID'];
    const komaPartID = arg['komaPartID'];
    const oldOrderNum = arg['oldOrderNum'];
    const newOrderNum = arg['newOrderNum'];
    ldb.sortKomaParts(komaID, komaPartID, oldOrderNum, newOrderNum);
  });

  ipcMain.on('setKomaAndKomaParts_LocalDB', (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    const komaParts = arg['strKomaParts'] ? KomaUtil.obj2komaParts(JSON.parse(arg['strKomaParts'])) : [];
    ldb.setKomaAndKomaParts(koma, komaParts);
  });

  //
  //
  ipcMain.handle('getKoma_LocalDB', async (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    return ldb.getKoma(id);
  });

  ipcMain.handle('getKomaList_LocalDB', async (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    return ldb.getKomaList();
  });

  ipcMain.handle('getKomaPart_LocalDB', async (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaPartID'];
    return ldb.getKomaPart(id);
  });

  ipcMain.handle('getKomaParts_LocalDB', async (_event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = parseInt(arg['komaID']);
    return ldb.getKomaParts(id);
  });

  //
  //
  ipcMain.on('addKoma_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    event.returnValue = ldb.addKoma(koma);
  });

  ipcMain.on('insertKoma_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const orderNum = arg['orderNum'];
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    event.returnValue = ldb.insertKoma(orderNum, koma);
  });

  ipcMain.on('pasteKoma_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const orderNum = arg['orderNum'];
    const koma = KomaUtil.obj2koma(JSON.parse(arg['strKoma']));
    const komaParts = arg['strKomaParts'] ? KomaUtil.obj2komaParts(JSON.parse(arg['strKomaParts'])) : [];
    event.returnValue = ldb.pasteKoma(orderNum, koma, komaParts);
  });

  ipcMain.on('undoTrashKoma_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    event.returnValue = ldb.undoTrashKoma();
  });

  ipcMain.on('hasTrashedKomas_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    event.returnValue = ldb.hasTrashedKomas();
  });

  ipcMain.on('addKomaPart_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    event.returnValue = ldb.addKomaPart(komaPart);
  });

  ipcMain.on('insertKomaPart_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    event.returnValue = ldb.insertKomaPart(komaPart);
  });

  ipcMain.on('duplicateKomaPart_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const komaPart = KomaUtil.obj2komaPart(JSON.parse(arg['strKomaPart']));
    event.returnValue = ldb.duplicateKomaPart(komaPart);
  });

  ipcMain.on('addNewKomaPart_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    event.returnValue = ldb.addNewKomaPart(id);
  });

  ipcMain.on('hasMergedKomaParts_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    event.returnValue = ldb.hasMergedKomaParts(id);
  });

  ipcMain.on('hasTrashedKomaParts_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    event.returnValue = ldb.hasTrashedKomaParts(id);
  });

  ipcMain.on('createFile_LocalDB', (event, arg) => {
    const dirName = arg['dirName'];
    const fileName = arg['fileName'];
    event.returnValue = LocalDBClient.createFile(dirName, fileName);
  });
/*
  ipcMain.on('replaceString_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const id = arg['komaID'];
    const keyword = arg['keyword'];
    const replace = arg['replace'];
    event.returnValue = ldb.replaceString(id, keyword, replace);
  });

  ipcMain.on('replaceAllString_LocalDB', (event, arg) => {
    const ldb = new LocalDBClient(arg['path']);
    const keyword = arg['keyword'];
    const replace = arg['replace'];
    event.returnValue = ldb.replaceAllString(keyword, replace);
  });
*/
}

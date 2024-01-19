// LocaDBClientIPCなど他のIPCと異なりipcMainはmain/index.tsおよび各レンダラープロセスにて記述している

import { ipcRenderer } from 'electron';

// window.ipc.* の宣言(なくても動くがTypeScriptで警告がでる対策)
export interface AppWindowAPI {
  quit: () => void;

  // openAACanvasSTEPX AACanvasウィンドウを開くための迂遠な仕掛け
  //   openAACanvasSTEP1: (MainIndex -> メインプロセス) MainIndexからKoma/KomaPartを送信。 メインプロセスでAACanvasウィンドウを作成・起動する。
  //   openAACanvasSTEP2: (メインプロセス -> AACanvas) メインプロセスでKoma/KomaPartを送信。 AACanvasにてKoma/KomaPartを受信、表示する。
  openAACanvasSTEP1: (dic: { path: string; strKoma: string }) => void;
  openAACanvasSTEP2: (callback) => void;

  // closeAACanvasSTEPX AACanvasウィンドウを閉じてMainIndexに反映するための迂遠な仕掛け
  //   closeAACanvasSTEP1: (AACanvas -> メインプロセス) AACanvasから反映すべきKomaを送信。メインプロセスでAACanvasウィンドウを閉じる。
  //   closeAACanvasSTEP2: (メインプロセス -> MainIndex) メインプロセスからKomaを送信。MainIndexでkomaを受信、表示する。
  closeAACanvasSTEP1: (dic: { path: string; strKoma: string }) => void;
  closeAACanvasSTEP2: (callback) => void;

  // openMLSelector MLTファイルを表示し、AAを選択する仕掛け
  //   openMLSelector: (MainIndex -> メインプロセス) メインプロセスでMLTSelectorウィンドウを作成・起動する。
  //   closeMLTSelectorSTEP1: (MLTSelector -> メインプロセス) MLTSelectorからAAを送信。メインプロセスでMLTSelectorウィンドウを閉じる。
  //   closeMLTSelectorSTEP2: (メインプロセス -> AACanvas) メインプロセスからAAを送信。 AACanvasでAAを受信、表示する。
  openMLTSelector: () => void;
  closeMLTSelectorSTEP1: (aa: string) => void;
  closeMLTSelectorSTEP2: (callback) => void;

  // openTextEditor
  openTextEditorSTEP1: (dic: { path: string; strKomaPart: string }) => void;
  openTextEditorSTEP2: (callback) => void;

  // save / cloeTextEditor
  saveTextEditorSTEP1: (dic: { path: string; strKomaPart: string }) => void;
  saveTextEditorSTEP2: (callback) => void;
  closeTextEditorSTEP1: () => void;
  closeTextEditorSTEP2: (callback) => void;
}

declare global {
  interface Window {
    appWindow: AppWindowAPI;
  }
}

//prettier-ignore
export const appWindowAPI = {
  quit: () => ipcRenderer.send('quit_appWindowAPI'),

  openAACanvasSTEP1:(dic: { path: string; strKoma: string }) => ipcRenderer.send('openAACanvasSTEP1_appWindowAPI', dic),
  openAACanvasSTEP2:(callback) => ipcRenderer.on('openAACanvasSTEP2_appWindowAPI', callback),

  closeAACanvasSTEP1:(dic: { path: string; strKoma: string }) => ipcRenderer.send('closeAACanvasSTEP1_appWindowAPI', dic),
  closeAACanvasSTEP2:(callback) => ipcRenderer.on('closeAACanvasSTEP2_appWindowAPI', callback),

  openMLTSelector:() => ipcRenderer.send('openMLTSelector_appWindowAPI'),
  closeMLTSelectorSTEP1:(aa: string) => ipcRenderer.send('closeMLTSelectorSTEP1_appWindowAPI', aa),
  closeMLTSelectorSTEP2:(callback) => ipcRenderer.on('closeMLTSelectorSTEP2_appWindowAPI', callback),

  openTextEditorSTEP1:(dic: { path: string; strKomaPart: string }) => ipcRenderer.send('openTextEditorSTEP1_appWindowAPI', dic),
  openTextEditorSTEP2:(callback) => ipcRenderer.on('openTextEditorSTEP2_appWindowAPI', callback),

  saveTextEditorSTEP1:(dic: { path: string; strKomaPart: string, strSplitKomaPart: string }) => ipcRenderer.send('saveTextEditorSTEP1_appWindowAPI', dic),
  saveTextEditorSTEP2:(callback) => ipcRenderer.on('saveTextEditorSTEP2_appWindowAPI', callback),

  closeTextEditorSTEP1:() => ipcRenderer.send('closeTextEditorSTEP1_appWindowAPI'),
  closeTextEditorSTEP2:(callback) => ipcRenderer.on('closeTextEditorSTEP2_appWindowAPI', callback)
};

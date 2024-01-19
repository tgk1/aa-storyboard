/*

 * ウィウンドウのメニューバーから実行する場合、
   メインプロセスのメニューからレンダラープロセスへIPCを使う。
   そのためのxontextBridge登録している。

 * 実際のipcRenderの機能は各comonentのvue内のonMounted内に記述している。

 */

import { NavType } from '@/data/model/NavType';
import { IpcRendererEvent, ipcRenderer } from 'electron';

export interface MenuAPI {
  save: () => void;
  closeTab: () => void;
  switchTabMode: () => void;
  selectTab: (isPrev: boolean) => void;
  switchListMode: () => void;
  scrollToEdge: (toTop: boolean) => void;
  fontSize: (increase: boolean) => void;
  selectNav: (navType: NavType) => void;
  visibleButtons: () => void;
  visibleKomaPartsList: () => void;

  addKoma: () => void;
  addKomaPart_AA: () => void;
  addKomaPart_Editor: () => void;
  addKomaPart_Mini: () => void;

  createFrame: () => void;
  splitKomaPart: () => void;
  DeleteCharacters: (leftSide: boolean) => void;
}

declare global {
  interface Window {
    menu: MenuAPI;
  }
}

export const menuAPI = {
  save: (callback) => ipcRenderer.on('Save', callback),
  closeTab: (callback) => ipcRenderer.on('CloseTab', callback),
  closeWindow: (callback) => ipcRenderer.on('CloseWindow', callback),
  switchTabMode: (callback) => ipcRenderer.on('SwitchTabMode', callback),
  selectTab: (listener: (isPrev: boolean) => void) =>
    ipcRenderer.on('SelectTab', (_ev: IpcRendererEvent, isPrev: boolean) => listener(isPrev)),
  switchListMode: (callback) => ipcRenderer.on('SwitchListMode', callback),
  scrollToEdge: (listener: (isPrev: boolean) => void) =>
    ipcRenderer.on('ScrollToEdge', (_ev: IpcRendererEvent, toTop: boolean) => listener(toTop)),
  fontSize: (listener: (increase: boolean) => void) =>
    ipcRenderer.on('FontSize', (_ev: IpcRendererEvent, increase: boolean) => listener(increase)),
  selectNav: (listener: (navType: NavType) => void) =>
    ipcRenderer.on('SelectNav', (_ev: IpcRendererEvent, navType: NavType) => listener(navType)),
  visibleButtons: (callback) => ipcRenderer.on('VisibleButtons', callback),
  visibleKomaPartsList: (callback) => ipcRenderer.on('VisibleKomaPartsList', callback),

  addKoma: (callback) => ipcRenderer.on('AddKoma', callback),
  addKomaPart_AA: (callback) => ipcRenderer.on('AddKomaPart_AA', callback),
  addKomaPart_Editor: (callback) => ipcRenderer.on('AddKomaPart_Editor', callback),
  addKomaPart_Mini: (callback) => ipcRenderer.on('AddKomaPart_Mini', callback),

  createFrame: (callback) => ipcRenderer.on('CreateFrame', callback),
  splitKomaPart: (callback) => ipcRenderer.on('SplitKomaPart', callback),
  deleteCharacters: (listener: (leftSide: boolean) => void) =>
    ipcRenderer.on('DeleteCharacters', (_ev: IpcRendererEvent, leftSide: boolean) => listener(leftSide))
};

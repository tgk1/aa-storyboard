import { app, nativeTheme } from 'electron';
import Store from 'electron-store';
import path from 'path';
import fs from 'fs';
import { Menu } from 'electron';

import { Theme } from '@model/Theme';
import { AppActivity } from '../model';

/*
本来は他の設定値保存(StoreConfig*)と同じにしたいのだが、
nodeAPI electronAPIを使用するためレンダラープロセスでは使用できない。
そのため下記のメインプロセス用クラスと AppConfigIPCクラスを作成した。
*/

export interface AppConfigParam {
  AppName: string;
  PathUserData: string;
  PathLocalFolderDB: string;
  PathLocalFolderMLT: string;
  Win32FsBug: boolean;
  Theme: Theme;
  Window: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class AppConfig {
  static store() {
    return new Store();
  }

  // 専用情報取得
  //
  static getPathUserData() {
    return app.getPath('userData');
  }
  static getPathDocuments() {
    return app.getPath('documents');
  }
  static appName() {
    return app.getName() + ' v' + app.getVersion();
  }
  static getReplicaFolder(): string {
    const cnf = this.get();
    const dir1 = path.join(cnf.PathLocalFolderDB);
    const dir2 = path.join(dir1, 'aa-storyboard', 'replica');
    return dir2;
  }
  static getAAListTxtPath(): string {
    const cnf = this.get();
    const dir1 = path.join(cnf.PathLocalFolderDB);
    const dir2 = path.join(dir1, 'aa-storyboard', 'aalist.txt');
    return dir2;
  }
  static getCurrentFile(): string {
    return this.store().get('currentFile') as string;
  }
  static setCurrentFile(file: string) {
    this.store().set('currentFile', file);
  }

  // テーマ
  //
  static isDarkTheme(): boolean {
    const theme = this.get().Theme;
    if (theme == Theme.System) {
      return nativeTheme.shouldUseDarkColors;
    } else {
      return theme == Theme.Dark;
    }
  }
  static applyTheme(theme: Theme) {
    switch (theme) {
      case Theme.Light:
        nativeTheme.themeSource = 'light';
        break;
      case Theme.Dark:
        nativeTheme.themeSource = 'dark';
        break;
      default:
        nativeTheme.themeSource = 'system';
        break;
    }
  }

  //window別
  //
  static get(): AppConfigParam {
    const cnf = this.store().get('AppConfig') as AppConfigParam;
    if (cnf && cnf['AppName']) {
      cnf.AppName = this.appName();
    }
    return cnf;
  }
  static set(val: AppConfigParam) {
    this.store().set('AppConfig', val);
  }

  // 初期設定
  static initData() {
    const default_path = app.getPath('documents');

    const cnfparam = this.get();
    if (cnfparam == null) {
      const cnf: AppConfigParam = {
        AppName: 'AAストーリーボード',
        PathUserData: default_path,
        PathLocalFolderDB: default_path,
        PathLocalFolderMLT: default_path,
        Win32FsBug: false,
        Theme: Theme.System,
        Window: {
          x: 100,
          y: 100,
          width: 1000,
          height: 800
        }
      };
      this.set(cnf);
    }
    this.mkAppDir();
  }

  static mkAppDir() {
    const dir1 = path.join(this.get().PathLocalFolderDB, 'aa-storyboard');
    const dir2 = path.join(dir1, 'replica');
    if (!fs.existsSync(dir1)) {
      fs.mkdirSync(dir1);
    }
    if (!fs.existsSync(dir2)) {
      fs.mkdirSync(dir2);
    }
  }

  static setExportMenu(act: AppActivity, file: string) {
    const menu = Menu.getApplicationMenu();
    if (menu == null) return;

    const item = menu.getMenuItemById('Export');
    if (item == null) return;

    item.enabled = act == AppActivity.MainIndex && file.match(/\.db/i) != null;
  }
}

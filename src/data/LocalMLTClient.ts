import fs from 'fs';
import path from 'path';

import { AppConfig } from '@/data/config/AppConfig';
import { ItemList, Item, ItemType, ItemOrder, ItemSort } from '@model/Item';
import { KomaList, YBBSFile } from '@model/Koma';
import { AAListTxt } from '@model/AAListTxt';
import { String2x } from '@/char/String2x';

export class LocalMLTClient {
  win32fsBugOn = AppConfig.get().Win32FsBug;
  rootMLT = AppConfig.get().PathLocalFolderMLT;
  rootDB = AppConfig.get().PathLocalFolderDB;

  public get(item: Item): ItemList {
    if (item.url == '') {
      if (item.type == ItemType.LocalFolderMLT) {
        item.url = this.rootMLT;
      } else {
        item.url = this.rootDB;
      }
    }
    const list = this.readDirRecursive(item);
    return this.sort(list);
  }

  private readDirRecursive(base: Item): ItemList {
    const list = new ItemList();
    list.base = base;

    const files = fs.readdirSync(base.url, { withFileTypes: true });

    const pathsplit = base.url.split(path.sep);
    let parent_name = pathsplit[pathsplit.length - 1];
    parent_name = parent_name.length > 1 ? parent_name : '';

    const filterWord = new RegExp(base.search, 'i');
    let filterExt: RegExp;
    let ftype = ItemType.LocalDB;
    if (base.type == ItemType.LocalFolderDB) {
      filterExt = new RegExp('\\.db', 'i');
      ftype = ItemType.LocalDB;
    } else {
      filterExt = new RegExp('\\.(ast|mlt)', 'i');
      ftype = ItemType.LocalMLT;
    }

    for (const file of files) {
      // ファイル
      if (file.name.match(/^\./)) continue;
      if (file.isFile() || this.isWin32NetworkDriveFile(file.name, filterExt)) {
        if (base.search != '') {
          if (!file.name.match(filterWord) && !base.url.match(filterWord)) continue;
        }
        if (!file.name.match(filterExt)) continue;

        const item = new Item(ftype);
        item.name = file.name.replace(/\.(ast|mlt|db)$/i, '');
        item.parent_name = parent_name;
        item.url = path.join(base.url, file.name);
        item.hukutemp_path = 'local:' + base.url;
        const stat = fs.statSync(item.url);
        item.size = stat.size;
        item.update_date = new Date(stat.mtime);

        list.items.push(item);
      } else {
        // ディレクトリ
        if (this.isWin32NetworkDriveDir(file.name)) continue;

        if (base.search == '') {
          // 非検索モードでは該当ディレクトリのみを捜査する
          const item = new Item(base.type);
          item.name = file.name;
          item.parent_name = parent_name;
          item.url = path.join(base.url, file.name);
          const stat = fs.statSync(item.url);
          item.update_date = new Date(stat.mtime);

          list.items.push(item);
        } else {
          // 検索モードでは該当ディレクトリの子ディレクトリも再帰捜査する
          const item = new Item(base.type);
          item.name = file.name;
          item.parent_name = parent_name;
          item.search = base.search;
          item.url = path.join(base.url, file.name);

          const childList = this.readDirRecursive(item);
          for (const i of childList.items) {
            list.items.push(i);
          }
        }
      }
    }
    return list;
  }

  private sort(list: ItemList): ItemList {
    if (list.base.sort == ItemSort.UpdateDate) {
      if (list.base.order == ItemOrder.ASC) {
        list.items.sort(function (a, b) {
          if (a.update_date < b.update_date) return -1;
          if (a.update_date > b.update_date) return 1;
          return 0;
        });
      } else {
        list.items.sort(function (a, b) {
          if (a.update_date > b.update_date) return -1;
          if (a.update_date < b.update_date) return 1;
          return 0;
        });
      }
    } else {
      if (list.base.order == ItemOrder.ASC) {
        list.items.sort(function (a, b) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
      } else {
        list.items.sort(function (a, b) {
          if (a.name > b.name) return -1;
          if (a.name < b.name) return 1;
          return 0;
        });
      }
    }
    return list;
  }

  public getParent(oitem: Item): Item {
    let item = new Item(ItemType.WebFolderMLT);
    switch (oitem.type) {
      case ItemType.WebMLT:
      case ItemType.WebFolderMLT:
        item = new Item(ItemType.WebFolderMLT);
        item.web_id = oitem.parent_web_id;
        return item;
      case ItemType.LocalDB:
      case ItemType.LocalFolderDB:
        item = new Item(ItemType.LocalFolderDB);
        item.url = path.dirname(oitem.url);
        item.name = this.getParentName(oitem);
        return item;
      case ItemType.LocalMLT:
      case ItemType.LocalFolderMLT:
        item = new Item(ItemType.LocalFolderMLT);
        item.url = path.dirname(oitem.url);
        item.name = this.getParentName(oitem);
        return item;
      case ItemType.ReplicaMLT:
        if (oitem.original_url.match(/https:/)) {
          item = new Item(ItemType.WebFolderMLT);
          item.web_id = oitem.parent_web_id;
          return item;
        } else {
          item = new Item(ItemType.LocalFolderMLT);
          item.url = path.dirname(oitem.original_url);
          item.name = this.getParentName(oitem);
          return item;
        }
      default:
        console.log('NO IMPLIMENT!');
    }
    return item;
  }
  private getParentName(item: Item): string {
    const pathsplit = item.url.split(path.sep);
    return pathsplit[pathsplit.length - 2];
  }

  // File converter
  //
  public ast(item: Item): KomaList {
    const buffer = fs.readFileSync(item.url);
    const text = String2x.decode(buffer, 'Windows-31j');
    return String2x.ast2komaList(text, item);
  }

  public mlt(item: Item): KomaList {
    const buffer = fs.readFileSync(item.url);
    const text = String2x.decode(buffer, 'Windows-31j');
    if (item.url.match(/\.ast/i)) {
      return String2x.ast2komaList(text, item);
    } else {
      return String2x.mlt2komaList(text, item);
    }
  }

  public ybbs(item: Item) {
    const buffer = fs.readFileSync(item.url, 'utf-8');
    const dat: YBBSFile = String2x.ybbsFile(buffer);
    return dat;
  }

  public aalisttxt2(): string {
    const path = AppConfig.getAAListTxtPath();
    if (fs.existsSync(path)) {
      const buffer = fs.readFileSync(path);
      const text = String2x.decode(buffer, 'Windows-31j');
      return text;
    }
    return '';
  }

  public aalisttxt(): AAListTxt {
    const path = AppConfig.getAAListTxtPath();
    if (fs.existsSync(path)) {
      const buffer = fs.readFileSync(path);
      const text = String2x.decode(buffer, 'Windows-31j');
      return String2x.txt2aalist(text);
    }
    return new AAListTxt();
  }

  // 2020-08-11 @yuzumikan さんから連絡
  // ある Windowsではネットワークドライブ越しのファイルをisFileで判定するとfalseになる。
  // その対策
  private isWin32NetworkDriveFile(path: string, regex: RegExp): boolean {
    if (!this.win32fsBugOn) return false;

    if (process.platform === 'win32') {
      if (path.match(regex)) {
        return true;
      }
    }
    return false;
  }
  private isWin32NetworkDriveDir(path: string): boolean {
    if (!this.win32fsBugOn) return false;

    const regex = new RegExp('\\.\\w+$', 'i');
    if (process.platform === 'win32') {
      if (path.match(regex)) {
        return true;
      }
    }
    return false;
  }
}

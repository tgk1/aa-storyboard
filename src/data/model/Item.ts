export class ItemList {
  base: Item;
  error: Error | null;
  items: Item[];

  constructor() {
    this.base = new Item(ItemType.AppStart);
    this.items = [];
    this.error = null;
  }

  formatItems() {
    if (this.base.type == ItemType.RecentFolder) {
      for (let _j = 0; _j < this.items.length; _j++) {
        const item = this.items[_j];
        item.setFormatRecent(this.base.sort);
      }
    } else if (this.base.type == ItemType.ReplicaFolder) {
      for (let _k = 0; _k < this.items.length; _k++) {
        const item = this.items[_k];
        item.setFormatReplica();
      }
    } else {
      for (let _i = 0; _i < this.items.length; _i++) {
        const item = this.items[_i];
        item.setFormatNormal();
      }
    }
  }
}

export class Item {
  web_id: number; // webmlt用ID ローカルMLTでは使用しない。
  name: string;
  url: string; // sqlteでの unique指定はこれ。これは常にユニークになるようにすること。
  hukutemp_path: string; // HukuTemp用の階層
  type: ItemType;
  size: number;
  update_date: Date;
  access_date: Date;
  use_date: Date;

  parent_web_id: number;
  parent_name: string;

  sort: ItemSort;
  order: ItemOrder;
  search: string;

  //表示用パラメータ
  mark: number;
  scroll: number;
  line1: string; //表示用 親フォルダとかファイルサイズとか
  line2: string; //表示用 親フォルダとかファイルサイズとか
  line3: string; //表示用 親フォルダとかファイルサイズとか

  // replicaMLTのときのみ使用する
  original_url: string;
  replica_name: string;

  constructor(type: ItemType) {
    this.web_id = 0;
    this.name = '';
    this.url = '';
    this.hukutemp_path = '';
    this.type = type;
    this.size = 0;
    this.update_date = new Date(0);
    this.use_date = new Date(0);
    this.access_date = new Date(0);
    this.parent_web_id = 0;
    this.parent_name = '';
    this.sort = ItemSort.Name;
    this.order = ItemOrder.ASC;
    this.search = '';
    this.mark = 0;
    this.scroll = 0;
    this.line1 = '';
    this.line2 = '';
    this.line3 = '';
    this.original_url = '';
    this.replica_name = '';

    if (type == ItemType.RecentFolder) {
      this.sort = ItemSort.AccessDate;
      this.order = ItemOrder.DESC;
    } else if (type == ItemType.MarkFolder) {
      this.mark = 1;
    } else if (type == ItemType.ReplicaFolder) {
      this.sort = ItemSort.Name;
      this.order = ItemOrder.DESC;
    }
  }

  hasParent(): boolean {
    return this.parent_name != '';
  }

  isFile(): boolean {
    return (
      this.type == ItemType.WebMLT ||
      this.type == ItemType.LocalMLT ||
      this.type == ItemType.LocalDB ||
      this.type == ItemType.ReplicaMLT
    );
  }

  isDir(): boolean {
    return (
      this.type == ItemType.WebFolderMLT || this.type == ItemType.LocalFolderDB || this.type == ItemType.LocalFolderMLT
    );
  }

  isDirType(): boolean {
    return (
      this.type == ItemType.WebMLT ||
      this.type == ItemType.LocalMLT ||
      this.type == ItemType.LocalDB ||
      this.type == ItemType.WebFolderMLT ||
      this.type == ItemType.LocalFolderMLT ||
      this.type == ItemType.LocalFolderDB
    );
  }

  setFormatNormal() {
    //const log = require('electron-log');
    //log.info(this.name );
    let date;
    switch (this.sort) {
      case ItemSort.AccessDate:
        date = this.access_date;
        break;
      case ItemSort.UseDate:
        date = this.use_date;
        break;
      default:
        date = this.update_date;
    }
    this.line2 = fdate(date);
    if (this.isFile()) {
      this.line2 = this.line2 + ' ' + convertByteSize(this.size);
    }
    if (this.parent_name != '') {
      this.line1 = this.parent_name;
    }
  }

  setFormatRecent(sort: ItemSort) {
    const date2 = this.update_date;
    this.line2 = fdate(date2);
    if (this.isFile()) {
      this.line2 = this.line2 + ' ' + convertByteSize(this.size);
    }
    if (this.parent_name != '') {
      this.line1 = this.parent_name;
    }

    let date3;
    let name = '';
    switch (sort) {
      case ItemSort.UseDate:
        date3 = this.use_date;
        name = 'コピペ日時';
        break;
      default:
        date3 = this.access_date;
        name = 'アクセス日時';
    }
    this.line3 = fdate(date3);
    if (this.isFile()) {
      this.line3 = this.line3 + ' ' + name;
    }
  }

  setFormatReplica() {
    const date = this.update_date;

    this.line2 = fdate(date);
    if (this.parent_name != '') {
      this.line1 = this.parent_name;
    }
  }
}

//prettier-ignore
export enum ItemType {
  WebMLT         = 'WebMLT',
  WebFolderMLT   = 'WebFolderMLT',
  LocalMLT       = 'LocalMLT',
  LocalFolderMLT = 'LocalFolderMLT',
  LocalDB        = 'LocalDB',
  LocalFolderDB  = 'LocalFolderDB',
  MarkFolder     = 'MarkFolder',
  RecentFolder   = 'RecentFolder',
  ReplicaMLT     = 'ReplicaMLT',
  ReplicaFolder  = 'ReplicaFolder',
  AppStart       = 'AppStart'
}

export enum ItemOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum ItemSort {
  Name = 'Name',
  UpdateDate = 'UpdateDate',
  AccessDate = 'AccessDate',
  UseDate = 'UseDate'
}

//
// 日付などの情報についての書式
//
function fdate(date: Date) {
  // eslint-disable-next-line prettier/prettier
  return (
    date.getFullYear() +
    '/' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    date.getDate().toString().padStart(2, '0') +
    ' ' +
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0') +
    ':' +
    date.getSeconds().toString().padStart(2, '0')
  );
}

function convertByteSize(size: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  let ext = sizes[0];
  if (typeof size === 'number') {
    for (let i = 1; i < sizes.length; i += 1) {
      if (size >= 1024) {
        size = size / 1024;
        ext = sizes[i];
      }
    }
  }
  return round(size, 2) + ext;
}

function round(number: number, precision: number) {
  const shift = function (number: number, precision: number, reverseShift: boolean) {
    if (reverseShift) {
      precision = -precision;
    }
    const numArray = ('' + number).split('e');
    return +(numArray[0] + 'e' + (numArray[1] ? numArray[1] + precision : precision));
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

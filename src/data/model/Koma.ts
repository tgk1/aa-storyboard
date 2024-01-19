import { Item } from './Item';

export class KomaList {
  base: Item;
  komas: Koma[];
  sections: Section[];
  error: Error | null;

  constructor(base: Item) {
    this.base = base;
    this.komas = [];
    this.sections = [];
    this.error = null;
  }
}

export class Koma {
  id: number;
  parent_id: number;
  data: string; // 元データ コピペするときはこっち
  html: string; // "<" と ">" は&gt; &lt; に変更したもの + 改行<br>
  order_num: number; // 並び順
  label_num: number; // 表示番号 komasでkomaの並び順を変更するので独立して存在する。
  del: number;

  constructor(id = 0, parent_id = 0, data = '', html = '', order_num = 0, label_num = 0, del = 0) {
    this.id = id;
    this.parent_id = parent_id;
    this.html = html;
    this.data = data;
    this.order_num = order_num;
    this.label_num = label_num;
    this.del = del;
  }
}

export class Section {
  id: number;
  name: string;

  constructor() {
    this.id = 0;
    this.name = '';
  }
}

export class KomaPart {
  id: number;
  parent_id: number;
  name: string;
  data: string;
  html: string;
  x: number;
  y: number;
  order_num: number;
  mode: number; // マージ方式 0: 空白非透過TXT   2: 左右の空白透過AA
  del: number;

  constructor(id = 0, parent_id = 0, name = '', data = '', html = '', x = 0, y = 0, order_num = 0, mode = 2, del = 0) {
    this.id = id;
    this.parent_id = parent_id;
    this.name = name;
    this.data = data;
    this.html = html;
    this.x = x;
    this.y = y;
    this.order_num = order_num;
    this.mode = mode;
    this.del = del;
  }
}
export interface StringKeyObject {
  [key: number]: boolean;
}

export class YBBSFile {
  ybbsKomas: YBBSFileData[];
  constructor() {
    this.ybbsKomas = [];
  }
}

export interface YBBSFileData {
  koma: Koma;
  komaParts: KomaPart[];
}

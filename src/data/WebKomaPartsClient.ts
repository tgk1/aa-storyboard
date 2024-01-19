/*
 * LocalDBClient(SQLite)を使用しないでKomaPartデータを操作する。
 * 通常は使用しない。ウェブで公開するアプリお試し版のためにある。
 */
import { KomaPart } from '@model/Koma';

export class WebKomaPartsClient {
  db: Array<KomaPart> = [];
  parentID = 0;

  constructor(komaID: number, kparts: Array<KomaPart>) {
    this.parentID = komaID;
    this.db = kparts;
  }

  //
  // KomaPart
  //

  // ツールバーの新規作成で使用する 座標が自動作成される
  addKomaPart(): Array<KomaPart> {
    const kpart = new KomaPart();
    const num = this.getMaxNum() + 1;
    kpart.id = num;
    kpart.parent_id = this.parentID;
    kpart.name = 'AA' + num;
    kpart.x = 3 + kpart.x + (kpart.id % 10);
    kpart.y = 3 + kpart.y + (kpart.id % 10);
    kpart.order_num = kpart.id;
    this.db.push(kpart);
    return this.db;
  }

  // addKomaPartと違うのは座標を保存すること TextEditorのsplitで使用する
  addKomaPart2(kpart: KomaPart): Array<KomaPart> {
    kpart.id = this.db.length;
    kpart.parent_id = this.parentID;
    kpart.name = 'AA' + (this.getMaxNum() + 1);
    kpart.order_num = kpart.id;
    this.db.push(kpart);
    return this.db;
  }

  addKomaPartMerge(kpart: KomaPart): Array<KomaPart> {
    kpart.id = this.db.length;
    kpart.parent_id = this.parentID;
    kpart.name = 'AA' + (this.getMaxNum() + 1);
    kpart.order_num = kpart.id;
    this.db.push(kpart);
    return this.db;
  }

  duplicateKomaPart(kpart: KomaPart): Array<KomaPart> {
    const kp = new KomaPart();
    kp.id = this.db.length;
    kp.parent_id = this.parentID;
    kp.name = 'AA' + (this.getMaxNum() + 1);
    kp.data = kpart.data;
    kp.html = kpart.html;
    kp.x = kpart.x + 1;
    kp.y = kpart.y + 1;
    kp.order_num = kpart.order_num + 1;
    this.db.push(kp);
    return this.db;
  }

  setKomaPart(kpart: KomaPart): Array<KomaPart> {
    for (const [index, kp] of this.db.entries()) {
      if (kp.id == kpart.id) {
        this.db[index] = kpart;
        break;
      }
    }
    return this.db;
  }

  setKomaPartMode(kpart: KomaPart): Array<KomaPart> {
    for (const [index, kp] of this.db.entries()) {
      if (kp.id == kpart.id) {
        this.db[index].mode = kpart.mode;
        break;
      }
    }
    return this.db;
  }

  trashKomaPart(kpart: KomaPart): Array<KomaPart> {
    let cnt = 0;
    let idx = 0;
    for (const [index, kp] of this.db.entries()) {
      cnt = cnt + (kp.del > 10 ? 1 : 0);
      if (kp.id == kpart.id) {
        idx = index;
      }
    }

    this.db[idx].del = 10 + (cnt + 1); //結合するKomaPartはdelを10以上にする undoのために連番。
    return this.db;
  }

  trashMergeKomaParts(): Array<KomaPart> {
    for (const [index, kp] of this.db.entries()) {
      if (kp.del == 0) {
        this.db[index].del = 1; //結合するKomaPartはdelを1とする
      }
    }
    return this.db;
  }

  undoTrashKomaPart(): Array<KomaPart> {
    let max_cnt = 0;
    let idx = 0;
    for (const [index, kp] of this.db.entries()) {
      if (kp.del > 10 && kp.del > max_cnt) {
        idx = index;
        max_cnt = kp.del;
      }
    }
    if (max_cnt > 10) {
      this.db[idx].del = 0;
    }
    return this.db;
  }

  undoMergeKomaParts(): Array<KomaPart> {
    for (const [index, kp] of this.db.entries()) {
      if (kp.del == 0) {
        this.db[index].del = -9;
      }
    }

    for (const [index, kp] of this.db.entries()) {
      if (kp.del == 1) {
        this.db[index].del = 0;
      }
    }

    for (const [index, kp] of this.db.entries()) {
      if (kp.del == -9) {
        this.db.splice(index, 1);
      }
    }
    return this.db;
  }

  deleteOldMergeKomaParts(): Array<KomaPart> {
    this.db = this.db.filter(function (v) {
      return v.del != 1;
    });
    return this.db;
  }

  mergeKomaParts(kpart: KomaPart): Array<KomaPart> {
    kpart.parent_id = this.parentID;
    this.deleteOldMergeKomaParts();
    this.trashMergeKomaParts();
    this.addKomaPartMerge(kpart);
    return this.db;
  }

  pasteKomaParts(id: number, kparts: Array<KomaPart>) {
    for (const kpart of kparts) {
      kpart.parent_id = id;
      this.duplicateKomaPart(kpart);
    }
  }

  //
  //
  //
  getNewKomaPart(): KomaPart | undefined {
    return this.db.at(-1);
  }

  getKomaParts(): Array<KomaPart> {
    /*
    const komaParts: KomaPart[] = [];
    for (const kp of this.db) {
      komaParts.push(kp);
    }
    return komaParts;
    */
    return this.db;
  }

  getViewKomaParts(): Array<KomaPart> {
    const liveKomaParts: KomaPart[] = [];
    for (const kp of this.db) {
      if (kp.del == 0) {
        liveKomaParts.push(kp);
      }
    }

    const sortedArray: KomaPart[] = liveKomaParts.sort((n1, n2) => {
      if (n1.order_num < n2.order_num) {
        return 1;
      }
      if (n1.order_num > n2.order_num) {
        return -1;
      }
      return 0;
    });

    return sortedArray;
  }

  getMaxNum(): number {
    let maxNum = 0;
    const reg = /(\d+)/;
    for (const kp of this.db) {
      const result = kp.name.match(reg);
      if (result) {
        const num = parseInt(result[0]);
        if (num > maxNum) maxNum = num;
      }
    }
    return maxNum;
  }

  hasMergeDeletedKomaParts(): boolean {
    for (const kp of this.db) {
      if (kp.del == 1) {
        return true;
      }
    }
    return false;
  }

  hasTrashDeletedKomaParts(): boolean {
    for (const kp of this.db) {
      if (kp.del > 10) {
        return true;
      }
    }
    return false;
  }

  clearKomaParts(): Array<KomaPart> {
    this.db = [];
    return [];
  }

  // [注意]
  // Komaのorder_numは大きい方が下に表示される レス番としての位置付け
  // KomaPartのorder_numは大きい方が上位に表示され、優先度が高くなる、z-indexの重み付け
  public sortKomaPart(id: number, oldOrderNum: number, newOrderNum: number): Array<KomaPart> {
    const sortedArray: KomaPart[] = this.db.sort((n1, n2) => {
      if (n1.order_num < n2.order_num) {
        return 1;
      }
      if (n1.order_num > n2.order_num) {
        return -1;
      }
      return 0;
    });

    if (newOrderNum > oldOrderNum) {
      for (const kp of sortedArray) {
        if (kp.id == id) {
          kp.order_num = newOrderNum;
          this.setKomaPart(kp);
        } else if (kp.order_num <= newOrderNum) {
          kp.order_num -= 1;
          this.setKomaPart(kp);
        }
      }
    }
    if (newOrderNum < oldOrderNum) {
      for (const kp of sortedArray) {
        if (kp.id == id) {
          kp.order_num = newOrderNum;
          this.setKomaPart(kp);
        } else if (kp.order_num >= newOrderNum) {
          kp.order_num += 1;
          this.setKomaPart(kp);
        }
      }
    }
    return this.db;
  }
}

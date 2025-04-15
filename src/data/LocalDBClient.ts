import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import he from 'he';
import log from 'electron-log';

import { Koma, KomaList, KomaPart } from '@model/Koma';
import { ItemType, Item } from '@model/Item';
import { String2x } from '@/char/String2x';

export class LocalDBClient {
  DB_VERSION = 2;
  db!: any;

  constructor(filePath: string) {
    this.db = new Database(filePath);

    // SQL DEBUG用
    if (process.env.NODE_ENV == 'development') {
      this.db = new Database(filePath, { verbose: log.info });
    }

    this.init();
  }

  public init() {
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS komas ' +
        '(' +
        ' id INTEGER PRIMARY KEY, data TEXT, order_num INTEGER, del INTEGER' +
        ')'
    );
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS koma_parts ' +
        '(' +
        ' id INTEGER PRIMARY KEY, parent_id INTEGER, ' +
        ' name TEXT, data TEXT, x INTEGER, y INTEGER, order_num INTEGER, ' +
        ' mode INTEGER, del INTEGER' +
        ')'
    );

    this.db.exec('CREATE TABLE IF NOT EXISTS versions ( name TEXT UNIQUE, version INTEGER )');

    const stmt = this.db.prepare('SELECT * FROM versions WHERE name = ? ');
    const row = stmt.get('db_version');
    if (!row || row.version != this.DB_VERSION) {
      const stmt2 = this.db.prepare(
        'INSERT INTO versions(name, version) values(?, ?) ON CONFLICT(name) DO UPDATE SET version = ?'
      );
      stmt2.run('db_version', this.DB_VERSION, this.DB_VERSION);
      if (row) {
        this.updateDatabase(row.version);
      }
    }
  }

  updateDatabase(version: number) {
    log.info('UPDATE DATABASE verion : ' + version);
    switch (version) {
      case 1:
        this.exec1to2();
    }
  }
  private exec1to2() {
    const stmt1 = this.db.prepare('ALTER TABLE komas ADD COLUMN del INTEGER');
    stmt1.run();
    const stmt2 = this.db.prepare('UPDATE komas SET del = 0 WHERE del IS NULL');
    stmt2.run();
  }

  //
  // Koma
  //
  public addKoma(koma: Koma): number {
    const stmt = this.db.prepare(
      'INSERT INTO komas(data, order_num, del) VALUES (?, ?, 0) ' +
        'ON CONFLICT(id) DO UPDATE SET ' +
        ' data = ?, order_num = ?, del = 0'
    );
    stmt.run(koma.data, koma.order_num, koma.data, koma.order_num);

    const stmt1 = this.db.prepare('SELECT last_insert_rowid() AS lastid');
    const row1 = stmt1.get();
    if (row1) {
      return row1.lastid;
    }
    return 0;
  }

  public insertKoma(order_num: number, koma: Koma): number {
    if (order_num == -1) {
      order_num = this.getKomaMaxSortNum();
    }
    koma.order_num = order_num + 0.5; // 順番の整列
    const id = this.addKoma(koma);
    this.reorderKomas();
    return id;
  }

  public pasteKoma(order_num: number, koma: Koma, kparts: KomaPart[]): number {
    const id = this.insertKoma(order_num, koma);

    for (const kpart of kparts) {
      kpart.parent_id = id;
      this.addKomaPart(kpart);
    }
    return id;
  }

  public setKoma(koma: Koma) {
    const stmt = this.db.prepare('UPDATE komas SET data = ?, order_num = ?, del = ? WHERE id = ?');
    stmt.run(koma.data, koma.order_num, koma.del, koma.id);
  }

  public getKoma(komaID: number): Koma {
    const stmt = this.db.prepare('SELECT * FROM komas WHERE id = ?');
    const row = stmt.get(komaID);

    const koma = new Koma();
    if (row) {
      koma.id = row.id;
      koma.data = row.data;
      koma.html = String2x.html(row.data);
      koma.order_num = row.order_num;
      koma.del = row.del;
      return koma;
    }
    return koma;
  }

  public getKomaList(): KomaList {
    const list = new KomaList(new Item(ItemType.LocalFolderDB));
    const stmt = this.db.prepare('SELECT * FROM komas WHERE del = 0 ORDER by order_num');
    const rows = stmt.all();
    let i = 1;
    for (const row of rows) {
      if (row) {
        const koma = new Koma();
        koma.id = row.id;
        koma.data = row.data ? row.data : '';
        koma.html = row.data ? String2x.html(row.data) : '';
        koma.order_num = row.order_num;
        koma.del = row.del;
        koma.label_num = i++;
        list.komas.push(koma);
      }
    }
    return list;
  }

  public trashKoma(komaID: number) {
    const stmt1 = this.db.prepare(
      'UPDATE komas SET del = (SELECT count(id) + 11 FROM komas WHERE del > 10) WHERE id = ?'
    );
    stmt1.run(komaID);
  }

  public undoTrashKoma(): number {
    const stmt = this.db.prepare('SELECT max(del) AS maxdel FROM komas WHERE del > 10');
    const rows = stmt.all();
    let max_del = -1;

    for (const row of rows) {
      if (row) {
        max_del = row.maxdel;
      }
    }
    if (max_del == -1) return 0;

    const stmt2 = this.db.prepare('SELECT id FROM komas WHERE del = ? ');
    const rows2 = stmt2.all(max_del);
    let komaID = 0;
    for (const row of rows2) {
      komaID = row.id;
    }

    const stmt3 = this.db.prepare('UPDATE komas SET del = 0 WHERE del = ? ');
    stmt3.run(max_del);

    return komaID;
  }

  public hasTrashedKomas(): boolean {
    const stmt1 = this.db.prepare('SELECT * FROM komas WHERE del > 0');
    const rows1 = stmt1.all();
    const stmt2 = this.db.prepare('SELECT * FROM koma_parts WHERE del > 10');
    const rows2 = stmt2.all();

    return rows1.length > 0 || rows2.length > 0;
  }

  public deleteTrashedKomas() {
    const stmt0 = this.db.prepare('SELECT * FROM komas WHERE del > 0');
    const stmt1 = this.db.prepare('DELETE FROM komas WHERE id = ?');
    const stmt2 = this.db.prepare('DELETE FROM koma_parts WHERE parent_id = ?');
    const stmt3 = this.db.prepare('DELETE FROM koma_parts WHERE del > 10');

    const rows = stmt0.all();
    for (const row of rows) {
      if (row) {
        stmt1.run(row.id);
        stmt2.run(row.id);
      }
    }
    stmt3.run();
  }

  public getKomaMaxSortNum(): number {
    const stmt = this.db.prepare('SELECT max(order_num) as max_num FROM komas');
    const row = stmt.get();
    if (row) {
      return row.max_num;
    }
    return 0;
  }

  public sortKomas(komaID: number, oldOrderNum: number, newOrderNum: number) {
    log.info('ID:' + komaID + ' oldSN:' + oldOrderNum + ' newSN:' + newOrderNum);

    const stmt2 = this.db.prepare('UPDATE komas SET order_num = ? WHERE id = ? ');

    if (newOrderNum > oldOrderNum) {
      const stmt1 = this.db.prepare(
        'SELECT * FROM komas WHERE order_num > ? AND order_num <= ? ORDER BY order_num ASC'
      );
      const rows = stmt1.all(oldOrderNum, newOrderNum);
      let j = true;
      let i = 0;
      for (const row of rows) {
        // 何かのはずみで重複したときのため必ず連番になるようにしている
        if (j) {
          j = false;
          i = row.order_num;
        }
        i -= 1;
        stmt2.run(i, row.id);
      }
      stmt2.run(newOrderNum, komaID);
    }

    if (newOrderNum < oldOrderNum) {
      const stmt1 = this.db.prepare(
        'SELECT * FROM komas WHERE  order_num >= ? AND order_num < ? ORDER BY order_num ASC'
      );
      const rows = stmt1.all(newOrderNum, oldOrderNum);
      let j = true;
      let i = 0;
      for (const row of rows) {
        // 何かのはずみで重複したときのため必ず連番になるようにしている
        if (j) {
          j = false;
          i = row.order_num;
        }
        i++;
        stmt2.run(i, row.id);
      }
      stmt2.run(newOrderNum, komaID);
    }
  }

  private reorderKomas() {
    const stmt1 = this.db.prepare('SELECT * FROM komas ORDER by order_num ASC');
    const stmt2 = this.db.prepare('UPDATE komas SET order_num = ? WHERE id = ?');
    const rows1 = stmt1.all();

    let i = 1;
    for (const row of rows1) {
      stmt2.run(i, row.id);
      i += 1;
    }
  }

  //
  // KomaPart
  //
  public addKomaPart(kpart: KomaPart): number {
    //kpart.order_num = this.getKomaPartMaxNum(kpart.parent_id) + 1;
    const stmt = this.db.prepare(
      'INSERT INTO koma_parts(parent_id, name, data, x, y, order_num, mode, del) VALUES (?,?,?,?,?, ?,?,?) ' + // 8
        'ON CONFLICT(id) DO UPDATE SET ' +
        ' parent_id = ?, name = ?, data = ?, x = ?, y = ?, order_num = ?, mode = ?, del = ?'
    );
    stmt.run(
      kpart.parent_id, kpart.name, kpart.data, kpart.x, kpart.y, kpart.order_num, kpart.mode, kpart.del,
      kpart.parent_id, kpart.name, kpart.data, kpart.x, kpart.y, kpart.order_num, kpart.mode, kpart.del
    );

    const stmt1 = this.db.prepare('SELECT last_insert_rowid() AS lastid');
    const row1 = stmt1.get();
    if (row1) {
      return row1.lastid;
    }
    return 0;
  }

  // insertKomaと同じ挙動をする
  public insertKomaPart(kpart: KomaPart): number {
    kpart.order_num = this.getKomaPartMaxSortNum(kpart.parent_id) + 1;
    kpart.name = 'AA' + kpart.order_num;
    return this.addKomaPart(kpart);
  }

  public duplicateKomaPart(kpart: KomaPart): number {
    const kp = new KomaPart();
    kp.parent_id = kpart.parent_id;
    kp.data = kpart.data;
    kp.html = kpart.html;
    kp.x = kpart.x + 1;
    kp.y = kpart.y + 1;
    return this.insertKomaPart(kp);
  }

  public addNewKomaPart(komaID: number): number {
    const order_num = this.getKomaPartMaxSortNum(komaID);
    const kp = new KomaPart();
    kp.parent_id = komaID;
    kp.x = 2 + (order_num % 10) * 2;
    kp.y = 2 + (order_num % 10) * 2;
    return this.insertKomaPart(kp);
  }

  public setKomaPart(kpart: KomaPart) {
    const stmt = this.db.prepare(
      'UPDATE koma_parts SET parent_id = ?, name = ?, data = ?, x = ?, y = ?, order_num = ?, mode = ?, del = ? WHERE id = ?'
    );
    stmt.run(
      kpart.parent_id, kpart.name, kpart.data, kpart.x, kpart.y, kpart.order_num, kpart.mode, kpart.del, kpart.id
    );
  }

  public getKomaPart(komaPartID: number): KomaPart {
    const stmt = this.db.prepare('SELECT * FROM koma_parts WHERE id = ?');
    const row = stmt.get(komaPartID);
    const kpart = new KomaPart();

    if (row) {
      kpart.id = row.id;
      kpart.parent_id = row.parent_id;
      kpart.name = row.name;
      kpart.data = he.decode(row.data); // ただしbeta 0.9.2以前での参照文字などがある場合がある
      kpart.html = String2x.html(row.data);
      kpart.x = row.x;
      kpart.y = row.y;
      kpart.order_num = row.order_num;
      kpart.mode = row.mode;
      kpart.del = row.del;
      return kpart;
    }
    return kpart;
  }

  public getKomaParts(komaID: number): KomaPart[] {
    const stmt = this.db.prepare('SELECT * FROM koma_parts WHERE parent_id = ? AND del = 0 ORDER by order_num DESC');
    const rows = stmt.all(komaID as number);
    const list: KomaPart[] = [];

    for (const row of rows) {
      if (row) {
        const kpart = new KomaPart();
        kpart.id = row.id;
        kpart.parent_id = row.parent_id;
        kpart.name = row.name;
        kpart.data = he.decode(row.data); // ただしbeta 0.9.2以前での参照文字などがある場合がある;
        kpart.html = String2x.html(row.data);
        kpart.x = row.x;
        kpart.y = row.y;
        kpart.order_num = row.order_num;
        kpart.mode = row.mode;
        kpart.del = row.del;
        list.push(kpart);
      }
    }
    return list;
  }

  public hasMergedKomaParts(komaID: number): boolean {
    const stmt = this.db.prepare('SELECT * FROM koma_parts WHERE parent_id = ? AND del = 1');
    const rows = stmt.all(komaID);

    return rows.length > 0;
  }

  public hasTrashedKomaParts(komaID: number): boolean {
    const stmt = this.db.prepare('SELECT * FROM koma_parts WHERE parent_id = ? AND del > 10');
    const rows = stmt.all(komaID);

    return rows.length > 0;
  }

  public undoMergeKomaParts(komaID: number) {
    const stmt1 = this.db.prepare('DELETE FROM koma_parts WHERE parent_id = ? AND del = 0 ');
    stmt1.run(komaID);
    const stmt2 = this.db.prepare('UPDATE koma_parts SET del = 0 WHERE parent_id = ? AND del = 1 ');
    stmt2.run(komaID);
  }

  public undoTrashKomaPart(komaID: number) {
    const stmt = this.db.prepare('SELECT max(del) as maxdel FROM koma_parts WHERE parent_id = ? AND del > 10');
    const rows = stmt.all(komaID);
    let max_del = -1;

    for (const row of rows) {
      if (row) {
        max_del = row.maxdel;
      }
    }
    if (max_del == -1) return;

    const stmt2 = this.db.prepare('UPDATE koma_parts SET del = 0 WHERE parent_id = ? AND del = ? ');
    stmt2.run(komaID, max_del);
  }

  private deleteOldKomaParts(komaID: number) {
    const stmt1 = this.db.prepare('DELETE FROM koma_parts WHERE parent_id = ? AND del = 1');
    stmt1.run(komaID);
  }

  private setDeleteFlagKomaPart(komaID: number) {
    const stmt1 = this.db.prepare('UPDATE koma_parts SET del = 1 WHERE parent_id = ? AND del = 0');
    stmt1.run(komaID);
  }

  public mergeKomaParts(koma: Koma, kpart: KomaPart) {
    this.deleteOldKomaParts(koma.id);
    this.setDeleteFlagKomaPart(koma.id);
    this.addKomaPart(kpart);
    this.setKoma(koma);
  }

  public trashKomaPart(kpart: KomaPart) {
    const stmt1 = this.db.prepare(
      'UPDATE koma_parts SET del = (SELECT count(id) + 11 FROM koma_parts WHERE del > 10 AND parent_id = ?) WHERE id = ?'
    );
    stmt1.run(kpart.parent_id, kpart.id);
  }

  /*
  private _trashKomaParts(komaID: number) {
    const komaParts = this.getKomaParts(komaID);
    for (const komaPart of komaParts) {
      if (komaPart.del > 0) continue;
      this.trashKomaPart(komaPart);
    }
  }

  private _deleteKomaPart(id: number) {
    const stmt1 = this.db.prepare('DELETE FROM koma_parts WHERE id = ?');
    stmt1.run(id);
  }
  */

  private getKomaPartMaxSortNum(id: number): number {
    const stmt = this.db.prepare('SELECT max(order_num) as max_num FROM koma_parts WHERE parent_id = ?');
    const row = stmt.get(id);
    if (row) {
      return row.max_num;
    }
    return 0;
  }

  // [memo]
  // Komaのorder_numは大きい方が下に表示される。レス番としての位置付け。
  // KomaPartのorder_numは大きい方が上位に表示され、優先度が高くなる。z-indexの重み付け。
  public sortKomaParts(parent_id: number, id: number, oldOrderNum: number, newOrderNum: number) {
    const stmt2 = this.db.prepare('UPDATE koma_parts SET order_num = ? WHERE id = ? ');

    if (newOrderNum > oldOrderNum) {
      const stmt1 = this.db.prepare(
        'SELECT * FROM koma_parts WHERE parent_id = ? AND order_num > ? AND order_num <= ? ORDER BY order_num ASC'
      );
      const rows = stmt1.all(parent_id, oldOrderNum, newOrderNum);
      for (const row of rows) {
        stmt2.run(row.order_num - 1, row.id);
      }
      stmt2.run(newOrderNum, id);
    }

    if (newOrderNum < oldOrderNum) {
      const stmt1 = this.db.prepare(
        'SELECT * FROM koma_parts WHERE parent_id = ? AND order_num >= ? AND order_num < ? ORDER BY order_num ASC'
      );
      const rows = stmt1.all(parent_id, newOrderNum, oldOrderNum);
      for (const row of rows) {
        stmt2.run(row.order_num + 1, row.id);
      }
      stmt2.run(newOrderNum, id);
    }

    this.reorderKomaParts(parent_id);
  }

  private reorderKomaParts(parent_id: number) {
    const stmt1 = this.db.prepare('SELECT * FROM koma_parts WHERE parent_id = ? ORDER by order_num ASC');
    const stmt2 = this.db.prepare('UPDATE koma_parts SET order_num = ? WHERE id = ?');
    const rows1 = stmt1.all(parent_id);

    let i = 1;
    for (const row of rows1) {
      stmt2.run(i, row.id);
      i += 1;
    }
  }

  // KomaPartClientと連携する
  public setKomaAndKomaParts(koma: Koma, kparts: KomaPart[]) {
    this.setKoma(koma);
    const stmt1 = this.db.prepare('DELETE FROM koma_parts WHERE parent_id = ? AND id = ?');

    // 新komaPartsにない場合は削除
    for (const oldKpart of this.getKomaParts(koma.id)) {
      let exists = false;
      for (const kpart of kparts) {
        if (oldKpart.id == kpart.id) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        stmt1.run(oldKpart.parent_id, oldKpart.id);
      }
    }

    // 旧komaPartsにない場合は新規追加
    for (const kpart of kparts) {
      let exists = false;
      for (const oldKpart of this.getKomaParts(koma.id)) {
        if (oldKpart.id == kpart.id) {
          exists = true;
          break;
        }
      }
      if (exists) {
        this.setKomaPart(kpart);
      } else {
        kpart.parent_id = koma.id;
        this.addKomaPart(kpart);
      }
    }
  }

  close() {
    this.db.close();
  }

  //
  // replica用
  // ユーザーディレクトリ以下に作成するレプリカ用フォルダ下のファイルを開き、Komaを保存する。
  public replicaKoma(koma: Koma, kparts: KomaPart[]) {
    if (!this.getKomaByAA(koma.data)) {
      this.pasteKoma(koma.order_num, koma, kparts);
    }
  }

  private getKomaByAA(aa: string): boolean {
    const stmt = this.db.prepare('SELECT * FROM komas WHERE data = ?');
    const row = stmt.get(aa);
    return row;
  }

  //
  // スレファイル作成
  //
  public static createFile(dirName: string, fileName: string): string {
    const filepath = path.join(dirName, fileName + '.db');
    if (fs.existsSync(filepath)) {
      return 'Error_FileExists';
    } else {
      try {
        const fdb = new LocalDBClient(filepath);
        fdb.close();
        return '';
      } catch (error) {
        return 'Error_CreateFailed';
      }
    }
  }
}

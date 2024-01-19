import { AppConfig } from '@/data/config/AppConfig';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import log from 'electron-log';

import { Item, ItemList, ItemType, ItemSort } from '@model/Item';
import { ItemUtil } from '@model/ItemUtil';

export class MarkDBClient {
  DB_VERSION = 2;
  db!: any;

  constructor() {
    const dbpath = AppConfig.getPathUserData();
    const file = path.join(dbpath, 'mark.db');
    console.log('DB PATH: ' + file);
    this.db = new Database(file);

    // SQL DEBUG用
    //if (process.env.NODE_ENV !== 'production') {
    //  this.db = new Database(file, { verbose: log.debug });
    //}
  }

  public init() {
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS marks ( ' +
        ' url TEXT PRIMARY KEY UNIQUE, web_id INTEGER, name TEXT, type text, size INTEGER, ' + // 5
        ' update_date INTEGER, access_date INTEGER, use_date INTEGER, ' + // 3
        ' parent_web_id INTEGER, parent_name TEXT, ' + // 2
        ' item_sort TEXT, item_order TEXT, item_search TEXT, ' + // 3
        ' mark INTEGER, scroll INTEGER ' + //2
        ' )'
    );

    this.db.exec(
      'CREATE TABLE IF NOT EXISTS replicas ( ' +
        ' mark_url TEXT PRIMARY KEY, replica_name TEXT, ' + // 2
        ' update_date INTEGER, scroll INTEGER ' + // 2
        ' )'
    );

    this.db.exec('CREATE TABLE IF NOT EXISTS versions ( name TEXT UNIQUE, version INTEGER )');

    const stmt = this.db.prepare('SELECT * FROM versions WHERE name = ? ');
    const row = stmt.get('db_version');
    if (!row || row.version != this.DB_VERSION) {
      const stmt2 = this.db.prepare('INSERT INTO versions values(?, ?) ON CONFLICT(name) DO UPDATE SET version = ?');
      stmt2.run('db_version', this.DB_VERSION, this.DB_VERSION);
      this.updateDatabase(this.DB_VERSION);
    }
  }

  updateDatabase(version: number) {
    switch (version) {
      case 1:
        log.info('init database');
    }
  }

  private modifySortName(name: string): string {
    switch (name) {
      case 'UpdateDate':
        return 'update_date';
      case 'AccessDate':
        return 'access_date';
      case 'UseDate':
        return 'use_date';
    }
    return name;
  }

  private modifySortNameReplica(name: string): string {
    switch (name) {
      case 'UpdateDate':
        return 'r.update_date';
      case 'AccessDate':
        return 'm.access_date';
      case 'UseDate':
        return 'm.use_date';
    }
    return name;
  }

  public setItem(item: Item) {
    const stmt = this.db.prepare(
      'INSERT INTO marks VALUES (?,?,?,?,?, ?,?,?,?,?, ?,?,?,?,?) ' +
        'ON CONFLICT(url) DO UPDATE SET ' +
        ' web_id = ?, name = ?, type = ?, size = ?, ' +
        ' update_date = ?, access_date = ?, use_date = ?, ' +
        ' parent_web_id = ?, parent_name = ?, ' +
        ' item_sort = ?, item_order = ?, item_search = ?, ' +
        ' mark = ?, scroll = ? '
    );

    stmt.run(
      //INSERT
      item.url,
      item.web_id,
      item.name,
      item.type.valueOf(),
      item.size,
      item.update_date.valueOf(),
      item.access_date.valueOf(),
      item.use_date.valueOf(),
      item.parent_web_id,
      item.parent_name,
      item.sort.valueOf(),
      item.order.valueOf(),
      item.search,
      item.mark,
      item.scroll,
      // UPDATE
      item.web_id,
      item.name,
      item.type.valueOf(),
      item.size,
      item.update_date.valueOf(),
      item.access_date.valueOf(),
      item.use_date.valueOf(),
      item.parent_web_id,
      item.parent_name,
      item.sort.valueOf(),
      item.order.valueOf(),
      item.search,
      item.mark,
      item.scroll
    );
  }

  public saveLine(item: Item) {
    const stmt = this.db.prepare('UPDATE marks SET scroll = ? WHERE url = ? LIMIT 1');
    stmt.run(item.scroll, item.url);
  }

  public getMarks(items: Item[]): Item[] {
    const stmt = this.db.prepare('SELECT mark, scroll FROM marks WHERE url = ?');
    for (const item of items) {
      const row = stmt.get(item.url);
      if (row) {
        item.mark = row.mark;
        item.scroll = row.scroll;
      }
    }
    return items;
  }

  public getMarkList(item: Item): ItemList {
    const list = new ItemList();
    list.base = item;

    const s = item.search.replace(/['']/g, '');
    const searchQuery = item.search == '' ? '' : ` AND name like '%${s}%'`;

    const stmt = this.db.prepare(
      'SELECT web_id, type, name, url, size, ' +
        ' access_date, use_date, update_date, ' +
        ' parent_name, parent_web_id, ' +
        ' item_sort, item_order, item_search, mark, scroll ' +
        ' FROM marks WHERE mark = ? ' +
        `${searchQuery}` +
        ' ORDER by ' +
        `${this.modifySortName(item.sort)} ${item.order}`
    );

    const rows = stmt.all(item.mark);
    for (const row of rows) {
      if (row != null) {
        const item = new Item(ItemUtil.str2ItemType(row.type));
        item.web_id = row.web_id;
        item.name = row.name;
        item.url = row.url;
        item.size = row.size;
        item.access_date = new Date(row.access_date);
        item.use_date = new Date(row.use_date);
        item.update_date = new Date(row.update_date);
        item.parent_name = row.parent_name;
        item.parent_web_id = row.parent_web_id;
        item.sort = ItemUtil.str2ItemSort(row.item_sort);
        item.order = ItemUtil.str2ItemOrder(row.item_order);
        item.search = row.item_search;
        item.mark = row.mark;
        item.scroll = row.scroll;
        //item.setFormat();
        list.items.push(item);
      }
    }
    return list;
  }

  public getRecentList(item: Item): ItemList {
    const list = new ItemList();
    list.base = item;

    let dataQuery = '';
    if (item.sort == ItemSort.UseDate) {
      dataQuery = ' AND use_date > 0 ';
    } else if (item.sort == ItemSort.AccessDate) {
      dataQuery = ' AND access_date > 0 ';
      //} else {
      //  dataQuery = ' AND access_date > 10 '; //test
    }

    const s = item.search.replace(/['']/g, '');
    const searchQuery = item.search == '' ? '' : ` AND name like '%${s}%'`;

    const stmt = this.db.prepare(
      'SELECT web_id, type, name, url, size, ' +
        ' access_date, use_date, update_date, ' +
        ' parent_name, parent_web_id, ' +
        ' item_sort, item_order, item_search, mark, scroll ' +
        ' FROM marks WHERE (type = ? OR type = ? OR type = ?) ' +
        dataQuery +
        searchQuery +
        ' ORDER by ' +
        `${this.modifySortName(item.sort)} ${item.order}` +
        ' LIMIT 100 '
    );

    const rows = stmt.all(ItemType.WebMLT, ItemType.LocalMLT, ItemType.LocalDB);
    for (const row of rows) {
      if (row != null) {
        const item = new Item(ItemUtil.str2ItemType(row.type));
        item.web_id = row.web_id;
        item.name = row.name;
        item.url = row.url;
        item.size = row.size;
        item.access_date = new Date(row.access_date);
        item.use_date = new Date(row.use_date);
        item.update_date = new Date(row.update_date);
        item.parent_name = row.parent_name;
        item.parent_web_id = row.parent_web_id;
        item.sort = ItemUtil.str2ItemSort(row.item_sort);
        item.order = ItemUtil.str2ItemOrder(row.item_order);
        item.search = row.item_search;
        item.mark = row.mark;
        item.scroll = row.scroll;
        list.items.push(item);
      }
    }
    return list;
  }

  public deleteRecent(item: Item) {
    const stmt = this.db.prepare('UPDATE marks SET access_date = 0, use_date = 0 WHERE url = ?');
    stmt.run(item.url);
  }

  public deleteRecentAll() {
    const stmt1 = this.db.prepare('DELETE FROM marks WHERE mark = 0 AND use_date = 0');
    const stmt2 = this.db.prepare('UPDATE marks SET access_date = 0');
    stmt1.run();
    stmt2.run();
  }

  public deleteUseDateAll() {
    const stmt1 = this.db.prepare('UPDATE marks SET use_date = 0');
    stmt1.run();
  }

  close() {
    this.db.close();
  }

  //
  // replica
  //
  public setReplica(item: Item) {
    const stmt = this.db.prepare(
      'INSERT INTO replicas VALUES (?,?,?,?) ON CONFLICT(mark_url) DO UPDATE SET update_date = ?'
    );
    const url = item.original_url == '' || item.original_url == null ? item.url : item.original_url;
    const date = new Date().valueOf();
    // 初回のinsertではデフォルトファイル名なので defaultReplicaFileName() 以後はreplica_name
    stmt.run(url, this.defaultReplicaName(item), date, item.scroll, date);
  }

  //レプリカファイル名と、既存のレプリカファイルの名称を変更する
  public setReplicaName(item: Item, name: string) {
    const file0 = this.replicaPathByFile(item.replica_name + '.db');
    const file1 = this.replicaPathByFile(name + '.db');
    if (fs.existsSync(file0) && !fs.existsSync(file1)) {
      try {
        fs.renameSync(file0, file1);
      } catch (error) {
        log.info("Error: Can't file rename.\n" + error);
      }
    }

    const stmt = this.db.prepare('UPDATE replicas SET replica_name = ? WHERE mark_url = ? ');
    stmt.run(name, item.original_url);
  }

  public getReplicaName(item: Item): string {
    const stmt = this.db.prepare('SELECT replica_name FROM replicas WHERE mark_url = ?');
    const row = stmt.get(item.original_url);
    if (row) {
      return row.replica_name;
    }
    return item.name;
  }
  public getReplicaFile(item: Item): string {
    const name = this.getReplicaName(item);
    const filePath = path.join(AppConfig.getReplicaFolder(), name);
    return filePath;
  }

  public getReplicaList(item: Item): ItemList {
    const base_path = AppConfig.getReplicaFolder();

    const list = new ItemList();
    list.base = item;

    const s = item.search.replace(/['']/g, '');
    const searchQuery = item.search == '' ? '' : ` AND name like '%${s}%'`;

    const stmt = this.db.prepare(
      'SELECT m.url, m.web_id, m.name, m.type, r.update_date, r.replica_name, ' +
        ' m.parent_web_id, m.parent_name, ' +
        ' m.item_sort, m.item_order, m.item_search, ' +
        ' m.mark, r.scroll ' +
        ' FROM replicas r INNER JOIN marks m ON r.mark_url = m.url ' +
        `${searchQuery}` +
        ' ORDER by ' +
        `${this.modifySortNameReplica(item.sort)} ${item.order}`
    );

    const rows = stmt.all();
    for (const row of rows) {
      if (row != null) {
        const item = new Item(ItemType.ReplicaMLT);
        item.url = path.join(base_path, row.replica_name);
        item.update_date = row.update_date;
        item.scroll = row.scroll;
        item.original_url = row.url;
        item.replica_name = row.replica_name;
        item.web_id = row.web_id;
        item.name = row.name;
        item.access_date = new Date(row.update_date);
        item.use_date = new Date(row.update_date);
        item.update_date = new Date(row.update_date);
        item.parent_name = row.parent_name;
        item.parent_web_id = row.parent_web_id;
        list.items.push(item);
      }
    }

    return list;
  }

  public deleteReplica(item: Item) {
    const stmt1 = this.db.prepare('DELETE FROM replicas WHERE mark_url = ? ');
    stmt1.run(item.original_url);
  }

  public deleteReplicaAll() {
    const stmt1 = this.db.prepare('DELETE FROM replicas');
    stmt1.run();
  }

  // デフォルトのレプリカファイル名
  private defaultReplicaName(item: Item): string {
    const shasum = crypto.createHash('sha1');
    shasum.update(item.url + '/' + item.name);
    const hash = shasum.digest('hex');
    const file_name = item.name + '_' + hash + '.db';
    return file_name;
  }

  private replicaPathByFile(file: string): string {
    return path.join(AppConfig.getReplicaFolder(), file);
  }
}

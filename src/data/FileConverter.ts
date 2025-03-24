import path from 'path';
import fs from 'fs';

import { LocalMLTClient } from './LocalMLTClient';
import { LocalDBClient } from './LocalDBClient';
import { AppConfig } from '@config/AppConfig';
import { Item, ItemType, KomaPart, KomaList, YBBSFile } from '@model/index';
import { Komas2MLT } from '@/char/k2str/Komas2MLT';
import { Koma2Ybbs } from '@/char/k2str/Koma2Ybbs';
import { KomaPart2Ybbs } from '@/char/k2str/KomaPart2Ybbs';
import { Komas2HTML } from '@/char/k2str/Komas2HTML';
import { app } from 'electron';

//
// MLTファイル YBBSファイルを変換する
//
export class FileConverter {
  static import(filePath: string): boolean {
    const p = path.parse(filePath);

    const item = new Item(ItemType.LocalMLT);
    item.name = path.basename(filePath, p.ext);
    item.url = filePath;

    let dbPath = path.resolve(AppConfig.get().PathLocalFolderDB, item.name + '.db');
    for (let i = 1; i < 1000; i++) {
      if (!fs.existsSync(dbPath)) break;

      dbPath = path.resolve(AppConfig.get().PathLocalFolderDB, item.name + i + '.db');

      if (i == 1000) return false;
    }

    const client = new LocalMLTClient();
    try {
      if (filePath.match(/ybbs$/i)) {
        const ybbsfile = client.ybbs(item);
        this.ybbs2db(dbPath, ybbsfile);
      } else if (filePath.match(/ast$/i)) {
        const komaList = client.ast(item);
        this.komaList2db(dbPath, komaList);
      } else if (filePath.match(/dat$/i)) {
        const komaList = client.dat(item);
        this.komaList2db(dbPath, komaList);
      } else if (filePath.match(/raw$/i)) {
        const komaList = client.shitarabaDat(item);
        this.komaList2db(dbPath, komaList);
      } else if (filePath.match(/html$/i)) {
        const komaList = client.shitarabaHtml(item);
        this.komaList2db(dbPath, komaList);
      } else {
        const komaList = client.mlt(item);
        this.komaList2db(dbPath, komaList);
      }
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }

  static komaList2db(dbPath: string, komaList: KomaList) {
    const fdb = new LocalDBClient(dbPath);

    for (const koma of komaList.komas) {
      const id = fdb.addKoma(koma);
      const kpart = new KomaPart();
      kpart.data = koma.data;
      kpart.name = 'AA1';
      kpart.parent_id = id;
      fdb.addKomaPart(kpart);
    }

    fdb.close();
  }

  static ybbs2db(dbPath: string, ybbsfile: YBBSFile) {
    const fdb = new LocalDBClient(dbPath);

    for (const ybbs of ybbsfile.ybbsKomas) {
      const id = fdb.addKoma(ybbs.koma);
      for (const kpart of ybbs.komaParts) {
        kpart.parent_id = id;
        kpart.order_num = fdb.addKomaPart(kpart);
      }
    }

    fdb.close();
  }

  static exportMLT(sourceFilePath: string, mltFilePath: string): boolean {
    const fdb = new LocalDBClient(sourceFilePath);
    const list: KomaList = fdb.getKomaList();
    const mlt = Komas2MLT.convert(list.komas);
    fdb.close();

    fs.writeFileSync(mltFilePath, '');
    const fd = fs.openSync(mltFilePath, 'w');
    try {
      fs.writeSync(fd, mlt); //BufferでOK
      fs.closeSync(fd);
    } catch {
      return false;
    }
    return true;
  }

  static exportYBBS(sourceFilePath: string, mltFilePath: string): boolean {
    const fdb = new LocalDBClient(sourceFilePath);
    const list: KomaList = fdb.getKomaList();
    let ybbs = '';

    for (const koma of list.komas) {
      ybbs += Koma2Ybbs.convert(koma);
      const kparts = fdb.getKomaParts(koma.id);
      let ordernum = 0;
      for (const kpart of kparts.reverse()) {
        ordernum += 1;
        kpart.order_num = ordernum;
        ybbs += KomaPart2Ybbs.convert(kpart);
      }
    }

    fdb.close();

    fs.writeFileSync(mltFilePath, '');
    const fd = fs.openSync(mltFilePath, 'w');
    try {
      fs.writeSync(fd, ybbs);
      fs.closeSync(fd);
    } catch {
      return false;
    }

    return true;
  }

  static exportHTML(sourceFilePath: string, mltFilePath: string): boolean {
    const fdb = new LocalDBClient(sourceFilePath);
    const list: KomaList = fdb.getKomaList();
    const p = path.parse(sourceFilePath).name;
    const html = Komas2HTML.convert(p, list.komas);
    fdb.close();

    fs.writeFileSync(mltFilePath, '');
    const fd = fs.openSync(mltFilePath, 'w');
    try {
      fs.writeSync(fd, html);
      fs.closeSync(fd);

      const from_fontfile = app.isPackaged
        ? path.join(process.resourcesPath, './resources/Saitamaar.woff2')
        : path.join(__dirname, '../../resources/Saitamaar.woff2');
      const to_fontfile = path.resolve(path.dirname(mltFilePath), 'Saitamaar.woff2');
      console.log(from_fontfile);

      const from_cssfile = app.isPackaged
        ? path.join(process.resourcesPath, './resources/aa.css')
        : path.join(__dirname, '../../resources/aa.css');
      const to_cssfile = path.resolve(path.dirname(mltFilePath), 'aa.css');
      console.log(from_cssfile);

      fs.copyFileSync(from_fontfile, to_fontfile);
      fs.copyFileSync(from_cssfile, to_cssfile);
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }
}

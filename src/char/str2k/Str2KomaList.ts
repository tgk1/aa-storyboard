import { Item } from '@model/Item';
import { Koma, KomaList, Section } from '@model/Koma';
import { String2x } from '@/char/String2x';

export function mlt2KomaList(data: string, item: Item): KomaList {
  // 一部のMLTには "<" と ">" が混っている。
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\[SPLIT\]\n/);

  const list = new KomaList(item);

  let i = 1;
  for (const buf of parts) {
    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = buf;
    koma.html = String2x.html(buf);
    const komasplit = koma.data.split(/\n/);
    if (komasplit.length <= 2) {
      const sec = new Section();
      sec.id = koma.id;
      sec.name = komasplit[0].replace(/\n/g, '');
      list.sections.push(sec);
    }
    list.komas.push(koma);
    i++;
  }

  return list;
}

export function ast2KomaList(data: string, item: Item): KomaList {
  // 一部のMLTには "<" と ">" が混っている。
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\[AA\]\[.*\]\n/);

  const list = new KomaList(item);

  let i = 1;
  for (const buf of parts) {
    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = buf;
    koma.html = String2x.html(buf);
    if (koma.html == '') {
      continue;
    }
    const komasplit = koma.data.split(/\n/);
    if (komasplit.length <= 2) {
      const sec = new Section();
      sec.id = koma.id;
      sec.name = komasplit[0].replace(/\n/g, '');
      list.sections.push(sec);
    }
    list.komas.push(koma);
    i++;
  }

  return list;
}

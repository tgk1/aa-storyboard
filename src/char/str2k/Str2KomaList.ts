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

export function dat2KomaList(data: string, item: Item): KomaList {
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\n/);
  const list = new KomaList(item);

  let i = 1;
  for (let buf of parts) {
    let bufHead = '';
    let bufBody = '';
    if (i == 1) {
      buf = buf.replace(/<>[^<>]*?$/i, '<>');
    }
    if (buf.match(/<>あぼーん$/)) {
      //投稿が削除された跡
      bufHead = buf;
    } else {
      const m = buf.match(/^(.*)<>(.*?)<>$/);
      if (m) {
        bufHead = m[1].replace(/^ /, '').replace(/<>/g, ' ').replace(/<\/b>/g, '').replace(/<b>/, '：');
        bufHead = i + ' 名前： ' + bufHead;
        bufBody = m[2].replace(/<br>/g, '\n');
        bufBody = String2x.htmldecode(bufBody);
        bufBody = bufBody.replace(/<b>(【.*?】)<\/b>/g, '$1');
      } else {
        bufHead = i.toString();
        bufBody = buf;
      }
    }

    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = bufHead + '\n' + bufBody;
    koma.html = String2x.html(bufHead + '\n' + bufBody);
    if (koma.html == '') {
      continue;
    }
    list.komas.push(koma);
    i++;
  }

  return list;
}

export function shitarabaDat2KomaList(data: string, item: Item): KomaList {
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\n/);
  const list = new KomaList(item);

  let i = 1;
  for (let buf of parts) {
    let bufHead = '';
    let bufBody = '';
    if (i == 1) {
      buf = buf.replace(/<>[^<>]*?<>([^<>]*?)$/, '<><>$1');
    }
    if (buf.match(/<>----------------------<>----------------------<>----------------------<><>$/)) {
      //投稿が削除された跡
      bufHead = buf;
    } else {
      const m = buf.match(/^(.*)<>(.*?)<><>(.*?)$/);
      if (m) {
        bufHead = m[1]
          .replace(/^[0-9]+/, '')
          .replace(/<>/g, ' ')
          .replace(/<\/b>/g, '')
          .replace(/<b>/, '：');
        bufHead = i + '： ' + bufHead + ' ID:' + m[3];
        bufBody = m[2].replace(/<br>/g, '\n');
        bufBody = bufBody.replace(/<a [^>]*>|<\/a>/g, '');
        bufBody = String2x.htmldecode(bufBody);
      } else {
        bufHead = i.toString();
        bufBody = buf;
      }
    }

    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = bufHead + '\n' + bufBody;
    koma.html = String2x.html(bufHead + '\n' + bufBody);
    if (koma.html == '') {
      continue;
    }
    list.komas.push(koma);
    i++;
  }

  return list;
}

// 古い過去ログ (2012年)
export function shitarabaHtmlTypeA2KomaList(data: string, item: Item): KomaList {
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split(/\n/);
  const list = new KomaList(item);

  let i = 1;
  for (const buf of parts) {
    let bufHead = '';
    let bufBody = '';
    const m = buf.match(/<dt>(.*?)<dd>(.*)$/);
    if (m) {
      bufHead = m[1].replace(/<a [^>]*?>|<\/a>/g, ' ').replace(/<b>|<\/b>/g, '');
      bufBody = m[2].replace(/<br>/g, '\n');
      bufBody = bufBody.replace(/<a [^>]*?>|<\/a>/g, '');
      bufBody = bufBody.replace(/<span [^>]*?>|<\/span>/g, '');
      bufBody = String2x.htmldecode(bufBody);
    } else {
      continue;
    }

    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = bufHead + '\n' + bufBody;
    koma.html = String2x.html(bufHead + '\n' + bufBody);
    if (koma.html == '') {
      continue;
    }
    list.komas.push(koma);
    i++;
  }

  return list;
}

// 新しい過去ログ (2020年)
export function shitarabaHtmlTypeB2KomaList(data: string, item: Item): KomaList {
  const parts = data.replace(/\r\n|\r|\n/g, '\n').split('</dd>');
  const list = new KomaList(item);
  console.log('QQ A: ' + parts.length);

  let i = 1;
  for (const buf of parts) {
    let bufHead = '';
    let bufBody = '';
    const m1 = buf.match(/<dt [^>]*>([\s\S]+)<\/dt>[\s\S]*<dd>([\s\S]+)/);
    if (m1) {
      const m2 = m1[1]
        .replace(/\n[\s]+/gm, '') //ゴミ空白
        .replace(/>[\s]+/gm, '>') //ゴミ空白
        .match(/([0-9]+) ：([\s\S]*)：([\s\S]*)/);
      if (m2) {
        bufHead = m2[1] + '：' + m2[2] + '：' + m2[3];
        bufHead = bufHead.replace(/<\/font>/, ' ').replace(/<[^>]*>/g, '');
      } else {
        console.log('NO MATCH');
      }
      bufBody = m1[2]
        .replace(/[\s]+$/g, '')
        .replace(/^[\s]+/g, '')
        .replace(/\/n/g, '');
      bufBody = bufBody
        .replace(/\n/g, '')
        .replace(/<a [^>]*?>|<\/a>/g, '')
        .replace(/<span [^>]*?>|<\/span>/g, '')
        .replace(/<br>/g, '\n');
      bufBody = String2x.htmldecode(bufBody);
      console.log(m2);
    } else {
      continue;
    }

    const koma = new Koma();
    koma.id = i;
    koma.order_num = i;
    koma.label_num = i;
    koma.data = bufHead + '\n' + bufBody;
    koma.html = String2x.html(bufHead + '\n' + bufBody);
    if (koma.html == '') {
      continue;
    }
    list.komas.push(koma);
    i++;
  }
  return list;
}

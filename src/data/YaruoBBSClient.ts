import { ItemList, Item, ItemType, ItemOrder, ItemSort } from '@model/Item';
import { String2x } from '@/char/String2x';
import { KomaList } from '@model/Koma';

//
// やる夫BBS+エディターサーバへのMLT問い合わせ時に返されるデータ形式
//

interface YaruoBBSJson {
  base: YBJBase;
  archives: YBJArchive[];
}
interface YBJBase {
  id: number;
  name: string;
  date: Date;
  type: string;
}
interface YBJArchive {
  id: number;
  name: string;
  full_name: string;
  full_path: string;
  parent_id: number;
  url: string;
  enc_url: string;
  date: Date;
  size: number;
  atype: number;
}

export class YaruoBBSClient {
  //static readonly BASE_URL: string = 'http://localhost:3000';
  static readonly BASE_URL: string = 'https://yaruoapi.r401.net/aa';

  public async get(item: Item): Promise<ItemList> {
    const pid = item.web_id ? `${item.web_id}` : '';
    const order = item.sort == ItemSort.Name ? 'col1' : 'col2';
    const para = {
      parent_id: pid,
      order: order,
      s: `${item.search}`,
      r18: '1'
    };
    const sparam = new URLSearchParams(para);

    const url = YaruoBBSClient.BASE_URL + '/api/v1/archives.json?' + sparam.toString();
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data != null) {
        const json = data as YaruoBBSJson;
        return YaruoBBSClient._json2itemList(item, json);
      }

      const list = new ItemList();
      list.base = item;
      list.error = new Error();
      list.error.name = 'Error';
      list.error.message = '取得に失敗しました。';
      if (!response.ok) {
        list.error.name += `: ${response.status}`;
        list.error.message = `: ${response.statusText}`;
      }
      return list;
    } catch (error) {
      const e = error as Error;
      const list = new ItemList();
      list.base = item;
      list.error = e;
      return list;
    }
  }

  private static _json2itemList(item: Item, json: YaruoBBSJson): ItemList {
    const list = new ItemList();
    list.base = item;
    list.base.update_date = json.base.date != undefined ? new Date(json.base.date) : new Date();

    for (const arc of json.archives) {
      if (arc.name == '[戻る]') list.base.parent_web_id = arc.parent_id;
      if (arc.name == '[戻る]' || arc.name.match(/アプリ付属AA/) || arc.parent_id == 20000) continue;
      //if (arc.name.match(/アプリ付属AA/) || arc.parent_id == 20000) continue;
      //if (arc.name == "[戻る]") arc.name = ' [上のフォルダへ]';
      const item = new Item(ItemType.WebMLT);
      item.web_id = arc.id;
      item.name = arc.name;
      item.update_date = arc.date != undefined ? new Date(arc.date) : new Date();
      item.url = arc.atype == 1 ? arc.enc_url : 'webmltfolder:' + arc.id;
      item.hukutemp_path = 'web:/' + arc.full_path;
      item.type = arc.atype == 1 ? ItemType.WebMLT : ItemType.WebFolderMLT;
      item.size = arc.size != null ? arc.size : 0;
      item.parent_web_id = arc.parent_id;
      item.parent_name = arc.full_name != null ? arc.full_name : '';
      item.sort = ItemSort.Name;
      item.order = ItemOrder.ASC;
      item.search = '';
      list.items.push(item);
    }
    return list;
  }

  public async mlt(item: Item): Promise<KomaList> {
    const res = await fetch(item.url);
    const body = await res.text();
    if (res.ok && body != null) {
      const text = String2x.htmldecode(body);
      return String2x.mlt2komaList(text, item);
    }

    const list = new KomaList(item);
    list.error = new Error();
    list.error.name = 'null';
    return list;
  }
}

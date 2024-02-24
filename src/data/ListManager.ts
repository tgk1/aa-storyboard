import { ItemList, Item, ItemType } from '@model/Item';
import { Koma, KomaList, KomaPart } from '@model/Koma';

import { YaruoBBSClient } from '@/data/YaruoBBSClient';
import { ItemUtil } from '@model/ItemUtil';
import { KomaUtil } from '@model/KomaUtil';

export class ListManager {
  // ItemList取得
  getItemList(item: Item): Promise<ItemList> {
    switch (item.type) {
      case ItemType.WebFolderMLT:
        return this.listFromWebFolder(item);
      case ItemType.LocalFolderMLT:
        return this.listFromLocalFolder(item);
      case ItemType.LocalFolderDB:
        return this.listFromLocalFolder(item);
      case ItemType.MarkFolder:
        return this.listFromMarkFolder(item);
      case ItemType.RecentFolder:
        return this.listFromRecentFolder(item);
      case ItemType.ReplicaFolder:
        return this.listFromReplicaFolder(item);
      default:
        return this.defaultItemList(item);
    }
  }

  // Doc MLT取得
  getKomaList(item: Item): Promise<KomaList> {
    switch (item.type) {
      case ItemType.WebMLT:
        return this.komaFromWeb(item);
      case ItemType.LocalMLT:
        return this.komaFromMLT(item);
      case ItemType.LocalDB:
        return this.komaFromDB(item);
      case ItemType.ReplicaMLT:
        return this.komaFromDB(item);
      default:
        return this.defaultKomaList(item);
    }
  }

  //
  // LIST取得Promise
  //
  defaultItemList(item: Item): Promise<ItemList> {
    return new Promise(function (resolve) {
      const list = new ItemList();
      list.base = item;
      list.error = new Error('no implement: ' + item.type);
      resolve(list);
    });
  }

  listFromWebFolder(item: Item): Promise<ItemList> {
    const client = new YaruoBBSClient();
    return client.get(item).then((list: ItemList) => {
      const obj = JSON.stringify(list.items);
      return window.markDB.getMarks(obj).then((items: Item[]) => {
        list.items = items;
        return new Promise((resolve) => {
          resolve(ItemUtil.obj2itemList(list));
        });
      });
    });

    //お気に入り情報追加しない場合には以下のようにする。
    //const client = new YaruoBBSClient();
    //return client.get(item);
  }

  listFromLocalFolder(item: Item): Promise<ItemList> {
    const obj1 = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.localMLT.get(obj1).then((obj2) => {
      const list = ItemUtil.obj2itemList(obj2);
      const obj = JSON.stringify(list.items);
      return window.markDB.getMarks(obj).then((items: Item[]) => {
        list.items = items;
        return new Promise((resolve) => {
          resolve(ItemUtil.obj2itemList(list));
        });
      });
    });

    /*
    //お気に入り情報追加しない場合には以下のようにする。
    const obj = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.localMLT.get(obj).then((obj2) => {
      const list1 = ItemUtil.obj2itemList(obj2);
      return new Promise((resolve) => {
        resolve(list1);
      });
    });
    */
  }

  listFromMarkFolder(item: Item): Promise<ItemList> {
    const obj = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.markDB.getMarkList(obj).then((obj2) => {
      const list: ItemList = ItemUtil.obj2itemList(obj2);
      return new Promise((resolve) => {
        resolve(list);
      });
    });
  }

  listFromRecentFolder(item: Item): Promise<ItemList> {
    const obj = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.markDB.getRecentList(obj).then((obj2) => {
      const list: ItemList = ItemUtil.obj2itemList(obj2);
      return new Promise((resolve) => {
        resolve(list);
      });
    });
  }

  listFromReplicaFolder(item: Item): Promise<ItemList> {
    const obj = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.markDB.getReplicaList(obj).then((obj2) => {
      const list: ItemList = ItemUtil.obj2itemList(obj2);
      return new Promise((resolve) => {
        resolve(list);
      });
    });
  }

  //
  // MLT or DB --------------
  //
  defaultKomaList(item: Item): Promise<KomaList> {
    return new Promise(function (resolve) {
      const list = new KomaList(item);
      list.base = item;
      resolve(list);
    });
  }

  komaFromWeb(item: Item): Promise<KomaList> {
    const client = new YaruoBBSClient();
    return client.mlt(item);
  }

  async komaFromMLT(item: Item): Promise<KomaList> {
    const obj = JSON.stringify(item); //Itemクラスオブジェクトのままだとエラーになるので。
    return window.localMLT.mlt(obj).then((obj2) => {
      const list: KomaList = KomaUtil.obj2komaList(obj2);
      return new Promise((resolve) => {
        resolve(list);
      });
    });
  }

  async komaFromDB(item: Item): Promise<KomaList> {
    return window.localDB.getKomaList({ path: item.url }).then((obj2) => {
      const list: KomaList = KomaUtil.obj2komaList(obj2);
      return new Promise((resolve) => {
        resolve(list);
      });
    });
  }

  //
  // CopipeKoma, Replica
  //
  public async replicaKoma(item: Item, koma: Koma) {
    const strItem = JSON.stringify(item);
    const strKoma = JSON.stringify(koma);

    // レプリカファイル名の取得 フルパスは window.localDB.getKomaParts -> MarkDBClient内で作成する
    window.markDB.setReplica(strItem);
    const file = window.markDB.getReplicaFile(strItem);
    console.log(file);
    if (item.type == ItemType.LocalFolderDB) {
      window.localDB.getKomaParts({ path: item.url, komaID: koma.id }).then((obj) => {
        const kparts: KomaPart[] = KomaUtil.obj2komaParts(obj);
        const strkparts = JSON.stringify(kparts);
        window.localDB.replicaKoma({ path: file, strKoma: strKoma, strKomaParts: strkparts });
      });
    } else {
      window.localDB.replicaKoma({ path: file, strKoma: strKoma, strKomaParts: '' });
    }
  }
}

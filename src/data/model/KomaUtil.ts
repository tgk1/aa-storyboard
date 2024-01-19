import { Koma, KomaPart, KomaList } from './Koma';
import { ItemUtil } from './ItemUtil';

export class KomaUtil {
  static obj2koma(obj: Koma): Koma {
    const koma = new Koma();
    koma.id = obj.id;
    koma.html = obj.html;
    koma.data = obj.data;
    koma.order_num = obj.order_num;
    koma.label_num = obj.label_num;
    koma.del = obj.del;

    return koma;
  }

  static obj2komaPart(obj: KomaPart): KomaPart {
    const kpart = new KomaPart();
    kpart.id = obj.id;
    kpart.parent_id = obj.parent_id;
    kpart.name = obj.name;
    kpart.data = obj.data;
    kpart.html = obj.html;
    kpart.x = obj.x;
    kpart.y = obj.y;
    kpart.order_num = obj.order_num;
    kpart.mode = obj.mode;
    kpart.del = obj.del;

    return kpart;
  }

  static obj2komaParts(objcs: KomaPart[]): KomaPart[] {
    const kparts: KomaPart[] = [];
    for (const obj of objcs) {
      kparts.push(KomaUtil.obj2komaPart(obj));
    }
    return kparts;
  }

  static obj2komas(objcs: Koma[]): Koma[] {
    const komas: Koma[] = [];
    for (const obj of objcs) {
      komas.push(KomaUtil.obj2koma(obj));
    }
    return komas;
  }

  static obj2komaList(obj: KomaList): KomaList {
    const list = new KomaList(ItemUtil.obj2item(obj.base));
    list.komas = KomaUtil.obj2komas(obj.komas);
    return list;
  }
}

//

import { KomaPart } from '@model/Koma';
import { KomaPart2String } from '@/char/K2StrInterface';

export interface KomaPart2Ybbs extends KomaPart2String<typeof KomaPart2Ybbs> {}
export class KomaPart2Ybbs implements KomaPart2String<typeof KomaPart2Ybbs> {
  public static convert(kpart: KomaPart) {
    let buf = '';
    buf += `[SPLIT_PART:${kpart.name}:${kpart.mode}:${kpart.x}:${kpart.y}:${kpart.order_num}]\n`;
    buf += kpart.data + '\n[SPLIT_PART_END]\n';
    return buf;
  }
}

//

import { Koma } from '@model/Koma';
import { Koma2String } from '@/char/K2StrInterface';

export interface Koma2Ybbs extends Koma2String<typeof Koma2Ybbs> {}
export class Koma2Ybbs implements Koma2String<typeof Koma2Ybbs> {
  public static convert(koma: Koma) {
    return `[SPLIT]\n${koma.data}\n[SPLIT_END]\n`;
  }
}

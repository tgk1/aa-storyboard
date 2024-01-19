//
// Koma[]からMLT用string(SJIS)を作成する
//
// 引数のKoma[]はorder_numの昇順であることを想定している
//

import { Koma } from '@model/Koma';
import { Komas2String } from '@/char/K2StrInterface';
import { String2x } from '@/char/String2x';

export interface Komas2MLT extends Komas2String<typeof Komas2MLT> {}
export class Komas2MLT implements Komas2String<typeof Komas2MLT> {
  public static convert(komas: Koma[]): Buffer {
    let buf = '';
    for (const koma of komas) {
      if (buf != '') {
        buf += '[SPLIT]\n';
      }
      buf += String2x.numericChar(false, koma.data);
    }

    const buf2 = buf.replace(/\n/g, '\r\n');
    const encdata = String2x.encode(buf2, 'Windows-31j');

    return encdata;
  }
}

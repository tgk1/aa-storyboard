//
// KomaおよびKomaPartの文字列から、文字を加工・出力する関数を作るときに使う
//
// interface で staticを使いたいのだけで、それができないみたいなので、
// 以下のような記述をする。
/*
// 参考クラス
interface KomaDump extends Koma2String<typeof KomaDump> {}
class KomaDump implements Koma2String<typeof KomaDump> {
  static convert(koma: Koma) {
    return koma.data;
  }
}
*/

import { Koma, KomaPart, KomaList } from '@model/Koma';
import { MergeCore } from './MergeCore';

// Koma 版
export interface Koma2StringStatic<C extends new () => Koma2String<C>> {
  convert(koma: Koma): Koma2String<C>;
}
export interface Koma2String<C extends new () => any> {
  convert: (koma: Koma) => string;
  constructor: C;
}

// Koma[] 版
export interface Komas2StringStatic<C extends new () => Komas2String<C>> {
  convert(komas: Koma[]): Komas2String<C>;
}
export interface Komas2String<C extends new () => any> {
  convert: (komas: Koma[]) => string;
  constructor: C;
}

// KomaPart 版
export interface KomaPart2StringStatic<C extends new () => KomaPart2String<C>> {
  convert(kpart: KomaPart): KomaPart2String<C>;
}
export interface KomaPart2String<C extends new () => any> {
  convert: (kpart: KomaPart) => string;
  constructor: C;
}

// KomaPart[] 版
export interface KomaParts2StringStatic<C extends new () => KomaParts2String<C>> {
  convert(kparts: KomaPart[]): KomaParts2String<C>;
}
export interface KomaParts2String<C extends new () => any> {
  convert: (kparts: KomaPart[]) => string;
  constructor: C;
}

// KomaPart[] + MergeCore 版
export interface McKomaParts2StringStatic<C extends new () => McKomaParts2String<C>> {
  convert(kparts: KomaPart[], mc: MergeCore): McKomaParts2String<C>;
}
export interface McKomaParts2String<C extends new () => any> {
  convert: (kparts: KomaPart[], mc: MergeCore) => string;
  constructor: C;
}

// KomaList
export interface KomaList2StringStatic<C extends new () => KomaList2String<C>> {
  convert(klist: KomaList): KomaList2String<C>;
}
export interface KomaList2String<C extends new () => any> {
  convert: (klist: KomaList) => string;
  constructor: C;
}

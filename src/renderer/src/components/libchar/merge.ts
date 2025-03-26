import { Ref } from 'vue';

import { MergeCore } from '@/char/MergeCore';
import { String2x } from '@/char/String2x';
import { KomaPart, AddLineBreakAtTop, AddLineBreakAtBottom } from '@model/index';

export function mergeKomaParts(elm: Ref<InstanceType<typeof HTMLSpanElement> | null>, kparts: KomaPart[]): KomaPart {
  if (kparts.length == 0) {
    return new KomaPart();
  }
  const mc = new MergeCore(elm.value, 16);
  const newkpart = mc.mergeKomaPartsArray(kparts);

  if (!newkpart) throw 'merge error2';
  return newkpart;
}

export function addLineBreaks(c1: AddLineBreakAtTop, c2: AddLineBreakAtBottom, text: string): string {
  text = String2x.addLineBreaksAtTop(c1, text);
  text = String2x.addLineBreaksAtBottom(c2, text);
  return text;
}

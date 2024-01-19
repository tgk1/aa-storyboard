import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

import { Koma, KomaPart } from '@model/Koma';
import { AddLineBreakAtTop } from '@/data/model/AddLineBreakAtTop';
import { AddLineBreakAtBottom } from '@/data/model/AddLineBreakAtBottom';
import { CanvasGuideSize } from '@model/CanvasGuideSize';

const dataSet = () => {
  const filePath = ref('');
  const koma: Ref<Koma> = ref(new Koma());
  const komaParts: Ref<Array<KomaPart>> = ref([]);

  const editKomaPart: Ref<KomaPart> = ref(new KomaPart()); //TextEditorで編集するKomaPart
  const editKomaPartSub: Ref<KomaPart> = ref(new KomaPart()); //TextEditorでAA分割処理をしたときに通常KomaPartと別に作成されるKomaPart

  const fontSize = ref(16);
  const canvasGuideSize: Ref<CanvasGuideSize> = ref(CanvasGuideSize.w800_l40);
  const configAddLineBreakAtTop: Ref<AddLineBreakAtTop> = ref(AddLineBreakAtTop.NoLine);
  const configAddLineBreakAtBottom: Ref<AddLineBreakAtBottom> = ref(AddLineBreakAtBottom.NoLine);

  const enableEditButtons = ref(true);
  const enableMergeButton = ref(false);
  const enableUndoMergeButton = ref(false);
  const enableUndoTrashButton = ref(false);

  function lineHeight(): number {
    return fontSize.value + (fontSize.value > 10 ? 2 : 1);
  }

  function getKomaPart(id: number): KomaPart | null {
    for (const kpart of komaParts.value) {
      if (kpart.id == id) {
        return kpart;
      }
    }
    return null;
  }

  function getTopOrderNum(): number {
    let num = -100;
    for (const kpart of komaParts.value) {
      num = kpart.order_num > num ? kpart.order_num : num;
    }
    return num;
  }

  function sweep() {
    filePath.value = '';
    koma.value = new Koma();
    komaParts.value = [];
  }

  return {
    filePath,
    koma,
    komaParts,
    editKomaPart,
    editKomaPartSub,
    fontSize,
    canvasGuideSize,
    configAddLineBreakAtTop,
    configAddLineBreakAtBottom,
    enableEditButtons,
    enableMergeButton,
    enableUndoMergeButton,
    enableUndoTrashButton,
    lineHeight,
    getKomaPart,
    sweep,
    getTopOrderNum
  };
};

export const userAACanvasDataStore = defineStore('userAACanvasData', dataSet);

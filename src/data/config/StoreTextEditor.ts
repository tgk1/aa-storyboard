import { ref } from 'vue';
import { defineStore } from 'pinia';

import { KomaPart } from '@model/index';

const dataSet = () => {
  const fontSize = ref(16);
  const colorSpaceZenkaku = ref(true);
  const colorSpaceUnicode = ref(true);
  const colorSpaceWarning = ref(true);
  const komaPart = ref(new KomaPart());
  const filePath = ref('');
  const cursorPositionX = ref(0);
  const cursorPositionY = ref(0);
  const charInfoWidth = ref(0);
  const charInfoChar = ref('');

  function lineHeight(): number {
    return fontSize.value + (fontSize.value > 10 ? 2 : 1);
  }

  function sweep() {
    filePath.value = '';
    komaPart.value = new KomaPart();
  }

  return {
    sweep,
    filePath,
    cursorPositionX,
    cursorPositionY,
    charInfoWidth,
    charInfoChar,
    komaPart,
    fontSize,
    lineHeight,
    colorSpaceUnicode,
    colorSpaceZenkaku,
    colorSpaceWarning
  };
};

export const userTextEditorDataStore = defineStore('userTextEditorData', dataSet);

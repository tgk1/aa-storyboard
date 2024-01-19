import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

import { Koma, KomaPart, StringKeyObject } from '@model/Koma';
import { CopyEncoding } from '@model/CopyEncoding';
import { ImageColorTheme } from '@model/ImageColor';
import { String2x } from '@/char/String2x';

const dataSet = () => {
  const copyEncoding: Ref<CopyEncoding> = ref(CopyEncoding.windows31j);
  const imageColorTheme: Ref<ImageColorTheme> = ref(ImageColorTheme.White);

  const clipboadKoma: Ref<Koma | null> = ref(null);
  const clipboadKomaParts: Ref<KomaPart[]> = ref([]);
  const selectedKomaPartsID: Ref<StringKeyObject> = ref({ 0: false });

  function initCopipe() {
    clipboadKoma.value = new Koma();
    clipboadKomaParts.value = [];
    selectedKomaPartsID.value = [];
  }
  function clearClipboad() {
    clipboadKoma.value = null;
    clipboadKomaParts.value = [];
  }

  function copyToClipboad(koma: Koma, komaParts: KomaPart[]) {
    // 1)  OSのクリップボードにコピーする
    const enc = copyEncoding.value == CopyEncoding.windows31j;
    const buf = enc ? String2x.numericChar(false, koma.data) : koma.data;
    navigator.clipboard.writeText(buf);

    // 2) アプリ内クリップボードにコピーする(KomaとKomaPart)
    clipboadKoma.value = koma;
    clipboadKomaParts.value = komaParts;
  }

  function selectToClipboad(koma: Koma, komaParts: KomaPart[]) {
    // 1)  OSのクリップボードにコピーする
    const enc = copyEncoding.value == CopyEncoding.windows31j;
    const buf = enc ? String2x.numericChar(false, koma.data) : koma.data;
    navigator.clipboard.writeText(buf);

    // 2) アプリ内クリップボードにコピーする(KomaとKomaPart)
    const kparts = getSelectedKomaParts(komaParts);
    clipboadKoma.value = koma;
    clipboadKomaParts.value = kparts;
  }

  function getSelectedKomaParts(komaParts: KomaPart[]): KomaPart[] {
    const kparts: KomaPart[] = [];
    for (const kpart of komaParts) {
      if (selectedKomaPartsID.value[kpart.id]) {
        kparts.push(kpart);
      }
    }
    return kparts;
  }

  return {
    clearClipboad,
    copyEncoding,
    imageColorTheme,
    initCopipe,
    copyToClipboad,
    selectToClipboad,
    clipboadKoma,
    clipboadKomaParts,
    selectedKomaPartsID,
    getSelectedKomaParts
  };
};

export const userClipboadKoma = defineStore('userClipboadKoma', dataSet);

<template>
  <el-container id="text-editor">
    <el-header id="toolbar">
      <TextEditorToolbar
        @close-editor="closeEditor"
        @save-data="saveData"
        @delete-chars="deleteChars"
        @create-frame="createFrame"
        @split-aa="splitAA"
      />
    </el-header>
    <el-container>
      <div id="main-col">
        <TextEditorMain ref="textEditorMain" />
      </div>
      <el-aside id="list-col">
        <CharactersList @insert-text="insertText" />
      </el-aside>
    </el-container>

    <span id="merge-core-for-calc" ref="mergeCoreElm" />
  </el-container>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeMount, Ref, ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { Action, ElMessage, ElMessageBox } from 'element-plus';

import { userTextEditorDataStore } from '@/data/config/StoreTextEditor';
import { TextDecorator } from '@/char/str2str/TextDecorator';
import { MergeCore } from '@/char/MergeCore';
import { String2x } from '@/char/String2x';
import { KomaPart } from '@/data/model';

import TextEditorToolbar from '@components/TextEditor/TextEditorToolbar.vue';
import TextEditorMain from '@components/TextEditor/TextEditorMain.vue';
import CharactersList from '@components/TextEditor/CharactersList.vue';
import { i18n } from '@/lib/i18n-renderer';
import { wait } from '@/lib/wait';

const store = userTextEditorDataStore();
const { filePath, komaPart } = storeToRefs(store);
const { sweep } = store;

const textEditorMain: Ref<typeof TextEditorMain | null> = ref(null);
const mergeCoreElm = ref<InstanceType<typeof HTMLElement> | null>(null);
let mergeCore: MergeCore = new MergeCore(null, 16); //文字列処理用
let textDeco: TextDecorator = new TextDecorator(mergeCore);
let originalKomaPart: KomaPart;

onBeforeMount(() => {
  passiveIPC();
});

onMounted(() => {
  console.log('onMounted: TextEditor');
  if (!mergeCoreElm.value) return;

  mergeCore = new MergeCore(mergeCoreElm.value, 16);
  textDeco = new TextDecorator(mergeCore);
});

function passiveIPC() {
  window.appWindow.openTextEditorSTEP2((_event, dic) => {
    filePath.value = dic['path'];
    originalKomaPart = JSON.parse(dic['strKomaPart']);
    komaPart.value = JSON.parse(dic['strKomaPart']);
  });
}

//
// テキスト編集系
//
function insertText(str: string) {
  if (!textEditorMain.value) return;
  textEditorMain.value.insertTextArea(str);
}

function deleteChars(left: boolean) {
  if (!textEditorMain.value) return;
  const point = textEditorMain.value.selectionStart();

  let txt = '';
  if (left) {
    txt = textDeco.deleteCharsLeft(komaPart.value.data, point);
  } else {
    txt = textDeco.deleteCharsRight(komaPart.value.data, point);
  }
  textEditorMain.value.updateTextArea(txt);
}

function createFrame(frameType: number) {
  if (!textEditorMain.value) return;

  const text = komaPart.value.data;
  let txt = '';
  switch (frameType) {
    case 0: txt = textDeco.frame1A(text); break;
    case 1: txt = textDeco.frame1B(text); break;
    case 2: txt = textDeco.frame1D(text); break;
    case 3: txt = textDeco.frame2A(text); break;
    case 4: txt = textDeco.frame2B(text); break;
    case 5: txt = textDeco.frame3 (text); break;
    case 6: txt = textDeco.frame4A(text); break;
    case 7: txt = textDeco.frame5 (text); break;
    case 8: txt = textDeco.frame4B(text); break;
    case 9: txt = textDeco.frame1E(text); break;
    case 10:txt = textDeco.frame6 (text); break;
  }
  textEditorMain.value.updateTextArea(txt);
}

function splitAA() {
  mergeCore = new MergeCore(mergeCoreElm.value, 16);

  if (!textEditorMain.value) return;
  const point = textEditorMain.value.selectionStart();
  if (point == 0) return;

  const txt = komaPart.value.data;
  komaPart.value.data = textDeco.deleteCharsRight(komaPart.value.data, point);
  komaPart.value.html = String2x.html(komaPart.value.data);

  const cline = String2x.point2lineString(txt, point);
  const width = mergeCore.measureWidth(cline);
  const nkpart = new KomaPart();
  nkpart.parent_id = komaPart.value.parent_id;
  nkpart.x = Math.round((komaPart.value.x * mergeCore.gridWidth + width) / mergeCore.gridWidth);
  nkpart.y = komaPart.value.y;
  nkpart.data = textDeco.deleteCharsLeft(txt, point);
  nkpart.html = String2x.html(nkpart.data);

  const dic = {
    path: filePath.value,
    strKomaPart: JSON.stringify(komaPart.value),
    strSplitKomaPart: JSON.stringify(nkpart)
  };

  window.appWindow.saveTextEditorSTEP1(dic);
  close();
}

//
//
//
function saveData(message = true) {
  nextTick(() => {
    komaPart.value.html = String2x.html(komaPart.value.data);
    const dic = { path: filePath.value, strKomaPart: JSON.stringify(komaPart.value) };
    window.appWindow.saveTextEditorSTEP1(dic);
    originalKomaPart = komaPart.value;
    if (message) {
      ElMessage({ message: i18n.t('TEDIT.Saved'), type: 'success', duration: 900 });
    }
    textEditorMain.value?.focus();
  });
}

function close() {
  textEditorMain.value?.focus();
  sweep();
  Promise.resolve()
    .then(wait(200))
    .then(() => {
      window.appWindow.closeTextEditorSTEP1();
    });
}

function closeEditor() {
  if (originalKomaPart.data == komaPart.value.data && originalKomaPart.mode == komaPart.value.mode) {
    close();
    return;
  }

  ElMessageBox.confirm(i18n.t('TEDIT.Save?'), i18n.t('Confirm'), {
    distinguishCancelAndClose: true,
    confirmButtonText: i18n.t('TEDIT.Save'),
    cancelButtonText: i18n.t('TEDIT.NoSave'),
    type: 'info'
  })
    .then(() => {
      saveData(false);
      Promise.resolve()
        .then(wait(300))
        .then(() => {
          close();
        });
    })
    .catch((action: Action) => {
      if (action == 'cancel') {
        close();
      }
    });
}
</script>

<style lang="css">
@import './assets/css/app.css';
</style>

<style scoped>
#text-editor {
  margin: 0;
}
#toolbar {
  height: 50px;
  margin-bottom: 16px;
}
#main-col {
  margin: 0;
  overflow: hidden;
  position: relative;
  width: calc(100vw - 240px);
  height: calc(100vh - 70px);
}
#list-col {
  width: 220px;
  height: calc(100vh - 70px);
  box-sizing: border-box;
  margin-left: 8px;
  margin-bottom: 20px;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
#merge-core-for-calc {
  font-family: 'Saitamaar';
  font-weight: normal;
  white-space: pre;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -99;
  visibility: hidden;
  font-size: 16px;
  line-height: 18px;
}
</style>

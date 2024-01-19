<template>
  <div id="text-editor-main">
    <div id="editor" :width="editorWidth" :height="editorHeight">
      <textarea
        id="textArea"
        ref="textArea"
        v-model="komaPart.data"
        :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight + 'px' }"
      />
    </div>

    <RulerCanvas
      id="rulerCanvas"
      ref="rulerCanvas"
      :grid-width="gridWidth"
      :grid-height="gridHeight"
      :guide-width="0"
      :guide-line="0"
    />

    <CursorInfo :info-x="infoX" :info-y="infoY" :info-grid="gridWidth" :info-width="infoWidth" :info-char="infoChar" />

    <span id="merge-core-for-ruler-calc" ref="mergeCoreElmFix" />
    <span
      id="merge-core-for-ruler-canvas"
      ref="mergeCoreElmVar"
      :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight() + 'px' }"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated, watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Textoverlay from 'textoverlay';

import { userTextEditorDataStore } from '@/data/config/StoreTextEditor';
import { MergeCore } from '@/char/MergeCore';
import { wait } from '@/lib/wait';

import RulerCanvas from '@components/ruler/RulerCanvas.vue';
import CursorInfo from '@components/TextEditor/CursorInfo.vue';

const store = userTextEditorDataStore();
const { lineHeight } = store;
const { fontSize, colorSpaceZenkaku, colorSpaceUnicode, colorSpaceWarning, komaPart, cursorPositionX } =
  storeToRefs(store);

const mergeCoreElmFix = ref<InstanceType<typeof HTMLElement> | null>(null);
const mergeCoreElmVar = ref<InstanceType<typeof HTMLElement> | null>(null);
const rulerCanvas = ref<InstanceType<typeof RulerCanvas> | null>(null);
const textArea = ref<InstanceType<typeof HTMLTextAreaElement> | null>(null);

let mergeCoreFix: MergeCore = new MergeCore(null, 16); //文字列処理用
let mergeCoreVar: MergeCore = new MergeCore(null, fontSize.value); //ルーラーなどのUI系
let textoverlay: Textoverlay | null | undefined;

const gridWidth = ref(16);
const gridHeight = ref(18);
const editorWidth = ref(0);
const editorHeight = ref(0);
const infoX = ref(0);
const infoY = ref(0);
const infoWidth = ref(0);
const infoChar = ref('');

defineExpose({
  focus,
  selectionStart,
  insertTextArea,
  updateTextArea
});

onMounted(() => {
  console.log('onMounted: TextEditorMain');
  changedFontSize();

  setInfoChar();
  setTextOverlay();
});

onUpdated(() => {
  //console.log("onUpdated: TextEditor");
  textoverlay?.render();
});

onUnmounted(() => {
  unsetInfoChar();
  if (textoverlay) {
    textoverlay.destroy();
    textoverlay = null;
  }
});

// event
watch(fontSize, () => {
  changedFontSize();
});
watch(colorSpaceZenkaku, () => {
  setTextOverlay();
});
watch(colorSpaceUnicode, () => {
  setTextOverlay();
});
watch(colorSpaceWarning, () => {
  setTextOverlay();
});

//
// 編集系
//
function selectionStart(): number {
  if (!textArea.value) return 0;
  return textArea.value.selectionStart;
}

function updateTextArea(text: string) {
  if (!textArea.value) return;
  textArea.value.focus();
  document.execCommand('selectAll', false);
  document.execCommand('insertText', false, text);
}

function insertTextArea(text: string) {
  if (!textArea.value) return;
  textArea.value.focus();
  document.execCommand('insertText', false, text);
}

//
// 表示系
//
function changedFontSize() {
  console.log('changedFontSize');
  if (!mergeCoreElmFix.value) return;
  if (!mergeCoreElmVar.value) return;
  if (!textArea.value) return;

  mergeCoreFix = new MergeCore(mergeCoreElmFix.value, 16);

  // === リアクティブの反応が前後するときがあるので、ここで強制的に適用させる
  if (!mergeCoreElmVar.value) return;
  mergeCoreElmVar.value.style.fontSize = fontSize.value + 'px';
  mergeCoreVar = new MergeCore(mergeCoreElmVar.value, fontSize.value);

  editorWidth.value = document.body.clientWidth - 250; //250:右リスト
  editorHeight.value = document.documentElement.clientHeight - 76; // 76:ツールバーの高さ

  gridWidth.value = mergeCoreVar.gridWidth;
  gridHeight.value = (18 / 16) * lineHeight();

  if (!rulerCanvas.value) return;
  rulerCanvas.value.draw();

  Promise.resolve()
    .then(wait(10))
    .then(() => {
      setTextOverlay();
    });
}

function focus() {
  textArea.value?.focus();
}

//
// TextOverlay
//
async function setTextOverlay() {
  // Textoverlayがデータ変更時に残るので
  // textoverlay.jsについて
  // dist/textoverlay.js の this.overlay.style.zIndex = 2; と固定でやっている。そうでないのTextAreaのz-indexのせいで表示しない

  textoverlayClear();
  if (!textArea.value) return;
  const textarea = textArea.value as HTMLTextAreaElement;
  const tlConfig: { match: RegExp; css: { [name: string]: string } }[] = [];

  //全角スペース
  if (colorSpaceZenkaku.value) {
    tlConfig.push({ match: /\u3000/g, css: { 'background-color': '#ffff00' } });
  }
  //半角スペース2個以上
  if (colorSpaceWarning.value) {
    tlConfig.push({ match: /  +/g, css: { 'background-color': '#ffeeff' } });
    tlConfig.push({ match: /\n /g, css: { 'background-color': '#ffeeff' } });
  }
  //ユニコード空白
  if (colorSpaceUnicode.value) {
    tlConfig.push({
      match: /\u200a|\u2009|\u2006|\u2005|\u2004|\u2002|\u2007|\u2003/g,
      css: { 'background-color': '#f5b041' }
    });
  }

  textoverlay = new Textoverlay(textarea, tlConfig);
  textoverlay.render();
}

function textoverlayClear() {
  const overlay = document.getElementsByClassName('textoverlay');
  const len = overlay.length;
  for (let i = 0; i < len; i += 1) {
    overlay[i].remove();
  }
  document.querySelectorAll('.textoverlay-backdrop').forEach((elm) => {
    elm.remove();
  });
}

//
// CharInfo
//
function setInfoChar() {
  if (!textArea.value) return;
  const textarea = textArea.value;

  textarea.addEventListener('keyup', infoCharStat);
  textarea.addEventListener('mousedown', infoCharStat);
  textarea.addEventListener('click', infoCharStat);
}

function unsetInfoChar() {
  if (!textArea.value) return;
  const textarea = textArea.value;

  textarea.removeEventListener('keyup', infoCharStat);
  textarea.removeEventListener('mousedown', infoCharStat);
  textarea.removeEventListener('click', infoCharStat);
}

function infoCharStat() {
  if (!textArea.value) return;
  const point = textArea.value.selectionStart;

  let x = 0;
  let y = 0;
  let cline = '';
  let cchar = '';

  for (let i = 0; i < point; i++) {
    const cur_char = komaPart.value.data.substring(i, i + 1);
    cchar = komaPart.value.data.substring(i + 1, i + 2);
    if (komaPart.value.data.substring(i, i + 1) == '\n') {
      cline = '';
      y += 1;
      x = 0;
    } else {
      cline += cur_char;
      x += 1;
    }
  }

  infoX.value = x;
  infoY.value = y;
  infoWidth.value = mergeCoreFix.measureWidth(cline);
  infoChar.value = infoCharString(cchar);
  cursorPositionX.value = x;
}

function infoCharString(char: string): string {
  if (char == '\n') {
    return 'CRLF';
  }
  const sname = mergeCoreFix.spaceCharInfo(char);
  if (sname != '') {
    return sname;
  }
  return char;
}
</script>

<style scoped>
#editor {
  margin: 0;
  padding: 0;
  height: calc(100vh - 100px - 20px);
  width: calc(100vw - 250px);
  background-color: var(--bg-color1);
  overflow: none;
}
#rulerCanvas {
  position: absolute;
  top: 0px;
  left: 20px;
  height: calc(100vh - 100px - 20px);
  width: calc(100vw - 250px - 20px);
  border: 1px solid #ccc;
  background-color: var(--canvas-bg-color);
  opacity: 1;
  z-index: 0;
}
#textArea {
  position: relative;
  top: 20px;
  left: 40px;
  font-family: 'Saitamaar';
  white-space: pre;
  height: calc(100vh - 100px - 30px - 20px);
  width: calc(100vw - 250px - 10px - 40px);
  resize: none;
  border: solid var(--border-color);
  border-width: 0px 1px 1px 0px;
  z-index: 2;
}
#textArea:focus {
  outline: none;
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
#merge-core-for-ruler-canvas {
  font-family: 'Saitamaar';
  font-weight: normal;
  white-space: pre;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -100;
  visibility: hidden;
  font-size: 16px;
  line-height: 18px;
}
</style>

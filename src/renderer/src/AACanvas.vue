<template>
  <el-container id="aa-canvas">
    <el-header id="toolbar">
      <AACanvasToolbar
        :enable-copy-button="enableCopyButton()"
        :enable-paste-button="clipboadKomaParts.length > 0"
        @add-new-koma-part-select="addNewKomaPart_Selector"
        @add-new-koma-part-edit="addNewKomaPart_TextEditor"
        @add-new-koma-part-edit-mini="addNewKomaPart_MiniEditor"
        @merge-koma-parts="mergeKomaParts_UpdateList"
        @undo-merge-koma-parts="undoMergeKomaParts"
        @undo-trash-koma-parts="undoTrashKomaPart"
        @copy-koma-parts="komaPart2Clipboad"
        @paste-koma-parts="pasteKomaParts"
        @close-editor="closeEditor"
        @clear-all-koma-parts="clearAllKomaParts"
      />
    </el-header>
    <div id="main">
      <div id="main-col">
        <AACanvasMain
          ref="aaCanvasMain"
          @set-koma-part="setKomaPart"
          @open-text-editor="openTextEditor"
          @config-merge-layer-dialog="configMergeLayerDialog"
          @duplicate-koma-part="duplicateKomaPart"
          @trash-koma-part="trashKomaPart"
          @sort-koma-parts="sortKomaParts"
        />
      </div>
      <div id="list-col">
        <div id="aa-layer-tab-0">
          <el-checkbox v-model="visibleAALayerList" size="small">
            <format-list-bulleted-icon :size="20" />
          </el-checkbox>
        </div>
        <AACanvasKomaPartsList
          :class="{ visibleAALayerList: !visibleAALayerList }"
          @uiview="true"
          @open-text-editor-mini="openTextEditorMini"
          @open-text-editor="openTextEditor"
          @config-merge-layer-dialog="configMergeLayerDialog"
          @duplicate-koma-part="duplicateKomaPart"
          @trash-koma-part="trashKomaPart"
          @sort-koma-parts="sortKomaParts"
        />
      </div>
    </div>
  </el-container>
  <MergeLayerDialog
    v-model="visibleMergeLayerDialog"
    :koma-part="configKomaPart"
    @set-koma-part="setKomaPart"
    @set-merge-layer-mode="setMergeLayerMode"
  />
  <span id="merge-core-for-calc" ref="mergeCoreElm" />
</template>

<script lang="ts" setup>
import { onMounted, onBeforeMount, ref, Ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { storeToRefs } from 'pinia';

import FormatListBulletedIcon from 'vue-material-design-icons/FormatListBulleted.vue';

import AACanvasMain from '@components/AACanvas/AACanvasMain.vue';
import AACanvasToolbar from '@components/AACanvas/AACanvasToolbar.vue';
import AACanvasKomaPartsList from '@components/AACanvas/AACanvasKomaPartsList.vue';
import MergeLayerDialog from '@components/Dialog/MergeLayerDialog.vue';

import { i18n } from '@/lib/i18n';
import { wait } from '@/lib/wait';

import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';
const store = userAACanvasDataStore();
const {
  filePath,
  koma,
  komaParts,
  configAddLineBreakAtTop,
  configAddLineBreakAtBottom,
  enableUndoMergeButton,
  enableUndoTrashButton,
  enableMergeButton
} = storeToRefs(store);
const { sweep } = store;

import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';
const storeClipboad = userClipboadKoma();
const { selectedKomaPartsID, clipboadKomaParts } = storeToRefs(storeClipboad);
const { selectToClipboad, getSelectedKomaParts } = storeClipboad;

import { Koma, KomaPart } from '@model/index';
import { MergeCore } from '@/char/MergeCore';
import { String2x } from '@/char/String2x';
import { KomaPartsClient } from '@/data/KomaPartsClient';

const visibleAALayerList = ref(true);
const aaCanvasMain = ref<InstanceType<typeof AACanvasMain> | null>(null);
const mergeCoreElm = ref<InstanceType<typeof HTMLSpanElement> | null>(null);

let kpClient = new KomaPartsClient(filePath.value, koma.value.id);
const komaPartsLength = ref(0);

onBeforeMount(() => {
  passiveIPC();
});

onMounted(() => {
  window.menu.visibleKomaPartsList(() => {
    visibleAALayerList.value = !visibleAALayerList.value;
  });
});

watch(komaPartsLength, () => {
  enableMergeButton.value = komaParts.value.length > 1;
  enableUndoMergeButton.value = kpClient.hasMergedKomaParts();
  enableUndoTrashButton.value = kpClient.hasTrashedKomaParts();
});

function passiveIPC() {
  window.appWindow.openAACanvasSTEP2((_event, dic) => {
    filePath.value = dic['path'];
    koma.value = JSON.parse(dic['strKoma']);
    kpClient = new KomaPartsClient(filePath.value, koma.value.id);
    //komaParts.value = JSON.parse(dic['strKomaParts']);
    updateList();
  });

  window.appWindow.closeMLTSelectorSTEP2((_event, aa) => {
    if (aa == '') return;
    const komaPart = new KomaPart();
    komaPart.data = aa;
    addNewKomaPart(komaPart);
  });

  window.appWindow.saveTextEditorSTEP2((_event, dic) => {
    const kpart = JSON.parse(dic['strKomaPart']);
    kpClient.setKomaPart(kpart);
    if (dic['strSplitKomaPart']) {
      const skpart = JSON.parse(dic['strSplitKomaPart']);
      kpClient.insertKomaPart(skpart);
    }
    updateList();
    saveData();
  });

  window.appWindow.closeTextEditorSTEP2(() => {
    updateList();
    saveData();
  });
}

function updateListPromise(p: Promise<Array<KomaPart>>) {
  p.then((response) => {
    komaParts.value = response;
    komaPartsLength.value = komaParts.value.length;
  });
}
function updateList() {
  const promise: Promise<Array<KomaPart>> = kpClient.getKomaParts();
  promise.then((response) => {
    komaParts.value = response;
    komaPartsLength.value = komaParts.value.length;
  });
}

// EDIT
function addNewKomaPart(komaPart: KomaPart) {
  komaPart.html = String2x.html(komaPart.data);
  kpClient.insertKomaPart(komaPart);
  updateList();
}
function addNewKomaPart_Selector() {
  window.appWindow.openMLTSelector();
}
function addNewKomaPart_TextEditor() {
  const id = kpClient.addNewKomaPart();
  updateList();
  const promise: Promise<KomaPart> = kpClient.getKomaPart(id);
  promise.then((response) => {
    if (!response) return;
    openTextEditor(response);
  });
}
function addNewKomaPart_MiniEditor() {
  const id = kpClient.addNewKomaPart();
  updateList();
  const promise: Promise<KomaPart> = kpClient.getKomaPart(id);
  promise.then((response) => {
    if (!response) return;
    openTextEditorMini(response);
  });
}
function openTextEditor(komaPart: KomaPart) {
  const dic = { path: filePath.value, strKomaPart: JSON.stringify(komaPart) };
  window.appWindow.openTextEditorSTEP1(dic);
}
function openTextEditorMini(komaPart: KomaPart) {
  Promise.resolve()
    .then(wait(200))
    .then(() => {
      if (!aaCanvasMain.value) return;
      aaCanvasMain.value.textEditMini(komaPart);
    });
}

function setKomaPart(kpart: KomaPart) {
  kpClient.setKomaPart(kpart);
}

function sortKomaParts(kpart_id: number, oldOrderNum: number, newOrderNum: number) {
  const promise = kpClient.sortKomaParts(kpart_id, oldOrderNum, newOrderNum);
  updateListPromise(promise);
}

function duplicateKomaPart(kpart: KomaPart) {
  selectedKomaPartsID.value = {};

  kpClient.duplicateKomaPart(kpart);
  updateList();
  saveData();
}

function trashKomaPart(kpart: KomaPart) {
  kpClient.trashKomaPart(kpart);
  updateList();
  saveData();
}

function undoTrashKomaPart() {
  const promise = kpClient.undoTrashKomaPart();
  updateListPromise(promise);
  saveData();
}

function undoMergeKomaParts() {
  const promise = kpClient.undoMergeKomaParts();
  updateListPromise(promise);
  saveData();
}

function clearAllKomaParts() {
  ElMessageBox.confirm(i18n.t('AACV.DeleteAllAAParts'), i18n.t('Warning'), {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    for (const kpart of komaParts.value) {
      kpClient.trashKomaPart(kpart);
    }
    updateList();
    ElMessage({
      type: 'success',
      message: i18n.t('AACV.Deleted')
    });
    saveData();
  });
}

function closeEditor() {
  saveData();
  close();
}

function saveData() {
  const data = mergeKomaParts(komaParts.value).data;
  koma.value.data = addLineBreaks(data);
  koma.value.html = String2x.html(koma.value.data);
  window.localDB.setKoma({
    path: filePath.value,
    strKoma: JSON.stringify(koma.value)
  });
}

function close() {
  window.appWindow.closeAACanvasSTEP1({
    path: filePath.value,
    strKoma: JSON.stringify(koma.value)
  });
  sweep();
  selectedKomaPartsID.value = {};
}

//
// Merge KomaParts
//
function mergeKomaParts(kparts: KomaPart[]): KomaPart {
  if (kparts.length == 0) {
    return new KomaPart();
  }
  const mc = new MergeCore(mergeCoreElm.value, 16);
  const newkpart = mc.mergeKomaPartsArray(kparts);

  if (!newkpart) throw 'merge error2';
  return newkpart;
}

function mergeKomaParts_UpdateList() {
  let mergedKPart: KomaPart;
  try {
    mergedKPart = mergeKomaParts(komaParts.value);
    koma.value.data = mergedKPart.data;
    koma.value.html = String2x.html(mergedKPart.data);
  } catch {
    return;
  }
  kpClient.mergeKomaParts(koma.value, mergedKPart);
  updateList();
  saveData();
}

function addLineBreaks(text: string): string {
  text = String2x.addLineBreaksAtTop(configAddLineBreakAtTop.value, text);
  text = String2x.addLineBreaksAtBottom(configAddLineBreakAtBottom.value, text);
  return text;
}

//
// select koma part
//
function komaPart2Clipboad() {
  // 以下の2つの機能を実行する
  // 1) OSのクリップボードにコピーする
  // 2) アプリ内クリップボードにコピーする(KomaとKomaPart)
  const kparts: KomaPart[] = getSelectedKomaParts(komaParts.value);

  const koma = new Koma();
  let mergedKPart: KomaPart;
  try {
    mergedKPart = mergeKomaParts(kparts);
    koma.data = mergedKPart.data;
  } catch {
    console.log('error');
  }

  selectToClipboad(koma, komaParts.value);

  ElMessage({ message: i18n.t('AACV.Copied'), duration: 900 });
}

function pasteKomaParts() {
  selectedKomaPartsID.value = {};

  for (const kpart of clipboadKomaParts.value.reverse()) {
    kpClient.insertKomaPart(kpart);
  }
  saveData();
  updateList();
}

function enableCopyButton(): boolean {
  for (const kp of komaParts.value) {
    if (selectedKomaPartsID.value[kp.id]) {
      return true;
    }
  }
  return false;
}

//
// dialog
//
const visibleMergeLayerDialog = ref(false);
const configKomaPart: Ref<KomaPart> = ref(new KomaPart());
function configMergeLayerDialog(komaPart: KomaPart) {
  configKomaPart.value = komaPart;
  visibleMergeLayerDialog.value = true;
}
function setMergeLayerMode(mlMode: number) {
  if (configKomaPart.value.id == 0) return;
  configKomaPart.value.mode = mlMode;
  kpClient.setKomaPart(configKomaPart.value);
  saveData();
}
</script>

<style lang="css">
@import './assets/css/app.css';
</style>

<style scoped>
#toolbar {
  height: 70px; /* .el-headerが60px固定なので */
  margin-bottom: 16px;
}
#main {
  position: relative;
  height: calc(100vh - 70px - 24px);
}
#main-col {
  position: relative;
  height: calc(100vh - 70px - 24px);
}
#list-col {
  width: 200px;
  box-sizing: border-box;
  margin-left: 20px;
  margin-bottom: 20px;
  position: absolute;
  right: 18px;
  top: -25px;
}
.visibleAALayerList {
  display: none;
}
#aa-layer-tab-0 {
  text-align: right;
}
#aa-layer-tab-0 > label {
  border: solid #ccc 1px;
  margin-bottom: -1px;
  padding: 0 8px;
  background-color: var(--bg-color0);
}
#etc-info {
  margin: 4px 2px 2px 20px;
}
#merge-core-for-calc {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -199;

  font-family: 'Saitamaar';
  white-space: pre;
  font-weight: normal;
  color: #000;
  background-color: #ffffff;
  font-size: 16px;
  line-height: 18px;
}
</style>

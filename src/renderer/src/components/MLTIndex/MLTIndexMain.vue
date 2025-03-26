<template>
  <div id="file-view-main">
    <MLTIndexToolbar
      :app-activity="props.appActivity"
      :item="fileItem"
      :sections="list.sections"
      :enable-trash-button="enableTrashButton"
      @add-koma="insertNewKomaAndEdit"
      @find-koma="findbar(FindMode.Find)"
      @replace-koma="findbar(FindMode.Replace)"
      @move-to-edge="moveToEdge"
      @move-to-koma="moveToKoma"
      @move-by-number="findbar(FindMode.MoveByNumber)"
      @undo-trash="undoTrash"
      @empty-trash="emptyTrash"
    />
    <MLTIndexFindbar
      :find-mode="findMode"
      @move-by-number="moveByNumber"
      @find-koma="findKoma"
      @replace-koma="replaceKoma"
      @replace-all-koma="replaceAllKoma"
      @close="findbar(FindMode.Default)"
    />
    <MLTIndexTab :app-activity="props.appActivity" />

    <el-main id="koma-list-wrapper" :style="{ 'font-size': fontSize + 'px', 'line-height': lineHeight() + 'px' }">
      <div
        id="koma-list"
        :style="{ display: viewMode == ViewMode.Column ? 'block' : 'flex' }"
        :class="['koma-list-' + tabMode]"
      >
        <div v-for="(koma, num) in list.komas" :id="'koma-' + koma.id" :key="koma.id" :kid="koma.id" class="koma">
          <div class="aa" @mouseover="mouseOverAction(koma.id)" @mouseleave="mouseLeaveAction">
            <!-- class="aa-header" -->
            <div class="aa-header">
              <div class="aa-header-left">
                <span class="aa-header-label">{{ num + 1 }}</span>
              </div>
              <div v-if="checkMouseOver(koma.id)" class="aa-header-right">
                <KomaToolbar
                  :item="fileItem"
                  :koma="koma"
                  :app-activity="props.appActivity"
                  @close-palette-selector="closePaletteSelector(koma)"
                  @edit-koma="editKoma(koma)"
                  @insert-new-koma="insertNewKoma(koma.order_num)"
                  @paste-koma="pasteKoma(koma)"
                  @trash-koma="trashKoma(koma)"
                />
                <div
                  v-if="props.appActivity == AppActivity.MainIndex && fileItem.type == ItemType.LocalDB"
                  class="handle"
                >
                  <drag-horizontal-variant-icon :size="16" />
                </div>
              </div>
            </div>
            <!-- class="aa-header" -->
            <div
              v-if="findMode != FindMode.Default && checkFindKoma(findKomaVal, koma)"
              class="aakoma"
              v-html="decorateFindKeyword(koma.data)"
            />
            <div v-else class="aakoma" v-html="koma.html" />
          </div>
          <!-- class="aa" -->
        </div>
        <!-- koma list -->

        <!-- error message -->
        <div v-if="errorMessage != ''">
          <span class="kara-message">{{ errorMessage }}</span>
        </div>
      </div>
    </el-main>
    <span id="merge-core-for-calc" ref="mergeCoreElm" />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, nextTick, onMounted, watch, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import Sortable from 'sortablejs';

import DragHorizontalVariantIcon from 'vue-material-design-icons/DragHorizontalVariant.vue';

import MLTIndexTab from '@components/MLTIndex/MLTIndexTab.vue';
import KomaToolbar from '@components/MLTIndex/KomaToolbar.vue';
import MLTIndexToolbar from '@components/MLTIndex/MLTIndexToolbar.vue';
import MLTIndexFindbar from '@components/MLTIndex/MLTIndexFindbar.vue';

import { AppActivity, Item, ItemType, Koma, KomaList, ViewMode, FindMode, KomaPart } from '@model/index';
import { ListManager } from '@/data/ListManager';
import { KomaPartsClient } from '@/data/KomaPartsClient';
import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';
import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';
import { String2x } from '@/char/String2x';

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { fileItem, fontSize, viewMode, tabMode, visiblePopInitialStartupKoma } = storeToRefs(store);
const { lineHeight, getTabItem } = store;
const { configAddLineBreakAtTop, configAddLineBreakAtBottom } = storeToRefs(userAACanvasDataStore());

const storeClipboad = userClipboadKoma();
const { clipboadKoma, clipboadKomaParts } = storeToRefs(storeClipboad);
const { clearClipboad } = storeClipboad;

const list: Ref<KomaList> = ref(new KomaList(new Item(ItemType.WebMLT)));
const lm: ListManager = new ListManager();
let errorMessage = '';
const enableTrashButton = ref(false);

// vue lifecycle
watch(
  () => fileItem.value,
  () => {
    updateItem(fileItem.value);
    setSortable();
    if (props.appActivity == AppActivity.MainIndex) {
      window.appConfig.setCurrentFile(fileItem.value.url);
    }
  }
);

onMounted(() => {
  startScrollDetector();
  updateList();
  passiveIPC();
  console.log('ACT:' + props.appActivity);
});

onUnmounted(() => {
  clearClipboad();
});

//
//
//
function passiveIPC() {
  window.appWindow.closeAACanvasSTEP2((_event, dic) => {
    updateViewKoma(JSON.parse(dic['strKoma']));
  });
}

function updateItem(item: Item) {
  console.log('updateItem');
  if (item.url == null || item.url == '') return;
  updateList();
}

async function updateList0() {
  const promise: Promise<KomaList> = lm.getKomaList(fileItem.value);
  promise.then((response) => {
    const tmpList = response;
    list.value = new KomaList(fileItem.value);
    list.value.base = tmpList.base;
    list.value.sections = tmpList.sections;
    list.value.komas = tmpList.komas;
  });
}

async function updateList() {
  findMode.value = FindMode.Default;

  console.log('updateList' + fileItem.value.name);
  if (fileItem.value.url == null || fileItem.value.url == '') return;

  const dom = document.querySelector('#koma-list-wrapper');
  //if (dom) dom.scrollTo(0, 0);
  list.value = new KomaList(fileItem.value);

  const promise: Promise<KomaList> = lm.getKomaList(fileItem.value);
  promise.then((response) => {
    const tmpList = response;
    list.value.base = tmpList.base;
    list.value.sections = tmpList.sections;
    const cap = tmpList.base.type != ItemType.LocalFolderDB && tmpList.komas.length > 10 ? 10 : tmpList.komas.length;
    const ary1 = tmpList.komas.splice(0, cap);
    const ary2 = tmpList.komas;
    // AAの数が多いとレンダリングに時間がかかるのでcap件まで表示し、その後に追加表示とスクロールをする。

    errorMessage = response.error == null ? '' : `${response.error?.name}: ${response.error?.message}`;

    list.value.komas = ary1;
    new Promise(() => {
      setTimeout(() => {
        list.value.komas = list.value.komas.concat(ary2);
        nextTick(() => {
          //リスト描画後の処理としないとスクロール位置がずれる
          if (dom) {
            dom.scrollTo(0, fileItem.value.scroll);
          }
          setRecent();
          setSortable();
          checkInitialKomaFilie();
          if (props.appActivity == AppActivity.MainIndex) {
            window.appConfig.setExportMenu({ act: props.appActivity, file: fileItem.value.url });
          }
        });
      }, 1);
    });
  });

  if (fileItem.value.type == ItemType.LocalDB) {
    enableTrashButton.value = window.localDB.hasTrashedKomas({ path: fileItem.value.url });
  } else {
    enableTrashButton.value = false;
  }
}
function checkInitialKomaFilie() {
  if (visiblePopInitialStartupKoma.value != 0) {
    if (fileItem.value.type == ItemType.LocalDB && list.value.komas.length == 0) {
      visiblePopInitialStartupKoma.value = 2;
    }
  }
}

function moveToEdge(top: boolean) {
  const komaID = top ? list.value.komas[0].id : list.value.komas[list.value.komas.length - 1].id;
  scrollToKoma(komaID);
}
function moveToKoma(komaID: number) {
  const dom = document.getElementById('koma-' + komaID);
  if (dom) {
    dom.scrollIntoView();
  }
}
function scrollToKoma(komaID: number) {
  new Promise(() => {
    setTimeout(() => {
      nextTick(() => {
        const dom = document.getElementById('koma-' + komaID);
        if (!dom) return;
        const { top, bottom } = dom.getBoundingClientRect();
        if (top >= 0 && bottom <= window.innerHeight) return;
        dom.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      });
    }, 10);
  });
}

// スクロール位置を記憶する機能
function startScrollDetector() {
  const dom = document.querySelector('#koma-list-wrapper');
  if (dom) {
    let isScrolling: number;
    dom.addEventListener('scroll', () => {
      window.clearTimeout(isScrolling);
      isScrolling = window.setTimeout(() => {
        saveLine();
      }, 300);
    });
  }
}

function saveLine() {
  const dom = document.querySelector('#koma-list-wrapper');
  if (dom && list.value.komas.length > 0) {
    getTabItem().scroll = dom.scrollTop;
    fileItem.value.scroll = dom.scrollTop;
  }
}

function setRecent() {
  fileItem.value.access_date = new Date();
  window.markDB.setItem(JSON.stringify(fileItem.value));
}

function closePaletteSelector(koma: Koma) {
  window.appWindow.closeMLTSelectorSTEP1(koma.data);
}

// コマのツールバーを表示・非表示を切り替える
//   常時表示すると描画が遅くなる + 見た目が悪いため
const mouseOverID = ref(0);
function mouseOverAction(komaID: number) {
  mouseOverID.value = komaID;
}
function mouseLeaveAction() {
  mouseOverID.value = 0;
}
function checkMouseOver(komaID: number) {
  if (props.appActivity == AppActivity.MLTSelector) {
    return true;
  } else {
    return mouseOverID.value == komaID;
  }
}

//
// 編集機能
//
function insertNewKomaAndEdit() {
  const koma = new Koma();
  const dic = { path: fileItem.value.url, orderNum: -1, strKoma: JSON.stringify(koma) };
  koma.id = window.localDB.insertKoma(dic);
  updateList0();
  window.localDB.getKoma({ path: fileItem.value.url, komaID: koma.id }).then((koma: Koma) => {
    editKoma(koma);
  });
}

function editKoma(koma: Koma) {
  const skoma = JSON.stringify(koma);
  window.appWindow.openAACanvasSTEP1({ path: fileItem.value.url, strKoma: skoma });
}

function insertNewKoma(order_num: number) {
  const koma = new Koma();
  const dic = { path: fileItem.value.url, orderNum: order_num, strKoma: JSON.stringify(koma) };
  const id = window.localDB.insertKoma(dic);
  updateList0();
  scrollToKoma(id);
}

function pasteKoma(koma: Koma) {
  if (!clipboadKoma.value) return;
  if (!clipboadKomaParts.value) return;
  const dic = {
    path: fileItem.value.url,
    orderNum: koma.order_num,
    strKoma: JSON.stringify(clipboadKoma.value),
    strKomaParts: JSON.stringify(clipboadKomaParts.value)
  };
  const id = window.localDB.pasteKoma(dic);
  updateList0();
  scrollToKoma(id);
}

function sortKomas(id: number, oldOrderNum: number, newOrderNum: number) {
  const dic = { path: fileItem.value.url, komaID: id, oldOrderNum: oldOrderNum, newOrderNum: newOrderNum };
  window.localDB.sortKomas(dic);
  updateList();
}

function trashKoma(koma: Koma) {
  const dic = { path: fileItem.value.url, komaID: koma.id };
  window.localDB.trashKoma(dic);
  updateList();
}

function undoTrash() {
  const dic = { path: fileItem.value.url };
  window.localDB.undoTrashKoma(dic);
  updateList();
}

function emptyTrash() {
  const dic = { path: fileItem.value.url };
  window.localDB.deleteTrashedKomas(dic);
  updateList();
}

// AACanvasからの復帰後、またはKoma新規作成時に、スクロールして編集物が表示されるようにする
function updateViewKoma(koma: Koma) {
  let i = 0;
  for (const k of list.value.komas) {
    if (k.id == koma.id) {
      list.value.komas[i] = koma;
    }
    i += 1;
  }
  new Promise(() => {
    setTimeout(() => {
      nextTick(() => {
        scrollToKoma(koma.id);
      });
    }, 300);
  });
}

// Komaの並び換え機能
function setSortable() {
  const el = document.querySelector('#koma-list');
  if (el) {
    Sortable.create(el as HTMLElement, {
      handle: '.handle',
      animation: 150,
      invertSwap: true,
      swapThreshold: 0.6,
      onEnd: (event) => {
        const targeItem = event.item;
        const id = targeItem.getAttribute('kid');
        const oldIndex = event.oldIndex;
        const newIndex = event.newIndex;
        if (id != undefined && oldIndex != undefined && newIndex != undefined) {
          //意図しない挙動対策
          if (oldIndex != newIndex) {
            sortKomas(parseInt(id), list.value.komas[oldIndex].order_num, list.value.komas[newIndex].order_num);
          }
        }
      }
    });
  } else {
    console.log('koma-list not found');
  }
}

// moveByNumber
const findMode = ref(FindMode.Default);
function findbar(mode: FindMode) {
  findMode.value = findMode.value == mode ? FindMode.Default : mode;
  if (mode == FindMode.Default || findKomaVal.value.length == 0) {
    matchKomas.value = [];
    currentMatchKomas = [];
    currentMatchLocation = 0;
  }
}
function moveByNumber(num: number) {
  const koma = list.value.komas[num - 1];
  if (koma) {
    scrollToKoma(koma.id);
  }
}

//
// findKoma + replaceKoma
const findKomaVal = ref('');
const replaceKomaVal = ref('');
const matchKomas: Ref<Array<boolean>> = ref([]); //検索でマッチした
let currentMatchKomas: number[] = [];
let currentMatchLocation = 0;
let currentReplaceLocation = 0;

function decorateFindKeyword(htmldata: string): string {
  return String2x.html2(htmldata).replaceAll(findKomaVal.value, '<span class="match">' + findKomaVal.value + '</span>');
}

function findLoop(on: boolean) {
  if (on) {
    currentMatchLocation += 1;
    if (currentMatchLocation > currentMatchKomas.length - 1) {
      currentMatchLocation = 0;
    }
  } else {
    currentMatchLocation -= 1;
    if (currentMatchLocation < 0) {
      currentMatchLocation = currentMatchKomas.length - 1;
    }
  }
  if (currentMatchKomas[currentMatchLocation]) {
    scrollToKoma(currentMatchKomas[currentMatchLocation]);
  }
  //console.log('findLoop: ' + currentMatchKomas[currentMatchLocation]);
}

// findKoma
function findKoma(keyword: string, forward: boolean) {
  const reset = findKomaVal.value != keyword;
  findKomaVal.value = keyword;

  if (keyword.length == 0 || reset) {
    matchKomas.value = [];
    currentMatchKomas = [];
  }
  if (keyword.length == 0) {
    return;
  }

  if (reset) {
    let i = 0;
    list.value.komas.forEach((koma) => {
      matchKomas.value[i] = koma.data.match(keyword) != null;
      if (matchKomas.value[i]) {
        currentMatchKomas.push(koma.id);
      }
      i += 1;
    });
  }

  findLoop(forward);
}

function checkFindKoma(keyword: string, koma: Koma): boolean {
  if (keyword.length == 0) return false;
  return koma.data.match(keyword) != null;
}

// replaceKoma
function replaceKoma(keyword: string, replace: string) {
  replaceKomaVal.value = replace;
  if (currentReplaceLocation != currentMatchLocation) {
    findKoma(keyword, true);
    currentReplaceLocation = currentMatchLocation;
  } else {
    if (currentMatchKomas[currentMatchLocation]) {
      for (const koma of list.value.komas) {
        if (koma.id == currentMatchKomas[currentMatchLocation]) {
          replaceString(koma, keyword, replace);
        }
      }
    }
    currentReplaceLocation += 0.5;
  }
}
function replaceAllKoma(keyword: string, replace: string) {
  console.log('replaceAllKoma');
  replaceKomaVal.value = replace;
  findKoma(keyword, true);
  for (let i = 0; i < list.value.komas.length; i++) {
    if (matchKomas.value[i]) {
      replaceString(list.value.komas[i], keyword, replace);
    }
  }
}

import { mergeKomaParts, addLineBreaks } from '@/renderer/src/components/libchar/merge';
const mergeCoreElm = ref<InstanceType<typeof HTMLSpanElement> | null>(null);

function replaceString(koma: Koma, keyword: string, replace: string) {
  console.log('replaceString: ' + koma.id);
  const kpClient = new KomaPartsClient(fileItem.value.url, koma.id);
  const promise: Promise<Array<KomaPart>> = kpClient.getKomaParts();
  promise.then((response) => {
    const kparts = response;
    for (const kpart of kparts) {
      if (!kpart.data.match(keyword)) {
        continue;
      }
      kpart.data = kpart.data.replace(keyword, replace);
      kpart.html = String2x.html(kpart.data);
      window.localDB.setKomaPart({
        path: fileItem.value.url,
        strKomaPart: JSON.stringify(kpart)
      });
    }

    const data = mergeKomaParts(mergeCoreElm, kparts).data;
    koma.data = addLineBreaks(configAddLineBreakAtTop.value, configAddLineBreakAtBottom.value, data);
    koma.html = String2x.html(koma.data);
    window.localDB.setKoma({
      path: fileItem.value.url,
      strKoma: JSON.stringify(koma)
    });
  });
}
</script>

<style scoped>
#file-view-main {
  width: calc(100vw - 257px - 65px); /* 全体 左AppBar 左FileList */
  padding: 0;
  margin: 0;
}
#koma-list-wrapper {
  height: calc(100vh - 76px);
  padding: 0 0 24px 0;
  border-left: solid var(--border-color) 1px;
}
main {
  margin: 0 0 0 0;
  border-top: solid var(--border-color) 1px;
}

#koma-list {
  height: calc(100vh - 100px);
  display: block;
  flex-wrap: wrap;
}
#koma-list-wrapper::-webkit-scrollbar {
  width: 6px;
}
#koma-list-wrapper::-webkit-scrollbar-track {
  width: 6px;
  border-radius: 2px;
  background: var(--scrollbar--bg-color);
}
#koma-list-wrapper::-webkit-scrollbar-thumb {
  width: 6px;
  border-radius: 2px;
  background: #909399;
}
.koma-list-Vertical {
  margin-left: 220px;
  display: block;
}
.koma-list-Horizontal {
  height: 30px;
  display: block;
}

/* == */
.aa-header {
  margin: 0px;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 5fr;
  line-height: 20px;
  height: 20px;
  user-select: none;
  margin-bottom: 8px;
}
.aa-header-right {
  text-align: right;
  display: inline-block;
}

.aa-header-label {
  font-size: 12px;
  padding: 4px 0.7em 2px 0.5em;
  color: #666;
  border-top: solid 1px #f0f0f0;
  border-bottom: solid 1px #ccc;
  border-right: solid 1px #ccc;
  background: var(--aa-header-bg-color);
  color: var(--font-color);
}
/* == */
.handle {
  padding: 0px 8px 0 8px;
  display: inline-block;
  vertical-align: bottom;
}
.handle:hover {
  cursor: grab;
}
.koma {
  margin: -1px 0px 0 -1px;
  border: solid 1px #ccc;
  overflow: clip;
}
.aa {
  font-family: 'Saitamaar';
  font-weight: normal;
  white-space: pre;
  overflow: auto;
  white-space: nowrap;
  background-color: var(--aa-bg-color);
  padding: 0 0 4px 0;
}
.aa::-webkit-scrollbar {
  display: none;
}
.aa::-webkit-scrollbar {
  height: 2px;
  width: 4px;
}
.aa::-webkit-scrollbar-track {
  height: 2px;
  width: 6px;
  border-radius: 2px;
  background: var(--bg-color1);
}
.aa::-webkit-scrollbar-thumb {
  height: 2px;
  width: 6px;
  border-radius: 2px;
  background: #909399;
}
.aakoma {
  margin-left: 8px;
}
</style>

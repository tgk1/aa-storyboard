<template>
  <div id="file-view-main">
    <MLTIndexToolbar
      :app-activity="props.appActivity"
      :sections="list.sections"
      :enable-trash-button="enableTrashButton"
      @add-koma="insertNewKomaAndEdit"
      @jump-to-edge="jumpEdge"
      @jump-to-section="jumpSection"
      @undo-trash="undoTrash"
      @empty-trash="emptyTrash"
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
            <div v-html="koma.html" />
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

import { AppActivity, Item, ItemType, Koma, KomaList, ViewMode } from '@model/index';
import { ListManager } from '@/data/ListManager';
import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { fileItem, fontSize, viewMode, tabMode, visiblePopInitialStartupKoma } = storeToRefs(store);
const { lineHeight, getTabItem } = store;

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
  }
);

onMounted(() => {
  startScrollDetector();
  updateList();
  passiveIPC();
  console.log('QQ ACT:' + props.appActivity);
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

function jumpEdge(top: boolean) {
  const num = top ? list.value.komas[0].id : list.value.komas[list.value.komas.length - 1].id;
  jumpSection(num);
}
function jumpSection(num: number) {
  const dom = document.getElementById('koma-' + num);
  if (dom) {
    dom.scrollIntoView();
  }
}

function scrollKoma(num: number) {
  new Promise(() => {
    setTimeout(() => {
      nextTick(() => {
        const dom = document.getElementById('koma-' + num);
        if (!dom) return;
        const { top, bottom } = dom.getBoundingClientRect();
        if (top >= 0 && bottom <= window.innerHeight) return;
        dom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }, 100);
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
  scrollKoma(id);
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
  scrollKoma(id);
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
        scrollKoma(koma.id);
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
</style>

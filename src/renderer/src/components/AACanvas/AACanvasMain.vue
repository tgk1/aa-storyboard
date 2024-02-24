<template>
  <div id="aa-canvas-main-frame">
    <div
      v-if="initFlag"
      id="aa-canvas-main"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @click.self="canvasClick"
    >
      <div
        v-for="kpart of komaParts"
        :id="'koma-part-' + kpart.id"
        :key="kpart.id"
        :style="{ left: positionX(kpart.x), top: positionY(kpart.y), zIndex: kpart.order_num }"
        class="koma-part"
      >
        <div
          class="koma-part-data"
          :class="{ focuson: selectedKomaPartsID[kpart.id], viewButtonsOutline: enableEditButtons }"
          :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight() + 'px' }"
          @dblclick.self="sortKomaPartsTopLayer(kpart)"
          @mousedown.exact="selectKomaPart(kpart.id)"
          @mousedown.shift.exact="selectKomaParts(kpart.id)"
          v-html="kpart.html"
        ></div>
        <div class="koma-part-name" :style="{ visibility: enableEditButtons ? 'visible' : 'hidden' }">
          <el-button-group>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Edit')">
              <el-button class="sbutton" tabindex="-1" @click="openTextEditor(kpart)">
                <square-edit-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.MiniEdit')">
              <el-button class="sbutton" tabindex="-1" @click="textEditMini(kpart)">
                <tooltip-edit-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.ConfigMergeMode')">
              <el-button class="sbutton" tabindex="-1" @click="$emit('config-merge-layer-dialog', kpart)">
                <cog-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Replica')">
              <el-button class="sbutton" tabindex="-1" @click="$emit('duplicate-koma-part', kpart)">
                <plus-box-multiple-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Delete')">
              <el-button class="sbutton" tabindex="-1" @click="$emit('trash-koma-part', kpart)">
                <trash-can-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
          </el-button-group>
          <span
            v-if="editMiniKPartID != kpart.id"
            :id="'koma-part-name-handle-' + kpart.id"
            class="koma-part-name-handle"
            @mousedown.exact="selectKomaPart(kpart.id)"
            @mousedown.shift.exact="selectKomaParts(kpart.id)"
          >
            {{ kpart.name }} ::
          </span>
        </div>
      </div>
      <div class="editor-koma-part">
        <textarea
          v-for="kpart of komaParts"
          :id="'editor-koma-part-data-' + kpart.id"
          :key="kpart.id"
          v-model="kpart.data"
          :style="{
            top: positionY(kpart.y),
            left: positionX(kpart.x),
            zIndex: kpart.order_num,
            fontSize: fontSize + 'px',
            lineHeight: lineHeight() + 'px',
            resize: 'none'
          }"
          class="editor-koma-part-data"
          @change="setKomaPartTempEditor(kpart, kpart.data)"
        ></textarea>
      </div>
    </div>

    <span
      id="merge-core-for-ruler-canvas"
      ref="mergeCoreElm"
      :style="{ fontSize: fontSize + 'px', lineHeight: lineHeight() + 'px' }"
    />

    <RulerCanvas
      id="ruler-canvas"
      ref="rulerCanvas"
      :grid-width="gridWidth"
      :grid-height="gridHeight"
      :guide-width="guideWidth"
      :guide-line="guideLine"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, onUpdated, ref, Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import SquareEditOutlineIcon from 'vue-material-design-icons/SquareEditOutline.vue';
import TooltipEditOutlineIcon from 'vue-material-design-icons/TooltipEditOutline.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';
import PlusBoxMultipleOutlineIcon from 'vue-material-design-icons/PlusBoxMultipleOutline.vue';
import TrashCanOutlineIcon from 'vue-material-design-icons/TrashCanOutline.vue';

import RulerCanvas from '@components/ruler/RulerCanvas.vue';
import { KomaPart, CanvasGuideSizeUtil, canvasMinX, canvasMinY } from '@model/index';
import { MergeCore } from '@/char/MergeCore';
import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';
import { wait } from '@/lib/wait';
import { String2x } from '@/char/String2x';

// props / emits //
interface Emits {
  (e: 'config-merge-layer-dialog', kpart: KomaPart): void;
  (e: 'duplicate-koma-part', kpart: KomaPart): void;
  (e: 'open-text-editor', kpart: KomaPart): void;
  (e: 'set-koma-part', kpart: KomaPart): void;
  (e: 'sort-koma-parts', id: number, v1: number, v2: number): void;
  (e: 'trash-koma-part', kpart: KomaPart): void;
  (e: 'update-list'): void;
}
const emits = defineEmits<Emits>();
defineExpose({
  textEditMini,
  canvasClick
});

// pinia
const store = userAACanvasDataStore();
const { komaParts, canvasGuideSize, fontSize, enableEditButtons } = storeToRefs(store);
const { lineHeight, getTopOrderNum } = store;

const storeClipboad = userClipboadKoma();
const { selectedKomaPartsID } = storeToRefs(storeClipboad);

//
//
//

// HTML DOM refで取得する
const mergeCoreElm = ref<InstanceType<typeof HTMLElement> | null>(null);
const rulerCanvas = ref<InstanceType<typeof RulerCanvas> | null>(null);
const initFlag = ref(false);

// 各種設定値
const guideWidth: Ref<number> = ref(1);
const guideLine: Ref<number> = ref(1);
let canvasWidth = 0;
let canvasHeight = 0;

let mc: MergeCore = new MergeCore(null, fontSize.value);
const gridWidth: Ref<number> = ref(mc.gridWidth);
const gridHeight: Ref<number> = ref(mc.gridHeight);
const editMiniKPartID: Ref<number> = ref(-1);

// vue lifecycle
onMounted(() => {
  console.log('AACanvasMain: onMounted');
});
onUpdated(() => {
  setManupiKomaPart();
  changedFontSize();
});
onUnmounted(() => {
  console.log('AACanvasMain: onUnmounted');
  initFlag.value = false;
});

// vue event
watch(canvasGuideSize, () => {
  changedFontSize();
});
watch(fontSize, () => {
  changedFontSize();
});
watch(mergeCoreElm, () => {
  if (mergeCoreElm.value) {
    changedFontSize();
    initFlag.value = true;
    // 指定fontSizeによって座標が異なるので changedFontSizeが正常に働くタイミングを待つ
  }
});

function changedFontSize() {
  if (!mergeCoreElm.value) return;
  const elm = mergeCoreElm.value;

  // リアクティブの反応が前後するときがあるので、ここで強制的に適用させる
  elm.style.fontSize = fontSize.value + 'px';
  mc = new MergeCore(elm, fontSize.value);

  // 一文字幅だと差が出ないときがあるので、こうする。
  const guideCnt = mc.measureWidth('AAAAAAAAAA'); //10dot x 10個で100dot
  const guideW = guideCnt * (CanvasGuideSizeUtil.width(canvasGuideSize.value) / 100);

  guideWidth.value = guideW;
  guideLine.value = CanvasGuideSizeUtil.height(canvasGuideSize.value);

  gridWidth.value = mc.gridWidth;
  gridHeight.value = mc.gridHeight;

  if (!rulerCanvas.value) return;
  rulerCanvas.value.draw();

  const w = document.getElementById('aa-canvas-main-frame');
  if (!w) return;
  canvasWidth = w.getBoundingClientRect().width;
  canvasHeight = w.getBoundingClientRect().height;

  //emits('update-list'); //KomaPart座標の補正のため
}

function positionX(posX: number) {
  return posX * gridWidth.value + canvasMinX + 'px';
}
function positionY(y: number) {
  return y * gridHeight.value + canvasMinY + 'px';
}

//
// KomaPartをドラッグで移動する
//
function setManupiKomaPart() {
  for (const kpart of komaParts.value) {
    moveKomaPart(kpart);
  }
}
function moveKomaPart(kpart: KomaPart) {
  const elm = document.getElementById('koma-part-' + kpart.id);
  if (!elm) return;
  const cvframe = document.getElementById('aa-canvas-main-frame');
  if (!cvframe) return;
  const PAD = 70 + 20; // --el-header:70  --el-header-padding: 20

  elm.onmousedown = function (event: MouseEvent) {
    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseMove);
      elm.onmouseup = null;
      const x = parseInt(elm.style.left);
      const y = parseInt(elm.style.top);
      kpart.x = Math.ceil((modifyPositionX(x, elm.clientWidth) - canvasMinX) / mc.gridWidth);
      kpart.y = Math.ceil((modifyPositionY(y, elm.clientHeight) - canvasMinY) / mc.gridHeight);
      relayFunction(kpart);
    };
    document.onblur = () => {
      document.removeEventListener('mousemove', onMouseMove);
    };
    document.onclick = () => {
      document.removeEventListener('mousemove', onMouseMove);
    };

    const shiftX = event.clientX - elm.getBoundingClientRect().left;
    const shiftY = event.clientY - elm.getBoundingClientRect().top + PAD;

    relayFunction2();
    elm.style.position = 'absolute';
    moveAt(event.pageX, event.pageY);

    function moveAt(pageX: number, pageY: number) {
      if (elm) {
        elm.style.left = modifyPositionX(pageX - shiftX, elm.clientWidth) + 'px';
        elm.style.top = modifyPositionY(pageY - shiftY, elm.clientHeight) + 'px';
      }
    }

    function onMouseMove(event: MouseEvent) {
      moveAt(event.pageX, event.pageY);
    }

    function modifyPositionX(x: number, width: number): number {
      x = Math.round((x - canvasMinX) / mc.gridWidth) * mc.gridWidth + canvasMinX;
      x = x < canvasMinX ? canvasMinX : x;
      x = x > canvasMinX + canvasWidth - width - 60 ? canvasMinX + canvasWidth - width - 60 : x;
      return x;
    }

    function modifyPositionY(y: number, height: number): number {
      y = Math.round((y - canvasMinY) / mc.gridHeight) * mc.gridHeight + canvasMinY;
      y = y < canvasMinY ? canvasMinY : y;
      y = y > canvasMinY + canvasHeight - height - 22 ? canvasMinY + canvasHeight - height - 22 : y;
      return y;
    }

    document.removeEventListener('mousemove', onMouseMove);
    document.addEventListener('mousemove', onMouseMove);
  };

  const relayFunction = (kpart: KomaPart) => {
    // DOMの再表示時にdocument.onmouseupが実行され、古いデータが保存される可能性がある(なぜ?)
    // そのため存在を確認する。
    const kp = getKomaPart(kpart.id);
    if (kp) emits('set-koma-part', kpart);
  };
  const relayFunction2 = () => {
    hideEditor();
  };
}

function getKomaPart(kpartID: number): KomaPart | null {
  for (const kpart of komaParts.value) {
    if (kpart.id == kpartID) {
      return kpart;
    }
  }
  return null;
}

//
// 簡易エディター
//
function textEditMini(kpart: KomaPart) {
  if (kpart == null) return;
  const editor = document.getElementById('editor-koma-part-data-' + kpart.id);
  const view = document.getElementById('koma-part-' + kpart.id);
  if (!(view instanceof HTMLElement)) return;
  const elmc = view.getElementsByClassName('koma-part-data')[0];
  if (!(elmc instanceof HTMLElement)) return;
  if (!(editor instanceof HTMLTextAreaElement)) return;
  editMiniKPartID.value = kpart.id;

  editor.value = kpart.data;
  editor.style.width      = elmc.clientWidth + 200 + 'px';
  editor.style.height     = elmc.clientHeight + 100 + 'px';
  editor.style.top        = view.offsetTop + 'px';
  editor.style.left       = view.offsetLeft + 'px';
  editor.style.fontSize   = fontSize.value + 'px';
  editor.style.lineHeight = lineHeight() + 'px';
  editor.style.visibility = 'visible';
  editor.style.zIndex     = '100';
  editor.focus();
}

function canvasClick() {
  selectedKomaPartsID.value = {};
  editMiniKPartID.value = -1;
  Promise.resolve()
    .then(wait(100))
    .then(() => {
      hideEditor();
    });
}

function hideEditor() {
  for (const kpart of komaParts.value) {
    const elm = document.getElementById('editor-koma-part-data-' + kpart.id);
    if (!(elm instanceof HTMLElement)) return;
    if (elm.style.visibility == 'visible') {
      emits('set-koma-part', kpart);
    }
    elm.style.visibility = 'hidden';
    elm.style.zIndex = '-100';
  }
}

function setKomaPartTempEditor(kpart: KomaPart, data: string) {
  kpart.data = data;
  kpart.html = String2x.html(data);
  emits('set-koma-part', kpart);
}

// KomaPartを選択(青枠)
function selectKomaPart(id: number) {
  canvasClick();
  for (const kpart of komaParts.value) {
    if (kpart.id == id) {
      selectedKomaPartsID.value[kpart.id] = !selectedKomaPartsID.value[kpart.id];
    } else {
      selectedKomaPartsID.value[kpart.id] = false;
    }
  }
}
function selectKomaParts(id: number) {
  selectedKomaPartsID.value[id] = !selectedKomaPartsID.value[id];
}

// KomaPartの並び換え機能 (ダブルクリックしたKomaPartを最上位にする)
function sortKomaPartsTopLayer(komaPart: KomaPart) {
  emits('sort-koma-parts', komaPart.id, komaPart.order_num, getTopOrderNum());
}

function openTextEditor(kpart: KomaPart) {
  emits('open-text-editor', kpart);
}
</script>

<style scoped>
#aa-canvas-main-frame {
  margin: 0;
  height: calc(100vh - 70px - 24px);
}
#aa-canvas-main {
  padding: 0;
  margin: 0 0 0 0px;
}
#ruler-canvas {
  position: absolute;
  top: 0;
  margin: 0 20px 10px 20px;
  border: 1px solid #ccc;
  background-color: var(--canvas-bg-color);
  z-index: -999;
  opacity: 1;
  width: calc(100vw - 40px);
  height: calc(100vh - 86px - 16px);
}
#merge-core-for-ruler-canvas {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;

  font-family: 'Saitamaar';
  white-space: pre;
  font-weight: normal;
  color: #000;
  background-color: #ffffff;
  font-size: 16px;
  line-height: 18px;
}

.koma-part {
  display: inline;
  position: absolute;
  user-select: none;
  opacity: 1;
}
.editor-koma-part {
  display: inline;
}
.koma-part-data {
  font-family: 'Saitamaar';
  white-space: pre;
  font-weight: normal;
  outline: solid 1px rgba(1, 1, 1, 0);
  outline-offset: -1px;
  resize: 'none'; /* safariでゴミとして表示が残る(これがあっても少し残る)ので暫定対応 */
  color: #000;
  background-color: #ffffff;
  opacity: 1;
  user-select: none;
  margin-bottom: -3px;
}
.focuson {
  outline: solid 1px #409eff !important;
  outline-offset: -1px;
}
.viewButtonsOutline {
  outline: solid 1px rgba(0, 0, 0, 0.3);
  outline-offset: -1px;
  opacity: 0.8;
}
.editor-koma-part-data {
  font-family: 'Saitamaar';
  white-space: pre;
  font-weight: normal;
  outline: solid 1px #ccc;
  outline-offset: -1px;
  background-color: var(--textarea-mini-bg-color) !important;
  opacity: 1;
  margin: 0;
  padding: 0;
  position: absolute;
  visibility: hidden;
  top: 0;
  left: 0;
  z-index: -10;
}
textarea.editor-koma-part-data:focus {
  outline: solid 1px #409eff;
  outline-offset: -1px;
  background-color: var(--textarea-mini-bg-color) !important;
  margin: -1px;
}

.koma-part-name {
  text-align: right;
  user-select: none;
}
.koma-part-name-handle {
  vertical-align: top;
  padding: 0px 2px 0px 2px;
  border-left: solid 1px #ccc;
  border-right: solid 1px #ccc;
  border-bottom: solid 1px #ccc;
  white-space: nowrap;
  background-color: var(--bg-color1);
  font-size: 14px;
  line-height: 20px;
}
.koma-part:hover {
  cursor: grab;
}

.sbutton {
  opacity: 0.7;
  padding: 2px;
  margin: 2px 2px 2px 0;
  user-select: none;
  height: 18px;
  background-color: var(--bg-color1);
  vertical-align: middle;
}
</style>

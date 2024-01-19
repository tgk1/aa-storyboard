<template>
  <div id="koma-parts-list">
    <ul id="list-layer" @click.self="listClick">
      <div v-if="komaParts.length == 0">
        <div class="name">
          <span class="kara-message">
            (´･ω･｀)まだ作成してないです。
            <br />
            <el-button class="sbutton"><account-plus-icon :size="14" class="r" /></el-button>
            <el-button class="sbutton"><plus-box-icon :size="14" class="r" /></el-button>
            <el-button class="sbutton"><comment-plus-icon :size="14" class="r" /></el-button> で作成。
          </span>
        </div>
      </div>
      <li
        v-for="kpart of komaParts"
        :key="kpart.id"
        :kid="kpart.id"
        :class="{ focuson: selectedKomaPartsID[kpart.id] }"
        @mousedown.exact="selectKomaPart(kpart.id)"
        @mousedown.shift.exact="selectKomaParts(kpart.id)"
      >
        <div class="name">
          <div>
            <crop-square-icon :size="14" />
            <span>{{ kpart.name }}</span>
          </div>
          <el-button-group style="padding-left: 10px">
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Edit')">
              <el-button class="sbutton" @click="$emit('open-text-editor', kpart)">
                <square-edit-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.MiniEdit')">
              <el-button class="sbutton" @click="$emit('open-text-editor-mini', kpart)">
                <tooltip-edit-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.ConfigMergeMode')">
              <el-button class="sbutton" @click="$emit('config-merge-layer-dialog', kpart)">
                <cog-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Replica')">
              <el-button class="sbutton" @click="$emit('duplicate-koma-part', kpart)">
                <plus-box-multiple-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
            <el-tooltip effect="light" :show-after="950" :content="$t('AACV.Delete')">
              <el-button class="sbutton" @click="$emit('trash-koma-part', kpart)">
                <trash-can-outline-icon :size="14" />
              </el-button>
            </el-tooltip>
          </el-button-group>
        </div>
        <div class="handle">
          <drag-horizontal-variant-icon :size="14" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Sortable from 'sortablejs';

import SquareEditOutlineIcon from 'vue-material-design-icons/SquareEditOutline.vue';
import TooltipEditOutlineIcon from 'vue-material-design-icons/TooltipEditOutline.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';
import PlusBoxMultipleOutlineIcon from 'vue-material-design-icons/PlusBoxMultipleOutline.vue';
import TrashCanOutlineIcon from 'vue-material-design-icons/TrashCanOutline.vue';
import CropSquareIcon from 'vue-material-design-icons/CropSquare.vue';
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus.vue';
import PlusBoxIcon from 'vue-material-design-icons/PlusBox.vue';
import CommentPlusIcon from 'vue-material-design-icons/CommentPlus.vue';
import DragHorizontalVariantIcon from 'vue-material-design-icons/DragHorizontalVariant.vue';

import { KomaPart } from '@model/Koma';
import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';

// props // emits //
interface Emits {
  (e: 'config-merge-layer-dialog', kpart: KomaPart): void;
  (e: 'duplicate-koma-part', kpart: KomaPart): void;
  (e: 'open-text-editor', kpart: KomaPart): void;
  (e: 'open-text-editor-mini', kpart: KomaPart): void;
  (e: 'sort-koma-parts', id: number, v1: number, v2: number): void;
  (e: 'trash-koma-part', kpart: KomaPart): void;
}
const emits = defineEmits<Emits>();

// pinia
const store = userAACanvasDataStore();
const { komaParts } = storeToRefs(store);

const storeClipboad = userClipboadKoma();
const { selectedKomaPartsID } = storeToRefs(storeClipboad);

// vue lifecycle
onMounted(() => {
  setSortable();
});

function listClick() {
  selectedKomaPartsID.value = {};
}

// KomaPartを選択(青枠)
function selectKomaPart(id: number) {
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

// KomaPartの並び換え機能
function setSortable() {
  const el = document.querySelector('#list-layer');
  if (el) {
    Sortable.create(el as HTMLElement, {
      handle: '.handle',
      animation: 150,
      invertSwap: true,
      swapThreshold: 0.4,
      onEnd: (event) => {
        const targeLiItem = event.item;
        const kpart_id = targeLiItem.getAttribute('kid');
        const oldIndex = event.oldIndex;
        const newIndex = event.newIndex;
        if (kpart_id != undefined && oldIndex != undefined && newIndex != undefined) {
          //意図しない挙動対策
          if (oldIndex != newIndex) {
            emits(
              'sort-koma-parts',
              parseInt(kpart_id),
              komaParts.value[oldIndex].order_num,
              komaParts.value[newIndex].order_num
            );
          }
        }
      }
    });
  }
}
</script>

<style scoped>
#list-layer {
  padding: 0;
  margin: 0px;
  height: calc(60vh);
  overflow: auto;
  border: solid 1px #ccc;
  background-color: var(--bg-color0);
}
#list-layer li {
  list-style-type: none;
  padding: 0.4rem 0.5rem 0.3rem 0.5rem;
  border-bottom: solid var(--border-color) 1px;
  user-select: none;

  transition: background-color 0.25s ease;
  transition-property: background-color;
  transition-duration: 0.25s;
  transition-timing-function: ease;
  transition-delay: 0s;
}
#list-layer li.focuson {
  border-color: #409eff;
  border-width: 1px 1px 1px 1px;
  border-style: solid;
}
#list-layer li:hover {
  background-color: var(--list-hover-color);
}
.name {
  display: inline-block;
  vertical-align: baseline;
}
.name span {
  color: var(--font-color);
  padding: 4px;
}
.handle {
  display: inline-block;
  vertical-align: top;
  padding-top: 12px;
  padding-left: 16px;
  width: 16px;
  height: 16px;
}
.handle:hover {
  cursor: grab;
}

span.kara-message {
  font-size: 12px;
  color: var(--font-sub-color);
}
.sbutton {
  opacity: 0.7;
  padding: 2px 2px 0px 2px;
  margin: 2px 2px 2px 0;
  user-select: none;
  height: 22px;
  background-color: var(--bg-color1);
  vertical-align: middle;
}
</style>

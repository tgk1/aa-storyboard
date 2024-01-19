<template>
  <el-header id="file-view-header">
    <div id="file-view-header-toolbar">
      <el-button-group
        v-if="props.appActivity == AppActivity.MainIndex && fileItem.type == ItemType.LocalDB"
        class="ui-padding"
      >
        <el-button size="small" class="green" :tabindex="-1" @click="$emit('add-koma')">
          <plus-box-icon :size="16" /> {{ $t('IDX-R.CreateKoma') }}
          <InitialStartupPopKoma :app-activity="appActivity" />
        </el-button>
      </el-button-group>

      <el-button-group class="radio-ui-padding">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button v-model="viewMode" label="Column">
            <el-tooltip :content="$t('IDX-R.' + ViewMode.Column)" effect="light" placement="bottom" open-delay="1100">
              <view-sequential-outline-icon :size="16" />
            </el-tooltip>
          </el-radio-button>
          <el-radio-button v-model="viewMode" label="Grid">
            <el-tooltip :content="$t('IDX-R.' + ViewMode.Grid)" effect="light" placement="bottom" open-delay="1100">
              <view-module-outline-icon :size="16" />
            </el-tooltip>
          </el-radio-button>
        </el-radio-group>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-input-number v-model="fontSize" size="small" :min="6" :max="32" tabindex="-1"></el-input-number>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button size="small" :tabindex="-1" @click="$emit('jump-to-edge', true)">
          <arrow-collapse-up-icon :size="16" />
        </el-button>
        <el-button size="small" :tabindex="-1" @click="$emit('jump-to-edge', false)">
          <arrow-collapse-down-icon :size="16" />
        </el-button>
      </el-button-group>

      <div class="sel-ui">
        <el-select size="small" :placeholder="$t('IDX-R.Jump')" @change="jumpToSection">
          <el-option v-for="sec in props.sections" :key="sec.id" :label="sec.name" :value="sec.id" />
        </el-select>
      </div>

      <template v-if="props.appActivity == AppActivity.MainIndex && fileItem.type == ItemType.LocalDB">
        <el-button-group class="ui-padding">
          <el-button tabindex="-1" size="small" :disabled="!enableTrashButton" @click="$emit('undo-trash')">
            <undo-icon :size="16" class="r" /> {{ $t('IDX-R.UndoTrash') }}
          </el-button>
          <el-button tabindex="-1" size="small" :disabled="!enableTrashButton" @click="$emit('empty-trash')">
            <delete-forever-outline-icon :size="16" class="r" /> {{ $t('IDX-R.EmptyTrash') }}
          </el-button>
        </el-button-group>
      </template>
    </div>
    <el-button id="hiddenTitle"></el-button>
  </el-header>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import PlusBoxIcon from 'vue-material-design-icons/PlusBox.vue';
import ViewSequentialOutlineIcon from 'vue-material-design-icons/ViewSequentialOutline.vue';
import ViewModuleOutlineIcon from 'vue-material-design-icons/ViewModuleOutline.vue';
import ArrowCollapseDownIcon from 'vue-material-design-icons/ArrowCollapseDown.vue';
import ArrowCollapseUpIcon from 'vue-material-design-icons/ArrowCollapseUp.vue';
import UndoIcon from 'vue-material-design-icons/Undo.vue';
import DeleteForeverOutlineIcon from 'vue-material-design-icons/DeleteForeverOutline.vue';

import { AppActivity, ItemType, ViewMode, Section } from '@model/index';
import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';

import InitialStartupPopKoma from './InitialStartupPopKoma.vue';

interface Props {
  appActivity: AppActivity;
  sections: Section[];
  enableTrashButton: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  appActivity: AppActivity.MainIndex,
  sections: () => {
    return [];
  },
  enableTrashButton: false
});
interface Emits {
  (e: 'jump-to-section', section: number): void;
  (e: 'add-koma'): void;
  (e: 'undo-trash'): void;
  (e: 'empty-trash'): void;
  (e: 'jump-to-edge', top: boolean): void;
}
const emits = defineEmits<Emits>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { fileItem, fontSize, viewMode } = storeToRefs(store);

onMounted(() => {
  window.menu.switchListMode(() => {
    viewMode.value = viewMode.value == ViewMode.Column ? ViewMode.Grid : ViewMode.Column;
  });
  window.menu.scrollToEdge((toTop: boolean) => {
    emits('jump-to-edge', toTop);
  });
  window.menu.fontSize((increase: boolean) => {
    if (increase) {
      if (fontSize.value >= 32) return;
      fontSize.value += 1;
    } else {
      if (fontSize.value <= 6) return;
      fontSize.value -= 1;
    }
  });
  window.menu.addKoma(() => {
    emits('add-koma');
  });
});

//
//
//
function jumpToSection(secNum: number) {
  emits('jump-to-section', secNum);
}
</script>

<style scoped>
#file-view-header {
  padding: 0;
  margin: 0;
  border-bottom: solid var(--border-color) 1px;
  background-color: var(--bg-color1);
  user-select: none;
  height: 76px;
}
#file-view-header-toolbar {
  padding: 2px 4px;
  vertical-align: middle;
}
/* フォーカスが残らないようにする */
#hiddenTitle {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
}
.sel-ui {
  display: inline-block;
  width: 120px;
}
</style>

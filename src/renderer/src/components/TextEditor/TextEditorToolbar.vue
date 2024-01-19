<template>
  <el-row id="text-editor-header-toolbar" :gutter="24">
    <div>
      <el-button-group class="ui-padding">
        <el-button size="small" tabindex="-1" @click="$emit('close-editor')">
          <close-icon :size="16" class="r red" /> {{ $t('TEDIT.CloseEditor') }}
        </el-button>
        <el-button size="small" tabindex="-1" @click="$emit('save-data')">
          <content-save-outline-icon :size="16" class="r green" /> {{ $t('TEDIT.Save') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-input-number v-model="fontSize" tabindex="-1" size="small" :min="6" :max="32" />
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button size="small" tabindex="-1" @click="visibleColorSpaceDialog = true">
          <crop-free-icon :size="16" class="r" /> {{ $t('TEDIT.ColoringBlankCharacter') }}
        </el-button>
        <el-button size="small" tabindex="-1" @click="visibleMergeLayerDialog = true">
          <cog-outline-icon :size="16" class="r" /> {{ $t('TEDIT.MergeLayer') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button size="small" tabindex="-1" @click="visibleFrameDialog = true">
          <comment-outline-icon :size="16" class="r" /> {{ $t('TEDIT.CreateFrame') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button size="small" tabindex="-1" :disabled="cursorPositionX == 0" @click="$emit('delete-chars', true)">
          <chevron-left-icon :size="18" class="r" /> {{ $t('TEDIT.DeleteLeftSide') }}
        </el-button>
        <el-button size="small" tabindex="-1" :disabled="cursorPositionX == 0" @click="visibleSplitDialog = true">
          <unfold-more-vertical-icon :size="18" class="r" /> {{ $t('TEDIT.Split') }}
        </el-button>
        <el-button size="small" tabindex="-1" :disabled="cursorPositionX == 0" @click="$emit('delete-chars', false)">
          <chevron-right-icon :size="18" class="r" /> {{ $t('TEDIT.DeleteRightSide') }}
        </el-button>
      </el-button-group>
    </div>
    <ColoringBlankCharacterDialog v-model="visibleColorSpaceDialog" />
    <MergeLayerDialog
      v-model="visibleMergeLayerDialog"
      :koma-part="komaPart"
      @set-koma-part="setKomaPart"
      @set-merge-layer-mode="setMergeLayerMode"
    />
    <FrameDialog v-model="visibleFrameDialog" @select-frame-number="selectInsertFrame" />
    <SplitDialog v-model="visibleSplitDialog" @split-aa="actionSplitAA" />
  </el-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import CloseIcon from 'vue-material-design-icons/Close.vue';
import ContentSaveOutlineIcon from 'vue-material-design-icons/ContentSaveOutline.vue';
import CropFreeIcon from 'vue-material-design-icons/CropFree.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';
import CommentOutlineIcon from 'vue-material-design-icons/CommentOutline.vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import UnfoldMoreVerticalIcon from 'vue-material-design-icons/UnfoldMoreVertical.vue';

import { userTextEditorDataStore } from '@/data/config/StoreTextEditor';

import ColoringBlankCharacterDialog from '@components/Dialog/ColoringBlankCharacterDialog.vue';
import MergeLayerDialog from '@components/Dialog/MergeLayerDialog.vue';
import SplitDialog from '@components/Dialog/SplitDialog.vue';
import FrameDialog from '@components/Dialog/FrameDialog.vue';
import { wait } from '@/lib/wait';
import { KomaPart } from '@/data/model';

const store = userTextEditorDataStore();
const { fontSize, komaPart, cursorPositionX } = storeToRefs(store);

interface Emits {
  (e: 'close-editor'): void;
  (e: 'save-data'): void;
  (e: 'delete-chars', isLeftSide: boolean): void;
  (e: 'create-frame', frameNumber: number): void;
  (e: 'split-aa'): void;
}
const emits = defineEmits<Emits>();

// Dialog flag
const visibleColorSpaceDialog = ref(false);
const visibleMergeLayerDialog = ref(false);
const visibleFrameDialog = ref(false);
const visibleSplitDialog = ref(false);

onMounted(() => {
  window.menu.save(() => {
    emits('save-data');
  });
  window.menu.closeWindow(() => {
    emits('close-editor');
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
  window.menu.createFrame(() => {
    visibleFrameDialog.value = !visibleFrameDialog.value;
  });
  window.menu.splitKomaPart(() => {
    visibleSplitDialog.value = !visibleSplitDialog.value;
  });
  window.menu.deleteCharacters((leftSide: boolean) => {
    emits('delete-chars', leftSide);
  });
});

function setKomaPart(kpart: KomaPart) {
  komaPart.value.name = kpart.name;
}

function setMergeLayerMode(mlMode: number) {
  komaPart.value.mode = mlMode;
}

function selectInsertFrame(frameNumber: number) {
  visibleFrameDialog.value = false;
  emits('create-frame', frameNumber);
}

function actionSplitAA(action: boolean) {
  visibleSplitDialog.value = false;
  Promise.resolve()
    .then(wait(100))
    .then(() => {
      if (action) {
        emits('split-aa');
      }
    })
    .catch(function (err) {
      console.log(err);
    });

}
</script>

<style scoped>
#text-editor-header-toolbar {
  padding: 6px 12px;
  line-height: 23px;
  height: 34px; /* KomaPart座標取りのため固定 */
  user-select: none;
}
</style>

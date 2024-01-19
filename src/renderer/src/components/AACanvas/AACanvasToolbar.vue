<template>
  <el-row id="aacanvas-header-toolbar">
    <div class="toolbar-set">
      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" @click="$emit('close-editor')">
          <close-icon :size="16" class="r red" /> {{ $t('AACV.CloseEditor') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" @click="$emit('add-new-koma-part-select')">
          <account-plus-icon :size="16" class="r" /> {{ $t('AACV.AddKomaSelect') }}
        </el-button>
        <el-button tabindex="-1" size="small" @click="$emit('add-new-koma-part-edit')">
          <plus-box-icon :size="16" class="r" /> {{ $t('AACV.AddKomaEdit') }}
        </el-button>
        <el-button tabindex="-1" size="small" @click="$emit('add-new-koma-part-edit-mini')">
          <comment-plus-icon :size="16" class="r" /> {{ $t('AACV.AddKomaEditMini') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" :disabled="!enableMergeButton" @click="$emit('merge-koma-parts')">
          <call-merge-icon :size="16" class="r" /> {{ $t('AACV.Merge') }}
        </el-button>
        <el-button tabindex="-1" size="small" :disabled="!enableUndoMergeButton" @click="$emit('undo-merge-koma-parts')">
          <undo-icon :size="16" class="r" /> {{ $t('AACV.UndoMerge') }}
        </el-button>
        <el-button tabindex="-1" size="small" :disabled="!enableUndoTrashButton" @click="$emit('undo-trash-koma-parts')">
          <undo-icon :size="16" class="r" /> {{ $t('AACV.UndoTrash') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" :disabled="!prop.enableCopyButton" @click="$emit('copy-koma-parts')">
          <content-copy-icon :size="16" class="r" /> {{ $t('AACV.Copy') }}
        </el-button>
        <el-button tabindex="-1" size="small" :disabled="!prop.enablePasteButton" @click="$emit('paste-koma-parts')">
          <content-paste-icon :size="16" class="r" /> {{ $t('AACV.Paste') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" @click="$emit('clear-all-koma-parts')">
          <delete-outline-icon :size="16" class="r" /> {{ $t('AACV.ClearAllKomaParts') }}
        </el-button>
      </el-button-group>
    </div>

    <div>
      <el-button-group class="ui-padding">
        <el-button tabindex="-1" size="small" @click="visibleAddLineBreakDialog = true">
          <cog-outline-icon :size="16" class="r" /> {{ $t('AACV.Config') }}
        </el-button>
      </el-button-group>

      <el-button-group class="ui-padding">
        <el-input-number v-model="fontSize" tabindex="-1" size="small" :min="6" :max="32" />
      </el-button-group>

      <el-select
        v-model="canvasGuideSize"
        size="small"
        value-key="id"
        placeholder="Canvas"
        class="ui-padding"
        style="width: 120px"
        tabindex="-1"
      >
        <el-option
          v-for="cv of CanvasGuideSizeUtil.list()"
          :key="cv[1].valueOf()"
          :label="cv[1].valueOf()"
          :value="cv[1].valueOf()"
        />
      </el-select>

      <el-button-group class="ui-padding">
        <el-checkbox
          v-model="enableEditButtons"
          :label="$t('AACV.ViewButtons')"
          tabindex="-1"
          size="small"
          @change="$emit('deselect-koma-parts')"
        />
      </el-button-group>
    </div>

    <AddLineBreakDialog v-model="visibleAddLineBreakDialog" />
  </el-row>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import CloseIcon from 'vue-material-design-icons/Close.vue';
import AccountPlusIcon from 'vue-material-design-icons/AccountPlus.vue';
import PlusBoxIcon from 'vue-material-design-icons/PlusBox.vue';
import CommentPlusIcon from 'vue-material-design-icons/CommentPlus.vue';
import CallMergeIcon from 'vue-material-design-icons/CallMerge.vue';
import UndoIcon from 'vue-material-design-icons/Undo.vue';
import ContentCopyIcon from 'vue-material-design-icons/ContentCopy.vue';
import ContentPasteIcon from 'vue-material-design-icons/ContentPaste.vue';
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';

import { CanvasGuideSizeUtil } from '@model/CanvasGuideSize';
import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';

import AddLineBreakDialog from '@components/Dialog/AddLineBreakDialog.vue';

const store = userAACanvasDataStore();
const {
  fontSize,
  canvasGuideSize,
  enableEditButtons,
  enableUndoMergeButton,
  enableUndoTrashButton,
  enableMergeButton
} = storeToRefs(store);

// props / emits //
interface Props {
  enableCopyButton: boolean;
  enablePasteButton: boolean;
}
const prop = withDefaults(defineProps<Props>(), {
  enableCopyButton: false,
  enablePasteButton: false
});

interface Emits {
  (e: 'close-editor'): void;
  (e: 'save-data'): void;

  (e: 'add-new-koma-part-select'): void;
  (e: 'add-new-koma-part-edit'): void;
  (e: 'add-new-koma-part-edit-mini'): void;

  (e: 'merge-koma-parts'): void;
  (e: 'undo-merge-koma-parts'): void;
  (e: 'undo-trash-koma-parts'): void;

  (e: 'copy-koma-parts'): void;
  (e: 'paste-koma-parts'): void;
  (e: 'deselect-koma-parts'): void;
  (e: 'clear-all-koma-parts'): void;
}
const emits = defineEmits<Emits>();

const visibleAddLineBreakDialog = ref(false);

onMounted(() => {
  window.menu.fontSize((increase: boolean) => {
    if (increase) {
      if (fontSize.value >= 32) return;
      fontSize.value += 1;
    } else {
      if (fontSize.value <= 6) return;
      fontSize.value -= 1;
    }
  });
  window.menu.closeWindow(() => {
    emits('close-editor');
  });
  window.menu.visibleButtons(() => {
    enableEditButtons.value = !enableEditButtons.value;
  });
  window.menu.addKomaPart_AA(() => {
    emits('add-new-koma-part-select');
  });
  window.menu.addKomaPart_Editor(() => {
    emits('add-new-koma-part-edit');
  });
  window.menu.addKomaPart_Mini(() => {
    emits('add-new-koma-part-edit-mini');
  });
});
</script>

<style scoped>
#aacanvas-header-toolbar {
  padding: 6px 0px;
  line-height: 23px;
  height: 70px; /* KomaPart座標取りのため固定 */
  user-select: none;
}
.toolbar-set {
  width: 100%;
}
</style>

<template>
  <el-dialog :title="$t('D.ColoringBlankCharacter')" width="360px">
    <div class="dialogPad">
      <el-checkbox v-model="colorSpaceZenkaku">{{ $t('D.ColoringBlankCharacter_Zenkaku') }}</el-checkbox>
    </div>
    <div class="dialogPad">
      <el-checkbox v-model="colorSpaceUnicode">{{ $t('D.ColoringBlankCharacter_Unicode') }}</el-checkbox>
    </div>
    <div class="dialogPad">
      <el-checkbox v-model="colorSpaceWarning">{{ $t('D.ColoringBlankCharacter_Warning') }}</el-checkbox>
    </div>
    <br />
    <p>
      <strong>{{ $t('Warning') }}</strong>
    </p>
    <p>{{ $t('D.ColoringBlankCharacter_Info1') }}</p>
    <p>{{ $t('D.ColoringBlankCharacter_Info2') }}</p>
  </el-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { userTextEditorDataStore } from '@/data/config/StoreTextEditor';

const ud = userTextEditorDataStore();
const { colorSpaceZenkaku, colorSpaceUnicode, colorSpaceWarning } = storeToRefs(ud);

interface Emits {
  (e: 'color-space-dialog'): void;
}
defineEmits<Emits>();
</script>

<template>
  <el-dialog :title="$t('D.Split')" width="420px">
    <p>{{ $t('D.Split_Info1') }}</p>
    <el-button @click="$emit('split-aa', false)">{{ $t('D.Split_Cancel') }}</el-button>
    <el-button type="primary" @click="$emit('split-aa', true)">{{ $t('D.Split_Action') }}</el-button>
  </el-dialog>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'split-aa', action: boolean): void;
}
defineEmits<Emits>();
</script>

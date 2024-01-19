<template>
  <el-dialog :title="$t('D.AddLineBreak')" width="360px">
    <h3>{{ $t('D.AddLineBreakAtTop') }}</h3>
    <el-radio-group v-model="configAddLineBreakAtTop">
      <div v-for="key of Object.entries(AddLineBreakAtTop).map(([k, _v]) => k)" :key="key" class="ritem">
        <el-radio :label="key">
          {{ $t('D.AddLineBreakAtTop_' + key) }}
        </el-radio>
      </div>
    </el-radio-group>

    <h3>{{ $t('D.AddLineBreakAtBottom') }}</h3>
    <el-radio-group v-model="configAddLineBreakAtBottom">
      <div v-for="key of Object.entries(AddLineBreakAtBottom).map(([k, _v]) => k)" :key="key" class="ritem">
        <el-radio :label="key">
          {{ $t('D.AddLineBreakAtBottom_' + key) }}
        </el-radio>
      </div>
    </el-radio-group>
  </el-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { userAACanvasDataStore } from '@/data/config/StoreAACanvas';
import { AddLineBreakAtTop, AddLineBreakAtBottom } from '@/data/model';
const store = userAACanvasDataStore();
const { configAddLineBreakAtTop, configAddLineBreakAtBottom } = storeToRefs(store);
</script>

<style scoped>
label.el-radio {
  padding: 2px 8px 2px 8px;
}
.ritem {
  display: block;
  width: 100%;
}
</style>

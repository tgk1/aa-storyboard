<template>
  <template v-if="visiblePopInitialStartupFile && props.appActivity == AppActivity.MainIndex">
    <span ref="initalStartupRef"></span>
    <el-popover
      ref="popoverRef"
      popper-style="background-color: #ffdddd"
      :visible="visiblePopInitialStartupFile"
      :virtual-ref="initalStartupRef"
      width="370"
      :title="$t('IDX-L.StartFromHere')"
      content=""
      virtual-triggering
    >
      <el-button size="small"><NotePlusOutlineIcon class="green" :size="18" /></el-button>
      {{ $t('IDX-L.CreateThreadFile') }}
    </el-popover>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import NotePlusOutlineIcon from 'vue-material-design-icons/NotePlusOutline.vue';

import { userMainIndexDataStore } from '@/data/config/StoreMLTIndex';
import { AppActivity } from '@/data/model';
import { wait } from '@/lib/wait';

const store = userMainIndexDataStore();
const { visiblePopInitialStartupFile } = storeToRefs(store);

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const initalStartupRef = ref();

onMounted(() => {
  //visiblePopInitialStartupFile.value = true;
  if (visiblePopInitialStartupFile.value) {
    Promise.resolve()
      .then(wait(4000))
      .then(() => {
        visiblePopInitialStartupFile.value = false;
      });
  }
});
</script>

<style scoped>
.el-popper.is-light {
  background-color: #ffdddd;
}
.el-popper.is-light .el-popper__arrow::before {
  background-color: #ff0000;
}
</style>

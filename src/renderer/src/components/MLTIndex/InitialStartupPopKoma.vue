<template>
  <template v-if="visiblePopInitialStartupKoma > 0 && props.appActivity == AppActivity.MainIndex">
    <span ref="initalStartupRef"></span>
    <el-popover
      ref="popoverRef"
      popper-style="background-color: #ffdddd"
      :visible="visiblePopInitialStartupKoma > 1"
      :virtual-ref="initalStartupRef"
      width="370"
      :title="$t('IDX-R.CreationStart')"
      content=""
      virtual-triggering
    >
      <el-button size="small" class="green"><plus-box-icon :size="16" /></el-button>
      {{ $t('IDX-R.CreateFrame') }}
    </el-popover>
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import PlusBoxIcon from 'vue-material-design-icons/PlusBox.vue';

import { userMainIndexDataStore } from '@/data/config/StoreMLTIndex';
import { AppActivity } from '@/data/model';
import { wait } from '@/lib/wait';
import { onMounted } from 'vue';

const store = userMainIndexDataStore();
const { visiblePopInitialStartupKoma } = storeToRefs(store);

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const initalStartupRef = ref();
onMounted(() => {
  //visiblePopInitialStartupKoma.value = 1;
});

watch(
  () => visiblePopInitialStartupKoma.value,
  () => {
    if (visiblePopInitialStartupKoma.value == 2) {
      Promise.resolve()
        .then(wait(4000))
        .then(() => {
          visiblePopInitialStartupKoma.value = 0;
        });
    }
  }
);
</script>

<style scoped>
.el-popper.is-light {
  background-color: #ffdddd;
}
.el-popper.is-light .el-popper__arrow::before {
  background-color: #ff0000;
}
</style>

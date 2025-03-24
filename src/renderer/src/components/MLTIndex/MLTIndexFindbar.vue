<template>
  <div v-if="props.findMode == FindMode.Find" class="findbar">
    <el-input
      ref="findKomaInput"
      v-model="findKomaVal"
      size="small"
      @keyup.esc.stop="$emit('close')"
      @keyup.enter.stop="findKoma"
    />
    <el-button-group>
      <el-button size="small" @click="findLoop(true)"><chevron-down-icon :size="16" /></el-button>
      <el-button size="small" @click="findLoop(false)"><chevron-up-icon :size="16" /></el-button>
      <el-button size="small" @click="$emit('close')"><close-icon :size="16" /></el-button>
    </el-button-group>
  </div>

  <div v-if="props.findMode == FindMode.MoveByNumber" class="findbar">
    <el-input
      ref="moveByNumberInput"
      v-model="moveByNumberVal"
      size="small"
      @keyup.esc.stop="$emit('close')"
      @keyup.enter.stop="moveByNumber"
    />
    <el-button-group>
      <el-button size="small" @click="moveByNumber"><arrow-bottom-right-icon :size="16" /></el-button>
      <el-button size="small" @click="$emit('close')"><close-icon :size="16" /></el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

import ArrowBottomRightIcon from 'vue-material-design-icons/ArrowBottomRight.vue';
import ChevronUpIcon from 'vue-material-design-icons/ChevronUp.vue';
import ChevronDownIcon from 'vue-material-design-icons/ChevronDown.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';

import { FindMode } from '@model/index';
import { focusUI } from '@/lib/focusUI';

interface Props {
  findMode: FindMode;
}
const props = withDefaults(defineProps<Props>(), {
  findMode: FindMode.Default
});
interface Emits {
  (e: 'move-by-number', num: number): void;
  (e: 'find-koma', keyword: string): void;
  (e: 'find-loop', forward: boolean): void;
  (e: 'close'): void;
}

const emits = defineEmits<Emits>();
const mode = ref(FindMode.Default);

const moveByNumberVal = ref('');
const moveByNumberInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const findKomaVal = ref('');
const findKomaValOld = ref('');
const findKomaInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

onMounted(() => {
  mode.value = props.findMode;
});

watch(props, (newVal) => {
  console.log('QQ findmode: ' + newVal.findMode);
  if (newVal.findMode == FindMode.MoveByNumber) {
    focusUI(moveByNumberInput);
  }
  if (newVal.findMode == FindMode.Find) {
    focusUI(findKomaInput);
  }
});

//
//
//
function moveByNumber() {
  emits('move-by-number', Number(moveByNumberVal.value));
}

function findKoma() {
  findKomaValOld.value = findKomaVal.value;
  emits('find-koma', findKomaVal.value);
}

function findLoop(forward: boolean) {
  if (findKomaValOld.value != findKomaVal.value) {
    findKomaValOld.value = findKomaVal.value;
    emits('find-koma', findKomaVal.value);
  }
  emits('find-loop', forward);
}
</script>

<style scoped>
.findbar {
  position: absolute;
  top: 76px;
  left: 380px;
  margin-top: 4px;
  padding: 4px;
  background-color: #ccc;
}
.findbar .el-input {
  display: inline;
}
</style>

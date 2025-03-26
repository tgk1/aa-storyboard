<template>
  <div v-if="props.findMode == FindMode.Find" class="findbar">
    <div @keyup.esc.stop="$emit('close')">
      <el-input
        ref="findKomaInput"
        v-model="findKomaVal"
        size="small"
        @keyup.esc.stop="$emit('close')"
        @keyup.stop="findKoma(true)"
      />
      <el-button-group>
        <el-button size="small" @click="findKoma(true)"><chevron-down-icon :size="16" /></el-button>
        <el-button size="small" @click="findKoma(false)"><chevron-up-icon :size="16" /></el-button>
        <el-button size="small" @click="$emit('close')"><close-icon :size="16" /></el-button>
      </el-button-group>
    </div>
  </div>

  <div v-if="props.findMode == FindMode.Replace" class="findbar">
    <div @keyup.esc.stop="$emit('close')">
      <el-input
        ref="rfindKomaInput"
        v-model="rfindKomaVal"
        size="small"
        tabindex="1"
        :placeholder="$t('IDX-R.FindKoma')"
        @keyup.stop="rfindKoma(true)"
        @keyup.esc.stop="$emit('close')"
      />
      <el-button-group>
        <el-button size="small" tabindex="5" @click="rfindKoma(true)"><chevron-down-icon :size="16" /></el-button>
        <el-button size="small" tabindex="6" @click="rfindKoma(false)"><chevron-up-icon :size="16" /></el-button>
        <el-button size="small" tabindex="7" @click="$emit('close')"><close-icon :size="16" /></el-button>
      </el-button-group>
    </div>
    <div @keyup.esc.stop="$emit('close')">
      <el-input
        ref="replaceKomaInput"
        v-model="replaceKomaVal"
        size="small"
        tabindex="2"
        :placeholder="$t('IDX-R.ReplaceKoma')"
        @keyup.enter.stop="replaceKoma"
        @keyup.esc.stop="$emit('close')"
      />
      <el-button-group>
        <el-button size="small" tabindex="3" @click="replaceKoma">{{ $t('IDX-R.ReplaceKoma') }}</el-button>
        <el-button size="small" tabindex="4" @click="replaceAllKoma">{{ $t('IDX-R.ReplaceAllKoma') }}</el-button>
      </el-button-group>
    </div>
    <div class="white">
      <span class="error">
        <alert-circle-outline-icon :size="12" />
      </span>
      Undoはできません。<br />
      キャンバス終了時の改行付与設定も適用されます。
    </div>
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
import AlertCircleOutlineIcon from 'vue-material-design-icons/AlertCircleOutline.vue';
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
  (e: 'find-koma', keyword: string, forward: boolean): void;
  (e: 'replace-koma', keyword: string, replace: string): void;
  (e: 'replace-all-koma', keyword: string, replace: string): void;
  (e: 'close'): void;
}

const emits = defineEmits<Emits>();
const mode = ref(FindMode.Default);

const moveByNumberVal = ref('');
const moveByNumberInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const findKomaVal = ref('');
const findKomaInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const rfindKomaVal = ref('');
const replaceKomaVal = ref('');
const rfindKomaInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

onMounted(() => {
  mode.value = props.findMode;
});

watch(props, (newVal) => {
  emits('find-koma', '', true);
  if (newVal.findMode == FindMode.MoveByNumber) {
    focusUI(moveByNumberInput);
  } else if (newVal.findMode == FindMode.Replace) {
    focusUI(rfindKomaInput);
  } else if (newVal.findMode == FindMode.Find) {
    focusUI(findKomaInput);
  }
});

//
//
//
function moveByNumber() {
  emits('move-by-number', Number(moveByNumberVal.value));
}

function findKoma(forward: boolean) {
  emits('find-koma', findKomaVal.value, forward);
}

function rfindKoma(forward: boolean) {
  emits('find-koma', rfindKomaVal.value, forward);
}

function replaceKoma() {
  emits('replace-koma', rfindKomaVal.value, replaceKomaVal.value);
}

function replaceAllKoma() {
  emits('replace-all-koma', rfindKomaVal.value, replaceKomaVal.value);
}
</script>

<style scoped>
.findbar {
  position: absolute;
  top: 76px;
  left: 450px;
  margin-top: 4px;
  padding: 4px;
  background-color: #ccc;
}
.findbar .el-input {
  display: inline;
}
.findbar .white {
  padding: 2px 4px;
  background-color: #fcfcfc;
}
</style>

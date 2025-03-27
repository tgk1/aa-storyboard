<template>
  <div v-if="props.findMode == FindMode.Find" class="findbar">
    <div @keyup.esc.stop="$emit('close')">
      <el-input
        ref="findKomaInput"
        v-model="findKomaVal"
        size="small"
        :placeholder="$t('IDX-R.FindPlaceholder')"
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
    <div @keyup.esc.stop="$emit('close')">
      <el-input
        ref="moveByNumberInput"
        v-model="moveByNumberVal"
        size="small"
        :placeholder="$t('IDX-R.MovePlaceholder')"
        @keyup.esc.stop="$emit('close')"
        @keyup.enter.stop="moveByNumber"
      />
      <el-button-group>
        <el-button size="small" @click="moveByNumber"><arrow-bottom-right-icon :size="16" /></el-button>
        <el-button size="small" @click="$emit('close')"><close-icon :size="16" /></el-button>
      </el-button-group>
    </div>
  </div>

  <div v-if="props.findMode == FindMode.BulkDelete" class="findbar">
    <div @keyup.esc.stop="$emit('close')">
      <el-button-group style="padding-left: 450px">
        <el-button size="small" @click="$emit('close')"><close-icon :size="16" /></el-button>
      </el-button-group>

      <h4>{{ $t('IDX-R.DeleteByString') }}</h4>
      <el-input ref="deleteByStringInput" v-model="deleteByStringVal" size="small" @keyup.esc.stop="$emit('close')" />
      <el-button-group>
        <el-button size="small" @click="checkDeleteByString">
          {{ $t('IDX-R.Check') }}
        </el-button>
        <el-button size="small" @click="deleteByString(true)">
          {{ $t('IDX-R.DeleteKomaContainKeyword') }}
        </el-button>
        <el-button size="small" @click="deleteByString(false)">
          {{ $t('IDX-R.DeleteKomaDoNotContainKeyword') }}
        </el-button>
      </el-button-group>

      <h4>{{ $t('IDX-R.DeleteByNumber') }}</h4>
      <el-input ref="deleteByNumberInput" v-model="deleteByNumberVal" size="small" @keyup.esc.stop="$emit('close')" />
      <el-button-group>
        <el-button size="small" @click="checkDeleteByNumber">
          {{ $t('IDX-R.Move') }}
        </el-button>
        <el-button size="small" @click="deleteByNumber(true)">
          <chevron-down-icon :size="16" />{{ $t('IDX-R.DeleteByNumberAfter') }}
        </el-button>
        <el-button size="small" @click="deleteByNumber(false)">
          <chevron-up-icon :size="16" />{{ $t('IDX-R.DeleteByNumberPrevious') }}
        </el-button>
      </el-button-group>
      <br />

      <h4>{{ $t('IDX-R.DeleteByRange') }}</h4>
      <el-input ref="deleteByRangeInput1" v-model="deleteByRangeVal1" size="small" @keyup.esc.stop="$emit('close')" />
      〜
      <el-input ref="deleteByRangeInput2" v-model="deleteByRangeVal2" size="small" @keyup.esc.stop="$emit('close')" />
      <el-button-group>
        <el-button size="small" @click="deleteByRange(true)">
          {{ $t('IDX-R.DeleteByRange1') }}
        </el-button>
        <el-button size="small" @click="deleteByRange(false)">
          {{ $t('IDX-R.DeleteByRange2') }}
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { i18n } from '@/lib/i18n';

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
  (e: 'delete-by-string', keyword: string, contain: boolean): void;
  (e: 'delete-by-range', num1: number, num2: number, on: boolean): void;
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

const deleteByStringVal = ref('');
const deleteByStringInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const deleteByNumberVal = ref('');
const deleteByNumberInput = ref<InstanceType<typeof HTMLInputElement> | null>(null);

const deleteByRangeVal1 = ref('');
const deleteByRangeVal2 = ref('');
const deleteByRangeInput1 = ref<InstanceType<typeof HTMLInputElement> | null>(null);
const deleteByRangeInput2 = ref<InstanceType<typeof HTMLInputElement> | null>(null);

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
  } else if (newVal.findMode == FindMode.BulkDelete) {
    focusUI(deleteByStringInput);
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

function checkDeleteByNumber() {
  emits('move-by-number', Number(deleteByNumberVal.value));
}

function checkDeleteByString() {
  emits('find-koma', deleteByStringVal.value, true);
}

function deleteByString(contain: boolean) {
  emits('delete-by-string', deleteByStringVal.value, contain);
}

function deleteByNumber(after: boolean) {
  const num = Number(deleteByNumberVal.value);
  if (num < 1) {
    ElMessage({ message: i18n.t('IDX-R.ErrorRange'), type: 'error' });
    return;
  }
  if (after) {
    if (num < 1) {
      ElMessage({ message: i18n.t('IDX-R.ErrorRange'), type: 'error' });
      return;
    }
    emits('delete-by-range', num - 1, 999999, true);
  } else {
    emits('delete-by-range', 0, num - 1, true);
  }
}

function deleteByRange(on: boolean) {
  const start = Number(deleteByRangeVal1.value);
  const end = Number(deleteByRangeVal2.value);
  if (start <= 0 || end <= 0 || end < start) {
    ElMessage({ message: i18n.t('IDX-R.ErrorRange'), type: 'error' });
    return;
  }
  emits('delete-by-range', start - 1, end - 1, on);
}
</script>

<style scoped>
.findbar {
  position: absolute;
  top: 108px;
  right: 32px;
  margin-top: 4px;
  padding: 4px;
  border: 2px solid #bbb;
  background-color: #fff;
  z-index: 2;
}
.findbar .el-input {
  display: inline;
}
.findbar .white {
  padding: 2px 4px;
  background-color: #fcfcfc;
}
</style>

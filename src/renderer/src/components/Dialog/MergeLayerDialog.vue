<template>
  <el-dialog :title="props.komaPart.name" style="width: 620px">
    <el-input v-model="name" @change="setKomaPart" />
    <h5>{{ $t('D.MergeLayerConfig') }}</h5>
    <el-radio-group v-model="mode">
      <div v-for="key of MergeLayerArray" :key="key" class="dialogPad">
        <el-radio :label="key" @change="$emit('set-merge-layer-mode', key)">
          {{ $t('D.ML_mode' + key) }}
        </el-radio>
        <img :src="linkImg(key)" />
      </div>
    </el-radio-group>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { KomaPart, MergeLayerArray } from '@model/index';

// props // emits //
interface Props {
  komaPart: KomaPart;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'set-koma-part', komaPart: KomaPart): void;
  (e: 'set-merge-layer-mode', mergeMode: number): void;
}
const emits = defineEmits<Emits>();

const name = ref('');
const mode = ref(2);

watch(props, () => {
  name.value = props.komaPart.name;
  mode.value = props.komaPart.mode;
});

function linkImg(id: number) {
  return '/mergeLayer/mode' + id + '.png';
}

function setKomaPart() {
  const kpart = props.komaPart;
  kpart.name = name.value;
  emits('set-koma-part', kpart);
}
</script>

<style scoped>
.el-radio {
  --el-text-color-regular: #000;
}
</style>

<template>
  <el-dialog :title="props.komaPart.name" style="width: 620px">
    <el-input v-model="name" @change="setKomaPart" />
    <br />
    <br />
    <h3>{{ $t('D.MergeLayerConfig') }}</h3>
    <el-radio-group v-model="mode">
      <div v-for="key of MergeLayerArray" :key="key" class="dialogPad">
        <el-radio :label="key" @change="$emit('set-merge-layer-mode', key)">
          {{ $t('D.ML_mode' + key) }}
        </el-radio>
        <div v-if="key == 0">
          <Mode0png />
        </div>
        <div v-else-if="key == 1">
          <Mode1png />
        </div>
        <div v-else-if="key == 2">
          <Mode2png />
        </div>
        <div v-else-if="key == 3">
          <Mode3png />
        </div>
        <div v-if="key == 4">
          <Mode4png />
        </div>
      </div>
    </el-radio-group>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { KomaPart, MergeLayerArray } from '@model/index';
import Mode0png from './mode0_png.vue';
import Mode1png from './mode1_png.vue';
import Mode2png from './mode2_png.vue';
import Mode3png from './mode3_png.vue';
import Mode4png from './mode4_png.vue';

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

/*
function linkImg(id: number) {
  return `./mode${id}.png`;
}
*/

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

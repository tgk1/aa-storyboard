<template>
  <div id="ruler-canvas-wrapper" ref="wrapper">
    <canvas id="ruler-canvas-inner" ref="canvas" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from 'vue';
import { drawRuler, drawGuideLine } from './EditorRuler';

interface Props {
  gridWidth: number;
  gridHeight: number;
  guideWidth: number;
  guideLine: number;
}
const prop = withDefaults(defineProps<Props>(), {
  gridWidth: 11,
  gridHeight: 18,
  guideWidth: 800,
  guideLine: 35
});
defineExpose({
  draw
});

const canvas = ref(null);
const wrapper = ref(null);

onMounted(() => {
  window.addEventListener('resize', draw);
  draw();
});

onUpdated(() => {
  draw();
});

function draw(): number {
  if (!wrapper.value) return 0;
  if (!canvas.value) return 0;

  const w = wrapper.value as HTMLElement;
  const c = canvas.value as HTMLCanvasElement;

  c.width = w.getBoundingClientRect().width;
  c.height = w.getBoundingClientRect().height;

  drawRuler(c, prop.gridWidth, prop.gridHeight);
  if (prop.guideWidth != 0 && prop.gridHeight != 0) {
    drawGuideLine(c, prop.gridHeight, prop.guideWidth, prop.guideLine);
  }

  return 1;
}
</script>

<style scoped>
#ruler-canvas-wrapper {
  width: 100%;
  height: 100%;
}
</style>

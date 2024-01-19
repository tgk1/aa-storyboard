<template>
  <el-popover placement="right" :width="170" trigger="hover" :hide-after="1">
    <template #reference>
      <el-button class="sbutton" :class="['mark' + mark]" size="small" @click.stop="selectMark(1)">
        <template v-if="mark == 0">
          <StarOutlineIcon :size="16" />
        </template>
        <template v-else>
          <StarIcon :size="16" />
        </template>
      </el-button>
    </template>
    <template v-for="i in [1, 2, 3, 4, 0]" :key="i">
      <el-button class="star-button" :class="['mark' + i]" @click.stop="selectMark(i)">
        <template v-if="i == 0"><StarRemoveOutlineIcon :size="20" /></template>
        <template v-else-if="mark > 0 && mark == i"><StarIcon :size="20" /></template>
        <template v-else><StarOutlineIcon :key="i" :size="20" /></template>
      </el-button>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

import StarIcon from 'vue-material-design-icons/Star.vue';
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import StarRemoveOutlineIcon from 'vue-material-design-icons/StarRemoveOutline.vue';

import { Item } from '@/data/model/Item';

interface Props {
  item: Item;
}
const props = defineProps<Props>();

const mark = ref(0);

onMounted(() => {
  mark.value = props.item.mark;
});

function selectMark(num: number) {
  const nitem = props.item;
  mark.value = mark.value == num ? 0 : num;
  nitem.mark = mark.value;
  window.markDB.setItem(JSON.stringify(nitem));
}
</script>

<style scoped>
.sbutton {
  width: 24px;
  margin-right: 2px;
}
.sbutton:hover,
.sbutton:focus {
  background-color: var(--bg-color0);
  color: none;
}
.star-button {
  padding: 4px;
  margin: 0px;
  border: none;
}
input[type='radio'] {
  display: none;
}
</style>

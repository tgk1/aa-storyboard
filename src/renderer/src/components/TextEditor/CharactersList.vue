<template>
  <div id="characters-toolbar">
    <div id="right-toolbar-select">
      <el-dropdown @command="selectGroup">
        <span class="dropdown-link">
          {{ altxt.names[selectedList].name }}
          <MenuDownIcon :size="14" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="i in altxt.names" :key="i.id" :command="i.id">
              {{ i.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <hr />
    <div class="char-buttons">
      <template v-for="i in altxt.lists[selectedList]" :key="i.id">
        <el-button size="small" class="grid-button" @click="$emit('insert-text', i.value)">
          <pre class="grid-button-label">{{ i.name }}</pre>
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import { AAListTxt } from '@model/AAListTxt';

import MenuDownIcon from 'vue-material-design-icons/MenuDown.vue';

const selectedList = ref(0);
const altxt: Ref<AAListTxt> = ref(new AAListTxt());

interface Emits {
  (e: 'insert-text', val: string): void;
}
defineEmits<Emits>();

onMounted(() => {
  updateAAList();
});

function updateAAList() {
  const promise: Promise<AAListTxt> = window.localMLT.aalist();
  promise.then((response) => {
    altxt.value = response;
  });
}
function selectGroup(command: string | number | object) {
  console.log(command);
  selectedList.value = command as number;
}
</script>

<style scoped>
#characters-toolbar {
  padding: 0 8px;
  background-color: var(--bg-color1);
}
.grid-button {
  margin-left: 0px;
}
.char-buttons {
  display: block;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: auto;
  height: calc(100vh - 200px);
}
pre {
  font-family: 'Saitamaar';
  font-weight: normal;
  font-size: 14px;
}
</style>

<template>
  <template v-if="type == ItemType.WebFolderMLT || type == ItemType.WebMLT">
    <cloud-outline-icon :size="18" />
  </template>
  <template v-else-if="props.type == ItemType.ReplicaMLT && url.match(/https:/)">
    <cloud-outline-icon :size="18" />
  </template>
  <template v-else>
    <folder-outline-icon :size="18" />
  </template>
</template>

<script setup lang="ts">
import FolderOutlineIcon from 'vue-material-design-icons/FolderOutline.vue';
import CloudOutlineIcon from 'vue-material-design-icons/CloudOutline.vue';

import { ItemType } from '@model/Item';

interface Props {
  type: ItemType;
  url: string;
}
const props = withDefaults(defineProps<Props>(), {
  type: ItemType.WebMLT,
  url: ''
});
</script>

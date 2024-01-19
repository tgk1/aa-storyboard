<template>
  <template v-if="props.type == ItemType.LocalDB">
    <file-document-outline-icon :size="props.size" />
  </template>
  <template v-else-if="props.type == ItemType.LocalMLT">
    <file-acount-outline-icon :size="props.size" />
  </template>
  <template v-else-if="props.type == ItemType.WebMLT">
    <file-cloud-outline-icon :size="props.size" />
  </template>
  <template v-else-if="props.type == ItemType.WebFolderMLT">
    <folder-outline-icon :size="props.size" />
  </template>
  <template v-else-if="props.type == ItemType.ReplicaMLT">
    <clipboard-text-clock-outline-icon :size="props.size" />
  </template>
  <template v-else>
    <folder-outline-icon :size="props.size" />
  </template>
</template>

<script setup lang="ts">
import FileAcountOutlineIcon from 'vue-material-design-icons/FileAccountOutline.vue';
import FileCloudOutlineIcon from 'vue-material-design-icons/FileCloudOutline.vue';
import FileDocumentOutlineIcon from 'vue-material-design-icons/FileDocumentOutline.vue';
import FolderOutlineIcon from 'vue-material-design-icons/FolderOutline.vue';
import ClipboardTextClockOutlineIcon from 'vue-material-design-icons/ClipboardTextClockOutline.vue';

import { ItemType } from '@model/Item';

interface Props {
  type: ItemType;
  size: number;
}
const props = withDefaults(defineProps<Props>(), {
  type: ItemType.WebMLT,
  size: 16
});
</script>

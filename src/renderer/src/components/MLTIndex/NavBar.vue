<template>
  <el-menu id="nav-bar" @select="selNav">
    <el-menu-item v-if="props.appActivity != AppActivity.MainIndex" class="bgwhite" index="cancel">
      <close-icon class="red" />
    </el-menu-item>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.LocalFolderDB)">
      <el-menu-item :class="cssFocus(NavType.LocalFolderDB)" :index="NavType.LocalFolderDB">
        <file-edit-outline-icon />
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.WebFolderMLT)">
      <el-menu-item :class="cssFocus(NavType.WebFolderMLT)" :index="NavType.WebFolderMLT">
        <cloud-outline-icon />
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.LocalFolderMLT)">
      <el-menu-item :class="cssFocus(NavType.LocalFolderMLT)" :index="NavType.LocalFolderMLT">
        <folder-outline-icon />
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.MarkFolder)">
      <el-menu-item :class="cssFocus(NavType.MarkFolder)" :index="NavType.MarkFolder">
        <star-outline-icon />
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.RecentFolder)">
      <el-menu-item :class="cssFocus(NavType.RecentFolder)" :index="NavType.RecentFolder">
        <history-icon />
        <span class="icon-name-file">File</span>
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.ReplicaFolder)">
      <el-menu-item :class="cssFocus(NavType.ReplicaFolder)" :index="NavType.ReplicaFolder">
        <history-icon />
        <span class="icon-name-aa">AA</span>
      </el-menu-item>
    </el-tooltip>

    <el-tooltip effect="light" placement="right" :show-after="1200" :content="$t(NavType.Config)">
      <el-menu-item
        v-if="appActivity == AppActivity.MainIndex"
        :class="cssFocus(NavType.Config)"
        :index="NavType.Config"
      >
        <cog-outline-icon />
      </el-menu-item>
    </el-tooltip>
  </el-menu>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import CloseIcon from 'vue-material-design-icons/Close.vue';
import FileEditOutlineIcon from 'vue-material-design-icons/FileEditOutline.vue';
import CloudOutlineIcon from 'vue-material-design-icons/CloudOutline.vue';
import FolderOutlineIcon from 'vue-material-design-icons/FolderOutline.vue';
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import HistoryIcon from 'vue-material-design-icons/History.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';

import { AppActivity, NavType } from '@model/index';
import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'quit'): void;
  (e: 'cancel'): void;
}
const emits = defineEmits<Emits>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { selectedNav } = storeToRefs(store);
const { selectNav } = store;

onMounted(() => {
  window.menu.closeWindow(() => {
    if (props.appActivity == AppActivity.MainIndex) {
      emits('quit');
    } else {
      emits('cancel');
    }
  });
  window.menu.selectNav((navType: NavType) => {
    selectNav(navType);
  });
});

function cssFocus(ntype: NavType): string {
  return selectedNav.value == ntype ? 'is-active' : ' ';
}
function selNav(key: string) {
  if (key == 'cancel') {
    emits('cancel');
    return;
  }
  selectNav(key as NavType);
}
/*
const selNav = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
*/
</script>

<style>
#nav-bar {
  height: 100vh;
  overflow: hidden;
  user-select: none;
  background-color: var(--bg-color2);
}
.el-menu-item * {
  vertical-align: middle;
}
.icon-name-file {
  font-size: 12px;
  color: inherit;
  position: relative;
  top: 20px;
  left: -21px;
}
.icon-name-aa {
  font-size: 12px;
  color: inherit;
  position: relative;
  top: 20px;
  left: -19px;
}
.bgwhite {
  background-color: #fff;
  border: 1px solid #000;
}
</style>

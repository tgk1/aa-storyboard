<template>
  <el-container id="main-index">
    <el-aside id="wrapper-nav-bar">
      <NavBar :app-activity="act" @cancel="cancelSelector" @quit="quit" />
    </el-aside>

    <el-aside v-if="selectedNav != NavType.Config" id="wrapper-mlt-list">
      <FileList :app-activity="act" />
    </el-aside>

    <div v-if="selectedNav != NavType.Config" id="wrapper-aa-viewer">
      <MLTIndexMain :app-activity="act" />
    </div>

    <div v-else id="wrapper-config-view">
      <ConfigView />
    </div>
  </el-container>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import NavBar from '@components/MLTIndex/NavBar.vue';
import FileList from '@components/MLTIndex/FileList.vue';
import MLTIndexMain from '@components/MLTIndex/MLTIndexMain.vue';
import ConfigView from '@components/MLTIndex/ConfigView.vue';

import { AppActivity, NavType } from '@model/index';

import { userMLTSelectorDataStore } from '@/data/config/StoreMLTIndex'; //MLTSelector
const store = userMLTSelectorDataStore();
const { selectedNav } = storeToRefs(store);

const act: AppActivity = AppActivity.MLTSelector;

function cancelSelector() {
  window.appWindow.closeMLTSelectorSTEP1('');
}
function quit() {
  window.appWindow.quit();
}
</script>

<style lang="css">
@import './assets/css/app.css';
</style>

<style scoped>
#main-index {
  margin: 0;
  width: 100vw;
  height: 100vh;
}
#wrapper-nav-bar {
  width: 65px;
  height: 100vh;
  overflow: hidden;
  /*  background-color: aqua; */
}
#wrapper-mlt-list {
  width: 257px;
  height: 100vh;
  overflow: hidden;
}
#wrapper-aa-viewer {
  width: calc(100vw - 65px - 257px);
  height: 100vh;
  overflow: hidden;
}
#wrapper-config-view {
  width: calc(100vw - 65px);
  height: 100vh;
  overflow: hidden;
}
</style>

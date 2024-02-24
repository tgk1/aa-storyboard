<template>
  <div id="tab-bar">
    <el-button-group>
      <el-button size="small" class="tb-button-mini" tabindex="-1" @click="visibleTabDialog = true">
        <reorder-horizontal-icon :size="16" />
      </el-button>
      <span class="arrow-button" @click="tabBarScroll(-1)"><chevron-left-icon :size="18" /></span>
      <span class="arrow-button ab-r" @click="tabBarScroll(1)"><chevron-right-icon :size="18" /></span>
    </el-button-group>
    <div id="tab-bar-inner" :class="['tab-bar-' + tabMode]">
      <div
        v-for="(item, index) in tabItems"
        :id="'tab-title-' + index"
        :key="item.url"
        class="tab-title"
        :class="[{ active: index == selectedTab }, cssTabBorder(tabMode, index, selectedTab), 'tab-title-' + tabMode]"
        @click="selectTab(index)"
      >
        <span class="icon">
          <IconFile :type="item.type" :class="[{ active: index == selectedTab }]" :size="14" />
        </span>
        <span class="name">{{ item.name }}</span>
        <span class="close" :class="['tab-close-button-' + tabMode]" @click.stop="tabDeleteIndex(index)">
          <close-icon :size="14" />
        </span>
      </div>
    </div>
  </div>

  <el-dialog v-model="visibleTabDialog" title="タブ" width="360px">
    <div class="btn-pad">
      <el-radio-group v-model="tabMode">
        <el-radio-button label="Horizontal">
          <span class="tabradio">{{ $t('IDX-R.TAB_Horizontal') }}</span>
        </el-radio-button>
        <el-radio-button label="Vertical">
          <span class="tabradio">{{ $t('IDX-R.TAB_Vertical') }}</span>
        </el-radio-button>
      </el-radio-group>
    </div>
    <div class="btn-pad">
      <el-button @click="tabReorderByNameBtn()">{{ $t('IDX-R.SortByName') }}</el-button>
    </div>
    <div v-if="selectedTab != 0" class="btn-pad">
      <el-button @click="closeNewerTabs()">{{ $t('IDX-R.CloseNewerTab_' + tabMode) }}</el-button>
    </div>
    <div class="btn-pad">
      <el-button @click="closeOtherTabs()">{{ $t('IDX-R.CloseOtherTabs') }}</el-button>
    </div>
    <div v-if="tabItems.length - 1 != selectedTab" class="btn-pad">
      <el-button @click="closeOlderTabs()">{{ $t('IDX-R.CloseOlderTab_' + tabMode) }}</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';

import ReorderHorizontalIcon from 'vue-material-design-icons/ReorderHorizontal.vue';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';

import IconFile from './IconFile.vue';
import { AppActivity, TabMode } from '@model/index';
import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';
import { onMounted } from 'vue';

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { tabMode, tabItems, selectedTab } = storeToRefs(store);
const {
  selectTab,
  tabReorderByName,
  tabDeleteNewer,
  tabDeleteOlder,
  tabDeleteOther,
  tabDeleteIndex,
  selectNextTab,
  selectPrevTab
} = store;

const visibleTabDialog: Ref<boolean> = ref(false);

onMounted(() => {
  window.menu.closeTab(() => {
    tabDeleteIndex(selectedTab.value);
  });
  window.menu.switchTabMode(() => {
    tabMode.value = tabMode.value == TabMode.Horizontal ? TabMode.Vertical : TabMode.Horizontal;
  });
  window.menu.selectTab((isPrev: boolean) => {
    if (isPrev) {
      selectPrevTab();
    } else {
      selectNextTab();
    }
  });
});

function closeOtherTabs() {
  tabDeleteOther();
  visibleTabDialog.value = false;
}

function closeNewerTabs() {
  tabDeleteNewer();
  visibleTabDialog.value = false;
}

function closeOlderTabs() {
  tabDeleteOlder();
  visibleTabDialog.value = false;
}

function tabReorderByNameBtn() {
  tabReorderByName();
  visibleTabDialog.value = false;
}

function tabBarScroll(slide: number) {
  const dom = document.querySelector('#tab-bar-inner');
  if (dom) {
    dom.scrollBy(100 * slide, 0);
  }
}

// CSS
function cssTabBorder(mode: TabMode, index: number, tabIndex: number): string {
  if (mode == TabMode.Horizontal) {
    const left = index == 0 ? 1 : 0;
    const bottom = index == tabIndex ? 0 : 1;
    return `tab11${bottom}${left}`;
  } else {
    return `tab0010`;
  }
}
</script>

<style scoped>
#tab-bar {
  font-size: 12px;
  font-weight: normal;
  color: #303133;
  position: absolute;
  top: 44px;
  /* left: calc(65 + 257px); */
  width: 72px;
  margin: 0px;
}
#tab-bar-inner::-webkit-scrollbar {
  height: 2px;
  width: 4px;
}
#tab-bar-inner::-webkit-scrollbar-track {
  height: 2px;
  width: 6px;
  border-radius: 2px;
  background: var(--bg-color1);
}
#tab-bar-inner::-webkit-scrollbar-thumb {
  height: 2px;
  width: 6px;
  border-radius: 2px;
  background: #909399;
}

.tab-bar-Vertical {
  position: absolute;
  top: 32px;
  width: 220px;
  height: calc(100vh - 100px);
  padding: 0px;
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: none; /* firefox */
  border-collapse: collapse;
}
.tab-bar-Horizontal {
  position: absolute;
  top: 0px;
  left: calc(40px + 36px);
  width: calc(100vw - 65px - 257px - 72px - 6px);
  display: flex;
  overflow-x: scroll;
  overflow-y: hidden;
  height: 32px;
  padding: 0;
  scrollbar-width: none; /* firefox */
  margin: 2px;
}
.tab-title {
  color: var(--font-color);
  background-color: var(--bg-color1);
  max-width: 200px;
  padding: 6px 4px 4px 8px;
  font-size: 12px;
  cursor: default;
}
span.name {
  display: block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  float: left;
}
span.close,
span.icon {
  display: block;
  float: left;
}
.tab-title > .icon {
  vertical-align: bottom;
  padding: 2px 2px 0 0;
}
.tab-title > .close {
  padding: 2px 2px 0 0;
  color: var(--font-sub-color2);
}
.tab-title-Horizontal {
  display: inline-block;
  white-space: nowrap;
  vertical-align: middle;
}
.tab-title-Vertical {
  display: block;
  white-space: nomal;
  overflow-x: hidden;
}
.tab1101 {
  border: solid #ccc;
  border-width: 1px 1px 0px 1px;
}
.tab1100 {
  border: solid #ccc;
  border-width: 1px 1px 0px 0px;
}
.tab1111 {
  border: solid #ccc;
  border-width: 1px 1px 1px 1px;
}
.tab1110 {
  border: solid #ccc;
  border-width: 1px 1px 1px 0px;
}
.tab1010 {
  border: solid #ccc;
  border-width: 1px 0px 1px 0px;
}
.tab1000 {
  border: solid #ccc;
  border-width: 1px 0px 0px 0px;
}
.tab0010 {
  border: solid #ccc;
  border-width: 0px 0px 1px 0px;
}
.active {
  background-color: var(--bg-color0);
}
.tab-title:hover {
  color: #409eff;
}
.tab-title span:hover {
  background-color: #dcdfe6;
}
.tb-button-mini {
  background-color: var(--bg-color1);
  font-size: 16px;
  padding: 15px 8px;
}

.tab-close-button-Horizontal {
  text-align: right;
  float: none;
  display: inline;
  vertical-align: middle;
}
.tab-close-button-Vertical {
  text-align: right;
  float: right;
  display: block;
}
.arrow-button {
  display: inline-block;
  padding-top: 6px;
  height: 24px;
  border: solid #dcdfe6 1px;
  user-select: none;
}
.arrow-button:hover {
  cursor: pointer;
}
.ab-r {
  margin-left: -1px;
  margin-right: -1px;
}
.arrow-button i {
  padding-top: 6px;
  vertical-align: middle;
}

/* dialog */
span.tabradio {
  color: var(--font-color);
}
.btn-pad {
  padding: 8px;
}
</style>

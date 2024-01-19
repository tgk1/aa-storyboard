/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

import { Item, ItemType, FontName, TabMode, ViewMode, NavType, nav2item } from '@model/index';

const dataSet = () => {
  let fontSize = ref(16);
  let fontName: Ref<string> = ref(FontName.Saitamaar.valueOf());
  let tabMode:  Ref<TabMode> = ref(TabMode.Horizontal);
  let viewMode: Ref<ViewMode> = ref(ViewMode.Column);

  const listItem = ref(new Item(ItemType.LocalFolderDB));
  const fileItem = ref(new Item(ItemType.WebMLT));

  const selectedNav: Ref<NavType> = ref(NavType.LocalFolderDB);
  const navItems = ref({
    LocalFolderDB:  new Item(ItemType.LocalFolderDB),
    WebFolderMLT:   new Item(ItemType.WebFolderMLT),
    LocalFolderMLT: new Item(ItemType.LocalFolderMLT),
    MarkFolder:     new Item(ItemType.MarkFolder),
    RecentFolder:   new Item(ItemType.RecentFolder),
    ReplicaFolder:  new Item(ItemType.ReplicaFolder),
    Config:         new Item(ItemType.AppStart)
  });

  const selectedTab = ref(0);
  const tabItems: Ref<Item[]> = ref([]);

  const visiblePopInitialStartupFile = ref(true);
  const visiblePopInitialStartupKoma = ref(1);

  function lineHeight():number {
    return fontSize.value + (fontSize.value > 10 ? 2 : 1)
  }

  function resetNavItem(): Item {
    const item = nav2item(selectedNav.value);
    setNavItem(item);
    return item;
  }

  function getNavItem(): Item {
    return navItems.value[selectedNav.value];
  }

  function setNavItem(item: Item) {
    if (item.isFile()) return;
    if (selectedNav.value == NavType.LocalFolderDB || selectedNav.value == NavType.LocalFolderMLT || selectedNav.value == NavType.WebFolderMLT) {
      navItems.value[selectedNav.value] = item;
    }
  }

  function selectNav(ntype: NavType) {
    selectedNav.value = ntype;
    listItem.value = getNavItem();
  }

  function getTabItem(): Item {
    return tabItems.value[selectedTab.value];
  }

  function setTabItem(item: Item) {
    tabItems.value[selectedTab.value] = item;
  }

  function addTab(item: Item) {
    let i = 0;
    for (const it of tabItems.value) {
      if (it.url == item.url) {
        selectedTab.value = i;
        return;
      }
      i += 1;
    }
    tabItems.value.push(item);
    selectedTab.value = tabItems.value.length - 1;
  }

  function selectTab(val: number) {
    selectedTab.value = val;
    fileItem.value = tabItems.value[val];
  }

  function selectPrevTab() {
    if (selectedTab.value == 0) return;
    selectedTab.value = selectedTab.value - 1;
    fileItem.value = tabItems.value[selectedTab.value];
  }

  function selectNextTab() {
    if (selectedTab.value >= tabItems.value.length - 1) return;
    selectedTab.value = selectedTab.value + 1;
    fileItem.value = tabItems.value[selectedTab.value];
  }

  function tabReorderByName() {
    const url = tabItems.value[selectedTab.value].url;
    tabItems.value.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    let num = 0;
    for (const item of tabItems.value) {
      if (url == item.url) {
        selectedTab.value = num;
        return;
      }
      num += 1;
    }
  }

  function tabDeleteNewer() {
    tabItems.value.splice(selectedTab.value + 1, tabItems.value.length - 1);
    selectedTab.value = tabItems.value.length - 1;
  }

  function tabDeleteOlder() {
    if (tabItems.value.length == 0) return;
    tabItems.value.splice(0, selectedTab.value);
    selectedTab.value = 0;
  }

  function tabDeleteOther() {
    tabItems.value = [fileItem.value];
    selectedTab.value = 0;
  }

  function tabDeleteIndex(val: number) {
    if (tabItems.value.length == 1) return;

    tabItems.value.splice(val, 1);
    if (val == selectedTab.value) {
      selectTab(val == 0 ? 0 : val - 1);
    }
  }

  return {
    fontName, fontSize, tabMode, viewMode,
    listItem, fileItem,
    selectedNav, navItems,
    selectedTab, tabItems,
    selectPrevTab, selectNextTab,
    lineHeight,
    resetNavItem, getNavItem, setNavItem, selectNav,
    getTabItem, setTabItem, addTab, selectTab,
    tabReorderByName, tabDeleteNewer, tabDeleteOlder, tabDeleteOther, tabDeleteIndex,
    visiblePopInitialStartupFile, visiblePopInitialStartupKoma
  };
};

export const userMainIndexDataStore = defineStore('userMainIndexData', dataSet);
export const userMLTSelectorDataStore = defineStore('userMLTSelectorData', dataSet);

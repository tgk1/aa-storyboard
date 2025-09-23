<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <el-header id="file-list-header">
      <!-- ツールバー 1列目 -->
      <div class="file-list-toolbar">
        <el-input v-model="searchParam" size="small" :placeholder="$t('IDX-L.SearchKeyword')" @keyup.enter="searchItem">
          <template #append>
            <el-button id="search-button" size="small" :tabindex="-1" @click="searchItem">
              <magnify-icon :size="16" />
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- ツールバー 2列目 お気に入り以外 -->
      <div class="file-list-toolbar" :style="listItem.type != ItemType.MarkFolder ? 'display:block' : 'display:none'">
        <el-button-group>
          <el-tooltip effect="light" placement="bottom" :show-after="950" content="HOME">
            <el-button size="small" :tabindex="-1" :style="cssDirBtn()" @click="selectItemHome">
              <home-outline-icon :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip effect="light" placement="bottom" :show-after="950" :content="$t('IDX-L.GoToUpperFolder')">
            <el-button size="small" :tabindex="-1" :style="cssDirBtn()" @click="selectItemParent(listItem)">
              <arrow-up-bold-outline-icon :size="16" />
            </el-button>
          </el-tooltip>
          <el-tooltip effect="light" placement="bottom" :show-after="950" :content="$t('IDX-L.CreateFile')">
            <el-button size="small" :tabindex="-1" :style="cssCreateBtn()" @click="createFile">
              <note-plus-outline-icon class="green" :size="16" />
              <InitialStartupPopFile :app-activity="appActivity" />
            </el-button>
          </el-tooltip>
          <el-tooltip effect="light" placement="bottom" :show-after="950" :content="$t('IDX-L.DeleteRecentItem')">
            <el-button size="small" :tabindex="-1" :style="cssDeleteBtn()" @click="deleteRecentItemAll">
              <delete-forever-outline-icon :size="16" />
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-select v-model="sortParam" size="small" value-key="sortid" style="width: 120px" @change="selectItemSort">
          <el-option
            v-for="sitem of ItemUtil.getSortOptions(listItem)"
            :key="sitem.value"
            :label="$t(`IDX-L.${sitem.sort}-${sitem.order}`)"
            :value="sitem.value"
          />
        </el-select>
      </div>

      <!-- ツールバー 2列目 お気に入り -->
      <div class="file-list-toolbar" :style="listItem.type == ItemType.MarkFolder ? 'display:block' : 'display:none'">
        <el-button-group>
          <el-button
            v-for="i in [1, 2, 3, 4]"
            :key="i"
            size="small"
            :class="['mark' + i]"
            class="mark-button"
            @click.stop="selectMark(i)"
          >
            <template v-if="listItem.mark == i"><StarIcon :size="16" /></template>
            <template v-else><StarOutlineIcon :size="16" /></template>
          </el-button>
        </el-button-group>

        <el-select v-model="sortParam" size="small" value-key="sortid" style="width: 82px" @change="selectItemSort">
          <el-option
            v-for="sitem of ItemUtil.getSortOptions(listItem)"
            :key="sitem.value"
            :label="$t(`IDX-L.${sitem.sort}-${sitem.order}`)"
            :value="sitem.value"
          />
        </el-select>
      </div>
    </el-header>

    <!-- リスト -->
    <ul id="file-list">
      <div v-if="listTitle()" class="list-title">
        {{ listTitle() }}
      </div>
      <li v-for="i in litems" :key="i.url" @click="selectItem(i)">
        <div class="name">
          <IconFile :type="i.type" :size="14" />
          {{ i.name }}
        </div>
        <div v-if="visibleParent(i)" class="link" @click.stop="selectItemParent(i)">
          <IconParent :type="i.type" :url="i.original_url" :size="14" />
          <span class="dir">{{ i.line1 }}</span>
        </div>
        <div class="markbutton">
          <IconStar :item="i" :size="14" />
          <span v-if="listItem.type == ItemType.ReplicaFolder">
            <el-button class="sbutton pad" size="small" :tabindex="-1" @click.stop="setReplicaDialog(i)">
              <cog-outline-icon :size="14" />
            </el-button>
            <el-button class="sbutton" size="small" :tabindex="-1" @click.stop="deleteReplicaItem(i)">
              <delete-outline-icon :size="14" />
            </el-button>
          </span>
          <span class="file-attr">{{ i.line2 }}</span>
        </div>
        <div v-if="listItem.type == ItemType.RecentFolder">
          <el-button class="sbutton" size="small" :tabindex="-1" @click.stop="deleteRecentItem(i)">
            <delete-outline-icon :size="14" />
          </el-button>
          <span class="file-attr">{{ i.line3 }}</span>
        </div>
      </li>

      <!-- error message -->
      <li v-if="errorMessage != ''">
        <span class="kara-message">{{ errorMessage }}</span>
      </li>
      <li v-if="litems.length == 0">
        <span class="kara-message">
          <br />
          <template v-if="list.base.search != ''">{{ $t('IDX-L.NotFound') }}</template>
        </span>
      </li>
    </ul>
  </div>

  <el-dialog v-model="visibleReplicaDialog" width="80%" :title="$t('IDX-L.ReplicaItem')" :show-close="false">
    <dl class="tbl">
      <dt>{{ $t('IDX-L.ReplicaSourceFile') }}:</dt>
      <dd>{{ replicaItem.original_url }}</dd>
      <dt>{{ $t('IDX-L.ReplicaDestinationFolder') }}:</dt>
      <dd>{{ getReplicaFolder() }}</dd>
      <dt>{{ $t('IDX-L.ReplicaDestinationFile') }}:</dt>
      <dd>
        <el-input v-model="replicaName" :placeholder="$t('IDX-L.FileName')" class="el-input__inner" />
      </dd>
    </dl>
    <el-button @click="visibleReplicaDialog = false">Cancel</el-button>
    <el-button type="primary" @click="setReplicaName()">{{ $t('Save') }}</el-button>
    <p>{{ $t('IDX-L.ReplicaFileInfo1') }}</p>
    <p>{{ $t('IDX-L.ReplicaFileInfo2') }}</p>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';

import HomeOutlineIcon from 'vue-material-design-icons/HomeOutline.vue';
import ArrowUpBoldOutlineIcon from 'vue-material-design-icons/ArrowUpBoldOutline.vue';
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue';
import NotePlusOutlineIcon from 'vue-material-design-icons/NotePlusOutline.vue';
import DeleteForeverOutlineIcon from 'vue-material-design-icons/DeleteForeverOutline.vue';
import StarIcon from 'vue-material-design-icons/Star.vue';
import StarOutlineIcon from 'vue-material-design-icons/StarOutline.vue';
import DeleteOutlineIcon from 'vue-material-design-icons/DeleteOutline.vue';
import CogOutlineIcon from 'vue-material-design-icons/CogOutline.vue';

import IconFile from './IconFile.vue';
import IconParent from './IconParent.vue';
import IconStar from './IconStar.vue';
import InitialStartupPopFile from './InitialStartupPopFile.vue';

import { i18n } from '@/lib/i18n-renderer';
import { AppActivity, Item, ItemList, ItemSort, ItemType, ItemUtil } from '@model/index';
import { ListManager } from '@/data/ListManager';

import { userMLTSelectorDataStore, userMainIndexDataStore } from '@/data/config/StoreMLTIndex';

interface Props {
  appActivity: AppActivity;
}
const props = defineProps<Props>();

const store = props.appActivity == AppActivity.MainIndex ? userMainIndexDataStore() : userMLTSelectorDataStore();
const { listItem, fileItem } = storeToRefs(store);
const { setNavItem, resetNavItem, addTab } = store;

const list: Ref<ItemList> = ref(new ItemList());
const litems: Ref<Array<Item>> = ref([]);
const sortParam: Ref<string> = ref('');
const searchParam: Ref<string> = ref('');
let errorMessage = '';

// vue lifecycle
watch(
  () => listItem.value,
  () => {
    sortParam.value = ItemUtil.getSortOptionVal(listItem.value);
    updateList();
  }
);

onMounted(() => {
  sortParam.value = ItemUtil.getSortOptionVal(listItem.value);
  updateList();
});

//
//
//
async function updateList() {
  resetFocus();
  litems.value = [];

  const lm = new ListManager();
  const tmplist = await lm.getItemList(listItem.value);
  if (tmplist != null) {
    list.value = tmplist;
    list.value.formatItems();
    const cap = list.value.items.length > 10 ? 10 : list.value.items.length;
    const ary1 = list.value.items.splice(0, cap);
    const ary2 = list.value.items;

    litems.value = ary1;

    new Promise(() => {
      setTimeout(() => {
        litems.value = litems.value.concat(ary2);
      });
    });

    errorMessage = tmplist.error == null ? '' : `${tmplist.error?.name}: ${tmplist.error?.message}`;
    const dom = document.querySelector('#file-list');
    if (dom) dom.scrollTo(0, 0);
    setNavItem(listItem.value);
  }

  return list;
}
function listTitle(): string {
  if (list.value.base.search) {
    return i18n.t('IDX-L.Search') + ':' + list.value.base.search;
  } else if (
    list.value.base.type == ItemType.LocalFolderDB ||
    list.value.base.type == ItemType.LocalFolderMLT ||
    list.value.base.type == ItemType.WebFolderMLT
  ) {
    return list.value.base.name;
  }
  return '';
}
function visibleParent(item: Item): boolean {
  switch (list.value.base.type) {
    case ItemType.WebFolderMLT:
    case ItemType.LocalFolderDB:
    case ItemType.LocalFolderMLT:
      return list.value.base.search != '';
    case ItemType.MarkFolder:
    case ItemType.RecentFolder:
    case ItemType.ReplicaFolder:
      return item.line1 ? true : false;
    default:
      return false;
  }
}

//
// select item -> updateList()
//
function selectItem(item: Item) {
  if (item.isFile()) {
    fileItem.value = item;
    addTab(item);
  } else {
    listItem.value = item;
  }
}

function selectMark(val: number) {
  listItem.value.mark = val;
  updateList();
}

function selectItemHome() {
  listItem.value = resetNavItem();
}

function selectItemParent(item: Item) {
  const stritem = JSON.stringify(item);
  const result = window.localMLT.parent(stritem);
  listItem.value = ItemUtil.obj2item(JSON.parse(result));
}

function selectItemSort(val: string) {
  listItem.value = ItemUtil.setSortOption(listItem.value, val);
  updateList();
}

function searchItem() {
  if (listItem.value.type == ItemType.WebFolderMLT) {
    if (searchParam.value.length < 2) {
      ElMessageBox({
        title: i18n.t('IDX-L.Search'),
        message: i18n.t('IDX-L.InputTwoLetters')
      });
      return;
    }
  }
  listItem.value.search = searchParam.value;
  updateList();
}

//
// ファイル操作 履歴削除・編集
//
function createFile() {
  ElMessageBox.prompt(i18n.t('IDX-L.FileName'), i18n.t('IDX-L.CreateFile'), {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel'
  })
    .then(({ value }) => {
      if (value.match(/[\\\\/\\*\\?"<>:|]/)) {
        ElMessage.error(i18n.t('IDX-L.Error_InvalidFileName'));
        return;
      }
      const result = window.localDB.createFile({ dirName: listItem.value.url, fileName: value });
      if (result) {
        ElMessage.error(i18n.t('IDX-L.' + result));
      }
      updateList();
    })
    .catch(() => {
      //
    });
}

function deleteRecentItem(item: Item) {
  window.markDB.deleteRecent(JSON.stringify(item));
  updateList();
}
function deleteReplicaItem(item: Item) {
  window.markDB.deleteReplica(JSON.stringify(item));
  updateList();
}
function deleteRecentItemAll() {
  const mess =
    listItem.value.sort == ItemSort.UseDate ? 'IDX-L.DeleteHistoryAll_AccessDate' : 'IDX-L.DeleteHistoryAll_UseDate';

  ElMessageBox.confirm(i18n.t(mess), i18n.t('Warning'), {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(() => {
    if (listItem.value.sort == ItemSort.UseDate) {
      window.markDB.deleteUseDateAll();
    } else {
      window.markDB.deleteRecentAll();
    }
    updateList();
  });
}

// file : replica
const visibleReplicaDialog = ref(false);
const replicaItem = ref(new Item(ItemType.WebMLT));
const replicaName = ref('');
function setReplicaDialog(item: Item) {
  replicaItem.value = item;
  replicaName.value = window.markDB.getReplicaName(JSON.stringify(item)).replace(/\.db/, '');
  visibleReplicaDialog.value = true;
}
function getReplicaFolder() {
  return window.appConfig.getReplicaFolder();
}
function setReplicaName() {
  window.markDB.setReplicaName({ strItem: JSON.stringify(replicaItem.value), name: replicaName.value });
  visibleReplicaDialog.value = false;
  updateList();
}

//
// CSS
//
function resetFocus() {
  const d = document.activeElement as HTMLElement; //focus外す
  if (d === null) return;
  d.blur();
}

function cssDirBtn() {
  return listItem.value.isDirType() ? 'visibility: visible' : 'visibility: hidden';
}

function cssCreateBtn() {
  if (props.appActivity == AppActivity.MainIndex && listItem.value.type == ItemType.LocalFolderDB) {
    return '';
  }
  if (listItem.value.isDirType()) return 'visibility: hidden';
  return 'display: none';
}

function cssDeleteBtn() {
  return listItem.value.type == ItemType.RecentFolder || listItem.value.type == ItemType.ReplicaFolder
    ? ''
    : 'display: none';
}
</script>

<style scoped>
#file-list-header {
  user-select: none;
}
#file-list-header,
.el-dialog {
  background-color: var(--bg-color2);
  height: 76px;
  padding: 4px;
  border-bottom: solid var(--border-color) 1px;
}
#search-button {
  padding: 2px 14px;
}
#list-title {
  font-size: 14px;
  padding: 0 8px;
  height: 20px;
  background-color: var(--bg-color0);
  border-top: solid var(--border-color) 1px;
  border-bottom: solid var(--border-color) 1px;
  color: var(--font-color);
  overflow: hidden;
}
#file-list {
  padding: 0;
  margin: 0;
  padding-bottom: 24px;
  height: calc(100vh - 99px);
  overflow: auto;
  background-color: var(--bg-color1);
}
#file-list::-webkit-scrollbar {
  width: 4px;
}
#file-list::-webkit-scrollbar-track {
  width: 6px;
  border-radius: 2px;
  background: var(--scrollbar-bg-color);
}
#file-list::-webkit-scrollbar-thumb {
  width: 6px;
  border-radius: 2px;
  background: #909399;
}
#file-list li {
  list-style-type: none;
  padding: 0.4rem 0.5rem 0.3rem 0.5rem;
  border-bottom: solid var(--border-color) 1px;
  transition: background-color 0.25s ease;
  transition-property: background-color;
  transition-duration: 0.25s;
  transition-timing-function: ease;
  transition-delay: 0s;
  background-color: var(--list-color);
}
#file-list li:hover {
  background-color: var(--list-hover-color);
}
.list-title {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-color);
}
.name {
  font-size: 14px;
  padding: 0;
}
.name span {
  vertical-align: middle;
}
.file-attr,
.dir {
  font-size: 13px;
  color: var(--font-sub-color2);
  padding-left: 4px;
}

.sbutton {
  width: 24px;
  padding: 2px;
  margin: 2px 2px 2px 0;
}
.file-list-toolbar {
  padding: 4px;
}
.pad {
  margin-left: 2px;
}
.link:hover {
  background-color: var(--bg-color0);
  cursor: pointer;
  border-bottom: 1px solid var(--primary-color);
}
.link {
  display: inline;
}
</style>

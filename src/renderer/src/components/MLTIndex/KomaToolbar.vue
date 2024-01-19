<template>
  <div class="koma-toolbar">
    <el-button-group v-if="props.appActivity == AppActivity.MLTSelector">
      <el-button size="small" tabindex="-1" @click="$emit('close-palette-selector')">
        <plus-circle-icon class="green" :size="18" />
      </el-button>
    </el-button-group>

    <el-button-group v-if="props.appActivity == AppActivity.MainIndex" class="koma-toolbar-inner">
      <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.CopyKoma')">
        <el-button size="small" tabindex="-1" @click="koma2Clipboard">
          <text-box-multiple-outline-icon :size="12" />
        </el-button>
      </el-tooltip>
      <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.CopyImageKoma')">
        <el-button size="small" tabindex="-1" @click="koma2ImageClipboad">
          <image-multiple-outline-icon :size="12" />
        </el-button>
      </el-tooltip>
      <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.FileImageKoma')">
        <el-button size="small" tabindex="-1" @click="koma2ImageFile">
          <image-outline-icon :size="12" />
        </el-button>
      </el-tooltip>

      <template v-if="item.type == ItemType.LocalDB">
        <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.TrashKoma')">
          <el-button size="small" tabindex="-1" @click="$emit('trash-koma')">
            <trash-can-outline-icon :size="12" />
          </el-button>
        </el-tooltip>
        <template v-if="clipboadKoma">
          <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.PasteKoma')">
            <el-button size="small" tabindex="-1" @click="$emit('paste-koma')">
              <content-paste-icon :size="12" />
            </el-button>
          </el-tooltip>
        </template>
        <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.InsertKoma')">
          <el-button size="small" tabindex="-1" @click="$emit('insert-new-koma')">
            <plus-icon :size="12" />
          </el-button>
        </el-tooltip>
        <el-tooltip effect="light" open-delay="1100" :content="$t('IDX-R.EditKoma')">
          <el-button size="small" tabindex="-1" @click="$emit('edit-koma')">
            <pencil-outline-icon :size="12" />
          </el-button>
        </el-tooltip>
        <div class="image-space"></div>
      </template>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
//import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';

import PlusCircleIcon from 'vue-material-design-icons/PlusCircle.vue';
import TextBoxMultipleOutlineIcon from 'vue-material-design-icons/TextBoxMultipleOutline.vue';
import ImageMultipleOutlineIcon from 'vue-material-design-icons/ImageMultipleOutline.vue';
import ImageOutlineIcon from 'vue-material-design-icons/ImageOutline.vue';
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import ContentPasteIcon from 'vue-material-design-icons/ContentPaste.vue';
import PencilOutlineIcon from 'vue-material-design-icons/PencilOutline.vue';
import TrashCanOutlineIcon from 'vue-material-design-icons/TrashCanOutline.vue';

import { i18n } from '@/lib/i18n';
import { AppActivity, Item, ItemType, Koma, KomaPart, KomaUtil } from '@model/index';
import { ListManager } from '@/data/ListManager';
import { String2image } from '@/char/String2image';
import { String2x } from '@/char/String2x';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';

interface Props {
  appActivity: AppActivity;
  item: Item;
  koma: Koma;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'close-palette-selector'): void;
  (e: 'edit-koma'): void;
  (e: 'insert-new-koma'): void;
  (e: 'paste-koma'): void;
  (e: 'trash-koma'): void;
}
defineEmits<Emits>();

const storeClipboad = userClipboadKoma();
const { imageColorTheme, clipboadKoma } = storeToRefs(storeClipboad);
const { copyToClipboad } = storeClipboad;

//onMounted(() => {
//  console.log('KomaToolbar');
//});

/**
 * Komaをクリップボードに登録するする
 *  以下の3つの機能を実行する
 *  1)  OSのクリップボードにコピーする
 *  2a) ItemType.LocalDB                 ならアプリ内クリップボードにコピーする(KomaとKomaPart)
 *  2b) ItemType.LocalMLT ItemType.WebMLTならアプリ内クリップボードにコピーする(Komaのみ)
 *  3)  ItemType.LocalMLT ItemType.WebMLTならレプリカファイルにコピーする
 */
function koma2Clipboard() {
  const item = props.item;
  const koma = props.koma;

  // 1 + (2a / 2b)
  if (item.type == ItemType.LocalDB) {
    window.localDB.getKomaParts({ path: item.url, komaID: koma.id }).then((obj) => {
      const kparts: KomaPart[] = KomaUtil.obj2komaParts(obj);
      copyToClipboad(koma, kparts);
    });
  } else {
    const kpart = new KomaPart();
    kpart.data = koma.data;
    kpart.html = String2x.html(kpart.data);
    kpart.name = 'AA1';
    copyToClipboad(koma, [kpart]);
  }

  // 3
  if (item.type == ItemType.WebMLT || item.type == ItemType.LocalFolderMLT) {
    const lm: ListManager = new ListManager();
    lm.replicaKoma(item, koma);
  }

  ElMessage({ message: i18n.t('IDX-R.Copied'), duration: 1100 });
}

// Komaを画像としてOSのクリップボードに登録する
function koma2ImageClipboad() {
  const koma = props.koma;

  try {
    const elm = document.querySelector('.image-space');
    if (!(elm instanceof HTMLElement)) return;

    //templateに記述しないのはレンダリング速度が低下するため
    const div = document.createElement('div');
    div.innerHTML = '<canvas id="hiddenCanvas" style="z-index:-100;"></canvas>';
    elm.appendChild(div);

    const canvas = document.querySelector('#hiddenCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const cv = String2image.convertCanvas2(canvas, koma.data, imageColorTheme.value);
    cv?.toBlob(async (blob) => {
      if (blob) {
        const ci = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([ci]);
      }
    });
    ElMessage({ message: i18n.t('IDX-R.CopiedImageKoma'), duration: 1100 });
    elm.removeChild(div);
  } catch {
    console.log('error');
  }
}

// Komaを画像ファイルに出力する
function koma2ImageFile() {
  const koma = props.koma;

  try {
    const elm = document.querySelector('.image-space');
    if (!(elm instanceof HTMLElement)) return;

    //templateに記述しないのはレンダリング速度が低下するため
    const div = document.createElement('div');
    div.innerHTML = '<canvas id="hiddenCanvas" style="z-index:-100;"></canvas>';
    elm.appendChild(div);

    const canvas = document.querySelector('#hiddenCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const cv = String2image.convertCanvas2(canvas, koma.data, imageColorTheme.value);
    const link = document.createElement('a');
    if (cv) {
      link.href = cv.toDataURL('image/jpeg', 1);
      link.download = props.item.name + '_AA_' + koma.label_num + '.jpg'; // 出力ファイル名
      link.click();
    }
    elm.removeChild(div);
  } catch {
    //
  }
}
</script>

<style scoped>
.koma-toolbar {
  display: inline-block;
}
.koma-toolbar button {
  padding: 0px 8px;
  font-size: 12px;
  border-top: solid 1px #f0f0f0;
  border-bottom: solid 1px #ccc;
  border-right: solid 1px #ccc;
  border-left: solid 1px #ccc;
  background: var(--aa-header-bg-color);
  color: var(--font-color);

  vertical-align: top;
  margin-top: -1px;
}

.koma-toolbar-inner {
  display: none;
  vertical-align: top;
  display: inline-block;
}

#hiddenCanvas {
  z-index: -100;
  position: absolute;
  top: 0;
  left: 0;
}
</style>

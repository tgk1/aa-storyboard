<template>
  <el-main>
    <div>
      <h2>{{ $t('ConfigView.Appearance') }}</h2>
      <el-select v-model="theme" style="width: 100px" @change="selectTheme">
        <el-option v-for="t in Theme" :key="t" :label="$t('ConfigView.Appearance-' + t)" :value="t">
          {{ $t('ConfigView.Appearance-' + t) }}
        </el-option>
      </el-select>
    </div>

    <div>
      <h3><FileOutlineIcon :size="16" /> {{ $t('ConfigView.LocalFolderDB_foler') }}</h3>
      <el-input v-model="dbPath" @change="setFolderDB">
        <template #append>
          <el-button :tabindex="-1" @click="selectFolderDB">
            <FolderOutlineIcon :size="16" />
          </el-button>
        </template>
      </el-input>
      <p>{{ $t('ConfigView.LocalFolderDB_info') }}</p>
    </div>

    <div>
      <h3><FolderOutlineIcon :size="16" /> {{ $t('ConfigView.LocalFolderMLT_foler') }}</h3>
      <el-input v-model="mltPath" @change="setFolderMLT">
        <template #append>
          <el-button :tabindex="-1" @click="selectFolderMLT">
            <FolderOutlineIcon :size="16" />
          </el-button>
        </template>
      </el-input>
      <p>{{ $t('ConfigView.LocalFolderMLT_info') }}</p>
      <p>
        <el-checkbox id="win32FsBug" v-model="win32FsBug" @change="setWin32FsBug">
          {{ $t('ConfigView.Win32FSBUG_info') }}
        </el-checkbox>
      </p>
      <p>
        <el-link type="primary" target="_blank" href="https://rss.r401.net/mlt/aa/">
          {{ $t('ConfigView.AA_Download') }}
        </el-link>
      </p>
    </div>

    <div>
      <h3>{{ $t('ConfigView.Font') }}</h3>
      <el-input v-model="fontName" @input="setFontName" />
      <div style="padding: 8px">
        <el-button @click="setFontName(FontName.Saitamaar.valueOf())">Saitamaar</el-button>
        <el-button @click="setFontName(FontName.MSPGothic.valueOf())">MS Pゴシック</el-button>
      </div>
      <p>{{ $t('ConfigView.Font_info_1') }}</p>
      <p>{{ $t('ConfigView.Font_info_2') }}</p>
      <p>{{ $t('ConfigView.Font_info_3') }}</p>
      <p>
        <el-link type="primary" target="_blank" href="https://fonts.aahub.org/">
          {{ $t('ConfigView.Download_font_from_aahub') }}
        </el-link>
      </p>
    </div>

    <div>
      <h3>{{ $t('ConfigView.CopyEncoding') }}</h3>
      <el-select v-model="copyEncoding" style="width: 140px" @change="setCopyEncoding">
        <el-option v-for="enc in CopyEncoding" :key="enc" :label="$t('ConfigView.CopyEncoding-' + enc)" :value="enc">
          {{ $t('ConfigView.CopyEncoding-' + enc) }}
        </el-option>
      </el-select>
      <p>{{ $t('ConfigView.CopyEncoding_info_1') }}</p>
      <p>{{ $t('ConfigView.CopyEncoding_info_2') }}</p>
      <p>{{ $t('ConfigView.CopyEncoding_info_3') }}</p>
    </div>

    <div>
      <h3>{{ $t('ConfigView.ImageColorTheme') }}</h3>
      <el-select v-model="imageColorTheme" style="width: 100px" @change="setImageColorTheme">
        <el-option
          v-for="color in ImageColorUtil.list()"
          :key="color"
          :label="$t('ConfigView.ImageColorTheme-' + color)"
          :value="color"
        />
      </el-select>
    </div>

    <div>
      <h3>{{ appName }}</h3>
      <p>{{ $t('ConfigView.Support') }}</p>
      <p>
        <el-link type="primary" target="_blank" href="https://rss.r401.net/mlt/">
          {{ $t('ConfigView.AppSite') }}
        </el-link>
      </p>
    </div>
  </el-main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import FileOutlineIcon from 'vue-material-design-icons/FileOutline.vue';
import FolderOutlineIcon from 'vue-material-design-icons/FolderOutline.vue';

import { AppConfigParam } from '@/data/config/AppConfig';
import { CopyEncoding, FontName, Theme, ImageColorTheme, ImageColorUtil } from '@model/index';

import { userMainIndexDataStore, userMLTSelectorDataStore } from '@/data/config/StoreMLTIndex';
import { userClipboadKoma } from '@/data/config/StoreClipboadKoma';

const storeA = userMainIndexDataStore();
const storeB = userMLTSelectorDataStore();
const { fontName } = storeToRefs(storeA);

const storeC = userClipboadKoma();
const { copyEncoding, imageColorTheme } = storeToRefs(storeC);

let cnf: AppConfigParam;
const theme = ref(Theme.System);
const dbPath = ref('');
const mltPath = ref('');
const win32FsBug = ref(false);
const appName = ref('');

onMounted(() => {
  getConfig();
});

async function getConfig() {
  cnf = await window.appConfig.get();

  theme.value = cnf.Theme;
  dbPath.value = cnf.PathLocalFolderDB;
  mltPath.value = cnf.PathLocalFolderMLT;
  win32FsBug.value = cnf.Win32FsBug;
  appName.value = cnf.AppName;
}

function selectTheme() {
  cnf.Theme = theme.value;
  window.appConfig.set(cnf);
  window.appConfig.applyTheme(cnf.Theme);
}

function setFolderDB() {
  cnf.PathLocalFolderDB = dbPath.value;
  window.appConfig.set(cnf);
  window.appConfig.mkAppDir();
}

function setFolderMLT() {
  cnf.PathLocalFolderMLT = mltPath.value;
  window.appConfig.set(cnf);
}

function selectFolderDB() {
  const path = window.appConfig.folder(dbPath.value);
  if (path) {
    dbPath.value = path[0];
    setFolderDB();
  }
}

function selectFolderMLT() {
  const path = window.appConfig.folder(mltPath.value);
  if (path) {
    mltPath.value = path[0];
    setFolderMLT();
  }
}

function setWin32FsBug() {
  cnf.Win32FsBug = win32FsBug.value;
  window.appConfig.set(cnf);
}

function setFontName(name: string) {
  if (name != '') {
    fontName.value = name;
    {
      const { fontName } = storeToRefs(storeB);
      fontName.value = name;
    }
  }
}

function setCopyEncoding(enc: CopyEncoding) {
  copyEncoding.value = enc;
}

function setImageColorTheme(color: ImageColorTheme) {
  imageColorTheme.value = color;
}
</script>

<style scoped>
h1,
h2 {
  margin: 2rem 0 0.2rem 0;
  line-height: 1.5;
  font-weight: normal;
}
p {
  font-size: 0.9rem;
  line-height: 1.2;
  margin: 0.2rem 0.6em;
}
.el-main {
  height: 100vh;
  margin: 0;
  padding: 0 2em 4em 1em;
}
.el-main > div {
  padding: 1em;
}
.el-input-group__append button.el-button {
  height: 36px;
}
</style>

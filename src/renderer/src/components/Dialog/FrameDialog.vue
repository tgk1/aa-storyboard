<template>
  <el-dialog :title="$t('D.Frame')">
    <el-button size="large" @click="$emit('select-frame-number', 0)">
      <pre>┌───┐<br>│ abc &#x3000;&#x2006;│<br>└───┘</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 1)">
      <pre>┌───┐<br> abc <br>└───┘</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 2)">
      <pre>────<br> abc <br>────</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 9)">
      <pre>┌&#x3000;&#x3000;&#x3000;┐<br>│abc&#8196;&#8197;│<br>└&#x3000;&#x3000;&#x3000;┘</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 3)">
      <pre>f´￣￣￣｀ヽ<br>|&#x3000; abc&#x3000;&#x3000;&#x3000;|<br>乂＿＿＿_ノ</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 4)">
      <pre>f´￣￣￣｀ヽ<br>|&#x3000; abc&#x3000;&#x3000;&#x3000;|<br>ヽ＿＿＿_乂</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 5)">
      <pre>. : :.:.:.:.:.:.:.:.: : .<br>. :&#x3000; abc&#x3000;&#x3000;: .<br>. : :.:.:.:.:.:.:.:.: : .</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 6)">
      <pre>＼人_人_人_／<br>＞&#x3000; abc&#x3000;&#x3000;＜<br>／Y⌒ＹW⌒＼</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 8)">
      <pre>､__人_人_人_<br>）&#x3000; abc&#x3000;&#x3000;（<br>⌒Y⌒Ｙ⌒</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 7)">
      <pre>＼ヽ l｜l｜/／<br>二&#x3000; abc&#x3000;&#x3000;二<br>／/ l｜l｜ヽ＼</pre>
    </el-button>
    <el-button size="large" @click="$emit('select-frame-number', 10)">
      <pre>／￣￣＼<br>|&#12288;abc&#8196;&#8196;&#12288;|<br>＼＿＿／</pre>
    </el-button>

    <p>
      {{ $t('D.Frame_Info1') }}
    </p>
  </el-dialog>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'select-frame-number', frameNumber: number): void;
}
defineEmits<Emits>();
</script>

<style scoped>
button {
  margin: 8px 8px;
  height: 80px;
}
pre {
  font-family: 'Saitamaar';
  font-weight: normal;
  font-size: 16px;
  line-height: 18px;
  white-space: pre;
  padding: 0;
  margin: 0;
}
</style>

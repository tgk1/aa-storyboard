<template>
  <div id="etc-info">
    <table id="infoChar">
      <tr>
        <th>{{ $t('TEDIT.GridWidth') }}</th>
        <td>{{ props.infoGrid }}</td>
        <th>X</th>
        <td>{{ props.infoX }}</td>
        <th>Y</th>
        <td>{{ props.infoY }}</td>
        <th>{{ $t('TEDIT.CharactersWidth') }}</th>
        <td>{{ props.infoWidth }}</td>
        <th>{{ $t('TEDIT.Character') }}</th>
        <td class="char">[{{ props.infoChar }}]</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  infoX: number;
  infoY: number;
  infoGrid: number;
  infoWidth: number;
  infoChar: string;
}
const props = withDefaults(defineProps<Props>(), {
  infoX: 0,
  infoY: 0,
  infoGrid: 0,
  infoWidth: 0,
  infoChar: ''
});
</script>

<style scoped>
#etc-info {
  margin: 4px 2px 2px 20px;
}
#infoChar {
  vertical-align: middle;
  border: solid #ccc 1px;
  color: #666;
  margin: 8px 0px;
  height: 24px;
}
#infoChar th {
  line-height: 18px;
  font-weight: normal;
  color: var(--font-sub-color);
}
#infoChar td {
  text-align: right;
  padding: 0px 4px 0px 8px;
  background-color: var(--close-bg-color);
  color: var(--font-color);
  line-height: 18px;
  width: 18px;
  border: solid #ccc 1px;
}
#infoChar .char {
  width: auto;
}
</style>

import { Ref, nextTick } from 'vue';

export const focusUI = function (obj: Ref<InstanceType<typeof HTMLInputElement> | null>) {
  new Promise(() => {
    setTimeout(() => {
      nextTick(() => {
        obj.value?.focus();
      });
    }, 100);
  });
};

<template>
  <div class="size-full home-view">
    <header class="h-[--header-height] bg-#66ccff flex justify-center items-center">
      <div class="text-18px">月下琉璃花未眠</div>
    </header>
    <section class="h-[--main-height] p-10px">
      <div>
        <van-button type="primary" @click="openDialogImport">导入数据</van-button>
        <dialog-import-by-url ref="dialogImport" />
      </div>
    </section>
    <footer>
      <div></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import DialogImportByUrl from '@/components/dialog/DialogImportByUrl.vue'
import { ref } from 'vue'

const dialogImport = ref<InstanceType<typeof DialogImportByUrl>>()
function openDialogImport() {
  dialogImport.value?.open()
}
</script>

<style scoped lang="scss">
.home-view {
  --header-height: 60px;
  --main-height: calc(100% - var(--header-height));
}
</style>

<template>
  <div class="size-full home-view">
    <header class="h-[--header-height] bg-#66ccff flex justify-center items-center">
      <div class="text-24px fw-bold">「云上琉璃」</div>
    </header>
    <section class="h-[--main-height] p-10px">
      <div class="h-full flex justify-center items-center">
        <van-button type="primary" size="large" @click="openDialogImport">导入数据</van-button>
      </div>
    </section>
    <footer>
      <div></div>
    </footer>
    <dialog-import-by-url ref="dialogImport" />
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

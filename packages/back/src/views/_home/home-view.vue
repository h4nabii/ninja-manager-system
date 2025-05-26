<template>
  <div class="size-full home-view">
    <header class="h-[--header-height] bg-#66ccff flex items-center px-20px">
      <div class="text-24px fw-bold">「云上琉璃」</div>
    </header>
    <section class="h-[--main-height] flex">
      <aside class="h-full w-[--menu-width]">
        <home-menu />
      </aside>
      <div class="w-[--main-width] views p-10px box-border">
        <router-view />
      </div>
    </section>
    <footer>
      <div></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HomeMenu from '@/views/_home/components/home-menu.vue'
</script>

<style scoped lang="scss">
.home-view {
  --header-height: 60px;
  --main-height: calc(100% - var(--header-height));
  --menu-width: 200px;
  --main-width: calc(100% - var(--menu-width));

  .views {
    box-shadow: inset 2px 2px 5px -1px #ccc;
    background: rgb(240, 242, 245);
  }
}
</style>

<template>
  <el-pagination
    class="w-full !m-0 box-border px-10px"
    v-model:current-page="page"
    v-model:page-size="size"
    :total
    background
    layout="total, ->, prev, pager, next, sizes, jumper"
  />
</template>

<script setup lang="ts">
defineProps<{ total: number }>();
const page = defineModel<number>("page");
const size = defineModel<number>("size");
</script>

<style scoped></style>

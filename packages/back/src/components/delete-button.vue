<template>
  <el-button type="danger" @click="confirm">删除</el-button>
</template>

<script setup lang="ts">
import { ElMessageBox } from "element-plus";

const props = defineProps<{
  callback: () => any;
}>();

function confirm() {
  console.log("delete");
  ElMessageBox.confirm("此操作将永久删除该数据, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => props.callback())
    .catch((error) => console.error(error));
}
</script>

<style scoped></style>

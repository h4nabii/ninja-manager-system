<template>
  <div class="flex gap-10px">
    <el-input v-model="value" @change="changeSearch" :placeholder>
      <template #prepend>
        <el-icon>
          <el-search-icon />
        </el-icon>
      </template>
    </el-input>
    <!--<el-button type="primary" @click="clickSearch">搜索</el-button>-->
  </div>
</template>

<script setup lang="ts">
import { Search as ElSearchIcon } from "@element-plus/icons-vue";
import { watch } from "vue";

const { placeholder = "请输入关键词" } = defineProps<{
  placeholder?: string;
}>();

const emits = defineEmits<{
  search: [string];
  change: [string];
  click: [string];
  input: [string];
}>();

const value = defineModel<string>({ default: "" });

watch(value, (val) => {
  emits("input", val);
});

async function changeSearch() {
  emits("change", value.value);
  emits("search", value.value);
}

async function clickSearch() {
  emits("click", value.value);
  emits("search", value.value);
}
</script>

<style scoped></style>

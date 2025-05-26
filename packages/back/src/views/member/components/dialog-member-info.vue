<template>
  <el-dialog v-model="visible" class="global-styled-el-dialog" :title>
    {{ uid }}
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const title = '成员信息'
const uid = ref<string>()

function open(options: { uid: string }) {
  visible.value = true
  uid.value = options.uid
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped></style>

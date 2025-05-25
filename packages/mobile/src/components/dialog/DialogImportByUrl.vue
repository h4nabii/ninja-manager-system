<template>
  <van-dialog v-model:show="visible" @confirm="submit">
    <template #title>
      <div class="mb-10px">{{ title }}</div>
    </template>
    <div class="bg-#eee py-20px">
      <van-cell-group inset>
        <van-field v-model="url" type="textarea" :rows="10" autosize />
      </van-cell-group>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { showToast } from 'vant'

const visible = ref(false)
const title = '导入数据'
const url = ref('')

async function submit() {
  if (!url.value) return
  const resp = await axios.post('/ninja_api/import/byUrl', { url: url.value })
  const info = resp.data
  console.log(info.message)
  const type = info.data.type
  let message = ''
  if (type === 'member') message = '导入成员数据成功'
  else if (type === 'battle-report') message = '导入族战数据成功'

  showToast({
    message,
    type: 'success',
    duration: 1000,
  })
}

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style scoped lang="scss">
:deep(.van-dialog) {
  .van-dialog__header {
    padding: 0;
  }
}
</style>

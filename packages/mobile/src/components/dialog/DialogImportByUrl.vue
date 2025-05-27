<template>
  <van-dialog v-model:show="visible" show-cancel-button @confirm="submit">
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
import { showToast } from 'vant'
import { instance } from '@/utils/request'

const visible = ref(false)
const title = '导入数据'
const url = ref('')

async function submit() {
  if (!url.value) return
  const resp = await instance.post('/import/byUrl', { url: url.value })
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

async function extractClipboardUrl() {
  // 非 HTTPS 下不工作
  if (!navigator.clipboard) return
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      url.value = text
      showToast({
        message: '已从剪贴板提取URL',
        type: 'success',
        duration: 1000,
      })
    } else {
      showToast({
        message: '剪贴板中没有URL',
        type: 'fail',
        duration: 1000,
      })
    }
  } catch (err: any) {
    if (err && (err.name === 'NotAllowedError' || err.message?.includes('denied'))) {
      showToast({
        message: '请在浏览器设置中授予剪贴板读取权限，或手动粘贴',
        type: 'fail',
        duration: 2500,
      })
    } else {
      showToast({
        message: '无法读取剪贴板',
        type: 'fail',
        duration: 1000,
      })
    }
  }
}

function open() {
  extractClipboardUrl()
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

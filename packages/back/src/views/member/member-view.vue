<template>
  <div class="size-full flex flex-col bg-white rounded-4px p-10px gap-10px">
    <!-- options-bar -->
    <div>
      <el-button type="primary" disabled>导入数据</el-button>
    </div>
    <!-- main-content -->
    <el-table class="flex-1" border :data>
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="uid" label="UID" align="center" />
      <el-table-column prop="joinTime" label="加入时间" align="center">
        <template #default="{ row }">
          {{ row.joinTime ? dayjs(row.joinTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template #default="{ row }">
          <el-button type="primary" @click="openMemberInfoDialog(row.uid)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <custom-pagination v-model:page="page" v-model:size="size" :total />
    <dialog-member-info ref="dialogMemberInfoRef" />
  </div>
</template>

<script setup lang="ts">
import CustomPagination from '@/components/custom-pagination.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'
import DialogMemberInfo from '@/views/member/components/dialog-member-info.vue'
import { instance } from '@/utils/request'

const data = ref<any[]>([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

async function loadData() {
  const resp = await instance.post('/member/getMemberPage', reactive({ page, size }))
  const info = resp.data.data
  data.value = info.list
  total.value = info.pagination.total
}

onMounted(loadData)
watch([page, size], loadData)

const dialogMemberInfoRef = ref<InstanceType<typeof DialogMemberInfo>>()
function openMemberInfoDialog(uid: string) {
  dialogMemberInfoRef.value?.open({ uid })
}
</script>

<style scoped></style>

<template>
  <div class="size-full p-10px flex flex-col gap-10px">
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
          <el-button type="primary">详情{{ row.id }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <custom-pagination v-model:page="page" v-model:size="size" :total />
  </div>
</template>

<script setup lang="ts">
import CustomPagination from '@/components/custom-pagination.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'

const data = ref<any[]>([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

async function loadData() {
  const resp = await axios.post('/ninja_api/member/getMemberPage', reactive({ page, size }))
  const info = resp.data.data
  data.value = info.list
  total.value = info.pagination.total
}

onMounted(loadData)
watch([page, size], loadData)
</script>

<style scoped></style>

<template>
  <div class="info-view size-full flex flex-col bg-white rounded-4px p-10px gap-10px">
    <div>
      <el-radio-group v-model="activeType">
        <el-radio-button v-for="{ label, value } in types" :label :value />
      </el-radio-group>
    </div>
    <div class="flex gap-10px flex-1">
      <div class="w-200px flex">
        <card-menu v-model="selectedDay" :options="weeks" />
      </div>
      <div class="card-border flex-1">
        <div>{{ selectedDay }}</div>
        <div>{{ selectedDay ? BattleWeek.fromKeyStr(selectedDay).abyss.dateStr : '-' }}</div>
        <div>{{ selectedDay ? BattleWeek.fromKeyStr(selectedDay).saturday.dateStr : '-' }}</div>
        <div>{{ selectedDay ? BattleWeek.fromKeyStr(selectedDay).sunday.dateStr : '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import CardMenu from '@/views/welfare/components/card-menu.vue'
import { BattleWeek, getLastManyBattleWeeks } from '@/utils/week.ts'
import { instance } from '@/utils/request'

const types = [
  { label: '每周福利', value: 'weekly' },
  { label: '每月福利', value: 'monthly' },
]

const activeType = ref(types[0].value)

const weeks = ref<any[]>([])
const selectedDay = ref('')

watch(selectedDay, () => {
  instance
    .post('/welfare/getWelfareInfo', {
      satDate: BattleWeek.fromKeyStr(selectedDay.value).saturday.dateStr,
    })
    .then((response) => {
      console.log('Welfare data:', response.data)
      // Process the response data as needed
    })
    .catch((error) => {
      console.error('Error fetching welfare data:', error)
    })
})

onMounted(() => {
  weeks.value = getLastManyBattleWeeks(10).map((week) => {
    const year = week.year
    const month = week.month
    const order = week.orderNumInMonth
    return { label: `${year}年${month}月第${order}周`, value: week.keyStr }
  })
})
</script>

<style scoped lang="scss">
.card-border {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}
</style>

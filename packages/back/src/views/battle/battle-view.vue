<template>
  <div class="battle-view size-full flex flex-col bg-white rounded-4px p-10px gap-10px">
    <div class="flex items-center gap-10px box-border">
      <div class="flex items-center">
        <div>数据范围：</div>
        <el-select v-model="curMouth" class="!w-200px">
          <el-option v-for="{ label, value } of mouthList" :key="value" :label :value />
        </el-select>
      </div>
    </div>
    <div>
      <div v-for="week of weeks">
        <div>{{ week.text }}</div>
        <div class="flex">
          <div class="battle-card">
            <div>{{ week.day1.date }}</div>
            <div>{{ week.day1.state }}</div>
          </div>
          <div class="battle-card">
            <div>{{ week.day2.date }}</div>
            <div>{{ week.day2.state }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { onMounted, ref, watch } from 'vue'
import { getLastManyWeekends, getWeekendsOfMonth, monthOrderNumOfDay } from '@/utils/week.ts'
import axios from 'axios'

const mouthList = getMouthList()
const curMouth = ref<string>('last')
function getMouthList() {
  const list: any[] = []
  list.push({ label: '最近5周', value: 'last' })
  const endTime = dayjs('2024-01-01')
  let time = dayjs()
  while (time.isAfter(endTime)) {
    const str = time.format('YYYY-MM')
    list.push({ label: str, value: str })
    time = time.subtract(1, 'month')
  }
  return list
}

const weeks = ref<any[]>([])

onMounted(loadWeeks)
watch(curMouth, loadWeeks)
async function loadWeeks() {
  const fmt = (time: any) => dayjs(time).format('YYYY-MM-DD')
  let weekends: Date[]
  if (curMouth.value === 'last') {
    weekends = getLastManyWeekends(5)
  } else {
    const [yearStr, monthStr] = curMouth.value.split('-')
    weekends = getWeekendsOfMonth(Number(yearStr), Number(monthStr))
  }
  weeks.value = await Promise.all(
    weekends.map(async (weekend) => {
      const d = dayjs(weekend).startOf('day')
      const text = `${d.format('M月')}第${monthOrderNumOfDay(d)}周`
      const date1 = d.toISOString()
      const date2 = d.add(1, 'day').toISOString()
      const states = await checkImportStates([date1, date2])
      const day1 = { date: fmt(date1), state: states[date1] }
      const day2 = { date: fmt(date2), state: states[date2] }
      return { text, day1, day2 }
    }),
  )
}

async function checkImportStates(days: string[]) {
  const resp = await axios.post('/ninja_api/import/checkBattleImportStates', { days })
  const states = resp.data.data
  return Object.fromEntries(states.map((i) => [i.date, i.state]))
}
</script>

<style scoped lang="scss">
.battle-view {
  .battle-card {
    width: 200px;
    height: 100px;
    border: 1px solid #cecece;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    cursor: pointer;
    transition: box-shadow 0.1s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 4px 4px 6px -2px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>

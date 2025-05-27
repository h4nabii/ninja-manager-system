<template>
  <div class="battle-view size-full flex flex-col bg-white rounded-4px p-10px gap-10px">
    <div class="h-[--header-height] flex items-center gap-10px box-border">
      <div class="flex items-center">
        <div>数据范围：</div>
        <el-select v-model="curMouth" class="!w-200px">
          <el-option v-for="{ label, value } of mouthList" :key="value" :label :value />
        </el-select>
      </div>
    </div>
    <div class="h-[--main-height] flex-1 flex gap-[--gap]">
      <div class="shadow-border h-full w-[--menu-width] flex flex-col gap-20px p-10px">
        <div v-for="week of weeks" class="flex flex-col gap-10px">
          <div>{{ week.text }}</div>
          <div class="flex flex-col gap-10px">
            <div
              class="battle-card"
              :class="{ active: battleTime === week.day1.date }"
              @click="selectBattle(week.day1)"
            >
              <div>{{ week.day1.date }}</div>
              <div :class="{ [week.day1.state]: true }">{{ week.day1.text }}</div>
            </div>
            <div
              class="battle-card"
              :class="{ active: battleTime === week.day2.date }"
              @click="selectBattle(week.day2)"
            >
              <div>{{ week.day2.date }}</div>
              <div :class="{ [week.day2.state]: true }">{{ week.day2.text }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="shadow-border w-[--main-width] p-10px flex flex-col gap-10px overflow-hidden">
        <template v-if="status === 'imported'">
          <div class="flex gap-10px items-center">
            <el-radio-group v-model="fightType">
              <el-radio-button v-for="{ label, value } in fightTypeOptions" :label :value />
            </el-radio-group>
            <div class="enemy-info flex items-center">
              <div>敌对家族：</div>
              <div>{{ battleInfo?.enemyName }}</div>
            </div>
            <div>{{ battleTime }}</div>
            <div>{{ fightType }}</div>
          </div>
          <template v-if="fightType.startsWith('raid')">
            <el-table class="flex-1" :data border>
              <el-table-column label="排名" prop="rank" align="center" width="55" />
              <el-table-column label="昵称">
                <template #default="{ row }">
                  <div v-if="row.name">{{ row.name }}</div>
                  <div v-else class="italic text-#999">无数据</div>
                </template>
              </el-table-column>
              <el-table-column label="UID" prop="uid" />
              <el-table-column label="常用QQ" prop="qq" />
              <el-table-column label="分数" prop="score" />
              <el-table-column label="历史平均" prop="scoreAvg" />
              <el-table-column label="标准参考" prop="standardDiff" />
            </el-table>
            <custom-pagination v-model:page="page" v-model:size="size" :total />
          </template>
          <div v-else class="flex-1">
            <el-empty class="size-full" description="内容开发中" />
          </div>
        </template>
        <div v-else class="size-full flex flex-col items-center justify-center gap-20px">
          <div class="text-28px fw-bold">数据导入</div>
          <div class="flex gap-30px w-full h-80% justify-center">
            <div class="empty-border-block flex flex-col">
              <div class="fw-bold">方法一：扫描二维码，打开移动端网页使用分享链接导入</div>
              <canvas class="qr-code-canvas" ref="qrCodeCanvas"></canvas>
            </div>
            <div class="empty-border-block flex flex-col">
              <div class="fw-bold">方法二：在后台直接导入（开发中）</div>
              <div class="h-80px flex items-center justify-center">
                <el-button type="primary" @click="importData">导入数据</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomPagination from '@/components/custom-pagination.vue'
import dayjs from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getLastManyWeekends, getWeekendsOfMonth, monthOrderNumOfDay } from '@/utils/week.ts'
import { instance } from '@/utils/request'
import qrCode from 'qrcode'

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

const battleTime = ref('')
const status = ref('')
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
      const day1 = { date: fmt(date1), state: states[date1].state, text: states[date1].text }
      const day2 = { date: fmt(date2), state: states[date2].state, text: states[date2].text }
      return { text, day1, day2 }
    }),
  )
  if (weeks.value[0]?.day1) selectBattle(weeks.value[0]?.day1)
}

const battleInfo = ref<any>()
watch(battleTime, async (newTime) => {
  if (newTime && status.value === 'imported') {
    const resp = await instance.post('/battle/getBattleInfo', { date: newTime })
    battleInfo.value = resp.data.data
  }
})

function selectBattle(obj: any) {
  battleTime.value = obj.date
  status.value = obj.state
}

async function checkImportStates(days: string[]) {
  const resp = await instance.post('/import/checkBattleImportStates', { days })
  const states = resp.data.data
  return Object.fromEntries(states.map((i: any) => [i.date, { ...i }]))
}

const fightTypeOptions = computed(() => {
  if (!battleInfo.value) return []
  return [
    { label: `团本：${battleInfo.value.raidType1}`, value: 'raid1' },
    { label: `团本：${battleInfo.value.raidType2}`, value: 'raid2' },
    { label: '3v3', value: 'fight' },
  ]
})
const fightType = ref('raid1')

const page = ref(1)
const size = ref(20)
const total = ref(0)
const data = ref<any[]>([])
watch([battleTime, fightType, page, size], async () => {
  if (battleTime.value && fightType.value && status.value === 'imported') {
    try {
      const resp = await instance.post('/battle/getFightInfo', {
        type: fightType.value,
        time: battleTime.value,
        page: page.value,
        size: size.value,
      })
      console.log(resp)
      const info = resp.data.data
      data.value = info.list
      total.value = info.pagination.total
    } catch (error) {}
  } else {
    data.value = []
    total.value = 0
  }
})

function importData() {
  ElMessage.warning('内容开发中')
}

const qrCodeCanvas = ref<HTMLCanvasElement>()
watch(qrCodeCanvas, async () => {
  if (qrCodeCanvas.value) {
    try {
      await qrCode.toCanvas(qrCodeCanvas.value, 'http://1.94.149.145/ninja/mobile', { width: 200 })
    } catch (err) {
      console.error('QR Code generation failed:', err)
    }
  }
})
</script>

<style scoped lang="scss">
.battle-view {
  --gap: 10px;

  --header-height: 32px;
  --main-height: calc(100% - var(--header-height) - var(--gap));

  --menu-width: 210px;
  --main-width: calc(100% - var(--menu-width) - var(--gap));

  .battle-card {
    width: 100%;
    height: 36px;
    padding: 0 20px;
    border: 1px solid #cecece;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 10px;
    cursor: pointer;
    transition: box-shadow 0.1s ease;

    &.active {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 4px 4px 6px -2px rgba(0, 0, 0, 0.1);
    }

    .imported {
      color: var(--el-color-success);
    }

    .no-data {
      color: var(--el-color-danger);
    }
  }

  .enemy-info {
    height: 32px;
    border: 1px solid #cecece;
    border-radius: 4px;
    padding: 1px 10px;
    box-shadow: 1px 1px 3px -1px #cecece;
  }

  .shadow-border {
    border: 1px solid #cecece;
    border-radius: 8px;
    box-shadow: 3px 3px 5px -2px #cecece;
  }

  .empty-border-block {
    width: 45%;
    height: 90%;
    min-width: 500px;
    min-height: 500px;
    border: 1px solid #cecece;
    border-radius: 8px;
    box-shadow: 3px 3px 5px -2px #cecece;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;

    .qr-code-canvas {
      width: 200px;
      height: 200px;
    }
  }
}
</style>

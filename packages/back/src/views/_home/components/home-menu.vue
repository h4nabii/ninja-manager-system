<template>
  <div class="size-full pt-20px">
    <div
      v-for="item of menuList"
      class="item"
      :class="{ active: item.name == curName }"
      @click="changeMenu(item.name)"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

const menuList = [
  { name: 'member', text: '成员管理' },
  { name: 'battle', text: '族战管理' },
  { name: 'info', text: '家族概况' },
  { name: 'welfare', text: '福利管理' },
]
const curName = computed(() => route.name)

function changeMenu(name: string) {
  if (name === curName.value) return
  router.push({ name })
}

onMounted(async () => {
  if (route.name === 'home') await router.replace({ name: 'member' })
})
</script>

<style scoped lang="scss">
.item {
  padding: 10px;
  cursor: pointer;

  &.active {
    background-color: #66ccff;
  }
}
</style>

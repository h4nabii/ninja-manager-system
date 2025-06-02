<template>
  <div class="card-menu">
    <div v-if="headerText">
      <slot name="header">
        <div>{{ headerText }}</div>
      </slot>
    </div>
    <div class="flex flex-col gap-10px">
      <card-item
        v-for="{ label, value } in options"
        class="h-32px"
        :active="value === activeMenu"
        @click="onClickItem(value)"
      >
        {{ label }}
      </card-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardItem from '@/components/card-item.vue'
import { ref } from 'vue'

const props = defineProps<{
  options: { label: string; value: string }[]
}>()

const headerText = ref('')

const activeMenu = defineModel<string>({ default: '' })

async function onClickItem(value: string) {
  console.log(`Clicked on: ${value}`)
  activeMenu.value = value
}
</script>

<style scoped lang="scss">
.card-menu {
  height: 100%;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}
</style>

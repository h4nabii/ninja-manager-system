<template>
  <div class="card-item" :class="{ active }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean
  }>(),
  { active: false },
)
</script>

<style scoped lang="scss">
.card-item {
  padding: 0 20px;
  border: 1px solid #cecece;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: box-shadow 0.1s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 4px 4px 6px -2px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }
}
</style>

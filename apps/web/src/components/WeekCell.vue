<script setup lang="ts">
import { WeekStatus } from '../types'

defineProps<{
  weekNumber: number
  status: WeekStatus
}>()
</script>

<template>
  <div
    class="week-cell"
    :class="{
      'week-cell--lived': status === WeekStatus.Lived,
      'week-cell--current': status === WeekStatus.Current,
      'week-cell--future': status === WeekStatus.Future,
    }"
    :title="`Week ${weekNumber}`"
  />
</template>

<style scoped>
.week-cell {
  aspect-ratio: 1;
  border-radius: 1px;
}

.week-cell--lived {
  background-color: var(--tg-theme-accent-text-color, var(--tg-theme-button-color, #3b82f6));
}

.week-cell--current {
  background-color: var(--tg-theme-button-color, #f97316);
  animation: pulse 2s ease-in-out infinite;
}

.week-cell--future {
  border: 1px solid var(--tg-theme-hint-color, #4b5563);
  opacity: 0.4;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>

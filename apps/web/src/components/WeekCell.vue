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
  animation: fill-in 0.3s ease-out both;
  animation-delay: calc(var(--week) * 0.7ms);
}

.week-cell--current {
  background-color: var(--tg-theme-button-color, #f97316);
  animation:
    fill-in 0.3s ease-out both,
    pulse 2s ease-in-out infinite;
  animation-delay: calc(var(--week) * 0.7ms), calc(var(--week) * 0.7ms + 0.3s);
}

.week-cell--future {
  border: 1px solid var(--tg-theme-hint-color, #4b5563);
  opacity: 0.4;
}

@keyframes fill-in {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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

@media (prefers-reduced-motion: reduce) {
  .week-cell--lived {
    animation: none;
  }
  .week-cell--current {
    animation: pulse 2s ease-in-out infinite;
  }
}
</style>

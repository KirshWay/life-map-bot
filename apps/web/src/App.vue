<script setup lang="ts">
import { onMounted } from 'vue'
import { useTelegram } from './composables/useTelegram'
import { useLifeMap } from './composables/useLifeMap'
import WeekGrid from './components/WeekGrid.vue'

const { isReady, error: sdkError, initDataRaw, initialize } = useTelegram()
const {
  user,
  isLoading,
  error: apiError,
  totalYears,
  weeksPerYear,
  weeksLived,
  currentWeek,
  fetchUser,
} = useLifeMap()

onMounted(async () => {
  await initialize()
  if (initDataRaw.value) {
    await fetchUser(initDataRaw.value)
  }
})
</script>

<template>
  <div class="app">
    <div v-if="sdkError" class="fallback">
      <p class="fallback-title">Life Map</p>
      <p class="fallback-text">{{ sdkError }}</p>
    </div>

    <div v-else-if="!isReady || isLoading" class="loading">
      <div class="spinner" />
    </div>

    <div v-else-if="apiError" class="fallback">
      <p class="fallback-title">Error</p>
      <p class="fallback-text">{{ apiError }}</p>
    </div>

    <div v-else-if="!user" class="fallback">
      <p class="fallback-title">No Data</p>
      <p class="fallback-text">Send /start to the bot first to set your birth date.</p>
    </div>

    <WeekGrid
      v-else
      :weeks-lived="weeksLived"
      :current-week="currentWeek"
      :total-years="totalYears"
      :weeks-per-year="weeksPerYear"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--tg-theme-bg-color, #1a1a2e);
  color: var(--tg-theme-text-color, #f5f5f5);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--tg-theme-hint-color, #6b7280);
  border-top-color: var(--tg-theme-button-color, #2481cc);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fallback {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
}

.fallback-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.fallback-text {
  font-size: 14px;
  color: var(--tg-theme-hint-color, #6b7280);
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTelegram } from './composables/useTelegram'
import { useLifeMap } from './composables/useLifeMap'
import { useShareLifeMap } from './composables/useShareLifeMap'
import WeekGrid from './components/WeekGrid.vue'
import ShareButton from './components/ShareButton.vue'

const { isReady, error: sdkError, firstName, initDataRaw, initialize } = useTelegram()
const {
  user,
  isLoading,
  error: apiError,
  totalWeeks,
  totalYears,
  weeksPerYear,
  weeksLived,
  currentWeek,
  fetchUser,
} = useLifeMap()

const { isSharing, shareError, share } = useShareLifeMap({
  weeksLived,
  currentWeek,
  totalWeeks,
  totalYears,
  weeksPerYear,
  firstName,
  initDataRaw,
})

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

    <div v-else class="content">
      <div class="header">
        <p class="header-greeting">
          {{ firstName ? `${firstName}, this is` : 'This is' }} week {{ currentWeek }} of your life
        </p>
        <div class="header-stats-row">
          <p class="header-stats">{{ weeksLived }} of {{ totalWeeks }} weeks lived</p>
          <ShareButton :is-sharing="isSharing" :error="shareError" @share="share" />
        </div>
      </div>
      <WeekGrid
        :weeks-lived="weeksLived"
        :current-week="currentWeek"
        :total-years="totalYears"
        :weeks-per-year="weeksPerYear"
      />
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: calc(
    var(--tg-viewport-safe-area-inset-top, 0px) +
      var(--tg-viewport-content-safe-area-inset-top, 0px)
  );
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

.content {
  margin: auto 0;
}

.header {
  text-align: center;
  padding: 16px 8px 8px;
}

.header-greeting {
  font-size: 16px;
  font-weight: 600;
}

.header-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
}

.header-stats {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #6b7280);
}
</style>

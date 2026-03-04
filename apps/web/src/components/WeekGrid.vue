<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import WeekCell from './WeekCell.vue'
import { WeekStatus } from '../types'

const props = defineProps<{
  weeksLived: number
  currentWeek: number
  totalYears: number
  weeksPerYear: number
}>()

const currentYearRef = ref<HTMLDivElement | null>(null)

const years = computed(() => {
  const result = []
  for (let year = 0; year < props.totalYears; year++) {
    const weeks = []
    for (let week = 0; week < props.weeksPerYear; week++) {
      const weekNumber = year * props.weeksPerYear + week + 1
      let status: WeekStatus
      if (weekNumber < props.currentWeek) {
        status = WeekStatus.Lived
      } else if (weekNumber === props.currentWeek) {
        status = WeekStatus.Current
      } else {
        status = WeekStatus.Future
      }
      weeks.push({ weekNumber, status })
    }
    result.push({ year, weeks })
  }
  return result
})

const currentYear = computed(() => Math.floor((props.currentWeek - 1) / props.weeksPerYear))

onMounted(async () => {
  await nextTick()
  currentYearRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})
</script>

<template>
  <div class="week-grid-container">
    <div
      v-for="{ year, weeks } in years"
      :key="year"
      :ref="
        (el) => {
          if (year === currentYear) currentYearRef = el as HTMLDivElement
        }
      "
      class="year-row"
    >
      <div class="year-label">
        {{ year % 10 === 0 ? year : '' }}
      </div>
      <div class="weeks-row">
        <WeekCell
          v-for="week in weeks"
          :key="week.weekNumber"
          :week-number="week.weekNumber"
          :status="week.status"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.week-grid-container {
  width: 100%;
  padding: 8px;
}

.year-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.year-label {
  width: 24px;
  flex-shrink: 0;
  font-size: 9px;
  text-align: right;
  padding-right: 4px;
  color: var(--tg-theme-hint-color, #999);
}

.weeks-row {
  display: grid;
  grid-template-columns: repeat(52, 1fr);
  gap: 1px;
  flex: 1;
}
</style>

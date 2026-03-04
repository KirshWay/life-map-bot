import { ref, computed } from 'vue'
import { getWeeksLived, getCurrentWeekNumber, getTotalWeeks } from 'shared'
import { getMe } from '../services/api'
import type { UserData } from '../services/api'

export const useLifeMap = () => {
  const user = ref<UserData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalWeeks = getTotalWeeks()
  const totalYears = 80
  const weeksPerYear = 52

  const weeksLived = computed(() => (user.value ? getWeeksLived(user.value.birthDate) : 0))

  const currentWeek = computed(() => (user.value ? getCurrentWeekNumber(user.value.birthDate) : 0))

  const fetchUser = async (initDataRaw: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await getMe(initDataRaw)
      if (response.data) {
        user.value = response.data
      } else if (response.error) {
        error.value = response.error.message
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load user data'
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    totalWeeks,
    totalYears,
    weeksPerYear,
    weeksLived,
    currentWeek,
    fetchUser,
  }
}

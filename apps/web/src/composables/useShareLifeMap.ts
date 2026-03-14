import { ref, type Ref, type ComputedRef, unref } from 'vue'
import { renderLifeMapCanvas, type ThemeColors } from '../utils/renderLifeMapCanvas'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const getThemeColors = (): ThemeColors => {
  const style = getComputedStyle(document.documentElement)
  return {
    bgColor: style.getPropertyValue('--tg-theme-bg-color').trim() || '#1a1a2e',
    textColor: style.getPropertyValue('--tg-theme-text-color').trim() || '#f5f5f5',
    hintColor: style.getPropertyValue('--tg-theme-hint-color').trim() || '#6b7280',
    livedColor:
      style.getPropertyValue('--tg-theme-accent-text-color').trim() ||
      style.getPropertyValue('--tg-theme-button-color').trim() ||
      '#3b82f6',
    currentColor: style.getPropertyValue('--tg-theme-button-color').trim() || '#f97316',
    futureColor: style.getPropertyValue('--tg-theme-hint-color').trim() || '#4b5563',
  }
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create image'))
      }
    }, 'image/png')
  })

const uploadImage = async (blob: Blob, initDataRaw: string): Promise<void> => {
  const formData = new FormData()
  formData.append('image', new File([blob], 'life-map.png', { type: 'image/png' }))

  const res = await fetch(`${API_URL}/api/share/upload`, {
    method: 'POST',
    headers: { 'x-telegram-init-data': initDataRaw },
    body: formData,
  })

  const json = (await res.json()) as
    | { data: { sent: boolean }; error?: never }
    | { data?: never; error: { message: string } }

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Upload failed: ${res.status}`)
  }
}

export const useShareLifeMap = (options: {
  weeksLived: Ref<number> | ComputedRef<number>
  currentWeek: Ref<number> | ComputedRef<number>
  totalWeeks: number
  totalYears: number
  weeksPerYear: number
  firstName: Ref<string | null>
  initDataRaw: Ref<string | null>
}) => {
  const isSharing = ref(false)
  const shareError = ref<string | null>(null)
  const shareSuccess = ref(false)

  const share = async (): Promise<void> => {
    const initData = unref(options.initDataRaw)
    if (!initData) {
      shareError.value = 'Not authenticated'
      return
    }

    isSharing.value = true
    shareError.value = null
    shareSuccess.value = false

    try {
      const canvas = renderLifeMapCanvas({
        weeksLived: unref(options.weeksLived),
        currentWeek: unref(options.currentWeek),
        totalWeeks: options.totalWeeks,
        totalYears: options.totalYears,
        weeksPerYear: options.weeksPerYear,
        firstName: unref(options.firstName),
        theme: getThemeColors(),
      })

      const blob = await canvasToBlob(canvas)
      await uploadImage(blob, initData)

      shareSuccess.value = true
    } catch (e) {
      shareError.value = e instanceof Error ? e.message : 'Failed to share'
    } finally {
      isSharing.value = false
    }
  }

  return { isSharing, shareError, shareSuccess, share }
}

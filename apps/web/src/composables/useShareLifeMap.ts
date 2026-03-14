import { ref, type Ref, type ComputedRef, unref } from 'vue'
import { renderLifeMapCanvas, type ThemeColors } from '../utils/renderLifeMapCanvas'

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

const canUseWebShare = (blob: Blob): boolean => {
  if (!navigator.share || !navigator.canShare) return false
  const file = new File([blob], 'life-map.png', { type: 'image/png' })
  return navigator.canShare({ files: [file] })
}

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const useShareLifeMap = (options: {
  weeksLived: Ref<number> | ComputedRef<number>
  currentWeek: Ref<number> | ComputedRef<number>
  totalWeeks: number
  totalYears: number
  weeksPerYear: number
  firstName: Ref<string | null>
}) => {
  const isSharing = ref(false)
  const shareError = ref<string | null>(null)

  const share = async (): Promise<void> => {
    isSharing.value = true
    shareError.value = null

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

      if (canUseWebShare(blob)) {
        const file = new File([blob], 'life-map.png', { type: 'image/png' })
        await navigator.share({ files: [file] })
      } else {
        downloadBlob(blob, 'life-map.png')
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      shareError.value = e instanceof Error ? e.message : 'Failed to share'
    } finally {
      isSharing.value = false
    }
  }

  return { isSharing, shareError, share }
}

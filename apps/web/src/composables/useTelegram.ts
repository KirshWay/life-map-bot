import { ref } from 'vue'
import {
  init,
  retrieveLaunchParams,
  miniApp,
  themeParams,
  viewport,
  backButton,
} from '@telegram-apps/sdk'
import type { ConfigureOptions, RetrieveLPResultCamelCased } from '@telegram-apps/sdk'

type SdkLaunchParams = NonNullable<ConfigureOptions['launchParams']>

type ExtractedUserData = {
  userId: string
  firstName?: string
  initDataRaw: string
}

const extractFromUrl = (): ExtractedUserData | null => {
  try {
    const raw = window.location.hash.slice(1) || window.location.search.slice(1)

    if (!raw) return null

    const params = new URLSearchParams(raw)
    const initDataStr = params.get('tgWebAppData')
    if (!initDataStr) return null

    const initDataParams = new URLSearchParams(initDataStr)
    const userStr = initDataParams.get('user')

    if (!userStr) return null

    const user: unknown = JSON.parse(decodeURIComponent(userStr))

    if (typeof user !== 'object' || user === null) return null

    const id = (user as Record<string, unknown>).id

    if (id === undefined || id === null) return null

    return {
      userId: String(id),
      firstName: String((user as Record<string, unknown>).first_name || ''),
      initDataRaw: initDataStr,
    }
  } catch {
    return null
  }
}

const getMinimalLaunchParams = (): { tgWebAppPlatform: string; tgWebAppVersion: string } => {
  const raw = window.location.hash.slice(1) || window.location.search.slice(1)
  const params = raw ? new URLSearchParams(raw) : new URLSearchParams()

  return {
    tgWebAppPlatform: params.get('tgWebAppPlatform') || 'unknown',
    tgWebAppVersion: params.get('tgWebAppVersion') || '8.0',
  }
}

export const useTelegram = () => {
  const isReady = ref(false)
  const error = ref<string | null>(null)
  const userId = ref<string | null>(null)
  const firstName = ref<string | null>(null)
  const initDataRaw = ref<string | null>(null)

  const initialize = async () => {
    let launchParams: RetrieveLPResultCamelCased | null = null
    try {
      launchParams = retrieveLaunchParams(true)
    } catch {}

    const sdkParams = launchParams ?? getMinimalLaunchParams()

    try {
      init({ launchParams: sdkParams as SdkLaunchParams })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to initialize Telegram SDK'
      return
    }

    userId.value = launchParams?.tgWebAppData?.user?.id?.toString() ?? null
    firstName.value = launchParams?.tgWebAppData?.user?.firstName ?? null

    const extracted = extractFromUrl()
    if (!userId.value && extracted) {
      userId.value = extracted.userId
    }
    if (!firstName.value && extracted) {
      firstName.value = extracted.firstName ?? null
    }
    initDataRaw.value = extracted?.initDataRaw ?? null

    if (!userId.value) {
      error.value = 'Could not identify user. Please reopen the app from Telegram.'
      return
    }

    try {
      if (themeParams.mountSync.isAvailable()) themeParams.mountSync()
      if (themeParams.bindCssVars.isAvailable()) themeParams.bindCssVars()
      if (miniApp.mountSync.isAvailable()) miniApp.mountSync()
      if (miniApp.bindCssVars.isAvailable()) miniApp.bindCssVars()
    } catch {}

    try {
      if (viewport.mount.isAvailable()) await viewport.mount()
      if (viewport.expand.isAvailable()) viewport.expand()
      if (viewport.bindCssVars.isAvailable()) viewport.bindCssVars()
    } catch {}

    try {
      if (backButton.mount.isAvailable()) backButton.mount()
    } catch {}

    if (miniApp.ready.isAvailable()) {
      miniApp.ready()
    }

    isReady.value = true
  }

  return {
    isReady,
    error,
    userId,
    firstName,
    initDataRaw,
    initialize,
  }
}

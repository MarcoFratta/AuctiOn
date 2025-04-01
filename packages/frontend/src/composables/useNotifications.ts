import { toast, type ToastOptions } from 'vue3-toastify'
import { useSettingsStore } from '@/stores/settingsStore'

export function useNotifications() {
  const settingsStore = useSettingsStore()

  // Common toast options that match your app's style
  const getToastOptions = (): ToastOptions => {
    return {
      theme: settingsStore.darkMode ? 'dark' : 'light',
      style: {
        borderRadius: '0.5rem',
        fontWeight: '500',
      },
      progressStyle: {
        ...(settingsStore.darkMode
          ? { background: 'linear-gradient(to right, #9900ff, #6600ff)' }
          : { background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }),
      },
    }
  }

  function info(message: string) {
    toast.info(message, getToastOptions())
  }

  function success(message: string) {
    toast.success(message, getToastOptions())
  }

  function warning(message: string) {
    toast.warning(message, getToastOptions())
  }

  function error(message: string) {
    toast.error(message, getToastOptions())
  }

  return { info, success, warning, error }
}

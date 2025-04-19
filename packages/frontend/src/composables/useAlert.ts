import Swal from 'sweetalert2'
import { useSettingsStore } from '@/stores/settingsStore'

export function useAlert() {
  const settingsStore = useSettingsStore()

  // Custom styling based on app theme
  const getCustomStyling = () => {
    const isDark = settingsStore.darkMode

    return {
      background: isDark ? '#1e1e2d' : '#ffffff',
      color: isDark ? '#ffffff' : '#333333',
      confirmButtonColor: isDark ? '#8b5cf6' : '#8b5cf6', // violet-500
      cancelButtonColor: isDark ? '#4b5563' : '#6b7280', // gray-600/500
      iconColor: isDark ? '#d946ef' : '#8b5cf6', // fuchsia-500/violet-500
      showClass: {
        popup: 'swal2-show',
        backdrop: 'swal2-backdrop-show',
        icon: 'swal2-icon-show',
      },
      hideClass: {
        popup: 'swal2-hide',
        backdrop: 'swal2-backdrop-hide',
        icon: 'swal2-icon-hide',
      },
    }
  }

  const error = async (title: string, message: string) => {
    await Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      ...getCustomStyling(),
    })
  }

  const success = async (title: string, message: string) => {
    await Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      ...getCustomStyling(),
    })
  }

  const confirm = async (title: string, message: string, confirmText = 'Confirm') => {
    const styling = getCustomStyling()
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      ...styling,
      showCancelButton: true,
      confirmButtonText: confirmText,
    })

    return result.isConfirmed
  }

  return { error, success, confirm }
}

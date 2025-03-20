import { toast } from 'vue3-toastify'

export function useNotifications() {
  function info(message: string) {
    toast.info(message, {
      theme: 'auto',
    })
  }

  function success(message: string) {
    toast.success(message, {
      theme: 'auto',
    })
  }

  function warning(message: string) {
    toast.warning(message, {
      theme: 'auto',
    })
  }

  function error(message: string) {
    toast.error(message, {
      theme: 'auto',
    })
  }

  return { info, success, warning, error }
}

import Swal from 'sweetalert2'

export function useAlert() {
  const error = async (title: string, message: string) => {
    await Swal.fire({
      icon: 'error',
      title: title,
      text: message,
    })
  }
  const success = async (title: string, message: string) => {
    await Swal.fire({
      icon: 'success',
      title: title,
      text: message,
    })
  }
  return { error, success }
}

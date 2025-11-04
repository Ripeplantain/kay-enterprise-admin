import toast from "react-hot-toast"
import axios from "axios"

interface DRFFieldErrors {
  [field: string]: string[]
}

export function useApiError() {
  const handleError = (error: unknown, fallbackMessage = "An error occurred") => {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        const data = error.response.data

        // Handle DRF field validation errors
        if (typeof data === "object" && !Array.isArray(data)) {
          const errors = data as DRFFieldErrors
          const errorMessages = Object.entries(errors)
            .flatMap(([field, messages]) =>
              messages.map(msg => {
                // Format field name: plate_number -> Plate number
                const formattedField = field
                  .split("_")
                  .map((word, index) =>
                    index === 0
                      ? word.charAt(0).toUpperCase() + word.slice(1)
                      : word
                  )
                  .join(" ")
                return `${formattedField}: ${msg}`
              })
            )

          if (errorMessages.length > 0) {
            errorMessages.forEach(msg => toast.error(msg))
            return
          }
        }

        // Handle single error message or detail
        if (typeof data === "string") {
          toast.error(data)
          return
        }

        if (data.detail) {
          toast.error(data.detail)
          return
        }

        if (data.message) {
          toast.error(data.message)
          return
        }
      }

      // Handle network errors
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection.")
        return
      }

      // Handle timeout
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.")
        return
      }

      // Handle HTTP status codes
      if (error.response?.status) {
        const status = error.response.status
        switch (status) {
          case 400:
            toast.error("Bad request. Please check your input.")
            break
          case 401:
            toast.error("Unauthorized. Please log in again.")
            break
          case 403:
            toast.error("Forbidden. You don't have permission.")
            break
          case 404:
            toast.error("Resource not found.")
            break
          case 500:
            toast.error("Server error. Please try again later.")
            break
          default:
            toast.error(fallbackMessage)
        }
        return
      }
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
      toast.error(error.message)
      return
    }

    // Fallback
    toast.error(fallbackMessage)
  }

  return { handleError }
}

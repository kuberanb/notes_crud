export function getErrorMessage(error, fallback = "Something went wrong.") {
  if (typeof error?.data?.message === "string") {
    return error.data.message
  }

  if (error?.status === "FETCH_ERROR") {
    return "Cannot reach the server. Check your connection and try again."
  }

  if (error?.status === "TIMEOUT_ERROR") {
    return "The request timed out. Please try again."
  }

  return fallback
}
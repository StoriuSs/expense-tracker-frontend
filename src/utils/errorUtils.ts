export const getApiErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (!error.response?.data) {
    return error.message || defaultMessage
  }

  const responseData = error.response.data

  // Check for validation errors in data.details
  // Structure: { data: { details: [ { constraints: { rule: "message" } } ] } }
  if (responseData.data?.details && Array.isArray(responseData.data.details)) {
    const firstError = responseData.data.details[0]
    if (firstError?.constraints) {
      // Get the first constraint message
      const firstConstraintKey = Object.keys(firstError.constraints)[0]
      if (firstConstraintKey) {
        return firstError.constraints[firstConstraintKey]
      }
    }
  }

  // Fallback to meta message
  // Structure: { meta: { message: "..." } }
  if (responseData.meta?.message) {
    return responseData.meta.message
  }

  return defaultMessage
}

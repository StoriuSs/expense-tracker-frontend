export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  )
}

export const keysToSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToSnakeCase(item))
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = toSnakeCase(key)
    acc[snakeKey] = keysToSnakeCase(obj[key])
    return acc
  }, {} as any)
}

export const keysToCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => keysToCamelCase(item))
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = toCamelCase(key)
    acc[camelKey] = keysToCamelCase(obj[key])
    return acc
  }, {} as any)
}

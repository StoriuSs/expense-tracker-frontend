import { API_BASE_URL } from '../config/api'

/**
 * Resolves a static asset path to a full URL.
 * If the path is already a full URL, it returns it as is.
 * Otherwise, it prepends the backend origin derived from API_BASE_URL.
 */
export const getAssetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  
  // Get origin from API_BASE_URL (e.g., http://localhost:9000/api/v1 -> http://localhost:9000)
  try {
    const url = new URL(API_BASE_URL)
    // Remove leading slash from path if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${url.origin}/${cleanPath}`
  } catch (e) {
    // Fallback if API_BASE_URL is relative or invalid
    return path.startsWith('/') ? path : `/${path}`
  }
}

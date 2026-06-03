interface Entry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, Entry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.data as T
}

// Returns data even if expired — used as fallback when a live fetch fails.
export function cacheGetStale<T>(key: string): T | null {
  const entry = store.get(key)
  return entry ? (entry.data as T) : null
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

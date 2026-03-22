import crypto from 'crypto'

interface CachedEmbedding {
  hash: string
  embedding: number[]
  timestamp: number
}

// In-memory cache with 1-hour TTL
const embeddingCache = new Map<string, CachedEmbedding>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export function getEmbeddingHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export function getCachedEmbedding(text: string): number[] | null {
  const hash = getEmbeddingHash(text)
  const cached = embeddingCache.get(hash)

  if (!cached) return null

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    embeddingCache.delete(hash)
    return null
  }

  return cached.embedding
}

export function setCachedEmbedding(text: string, embedding: number[]): void {
  const hash = getEmbeddingHash(text)
  embeddingCache.set(hash, {
    hash,
    embedding,
    timestamp: Date.now(),
  })
}

export function clearCache(): void {
  embeddingCache.clear()
}

export function getCacheStats(): {
  size: number
  memoryUsage: string
} {
  return {
    size: embeddingCache.size,
    memoryUsage: `${(embeddingCache.size * 384 * 8) / 1024 / 1024}MB (estimated)`,
  }
}

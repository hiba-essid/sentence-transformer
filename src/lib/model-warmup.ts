import { pipeline } from '@xenova/transformers'

let modelPreloaded = false

export async function preloadModel() {
  if (modelPreloaded) return

  try {
    console.log('[Model Warmup] Starting model preload...')
    const start = Date.now()
    
    const extractor = await pipeline('feature-extraction', 'Xenova/multi-qa-MiniLM-L6-cos-v1')
    
    // Warm up with a dummy request
    await extractor('warmup', { pooling: 'mean', normalize: true })
    
    const duration = Date.now() - start
    console.log(`[Model Warmup] Model loaded successfully in ${duration}ms`)
    
    modelPreloaded = true
  } catch (error) {
    console.error('[Model Warmup] Failed to preload model:', error)
  }
}

export function isModelPreloaded(): boolean {
  return modelPreloaded
}

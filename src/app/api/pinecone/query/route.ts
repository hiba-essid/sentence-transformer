import { NextRequest, NextResponse } from 'next/server'
import { pipeline } from '@xenova/transformers'
import { queryEmbeddings } from '@/lib/pinecone'
import { preloadModel } from '@/lib/model-warmup'

let extractor: any = null

async function getExtractor() {
  if (!extractor) {
    console.log('[Query] Initializing model...')
    const start = Date.now()
    extractor = await pipeline('feature-extraction', 'Xenova/multi-qa-MiniLM-L6-cos-v1')
    console.log(`[Query] Model initialized in ${Date.now() - start}ms`)
  }
  return extractor
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, topK = 10 } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query string is required and must not be empty' },
        { status: 400 }
      )
    }

    // Preload model if needed
    await preloadModel()

    // Generate embedding for query server-side
    const extractor_instance = await getExtractor()
    
    console.log('[Query] Generating query embedding...')
    const start = Date.now()
    const queryEmbedding = await extractor_instance(query, {
      pooling: 'mean',
      normalize: true,
    })
    console.log(`[Query] Generated in ${Date.now() - start}ms`)

    const queryVector = Array.from(queryEmbedding.data)

    // Query Pinecone for similar vectors
    const results = await queryEmbeddings(queryVector, topK)

    return NextResponse.json({
      success: true,
      query,
      results: results.matches.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text || '',
        metadata: match.metadata,
      })),
    })
  } catch (error) {
    console.error('Error in /api/pinecone/query:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

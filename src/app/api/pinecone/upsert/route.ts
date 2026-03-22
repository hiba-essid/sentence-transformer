import { NextRequest, NextResponse } from 'next/server'
import { pipeline } from '@xenova/transformers'
import { upsertEmbeddings } from '@/lib/pinecone'
import { preloadModel } from '@/lib/model-warmup'

let extractor: any = null

async function getExtractor() {
  if (!extractor) {
    console.log('[Embeddings] Initializing model...')
    const start = Date.now()
    extractor = await pipeline('feature-extraction', 'Xenova/multi-qa-MiniLM-L6-cos-v1')
    console.log(`[Embeddings] Model initialized in ${Date.now() - start}ms`)
  }
  return extractor
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { texts, metadata = {} } = body

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'texts array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Preload model if needed
    await preloadModel()

    // Generate embeddings server-side using Xenova
    const extractor_instance = await getExtractor()
    
    console.log(`[Embeddings] Generating ${texts.length} embeddings...`)
    const start = Date.now()
    const embeddings = await extractor_instance(texts, {
      pooling: 'mean',
      normalize: true,
    })
    console.log(`[Embeddings] Generated in ${Date.now() - start}ms`)

    // Prepare vectors for Pinecone
    const vectors = texts.map((text: string, index: number) => {
      const embedding = Array.from(embeddings.data[index])
      
      return {
        id: `${Date.now()}-${index}`,
        values: embedding,
        metadata: {
          text,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }
    })

    // Upsert to Pinecone
    await upsertEmbeddings(vectors)

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${vectors.length} embeddings in Pinecone`,
      vectorIds: vectors.map(v => v.id),
      embeddings: vectors.map(v => ({
        id: v.id,
        dimensions: v.values.length,
        text: v.metadata.text,
      })),
    })
  } catch (error) {
    console.error('Error in /api/pinecone/upsert:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

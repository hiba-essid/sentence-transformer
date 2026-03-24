'use server'

import { Pinecone } from '@pinecone-database/pinecone'

let pineconeClient: Pinecone | null = null

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY
    
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_PINECONE_API_KEY is not defined in environment variables')
    }

    pineconeClient = new Pinecone({
      apiKey,
    })
  }

  return pineconeClient
}

export async function getIndexStats() {
  const client = getPineconeClient()
  const indexName = process.env.NEXT_PUBLIC_PINECONE_INDEX

  if (!indexName) {
    throw new Error('NEXT_PUBLIC_PINECONE_INDEX is not defined')
  }

  try {
    const index = client.Index(indexName)
    const stats = await index.describeIndexStats()
    return stats
  } catch (error) {
    console.error('Error fetching index stats:', error)
    throw error
  }
}

export async function upsertEmbeddings(
  vectors: Array<{
    id: string
    values: number[]
    metadata?: Record<string, unknown>
  }>
) {
  const client = getPineconeClient()
  const indexName = process.env.NEXT_PUBLIC_PINECONE_INDEX

  if (!indexName) {
    throw new Error('NEXT_PUBLIC_PINECONE_INDEX is not defined')
  }

  try {
    const index = client.Index(indexName)
    const response = await index.upsert(vectors)
    return response
  } catch (error) {
    console.error('Error upserting embeddings:', error)
    throw error
  }
}

export async function queryEmbeddings(
  queryVector: number[],
  topK: number = 10,
  filter?: Record<string, unknown>
) {
  const client = getPineconeClient()
  const indexName = process.env.NEXT_PUBLIC_PINECONE_INDEX

  if (!indexName) {
    throw new Error('NEXT_PUBLIC_PINECONE_INDEX is not defined')
  }

  try {
    const index = client.Index(indexName)
    const results = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter,
    })
    return results
  } catch (error) {
    console.error('Error querying embeddings:', error)
    throw error
  }
}

export async function deleteEmbeddings(ids: string[]) {
  const client = getPineconeClient()
  const indexName = process.env.NEXT_PUBLIC_PINECONE_INDEX

  if (!indexName) {
    throw new Error('NEXT_PUBLIC_PINECONE_INDEX is not defined')
  }

  try {
    const index = client.Index(indexName)
    const response = await index.deleteMany(ids)
    return response
  } catch (error) {
    console.error('Error deleting embeddings:', error)
    throw error
  }
}

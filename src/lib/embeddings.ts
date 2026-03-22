'use client'; // Mark this file as client-only

import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js to use local cache
env.allowLocalModels = false;
env.useBrowserCache = false;

// Model options
export type ModelType = 'all-MiniLM-L6-v2' | 'multi-qa-MiniLM-L6-cos-v1' | 'all-mpnet-base-v2';

const MODEL_MAP: Record<ModelType, string> = {
  'all-MiniLM-L6-v2': 'Xenova/all-MiniLM-L6-v2',
  'multi-qa-MiniLM-L6-cos-v1': 'Xenova/multi-qa-MiniLM-L6-cos-v1',
  'all-mpnet-base-v2': 'Xenova/all-mpnet-base-v2',
};

// Singleton pattern for the pipeline
let extractor: Awaited<ReturnType<typeof pipeline>> | null = null;
let currentModel: ModelType | null = null;
let loadingPromise: Promise<Awaited<ReturnType<typeof pipeline>>> | null = null;

export interface ModelInfo {
  name: string;
  dimensions: number;
  speed: string;
  quality: string;
  description: string;
}

export const MODEL_INFO: Record<ModelType, ModelInfo> = {
  'all-MiniLM-L6-v2': {
    name: 'all-MiniLM-L6-v2',
    dimensions: 384,
    speed: 'Fast',
    quality: 'Good',
    description: 'Fast and lightweight, great for real-time applications',
  },
  'multi-qa-MiniLM-L6-cos-v1': {
    name: 'multi-qa-MiniLM-L6-cos-v1',
    dimensions: 384,
    speed: 'Fast',
    quality: 'Good',
    description: 'Optimized for question-answering and semantic search',
  },
  'all-mpnet-base-v2': {
    name: 'all-mpnet-base-v2',
    dimensions: 768,
    speed: 'Medium',
    quality: 'Best',
    description: 'Higher quality embeddings, better semantic understanding',
  },
};

/**
 * Initialize the embedding model
 */
export async function initializeModel(modelType: ModelType = 'all-MiniLM-L6-v2'): Promise<void> {
  if (extractor && currentModel === modelType) {
    return; // Already loaded
  }

  // If loading is in progress, wait for it
  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  const modelId = MODEL_MAP[modelType];
  console.log(`Loading model: ${modelId}...`);

  loadingPromise = pipeline('feature-extraction', modelId, {
    quantized: true, // Use quantized model for faster loading and inference
  });

  try {
    extractor = await loadingPromise;
    currentModel = modelType;
    console.log(`Model ${modelId} loaded successfully!`);
  } finally {
    loadingPromise = null;
  }
}

/**
 * Generate embeddings for a single text or array of texts
 */
export async function generateEmbeddings(texts: string | string[]): Promise<number[][]> {
  if (!extractor) {
    await initializeModel();
  }

  const textArray = Array.isArray(texts) ? texts : [texts];
  
  const outputs = await extractor!(textArray, { 
    pooling: 'mean', 
    normalize: true 
  });

  // Convert tensor to array of number arrays
  const embeddings: number[][] = [];
  for (let i = 0; i < outputs.dims[0]; i++) {
    const start = i * outputs.dims[1];
    const end = start + outputs.dims[1];
    embeddings.push(Array.from(outputs.data.slice(start, end)) as number[]);
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Perform semantic search against a corpus
 */
export interface SearchResult {
  text: string;
  score: number;
  index: number;
}

export async function semanticSearch(
  query: string,
  corpus: string[]
): Promise<SearchResult[]> {
  // Generate embeddings for query and corpus
  const queryEmbedding = (await generateEmbeddings(query))[0];
  const corpusEmbeddings = await generateEmbeddings(corpus);

  // Calculate similarities
  const results: SearchResult[] = corpus.map((text, index) => ({
    text,
    score: cosineSimilarity(queryEmbedding, corpusEmbeddings[index]),
    index,
  }));

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get current model info
 */
export function getCurrentModel(): ModelType | null {
  return currentModel;
}

/**
 * Check if model is loaded
 */
export function isModelLoaded(): boolean {
  return extractor !== null;
}

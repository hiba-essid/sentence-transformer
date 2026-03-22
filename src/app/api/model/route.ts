import { NextResponse } from 'next/server';

// Model info (kept in sync with client)
const MODEL_INFO = {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model } = body;

    if (!model || !MODEL_INFO[model as keyof typeof MODEL_INFO]) {
      return NextResponse.json(
        { error: 'Invalid model. Available models: ' + Object.keys(MODEL_INFO).join(', ') },
        { status: 400 }
      );
    }

    // Model loading happens client-side, server just confirms availability
    return NextResponse.json({
      success: true,
      message: `Model ${model} is available`,
      model: model,
      info: MODEL_INFO[model as keyof typeof MODEL_INFO],
    });
  } catch (error) {
    console.error('Error processing model request:', error);
    return NextResponse.json(
      { error: 'Failed to process model request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    availableModels: MODEL_INFO,
    note: 'Model loading happens client-side using Transformers.js',
  });
}

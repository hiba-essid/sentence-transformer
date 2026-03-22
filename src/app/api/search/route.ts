import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, corpus } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!corpus || !Array.isArray(corpus) || corpus.length === 0) {
      return NextResponse.json(
        { error: 'Corpus must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Semantic search must be done client-side',
        message: 'Use the Xenova/Transformers.js library in the browser for real-time semantic search',
        note: 'This is by design - all ML operations run locally in your browser for privacy'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in search route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

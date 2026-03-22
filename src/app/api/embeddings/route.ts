import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts } = body;

    if (!texts) {
      return NextResponse.json(
        { error: 'Texts are required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Embeddings generation must be done client-side',
        message: 'Use the Xenova/Transformers.js library in the browser for real-time embeddings',
        note: 'This is by design - all ML operations run locally in your browser for privacy'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in embeddings route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

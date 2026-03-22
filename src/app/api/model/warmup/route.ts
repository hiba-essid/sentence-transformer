import { NextRequest, NextResponse } from 'next/server'
import { preloadModel, isModelPreloaded } from '@/lib/model-warmup'

export async function GET(request: NextRequest) {
  try {
    if (isModelPreloaded()) {
      return NextResponse.json({
        status: 'ready',
        message: 'Model is already preloaded',
      })
    }

    await preloadModel()

    return NextResponse.json({
      status: 'success',
      message: 'Model preloaded successfully',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: String(error),
      },
      { status: 500 }
    )
  }
}

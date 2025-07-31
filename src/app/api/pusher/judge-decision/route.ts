import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent } from '../../../../../lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, correct, correctSpelling } = await request.json();

    if (!roomCode || typeof correct !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await triggerEvent(roomCode, 'judge-decision', { 
      correct, 
      correctSpelling 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering judge-decision event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}

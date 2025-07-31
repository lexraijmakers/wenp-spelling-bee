import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent } from '../../../../../lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { roomCode } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Missing roomCode' },
        { status: 400 }
      );
    }

    await triggerEvent(roomCode, 'timer-reset', {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering timer-reset event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}

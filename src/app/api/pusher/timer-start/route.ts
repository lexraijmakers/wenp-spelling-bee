import { NextRequest, NextResponse } from 'next/server';
import { triggerEvent } from '../../../../../lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, duration } = await request.json();

    if (!roomCode || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await triggerEvent(roomCode, 'timer-start', { duration });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering timer-start event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}

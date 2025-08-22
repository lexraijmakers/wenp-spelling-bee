import { triggerEvent } from '@/lib/pusher'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { roomCode, correct, word } = await request.json()

        if (!roomCode || typeof correct !== 'boolean') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Trigger judge decision event
        await triggerEvent(roomCode, 'judge-decision', {
            correct,
            word
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error triggering judge-decision event:', error)
        return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 })
    }
}

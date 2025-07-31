import { NextRequest, NextResponse } from 'next/server'
import { triggerEvent } from '../../../../../lib/pusher'

export async function POST(request: NextRequest) {
    try {
        const { roomCode, word, typedSpelling } = await request.json()

        if (!roomCode || !word || typedSpelling === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        await triggerEvent(roomCode, 'word-revealed', {
            word,
            typedSpelling
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error triggering word-revealed event:', error)
        return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 })
    }
}

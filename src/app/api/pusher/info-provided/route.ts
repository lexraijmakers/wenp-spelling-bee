import { NextRequest, NextResponse } from 'next/server'
import { triggerEvent } from '../../../../../lib/pusher'

export async function POST(request: NextRequest) {
    try {
        const { roomCode, type, content } = await request.json()

        if (!roomCode || !type || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        await triggerEvent(roomCode, 'info-provided', { type, content })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error triggering info-provided event:', error)
        return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 })
    }
}

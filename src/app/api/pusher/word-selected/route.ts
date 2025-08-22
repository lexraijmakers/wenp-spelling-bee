import { triggerEvent } from '@/lib/pusher'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { roomCode, word, availableInfo } = await request.json()

        if (!roomCode || !word || !availableInfo) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        await triggerEvent(roomCode, 'word-selected', {
            word,
            availableInfo
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error triggering word-selected event:', error)
        return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 })
    }
}

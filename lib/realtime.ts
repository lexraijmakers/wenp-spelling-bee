'use client'

import { getChannelName, pusherClient, SpellingBeeEvents } from './pusher'

// Helper function to send events via API
const sendEvent = async (endpoint: string, data: Record<string, unknown>) => {
    try {
        const response = await fetch(`/api/pusher/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(`Failed to send event: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error(`Error sending ${endpoint} event:`, error)
        throw error
    }
}

// Real-time communication class
export class SpellingBeeRealtime {
    private channel: ReturnType<typeof pusherClient.subscribe> | null = null
    private roomCode: string

    constructor(roomCode: string) {
        this.roomCode = roomCode
    }

    // Subscribe to room events
    subscribe() {
        const channelName = getChannelName(this.roomCode)
        this.channel = pusherClient.subscribe(channelName)
        return this.channel
    }

    // Unsubscribe from room events
    unsubscribe() {
        if (this.channel) {
            pusherClient.unsubscribe(this.channel.name)
            this.channel = null
        }
    }

    // Listen to specific events
    on<T extends keyof SpellingBeeEvents>(
        event: T,
        callback: (data: SpellingBeeEvents[T]) => void
    ) {
        if (this.channel) {
            this.channel.bind(event, callback)
        }
    }

    // Remove event listeners
    off<T extends keyof SpellingBeeEvents>(
        event: T,
        callback?: (data: SpellingBeeEvents[T]) => void
    ) {
        if (this.channel) {
            this.channel.unbind(event, callback)
        }
    }

    // Send events (these will trigger API calls)
    async selectWord(word: string, availableInfo: string[]) {
        return sendEvent('word-selected', {
            roomCode: this.roomCode,
            word,
            availableInfo
        })
    }

    async startTimer(duration: number) {
        return sendEvent('timer-start', {
            roomCode: this.roomCode,
            duration
        })
    }

    async resetTimer() {
        return sendEvent('timer-reset', {
            roomCode: this.roomCode
        })
    }

    async provideInfo(type: string, content: string) {
        return sendEvent('info-provided', {
            roomCode: this.roomCode,
            type,
            content
        })
    }

    async judgeDecision(correct: boolean, correctSpelling?: string, typedSpelling?: string) {
        return sendEvent('judge-decision', {
            roomCode: this.roomCode,
            correct,
            correctSpelling,
            typedSpelling
        })
    }

    async revealWord(word: string, typedSpelling: string) {
        return sendEvent('word-revealed', {
            roomCode: this.roomCode,
            word,
            typedSpelling
        })
    }
}

// Hook for using real-time communication
export const useSpellingBeeRealtime = (roomCode: string) => {
    return new SpellingBeeRealtime(roomCode)
}

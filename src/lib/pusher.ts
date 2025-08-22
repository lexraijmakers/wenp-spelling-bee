import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true
})

// Client-side Pusher instance
export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true
})

// Event types for type safety
export interface SpellingBeeEvents {
    'word-selected': {
        word: string
        availableInfo: string[]
    }
    'timer-start': {
        duration: number
    }
    'timer-reset': Record<string, never>
    'judge-decision': {
        correct: boolean
        word: string
    }
}

// Helper function to get channel name for a room
export const getChannelName = (roomCode: string) => `spelling-bee-${roomCode}`

// Helper function to trigger events
export const triggerEvent = async <T extends keyof SpellingBeeEvents>(
    roomCode: string,
    event: T,
    data: SpellingBeeEvents[T]
) => {
    const channelName = getChannelName(roomCode)
    await pusherServer.trigger(channelName, event, data)
}

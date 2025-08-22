'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateRoomCode } from '@/lib/words'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
    const [roomCode, setRoomCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const createSession = () => {
        setIsCreating(true)
        const newRoomCode = generateRoomCode()
        router.push(`/judge?room=${newRoomCode}`)
    }

    const joinSession = () => {
        if (roomCode.length === 4) {
            router.push(`/display?room=${roomCode}`)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold">
                            Wauw & Pittigman Spelling Bee
                        </CardTitle>
                        <p className="text-center text-muted-foreground">
                            Create a session as judge or join as display
                        </p>
                    </CardHeader>
                </Card>

                {/* Create Session */}
                <Card>
                    <CardHeader>
                        <CardTitle>Judge Interface</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Create a new spelling bee session and control the game
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={createSession}
                            disabled={isCreating}
                            className="w-full"
                            size="lg"
                        >
                            {isCreating ? 'Creating Session...' : 'Create New Session'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Join Session */}
                <Card>
                    <CardHeader>
                        <CardTitle>Display Interface</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Connect to an existing session to show the spelling bee display
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomCode">Room Code</Label>
                            <Input
                                id="roomCode"
                                type="text"
                                placeholder="Enter 4-digit room code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.slice(0, 4))}
                                className="text-center text-xl font-mono"
                                maxLength={4}
                            />
                        </div>
                        <Button
                            onClick={joinSession}
                            disabled={roomCode.length !== 4}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                        >
                            Join as Display
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/words')}
                                className="flex-1"
                            >
                                Manage Words
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { generateRoomCode } from '../../lib/words'

export default function Home() {
    const [roomCode, setRoomCode] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const createSession = () => {
        setIsCreating(true)
        const newRoomCode = generateRoomCode()
        setRoomCode(newRoomCode)

        // Navigate to judge interface with room code
        setTimeout(() => {
            router.push(`/judge?room=${newRoomCode}`)
        }, 1000)
    }

    const joinSession = () => {
        if (roomCode.length === 4) {
            router.push(`/display?room=${roomCode}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Wauw & Pittigman Spelling Bee
                    </h1>
                </div>

                <div className="space-y-6">
                    {/* Create Session */}
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            Judge Interface
                        </h2>
                        <button
                            onClick={createSession}
                            disabled={isCreating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            {isCreating ? 'Creating Session...' : 'Create New Session'}
                        </button>
                        {isCreating && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-800 font-medium">
                                    Room Code:{' '}
                                    <span className="text-2xl font-mono">{roomCode}</span>
                                </p>
                                <p className="text-blue-600 text-sm mt-1">
                                    Redirecting to judge interface...
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200"></div>

                    {/* Join Session */}
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            Display Interface
                        </h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Enter 4-digit room code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.slice(0, 4))}
                                className="w-full text-center text-2xl font-mono py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                maxLength={4}
                            />
                            <button
                                onClick={joinSession}
                                disabled={roomCode.length !== 4}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Join as Display
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

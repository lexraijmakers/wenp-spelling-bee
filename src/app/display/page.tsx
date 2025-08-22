'use client'

import { useSpellingBeeRealtime } from 'lib/realtime'
import { DEFAULT_TIMER_CONFIG, getTimerPhase } from 'lib/timer-config'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

interface TimerState {
    timeLeft: number
    phase: 'green' | 'yellow' | 'red'
    isActive: boolean
}

function DisplayPageContent() {
    const searchParams = useSearchParams()
    const roomCode = searchParams.get('room')
    const [isConnected] = useState(true)
    const realtime = useSpellingBeeRealtime(roomCode || '')
    const [currentWord, setCurrentWord] = useState('')
    const [availableInfo, setAvailableInfo] = useState<string[]>([])
    const [status, setStatus] = useState('Wachten op woord...')
    const [result, setResult] = useState<{
        correct: boolean
        correctSpelling?: string
    } | null>(null)
    const [revealedWord, setRevealedWord] = useState<{
        word: string
    } | null>(null)
    const [timer, setTimer] = useState<TimerState>({
        timeLeft: DEFAULT_TIMER_CONFIG.totalTime,
        phase: 'green',
        isActive: false
    })

    useEffect(() => {
        if (!roomCode || !realtime) return

        // Subscribe to Pusher events
        realtime.subscribe()

        // Set up event listeners
        realtime.on('word-selected', (data: { word: string; availableInfo: string[] }) => {
            setCurrentWord(data.word)
            setAvailableInfo(data.availableInfo)
            setStatus('Woord geselecteerd - Klaar om te beginnen')
            setResult(null)
            setRevealedWord(null)
            setTimer((prev) => ({
                ...prev,
                timeLeft: DEFAULT_TIMER_CONFIG.totalTime,
                phase: 'green',
                isActive: false
            }))
        })

        realtime.on('timer-start', (data: { duration: number }) => {
            setStatus('Spellen bezig...')
            setTimer((prev) => ({ ...prev, timeLeft: data.duration, isActive: true }))
        })

        realtime.on('timer-reset', () => {
            setTimer((prev) => ({
                ...prev,
                timeLeft: DEFAULT_TIMER_CONFIG.totalTime,
                phase: 'green',
                isActive: false
            }))
            setStatus('Timer gereset - Klaar om te beginnen')
        })

        realtime.on('judge-decision', (data: { correct: boolean; word: string }) => {
            setResult(data)
            setTimer((prev) => ({ ...prev, isActive: false }))
            setStatus(data.correct ? 'Correct!' : 'Incorrect')
            setRevealedWord(data)
        })

        return () => {
            realtime.unsubscribe()
        }
    }, [roomCode, realtime])

    // Timer countdown effect
    useEffect(() => {
        if (!timer.isActive) return

        const interval = setInterval(() => {
            setTimer((prev) => {
                const newTimeLeft = prev.timeLeft - 1

                if (newTimeLeft <= 0) {
                    setStatus('Tijd verstreken!')
                    return { ...prev, timeLeft: 0, isActive: false }
                }

                const newPhase = getTimerPhase(newTimeLeft)

                return { ...prev, timeLeft: newTimeLeft, phase: newPhase }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timer.isActive])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getInfoLabel = (type: string) => {
        switch (type) {
            case 'definition':
                return 'Definitie'
            case 'sentence':
                return 'Zin'
            default:
                return type
        }
    }

    if (!roomCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Geen Kamercode</h1>
                    <p className="text-xl text-gray-600">Maak eerst een sessie aan.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto p-8 h-screen flex flex-col">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Wauw & Pittigman Spelling Bee
                    </h1>

                    <div className="flex justify-center items-center space-x-6 text-xl">
                        <span>
                            Kamer: <span className="font-mono text-yellow-400">{roomCode}</span>
                        </span>

                        <div
                            className={`w-4 h-4 rounded-full ${
                                isConnected ? 'bg-green-400' : 'bg-red-400'
                            }`}
                        />

                        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                            {isConnected ? 'Verbonden' : 'Niet verbonden'}
                        </span>
                    </div>
                </div>

                {/* Giant Timer Clock with Available Info */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-12">
                        {/* Timer Clock */}
                        <div className="relative">
                            {/* Clock Circle */}
                            <div
                                className={`w-96 h-96 rounded-full border-8 flex items-center justify-center relative ${
                                    timer.phase === 'green'
                                        ? 'border-green-400 bg-green-400/10'
                                        : timer.phase === 'yellow'
                                        ? 'border-yellow-400 bg-yellow-400/10'
                                        : 'border-red-400 bg-red-400/10'
                                } transition-all duration-1000`}
                            >
                                {/* Timer Display */}
                                <div className="text-center">
                                    <div
                                        className={`text-8xl font-mono font-bold mb-4 ${
                                            timer.phase === 'green'
                                                ? 'text-green-400'
                                                : timer.phase === 'yellow'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }`}
                                    >
                                        {formatTime(timer.timeLeft)}
                                    </div>
                                </div>

                                {/* Progress Ring */}
                                <svg
                                    className="absolute inset-0 w-full h-full -rotate-90"
                                    viewBox="0 0 100 100"
                                >
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-white/20"
                                    />

                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        className={
                                            timer.phase === 'green'
                                                ? 'text-green-400'
                                                : timer.phase === 'yellow'
                                                ? 'text-yellow-400'
                                                : 'text-red-400'
                                        }
                                        strokeDasharray={`${
                                            (timer.timeLeft / DEFAULT_TIMER_CONFIG.totalTime) * 283
                                        } 283`}
                                        style={{
                                            transition: 'stroke-dasharray 1s ease-in-out'
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Available Information */}
                        {availableInfo.length > 0 && !revealedWord && !result && (
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 max-w-xs">
                                <h3 className="text-lg font-bold mb-3 text-center text-yellow-300">
                                    Beschikbare Informatie
                                </h3>

                                <div className="space-y-2">
                                    {availableInfo.map((info) => (
                                        <div
                                            key={info}
                                            className="bg-white/20 rounded-lg p-2 text-center"
                                        >
                                            <div className="text-sm font-medium">
                                                {getInfoLabel(info)}
                                            </div>

                                            <div className="text-green-300 text-xs">
                                                ✓ Beschikbaar
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-center mt-3 text-sm text-blue-200">
                                    Vraag aan de jury
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="text-center mb-8">
                    <div className="text-4xl font-semibold mb-4">{status}</div>
                    {currentWord && !revealedWord && (
                        <div className="text-2xl text-blue-200">
                            Huidig woord klaar voor spellen
                        </div>
                    )}
                </div>

                {/* Word Revealed with Result */}
                {revealedWord && result && (
                    <div
                        className={`${
                            result.correct
                                ? 'bg-green-500/20 border-green-400'
                                : 'bg-red-500/20 border-red-400'
                        } border-2 rounded-3xl p-8 mb-8 backdrop-blur`}
                    >
                        <div className="text-center">
                            <div
                                className={`text-6xl font-bold mb-6 ${
                                    result.correct ? 'text-green-300' : 'text-red-300'
                                }`}
                            >
                                {result.correct ? '✓ CORRECT!' : '✗ INCORRECT'}
                            </div>

                            <h2 className="text-3xl font-bold mb-4 text-yellow-300">
                                Het woord was:
                            </h2>

                            <div
                                className={`text-6xl font-mono font-bold text-white rounded-lg p-6 ${
                                    result.correct ? 'bg-green-600/30' : 'bg-red-600/30'
                                }`}
                            >
                                {revealedWord.word}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function DisplayPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Display interface laden...</p>
                    </div>
                </div>
            }
        >
            <DisplayPageContent />
        </Suspense>
    )
}

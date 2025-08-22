'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

    const getTimerColor = (phase: string) => {
        switch (phase) {
            case 'green':
                return 'text-green-500'
            case 'yellow':
                return 'text-yellow-500'
            case 'red':
                return 'text-red-500'
            default:
                return 'text-gray-500'
        }
    }

    const getTimerBorderColor = (phase: string) => {
        switch (phase) {
            case 'green':
                return 'border-green-500'
            case 'yellow':
                return 'border-yellow-500'
            case 'red':
                return 'border-red-500'
            default:
                return 'border-gray-500'
        }
    }

    if (!roomCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-center text-destructive">
                            Geen Kamercode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            Maak eerst een sessie aan.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-3xl font-bold">
                            Wauw & Pittigman Spelling Bee
                        </CardTitle>
                        <div className="flex justify-center items-center gap-4 text-sm">
                            <span>
                                Kamer: <Badge variant="outline">{roomCode}</Badge>
                            </span>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        isConnected ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                />
                                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                                    {isConnected ? 'Verbonden' : 'Niet verbonden'}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timer Section */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-center">Timer</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center p-12">
                                <div className="relative">
                                    {/* Timer Circle */}
                                    <div
                                        className={`w-64 h-64 rounded-full border-8 flex items-center justify-center ${getTimerBorderColor(
                                            timer.phase
                                        )} transition-all duration-1000`}
                                    >
                                        <div className="text-center">
                                            <div
                                                className={`text-6xl font-mono font-bold ${getTimerColor(
                                                    timer.phase
                                                )}`}
                                            >
                                                {formatTime(timer.timeLeft)}
                                            </div>
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
                                            className="text-muted"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            className={getTimerColor(timer.phase)}
                                            strokeDasharray={`${
                                                (timer.timeLeft / DEFAULT_TIMER_CONFIG.totalTime) *
                                                283
                                            } 283`}
                                            style={{
                                                transition: 'stroke-dasharray 1s ease-in-out'
                                            }}
                                        />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Information Panel */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-lg font-semibold">{status}</p>
                                {currentWord && !revealedWord && (
                                    <p className="text-center text-sm text-muted-foreground mt-2">
                                        Woord klaar voor spellen
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Available Information */}
                        {availableInfo.length > 0 && !revealedWord && !result && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        Beschikbare Informatie
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {availableInfo.map((info) => (
                                            <div key={info} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="text-sm">
                                                    {getInfoLabel(info)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4 text-center">
                                        Vraag aan de jury
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Word Revealed with Result */}
                {revealedWord && result && (
                    <Card
                        className={`border-2 ${
                            result.correct
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : 'border-red-500 bg-red-50 dark:bg-red-950'
                        }`}
                    >
                        <CardHeader>
                            <CardTitle className="text-center">
                                <div
                                    className={`text-4xl font-bold mb-4 ${
                                        result.correct ? 'text-green-600' : 'text-red-600'
                                    }`}
                                >
                                    {result.correct ? '✓ CORRECT!' : '✗ INCORRECT'}
                                </div>
                                <p className="text-xl font-semibold">Het woord was:</p>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div
                                    className={`text-5xl font-mono font-bold p-6 rounded-lg ${
                                        result.correct
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                    }`}
                                >
                                    {revealedWord.word}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                    <Card className="w-[300px]">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Display interface laden...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
        >
            <DisplayPageContent />
        </Suspense>
    )
}

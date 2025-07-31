'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useSpellingBeeRealtime } from '../../../lib/realtime'
import { DEFAULT_TIMER_CONFIG, getTimerPhase } from '../../../lib/timer-config'

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
    const [providedInfo, setProvidedInfo] = useState<{ type: string; content: string } | null>(null)
    const [result, setResult] = useState<{
        correct: boolean
        correctSpelling?: string
        typedSpelling?: string
    } | null>(null)
    const [revealedWord, setRevealedWord] = useState<{
        word: string
        typedSpelling: string
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
            setProvidedInfo(null)
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

        realtime.on('info-provided', (data: { type: string; content: string }) => {
            setProvidedInfo(data)
            setTimeout(() => setProvidedInfo(null), 5000) // Clear after 5 seconds
        })

        realtime.on(
            'judge-decision',
            (data: { correct: boolean; correctSpelling?: string; typedSpelling?: string }) => {
                setResult(data)
                setTimer((prev) => ({ ...prev, isActive: false }))
                setStatus(data.correct ? 'Correct!' : 'Incorrect')
            }
        )

        realtime.on('word-revealed', (data: { word: string; typedSpelling: string }) => {
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
                        ></div>
                        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                            {isConnected ? 'Verbonden' : 'Niet verbonden'}
                        </span>
                    </div>
                </div>

                {/* Giant Timer Clock */}
                <div className="flex-1 flex items-center justify-center">
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

                {/* Revealed Word */}
                {revealedWord && (
                    <div className="bg-white/20 backdrop-blur rounded-3xl p-8 mb-8 border-2 border-white/30">
                        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-300">
                            Woord Onthuld
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-4 text-green-300">
                                    Correct woord:
                                </h3>
                                <div className="text-4xl font-mono font-bold text-white bg-green-600/30 rounded-lg p-4">
                                    {revealedWord.word}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold mb-4 text-blue-300">
                                    Getypte spelling:
                                </h3>
                                <div className="text-4xl font-mono font-bold text-white bg-blue-600/30 rounded-lg p-4">
                                    {revealedWord.typedSpelling || '(geen spelling getypt)'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Available Information */}
                {availableInfo.length > 0 && !revealedWord && (
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Beschikbare Informatie
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {availableInfo.map((info) => (
                                <div key={info} className="bg-white/20 rounded-lg p-3 text-center">
                                    <div className="text-lg font-medium">{getInfoLabel(info)}</div>
                                    <div className="text-green-300 text-sm">✓ Beschikbaar</div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-4 text-lg text-blue-200">
                            Je kunt om bovenstaande informatie vragen aan de jury
                        </div>
                    </div>
                )}

                {/* Provided Information */}
                {providedInfo && (
                    <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
                        <h3 className="text-2xl font-bold mb-2 text-yellow-300">
                            {getInfoLabel(providedInfo.type)} Gegeven:
                        </h3>
                        <div className="text-xl">{providedInfo.content}</div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div
                        className={`${
                            result.correct
                                ? 'bg-green-500/20 border-green-400'
                                : 'bg-red-500/20 border-red-400'
                        } border-2 rounded-2xl p-8 mb-8`}
                    >
                        <div className="text-center">
                            <div
                                className={`text-6xl font-bold mb-4 ${
                                    result.correct ? 'text-green-300' : 'text-red-300'
                                }`}
                            >
                                {result.correct ? '✓ CORRECT!' : '✗ INCORRECT'}
                            </div>
                            {!result.correct && result.correctSpelling && (
                                <div className="text-2xl text-red-200">
                                    Correcte spelling:{' '}
                                    <span className="font-mono font-bold">
                                        {result.correctSpelling}
                                    </span>
                                </div>
                            )}
                            {result.typedSpelling && (
                                <div className="text-xl text-blue-200 mt-2">
                                    Getypte spelling:{' '}
                                    <span className="font-mono font-bold">
                                        {result.typedSpelling}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        Instructies voor Deelnemer
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                        <div>
                            <h3 className="font-bold mb-2 text-blue-300">Je kunt vragen om:</h3>
                            <ul className="space-y-1">
                                <li>• Herhaling van het woord</li>
                                <li>• Definitie</li>
                                <li>• Gebruik in een zin</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-blue-300">Regels:</h3>
                            <ul className="space-y-1">
                                <li>
                                    • {DEFAULT_TIMER_CONFIG.totalTime} seconden totaal per woord
                                </li>
                                <li>
                                    • Groen: Verzoeken toegestaan (
                                    {DEFAULT_TIMER_CONFIG.totalTime -
                                        DEFAULT_TIMER_CONFIG.yellowPhaseStart}
                                    s)
                                </li>
                                <li>
                                    • Geel: Laatste verzoeken (
                                    {DEFAULT_TIMER_CONFIG.yellowPhaseStart -
                                        DEFAULT_TIMER_CONFIG.redPhaseStart}
                                    s)
                                </li>
                                <li>
                                    • Rood: Begin met spellen! ({DEFAULT_TIMER_CONFIG.redPhaseStart}
                                    s)
                                </li>
                                <li>• Spel letter voor letter duidelijk</li>
                            </ul>
                        </div>
                    </div>
                </div>
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

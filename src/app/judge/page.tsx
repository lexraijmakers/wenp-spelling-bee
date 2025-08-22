'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { getDifficultyDisplay } from '@/lib/difficulty-utils'
import { useSpellingBeeRealtime } from '@/lib/realtime'
import { DEFAULT_TIMER_CONFIG } from '@/lib/timer-config'
import { getAvailableInfo, getRandomWord, loadWords, Word, WordDatabase } from '@/lib/words'
import { Difficulty } from '@prisma/client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function JudgePageContent() {
    const searchParams = useSearchParams()
    const roomCode = searchParams.get('room')

    const [wordDatabase, setWordDatabase] = useState<WordDatabase | null>(null)
    const [currentWord, setCurrentWord] = useState<Word | null>(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('VERY_EASY')
    const [isConnected] = useState(true)
    const [timerActive, setTimerActive] = useState(false)

    const realtime = useSpellingBeeRealtime(roomCode || '')

    useEffect(() => {
        if (!roomCode || !realtime) return

        // Subscribe to Pusher events
        realtime.subscribe()

        // Load words
        loadWords().then(setWordDatabase)

        return () => {
            realtime.unsubscribe()
        }
    }, [roomCode, realtime])

    const selectNewWord = async () => {
        if (!wordDatabase || !realtime) return

        const word = getRandomWord(wordDatabase.words, selectedDifficulty)
        if (word) {
            setCurrentWord(word)
            const availableInfo = getAvailableInfo(word)

            try {
                await realtime.selectWord(word.word, availableInfo)
            } catch (error) {
                console.error('Failed to select word:', error)
            }
        }
    }

    const startTimer = async () => {
        if (!realtime) return

        setTimerActive(true)

        try {
            await realtime.startTimer(DEFAULT_TIMER_CONFIG.totalTime)
        } catch (error) {
            console.error('Failed to start timer:', error)
            setTimerActive(false)
        }
    }

    const resetTimer = async () => {
        if (!realtime) return

        setTimerActive(false)

        try {
            await realtime.resetTimer()
        } catch (error) {
            console.error('Failed to reset timer:', error)
        }
    }

    const markCorrect = async () => {
        if (!realtime || !currentWord) return

        try {
            await realtime.judgeDecision(true, currentWord.word)
        } catch (error) {
            console.error('Failed to mark correct:', error)
        }

        setTimerActive(false)
    }

    const markIncorrect = async () => {
        if (!realtime || !currentWord) return

        try {
            await realtime.judgeDecision(false, currentWord.word)
        } catch (error) {
            console.error('Failed to mark incorrect:', error)
        }

        setTimerActive(false)
    }

    if (!roomCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-center text-destructive">No Room Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">
                            Please create a session first.
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
                            Judge Interface
                        </CardTitle>
                        <div className="flex justify-center items-center gap-4 text-sm">
                            <span>
                                Room: <Badge variant="outline">{roomCode}</Badge>
                            </span>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        isConnected ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                />
                                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Word Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Word Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty Level</Label>
                                <Select
                                    value={selectedDifficulty}
                                    onValueChange={(value) =>
                                        setSelectedDifficulty(value as Difficulty)
                                    }
                                >
                                    <SelectTrigger id="difficulty">
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VERY_EASY">Very Easy</SelectItem>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                        <SelectItem value="VERY_HARD">Very Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={selectNewWord}
                                disabled={!wordDatabase}
                                className="w-full"
                            >
                                Get New Word
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Word */}
                {currentWord && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Word</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold mb-2">{currentWord.word}</div>
                                <Badge variant="secondary">
                                    {getDifficultyDisplay(currentWord.difficulty)}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Definition</Label>
                                    <p className="text-muted-foreground">
                                        {currentWord.definition}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        Example Sentence
                                    </Label>
                                    <p className="text-muted-foreground">{currentWord.sentence}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Timer Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timer Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={startTimer}
                                    disabled={!currentWord || timerActive}
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Start Timer
                                </Button>
                                <Button
                                    onClick={resetTimer}
                                    disabled={!timerActive}
                                    variant="outline"
                                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                >
                                    Reset Timer
                                </Button>
                            </div>
                            {timerActive && (
                                <div className="text-center">
                                    <Badge variant="outline" className="text-sm">
                                        Timer is running
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Judge Decisions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Judge Decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={markCorrect}
                                    disabled={!currentWord}
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 h-12"
                                >
                                    ✓ Correct
                                </Button>
                                <Button
                                    onClick={markIncorrect}
                                    disabled={!currentWord}
                                    variant="destructive"
                                    className="h-12"
                                >
                                    ✗ Incorrect
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Decision will automatically reveal the word to participants
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Information Panel */}
                {currentWord && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                    💡 You can provide definition or example sentence during
                                    spelling
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    ⏱️ Timer phases: Green → Yellow → Red
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    🎯 Marking correct/incorrect reveals the word automatically
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default function JudgePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Card className="w-[300px]">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading judge interface...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            }
        >
            <JudgePageContent />
        </Suspense>
    )
}

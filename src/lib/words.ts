import { Difficulty, PrismaClient } from '@prisma/client'

export interface Word {
    id: string
    word: string
    sentence: string
    definition: string
    difficulty: Difficulty
}

export interface WordDatabase {
    words: Word[]
}

let wordDatabase: WordDatabase | null = null

export const loadWords = async (): Promise<WordDatabase> => {
    if (wordDatabase) {
        return wordDatabase
    }

    try {
        // For client-side, fetch from API
        if (typeof window !== 'undefined') {
            const response = await fetch('/api/words')
            wordDatabase = await response.json()
            return wordDatabase!
        }

        // For server-side, use Prisma directly
        const prisma = new PrismaClient()
        const words = await prisma.word.findMany({
            orderBy: { word: 'asc' }
        })

        // Keep the original format with enum
        const formattedWords = words.map((word) => ({
            id: word.id,
            word: word.word,
            sentence: word.sentence || '',
            definition: word.definition || '',
            difficulty: word.difficulty
        }))

        wordDatabase = {
            words: formattedWords
        }

        await prisma.$disconnect()
        return wordDatabase!
    } catch (error) {
        console.error('Failed to load words:', error)
        throw new Error('Could not load word database')
    }
}

export const getWordsByDifficulty = (words: Word[], difficulty: Difficulty): Word[] => {
    return words.filter((word) => word.difficulty === difficulty)
}

export const getRandomWord = (words: Word[], difficulty: Difficulty): Word | null => {
    const filteredWords = getWordsByDifficulty(words, difficulty)

    if (filteredWords.length === 0) {
        return null
    }

    const randomIndex = Math.floor(Math.random() * filteredWords.length)
    return filteredWords[randomIndex]
}

export const getAvailableInfo = (word: Word): string[] => {
    const available: string[] = []

    if (word.definition) available.push('definition')
    if (word.sentence) available.push('sentence')

    return available
}

export const generateRoomCode = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

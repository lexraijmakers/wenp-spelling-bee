export interface Word {
    id: number
    word: string
    sentence: string
    definition: string
    difficulty: number
}

export interface WordDatabase {
    words: Word[]
    categories: string[]
}

let wordDatabase: WordDatabase | null = null

export const loadWords = async (): Promise<WordDatabase> => {
    if (wordDatabase) {
        return wordDatabase
    }

    try {
        const response = await fetch('/dutch-words.json')
        wordDatabase = await response.json()
        return wordDatabase!
    } catch (error) {
        console.error('Failed to load words:', error)
        throw new Error('Could not load word database')
    }
}

export const getWordsByDifficulty = (words: Word[], difficulty: number): Word[] => {
    return words.filter((word) => word.difficulty === difficulty)
}

export const getRandomWord = (words: Word[], difficulty: number): Word | null => {
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

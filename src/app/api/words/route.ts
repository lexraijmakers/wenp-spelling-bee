import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

interface Word {
    id: number
    word: string
    sentence: string
    definition: string
    difficulty: number
}

interface WordsData {
    categories: string[]
    words: Word[]
}

const WORDS_FILE_PATH = path.join(process.cwd(), 'public', 'dutch-words.json')

function readWordsFile(): WordsData {
    const fileContents = fs.readFileSync(WORDS_FILE_PATH, 'utf8')
    return JSON.parse(fileContents)
}

function writeWordsFile(data: WordsData): void {
    fs.writeFileSync(WORDS_FILE_PATH, JSON.stringify(data, null, 4))
}

function getNextId(words: Word[]): number {
    return Math.max(...words.map((w) => w.id), 0) + 1
}

// GET - Fetch all words
export async function GET() {
    try {
        const data = readWordsFile()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error reading words file:', error)
        return NextResponse.json({ error: 'Failed to read words' }, { status: 500 })
    }
}

// POST - Create new word
export async function POST(request: NextRequest) {
    try {
        const newWord = await request.json()

        // Validate required fields
        if (!newWord.word || !newWord.sentence || !newWord.definition || !newWord.difficulty) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const data = readWordsFile()

        // Check if word already exists
        const existingWord = data.words.find(
            (w) => w.word.toLowerCase() === newWord.word.toLowerCase()
        )
        if (existingWord) {
            return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
        }

        // Add new word with auto-generated ID
        const wordToAdd: Word = {
            id: getNextId(data.words),
            word: newWord.word,
            sentence: newWord.sentence,
            definition: newWord.definition,
            difficulty: parseInt(newWord.difficulty)
        }

        data.words.push(wordToAdd)
        writeWordsFile(data)

        return NextResponse.json(wordToAdd, { status: 201 })
    } catch (error) {
        console.error('Error creating word:', error)
        return NextResponse.json({ error: 'Failed to create word' }, { status: 500 })
    }
}

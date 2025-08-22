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

// PUT - Update word
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const updatedWord = await request.json()

        // Validate required fields
        if (
            !updatedWord.word ||
            !updatedWord.sentence ||
            !updatedWord.definition ||
            !updatedWord.difficulty
        ) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const data = readWordsFile()
        const wordIndex = data.words.findIndex((w) => w.id === id)

        if (wordIndex === -1) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 })
        }

        // Check if word name already exists (excluding current word)
        const existingWord = data.words.find(
            (w) => w.id !== id && w.word.toLowerCase() === updatedWord.word.toLowerCase()
        )
        if (existingWord) {
            return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
        }

        // Update the word
        const wordToUpdate: Word = {
            id: id,
            word: updatedWord.word,
            sentence: updatedWord.sentence,
            definition: updatedWord.definition,
            difficulty: parseInt(updatedWord.difficulty)
        }

        data.words[wordIndex] = wordToUpdate
        writeWordsFile(data)

        return NextResponse.json(wordToUpdate)
    } catch (error) {
        console.error('Error updating word:', error)
        return NextResponse.json({ error: 'Failed to update word' }, { status: 500 })
    }
}

// DELETE - Delete word
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)
        const data = readWordsFile()
        const wordIndex = data.words.findIndex((w) => w.id === id)

        if (wordIndex === -1) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 })
        }

        const deletedWord = data.words[wordIndex]
        data.words.splice(wordIndex, 1)
        writeWordsFile(data)

        return NextResponse.json(deletedWord)
    } catch (error) {
        console.error('Error deleting word:', error)
        return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 })
    }
}

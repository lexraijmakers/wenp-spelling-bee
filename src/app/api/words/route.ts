import { Difficulty } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all words
export async function GET() {
    try {
        const words = await prisma.word.findMany({
            orderBy: { word: 'asc' }
        })

        // Return data with enum values
        const formattedWords = words.map((word) => ({
            id: word.id,
            word: word.word,
            sentence: word.sentence || '',
            definition: word.definition || '',
            difficulty: word.difficulty
        }))

        // Return data in expected format
        const data = {
            words: formattedWords
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching words:', error)
        return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 })
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

        // Validate difficulty is a valid enum value
        if (!Object.values(Difficulty).includes(newWord.difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty value' }, { status: 400 })
        }

        // Check if word already exists
        const existingWord = await prisma.word.findUnique({
            where: { word: newWord.word.toLowerCase() }
        })

        if (existingWord) {
            return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
        }

        // Create new word
        const createdWord = await prisma.word.create({
            data: {
                word: newWord.word,
                sentence: newWord.sentence,
                definition: newWord.definition,
                difficulty: newWord.difficulty
            }
        })

        // Return the created word
        const formattedWord = {
            id: createdWord.id,
            word: createdWord.word,
            sentence: createdWord.sentence || '',
            definition: createdWord.definition || '',
            difficulty: createdWord.difficulty
        }

        return NextResponse.json(formattedWord, { status: 201 })
    } catch (error) {
        console.error('Error creating word:', error)
        return NextResponse.json({ error: 'Failed to create word' }, { status: 500 })
    }
}

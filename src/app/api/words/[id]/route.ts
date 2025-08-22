import { Difficulty } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Update word
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idParam } = await params
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

        // Validate difficulty is a valid enum value
        if (!Object.values(Difficulty).includes(updatedWord.difficulty)) {
            return NextResponse.json({ error: 'Invalid difficulty value' }, { status: 400 })
        }

        // Check if word exists
        const existingWord = await prisma.word.findUnique({
            where: { id: idParam }
        })

        if (!existingWord) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 })
        }

        // Check if word name already exists (excluding current word)
        const duplicateWord = await prisma.word.findFirst({
            where: {
                word: updatedWord.word.toLowerCase(),
                id: { not: idParam }
            }
        })

        if (duplicateWord) {
            return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
        }

        // Update the word
        const updated = await prisma.word.update({
            where: { id: idParam },
            data: {
                word: updatedWord.word,
                sentence: updatedWord.sentence,
                definition: updatedWord.definition,
                difficulty: updatedWord.difficulty
            }
        })

        // Return the updated word
        const formattedWord = {
            id: updated.id,
            word: updated.word,
            sentence: updated.sentence || '',
            definition: updated.definition || '',
            difficulty: updated.difficulty
        }

        return NextResponse.json(formattedWord)
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

        // Check if word exists
        const existingWord = await prisma.word.findUnique({
            where: { id: idParam }
        })

        if (!existingWord) {
            return NextResponse.json({ error: 'Word not found' }, { status: 404 })
        }

        // Delete the word
        const deletedWord = await prisma.word.delete({
            where: { id: idParam }
        })

        // Return the deleted word
        const formattedWord = {
            id: deletedWord.id,
            word: deletedWord.word,
            sentence: deletedWord.sentence || '',
            definition: deletedWord.definition || '',
            difficulty: deletedWord.difficulty
        }

        return NextResponse.json(formattedWord)
    } catch (error) {
        console.error('Error deleting word:', error)
        return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 })
    }
}

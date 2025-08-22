import { Difficulty, PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface JsonWord {
    id: number
    word: string
    sentence: string
    definition: string
    difficulty: number
}

interface JsonData {
    words: JsonWord[]
}

// Map numeric difficulty to enum
function mapDifficultyToEnum(difficulty: number): Difficulty {
    switch (difficulty) {
        case 1:
            return Difficulty.VERY_EASY
        case 2:
            return Difficulty.EASY
        case 3:
            return Difficulty.MEDIUM
        case 4:
            return Difficulty.HARD
        case 5:
            return Difficulty.VERY_HARD
        default:
            return Difficulty.VERY_EASY
    }
}

async function main() {
    console.log('🌱 Starting seed...')

    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'public', 'dutch-words.json')
    const jsonData: JsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

    console.log(`Found ${jsonData.words.length} words to seed`)

    // Clear existing data
    await prisma.word.deleteMany()
    console.log('🗑️  Cleared existing words')

    // Insert words
    for (const jsonWord of jsonData.words) {
        await prisma.word.create({
            data: {
                word: jsonWord.word,
                sentence: jsonWord.sentence,
                definition: jsonWord.definition,
                difficulty: mapDifficultyToEnum(jsonWord.difficulty)
            }
        })
    }

    console.log(`✅ Seeded ${jsonData.words.length} words`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })

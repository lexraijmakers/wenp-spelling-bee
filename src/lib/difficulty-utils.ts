import { Difficulty } from '@prisma/client'

/**
 * Get display name for difficulty enum
 */
export const getDifficultyDisplay = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case 'VERY_EASY':
            return 'Very Easy'
        case 'EASY':
            return 'Easy'
        case 'MEDIUM':
            return 'Medium'
        case 'HARD':
            return 'Hard'
        case 'VERY_HARD':
            return 'Very Hard'
        default:
            return difficulty
    }
}

/**
 * Get difficulty level number for styling and comparisons
 */
export const getDifficultyLevel = (difficulty: Difficulty): number => {
    switch (difficulty) {
        case 'VERY_EASY':
            return 1
        case 'EASY':
            return 2
        case 'MEDIUM':
            return 3
        case 'HARD':
            return 4
        case 'VERY_HARD':
            return 5
        default:
            return 1
    }
}

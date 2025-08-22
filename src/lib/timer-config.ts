// Timer configuration for the spelling bee
export interface TimerConfig {
    totalTime: number // Total time in seconds
    yellowPhaseStart: number // When yellow phase starts (seconds remaining)
    redPhaseStart: number // When red phase starts (seconds remaining)
}

// Default timer configuration
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
    totalTime: 90, // 90 seconds total
    yellowPhaseStart: 60, // Yellow at 60 seconds remaining (30s into timer)
    redPhaseStart: 30 // Red at 30 seconds remaining (60s into timer)
}

// Helper function to get timer phase based on time left
export const getTimerPhase = (
    timeLeft: number,
    config: TimerConfig = DEFAULT_TIMER_CONFIG
): 'green' | 'yellow' | 'red' => {
    if (timeLeft <= config.redPhaseStart) return 'red'
    if (timeLeft <= config.yellowPhaseStart) return 'yellow'
    return 'green'
}

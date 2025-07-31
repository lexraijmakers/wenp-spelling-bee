'use client'

class AudioManager {
    private bellAudio: HTMLAudioElement | null = null
    private successAudio: HTMLAudioElement | null = null
    private isInitialized = false

    async initialize() {
        if (this.isInitialized || typeof window === 'undefined') return

        try {
            // Create a simple bell sound using Web Audio API
            this.createBellSound()
            this.createSuccessSound()
            this.isInitialized = true
        } catch (error) {
            console.warn('Audio initialization failed:', error)
        }
    }

    private createBellSound() {
        // Create a simple bell-like sound using Web Audio API
        const audioContext = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

        const createBellTone = () => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Bell-like frequency
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5)

            // Bell-like envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
        }

        // Create a function to play the bell
        this.bellAudio = {
            play: () => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume()
                }
                createBellTone()
            }
        } as HTMLAudioElement
    }

    private createSuccessSound() {
        // Create a simple success sound
        const audioContext = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

        const createSuccessTone = () => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Success chord progression
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5

            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01)
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
        }

        this.successAudio = {
            play: () => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume()
                }
                createSuccessTone()
            }
        } as HTMLAudioElement
    }

    playBell() {
        if (this.bellAudio) {
            this.bellAudio.play()
        }
    }

    playSuccess() {
        if (this.successAudio) {
            this.successAudio.play()
        }
    }

    setVolume(volume: number) {
        // Volume control would be implemented here for actual audio elements
        console.log('Volume set to:', volume)
    }
}

export const audioManager = new AudioManager()

// Initialize audio on first user interaction
export const initializeAudio = () => {
    audioManager.initialize()
}

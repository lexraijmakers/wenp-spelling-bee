'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSpellingBeeRealtime } from '../../../lib/realtime';
import { loadWords, getRandomWord, getAvailableInfo, Word, WordDatabase } from '../../../lib/words';
import { audioManager, initializeAudio } from '../../../lib/audio';

function JudgePageContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const [wordDatabase, setWordDatabase] = useState<WordDatabase | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [isConnected] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  
  const realtime = useSpellingBeeRealtime(roomCode || '');

  useEffect(() => {
    if (!roomCode || !realtime) return;

    // Subscribe to Pusher events
    realtime.subscribe();

    // Load words
    loadWords().then(setWordDatabase);

    return () => {
      realtime.unsubscribe();
    };
  }, [roomCode, realtime]);

  const selectNewWord = async () => {
    if (!wordDatabase || !selectedCategory || !realtime) return;

    const word = getRandomWord(wordDatabase.words, selectedCategory, selectedDifficulty);
    if (word) {
      setCurrentWord(word);
      const availableInfo = getAvailableInfo(word);
      
      try {
        await realtime.selectWord(word.word, availableInfo);
      } catch (error) {
        console.error('Failed to select word:', error);
      }
    }
  };

  const startTimer = async () => {
    if (!realtime) return;
    
    setTimerActive(true);
    try {
      await realtime.startTimer(90);
    } catch (error) {
      console.error('Failed to start timer:', error);
      setTimerActive(false);
    }
  };

  const resetTimer = async () => {
    if (!realtime) return;
    
    setTimerActive(false);
    try {
      await realtime.resetTimer();
    } catch (error) {
      console.error('Failed to reset timer:', error);
    }
  };

  const markCorrect = async () => {
    if (!realtime) return;
    
    initializeAudio();
    audioManager.playSuccess();
    try {
      await realtime.judgeDecision(true);
    } catch (error) {
      console.error('Failed to mark correct:', error);
    }
    setTimerActive(false);
  };

  const markIncorrect = async () => {
    if (!realtime) return;
    
    initializeAudio();
    audioManager.playBell();
    try {
      await realtime.judgeDecision(false, currentWord?.word);
    } catch (error) {
      console.error('Failed to mark incorrect:', error);
    }
    setTimerActive(false);
  };

  const provideInfo = async (type: string) => {
    if (!currentWord || !realtime) return;
    
    let content = '';
    switch (type) {
      case 'definition':
        content = currentWord.definition;
        break;
      case 'sentence':
        content = currentWord.sentence;
        break;
      case 'partOfSpeech':
        content = currentWord.partOfSpeech;
        break;
      case 'pronunciation':
        content = currentWord.pronunciation || 'Not available';
        break;
      case 'origin':
        content = currentWord.origin || 'Not available';
        break;
    }
    
    try {
      await realtime.provideInfo(type, content);
    } catch (error) {
      console.error('Failed to provide info:', error);
    }
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">No Room Code</h1>
          <p className="text-gray-600">Please create a session first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Judge Interface</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Room:</span>
                <span className="font-mono text-lg ml-2">{roomCode}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>

        {/* Word Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Word Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {wordDatabase?.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={selectNewWord}
                disabled={!selectedCategory || !wordDatabase}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Get New Word
              </button>
            </div>
          </div>
        </div>

        {/* Current Word */}
        {currentWord && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Word</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold text-center text-gray-900 mb-2">
                {currentWord.word}
              </div>
              <div className="text-center text-gray-600">
                {currentWord.category} • Level {currentWord.difficulty}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Definition:</strong> {currentWord.definition}
              </div>
              <div>
                <strong>Part of Speech:</strong> {currentWord.partOfSpeech}
              </div>
              <div>
                <strong>Sentence:</strong> {currentWord.sentence}
              </div>
              <div>
                <strong>Pronunciation:</strong> {currentWord.pronunciation || 'N/A'}
              </div>
              {currentWord.origin && (
                <div>
                  <strong>Origin:</strong> {currentWord.origin}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Information Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Provide Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => provideInfo('definition')}
                disabled={!currentWord}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Definition
              </button>
              <button
                onClick={() => provideInfo('sentence')}
                disabled={!currentWord}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Sentence
              </button>
              <button
                onClick={() => provideInfo('partOfSpeech')}
                disabled={!currentWord}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Part of Speech
              </button>
              <button
                onClick={() => provideInfo('pronunciation')}
                disabled={!currentWord}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Pronunciation
              </button>
              <button
                onClick={() => provideInfo('origin')}
                disabled={!currentWord}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Origin
              </button>
            </div>
          </div>

          {/* Timer and Decisions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Timer & Decisions</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={startTimer}
                  disabled={!currentWord || timerActive}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
                >
                  Start Timer
                </button>
                <button
                  onClick={resetTimer}
                  disabled={!timerActive}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition-colors"
                >
                  Reset Timer
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={markCorrect}
                  disabled={!currentWord}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded font-medium transition-colors"
                >
                  ✓ Correct
                </button>
                <button
                  onClick={markIncorrect}
                  disabled={!currentWord}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded font-medium transition-colors"
                >
                  ✗ Incorrect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JudgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading judge interface...</p>
        </div>
      </div>
    }>
      <JudgePageContent />
    </Suspense>
  );
}

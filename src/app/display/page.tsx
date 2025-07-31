'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSpellingBeeRealtime } from '../../../lib/realtime';

interface TimerState {
  timeLeft: number;
  phase: 'green' | 'yellow' | 'red';
  isActive: boolean;
}

function DisplayPageContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('room');
  
  const [isConnected] = useState(true);
  
  const realtime = useSpellingBeeRealtime(roomCode || '');
  const [currentWord, setCurrentWord] = useState('');
  const [availableInfo, setAvailableInfo] = useState<string[]>([]);
  const [status, setStatus] = useState('Waiting for word...');
  const [providedInfo, setProvidedInfo] = useState<{type: string, content: string} | null>(null);
  const [result, setResult] = useState<{correct: boolean, correctSpelling?: string} | null>(null);
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 90,
    phase: 'green',
    isActive: false
  });

  useEffect(() => {
    if (!roomCode || !realtime) return;

    // Subscribe to Pusher events
    realtime.subscribe();

    // Set up event listeners
    realtime.on('word-selected', (data: { word: string; availableInfo: string[] }) => {
      setCurrentWord(data.word);
      setAvailableInfo(data.availableInfo);
      setStatus('Word selected - Ready to begin');
      setProvidedInfo(null);
      setResult(null);
      setTimer(prev => ({ ...prev, timeLeft: 90, phase: 'green', isActive: false }));
    });

    realtime.on('timer-start', (data: { duration: number }) => {
      setStatus('Spelling in progress...');
      setTimer(prev => ({ ...prev, timeLeft: data.duration, isActive: true }));
    });

    realtime.on('timer-reset', () => {
      setTimer(prev => ({ ...prev, timeLeft: 90, phase: 'green', isActive: false }));
      setStatus('Timer reset - Ready to begin');
    });

    realtime.on('info-provided', (data: { type: string; content: string }) => {
      setProvidedInfo(data);
      setTimeout(() => setProvidedInfo(null), 5000); // Clear after 5 seconds
    });

    realtime.on('judge-decision', (data: { correct: boolean; correctSpelling?: string }) => {
      setResult(data);
      setTimer(prev => ({ ...prev, isActive: false }));
      setStatus(data.correct ? 'Correct!' : 'Incorrect');
    });

    return () => {
      realtime.unsubscribe();
    };
  }, [roomCode, realtime]);

  // Timer countdown effect
  useEffect(() => {
    if (!timer.isActive) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          setStatus('Time expired!');
          return { ...prev, timeLeft: 0, isActive: false };
        }

        let newPhase: 'green' | 'yellow' | 'red' = 'green';
        if (newTimeLeft <= 15) newPhase = 'red';
        else if (newTimeLeft <= 30) newPhase = 'yellow';

        return { ...prev, timeLeft: newTimeLeft, phase: newPhase };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInfoLabel = (type: string) => {
    switch (type) {
      case 'definition': return 'Definition';
      case 'sentence': return 'Sentence';
      case 'partOfSpeech': return 'Part of Speech';
      case 'pronunciation': return 'Pronunciation';
      case 'origin': return 'Origin';
      default: return type;
    }
  };

  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">No Room Code</h1>
          <p className="text-xl text-gray-600">Please join a session first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Dutch Spelling Bee</h1>
          <div className="flex justify-center items-center space-x-6 text-xl">
            <span>Room: <span className="font-mono">{roomCode}</span></span>
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className={`inline-block px-8 py-4 rounded-2xl text-6xl font-mono font-bold ${
            timer.phase === 'green' ? 'bg-green-600' :
            timer.phase === 'yellow' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {formatTime(timer.timeLeft)}
          </div>
          <div className="mt-2 text-xl">
            {timer.phase === 'green' && 'Green Light - Requests Allowed'}
            {timer.phase === 'yellow' && 'Yellow Light - 30 Seconds Remaining'}
            {timer.phase === 'red' && 'Red Light - Must Begin Spelling'}
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-8">
          <div className="text-3xl font-semibold mb-4">{status}</div>
          {currentWord && (
            <div className="text-xl text-blue-200">
              Current word ready for spelling
            </div>
          )}
        </div>

        {/* Available Information */}
        {availableInfo.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Available Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {availableInfo.map(info => (
                <div key={info} className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-medium">{getInfoLabel(info)}</div>
                  <div className="text-green-300 text-sm">✓ Available</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 text-lg text-blue-200">
              You may request any of the above information from the judge
            </div>
          </div>
        )}

        {/* Provided Information */}
        {providedInfo && (
          <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-2 text-yellow-300">
              {getInfoLabel(providedInfo.type)} Provided:
            </h3>
            <div className="text-xl">{providedInfo.content}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`${result.correct ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'} border-2 rounded-2xl p-8 mb-8`}>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${result.correct ? 'text-green-300' : 'text-red-300'}`}>
                {result.correct ? '✓ CORRECT!' : '✗ INCORRECT'}
              </div>
              {!result.correct && result.correctSpelling && (
                <div className="text-2xl text-red-200">
                  Correct spelling: <span className="font-mono font-bold">{result.correctSpelling}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Contestant Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div>
              <h3 className="font-bold mb-2 text-blue-300">You may request:</h3>
              <ul className="space-y-1">
                <li>• Word repetition</li>
                <li>• Definition</li>
                <li>• Part of speech</li>
                <li>• Sentence usage</li>
                <li>• Language of origin</li>
                <li>• Pronunciation guide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-blue-300">Rules:</h3>
              <ul className="space-y-1">
                <li>• 90 seconds total per word</li>
                <li>• Green: Requests allowed (60s)</li>
                <li>• Yellow: Final requests (30s)</li>
                <li>• Red: Must begin spelling (15s)</li>
                <li>• Spell letter by letter clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DisplayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading display interface...</p>
        </div>
      </div>
    }>
      <DisplayPageContent />
    </Suspense>
  );
}

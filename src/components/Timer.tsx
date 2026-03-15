import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerProps {
  mode: TimerMode;
  durations: Record<TimerMode, number>;
  onSessionComplete: () => void;
  onModeSwitch: (newMode: TimerMode) => void;
}

export function Timer({ mode, durations, onSessionComplete, onModeSwitch }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(durations[mode] * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const prevModeRef = useRef(mode);

  const chimeAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chimeAudio.current = new Audio('https://actions.google.com/sounds/v1/door_bells/doorbell_chime.ogg');
  }, []);

  const playChime = () => {
    if (chimeAudio.current) {
      chimeAudio.current.currentTime = 0;
      chimeAudio.current.play().catch(e => console.log('Audio play blocked:', e));
    }
  };

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(durations[mode] * 60);
      setIsActive(false); // Force manual start on mode switch per requirements
    }
  }, [mode, durations]); // Removed autoFlow dependency

  useEffect(() => {
    if (!isActive && prevModeRef.current === mode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(durations[mode] * 60);
    }
  }, [durations, mode, isActive]);

  const handleComplete = useCallback(() => {
    playChime();
    if (mode === 'focus') {
      onSessionComplete();
      onModeSwitch('shortBreak');
    } else {
      onModeSwitch('focus');
    }
  }, [mode, onModeSwitch, onSessionComplete]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const skipTimer = () => handleComplete();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto relative overflow-hidden transition-all">
      <h1 className="text-8xl md:text-[160px] font-light tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-12">
        {formatTime(timeLeft)}
      </h1>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTimer}
          className="glass-button w-24 h-24 rounded-full text-2xl flex items-center justify-center bg-white/20 hover:bg-white/30 text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
        </button>
        <button 
          onClick={skipTimer}
          className="glass-button w-16 h-16 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Skip"
        >
          <SkipForward size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}


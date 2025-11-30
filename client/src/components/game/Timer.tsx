import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  isPaused?: boolean;
  onTimeUpdate?: (time: number) => void;
}

export default function Timer({ duration, onComplete, isPaused = false, onTimeUpdate }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        onTimeUpdate?.(newTime);
        if (newTime <= 0) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onComplete, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4" data-testid="timer">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={isLow ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-1000',
              isLow && 'animate-pulse'
            )}
            style={{
              filter: isLow 
                ? 'drop-shadow(0 0 10px hsl(var(--destructive)))' 
                : 'drop-shadow(0 0 10px hsl(var(--primary)))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={cn(
              'font-mono text-3xl font-bold transition-colors',
              isLow ? 'text-destructive animate-pulse' : 'text-primary'
            )}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}

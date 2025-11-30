import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import backgroundMusic from '@assets/neon-fury-201183_1764216974235.mp3';
import winSound from '@assets/you-win-sequence-2-183949_1764217080506.mp3';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playWinSound: (winner: 'agents' | 'spies' | 'jester') => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('spy-game-muted');
    return saved === 'true';
  });
  
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgMusicRef.current = new Audio(backgroundMusic);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    
    winSoundRef.current = new Audio(winSound);
    winSoundRef.current.volume = 0.5;

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (winSoundRef.current) {
        winSoundRef.current.pause();
        winSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
      if (!isMuted) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
    if (winSoundRef.current) {
      winSoundRef.current.muted = isMuted;
    }
    localStorage.setItem('spy-game-muted', String(isMuted));
  }, [isMuted]);

  const startMusic = useCallback(() => {
    if (bgMusicRef.current && !isMuted) {
      bgMusicRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  useEffect(() => {
    const handleInteraction = () => {
      startMusic();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [startMusic]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const playWinSound = useCallback((winner: 'agents' | 'spies' | 'jester') => {
    if (winSoundRef.current && !isMuted) {
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playWinSound }}>
      {children}
    </AudioContext.Provider>
  );
}

export function MuteButton() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 bg-background/80 backdrop-blur-sm hover-elevate border border-border/50"
      onClick={toggleMute}
      data-testid="button-mute"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary" />
      )}
    </Button>
  );
}

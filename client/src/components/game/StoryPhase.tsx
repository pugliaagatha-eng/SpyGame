import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Send, Users, Clock, AlertCircle } from 'lucide-react';
import type { Mission, Player, StoryContribution } from '@shared/schema';

interface StoryPhaseProps {
  mission: Mission;
  players: Player[];
  currentPlayerId: string | null;
  currentStoryPlayerIndex: number;
  storyContributions: StoryContribution[];
  onSubmitContribution: (text: string) => void;
  onSkipToVoting: () => void;
  isHost: boolean;
  playerRole?: 'agent' | 'spy' | 'triple' | 'jester';
}

export default function StoryPhase({
  mission,
  players,
  currentPlayerId,
  currentStoryPlayerIndex,
  storyContributions,
  onSubmitContribution,
  onSkipToVoting,
  isHost,
  playerRole,
}: StoryPhaseProps) {
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  const activePlayers = players.filter(p => !p.isEliminated);
  const currentStoryPlayer = activePlayers[currentStoryPlayerIndex];
  const isMyTurn = currentPlayerId === currentStoryPlayer?.id;
  const isAgent = playerRole === 'agent' || playerRole === 'triple';
  const isSpy = playerRole === 'spy';
  
  const maxChars = 400;
  const charsLeft = maxChars - text.length;
  
  useEffect(() => {
    if (!isMyTurn) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (text.trim()) {
            onSubmitContribution(text);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isMyTurn, text, onSubmitContribution]);
  
  useEffect(() => {
    setTimeLeft(60);
    setText('');
  }, [currentStoryPlayerIndex]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmitContribution(text.trim());
      setText('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl neon-border">
        <CardHeader className="text-center">
          <Badge variant="outline" className="mx-auto mb-2 text-purple-400 border-purple-400">
            <BookOpen className="w-3 h-3 mr-1" />
            CONSTRUÇÃO DA HISTÓRIA
          </Badge>
          <CardTitle className="font-serif text-2xl neon-text">
            {mission.title}
          </CardTitle>
          
          {isAgent && mission.secretFact.storyTitle && (
            <p className="text-purple-300 text-sm mt-2">
              História: <span className="font-semibold">{mission.secretFact.storyTitle}</span>
            </p>
          )}
          
          {isSpy && (
            <p className="text-amber-400/80 text-sm mt-2 italic">
              Preste atenção no que os outros escrevem e tente se encaixar!
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Vez de: <span className="text-primary font-semibold">{currentStoryPlayer?.name}</span></span>
            </div>
            {isMyTurn && (
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>
          
          {storyContributions.length > 0 && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">História até agora:</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {storyContributions.map((c, i) => (
                  <span key={i}>
                    <span className="text-purple-300">{c.text}</span>
                    {i < storyContributions.length - 1 && ' '}
                  </span>
                ))}
              </p>
            </div>
          )}
          
          {storyContributions.length === 0 && isAgent && mission.secretFact.storyPrompt && (
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">Contexto da História:</h4>
              <p className="text-sm text-cyan-300/80 italic">
                "{mission.secretFact.storyPrompt}"
              </p>
            </div>
          )}
          
          {isMyTurn ? (
            <div className="space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                placeholder={isSpy 
                  ? "Improvise sua contribuição baseada na história até agora..." 
                  : "Continue a história com sua contribuição..."
                }
                className="min-h-[120px] resize-none"
                maxLength={maxChars}
              />
              <div className="flex items-center justify-between">
                <span className={`text-sm ${charsLeft < 50 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {charsLeft} caracteres restantes
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground">
                Aguardando <span className="text-primary font-semibold">{currentStoryPlayer?.name}</span> escrever...
              </p>
            </div>
          )}
          
          {isSpy && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300/80">
                Você não conhece a história. Leia as contribuições anteriores e improvise de forma convincente!
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {activePlayers.map((player, index) => (
              <Badge 
                key={player.id} 
                variant={index < currentStoryPlayerIndex ? "default" : index === currentStoryPlayerIndex ? "secondary" : "outline"}
                className={index === currentStoryPlayerIndex ? "ring-2 ring-purple-400" : ""}
              >
                {player.name}
                {index < currentStoryPlayerIndex && " ✓"}
              </Badge>
            ))}
          </div>
          
          {isHost && currentStoryPlayerIndex >= activePlayers.length - 1 && (
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={onSkipToVoting}
            >
              Ir para Votação
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

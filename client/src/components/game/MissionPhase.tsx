import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, AlertTriangle, ChevronRight, Hash, Pencil, ArrowUpDown, KeyRound, BookOpen } from 'lucide-react';
import type { Mission } from '@shared/schema';
import { MISSION_COUNTS } from '@shared/schema';

interface MissionPhaseProps {
  mission: Mission;
  currentRound: number;
  maxRounds: number;
  onStartDiscussion: () => void;
  isDrawingMission?: boolean;
  onStartDrawing?: () => void;
  isHost: boolean;
}

export default function MissionPhase({
  mission,
  currentRound,
  maxRounds,
  onStartDiscussion,
  isDrawingMission,
  onStartDrawing,
  isHost,
}: MissionPhaseProps) {
  const getMissionIcon = () => {
    switch (mission.secretFact.type) {
      case 'drawing': return <Pencil className="w-5 h-5" />;
      case 'order': return <ArrowUpDown className="w-5 h-5" />;
      case 'code': return <KeyRound className="w-5 h-5" />;
      case 'story': return <BookOpen className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getMissionColor = () => {
    switch (mission.secretFact.type) {
      case 'drawing': return 'text-pink-400 border-pink-400';
      case 'order': return 'text-blue-400 border-blue-400';
      case 'code': return 'text-green-400 border-green-400';
      case 'story': return 'text-purple-400 border-purple-400';
      default: return 'text-primary border-primary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: maxRounds }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < currentRound 
                ? 'bg-primary neon-glow' 
                : i === currentRound 
                  ? 'bg-primary/50 animate-pulse' 
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <Card className="w-full max-w-lg neon-border">
        <CardHeader className="text-center">
          <Badge variant="outline" className={`mx-auto mb-2 ${getMissionColor()}`}>
            {getMissionIcon()}
            <span className="ml-1">RODADA {currentRound}</span>
          </Badge>
          <CardTitle className="font-serif text-2xl neon-text">
            {mission.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {mission.description}
          </p>

          {mission.secretFact.type === 'order' && mission.secretFact.rankingItems && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Emojis para Ordenar
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-4xl">
                {mission.secretFact.rankingItems.map((item, index) => (
                  <span key={index} className="p-2 rounded-lg bg-background/50 hover:scale-110 transition-transform">
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Critério: <span className="text-blue-300">{mission.secretFact.rankingCriteria}</span>
              </p>
            </div>
          )}

          {mission.secretFact.type === 'story' && mission.secretFact.storyTitle && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                História: {mission.secretFact.storyTitle}
              </h3>
              <p className="text-purple-300/80 text-sm italic">
                "{mission.secretFact.storyPrompt}"
              </p>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Cada jogador escreve até 200 caracteres para continuar a história
              </p>
            </div>
          )}

          {mission.secretFact.type === 'code' && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Código de 5 Dígitos
              </h3>
              <div className="flex justify-center gap-2 my-3">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="w-10 h-12 rounded border-2 border-green-500/50 bg-background/50 flex items-center justify-center text-2xl font-mono text-green-400">
                    ?
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Dica: <span className="text-green-300">{mission.secretFact.hint}</span>
              </p>
            </div>
          )}

          {mission.secretFact.type === 'drawing' && (
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
              <h3 className="text-sm font-semibold text-pink-400 mb-2 flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Desenhe
              </h3>
              <p className="text-pink-300/80 text-center">
                Dica: <span className="font-semibold">{mission.secretFact.hint}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Tempo: {mission.duration}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              <span>{MISSION_COUNTS[mission.title] || 0} possibilidades</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={isDrawingMission ? onStartDrawing : onStartDiscussion}
            disabled={!isHost}
            data-testid="button-start-mission"
          >
            {isHost ? (
              isDrawingMission ? 'Iniciar Desenho' : 'Iniciar Missão'
            ) : (
              'Aguardando Host...'
            )}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

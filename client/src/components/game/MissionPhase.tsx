import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, AlertTriangle, ChevronRight, Hash } from 'lucide-react';
import Timer from './Timer';
import type { Mission } from '@shared/schema';
import { MISSION_COUNTS } from '@shared/schema';

interface MissionPhaseProps {
  mission: Mission;
  currentRound: number;
  maxRounds: number;
  onStartDiscussion: () => void;
  isDrawingMission?: boolean;
  onStartDrawing?: () => void;
}

export default function MissionPhase({
  mission,
  currentRound,
  maxRounds,
  onStartDiscussion,
  isDrawingMission,
  onStartDrawing,
}: MissionPhaseProps) {
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
          <Badge variant="outline" className="mx-auto mb-2 text-primary border-primary">
            <Target className="w-3 h-3 mr-1" />
            RODADA {currentRound}
          </Badge>
          <CardTitle className="font-serif text-2xl neon-text">
            {mission.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground leading-relaxed">
            {mission.description}
          </p>

          <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30">
            <h3 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Dica Pública
            </h3>
            <p className="text-secondary/80 text-center font-mono">
              {mission.secretFact.hint}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Tempo: {mission.duration}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              <span>{MISSION_COUNTS[mission.title]} possibilidades</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={isDrawingMission ? onStartDrawing : onStartDiscussion}
            data-testid="button-start-mission"
          >
            {isDrawingMission ? 'Iniciar Desenho' : 'Iniciar Discussão'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, ChevronRight, AlertTriangle, BookOpen, KeyRound, ArrowUpDown } from 'lucide-react';
import Timer from './Timer';
import type { Player, Mission, DrawingData, StoryContribution, CodeSubmission, OrderSubmission } from '@shared/schema';

interface DiscussionPhaseProps {
  mission: Mission;
  players: Player[];
  drawings: DrawingData[];
  storyContributions?: StoryContribution[];
  codeSubmissions?: CodeSubmission[];
  orderSubmissions?: OrderSubmission[];
  duration: number;
  onStartVoting: () => void;
  isOnlineMode?: boolean;
  isHost?: boolean;
}

export default function DiscussionPhase({
  mission,
  players,
  drawings,
  storyContributions = [],
  codeSubmissions = [],
  orderSubmissions = [],
  duration,
  onStartVoting,
  isOnlineMode = false,
  isHost = true,
}: DiscussionPhaseProps) {
  const activePlayers = players.filter(p => !p.isEliminated);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl neon-border">
        <CardHeader className="text-center">
          <Badge variant="outline" className="mx-auto mb-2 text-primary border-primary">
            <MessageSquare className="w-3 h-3 mr-1" />
            FASE DE DISCUSSÃO
          </Badge>
          <CardTitle className="font-serif text-2xl">
            Discutam sobre a missão
          </CardTitle>
          <div className="mt-4">
            <Timer duration={duration} onComplete={onStartVoting} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Missão: {mission.title}
            </h3>
            {mission.secretFact.type === 'story' ? (
              <p className="text-sm text-muted-foreground">
                Discutam sobre as contribuições da história
              </p>
            ) : mission.secretFact.hint ? (
              <p className="text-sm text-muted-foreground">
                Dica: <span className="text-secondary">{mission.secretFact.hint}</span>
              </p>
            ) : null}
          </div>

          {drawings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Desenhos dos Jogadores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {drawings.map((drawing, index) => (
                  <div 
                    key={index}
                    className="rounded-lg overflow-hidden border border-border"
                    data-testid={`drawing-${index}`}
                  >
                    <img 
                      src={drawing.imageData} 
                      alt={`Desenho de ${drawing.playerName}`}
                      className="w-full aspect-[3/2] object-cover"
                    />
                    <div className="p-2 bg-muted/50 text-center text-sm">
                      {drawing.playerName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {storyContributions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Contribuições da História
              </h3>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {storyContributions.map((contribution, index) => (
                    <div key={index} className="border-b border-purple-500/20 pb-3 last:border-0 last:pb-0">
                      <p className="text-xs text-purple-400 font-semibold mb-1">{contribution.playerName}:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{contribution.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {codeSubmissions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Palpites de Código
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {codeSubmissions.map((submission, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
                  >
                    <p className="text-xs text-green-400 font-semibold mb-2">{submission.playerName}</p>
                    <div className="flex justify-center gap-1">
                      {submission.code.split('').map((digit, i) => (
                        <div 
                          key={i} 
                          className="w-7 h-8 rounded border border-green-500/50 bg-green-500/20 flex items-center justify-center text-lg font-mono text-green-300"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orderSubmissions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Ordens Enviadas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {orderSubmissions.map((submission, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center"
                  >
                    <p className="text-xs text-blue-400 font-semibold mb-2">{submission.playerName}</p>
                    <div className="flex justify-center gap-1">
                      {submission.order.map((emoji, i) => (
                        <div 
                          key={i} 
                          className="w-8 h-10 rounded border border-blue-500/50 bg-blue-500/20 flex items-center justify-center text-xl"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            {activePlayers.map((player) => (
              <Badge 
                key={player.id} 
                variant="secondary"
                data-testid={`player-badge-${player.id}`}
              >
                {player.name}
              </Badge>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-sm text-yellow-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Discutam quem vocês acham que é o espião. Espiões tentarão se misturar!</span>
          </div>

          {isOnlineMode ? (
            isHost ? (
              <Button
                className="w-full"
                size="lg"
                onClick={onStartVoting}
                data-testid="button-start-voting"
              >
                Pular para Votação
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-2">
                Aguardando o host iniciar a votação...
              </div>
            )
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={onStartVoting}
              data-testid="button-start-voting"
            >
              Pular para Votação
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

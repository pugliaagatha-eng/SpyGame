import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, GripVertical, Check, Send, HelpCircle, Phone, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import type { Mission, PlayerRole, OrderSubmission, Player } from '@shared/schema';

interface OrderPhaseProps {
  mission: Mission;
  players: Player[];
  currentPlayerId: string | null;
  playerRole?: PlayerRole;
  orderSubmissions: OrderSubmission[];
  onSubmitOrder: (order: string[]) => void;
  onFinishOrder: () => void;
  isHost: boolean;
  duration: number;
}

export default function OrderPhase({
  mission,
  players,
  currentPlayerId,
  playerRole,
  orderSubmissions,
  onSubmitOrder,
  onFinishOrder,
  isHost,
  duration,
}: OrderPhaseProps) {
  const [items, setItems] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isAgent = playerRole === 'agent' || playerRole === 'triple';
  const isSpy = playerRole === 'spy';
  const rankingItems = mission.secretFact.rankingItems || [];
  const correctOrder = rankingItems;
  const rankingCriteria = mission.secretFact.rankingCriteria || '';

  const mySubmission = orderSubmissions.find(s => s.playerId === currentPlayerId);
  const activePlayers = players.filter(p => !p.isEliminated);
  const allSubmitted = activePlayers.every(p => 
    orderSubmissions.some(s => s.playerId === p.id)
  );

  useEffect(() => {
    if (rankingItems.length > 0) {
      const shuffled = [...rankingItems].sort(() => Math.random() - 0.5);
      setItems(shuffled);
    }
  }, [mission.id]);

  useEffect(() => {
    if (mySubmission) {
      setHasSubmitted(true);
      setItems(mySubmission.order);
    }
  }, [mySubmission]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      if (!hasSubmitted && items.length > 0 && items.length === rankingItems.length) {
        onSubmitOrder(items);
        setHasSubmitted(true);
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, hasSubmitted, items, rankingItems.length, onSubmitOrder]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || hasSubmitted) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (hasSubmitted) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (items.length === rankingItems.length && items.length > 0) {
      onSubmitOrder(items);
      setHasSubmitted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md neon-border">
        <CardHeader className="text-center">
          <Badge variant="outline" className="mx-auto mb-2 text-blue-400 border-blue-400">
            <ArrowUpDown className="w-4 h-4 mr-1" />
            MISSÃO DE ORDEM
          </Badge>
          <CardTitle className="font-serif text-xl sm:text-2xl neon-text">
            {mission.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Arraste os emojis na ordem correta
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {orderSubmissions.length}/{activePlayers.length} enviaram
            </span>
            <span className={`font-mono ${timeRemaining <= 30 ? 'text-red-400' : 'text-cyan-400'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {isAgent && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">INFORMAÇÃO SECRETA</span>
              </div>
              <p className="text-sm text-cyan-300 text-center">
                Critério: <span className="font-semibold">{rankingCriteria}</span>
              </p>
              <p className="text-xs text-cyan-400/60 text-center mt-1">
                Ordem correta: {correctOrder.join(' → ')}
              </p>
            </div>
          )}

          {isSpy && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">VOCÊ É ESPIÃO</span>
              </div>
              <p className="text-xs text-red-300/80 text-center flex items-center justify-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Critério desconhecido - tente adivinhar a ordem!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground mb-3">
              {hasSubmitted ? 'Sua ordem (enviada):' : 'Arraste ou use as setas para ordenar:'}
            </p>
            
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                draggable={!hasSubmitted}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                  ${hasSubmitted 
                    ? 'bg-cyan-500/10 border-cyan-500/30 cursor-default' 
                    : 'bg-background/50 border-blue-500/30 cursor-grab active:cursor-grabbing hover:border-blue-400/50'
                  }
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                  {index + 1}
                </div>
                
                <span className="text-4xl flex-1 text-center select-none">
                  {item}
                </span>

                {!hasSubmitted && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-1 rounded hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                )}

                {!hasSubmitted && (
                  <GripVertical className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={items.length !== rankingItems.length}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Ordem
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-cyan-400 flex items-center justify-center gap-2 mb-3">
                <Check className="w-4 h-4" />
                Ordem enviada com sucesso!
              </p>
              {isHost && allSubmitted && (
                <Button
                  onClick={onFinishOrder}
                  className="w-full"
                >
                  Ir para Discussão
                </Button>
              )}
              {isHost && !allSubmitted && (
                <p className="text-xs text-muted-foreground">
                  Aguardando todos enviarem...
                </p>
              )}
              {!isHost && (
                <p className="text-xs text-muted-foreground">
                  Aguardando outros jogadores...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

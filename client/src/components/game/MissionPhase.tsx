import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Target, Clock, ChevronRight, Hash, Pencil, ArrowUpDown, KeyRound, BookOpen, Phone, Eye, Headphones, Check, Send, Skull } from 'lucide-react';
import type { Mission, PlayerRole, CodeSubmission } from '@shared/schema';
import { MISSION_COUNTS } from '@shared/schema';

interface MissionPhaseProps {
  mission: Mission;
  currentRound: number;
  maxRounds: number;
  onStartDiscussion: () => void;
  isDrawingMission?: boolean;
  onStartDrawing?: () => void;
  isHost: boolean;
  playerRole?: PlayerRole;
  onSubmitCode?: (code: string) => void;
  codeSubmissions?: CodeSubmission[];
  myPlayerId?: string;
  onDecryptSecret?: () => void;
  hasDecrypted?: boolean;
}

export default function MissionPhase({
  mission,
  currentRound,
  maxRounds,
  onStartDiscussion,
  isDrawingMission,
  onStartDrawing,
  isHost,
  playerRole,
  onSubmitCode,
  codeSubmissions = [],
  myPlayerId,
  onDecryptSecret,
  hasDecrypted = false,
}: MissionPhaseProps) {
  const [showPhoneCall, setShowPhoneCall] = useState(false);
  const [codeInput, setCodeInput] = useState(['', '', '', '', '']);
  const [hasSubmittedCode, setHasSubmittedCode] = useState(false);
  
  const mySubmission = codeSubmissions.find(c => c.playerId === myPlayerId);
  
  useEffect(() => {
    if (mySubmission) {
      setHasSubmittedCode(true);
      setCodeInput(mySubmission.code.split(''));
    }
  }, [mySubmission]);
  
  const handleCodeDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...codeInput];
    newCode[index] = value;
    setCodeInput(newCode);
    
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };
  
  const handleCodeSubmit = () => {
    const code = codeInput.join('');
    if (code.length === 5 && onSubmitCode) {
      onSubmitCode(code);
      setHasSubmittedCode(true);
    }
  };
  
  const isCodeComplete = codeInput.every(d => d !== '');
  
  const isAgent = playerRole === 'agent' || playerRole === 'triple';
  const isSpy = playerRole === 'spy';
  const isJester = playerRole === 'jester';
  const doesNotKnowSecret = isSpy || isJester;
  const isStoryMission = mission.secretFact.type === 'story';
  
  useEffect(() => {
    if (isAgent && !isStoryMission) {
      setShowPhoneCall(true);
      const timer = setTimeout(() => setShowPhoneCall(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAgent, isStoryMission, mission.id]);

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
      {showPhoneCall && isAgent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-cyan-900/90 p-8 rounded-2xl border-2 border-cyan-400 max-w-md mx-4 animate-in zoom-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Phone className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h2 className="text-xl font-bold text-cyan-300">TELEFONEMA SECRETO</h2>
            </div>
            <p className="text-sm text-cyan-200/80 text-center mb-4">
              Você está recebendo informações confidenciais da central...
            </p>
            <div className="p-4 rounded bg-cyan-500/30 border border-cyan-400">
              <p className="font-mono text-center text-cyan-300 font-bold text-2xl">
                {mission.secretFact.value}
              </p>
            </div>
            <p className="text-xs text-center text-cyan-400/60 mt-4">
              Memorize esta informação. A ligação será encerrada em breve.
            </p>
          </div>
        </div>
      )}

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


          {isSpy && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Você é Espião
              </h3>
              <p className="text-red-300/80 text-sm text-center mb-3">
                {isStoryMission 
                  ? 'Você NÃO conhece a história desta missão.' 
                  : 'Você NÃO conhece o fato secreto desta missão.'}
              </p>
              {!isStoryMission && onDecryptSecret && (
                <div className="p-3 rounded bg-red-500/20 border border-red-400/50">
                  <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    Habilidade: "Transcrever Ligação"
                  </h4>
                  {hasDecrypted ? (
                    <p className="text-xs text-center text-green-400 flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" />
                      Transcrição enviada ao chat dos espiões!
                    </p>
                  ) : (
                    <Button
                      onClick={onDecryptSecret}
                      variant="outline"
                      size="sm"
                      className="w-full bg-red-500/30 border-red-400 text-red-300 hover:bg-red-500/50"
                    >
                      <Headphones className="w-4 h-4 mr-2" />
                      Transcrever Ligação (Embaralhado)
                    </Button>
                  )}
                  <p className="text-xs text-center text-red-400/60 mt-2">
                    A transcrição aparecerá no chat secreto dos espiões.
                  </p>
                </div>
              )}
              {!isStoryMission && !onDecryptSecret && (
                <p className="text-xs text-center text-red-400/60">
                  Use o chat secreto dos espiões para se comunicar!
                </p>
              )}
            </div>
          )}

          {isJester && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4" />
                Você é O Tolo
              </h3>
              <p className="text-yellow-300/80 text-sm text-center mb-3">
                {isStoryMission 
                  ? 'Você NÃO conhece a história desta missão.' 
                  : 'Você NÃO conhece o fato secreto desta missão.'}
              </p>
              <div className="p-3 rounded bg-yellow-500/20 border border-yellow-400/50">
                <p className="text-xs text-center text-yellow-400/70">
                  Seu objetivo é ser eliminado! Aja de forma suspeita para atrair votos.
                </p>
              </div>
            </div>
          )}

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
              {isAgent && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Critério: <span className="text-blue-300">{mission.secretFact.rankingCriteria}</span>
                </p>
              )}
              {doesNotKnowSecret && (
                <p className={`text-xs text-center mt-3 ${isJester ? 'text-yellow-400/60' : 'text-red-400/60'}`}>
                  Critério desconhecido - observe os agentes
                </p>
              )}
            </div>
          )}

          {mission.secretFact.type === 'story' && (
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              {isAgent && mission.secretFact.storyTitle && (
                <>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    História: {mission.secretFact.storyTitle}
                  </h3>
                  <p className="text-purple-300/80 text-sm italic mb-2">
                    "{mission.secretFact.storyPrompt}"
                  </p>
                </>
              )}
              {doesNotKnowSecret && (
                <>
                  <h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    História Desconhecida
                  </h3>
                  <p className={`text-sm text-center mt-2 ${isJester ? 'text-yellow-400/80' : 'text-amber-400/80'}`}>
                    Preste atenção no que os outros escrevem e tente se encaixar!
                  </p>
                </>
              )}
              <p className="text-xs text-center text-muted-foreground mt-3">
                Cada jogador escreve até 400 caracteres para continuar a história
              </p>
            </div>
          )}

          {mission.secretFact.type === 'code' && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Código de 5 Dígitos
              </h3>
              {isAgent && (
                <p className="text-sm text-center text-cyan-300/80 my-2">
                  Você viu o código durante o telefonema. Memorize-o!
                </p>
              )}
              {doesNotKnowSecret && (
                <p className={`text-sm text-center my-2 ${isJester ? 'text-yellow-300/80' : 'text-red-300/80'}`}>
                  Você NÃO conhece o código. Use a habilidade acima para transcrever!
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-green-500/30">
                <h4 className="text-xs font-semibold text-cyan-400 mb-2 text-center">
                  {hasSubmittedCode ? 'Seu Palpite (Enviado)' : 'Digite seu palpite:'}
                </h4>
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      id={`code-input-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={codeInput[i]}
                      onChange={(e) => handleCodeDigitChange(i, e.target.value)}
                      disabled={hasSubmittedCode}
                      className={`w-10 h-12 rounded border-2 text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                        hasSubmittedCode
                          ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400'
                          : 'border-cyan-500/30 bg-background/50 text-white'
                      }`}
                    />
                  ))}
                </div>
                {!hasSubmittedCode && (
                  <Button
                    onClick={handleCodeSubmit}
                    disabled={!isCodeComplete}
                    className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Palpite
                  </Button>
                )}
                {hasSubmittedCode && (
                  <p className="text-xs text-center text-cyan-400/60 mt-2 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" />
                    Palpite enviado com sucesso!
                  </p>
                )}
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {codeSubmissions.length} jogador(es) já enviaram palpites
                </p>
              </div>
            </div>
          )}

          {mission.secretFact.type === 'drawing' && (
            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
              <h3 className="text-sm font-semibold text-pink-400 mb-2 flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Desenhe
              </h3>
              {isAgent && (
                <p className="text-pink-300/80 text-center">
                  Desenhe: <span className="font-semibold">{mission.secretFact.value}</span>
                </p>
              )}
              {doesNotKnowSecret && (
                <p className={`text-center ${isJester ? 'text-yellow-400/80' : 'text-red-400/80'}`}>
                  Você não sabe o que desenhar. Observe os outros e improvise!
                </p>
              )}
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

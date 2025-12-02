import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Users, Info, X, Shield, Eye, Sparkles, Timer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SplashScreenProps {
  onSelectMode: (mode: 'online') => void;
}

export default function SplashScreen({ onSelectMode }: SplashScreenProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center mb-12 animate-float">
        <div className="relative inline-block">
          <h1 className="font-serif text-4xl sm:text-7xl font-bold tracking-wider neon-text mb-2">
            SPY GAME
          </h1>
          <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>
        <p className="text-muted-foreground text-base sm:text-xl mt-6 font-mono">
          Descubra o espião entre vocês
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full max-w-sm mb-8">
        <Card 
          className="neon-border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          onClick={() => onSelectMode('online')}
          data-testid="button-mode-online"
        >
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-2">COMEÇAR MISSÃO</h2>
            <p className="text-muted-foreground text-sm">
              Crie e compartilhe ou entre em uma sala virtual com seus amigos online!
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        onClick={() => setShowInstructions(true)}
        data-testid="button-instructions"
      >
        <Info className="w-5 h-5 mr-2" />
        Como Jogar
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto neon-border">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl neon-text">Como Jogar</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Os Papéis
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><span className="text-cyan-400 font-semibold">Agente:</span> Conhece o Fato Secreto da missão. Seu objetivo é identificar e eliminar todos os Espiões através da votação.</li>
                <li><span className="text-red-500 font-semibold">Espião:</span> NÃO conhece o Fato Secreto. Deve tentar descobrir o segredo observando os Agentes e se misturar sem ser descoberto. <strong>Sempre há pelo menos 2 Espiões em cada partida.</strong></li>
                <li><span className="text-purple-500 font-semibold">Agente Triplo:</span> Conhece o Fato Secreto, mas vence com os Espiões. Deve ajudá-los discretamente sem se revelar. <strong>Aparece apenas com 7 ou mais jogadores.</strong></li>
                <li><span className="text-yellow-500 font-semibold">O Tolo:</span> Vence sozinho se for eliminado! Deve agir de forma suspeita para atrair votos sem parecer óbvio demais. <strong>Aparece apenas com 7 ou mais jogadores.</strong></li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                As Missões
              </h3>
              <p className="text-muted-foreground">
Cada rodada apresenta uma missão com um <strong>Fato Secreto</strong> que pode ser: um desenho, um código numérico, uma ordem de emojis ou uma história colaborativa. <strong>Apenas os Agentes (e o Agente Triplo) conhecem o Fato Secreto.</strong> Os Espiões devem observar as ações e discussões dos Agentes para tentar deduzir o segredo e se passar por Agentes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Habilidades Especiais
              </h3>
              <p className="text-muted-foreground">
Cada jogador recebe uma <strong>habilidade especial</strong> que pode usar <strong>uma vez por partida</strong>. Exemplos: Espiar Voto (ver o voto de alguém), Trocar Voto (mudar seu voto após ver resultados), Tempo Extra (+30s), Escudo (proteção contra eliminação), entre outras. Os Espiões recebem habilidades especiais como Transcrever Ligação (revela o Fato Secreto embaralhado) ou Revotação +30s. Use estrategicamente!
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Fluxo do Jogo
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li><strong>Revelação de Papéis:</strong> Cada jogador descobre seu papel secretamente. Agentes e Agente Triplo veem o Fato Secreto. Espiões não recebem nenhuma informação.</li>
                <li><strong>Missão:</strong> Uma missão é apresentada (Desenho, Código, Ordem de Emojis ou História). Todos devem completar a tarefa da missão.</li>
                <li><strong>Discussão:</strong> Jogadores discutem e tentam identificar comportamentos suspeitos. Agentes buscam inconsistências, Espiões tentam se camuflar.</li>
                <li><strong>Votação:</strong> Cada jogador vota em quem acredita ser um Espião. A votação é secreta. O Tolo tem um voto negativo (-1) que pode salvar alguém.</li>
                <li><strong>Eliminação:</strong> O jogador mais votado é eliminado e seu papel é revelado. Se for o Tolo, ele vence sozinho e o jogo termina.</li>
                <li><strong>Fim do Jogo:</strong> Agentes vencem se eliminarem todos os Espiões. Espiões (e Agente Triplo) vencem se igualarem ou superarem o número de Agentes. O Tolo vence se for eliminado.</li>
              </ol>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
                <li><span className="text-cyan-400 font-semibold">Agente:</span> Elimine os Espiões. Recebe **3 Fatos Secretos** e deve deduzir qual é o correto.</li>
                <li><span className="text-red-500 font-semibold">Espião:</span> Sobreviva até a maioria. Não recebe os Fatos. Tente descobrir o segredo e se misturar. **Sempre há pelo menos 2 Espiões.**</li>
                <li><span className="text-purple-500 font-semibold">Agente Triplo:</span> Aparece como Espião para os outros, mas conhece o segredo e vence com os Agentes. **Aparece a partir de 7 jogadores.**</li>
                <li><span className="text-yellow-500 font-semibold">O Tolo:</span> Vence se for eliminado! Seu objetivo é agir de forma suspeita e atraia votos. **Aparece a partir de 7 jogadores.**</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                As Missões
              </h3>
              <p className="text-muted-foreground">
Em cada rodada, uma missão é apresentada. Agentes conhecem o segredo (Palavra, Local, Código, etc.), enquanto os Espiões precisam blefar usando apenas as dicas públicas e o contexto da discussão. O objetivo dos Agentes é identificar o Espião, e o do Espião é não ser descoberto.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Habilidades Especiais
              </h3>
              <p className="text-muted-foreground">
Cada jogador recebe uma habilidade única que pode usar uma vez por partida (ex: Espiar Voto, Trocar Voto, Tempo Extra). Use estrategicamente para descobrir espiões, manipular a votação ou se proteger da eliminação. As habilidades são reveladas apenas ao jogador que as possui.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Fluxo do Jogo
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
<li>**Início:** Cada jogador recebe seu papel. Agentes recebem **3 Fatos Secretos** (Palavra, Local, etc.) e devem deduzir qual é o correto. Espiões não recebem nenhum Fato.</li>
                        <li>**Missão:** A missão da rodada é revelada. Pode ser uma Palavra Chave, um Desenho Secreto, um Ranking Secreto (com emojis) ou uma Explicação.</li>
                        <li>**Discussão/Interação:** Os jogadores interagem de acordo com a missão (ex: desenhando, discutindo, ordenando). Agentes tentam confirmar o Fato Secreto, Espiões tentam blefar.</li>
                        <li>**Votação:** Todos votam secretamente em quem acham que é o Espião. O Tolo tem um voto negativo que pode salvar alguém.</li>
                        <li>**Eliminação:** O jogador mais votado é eliminado. Se for o Tolo, ele vence. Se for um Espião, os Agentes se aproximam da vitória.</li>
                        <li>**Fim:** O jogo termina se todos os Espiões forem eliminados (vitória dos Agentes) ou se o número de Espiões for igual ou maior que o de Agentes (vitória dos Espiões). O Tolo vence se for eliminado.</li>
              </ol>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

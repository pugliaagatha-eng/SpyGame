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
  onSelectMode: (mode: 'local' | 'online') => void;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mb-8">
        <Card 
          className="neon-border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          onClick={() => onSelectMode('online')}
          data-testid="button-mode-online"
        >
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-2">ONLINE</h2>
            <p className="text-muted-foreground text-sm">
              Crie ou entre em uma sala virtual com jogadores remotos
            </p>
          </CardContent>
        </Card>

        <Card 
          className="neon-border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          onClick={() => onSelectMode('local')}
          data-testid="button-mode-local"
        >
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-secondary mb-2">LOCAL</h2>}],path:
            <p className="text-muted-foreground text-sm">
              Jogue no mesmo dispositivo passando para cada jogador
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
                <li><span className="text-cyan-400 font-semibold">Agente:</span> Elimine os Espiões. Recebe os Fatos Secretos.</li>
                <li><span className="text-red-500 font-semibold">Espião:</span> Sobreviva até a maioria. Não recebe os Fatos.</li>
                <li><span className="text-purple-500 font-semibold">Agente Triplo:</span> Agente que aparece como Espião.</li>
                <li><span className="text-yellow-500 font-semibold">O Tolo:</span> Vence se for eliminado!</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                As Missões
              </h3>
              <p className="text-muted-foreground">
                Em cada rodada, uma missão é apresentada. Agentes conhecem o segredo,
                Espiões precisam blefar usando as dicas públicas.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Habilidades Especiais
              </h3>
              <p className="text-muted-foreground">
                Cada jogador recebe uma habilidade única que pode usar uma vez por partida.
                Use estrategicamente para descobrir espiões ou se proteger!
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Fluxo do Jogo
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Discussão sobre a missão (1:30)</li>
                <li>Votação secreta</li>
                <li>Jogador mais votado é eliminado</li>
                <li>3 rodadas no total</li>
              </ol>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

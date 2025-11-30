# SpyGamePlus - Instalação e Configuração

## 📦 Conteúdo do Pacote

Este pacote contém o código completo e corrigido do SpyGamePlus com:

✅ **8 habilidades únicas** (incluindo Shield corrigido)  
✅ **150+ missões** de diversos tipos  
✅ **Sistema de votação** com detecção de empates  
✅ **Canvas de desenho** interativo  
✅ **WebSocket** para sincronização em tempo real  
✅ **Sistema de áudio** com música e efeitos  
✅ **Reconexão automática** para jogadores  
✅ **Todas as correções aplicadas** (ver CHANGELOG.md)

---

## 🚀 Instalação Local (Para Desenvolvimento)

### Pré-requisitos

- Node.js 18+ instalado
- npm ou pnpm instalado

### Passos

1. **Extrair o arquivo ZIP**
   ```bash
   unzip SpyGamePlus_Corrigido.zip
   cd SpyGamePlus_Fixed
   ```

2. **Instalar dependências**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Iniciar servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

4. **Acessar o jogo**
   - Abra o navegador em: `http://localhost:5000`
   - Ou a porta indicada no terminal

---

## 🌐 Deploy em Produção

Veja o arquivo **GUIA_HOSPEDAGEM.md** para instruções detalhadas de deploy em:
- Railway (recomendado)
- Render
- Fly.io

---

## 📁 Estrutura do Projeto

```
SpyGamePlus_Fixed/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes do jogo
│   │   │   ├── game/     # Componentes principais
│   │   │   │   ├── SpyGame.tsx           # Componente raiz
│   │   │   │   ├── AbilityPanel.tsx      # Painel de habilidades
│   │   │   │   ├── DrawingCanvas.tsx     # Canvas de desenho
│   │   │   │   ├── VotingPhase.tsx       # Fase de votação
│   │   │   │   └── ...
│   │   │   └── ui/       # Componentes UI (shadcn)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilitários
│   │   └── pages/        # Páginas (se houver)
│   └── public/           # Assets estáticos
│       ├── neon-fury-*.mp3      # Música de fundo
│       └── you-win-*.mp3        # Som de vitória
│
├── server/               # Backend Node.js
│   ├── index.ts         # Servidor principal
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Lógica de armazenamento (CORRIGIDO)
│   ├── websocket.ts     # WebSocket handler
│   └── ...
│
├── shared/              # Código compartilhado
│   └── schema.ts        # Tipos e constantes (CORRIGIDO)
│
├── CHANGELOG.md         # Lista de correções aplicadas
├── package.json         # Dependências
└── vite.config.ts       # Configuração do Vite
```

---

## 🎮 Como Jogar

### 1. Criar Sala
- Clique em "Criar Sala"
- Digite seu nome
- Compartilhe o código de 6 dígitos com amigos

### 2. Entrar em Sala
- Clique em "Entrar em Sala"
- Digite o código da sala
- Digite seu nome

### 3. Iniciar Jogo
- Aguarde pelo menos 3 jogadores
- Host clica em "Iniciar Jogo"

### 4. Fases do Jogo
1. **Revelação de Papel**: Veja seu papel secreto
2. **Missão**: Veja a missão (Agentes sabem o segredo, Espiões não)
3. **Desenho** (se missão for desenho): Todos desenham
4. **Discussão**: Converse e identifique suspeitos
5. **Votação**: Vote para eliminar alguém
6. **Resultado**: Veja quem foi eliminado

### 5. Condições de Vitória
- **Agentes**: Eliminam todos os espiões
- **Espiões**: Conseguem maioria absoluta
- **Jester**: É eliminado

---

## 🛠️ Correções Aplicadas

Este código inclui as seguintes correções em relação à versão original:

### 1. Habilidade Shield
- ✅ Agora é atribuída aos jogadores (10% de chance)
- ✅ Protege da eliminação durante votação
- ✅ Implementada na contagem de votos

### 2. Condição de Vitória
- ✅ Espiões precisam de maioria absoluta (não apenas empate)
- ✅ Jogo mais balanceado

### 3. Swap Vote
- ✅ Validação de fase adicionada
- ✅ Funciona apenas durante votação
- ✅ Melhor feedback

### 4. Forensic Investigation
- ✅ Mensagem clara na primeira rodada
- ✅ Validação de votos anteriores

Veja **CHANGELOG.md** para detalhes completos.

---

## 🎨 Personalização

### Alterar Cores/Tema
Edite: `client/src/index.css`

### Adicionar Missões
Edite: `shared/schema.ts` → array `MISSIONS`

### Ajustar Regras
Edite: `server/storage.ts` → funções de lógica do jogo

### Alterar Áudio
Substitua arquivos em: `client/public/`

---

## 🐛 Problemas Conhecidos

1. **Salas são perdidas ao reiniciar servidor**
   - Normal para armazenamento em memória
   - Adicione banco de dados para persistência

2. **Cold starts em hospedagem gratuita**
   - Render hiberna após 15 minutos
   - Use Railway para evitar

3. **Limite de jogadores**
   - Máximo 10 jogadores por sala (configurável)
   - Edite `maxPlayers` em `server/storage.ts`

---

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do servidor
2. Teste em modo de desenvolvimento local
3. Consulte GUIA_HOSPEDAGEM.md para deploy

---

## 📄 Licença

MIT License - Livre para uso pessoal e comercial

---

## 🎉 Divirta-se!

Agora você tem um jogo multiplayer completo e funcional. Boa sorte identificando os espiões! 🕵️‍♂️

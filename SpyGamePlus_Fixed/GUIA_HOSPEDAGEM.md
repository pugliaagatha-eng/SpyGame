# Guia de Hospedagem - SpyGamePlus

## 🏆 Melhor Opção: Railway

**Railway** é a melhor escolha para este projeto por oferecer suporte nativo e robusto para WebSocket, além de configuração simples.

### Por que Railway?

**Vantagens:**
- ✅ Suporte nativo a WebSocket (essencial para o jogo)
- ✅ Deploy automático via Git
- ✅ Variáveis de ambiente fáceis de configurar
- ✅ SSL/HTTPS gratuito
- ✅ Logs em tempo real
- ✅ Escalabilidade automática
- ✅ $5 de crédito gratuito por mês
- ✅ Não hiberna como Replit

**Desvantagens:**
- ⚠️ Após crédito gratuito, custa ~$5-10/mês
- ⚠️ Requer cartão de crédito

### Como fazer deploy no Railway:

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Criar novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório (ou faça upload do código)

3. **Configurar variáveis de ambiente**
   - No painel do Railway, vá em "Variables"
   - Adicione apenas se necessário (o jogo funciona sem banco de dados)

4. **Deploy automático**
   - Railway detecta automaticamente Node.js
   - Usa os scripts do `package.json`
   - Deploy acontece automaticamente

5. **Acessar o jogo**
   - Railway fornece URL pública automaticamente
   - Exemplo: `https://spygameplus-production.up.railway.app`

---

## 🥈 Alternativa 1: Render

**Render** é uma ótima alternativa gratuita, mas com algumas limitações.

### Vantagens:
- ✅ Plano gratuito generoso
- ✅ Suporte a WebSocket
- ✅ SSL/HTTPS gratuito
- ✅ Deploy via Git
- ✅ Não requer cartão de crédito

### Desvantagens:
- ⚠️ **Cold starts**: serviço hiberna após 15 minutos de inatividade
- ⚠️ Primeira requisição após hibernação leva ~30 segundos
- ⚠️ Pode causar desconexões de WebSocket

### Como fazer deploy no Render:

1. **Criar conta no Render**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Criar Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub

3. **Configurar serviço**
   - **Name**: spygameplus
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o deploy (5-10 minutos)

---

## 🥉 Alternativa 2: Fly.io

**Fly.io** oferece excelente performance e distribuição global.

### Vantagens:
- ✅ Excelente para WebSocket
- ✅ Distribuição global (baixa latência)
- ✅ Plano gratuito até 3 máquinas
- ✅ Não hiberna

### Desvantagens:
- ⚠️ Configuração mais técnica (requer CLI)
- ⚠️ Requer cartão de crédito

### Como fazer deploy no Fly.io:

1. **Instalar Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Inicializar app**
   ```bash
   cd SpyGamePlus_Fixed
   flyctl launch
   ```

4. **Deploy**
   ```bash
   flyctl deploy
   ```

---

## ❌ Não Recomendado

### Vercel / Netlify
- ❌ Não suportam WebSocket persistente
- ❌ Serverless não funciona para jogos em tempo real
- ❌ Não mantém estado em memória

### Heroku
- ❌ Plano gratuito foi descontinuado
- ❌ Muito caro para projetos pequenos ($7/mês mínimo)

---

## 📊 Comparação Rápida

| Serviço | Custo | WebSocket | Cold Start | Facilidade |
|---------|-------|-----------|------------|------------|
| **Railway** | $5/mês após crédito | ✅ Excelente | ❌ Não | ⭐⭐⭐⭐⭐ |
| **Render** | Gratuito | ✅ Bom | ⚠️ Sim (15min) | ⭐⭐⭐⭐ |
| **Fly.io** | Gratuito até 3 VMs | ✅ Excelente | ❌ Não | ⭐⭐⭐ |

---

## 🎯 Recomendação Final

### Para uso pessoal/teste:
**Render** (gratuito, mas com cold starts)

### Para uso profissional/produção:
**Railway** ($5-10/mês, sem cold starts, melhor experiência)

### Para máxima performance:
**Fly.io** (gratuito até 3 VMs, distribuição global)

---

## 📝 Notas Importantes

1. **Banco de Dados**: O jogo atual usa armazenamento em memória, o que significa que as salas são perdidas quando o servidor reinicia. Isso é normal para jogos casuais.

2. **Persistência**: Se quiser que as salas persistam entre reinicializações, você precisará adicionar um banco de dados (PostgreSQL, MongoDB, etc).

3. **Escalabilidade**: Para mais de 50 jogadores simultâneos, considere adicionar Redis para gerenciar WebSocket em múltiplas instâncias.

4. **Monitoramento**: Todos os serviços oferecem logs em tempo real. Use-os para debugar problemas.

---

## 🚀 Próximos Passos

1. Escolha uma plataforma (recomendo Railway)
2. Crie conta e conecte repositório
3. Configure variáveis de ambiente (se necessário)
4. Faça deploy
5. Teste o jogo
6. Compartilhe o link com amigos!

---

## 🆘 Suporte

Se tiver problemas:
- Railway: https://railway.app/help
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs

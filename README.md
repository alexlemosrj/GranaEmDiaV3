# 💰 GranaEmDiaV3 - Controle Financeiro Pessoal

> **Versão 3.0.0** - Multi-login corrigido e funcionalidades 100% funcionais

Um aplicativo moderno de controle financeiro pessoal construído com React, TypeScript, Tailwind CSS e Supabase, com suporte completo a múltiplos usuários e sincronização em tempo real.

## 🎉 Novidades da V3

- ✅ **Multi-login 100% funcional** - Dados isolados por usuário
- ✅ **Detecção automática de mudança de usuário** - Limpa dados automaticamente
- ✅ **Metas corrigidas** - Depósito rápido e edição funcionando perfeitamente
- ✅ **Subscriptions otimizadas** - Isoladas por user_id
- ✅ **Persistência inteligente** - localStorage gerenciado corretamente
- ✅ **Bugs corrigidos** - Relatorios.tsx e outras correções

## ✨ Funcionalidades

- **Dashboard Interativo**: Visão geral completa das finanças com gráficos em tempo real
- **Gestão de Transações**: Adicionar, editar e categorizar receitas/despesas
- **Metas Financeiras**: Criar e acompanhar objetivos de economia com progresso visual
- **Agenda Financeira**: Calendário com eventos e lembretes financeiros
- **Relatórios Detalhados**: Análises mensais e anuais com exportação
- **Perfil Personalizável**: Avatar, nome e configurações pessoais
- **Agente de Voz**: Comandos de voz com ElevenLabs (opcional)
- **Modo Offline**: Funciona sem banco de dados para desenvolvimento

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animações**: Framer Motion
- **Gráficos**: Chart.js + React Chart.js 2 + Recharts
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Estado**: Zustand + Persist
- **Roteamento**: React Router DOM
- **Deploy**: Vercel

## 📦 Instalação Rápida

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase (opcional)

### 1. Clone e instale
```bash
git clone https://github.com/seu-usuario/grana-em-dia-v2.git
cd grana-em-dia-v2
npm install
```

### 2. Configure variáveis (opcional)
```bash
cp .env.example .env.local
# Edite o .env.local com suas credenciais
```

### 3. Execute
```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🌐 Deploy no Vercel

### Deploy Automático via GitHub

1. **Conecte seu repositório**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório GitHub

2. **Configure variáveis de ambiente**:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   VITE_ELEVENLABS_AGENT_ID=seu-agent-id (opcional)
   ```

3. **Deploy**:
   - O Vercel detecta automaticamente as configurações
   - Clique em "Deploy"

### Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy do projeto
vercel --prod
```

### Configurações do Vercel

O projeto já inclui `vercel.json` configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🔧 Configuração do Supabase

### 1. Criar Projeto
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote URL e chave anônima

### 2. Executar Migrations
```sql
-- Execute os arquivos em supabase/migrations/
-- 001_initial_schema.sql
-- 002_enable_realtime.sql
```

### 3. Configurar RLS (Row Level Security)
As tabelas já vêm com RLS configurado para isolamento por usuário.

## 🛠️ Modo Desenvolvimento

### Sem Supabase (Offline)
O projeto funciona completamente offline com dados mock:
- Login simulado automático
- Dados de exemplo carregados
- Todas as funcionalidades ativas

### Com Supabase
Configure as variáveis de ambiente e obtenha:
- Autenticação real
- Persistência de dados
- Sincronização em tempo real

## 🌐 Deploy na Vercel

### Configuração de Variáveis de Ambiente na Vercel

1. Acesse o dashboard da Vercel
2. Selecione seu projeto
3. Vá para "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL` (ex: https://seu-projeto.supabase.co)
   - `VITE_SUPABASE_ANON_KEY` (sua chave anônima do Supabase)

### Solução de Problemas Comuns

Se encontrar erros durante o deploy:

1. **Erro de build**: Verifique se todas as dependências estão instaladas corretamente
2. **Erro de roteamento**: Certifique-se de que o arquivo vercel.json está configurado corretamente
3. **Erro de conexão com Supabase**: Verifique se as variáveis de ambiente estão configuradas corretamente

## 🔧 Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview build
npm run lint     # Linting
```

## 📄 Licença

MIT License
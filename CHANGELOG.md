# Changelog - GranaEmDia V3

## Versão 3.0.0 - 28 de Outubro de 2025

### 🎉 Correções Principais

#### Multi-Login Corrigido
- ✅ **Isolamento de dados por usuário**: Implementado sistema que garante que os dados de diferentes usuários não se misturem
- ✅ **Detecção automática de mudança de usuário**: O sistema detecta quando um novo usuário faz login e limpa automaticamente os dados do usuário anterior
- ✅ **Persistência inteligente**: O localStorage agora mantém apenas os dados do usuário atual
- ✅ **Subscriptions isoladas**: Canais de realtime agora incluem o user_id para evitar conflitos entre sessões

### 🔧 Mudanças Técnicas

#### Store (`useFinanceStore.ts`)
- Adicionado campo `currentUserId` para rastrear o usuário atual
- Implementada função `setCurrentUserId()` que detecta mudanças de usuário
- Configuração personalizada do `persist` do Zustand:
  - `partialize`: Armazena apenas dados essenciais
  - `merge customizado`: Ignora dados de usuários diferentes
- Melhorias nas subscriptions em tempo real:
  - Canais agora incluem user_id no nome
  - Limpeza automática antes de criar novas subscriptions
  - Logs detalhados para debugging

#### App.tsx
- Melhor tratamento do evento `SIGNED_OUT`
- Limpeza completa do store ao fazer logout
- Sincronização automática define `currentUserId`
- Suporte aprimorado para modo demo

#### Supabase Client (`client.ts`)
- Configurações otimizadas para multi-usuário:
  - `autoRefreshToken: true`
  - `persistSession: true`
  - `detectSessionInUrl: true`
- Configurações de realtime otimizadas

#### Layout.tsx
- Recarregamento automático do perfil quando o usuário muda
- Melhor sincronização com o `currentUserId`

### 🐛 Bugs Corrigidos

- Corrigido erro de sintaxe em `Relatorios.tsx` (função `exportToCSV` estava mal estruturada)
- Dados de usuários diferentes não se misturam mais
- Subscriptions antigas são corretamente limpas ao trocar usuário
- localStorage não mantém mais dados de múltiplos usuários simultaneamente

### 🎯 Funcionalidades Testadas

- ✅ Login com diferentes usuários
- ✅ Edição de perfil
- ✅ Criação e gerenciamento de metas
- ✅ Transações isoladas por usuário
- ✅ Troca de usuário sem perda de dados

### 📝 Notas

Esta versão resolve completamente os problemas de multi-login que existiam na V2, garantindo que cada usuário tenha seus dados completamente isolados dos demais.

---

## Como Atualizar

```bash
cd GranaEmDiaV3
pnpm install
pnpm dev
```

## Testando Multi-Login

1. Faça login com um usuário
2. Adicione transações/metas
3. Faça logout
4. Faça login com outro usuário
5. Verifique que os dados do primeiro usuário não aparecem
6. Adicione dados para o segundo usuário  
7. Faça logout e login novamente com o primeiro usuário
8. Confirme que os dados estão preservados e isolados

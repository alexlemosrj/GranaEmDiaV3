# Guia de Deploy na Vercel para GranaEmDiaV2

Este guia vai te ajudar a fazer o deploy do GranaEmDiaV2 na Vercel de forma rápida e sem erros.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com) (opcional, mas recomendado)
- Repositório Git (GitHub, GitLab ou Bitbucket)

## Passo 1: Preparar o Projeto

1. Certifique-se de que seu código está em um repositório Git
2. Verifique se o arquivo `vercel.json` está na raiz do projeto
3. Verifique se o arquivo `.env.example` está atualizado

## Passo 2: Deploy na Vercel

### Método 1: Deploy Automático (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New" > "Project"
3. Importe seu repositório Git
4. Configure o projeto:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Expanda a seção "Environment Variables" e adicione:
   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase (ex: https://seu-projeto.supabase.co)
   - `VITE_SUPABASE_ANON_KEY` = Chave anônima do seu projeto Supabase
6. Clique em "Deploy"

### Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Quando solicitado, configure as variáveis de ambiente:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Deploy para produção
vercel --prod
```

## Passo 3: Configurar Supabase (Opcional)

Se você estiver usando o Supabase, configure:

1. No Supabase, vá para Authentication > URL Configuration
2. Adicione seu domínio Vercel (ex: https://seu-app.vercel.app) como Site URL
3. Adicione URLs de redirecionamento se necessário

## Solução de Problemas Comuns

### Erro: "Build failed"

Possíveis causas e soluções:

1. **Dependências faltando**:
   - Verifique se todas as dependências estão no package.json
   - Tente adicionar `--legacy-peer-deps` ao comando de instalação

2. **Variáveis de ambiente**:
   - Verifique se todas as variáveis de ambiente necessárias estão configuradas
   - Certifique-se de que os nomes das variáveis estão corretos (VITE_*)

3. **Erros de TypeScript**:
   - Verifique se há erros de tipo no seu código
   - Tente adicionar `// @ts-ignore` temporariamente para identificar o problema

### Erro: "Page not found" após navegação

Causa: O roteamento do lado do cliente não está funcionando corretamente com a Vercel.

Solução: Verifique se o arquivo `vercel.json` está configurado corretamente com os rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Erro: "Cannot connect to Supabase"

Causas possíveis:

1. Variáveis de ambiente incorretas
2. Restrições de CORS no Supabase
3. Projeto Supabase pausado ou inativo

Soluções:

1. Verifique as variáveis de ambiente na Vercel
2. No Supabase, vá para Authentication > URL Configuration e adicione seu domínio
3. Verifique se seu projeto Supabase está ativo

## Verificação Pós-Deploy

Após o deploy, verifique:

1. Se a página inicial carrega corretamente
2. Se a navegação entre páginas funciona
3. Se o login/registro funciona (se aplicável)
4. Se os dados são carregados corretamente do Supabase

## Recursos Adicionais

- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Troubleshooting do Vite](https://vitejs.dev/guide/troubleshooting.html)
# 🚀 Guia de Deploy - GranaEmDiaV2

## 📋 Pré-requisitos

- Conta no GitHub
- Conta na Vercel
- Node.js 18+ instalado
- Git configurado

## 🔧 Preparação para VS Code

### 1. Extensões Recomendadas
Instale essas extensões no VS Code:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag
- Prettier - Code formatter
- GitLens

### 2. Configuração do Workspace
Crie `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 📤 Upload para GitHub

### 1. Criar Repositório
```bash
# No terminal do VS Code
git init
git add .
git commit -m "🎉 Initial commit - GranaEmDiaV2"

# Criar repositório no GitHub com nome: GranaEmDiaV2
git remote add origin https://github.com/SEU-USUARIO/GranaEmDiaV2.git
git branch -M main
git push -u origin main
```

### 2. Estrutura de Branches
```bash
# Branch principal
git checkout -b main

# Branch de desenvolvimento
git checkout -b develop

# Para features
git checkout -b feature/nome-da-feature
```

## 🌐 Deploy na Vercel

### Método 1: Deploy Automático (Recomendado)

1. **Acesse**: [vercel.com](https://vercel.com)
2. **Login** com GitHub
3. **Import Project** → Selecione `GranaEmDiaV2`
4. **Configure**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Configurar Variáveis de Ambiente

Na dashboard da Vercel:
1. **Settings** → **Environment Variables**
2. Adicionar (opcional):
   ```
   VITE_SUPABASE_URL = https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY = sua-chave-aqui
   ```

## 🔧 Configuração do Supabase (Opcional)

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. **New Project**
3. Anote URL e chave anônima

### 2. Configurar Banco
Execute o SQL do arquivo `SUPABASE_SETUP.md`

### 3. Configurar Auth
- **Authentication** → **Settings**
- **Site URL**: `https://seu-app.vercel.app`
- **Redirect URLs**: Adicionar URLs necessárias

## 📊 Monitoramento

### Vercel Analytics
```bash
npm i @vercel/analytics
```

Adicionar em `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// No final do JSX
<Analytics />
```

### Performance
- **Core Web Vitals** automático
- **Real User Monitoring**
- **Error Tracking**

## 🔄 Workflow de Desenvolvimento

### 1. Desenvolvimento Local
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# Desenvolver...

git add .
git commit -m "✨ feat: nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 2. Pull Request
1. Criar PR para `develop`
2. Review de código
3. Merge após aprovação

### 3. Deploy para Produção
```bash
git checkout main
git merge develop
git push origin main
# Deploy automático na Vercel
```

## 🚨 Troubleshooting

### Build Errors
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Build local
npm run build
npm run preview
```

### Vercel Issues
- Verificar logs na dashboard
- Conferir variáveis de ambiente
- Validar `vercel.json`

### Supabase Connection
- Verificar URLs e chaves
- Testar conexão local
- Conferir RLS policies

## 📈 Próximos Passos

1. **Custom Domain**: Configurar domínio próprio
2. **CI/CD**: GitHub Actions para testes
3. **Monitoring**: Sentry para error tracking
4. **SEO**: Meta tags e sitemap
5. **PWA**: Service worker para offline

## 🎯 URLs Importantes

- **Repositório**: `https://github.com/SEU-USUARIO/GranaEmDiaV2`
- **Deploy**: `https://grana-em-dia-v2.vercel.app`
- **Supabase**: `https://app.supabase.com/project/SEU-PROJETO`

---

**Sucesso!** 🎉 Seu app está no ar!
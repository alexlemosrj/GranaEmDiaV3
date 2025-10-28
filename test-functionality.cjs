#!/usr/bin/env node

/**
 * Script de teste para verificar as funcionalidades implementadas
 */

console.log('🧪 Testando funcionalidades do GranaEmDiaV2...\n');

// Teste 1: Verificar se o favicon foi criado
const fs = require('fs');
const path = require('path');

try {
  const faviconPath = path.join(__dirname, 'public', 'favicon.svg');
  if (fs.existsSync(faviconPath)) {
    console.log('✅ Favicon criado com sucesso');
  } else {
    console.log('❌ Favicon não encontrado');
  }
} catch (error) {
  console.log('❌ Erro ao verificar favicon:', error.message);
}

// Teste 2: Verificar se as migrações existem
try {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const migrations = fs.readdirSync(migrationsDir);
  
  console.log(`✅ Migrações encontradas: ${migrations.length}`);
  migrations.forEach(migration => {
    console.log(`   - ${migration}`);
  });
} catch (error) {
  console.log('❌ Erro ao verificar migrações:', error.message);
}

// Teste 3: Verificar se o store foi modificado
try {
  const storePath = path.join(__dirname, 'src', 'store', 'useFinanceStore.ts');
  const storeContent = fs.readFileSync(storePath, 'utf8');
  
  if (storeContent.includes('getInitialState')) {
    console.log('✅ Store modificado para valores iniciais dinâmicos');
  } else {
    console.log('❌ Store não foi modificado corretamente');
  }
  
  if (storeContent.includes('profilesSubscription')) {
    console.log('✅ Subscription para profiles adicionada');
  } else {
    console.log('❌ Subscription para profiles não encontrada');
  }
} catch (error) {
  console.log('❌ Erro ao verificar store:', error.message);
}

// Teste 4: Verificar se o Login foi modificado
try {
  const loginPath = path.join(__dirname, 'src', 'pages', 'Login.tsx');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  
  if (loginContent.includes('existingProfile')) {
    console.log('✅ Login modificado para criar perfil automaticamente');
  } else {
    console.log('❌ Login não foi modificado corretamente');
  }
} catch (error) {
  console.log('❌ Erro ao verificar Login:', error.message);
}

// Teste 5: Verificar se o Layout foi modificado
try {
  const layoutPath = path.join(__dirname, 'src', 'components', 'Layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('onProfileUpdated')) {
    console.log('✅ Layout modificado para atualizar perfil');
  } else {
    console.log('❌ Layout não foi modificado corretamente');
  }
} catch (error) {
  console.log('❌ Erro ao verificar Layout:', error.message);
}

console.log('\n🎉 Testes concluídos!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute as migrações no Supabase Dashboard');
console.log('2. Teste a criação de nova conta');
console.log('3. Verifique se os valores iniciais estão zerados');
console.log('4. Teste a atualização do perfil');
console.log('5. Verifique se as funcionalidades em tempo real estão funcionando');
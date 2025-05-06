/**
 * Script para testar a conexão com a API do Stripe
 * Você pode executar este script usando sua chave de API:
 * node scripts/test-stripe.js sk_test_sua_chave_aqui
 */

// Obter a chave do Stripe a partir de argumentos da linha de comando
const stripeKey = process.argv[2];

if (!stripeKey) {
  console.error('❌ Erro: Chave do Stripe não fornecida!');
  console.log('Uso: node scripts/test-stripe.js SUA_CHAVE_STRIPE');
  process.exit(1);
}

// Inicializar Stripe com a chave fornecida
console.log('Inicializando Stripe...');
const stripe = require('stripe')(stripeKey);

async function testStripeAPI() {
  try {
    console.log('\n🔍 Testando conexão com a API do Stripe...');

    // Teste 1: Buscar configuração da conta
    try {
      console.log('\n📋 Teste 1: Buscando detalhes da conta...');
      const account = await stripe.accounts.retrieve();
      console.log('✅ Conta Stripe conectada com sucesso!');
      console.log(`   ID da conta: ${account.id}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   País: ${account.country}`);
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da conta:', error.message);
    }

    // Teste 2: Listar produtos
    try {
      console.log('\n📋 Teste 2: Listando produtos...');
      const products = await stripe.products.list({ limit: 5 });
      console.log(`✅ ${products.data.length} produtos encontrados`);

      if (products.data.length > 0) {
        console.log('   Produtos:');
        products.data.forEach((product) => {
          console.log(`   - ${product.id}: ${product.name}`);
        });
      } else {
        console.log('   Nenhum produto encontrado. Criando um produto de teste...');

        // Criar um produto de teste
        const newProduct = await stripe.products.create({
          name: 'Produto de Teste',
          description: 'Criado através do script de teste',
        });

        console.log('   ✅ Produto de teste criado com sucesso!');
        console.log(`   - ${newProduct.id}: ${newProduct.name}`);
      }
    } catch (error) {
      console.error('❌ Erro ao listar produtos:', error.message);
    }

    // Teste 3: Verificar webhooks configurados
    try {
      console.log('\n📋 Teste 3: Verificando webhooks...');
      const webhooks = await stripe.webhookEndpoints.list();
      console.log(`✅ ${webhooks.data.length} webhooks encontrados`);

      if (webhooks.data.length > 0) {
        console.log('   Webhooks:');
        webhooks.data.forEach((webhook) => {
          console.log(
            `   - ${webhook.id}: ${webhook.url} (Eventos: ${webhook.enabled_events.length})`
          );
        });
      } else {
        console.log('   Nenhum webhook configurado.');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar webhooks:', error.message);
    }

    console.log('\n🎉 Testes concluídos!');
    console.log('A conexão com a API do Stripe está funcionando corretamente.');
  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
  }
}

// Executar o teste
console.log('=============================================');
console.log('🔐 TESTE DE CONEXÃO COM A API DO STRIPE');
console.log('=============================================');
testStripeAPI().then(() => {
  console.log('\n✨ Teste finalizado!');
});

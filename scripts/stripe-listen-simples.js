/**
 * Script para simular o comando 'stripe listen' sem a CLI do Stripe
 * Versão simplificada usando apenas módulos nativos do Node.js
 */

const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');

// Configurações
const PORT = 4242;
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/webhook'; // Ajuste para seu endpoint
const SECRET_KEY = process.argv[2]; // Passe sua chave secreta do Stripe como argumento

// Verificar se a chave foi fornecida
if (!SECRET_KEY) {
  console.error('❌ Erro: Chave do Stripe não fornecida!');
  console.log('Uso: node scripts/stripe-listen-simples.js SUA_CHAVE_STRIPE');
  process.exit(1);
}

// Inicializar o Stripe
const stripe = require('stripe')(SECRET_KEY);

// Gerar um webhook signing secret para verificação local
const WEBHOOK_SECRET = crypto.randomBytes(32).toString('hex');

// Função para enviar requisição para o webhook local
function forwardToLocalWebhook(event) {
  return new Promise((resolve, reject) => {
    // Preparar dados para o webhook local
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify(event);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Parsear URL local
    const parsedUrl = new URL(LOCAL_WEBHOOK_URL);

    // Configurar opções da requisição
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 3000,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Stripe-Signature': `t=${timestamp},v1=${signature}`,
      },
    };

    // Escolher http ou https com base na URL
    const client = parsedUrl.protocol.startsWith('https') ? https : http;

    // Enviar a requisição
    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Evento encaminhado para ${LOCAL_WEBHOOK_URL}`);
        console.log(`   Resposta: ${res.statusCode}`);
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erro ao encaminhar evento: ${error.message}`);
      reject(error);
    });

    // Enviar o payload
    req.write(payload);
    req.end();
  });
}

// Criar servidor HTTP para receber eventos do Stripe
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        console.log(`🔔 Evento recebido: ${event.type}`);

        // Encaminhar para o webhook local
        await forwardToLocalWebhook(event);

        // Responder ao Stripe
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      } catch (error) {
        console.error(`❌ Erro ao processar evento: ${error.message}`);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/') {
    // Página inicial para teste
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Simulador do Stripe Listen</title></head>
        <body>
          <h1>Simulador do Stripe Listen</h1>
          <p>O servidor está funcionando e pronto para encaminhar eventos para ${LOCAL_WEBHOOK_URL}</p>
          <p>Webhook signing secret: ${WEBHOOK_SECRET}</p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Iniciar o servidor
server.listen(PORT, async () => {
  console.log('=============================================');
  console.log('🚀 SIMULADOR DO STRIPE LISTEN (SIMPLES)');
  console.log('=============================================');
  console.log(`✅ Servidor iniciado na porta ${PORT}`);
  console.log(`✅ Encaminhando eventos para: ${LOCAL_WEBHOOK_URL}`);
  console.log(`✅ Webhook signing secret: ${WEBHOOK_SECRET}`);
  console.log('\n⚠️ IMPORTANTE: Você precisa configurar esse signing secret no seu código!');
  console.log('\n📋 Para testar, você pode enviar eventos de teste:');
  console.log('   node scripts/test-webhook.js');

  // Verificar a conexão com o Stripe
  try {
    const account = await stripe.accounts.retrieve();
    console.log(`\n✅ Conectado à conta Stripe: ${account.id} (${account.email})`);
  } catch (error) {
    console.error(`\n❌ Erro ao conectar com o Stripe: ${error.message}`);
  }

  console.log('\n📌 URL para receber eventos do Stripe:');
  console.log(`   http://localhost:${PORT}/webhook`);
  console.log('\n🔍 Aguardando eventos... (Ctrl+C para sair)');
});

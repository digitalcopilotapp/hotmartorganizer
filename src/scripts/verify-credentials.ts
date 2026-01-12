import { BrevoService } from '../services/brevoService.js';
import { AIService } from '../services/aiService.js';
import dotenv from 'dotenv';

dotenv.config();

async function verify() {
  console.log('--- Verificando Credenciais ---');

  // 1. Verificar Brevo
  console.log('\n[1/2] Testando conexão com Brevo...');
  const brevoService = new BrevoService();
  try {
    // Tenta buscar um contato que provavelmente não existe apenas para testar autenticação
    await brevoService.getContact('teste_conexao@exemplo.com');
    console.log('✅ Brevo: Autenticação OK (API respondeu corretamente)');
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.error('❌ Brevo: Falha de Autenticação (API Key inválida?)');
    } else if (error.response && error.response.status === 404) {
      console.log('✅ Brevo: Autenticação OK (Retornou 404 como esperado para email inexistente)');
    } else {
      console.error('⚠️ Brevo: Erro inesperado:', error.message);
    }
  }

  // 2. Verificar OpenRouter
  console.log('\n[2/2] Testando conexão com OpenRouter...');
  const aiService = new AIService();
  try {
    const result = await aiService.analyzeLead({
      event: 'TEST_CONNECTION',
      data: {
        product: { name: 'Teste', id: 123, ucode: 'abc', has_co_production: false },
        purchase: { 
            price: { value: 100, currency_value: 'BRL' }, 
            status: 'APPROVED', 
            order_date: Date.now(),
            approved_date: Date.now(),
            full_price: { value: 100, currency_value: 'BRL' },
            checkout_country: { name: 'Brazil', iso: 'BR' },
            transaction: 'TX-123',
            payment: { type: 'CREDIT_CARD', method: 'CREDIT_CARD', installments_number: 1 }
        },
        buyer: { name: 'Tester', email: 'test@example.com' },
        producer: { name: 'Producer', email: 'producer@example.com' }
      }
    } as any);
    
    if (result && result.summary) {
        console.log('✅ OpenRouter: Autenticação e Geração OK');
        console.log('   Resposta AI:', result.summary);
    } else {
        console.error('❌ OpenRouter: Falha (Resposta vazia ou inválida)');
    }
  } catch (error: any) {
    console.error('❌ OpenRouter: Erro ao conectar:', error.message);
  }
}

verify();

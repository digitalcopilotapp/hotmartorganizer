import OpenAI from 'openai';
import { config } from '../config/env.js';
import type { HotmartWebhookEvent } from '../types/hotmart.js';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: config.openRouterApiKey,
    });
  }

  async analyzeLead(event: HotmartWebhookEvent): Promise<{
    tags: string[];
    sentiment: string;
    suggestedAction: string;
    dealStage: string;
    summary: string;
  }> {
    const prompt = `
      Você é um especialista em CRM e análise de vendas.
      Analise os dados da seguinte venda da Hotmart e sugira como organizar este cliente no Brevo (CRM).
      
      Dados da Venda:
      Produto: ${event.data.product.name} (ID: ${event.data.product.id})
      Valor: ${event.data.purchase.price.value} ${event.data.purchase.price.currency_value}
      Status: ${event.data.purchase.status}
      Data: ${new Date(event.data.purchase.order_date).toISOString()}
      Comprador: ${event.data.buyer.name} (${event.data.buyer.email})
      País: ${event.data.buyer.address?.country || 'N/A'}
      
      Retorne APENAS um JSON válido com a seguinte estrutura, sem markdown ou explicações adicionais:
      {
        "tags": ["tag1", "tag2"], // Tags sugeridas para o contato (ex: "cliente-vip", "produto-x", "recuperacao")
        "sentiment": "positive" | "neutral" | "negative", // Baseado no status e valor
        "suggestedAction": "string", // Ação sugerida para o time de vendas (ex: "Enviar email de boas vindas", "Ligar para upsell")
        "dealStage": "string", // Em qual etapa do funil colocar (ex: "Novo Cliente", "Aprovado", "Reembolso Solicitado")
        "summary": "string" // Um breve resumo do perfil do cliente para o vendedor
      }
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openRouterModel,
        messages: [
          { role: 'system', content: 'Você é um assistente de automação de CRM inteligente.' },
          { role: 'user', content: prompt }
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from AI');
      }

      // Remove potential markdown code blocks if present
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Error analyzing lead with AI:', error);
      // Fallback in case of AI failure
      return {
        tags: ['review-needed', 'ai-failed'],
        sentiment: 'neutral',
        suggestedAction: 'Verificar manualmente',
        dealStage: 'Novo Lead',
        summary: 'Erro na análise automática.'
      };
    }
  }
}

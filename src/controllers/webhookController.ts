import type { Request, Response } from 'express';
import { config } from '../config/env.js';
import { AIService } from '../services/aiService.js';
import { BrevoService } from '../services/brevoService.js';
import type { HotmartWebhookEvent } from '../types/hotmart.js';
import prisma from '../config/database.js';

export class WebhookController {
  private aiService: AIService;
  private brevoService: BrevoService;

  constructor() {
    this.aiService = new AIService();
    this.brevoService = new BrevoService();
  }

  public handleHotmartEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const hotmartToken = req.headers['hottok'] || req.query.hottok;
      
      if (config.hotmartToken && hotmartToken !== config.hotmartToken) {
        console.warn('Unauthorized access attempt:', hotmartToken);
        await prisma.log.create({
            data: {
                level: 'WARN',
                message: 'Unauthorized access attempt',
                context: { token: hotmartToken, ip: req.ip }
            }
        });
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const event: HotmartWebhookEvent = req.body;

      if (!event || !event.event) {
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      console.log(`Received event: ${event.event} for transaction: ${event.data.purchase?.transaction}`);
      
      // Log do evento recebido
      await prisma.log.create({
        data: {
            level: 'INFO',
            message: `Event Received: ${event.event}`,
            context: event as any
        }
      });

      if (event.event === 'PURCHASE_APPROVED') {
        await this.processPurchase(event);
      } else {
        console.log(`Event ${event.event} ignored or handled simply.`);
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      await prisma.log.create({
        data: {
            level: 'ERROR',
            message: 'Error processing webhook',
            context: { error: error.message, stack: error.stack }
        }
      });
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  private async processPurchase(event: HotmartWebhookEvent) {
    // 1. Persistir Venda no Banco de Dados Local
    const buyer = event.data.buyer;
    const purchase = event.data.purchase;
    const product = event.data.product;

    // Criar ou atualizar contato local
    const contact = await prisma.contact.upsert({
        where: { email: buyer.email },
        update: {
            name: buyer.name,
            country: buyer.address?.country_iso
        },
        create: {
            email: buyer.email,
            name: buyer.name,
            country: buyer.address?.country_iso
        }
    });

    // Registrar venda
    await prisma.sale.create({
        data: {
            transaction: purchase.transaction,
            productName: product.name,
            productId: product.id,
            priceValue: purchase.price.value,
            currency: purchase.price.currency_value,
            status: purchase.status,
            purchaseDate: new Date(purchase.order_date),
            contactId: contact.id
        }
    });

    // 2. Analisar com AI
    console.log('Analyzing lead with AI...');
    const analysis = await this.aiService.analyzeLead(event);
    console.log('AI Analysis result:', analysis);

    // 3. Organizar no Brevo
    const contactAttributes = {
      NOME: buyer.name,
      COUNTRY: buyer.address?.country_iso || 'BR',
    };

    console.log('Creating/Updating contact in Brevo...');
    await this.brevoService.createOrUpdateContact(
      buyer.email, 
      contactAttributes
    );

    const dealName = `Venda ${event.data.product.name} - ${buyer.name}`;
    const amount = event.data.purchase.price.value;
    const pipelineId = 'seu_pipeline_id'; 
    const stageId = 'seu_stage_id_aprovado'; 

    console.log('Creating Deal in Brevo...');
    try {
        await this.brevoService.createDeal(
            dealName,
            buyer.email,
            amount,
            pipelineId,
            stageId
        );
    } catch (e) {
        console.error("Failed to create deal in Brevo (check logs/db for details)");
    }
  }
}

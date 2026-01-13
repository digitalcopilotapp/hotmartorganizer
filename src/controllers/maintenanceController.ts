import type { Request, Response } from 'express';
import prisma from '../config/database.js';
import { BrevoService } from '../services/brevoService.js';

export class MaintenanceController {
  private brevoService: BrevoService;

  constructor() {
    this.brevoService = new BrevoService();
  }

  public reorganizeVersoReversoAbandoned = async (req: Request, res: Response): Promise<void> => {
    try {
      const sales = await prisma.sale.findMany({
        where: {
          productName: { contains: 'verso', mode: 'insensitive' },
          NOT: { status: 'APPROVED' }
        },
        include: { contact: true }
      });

      let processed = 0;
      for (const s of sales) {
        const contact = s.contact;
        const attributes = {
          NOME: contact.name || '',
          COUNTRY: contact.country || 'BR',
          PRODUTO: s.productName,
          STATUS: 'Carrinho Abandonado',
          FUNIL_ETAPA: 'Recuperação',
          LAST_TRANSACTION: s.transaction,
          LAST_STATUS: s.status
        };

        await this.brevoService.createOrUpdateContact(contact.email, attributes);

        const note = `Carrinho abandonado – ${s.productName}\nTransação: ${s.transaction}\nStatus: ${s.status}\nValor: ${s.priceValue} ${s.currency}`;
        await this.brevoService.addNoteToContact(contact.email, note);

        processed++;
      }

      res.json({ processed });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createUpsellDeal = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = (req.query.email as string) || '';
      const amountOverride = req.query.amount ? Number(req.query.amount) : undefined;
      const pipelineIdQ = (req.query.pipelineId as string) || process.env.BREVO_PIPELINE_ID_UPSELL || '';
      const stageIdQ = (req.query.stageId as string) || process.env.BREVO_STAGE_ID_UPSELL || '';
      const pipelineNameQ = (req.query.pipelineName as string) || '';
      const stageNameQ = (req.query.stageName as string) || '';

      let sale = null as any;
      if (email) {
        sale = await prisma.sale.findFirst({
          where: { status: 'APPROVED', contact: { email } },
          orderBy: { purchaseDate: 'desc' },
          include: { contact: true }
        });
      } else {
        sale = await prisma.sale.findFirst({
          where: { status: 'APPROVED' },
          orderBy: { purchaseDate: 'desc' },
          include: { contact: true }
        });
      }

      if (!sale) {
        res.status(404).json({ error: 'Nenhuma venda aprovada encontrada' });
        return;
      }

      const dealName = `Upsell - ${sale.productName} - ${sale.contact.name || sale.contact.email}`;
      const amount = typeof amountOverride === 'number' && !Number.isNaN(amountOverride)
        ? amountOverride
        : sale.priceValue;

      const resolved = await this.brevoService.resolvePipelineStage({
        pipelineId: pipelineIdQ,
        stageId: stageIdQ,
        pipelineName: pipelineNameQ,
        stageName: stageNameQ
      });

      const result = await this.brevoService.createDeal(
        dealName,
        sale.contact.email,
        amount,
        resolved.pipelineId,
        resolved.stageId
      );

      res.json({ ok: true, deal: result, selection: resolved });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

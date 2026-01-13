import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/latest', async (req, res) => {
  try {
    const sale = await prisma.sale.findFirst({
      orderBy: { purchaseDate: 'desc' },
      include: { contact: true }
    });
    if (!sale) {
      res.status(404).json({ message: 'Nenhuma venda encontrada' });
      return;
    }
    res.json({
      id: sale.id,
      transaction: sale.transaction,
      productName: sale.productName,
      productId: sale.productId,
      priceValue: sale.priceValue,
      currency: sale.currency,
      status: sale.status,
      purchaseDate: sale.purchaseDate,
      contact: {
        id: sale.contact.id,
        email: sale.contact.email,
        name: sale.contact.name,
        phone: sale.contact.phone,
        country: sale.contact.country
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

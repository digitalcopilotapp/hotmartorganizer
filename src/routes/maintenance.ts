import express from 'express';
import { MaintenanceController } from '../controllers/maintenanceController.js';

const router = express.Router();
const controller = new MaintenanceController();

router.post('/reorganize/abandoned/verso-reverso', controller.reorganizeVersoReversoAbandoned);
router.post('/test/upsell-deal', controller.createUpsellDeal);
router.get('/pipelines', async (req, res) => {
  try {
    const svc = new MaintenanceController();
    const data = await (svc as any).brevoService.listPipelines();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
router.get('/pipelines/:id/stages', async (req, res) => {
  try {
    const svc = new MaintenanceController();
    const data = await (svc as any).brevoService.getPipelineStages(req.params.id);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/health', async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        services: {
            database: 'UNKNOWN',
            app: 'OK'
        }
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        healthcheck.services.database = 'OK';
        res.send(healthcheck);
    } catch (error: any) {
        healthcheck.message = error.message;
        healthcheck.services.database = 'FAIL';
        res.status(503).send(healthcheck);
    }
});

router.get('/metrics', (req, res) => {
    const mem = process.memoryUsage();
    res.json({
        uptime: process.uptime(),
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
    });
});

export default router;

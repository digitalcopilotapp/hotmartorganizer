import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebhookController } from './controllers/webhookController.js';
import healthRoutes from './routes/health.js';
import maintenanceRoutes from './routes/maintenance.js';
import salesRoutes from './routes/sales.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const webhookController = new WebhookController();

app.get('/', (req, res) => {
  res.send('Hotmart Organizer Agent is running!');
});

// Healthcheck
app.use('/', healthRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/sales', salesRoutes);

// Endpoint para o Webhook da Hotmart
app.post('/webhook/hotmart', webhookController.handleHotmartEvent);

export default app;

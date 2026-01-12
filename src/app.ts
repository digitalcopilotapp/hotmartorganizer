import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebhookController } from './controllers/webhookController.js';
import healthRoutes from './routes/health.js';

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

// Endpoint para o Webhook da Hotmart
app.post('/webhook/hotmart', webhookController.handleHotmartEvent);

export default app;

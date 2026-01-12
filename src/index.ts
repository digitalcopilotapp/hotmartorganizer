import app from './app.js';
import { config } from './config/env.js';
import { SchedulerService } from './services/schedulerService.js';

// Inicializar agendador de tarefas
new SchedulerService();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Webhook URL: http://localhost:${config.port}/webhook/hotmart`);
});

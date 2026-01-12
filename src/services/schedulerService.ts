import cron from 'node-cron';
import prisma from '../config/database.js';

export class SchedulerService {
    constructor() {
        this.initializeJobs();
    }

    private initializeJobs() {
        console.log('🔄 Initializing Scheduler Jobs...');

        // Job 1: Limpeza de Logs antigos (Executa todo dia à meia-noite)
        cron.schedule('0 0 * * *', async () => {
            console.log('🧹 Running Log Cleanup Job...');
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const deleted = await prisma.log.deleteMany({
                    where: {
                        createdAt: {
                            lt: thirtyDaysAgo
                        }
                    }
                });
                console.log(`✅ Log Cleanup: Deleted ${deleted.count} old logs.`);
            } catch (error) {
                console.error('❌ Log Cleanup Failed:', error);
            }
        });

        // Job 2: Health Check periódico (A cada hora)
        cron.schedule('0 * * * *', async () => {
            console.log('💓 Running Periodic Health Check...');
            try {
                await prisma.$queryRaw`SELECT 1`;
                console.log('✅ Database connection is healthy.');
            } catch (error) {
                console.error('❌ Database connection failed during health check:', error);
                // Aqui poderia enviar um alerta para o Discord/Slack/Email
            }
        });

        console.log('✅ Scheduler initialized.');
    }
}

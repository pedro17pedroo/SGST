import { Express } from 'express';
import { aiAnalyticsRoutes } from './ai-analytics.routes.js';

export class AIAnalyticsModule {
  static id = 'ai_analytics';
  static moduleName = 'Análises Preditivas com IA';

  async register(app: Express): Promise<void> {
    app.use('/api/ai-analytics', aiAnalyticsRoutes);
  }
}

export async function initializeAIAnalyticsModule(app: Express): Promise<void> {
  const module = new AIAnalyticsModule();
  await module.register(app);
}
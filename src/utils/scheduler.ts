import cron from 'node-cron';
import { logger } from './logger';
import { VulnerabilityParserService } from '../services/parser.service';

export function scheduleVulnerabilitySync(parser: VulnerabilityParserService): void {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting scheduled vulnerability sync');
      const vulnerabilities = await parser.fetchVulnerabilities();
      await parser.saveVulnerabilities(vulnerabilities);
      logger.info('Completed scheduled vulnerability sync');
    } catch (error) {
      logger.error('Scheduled vulnerability sync failed:', error);
    }
  });
  
  parser.fetchVulnerabilities()
    .then(vulnerabilities => parser.saveVulnerabilities(vulnerabilities))
    .then(() => logger.info('Initial vulnerability sync completed'))
    .catch(error => logger.error('Initial vulnerability sync failed:', error));
} 
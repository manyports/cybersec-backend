import cron from 'node-cron';
import { SploitusParserService } from './sploitus-parser.service';
import { VulnerabilityRepository } from '../repositories/vulnerability.repository';
import { logger } from '../utils/logger';

export class SchedulerService {
  constructor(
    private parserService: SploitusParserService,
    private vulnerabilityRepository: VulnerabilityRepository
  ) {}

  startScheduledTasks() {
    cron.schedule('0 0 */24 * * *', async () => {
      logger.info('Starting scheduled vulnerability parsing');
      try {
        const vulnerabilities = await this.parserService.fetchVulnerabilities();
        await this.vulnerabilityRepository.saveMany(vulnerabilities);
        logger.info(`Successfully parsed and saved ${vulnerabilities.length} vulnerabilities`);
      } catch (error) {
        logger.error('Error in scheduled vulnerability parsing:', error);
      }
    });
    this.runInitialParsing();
  }

  private async runInitialParsing() {
    try {
      const vulnerabilities = await this.parserService.fetchVulnerabilities();
      await this.vulnerabilityRepository.saveMany(vulnerabilities);
      logger.info(`Initial parsing completed. Saved ${vulnerabilities.length} vulnerabilities`);
    } catch (error) {
      logger.error('Error in initial vulnerability parsing:', error);
    }
  }
} 
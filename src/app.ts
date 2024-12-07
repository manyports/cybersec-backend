import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VulnerabilityParserService } from './services/parser.service';
import { PrismaClient } from '@prisma/client';
import { SploitusParserService } from './services/sploitus-parser.service';
import { VulnerabilityRepository } from './repositories/vulnerability.repository';
import { SchedulerService } from './services/scheduler.service';
import { logger } from './utils/logger';
import { scheduleJob } from 'node-schedule';
import { VulnerabilityController } from './controllers/vulnerability.controller';
import { createVulnerabilityRoutes } from './routes/vulnerability.routes';
import { Vulnerability } from './types';
import { GithubParserService } from './services/github-parser.service';
import { ScannerService } from './services/scanner.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const vulnerabilityParser = new VulnerabilityParserService();
const prisma = new PrismaClient();
const vulnerabilityRepository = new VulnerabilityRepository(prisma);
const sploitusParser = new SploitusParserService();
const schedulerService = new SchedulerService(sploitusParser, vulnerabilityRepository);
const githubParser = new GithubParserService();
const scannerService = new ScannerService();

const normalizeVulnerability = (vuln: Partial<Vulnerability>): Omit<Vulnerability, 'id' | 'created_at' | 'updated_at'> => {
  return {
    title: vuln.title || '',
    description: vuln.description || '',
    published: vuln.published || new Date(),
    severity: vuln.severity || '',
    source: vuln.source || '',
    cve_id: vuln.cve_id || undefined,
    cvss_score: vuln.cvss_score || undefined,
    cvss_vector: vuln.cvss_vector || undefined,
    affected_packages: Array.isArray(vuln.affected_packages) ? vuln.affected_packages : [],
    references: Array.isArray(vuln.references) ? vuln.references : []
  };
};

async function updateVulnerabilities() {
  try {
    const sploitusVulnerabilities = await sploitusParser.fetchVulnerabilities();
    await vulnerabilityRepository.saveMany(
      sploitusVulnerabilities.map(normalizeVulnerability)
    );
  } catch (error) {
    logger.error('Error updating vulnerabilities:', error);
  }
}

scheduleJob('0 */24 * * *', updateVulnerabilities);

const vulnerabilityController = new VulnerabilityController(
  vulnerabilityRepository,
  githubParser,
  sploitusParser
);

app.use('/api/vulnerabilities', createVulnerabilityRoutes(vulnerabilityController));

app.post('/api/scan', async (req, res) => {
  const { target } = req.body;
  
  if (!target) {
    return res.status(400).json({ error: 'Target IP or domain is required' });
  }

  try {
    const scanResult = await scannerService.scanTarget(target);
    res.json(scanResult);
  } catch (error) {
    logger.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to perform scan' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 
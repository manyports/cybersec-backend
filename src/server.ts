import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { VulnerabilityParserService } from './services/parser.service';
import { scheduleVulnerabilitySync } from './utils/scheduler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const vulnerabilityParser = new VulnerabilityParserService();
scheduleVulnerabilitySync(vulnerabilityParser);

app.get('/', (req, res) => {
  res.json({ message: 'Security Scanner API is running' });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app; 
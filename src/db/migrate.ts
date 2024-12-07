import { Pool } from 'pg';
import { logger } from '../utils/logger';
import * as vulnerabilitiesMigration from './migrations/001_create_vulnerabilities';

async function migrate(): Promise<void> {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  try {
    await vulnerabilitiesMigration.up(pool);
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  logger.error('Migration script failed:', error);
  process.exit(1);
}); 
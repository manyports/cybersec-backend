import { Pool } from 'pg';
import { logger } from '../../utils/logger';

export async function up(pool: Pool): Promise<void> {
  try {
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vulnerabilities (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        published TIMESTAMP NOT NULL,
        severity VARCHAR(50),
        source TEXT,
        cve_id VARCHAR(50),
        cvss_score DECIMAL,
        cvss_vector TEXT,
        affected_packages JSONB,
        reference_urls JSONB,
        exploits JSONB,
        poc TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TRIGGER update_vulnerabilities_timestamp
        BEFORE UPDATE ON vulnerabilities
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    `);

    logger.info('Vulnerabilities table created successfully');
  } catch (error) {
    logger.error('Error creating vulnerabilities table:', error);
    throw error;
  }
}

export async function down(pool: Pool): Promise<void> {
  try {
    await pool.query('DROP TRIGGER IF EXISTS update_vulnerabilities_timestamp ON vulnerabilities;');
    await pool.query('DROP FUNCTION IF EXISTS update_timestamp;');
    await pool.query('DROP TABLE IF EXISTS vulnerabilities;');
    logger.info('Vulnerabilities table dropped successfully');
  } catch (error) {
    logger.error('Error dropping vulnerabilities table:', error);
    throw error;
  }
} 
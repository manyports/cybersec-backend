import { Vulnerability } from '../types';
import { logger } from '../utils/logger';
import axios from 'axios';

export class SploitusParserService {
  async fetchVulnerabilities(): Promise<Vulnerability[]> {
    try {
      const response = await axios.get(
        'https://services.nvd.nist.gov/rest/json/cves/2.0',
        {
          params: {
            resultsPerPage: 20,
            startIndex: 0
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const vulnerabilities = response.data.vulnerabilities || [];
      logger.info(`Found ${vulnerabilities.length} vulnerabilities from NVD`);

      return vulnerabilities.map((vuln: any) => ({
        id: crypto.randomUUID(),
        title: vuln.cve.descriptions?.[0]?.value || 'No title',
        description: vuln.cve.descriptions?.[0]?.value || 'No description',
        published: new Date(vuln.published),
        severity: this.mapMetricToSeverity(vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore),
        source: 'nvd.nist.gov',
        cvss_score: vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
        cve_id: vuln.cve.id,
        affected_packages: vuln.cve.configurations?.[0]?.nodes?.map((node: any) => node.cpeMatch?.[0]?.criteria) || [],
        references: vuln.cve.references?.map((ref: any) => ref.url) || [],
        created_at: new Date(),
        updated_at: new Date()
      }));

    } catch (error) {
      logger.error('Error fetching vulnerabilities:', error);
      throw error;
    }
  }

  private mapMetricToSeverity(score: number): string {
    if (!score) return 'LOW';
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
  }
}
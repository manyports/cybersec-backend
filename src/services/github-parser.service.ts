import axios from 'axios';
import { logger } from '../utils/logger';
import { Vulnerability } from '../types';

export class GithubParserService {
  private readonly baseUrl = 'https://api.github.com/advisories';
  private readonly headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  async fetchVulnerabilities(): Promise<Vulnerability[]> {
    try {
      const response = await axios.get(this.baseUrl, { headers: this.headers });
      return response.data.map(this.mapGithubToVulnerability);
    } catch (error) {
      logger.error('Error fetching from GitHub:', error);
      throw error;
    }
  }

  async getVulnerabilityDetails(ghsaId: string): Promise<Vulnerability | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/${ghsaId}`, {
        headers: this.headers
      });
      
      return this.mapGithubToVulnerability(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      logger.error(`Error fetching vulnerability details for ${ghsaId}:`, error);
      throw error;
    }
  }

  private mapGithubToVulnerability(advisory: any): Vulnerability {
    return {
      id: advisory.ghsa_id,
      title: advisory.summary,
      description: advisory.description,
      published: new Date(advisory.published_at),
      severity: advisory.severity,
      source: advisory.html_url,
      cve_id: advisory.cve_id,
      cvss_score: advisory.cvss?.score,
      cvss_vector: advisory.cvss?.vector_string,
      affected_packages: advisory.vulnerabilities?.map((v: any) => ({
        name: v.package.name,
        ecosystem: v.package.ecosystem,
        vulnerable_versions: v.vulnerable_version_range,
        patched_version: v.first_patched_version
      })) || [],
      references: advisory.references || [],
      created_at: new Date(),
      updated_at: new Date()
    };
  }
} 
import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { Vulnerability } from '../types';

export class VulnerabilityParserService {
  private readonly baseUrl = 'https://api.github.com/advisories';
  private readonly headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  async fetchVulnerabilities(): Promise<Vulnerability[]> {
    try {
      const [githubVulns, sploitusVulns] = await Promise.all([
        this.fetchFromGithub(),
        this.fetchFromSploitus()
      ]);

      return [...githubVulns, ...sploitusVulns];
    } catch (error) {
      logger.error('Error fetching vulnerabilities:', error);
      throw error;
    }
  }

  private async fetchFromGithub(): Promise<Vulnerability[]> {
    try {
      const response = await axios.get(this.baseUrl, { headers: this.headers });
      return response.data.map(this.mapGithubToVulnerability);
    } catch (error) {
      logger.error('Error fetching from GitHub:', error);
      throw error;
    }
  }

  private parseSploitusHtml(html: string): Vulnerability[] {
    const $ = cheerio.load(html);
    const vulnerabilities: Vulnerability[] = [];

    $('.exploit-card').each((_, element) => {
      const $element = $(element);
      const title = $element.find('.title').text().trim();
      const dateStr = $element.find('.date').text().trim();
      const description = $element.find('.description').text().trim();
      const link = $element.find('a').attr('href') || '';
      const score = $element.find('.score').text().trim();

      vulnerabilities.push({
        id: `sploitus-${Date.now()}-${Math.random()}`,
        title,
        description,
        published: new Date(dateStr),
        severity: score ? this.mapScoreToSeverity(parseFloat(score)) : 'UNKNOWN',
        source: link,
        cve_id: title.match(/CVE-\d{4}-\d+/)?.[0],
        cvss_score: score ? parseFloat(score) : undefined,
        cvss_vector: undefined,
        affected_packages: [],
        references: [link],
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    return vulnerabilities;
  }

  private async fetchFromSploitus(): Promise<Vulnerability[]> {
    try {
      const vulnerabilities: Vulnerability[] = [];

      const exploitsHtml = await axios.get('https://sploitus.com/?query=exploit#exploits');
      const pocsHtml = await axios.get('https://sploitus.com/?query=POC#exploits_');

      const exploits = this.parseSploitusHtml(exploitsHtml.data);
      const pocs = this.parseSploitusHtml(pocsHtml.data);

      vulnerabilities.push(...exploits, ...pocs);

      return vulnerabilities
        .sort((a, b) => b.published.getTime() - a.published.getTime())
        .slice(0, 10);
    } catch (error) {
      logger.error('Error scraping Sploitus:', error);
      throw error;
    }
  }

  private mapScoreToSeverity(score: number): string {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
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
} 
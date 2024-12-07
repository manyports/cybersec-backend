export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  published: Date;
  severity: string;
  source: string;
  cve_id?: string;
  cvss_score?: number;
  cvss_vector?: string;
  affected_packages: any[];
  references: string[];
  created_at: Date;
  updated_at: Date;
} 
import { Prisma } from '@prisma/client';

export interface Vulnerability {
  id?: string;
  title: string;
  description: string;
  published: Date;
  severity: string;
  source: string;
  cve_id: string | null;
  cvss_score: number | null;
  cvss_vector: string | null;
  affected_packages: string[];
  references: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface Scan {
  id: string;
  target: string;
  status: string;
  results: any;
  created_at: Date;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export interface ScanResult {
  status: 'vulnerable' | 'not_vulnerable' | 'error';
  target: string;
  exploits: string[];
  vulnerableServices: string[];
  errorMessage?: string;
  additionalInfo?: {
    network: string[];
    geolocation: string;
    dns: string[];
  };
  summary?: {
    openPorts: number;
    potentialVulnerabilities: number;
    networkHops: number;
    hasDnsRecords: boolean;
    location: string;
  };
} 
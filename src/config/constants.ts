export const VULNERABILITY_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const SCAN_TYPES = {
  PORT_SCAN: 'port_scan',
  VULNERABILITY_SCAN: 'vulnerability_scan',
  FULL_SCAN: 'full_scan',
} as const;

export const API_ROUTES = {
  AUTH: '/api/v1/auth',
  VULNERABILITIES: '/api/v1/vulnerabilities',
  SCANS: '/api/v1/scans',
} as const; 
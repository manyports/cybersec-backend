import axios from 'axios';
import { ScanResult } from '../types/index';
import { logger } from '../utils/logger';

export class ScannerService {
  async scanTarget(target: string): Promise<ScanResult> {
    try {
      const [
        nmapResult,
        traceResult,
        geoipResult,
        reverseDnsResult
      ] = await Promise.all([
        axios.get(`https://api.hackertarget.com/nmap/?q=${target}`),
        axios.get(`https://api.hackertarget.com/mtr/?q=${target}`),
        axios.get(`https://api.hackertarget.com/geoip/?q=${target}`),
        axios.get(`https://api.hackertarget.com/reversedns/?q=${target}`)
      ]);

      const vulnerableServices: string[] = [];
      const exploits: string[] = [];
      const additionalInfo = {
        network: [] as string[],
        geolocation: '',
        dns: [] as string[]
      };

      if (nmapResult.data && typeof nmapResult.data === 'string' && !nmapResult.data.includes('error')) {
        const lines = nmapResult.data.split('\n');
        
        lines.forEach((line: string) => {
          if (line.includes('open')) {
            vulnerableServices.push(line.trim());
          }
          
          if (line.includes('ftp') || 
              line.includes('telnet') || 
              line.includes('microsoft-ds') ||
              line.includes('ms-wbt-server') ||
              line.includes('vnc') ||
              line.includes('mysql') ||
              line.includes('postgresql') ||
              line.includes('redis') ||
              line.includes('mongodb')) {
            exploits.push(`Potentially vulnerable service: ${line.trim()}`);
          }
        });
      }

      // Parse traceroute/MTR results
      if (traceResult.data && typeof traceResult.data === 'string' && !traceResult.data.includes('error')) {
        additionalInfo.network = traceResult.data
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.trim());
      }

      // Parse GeoIP results
      if (geoipResult.data && typeof geoipResult.data === 'string' && !geoipResult.data.includes('error')) {
        additionalInfo.geolocation = geoipResult.data;
      }

      // Parse Reverse DNS results
      if (reverseDnsResult.data && typeof reverseDnsResult.data === 'string' && !reverseDnsResult.data.includes('error')) {
        additionalInfo.dns = reverseDnsResult.data
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.trim());
      }

      return {
        status: vulnerableServices.length > 0 || exploits.length > 0 ? 'vulnerable' : 'not_vulnerable',
        target,
        exploits,
        vulnerableServices,
        additionalInfo,
        summary: {
          openPorts: vulnerableServices.length,
          potentialVulnerabilities: exploits.length,
          networkHops: additionalInfo.network.length,
          hasDnsRecords: additionalInfo.dns.length > 0,
          location: additionalInfo.geolocation
        }
      };

    } catch (error: any) {
      logger.error(`Error scanning target ${target}:`, error);
      return {
        status: 'error',
        target,
        exploits: [],
        vulnerableServices: [],
        errorMessage: error.message || 'Unknown error',
        additionalInfo: {
          network: [],
          geolocation: '',
          dns: []
        }
      };
    }
  }
} 
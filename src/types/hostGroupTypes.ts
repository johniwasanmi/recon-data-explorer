
import { HostGroup } from './reconTypes';

export interface SimplifiedHostGroup {
  paw: string;
  host: string;
  platform: string;
  architecture: string;
  username: string;
  domain: string;
  privilege: string;
  ip: string;
  host_ip_addrs: string[];
  os: string;
  version: string;
  created: string;
}

export function adaptToHostGroup(simplified: SimplifiedHostGroup): HostGroup {
  return {
    ...simplified,
    sleep_min: 30,
    sleep_max: 60,
    watchdog: 0,
    group: 'default',
    contact: 'tcp',
    location: {
      lat: 0,
      lon: 0
    } as any, // Cast to any to resolve the type error
    pid: 0,
    ppid: 0,
    trusted: false,
    executors: [],
    // Removed the incorrect property: privilege_level
    exe_name: '',
    host_status: 'active',
    last_seen: '',
    links: []
  };
}


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
    location: '',  // String to match the type
    pid: 0,
    ppid: 0,
    trusted: false,
    executors: [],
    exe_name: '',
    last_seen: '',
    links: [],
    // Adding the missing properties
    server: '',
    upstream_dest: '',
    proxy_receivers: {},
    proxy_chain: [],
    origin_link_id: '',
    deadman_enabled: false,
    available_contacts: [],
    display_name: simplified.host || '',
    pending_contact: ''
  };
}


export interface Executor {
  name: string;
  platform: string;
  command: string;
  timeout?: number;
}

export interface Ability {
  ability_id: string;
  tactic: string;
  technique_name: string;
  technique_id: string;
  name: string;
  description: string;
  executors: Executor[];
}

export interface Link {
  id: string;
  paw: string;
  command: string;
  plaintext_command: string;
  status: number;
  score?: number;
  jitter?: number;
  pid?: string;
  unique: string;
  collect?: string;
  finish?: string;
  ability?: Ability;
  executor?: Executor;
  output?: {
    stdout?: string;
    stderr?: string;
    exit_code?: string;
  };
  agent_reported_time?: string;
  visibility?: {
    score: number;
    adjustments: any[];
  };
  host?: string;
}

export interface HostGroup {
  paw: string;
  sleep_min: number;
  sleep_max: number;
  watchdog: number;
  group: string;
  architecture: string;
  platform: string;
  server: string;
  upstream_dest: string;
  username: string;
  location: string;
  pid: number;
  ppid: number;
  trusted: boolean;
  executors: string[];
  privilege: string;
  exe_name: string;
  host: string;
  contact: string;
  proxy_receivers: Record<string, any>;
  proxy_chain: any[];
  origin_link_id: string;
  deadman_enabled: boolean;
  available_contacts: string[];
  host_ip_addrs: string[];
  display_name: string;
  created: string;
  last_seen: string;
  links: Link[];
  pending_contact: string;
}

export interface Step {
  link_id: string;
  ability_id: string;
  command: string;
  plaintext_command: string;
  delegated: string;
  run: string;
  status: number;
  platform: string;
  executor: string;
  pid: number;
  description: string;
  name: string;
  attack: {
    tactic: string;
    technique_name: string;
    technique_id: string;
  };
  output?: {
    stdout: string;
    stderr: string;
    exit_code: string;
  };
  agent_reported_time: string;
}

export interface Steps {
  [paw: string]: {
    steps: Step[];
  };
}

export interface SkippedAbility {
  reason: string;
  reason_id: number;
  ability_id: string;
  ability_name: string;
}

export interface SkippedAbilities {
  [index: number]: {
    [paw: string]: SkippedAbility[];
  };
}

export interface Goal {
  target: string;
  value: string;
  count: number;
  operator: string;
  achieved: boolean;
}

export interface Objectives {
  id: string;
  name: string;
  description: string;
  goals: Goal[];
  percentage: number;
}

export interface Adversary {
  adversary_id: string;
  name: string;
  description: string;
  atomic_ordering: string[];
  objective: string;
  tags: string[];
  has_repeatable_abilities: boolean;
  plugin: string;
}

export interface ReconData {
  name: string;
  host_group: HostGroup[];
  start: string;
  steps: Steps;
  finish: string;
  planner: string;
  adversary: Adversary;
  jitter: string;
  objectives: Objectives;
  skipped_abilities: any[];
}

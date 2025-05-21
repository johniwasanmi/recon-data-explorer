
export const sampleReconData = {
  id: "sample-recon-123",
  name: "Operation Crimson Dawn",
  start: "2024-07-20T08:00:00Z",
  finish: "2024-07-20T17:30:00Z",
  planner: "Advanced Planner",
  jitter: 0,
  objectives: [],
  skipped_abilities: [],
  adversary: {
    name: "Cyber Threat Group Alpha",
    description: "A sophisticated cyber espionage group known for targeting critical infrastructure.",
  },
  objective: "Identify and exfiltrate sensitive data from target network.",
  summary: "A simulated reconnaissance operation to assess network vulnerabilities and security posture.",
  host_group: [
    {
      paw: "abcdef123456",
      host: "DESKTOP-ABC123",
      platform: "Windows",
      architecture: "x64",
      username: "John.Doe",
      domain: "WORKGROUP",
      privilege: "User",
      ip: "192.168.1.100",
      host_ip_addrs: ["192.168.1.100", "192.168.56.1"],
      os: "Microsoft Windows 10 Enterprise",
      version: "10.0.19041",
      created: "2024-07-20T08:00:00Z",
    },
    {
      paw: "789xyz456abc",
      host: "ubuntu-server",
      platform: "Linux",
      architecture: "x64",
      username: "user",
      domain: "local",
      privilege: "User",
      ip: "192.168.1.101",
      host_ip_addrs: ["192.168.1.101"],
      os: "Ubuntu 20.04 LTS",
      version: "5.4.0-80-generic",
      created: "2024-07-20T08:15:00Z",
    },
    {
      paw: "def456ghi789",
      host: "macbook-pro",
      platform: "Darwin",
      architecture: "x64",
      username: "admin",
      domain: "local",
      privilege: "Admin",
      ip: "192.168.1.102",
      host_ip_addrs: ["192.168.1.102"],
      os: "macOS Big Sur",
      version: "11.5.2",
      created: "2024-07-20T08:30:00Z",
    },
  ],
  steps: {
    "abcdef123456": {
      host_group: ["abcdef123456"],
      steps: [
        {
          name: "System Information",
          description: "Gather basic system information using PowerShell.",
          command: "Get-ComputerInfo",
          run: "2024-07-20T08:05:00Z",
          status: 0,
          link_id: "link123",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1082",
            technique_name: "System Information Discovery",
          },
          output: {
            stdout: "Domain: WORKGROUP\nOS: Microsoft Windows 10 Enterprise\nOS Version: 10.0.19041\nOS Build: 19041\nOS ServicePack: 0.0\nOS Type: x64\nProcess Architecture: AMD64\nComputer Name: DESKTOP-ABC123\nCurrent User: John.Doe\nElevated: false\nIs Admin: false\nNetwork adapters:\nEthernet: 192.168.1.100\nVirtualBox Host-Only Network: 192.168.56.1\nRunning as: DESKTOP-ABC123\\John.Doe",
            stderr: "",
            exit_code: "0"
          },
        },
        {
          name: "List Users",
          description: "Enumerate local user accounts using PowerShell.",
          command: "Get-LocalUser",
          run: "2024-07-20T08:10:00Z",
          status: 0,
          link_id: "link456",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1087.001",
            technique_name: "Account Discovery: Local Account",
          },
          output: {
            stdout: "Name     Enabled  AccountExpires               Description\n----     -------  --------------               -----------\nAdministrator False                               Built-in account for administering the computer/domain\nDefaultAccount False                               A user account managed by the system.\nGuest           False                               Built-in account for guest access to the computer/domain\nJohn.Doe        True                               User account",
            stderr: "",
            exit_code: "0"
          },
        },
      ],
    },
    "789xyz456abc": {
      host_group: ["789xyz456abc"],
      steps: [
        {
          name: "System Information",
          description: "Gather basic system information using uname.",
          command: "uname -a",
          run: "2024-07-20T08:20:00Z",
          status: 0,
          link_id: "link789",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1082",
            technique_name: "System Information Discovery",
          },
          output: {
            stdout: "Linux ubuntu-server 5.4.0-80-generic #91-Ubuntu SMP Fri Jul 9 22:49:44 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux",
            stderr: "",
            exit_code: "0"
          },
        },
        {
          name: "List Users",
          description: "Enumerate local user accounts using the id command.",
          command: "id",
          run: "2024-07-20T08:25:00Z",
          status: 0,
          link_id: "linkabc",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1087.001",
            technique_name: "Account Discovery: Local Account",
          },
          output: {
            stdout: "uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare)\n",
            stderr: "",
            exit_code: "0"
          },
        },
      ],
    },
    "def456ghi789": {
      host_group: ["def456ghi789"],
      steps: [
        {
          name: "System Information",
          description: "Gather basic system information using uname.",
          command: "uname -a",
          run: "2024-07-20T08:35:00Z",
          status: 0,
          link_id: "linkdef",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1082",
            technique_name: "System Information Discovery",
          },
          output: {
            stdout: "Darwin macbook-pro 20.6.0 Darwin Kernel Version 20.6.0: Mon Aug 30 06:12:21 PDT 2021; root:xnu-7195.141.6~3/RELEASE_X86_64 x86_64",
            stderr: "",
            exit_code: "0"
          },
        },
        {
          name: "List Users",
          description: "Enumerate local user accounts using dscl.",
          command: 'dscl . list /Users | grep -v "_" | grep -v "daemon" | grep -v "nobody"',
          run: "2024-07-20T08:40:00Z",
          status: 0,
          link_id: "linkghi",
          attack: {
            tactic: "Reconnaissance",
            technique_id: "T1087.001",
            technique_name: "Account Discovery: Local Account",
          },
          output: {
            stdout: "admin\nguest\njohn.smith",
            stderr: "",
            exit_code: "0"
          },
        },
      ],
    },
  },
};

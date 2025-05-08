
import { ReconData } from "../types/reconTypes";

export const sampleReconData: ReconData = {
  "name": "build_ui",
  "host_group": [
    {
      "paw": "zvrvuz",
      "sleep_min": 30,
      "sleep_max": 60,
      "watchdog": 0,
      "group": "red",
      "architecture": "amd64",
      "platform": "linux",
      "server": "http://192.168.1.145:8888",
      "upstream_dest": "http://192.168.1.145:8888",
      "username": "root",
      "location": "/home/kali/splunkd",
      "pid": 4913,
      "ppid": 3886,
      "trusted": true,
      "executors": ["proc", "sh"],
      "privilege": "Elevated",
      "exe_name": "splunkd",
      "host": "kali",
      "contact": "HTTP",
      "proxy_receivers": {},
      "proxy_chain": [],
      "origin_link_id": "",
      "deadman_enabled": true,
      "available_contacts": ["HTTP"],
      "host_ip_addrs": ["192.168.1.102"],
      "display_name": "kali$root",
      "created": "2025-04-14T07:56:54Z",
      "last_seen": "2025-04-14T10:20:31Z",
      "links": [
        {
          "id": "0655432d-5b93-4487-8e4b-951e9a9e14c5",
          "paw": "zvrvuz",
          "command": "PiAkSE9NRS8uYmFzaF9oaXN0b3J5ICYmIHVuc2V0IEhJU1RGSUxF",
          "plaintext_command": "> $HOME/.bash_history && unset HISTFILE",
          "status": 0,
          "score": 0,
          "jitter": 0,
          "decide": "2025-04-14T07:56:54Z",
          "pin": 0,
          "pid": "4934",
          "facts": [],
          "relationships": [],
          "used": [],
          "unique": "0655432d-5b93-4487-8e4b-951e9a9e14c5",
          "collect": "2025-04-14T07:56:54Z",
          "finish": "2025-04-14T07:56:54Z",
          "ability": {
            "ability_id": "43b3754c-def4-4699-a673-1d85648fda6a",
            "tactic": "defense-evasion",
            "technique_name": "Indicator Removal on Host: Clear Command History",
            "technique_id": "T1070.003",
            "name": "Avoid logs",
            "description": "Stop terminal from logging history",
            "executors": [
              {
                "name": "sh",
                "platform": "darwin",
                "command": "> $HOME/.bash_history && unset HISTFILE",
                "timeout": 60
              },
              {
                "name": "sh",
                "platform": "linux",
                "command": "> $HOME/.bash_history && unset HISTFILE",
                "timeout": 60
              },
              {
                "name": "psh",
                "platform": "windows",
                "command": "Clear-History;Clear",
                "timeout": 60
              }
            ]
          },
          "executor": {
            "name": "sh",
            "platform": "linux",
            "command": "> $HOME/.bash_history && unset HISTFILE",
            "timeout": 60
          },
          "cleanup": 0,
          "visibility": { "score": 50, "adjustments": [] },
          "host": "kali",
          "output": "False",
          "deadman": false,
          "agent_reported_time": "2025-04-14T07:56:53Z"
        }
      ],
      "pending_contact": "HTTP"
    },
    {
      "paw": "qtqzda",
      "sleep_min": 30,
      "sleep_max": 60,
      "watchdog": 0,
      "group": "red",
      "architecture": "amd64",
      "platform": "windows",
      "server": "http://10.10.14.150:8888",
      "upstream_dest": "http://10.10.14.150:8888",
      "username": "INLANEFREIGHT\\htb-student",
      "location": "C:\\Users\\Public\\splunkd.exe",
      "pid": 5716,
      "ppid": 1160,
      "trusted": false,
      "executors": ["cmd", "psh", "proc"],
      "privilege": "Elevated",
      "exe_name": "splunkd.exe",
      "host": "ACADEMY-EA-MS01",
      "contact": "HTTP",
      "proxy_receivers": {},
      "proxy_chain": [],
      "origin_link_id": "",
      "deadman_enabled": true,
      "available_contacts": ["HTTP"],
      "host_ip_addrs": ["172.16.5.25", "10.129.13.128"],
      "display_name": "ACADEMY-EA-MS01$INLANEFREIGHT\\htb-student",
      "created": "2025-04-14T08:00:44Z",
      "last_seen": "2025-04-14T09:55:11Z",
      "links": [
        {
          "id": "78f31241-293e-4380-a74b-b2543b36adf6",
          "paw": "qtqzda",
          "command": "Q2xlYXItSGlzdG9yeTtDbGVhcg==",
          "plaintext_command": "Clear-History;Clear",
          "status": 0,
          "score": 0,
          "jitter": 0,
          "decide": "2025-04-14T08:00:44Z",
          "pin": 0,
          "pid": "5280",
          "facts": [],
          "relationships": [],
          "used": [],
          "unique": "78f31241-293e-4380-a74b-b2543b36adf6",
          "collect": "2025-04-14T08:00:44Z",
          "finish": "2025-04-14T08:00:44Z",
          "ability": {
            "ability_id": "43b3754c-def4-4699-a673-1d85648fda6a",
            "tactic": "defense-evasion",
            "technique_name": "Indicator Removal on Host: Clear Command History",
            "technique_id": "T1070.003",
            "name": "Avoid logs",
            "description": "Stop terminal from logging history",
            "executors": [
              {
                "name": "sh",
                "platform": "darwin",
                "command": "> $HOME/.bash_history && unset HISTFILE",
                "timeout": 60
              },
              {
                "name": "sh",
                "platform": "linux",
                "command": "> $HOME/.bash_history && unset HISTFILE",
                "timeout": 60
              },
              {
                "name": "psh",
                "platform": "windows",
                "command": "Clear-History;Clear",
                "timeout": 60
              }
            ]
          },
          "executor": {
            "name": "psh",
            "platform": "windows",
            "command": "Clear-History;Clear",
            "timeout": 60
          },
          "cleanup": 0,
          "visibility": { "score": 50, "adjustments": [] },
          "host": "ACADEMY-EA-MS01",
          "output": "False",
          "deadman": false,
          "agent_reported_time": "2025-04-14T08:00:45Z"
        }
      ],
      "pending_contact": "HTTP"
    }
  ],
  "start": "2025-04-14T08:03:14Z",
  "steps": {
    "zvrvuz": {
      "steps": [
        {
          "link_id": "d82c871b-b7dd-4ea9-9dcf-d3dc21b10ae2",
          "ability_id": "bd527b63-9f9e-46e0-9816-b8434d2b8989",
          "command": "whoami",
          "plaintext_command": "whoami",
          "delegated": "2025-04-14T08:03:14Z",
          "run": "2025-04-14T08:03:58Z",
          "status": 0,
          "platform": "linux",
          "executor": "sh",
          "pid": 8683,
          "description": "Obtain user from current session",
          "name": "Current User",
          "attack": {
            "tactic": "discovery",
            "technique_name": "System Owner/User Discovery",
            "technique_id": "T1033"
          },
          "output": { "stdout": "root", "stderr": "", "exit_code": "0" },
          "agent_reported_time": "2025-04-14T08:03:57Z"
        },
        {
          "link_id": "01bbd66d-3c61-49ae-9627-43b259728cb0",
          "ability_id": "830bb6ed-9594-4817-b1a1-c298c0f9f425",
          "command": "which google-chrome",
          "plaintext_command": "which google-chrome",
          "delegated": "2025-04-14T08:08:20Z",
          "run": "2025-04-14T08:08:55Z",
          "status": 1,
          "platform": "linux",
          "executor": "sh",
          "pid": 11216,
          "description": "Check to see if Gooogle Chrome browser is installed",
          "name": "Check Chrome",
          "attack": {
            "tactic": "discovery",
            "technique_name": "Software Discovery",
            "technique_id": "T1518"
          },
          "output": { "stdout": "", "stderr": "", "exit_code": "1" },
          "agent_reported_time": "2025-04-14T08:08:55Z"
        }
      ]
    },
    "qtqzda": {
      "steps": [
        {
          "link_id": "1b41b26b-cbed-4c21-b3a4-2b6a1bf0b43b",
          "ability_id": "bd527b63-9f9e-46e0-9816-b8434d2b8989",
          "command": "whoami",
          "plaintext_command": "whoami",
          "delegated": "2025-04-14T08:03:14Z",
          "run": "2025-04-14T08:03:27Z",
          "status": 0,
          "platform": "windows",
          "executor": "psh",
          "pid": 3272,
          "description": "Obtain user from current session",
          "name": "Current User",
          "attack": {
            "tactic": "discovery",
            "technique_name": "System Owner/User Discovery",
            "technique_id": "T1033"
          },
          "output": {
            "stdout": "inlanefreight\\htb-student",
            "stderr": "",
            "exit_code": "0"
          },
          "agent_reported_time": "2025-04-14T08:03:27Z"
        },
        {
          "link_id": "bfa13477-0247-4267-832e-d2a6a1a778cf",
          "ability_id": "b18e8767-b7ea-41a3-8e80-baf65a5ddef5",
          "command": "python3 --version&python2 --version&python --version",
          "plaintext_command": "python3 --version&python2 --version&python --version",
          "delegated": "2025-04-14T08:07:24Z",
          "run": "2025-04-14T08:07:28Z",
          "status": 1,
          "platform": "windows",
          "executor": "cmd",
          "pid": 3968,
          "description": "Check to see what version of python is installed",
          "name": "Check Python",
          "attack": {
            "tactic": "discovery",
            "technique_name": "Software Discovery",
            "technique_id": "T1518"
          },
          "output": {
            "stdout": "",
            "stderr": "'python3' is not recognized as an internal or external command,operable program or batch file.'python2' is not recognized as an internal or external command,operable program or batch file.'python' is not recognized as an internal or external command,operable program or batch file.",
            "exit_code": "1"
          },
          "agent_reported_time": "2025-04-14T08:07:29Z"
        }
      ]
    }
  },
  "finish": "2025-04-14T08:12:05Z",
  "planner": "atomic",
  "adversary": {
    "adversary_id": "01d77744-2515-401a-a497-d9f7241aac3c",
    "name": "Check",
    "description": "Profile to check proper platform configuration. Observe outputs to verify.",
    "atomic_ordering": [
      "bd527b63-9f9e-46e0-9816-b8434d2b8989",
      "6e1a53c0-7352-4899-be35-fa7f364d5722",
      "52177cc1-b9ab-4411-ac21-2eadc4b5d3b8",
      "335cea7b-bec0-48c6-adfb-6066070f5f68",
      "e8017c46-acb8-400c-a4b5-b3362b5b5baa",
      "9849d956-37ea-49f2-a8b5-f2ca080b315d",
      "830bb6ed-9594-4817-b1a1-c298c0f9f425",
      "b18e8767-b7ea-41a3-8e80-baf65a5ddef5"
    ],
    "objective": "495a9828-cab1-44dd-a0ca-66e58177d8cc",
    "tags": [],
    "has_repeatable_abilities": false,
    "plugin": "stockpile"
  },
  "jitter": "2/8",
  "objectives": {
    "id": "495a9828-cab1-44dd-a0ca-66e58177d8cc",
    "name": "default",
    "description": "This is a default objective that runs forever.",
    "goals": [
      {
        "target": "exhaustion",
        "value": "complete",
        "count": 1048576,
        "operator": "==",
        "achieved": false
      }
    ],
    "percentage": 0
  },
  "skipped_abilities": [
    { "zvrvuz": [] },
    {
      "qtqzda": [
        {
          "reason": "Mismatched ability platform and executor",
          "reason_id": 1,
          "ability_id": "9849d956-37ea-49f2-a8b5-f2ca080b315d",
          "ability_name": "Check Go"
        },
        {
          "reason": "Mismatched ability platform and executor",
          "reason_id": 1,
          "ability_id": "830bb6ed-9594-4817-b1a1-c298c0f9f425",
          "ability_name": "Check Chrome"
        }
      ]
    }
  ]
};

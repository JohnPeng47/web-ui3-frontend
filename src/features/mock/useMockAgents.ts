import { useState, useEffect, useRef } from "react";
import type { AgentOut } from "../../api/agent/types";
import { isMockDataEnabled } from "../../config";
import { subscribeMockAgents } from "./mockAgentsBus";

interface AgentUpdate {
  agent: AgentOut;
  delayMs: number;
  description?: string;
}

// Incremental agent discovery scenario (now includes pending approvals)
const agentUpdates: AgentUpdate[] = [
  {
    delayMs: 2000,
    description: "First exploit agent requires approval",
    agent: {
      id: "agent-001",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "SQL Injection Hunter",
      vulnerability_title: "SQL Injection on login",
      page_url: "http://target/login",
      max_steps: 6
    }
  },
  {
    delayMs: 6000,
    description: "Second exploit agent requires approval",
    agent: {
      id: "agent-002",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "XSS Detector",
      vulnerability_title: "Reflected XSS in search",
      page_url: "http://target/search",
      max_steps: 5
    }
  },
  {
    delayMs: 12000,
    description: "Third exploit agent starts running",
    agent: {
      id: "agent-003",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "Command Injection Finder",
      vulnerability_title: "Command injection via upload",
      page_url: "http://target/upload",
      max_steps: 4
    }
  },
  {
    delayMs: 14000,
    description: "Fourth exploit agent requires approval",
    agent: {
      id: "agent-004",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "CSRF Analyzer",
      vulnerability_title: "CSRF vulnerability on profile update",
      page_url: "http://target/profile",
      max_steps: 5
    }
  },
  {
    delayMs: 16000,
    description: "Fifth exploit agent requires approval",
    agent: {
      id: "agent-005",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "Open Redirect Seeker",
      vulnerability_title: "Open redirect via 'to' parameter",
      page_url: "http://target/redirect?to=",
      max_steps: 4
    }
  },
  {
    delayMs: 18000,
    description: "Sixth exploit agent starts running",
    agent: {
      id: "agent-006",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "Directory Traversal Hunter",
      vulnerability_title: "Directory traversal in download endpoint",
      page_url: "http://target/download?file=",
      max_steps: 6
    }
  },
  {
    delayMs: 20000,
    description: "Seventh exploit agent requires approval",
    agent: {
      id: "agent-007",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "IDOR Explorer",
      vulnerability_title: "IDOR on orders endpoint",
      page_url: "http://target/api/orders/123",
      max_steps: 7
    }
  },
  {
    delayMs: 22000,
    description: "Eighth exploit agent requires approval",
    agent: {
      id: "agent-008",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "Rate Limit Tester",
      vulnerability_title: "Missing rate limiting on login",
      page_url: "http://target/login",
      max_steps: 5
    }
  },
  {
    delayMs: 24000,
    description: "Ninth exploit agent requires approval",
    agent: {
      id: "agent-009",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "XXE Scout",
      vulnerability_title: "XXE in XML upload",
      page_url: "http://target/api/upload-xml",
      max_steps: 6
    }
  },
  {
    delayMs: 26000,
    description: "Tenth exploit agent requires approval",
    agent: {
      id: "agent-010",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "SSRF Prober",
      vulnerability_title: "SSRF via image fetch",
      page_url: "http://target/api/fetch-image?url=",
      max_steps: 6
    }
  },
  {
    delayMs: 28000,
    description: "Eleventh exploit agent requires approval",
    agent: {
      id: "agent-011",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "Weak JWT Detector",
      vulnerability_title: "Weak JWT signing algorithm",
      page_url: "http://target/api/auth/me",
      max_steps: 5
    }
  },
  {
    delayMs: 30000,
    description: "Twelfth exploit agent starts running",
    agent: {
      id: "agent-012",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "RCE Finder",
      vulnerability_title: "RCE in template engine",
      page_url: "http://target/render",
      max_steps: 8
    }
  },
  {
    delayMs: 32000,
    description: "Thirteenth exploit agent requires approval",
    agent: {
      id: "agent-013",
      agent_status: "pending_approval",
      agent_type: "exploit",
      agent_name: "Path Confusion Checker",
      vulnerability_title: "Path confusion in static serving",
      page_url: "http://target/static/..%2F..%2Fetc/passwd",
      max_steps: 4
    }
  }
];

export function useMockAgents(): AgentOut[] {
  const [agents, setAgents] = useState<AgentOut[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isMockDataEnabled() || hasStartedRef.current) return;

    hasStartedRef.current = true;
    console.log("[MockAgents] Starting incremental agent discovery simulation");

    // Schedule all agent additions
    agentUpdates.forEach((update) => {
      const timeout = setTimeout(() => {
        setAgents(currentAgents => {
          // Check if agent already exists
          const exists = currentAgents.some(agent => agent.id === update.agent.id);
          if (exists) {
            return currentAgents;
          }

          if (update.description) {
            console.log(`[MockAgents] ${update.description}`);
          }

          return [...currentAgents, update.agent];
        });
      }, update.delayMs);

      timeoutsRef.current.push(timeout);
    });

    // Subscribe to accept/deny events
    const unsubscribe = subscribeMockAgents((event) => {
      setAgents((curr) => {
        if (event.type === "accept") {
          return curr.map((a) =>
            a.id === event.id ? { ...a, agent_status: "running" } as AgentOut : a
          );
        }
        if (event.type === "deny") {
          return curr.filter((a) => a.id !== event.id);
        }
        return curr;
      });
    });

    // Cleanup on unmount
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      hasStartedRef.current = false;
      unsubscribe();
    };
  }, []);

  return agents;
}

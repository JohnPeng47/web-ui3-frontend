import { useState, useEffect, useRef } from "react";
import type { AgentOut } from "../../api/agent/types";
import { isMockDataEnabled } from "../../config";

interface AgentUpdate {
  agent: AgentOut;
  delayMs: number;
  description?: string;
}

// Incremental agent discovery scenario
const agentUpdates: AgentUpdate[] = [
  {
    delayMs: 3000,
    description: "First exploit agent starts",
    agent: {
      id: "agent-001",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "SQL Injection Hunter"
    }
  },
  {
    delayMs: 8000,
    description: "Second exploit agent joins",
    agent: {
      id: "agent-002",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "XSS Detector"
    }
  },
  {
    delayMs: 16000,
    description: "Third exploit agent starts",
    agent: {
      id: "agent-003",
      agent_status: "running",
      agent_type: "exploit",
      agent_name: "Command Injection Finder"
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

    // Cleanup on unmount
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      hasStartedRef.current = false;
    };
  }, []);

  return agents;
}

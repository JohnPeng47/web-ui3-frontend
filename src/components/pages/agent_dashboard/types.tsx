export interface VulnerabilityStep {
  description: string;
}

export type Severity = "high" | "medium" | "low";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  location: string;
  steps: VulnerabilityStep[];
}

export type AgentType = "spider" | "scanner";

export interface LogEntry {
  id: string;
  time: string; // "HH:MM:SS"
  agent: AgentType;
  message: string;
}

export interface SpiderStats {
  pages: number;
  // links: number;
  requests: number;
}

export interface DashboardData {
  spiderStats: SpiderStats;
  vulnerabilities: Vulnerability[];
  logEntries: LogEntry[];
}


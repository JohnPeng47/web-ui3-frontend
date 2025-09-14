// Agent domain API types used by the frontend

export type AgentType = "discovery" | "exploit";

export interface AgentOut {
  id: string;
  agent_status: string;
  agent_type: AgentType;
  agent_name: string;
}

export interface AgentMessage {
  agent_id: string;
}

export interface AgentStep {
  // Base placeholder for common fields; concrete steps extend and add fields
}

export interface DiscoveryAgentCreate {
  max_steps: number;
  model_name: string;
  model_costs?: number | null;
  log_filepath?: string | null;
  agent_status?: string | null; // defaults server-side to "active"
  agent_type?: AgentType; // defaults server-side to AgentType.DISCOVERY
}

export interface ExploitAgentCreate {
  vulnerability_title: string;
  max_steps: number;
  model_name: string;
  model_costs?: number | null;
  log_filepath?: string | null;
  agent_status?: string | null; // defaults server-side to "active"
  agent_type?: AgentType; // defaults server-side to AgentType.EXPLOIT
}

export interface ExploitAgentStep extends AgentStep {
  step_num: number;
  reflection: string;
  script: string;
  execution_output: string;
}

export interface UploadAgentSteps extends AgentMessage {
  steps: ExploitAgentStep[];
}

export interface UploadPageData extends AgentMessage {
  /** Current total steps completed across the agent lifecycle */
  steps: number;
  /** Max steps allowed across the agent lifecycle */
  max_steps: number;
  /** Steps taken within the current page */
  page_steps: number;
  /** Max steps allowed within a single page */
  max_page_steps: number;
  /** Raw page observation objects, kept flexible */
  page_data: Array<Record<string, unknown>>;
}

export interface PageDataResponse {
  page_data: Array<Record<string, unknown>>;
}

export interface PageSkipDecision {
  page_skip: boolean;
}



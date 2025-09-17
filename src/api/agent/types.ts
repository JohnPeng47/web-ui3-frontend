// Agent domain API types used by the frontend

export type AgentType = "discovery" | "exploit";

export type AgentStatus = "pending_auto" | "pending_approval" | "running" | "completed" | "cancelled";

export interface AgentOut {
  id: string;
  agent_status: AgentStatus;
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

// Page data DTOs reflecting PageObservations.to_json output
export interface HTTPRequestDataDTO {
  method: string;
  url: string;
  headers: Record<string, string>;
  post_data?: unknown | null;
  redirected_from_url?: string | null;
  redirected_to_url?: string | null;
  is_iframe: boolean;
}

export interface HTTPRequestDTO {
  // Matches HTTPRequest.model_dump() → { data: { ... } }
  data: HTTPRequestDataDTO;
}

export interface HTTPResponseDataDTO {
  url: string;
  status: number;
  headers: Record<string, string>;
  content_type: string;
  content_length: number;
  is_iframe: boolean;
  body?: string;
  body_error?: string;
}

export interface HTTPResponseDTO {
  // Matches HTTPResponse.to_json() → { data: { ... } }
  data: HTTPResponseDataDTO;
}

export interface HTTPMessageDTO {
  request: HTTPRequestDTO;
  response?: HTTPResponseDTO;
}

export interface PageDTO {
  url: string;
  http_msgs: HTTPMessageDTO[];
}

export interface PageDataResponse {
  page_data: PageDTO[];
}

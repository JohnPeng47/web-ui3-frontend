import type { EngagementCreate, EngagementOut, EngagementPageDataOut, PageDataMergeRequest } from "./engagement/types";
import type { AgentOut, DiscoveryAgentCreate, PageDataResponse, ExploitAgentStep } from "./agent/types";

export interface HTTPApi {
  // Engagement API
  createEngagement(payload: EngagementCreate, signal?: AbortSignal): Promise<EngagementOut>;
  getEngagement(engagementId: string, signal?: AbortSignal): Promise<EngagementOut>;
  mergePageData(
    engagementId: string,
    payload: PageDataMergeRequest,
    signal?: AbortSignal
  ): Promise<EngagementPageDataOut>;

  // Agent API
  registerDiscoveryAgent(
    engagementId: string,
    payload: DiscoveryAgentCreate,
    signal?: AbortSignal
  ): Promise<AgentOut>;
  listEngagementAgents(engagementId: string, signal?: AbortSignal): Promise<AgentOut[]>;
  getAgentPageData(engagementId: string, signal?: AbortSignal): Promise<PageDataResponse>;
  getAgentSteps(agentId: string, signal?: AbortSignal): Promise<ExploitAgentStep[]>;
}



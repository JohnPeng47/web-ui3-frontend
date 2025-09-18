import type { HTTPApi } from "./httpTypes";
import type {
  EngagementCreate,
  EngagementOut,
  EngagementPageDataOut,
  PageDataMergeRequest
} from "./engagement/types";
import type {
  AgentOut,
  DiscoveryAgentCreate,
  PageDataResponse,
  ExploitAgentStep
} from "./agent/types";

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export class MockHTTPProvider implements HTTPApi {
  private engagements = new Map<string, EngagementOut>();
  private agentsByEngagement = new Map<string, AgentOut[]>();
  private stepsByAgent = new Map<string, ExploitAgentStep[]>();
  private pageDataByEngagement = new Map<string, PageDataResponse>();

  private clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  async createEngagement(payload: EngagementCreate): Promise<EngagementOut> {
    const id = generateId("eng");
    const created: EngagementOut = {
      id,
      name: payload.name,
      base_url: payload.base_url,
      description: payload.description ?? null,
      scopes_data: payload.scopes_data ?? [],
      created_at: new Date().toISOString(),
      findings: [],
      domain_ownership_verified: true,
      page_data: []
    };
    this.engagements.set(id, created);
    this.agentsByEngagement.set(id, []);
    this.pageDataByEngagement.set(id, { page_data: [] });
    return this.clone(created);
  }

  async getEngagement(engagementId: string): Promise<EngagementOut> {
    const e = this.engagements.get(engagementId);
    if (!e) throw new Error("Engagement not found");
    return this.clone(e);
  }

  async mergePageData(
    engagementId: string,
    payload: PageDataMergeRequest
  ): Promise<EngagementPageDataOut> {
    const current = this.pageDataByEngagement.get(engagementId) || { page_data: [] };
    const merged: EngagementPageDataOut = {
      page_data: [...current.page_data, ...payload.delta]
    };
    this.pageDataByEngagement.set(engagementId, merged);
    const e = this.engagements.get(engagementId);
    if (e) {
      e.page_data = merged.page_data;
      this.engagements.set(engagementId, e);
    }
    return this.clone(merged);
  }

  async registerDiscoveryAgent(
    engagementId: string,
    _payload: DiscoveryAgentCreate
  ): Promise<AgentOut> {
    const agent: AgentOut = {
      id: generateId("agent"),
      agent_status: "running",
      agent_type: "discovery",
      agent_name: "Discovery Agent"
    };
    const list = this.agentsByEngagement.get(engagementId) || [];
    this.agentsByEngagement.set(engagementId, [...list, agent]);
    this.stepsByAgent.set(agent.id, []);
    return this.clone(agent);
  }

  async listEngagementAgents(engagementId: string): Promise<AgentOut[]> {
    const list = this.agentsByEngagement.get(engagementId) || [];
    return this.clone(list);
  }

  async getAgentPageData(engagementId: string): Promise<PageDataResponse> {
    const data = this.pageDataByEngagement.get(engagementId) || { page_data: [] };
    return this.clone(data);
  }

  async getAgentSteps(agentId: string): Promise<ExploitAgentStep[]> {
    const steps = this.stepsByAgent.get(agentId) || [];
    return this.clone(steps);
  }
}



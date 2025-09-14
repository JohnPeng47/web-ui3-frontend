import { getApiBaseUrl } from "../config";
import type {
  EngagementCreate,
  EngagementOut,
  EngagementPageDataOut,
  PageDataMergeRequest
} from "./engagement/types";
import type {
  AgentOut,
  DiscoveryAgentCreate,
  UploadAgentSteps,
  UploadPageData,
  PageDataResponse,
  PageSkipDecision,
  ExploitAgentStep
} from "./agent/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function ensureAuthCookiesFromLocalStorage() {
  try {
    const raw = localStorage.getItem("authCookies");
    if (!raw) return;
    const cookies = JSON.parse(raw) as Record<string, string>;
    Object.entries(cookies).forEach(([key, value]) => {
      if (typeof document !== "undefined") {
        document.cookie = `${key}=${value}; path=/`;
      }
    });
  } catch {
    // ignore malformed localStorage
  }
}

export class HTTPProvider {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl().replace(/\/$/, "");
    console.log("baseUrl:", this.baseUrl);
    ensureAuthCookiesFromLocalStorage();
  }

  private async request<TResponse>(
    path: string,
    options: { method?: HttpMethod; body?: unknown; signal?: AbortSignal } = {}
  ): Promise<TResponse> {
    ensureAuthCookiesFromLocalStorage();
    const { method = "GET", body, signal } = options;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    });

    if (!res.ok) {
      let detail: string | undefined;
      try {
        const errorJson = (await res.json()) as { detail?: string };
        detail = errorJson?.detail;
      } catch {
        // ignore
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as unknown as TResponse;
    return (await res.json()) as TResponse;
  }

  // Engagement API
  async createEngagement(payload: EngagementCreate, signal?: AbortSignal): Promise<EngagementOut> {
    return this.request<EngagementOut>(`/engagement/`, { method: "POST", body: payload, signal });
  }

  async getEngagement(engagementId: string, signal?: AbortSignal): Promise<EngagementOut> {
    return this.request<EngagementOut>(`/engagement/${encodeURIComponent(engagementId)}`, {
      method: "GET",
      signal
    });
  }

  async mergePageData(
    engagementId: string,
    payload: PageDataMergeRequest,
    signal?: AbortSignal
  ): Promise<EngagementPageDataOut> {
    return this.request<EngagementPageDataOut>(
      `/engagement/${encodeURIComponent(engagementId)}/page-data`,
      { method: "POST", body: payload, signal }
    );
  }

  // Agent API
  async registerDiscoveryAgent(
    engagementId: string,
    payload: DiscoveryAgentCreate,
    signal?: AbortSignal
  ): Promise<AgentOut> {
    return this.request<AgentOut>(
      `/engagement/${encodeURIComponent(engagementId)}/agents/discovery/register`,
      { method: "POST", body: payload, signal }
    );
  }

  async listEngagementAgents(engagementId: string, signal?: AbortSignal): Promise<AgentOut[]> {
    return this.request<AgentOut[]>(`/engagement/${encodeURIComponent(engagementId)}/agents`, {
      method: "GET",
      signal
    });
  }

  async uploadAgentSteps(
    agentId: string,
    payload: UploadAgentSteps,
    signal?: AbortSignal
  ): Promise<unknown> {
    // Server may return null/empty; we keep unknown to avoid forcing a shape
    return this.request<unknown>(`/agents/${encodeURIComponent(agentId)}/steps`, {
      method: "POST",
      body: payload,
      signal
    });
  }

  async uploadPageData(
    agentId: string,
    payload: UploadPageData,
    signal?: AbortSignal
  ): Promise<PageSkipDecision> {
    return this.request<PageSkipDecision>(`/agents/${encodeURIComponent(agentId)}/page-data`, {
      method: "POST",
      body: payload,
      signal
    });
  }

  async getAgentPageData(
    engagementId: string,
    signal?: AbortSignal
  ): Promise<PageDataResponse> {
    return this.request<PageDataResponse>(`/agents/${encodeURIComponent(engagementId)}/page-data`, {
      method: "GET",
      signal
    });
  }

  async getAgentSteps(agentId: string, signal?: AbortSignal): Promise<ExploitAgentStep[]> {
    return this.request<ExploitAgentStep[]>(`/agents/${encodeURIComponent(agentId)}/steps`, {
      method: "GET",
      signal
    });
  }
}

export const http = new HTTPProvider();


